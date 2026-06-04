import mermaid from "mermaid";
import type { LayoutDirection, ParseResult } from "../../types/architecture";
import { parseMermaidFlowchart } from "./parser";
import { sanitizeMermaid } from "./sanitize";

type FlowVertex = {
  id: string;
  text?: string;
  type?: string;
  classes?: string[];
};

type FlowEdge = {
  start: string;
  end: string;
  text?: string;
  type?: string;
  stroke?: "normal" | "thick" | "invisible" | "dotted";
};

type FlowSubGraph = {
  id: string;
  title: string;
  nodes: string[];
};

type FlowDb = {
  getDirection: () => string | undefined;
  getVertices: () => Map<string, FlowVertex>;
  getEdges: () => FlowEdge[];
  getSubGraphs: () => FlowSubGraph[];
};

function normalizeDirection(raw: string | undefined): LayoutDirection {
  if (!raw) return "LR";
  const upper = raw.toUpperCase();
  if (upper === "LR" || upper === "RL") return "LR";
  if (upper === "TD" || upper === "TB" || upper === "BT") return upper === "BT" ? "TD" : (upper as LayoutDirection);
  return "LR";
}

function operatorFromStroke(stroke?: string): string {
  if (stroke === "thick") return "==>";
  if (stroke === "dotted") return "-.->";
  return "-->";
}

function decodeText(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value
    .replace(/<br\s*\/?>/gi, " / ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function parseMermaidFlowchartAst(source: string): Promise<ParseResult> {
  const sanitized = sanitizeMermaid(source);
  let diagram;
  try {
    diagram = await mermaid.mermaidAPI.getDiagramFromText(sanitized);
  } catch {
    return parseMermaidFlowchart(sanitized);
  }

  const db = diagram.db as unknown as FlowDb;
  if (typeof db.getVertices !== "function" || typeof db.getEdges !== "function") {
    return parseMermaidFlowchart(sanitized);
  }

  const direction = normalizeDirection(db.getDirection?.());
  const verticesMap = db.getVertices();
  const subgraphs = db.getSubGraphs?.() ?? [];

  const nodeToGroup = new Map<string, string>();
  const groups: ParseResult["groups"] = subgraphs.map((sub) => {
    for (const nodeId of sub.nodes) {
      if (verticesMap.has(nodeId) && !nodeToGroup.has(nodeId)) {
        nodeToGroup.set(nodeId, sub.id);
      }
    }
    return {
      id: sub.id,
      label: decodeText(sub.title) || sub.id,
      type: "layer" as const,
      nodeIds: sub.nodes.filter((id) => verticesMap.has(id))
    };
  });

  const nodes: ParseResult["nodes"] = [];
  for (const [id, vertex] of verticesMap.entries()) {
    nodes.push({
      id,
      label: decodeText(vertex.text) || id,
      rawLabel: vertex.text,
      groupId: nodeToGroup.get(id)
    });
  }

  const edges: ParseResult["edges"] = db.getEdges().map((edge) => ({
    source: edge.start,
    target: edge.end,
    label: decodeText(edge.text),
    operator: operatorFromStroke(edge.stroke)
  }));

  return {
    diagramType: "flowchart",
    direction,
    nodes,
    edges,
    groups: groups.filter((group) => group.nodeIds.length > 0)
  };
}
