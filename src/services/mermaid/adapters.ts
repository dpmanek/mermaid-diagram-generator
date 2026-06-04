import type { ArchitectureNodeShape, LayoutDirection, MermaidDiagramType, ParseResult } from "../../types/architecture";
import { sanitizeMermaid } from "./sanitize";

type NodeDraft = { id: string; label: string; rawLabel?: string; shape?: ArchitectureNodeShape; groupId?: string };
type EdgeDraft = ParseResult["edges"][number];

const directivePattern = /^(accTitle|accDescr|title)\b/i;

function sourceLines(source: string) {
  return sanitizeMermaid(source).split(/\r?\n/);
}

function stripComment(line: string) {
  return line.replace(/%%.*$/, "");
}

function unquote(value: string) {
  return value.trim().replace(/^["'](.+)["']$/, "$1").trim();
}

function cleanLabel(value: string) {
  let label = unquote(value)
    .replace(/:::[\w-]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const shaped = label.match(/^[A-Za-z_][\w-]*\s*(?:\(\((.+)\)\)|\((.+)\)|\[(.+)\]|\{\{(.+)\}\}|\{(.+)\})$/);
  if (shaped) label = shaped.slice(1).find(Boolean) ?? label;
  return label.replace(/^[()[\]{}]+|[()[\]{}]+$/g, "").trim() || value.trim();
}

function shapeFromMindmapLine(value: string, isRoot: boolean): ArchitectureNodeShape | undefined {
  if (isRoot) return "circle";
  return /\(\(.+\)\)/.test(value) ? "circle" : undefined;
}

function makeIdFactory(prefix: string) {
  const seen = new Map<string, number>();
  return (label: string) => {
    const base =
      label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 44) || "node";
    const key = `${prefix}_${base}`;
    const count = seen.get(key) ?? 0;
    seen.set(key, count + 1);
    return count ? `${key}_${count + 1}` : key;
  };
}

function ensureNode(
  nodes: Map<string, NodeDraft>,
  id: string,
  label: string,
  rawLabel?: string,
  shape?: ArchitectureNodeShape
) {
  const current = nodes.get(id);
  nodes.set(id, {
    ...current,
    id,
    label: current?.label || label || id,
    rawLabel: rawLabel ?? current?.rawLabel,
    shape: shape ?? current?.shape
  });
}

function result(
  diagramType: MermaidDiagramType,
  nodes: Iterable<NodeDraft>,
  edges: EdgeDraft[],
  direction: LayoutDirection = "LR"
): ParseResult {
  return {
    diagramType,
    direction,
    nodes: Array.from(nodes),
    edges,
    groups: []
  };
}

export function parseMindmap(source: string): ParseResult {
  const makeId = makeIdFactory("mind");
  const nodes = new Map<string, NodeDraft>();
  const edges: EdgeDraft[] = [];
  const stack: Array<{ indent: number; id: string }> = [];
  let nodeCount = 0;

  for (const rawLine of sourceLines(source).slice(1)) {
    const withoutComment = stripComment(rawLine);
    if (!withoutComment.trim() || directivePattern.test(withoutComment.trim())) continue;

    const indent = withoutComment.match(/^\s*/)?.[0].replace(/\t/g, "  ").length ?? 0;
    const rawLabel = withoutComment.trim();
    const label = cleanLabel(rawLabel);
    const id = makeId(label);
    ensureNode(nodes, id, label, rawLabel, shapeFromMindmapLine(rawLabel, nodeCount === 0));
    nodeCount += 1;

    while (stack.length && indent <= stack[stack.length - 1].indent) stack.pop();
    const parent = stack[stack.length - 1];
    if (parent) edges.push({ source: parent.id, target: id, label: "contains", operator: "-->" });
    stack.push({ indent, id });
  }

  return result("mindmap", nodes.values(), edges, "TD");
}

export function parseSequence(source: string): ParseResult {
  const nodes = new Map<string, NodeDraft>();
  const edges: EdgeDraft[] = [];
  const aliases = new Map<string, string>();

  const addParticipant = (idToken: string, labelToken?: string) => {
    const id = idToken.trim();
    const label = cleanLabel(labelToken ?? id);
    aliases.set(id, label);
    ensureNode(nodes, id, label, labelToken ?? idToken);
  };

  for (const rawLine of sourceLines(source).slice(1)) {
    const line = stripComment(rawLine).trim();
    if (!line || directivePattern.test(line)) continue;
    if (/^(autonumber|activate|deactivate|destroy|loop|alt|else|opt|par|and|critical|option|break|rect|box|end)\b/i.test(line)) {
      continue;
    }
    if (/^note\b/i.test(line)) continue;

    const participant = line.match(/^(?:create\s+)?(?:participant|actor|boundary|control|entity|database|collections|queue)\s+(.+?)(?:\s+as\s+(.+))?$/i);
    if (participant) {
      addParticipant(unquote(participant[1]), participant[2]);
      continue;
    }

    const message = line.match(/^(.+?)\s*(-->>[+-]?|->>[+-]?|--x|->x|--\)|-\)|-->|->|==>>[+-]?)\s*(.+?)(?:\s*:\s*(.+))?$/);
    if (!message) continue;

    const sourceId = unquote(message[1]);
    const targetId = unquote(message[3]);
    addParticipant(sourceId, aliases.get(sourceId) ?? sourceId);
    addParticipant(targetId, aliases.get(targetId) ?? targetId);
    edges.push({
      source: sourceId,
      target: targetId,
      label: message[4] ? cleanLabel(message[4]) : undefined,
      operator: message[2].includes("--") ? "-.->" : "-->"
    });
  }

  return result("sequence", nodes.values(), edges, "LR");
}

