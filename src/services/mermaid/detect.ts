import type { MermaidDiagramType } from "../../types/architecture";
import { sanitizeMermaid } from "./sanitize";

const labels: Record<MermaidDiagramType, string> = {
  flowchart: "Flowchart",
  mindmap: "Mind map",
  sequence: "Sequence diagram",
  class: "Class diagram",
  state: "State diagram",
  er: "ER diagram",
  unsupported: "Unsupported Mermaid diagram"
};

export function diagramTypeLabel(type: MermaidDiagramType | undefined): string {
  return labels[type ?? "flowchart"];
}

export function detectMermaidDiagramType(source: string): MermaidDiagramType {
  const firstLine = sanitizeMermaid(source)
    .split(/\r?\n/)
    .map((line) => line.replace(/%%.*$/, "").trim())
    .find((line) => line && !line.startsWith("---") && !line.startsWith("title:"));

  if (!firstLine) return "unsupported";
  if (/^(flowchart|graph)\b/i.test(firstLine)) return "flowchart";
  if (/^mindmap\b/i.test(firstLine)) return "mindmap";
  if (/^sequenceDiagram\b/i.test(firstLine)) return "sequence";
  if (/^classDiagram\b/i.test(firstLine)) return "class";
  if (/^stateDiagram(?:-v2)?\b/i.test(firstLine)) return "state";
  if (/^erDiagram\b/i.test(firstLine)) return "er";
  return "unsupported";
}
