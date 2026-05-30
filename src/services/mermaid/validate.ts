import mermaid from "mermaid";
import { parseMermaidFlowchart } from "./parser";
import { sanitizeMermaid } from "./sanitize";

mermaid.initialize({ startOnLoad: false, securityLevel: "strict" });

export async function validateMermaid(source: string) {
  const sanitized = sanitizeMermaid(source);
  try {
    await mermaid.parse(sanitized, { suppressErrors: false });
    parseMermaidFlowchart(sanitized);
    return { valid: true, message: "Mermaid syntax is valid." };
  } catch (error) {
    return {
      valid: false,
      message: error instanceof Error ? error.message : "Mermaid validation failed."
    };
  }
}
