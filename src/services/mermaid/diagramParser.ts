import type { ParseResult } from "../../types/architecture";
import { parseClassDiagram, parseErDiagram, parseMindmap, parseSequence, parseStateDiagram } from "./adapters";
import { parseMermaidFlowchartAst } from "./astParser";
import { detectMermaidDiagramType, diagramTypeLabel } from "./detect";
import { parseMermaidFlowchart } from "./parser";

export async function parseMermaidDiagram(source: string): Promise<ParseResult> {
  const diagramType = detectMermaidDiagramType(source);

  if (diagramType === "flowchart") {
    let parsed: ParseResult;
    try {
      parsed = await parseMermaidFlowchartAst(source);
      if (!parsed.nodes.length) parsed = parseMermaidFlowchart(source);
    } catch {
      parsed = parseMermaidFlowchart(source);
    }
    return { ...parsed, diagramType };
  }

  if (diagramType === "mindmap") return parseMindmap(source);
  if (diagramType === "sequence") return parseSequence(source);
  if (diagramType === "class") return parseClassDiagram(source);
  if (diagramType === "state") return parseStateDiagram(source);
  if (diagramType === "er") return parseErDiagram(source);

  throw new Error(`${diagramTypeLabel(diagramType)} is valid Mermaid syntax only if Mermaid recognizes it, but ArchForge cannot import it to the editable canvas yet.`);
}
