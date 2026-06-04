import mermaid from "mermaid";
import { detectMermaidDiagramType, diagramTypeLabel } from "./detect";
import { parseMermaidDiagram } from "./diagramParser";
import { sanitizeMermaid } from "./sanitize";

mermaid.initialize({ startOnLoad: false, securityLevel: "strict" });

export async function validateMermaid(source: string) {
  const sanitized = sanitizeMermaid(source);
  try {
    await mermaid.parse(sanitized, { suppressErrors: false });
    const parsed = await parseMermaidDiagram(sanitized);
    const label = diagramTypeLabel(parsed.diagramType);
    return { valid: true, message: `${label} syntax is valid and importable.`, diagramType: parsed.diagramType };
  } catch (error) {
    const diagramType = detectMermaidDiagramType(sanitized);
    return {
      valid: false,
      message: error instanceof Error ? error.message : "Mermaid validation failed.",
      diagramType
    };
  }
}