export function parseClassDiagram(source: string): ParseResult {
  const nodes = new Map<string, NodeDraft>();
  const edges: EdgeDraft[] = [];
  let classBlock: string | undefined;

  for (const rawLine of sourceLines(source).slice(1)) {
    const line = stripComment(rawLine).trim();
    if (!line || directivePattern.test(line)) continue;
    if (classBlock) {
      if (line === "}") classBlock = undefined;
      continue;
    }

    const block = line.match(/^class\s+([A-Za-z_][\w-]*)(?:\s*\{|$)/);
    if (block) {
      classBlock = line.includes("{") && line !== "}" ? block[1] : undefined;
      ensureNode(nodes, block[1], block[1], line);
      continue;
    }

    const annotation = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.+)$/);
    if (annotation) {
      ensureNode(nodes, annotation[1], annotation[1], line);
      continue;
    }

    const edge = line.match(/^([A-Za-z_][\w-]*)\s+(<\|--|\*--|o--|<--|\.\.>|-->|--|\.\.--|\.\.)\s+([A-Za-z_][\w-]*)(?:\s*:\s*(.+))?$/);
    if (edge) {
      ensureNode(nodes, edge[1], edge[1]);
      ensureNode(nodes, edge[3], edge[3]);
      edges.push({ source: edge[1], target: edge[3], label: edge[4] ? cleanLabel(edge[4]) : relationshipLabel(edge[2]), operator: edge[2].includes("..") ? "-.->" : "-->" });
    }
  }

  return result("class", nodes.values(), edges, "LR");
}

export function parseStateDiagram(source: string): ParseResult {
  const nodes = new Map<string, NodeDraft>();
  const edges: EdgeDraft[] = [];
  let startCount = 0;
  let endCount = 0;

  const endpoint = (raw: string, role: "source" | "target") => {
    const value = unquote(raw.trim());
    if (value === "[*]") {
      if (role === "source") {
        startCount += 1;
        return { id: startCount === 1 ? "start" : `start_${startCount}`, label: "Start" };
      }
      endCount += 1;
      return { id: endCount === 1 ? "end" : `end_${endCount}`, label: "End" };
    }
    return { id: value, label: cleanLabel(value) };
  };

  for (const rawLine of sourceLines(source).slice(1)) {
    const line = stripComment(rawLine).trim();
    if (!line || directivePattern.test(line) || line === "}" || line === "{") continue;
    if (/^(note|choice|fork|join|concurrent)\b/i.test(line)) continue;

    const namedState = line.match(/^state\s+"(.+)"\s+as\s+([A-Za-z_][\w-]*)/i);
    if (namedState) {
      ensureNode(nodes, namedState[2], cleanLabel(namedState[1]), line);
      continue;
    }

    const stateBlock = line.match(/^state\s+(.+?)\s*\{$/i);
    if (stateBlock) {
      const label = cleanLabel(stateBlock[1]);
      ensureNode(nodes, label, label, line);
      continue;
    }

    const transition = line.match(/^(.+?)\s*-->\s*(.+?)(?:\s*:\s*(.+))?$/);
    if (!transition) continue;

    const sourceNode = endpoint(transition[1], "source");
    const targetNode = endpoint(transition[2], "target");
    ensureNode(nodes, sourceNode.id, sourceNode.label);
    ensureNode(nodes, targetNode.id, targetNode.label);
    edges.push({ source: sourceNode.id, target: targetNode.id, label: transition[3] ? cleanLabel(transition[3]) : undefined, operator: "-->" });
  }

  return result("state", nodes.values(), edges, "TD");
}

export function parseErDiagram(source: string): ParseResult {
  const nodes = new Map<string, NodeDraft>();
  const edges: EdgeDraft[] = [];
  let entityBlock: string | undefined;

  for (const rawLine of sourceLines(source).slice(1)) {
    const line = stripComment(rawLine).trim();
    if (!line || directivePattern.test(line)) continue;
    if (entityBlock) {
      if (line === "}") entityBlock = undefined;
      continue;
    }

    const block = line.match(/^([A-Za-z_][\w-]*)\s*\{$/);
    if (block) {
      entityBlock = block[1];
      ensureNode(nodes, block[1], block[1], line);
      continue;
    }

    const edge = line.match(/^([A-Za-z_][\w-]*)\s+([|o}{]{1,2}(?:--|\.\.)[|o}{]{1,2})\s+([A-Za-z_][\w-]*)(?:\s*:\s*(.+))?$/);
    if (edge) {
      ensureNode(nodes, edge[1], edge[1]);
      ensureNode(nodes, edge[3], edge[3]);
      edges.push({ source: edge[1], target: edge[3], label: edge[4] ? cleanLabel(edge[4]) : edge[2], operator: edge[2].includes("..") ? "-.->" : "-->" });
    }
  }

  return result("er", nodes.values(), edges, "LR");
}

function relationshipLabel(operator: string) {
  if (operator === "<|--") return "inherits";
  if (operator === "*--") return "composition";
  if (operator === "o--") return "aggregation";
  if (operator.includes("..")) return "depends on";
  return undefined;
}
