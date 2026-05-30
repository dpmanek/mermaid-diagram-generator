import type { LayoutDirection, ParseResult } from "../../types/architecture";
import { parseEdgeLine } from "./edges";
import {
  cleanLine,
  endPattern,
  firstLinePattern,
  isDirective,
  looksLikeMalformedEdge,
  subgraphPattern
} from "./patterns";
import { parseSubgraphHeader } from "./subgraph";
import { sanitizeMermaid } from "./sanitize";
import { parseNodeToken } from "./tokens";

type ParsedNode = { id: string; label: string; rawLabel?: string; groupId?: string };
type ParsedGroup = { id: string; label: string; type: "layer"; nodeIds: string[] };

export function parseMermaidFlowchart(source: string): ParseResult {
  const lines = sanitizeMermaid(source).split(/\r?\n/).map(cleanLine).filter(Boolean);
  const header = lines[0]?.match(firstLinePattern);
  if (!header) {
    throw new Error("ArchForge MVP supports Mermaid flowchart/graph diagrams with LR, TD, or TB direction.");
  }

  const ctx = createContext();
  for (const line of lines.slice(1)) processLine(line, ctx);
  return finalize(header[2].toUpperCase() as LayoutDirection, ctx);
}

type Context = {
  nodes: Map<string, ParsedNode>;
  edges: ParseResult["edges"];
  groups: Map<string, ParsedGroup>;
  groupAliasToId: Map<string, string>;
  groupStack: string[];
};

function createContext(): Context {
  return {
    nodes: new Map(),
    edges: [],
    groups: new Map(),
    groupAliasToId: new Map(),
    groupStack: []
  };
}

function processLine(line: string, ctx: Context) {
  if (isDirective(line)) return;
  if (endPattern.test(line)) {
    ctx.groupStack.pop();
    return;
  }

  const sub = line.match(subgraphPattern);
  if (sub) return openSubgraph(sub[1], ctx);

  const edge = parseEdgeLine(line);
  if (edge) return acceptEdge(edge, ctx);

  if (looksLikeMalformedEdge(line)) {
    throw new Error(
      `Unsupported or incomplete relationship syntax: "${line}". Use arrows like "-->", "-.->", "==>", or "---".`
    );
  }

  upsertNode(parseNodeToken(line), ctx);
}

function openSubgraph(header: string, ctx: Context) {
  const { alias, id, label } = parseSubgraphHeader(header, ctx.groups.size);
  ctx.groups.set(id, { id, label, type: "layer", nodeIds: [] });
  ctx.groupAliasToId.set(alias, id);
  ctx.groupStack.push(id);
}

function acceptEdge(edge: ReturnType<typeof parseEdgeLine> & object, ctx: Context) {
  const source = resolveEndpoint(edge.source, ctx);
  const target = resolveEndpoint(edge.target, ctx);
  if (!source || !target) return;
  if (!source.isGroup) upsertNode(source.node, ctx);
  if (!target.isGroup) upsertNode(target.node, ctx);
  ctx.edges.push({ source: source.node.id, target: target.node.id, label: edge.label, operator: edge.operator });
  if (edge.bidirectional) {
    ctx.edges.push({ source: target.node.id, target: source.node.id, label: edge.label, operator: edge.operator });
  }
}

function resolveEndpoint(token: string, ctx: Context) {
  const node = parseNodeToken(token);
  const groupId = ctx.groupAliasToId.get(node.id) ?? (ctx.groups.has(node.id) ? node.id : undefined);
  if (groupId) return { node: { id: groupId, label: ctx.groups.get(groupId)?.label ?? node.label }, isGroup: true };
  return { node, isGroup: false };
}

function upsertNode(node: ParsedNode, ctx: Context) {
  if (!node.id) return;
  const current = ctx.nodes.get(node.id);
  const groupId = ctx.groupStack[ctx.groupStack.length - 1];
  const rawLabel = node.rawLabel ?? "";
  const hasExplicitLabel = rawLabel.includes("[") || rawLabel.includes("(") || rawLabel.includes("{");
  ctx.nodes.set(node.id, {
    ...current,
    ...node,
    label: hasExplicitLabel || !current ? node.label || node.id : current.label || node.label || node.id,
    groupId: current?.groupId ?? groupId
  });
  for (const id of ctx.groupStack) {
    const group = ctx.groups.get(id);
    if (group && !group.nodeIds.includes(node.id)) group.nodeIds.push(node.id);
  }
}

function finalize(direction: LayoutDirection, ctx: Context): ParseResult {
  return {
    direction,
    nodes: Array.from(ctx.nodes.values()),
    edges: ctx.edges,
    groups: Array.from(ctx.groups.values()).filter((group) => group.nodeIds.length > 0)
  };
}
