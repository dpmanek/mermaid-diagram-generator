import { useCallback, useRef, useState } from "react";
import type { ArchitectureModel, LayoutDirection } from "../types/architecture";
import { normalizeArchitecture } from "../services/architectureNormalizer";
import { layoutArchitecture } from "../services/layout";
import { parseMermaidFlowchart, parseMermaidFlowchartAst, validateMermaid } from "../services/mermaid";
import { getMockPolishSuggestions } from "../services/polish";

type Args = {
  onModel: (model: ArchitectureModel) => void;
  onDirection: (direction: LayoutDirection) => void;
  onValidation: (validation: { valid: boolean | null; message: string }) => void;
  onSuggestions: (suggestions: string[]) => void;
  onClearSelection: () => void;
};

export function useGeneration({ onModel, onDirection, onValidation, onSuggestions, onClearSelection }: Args) {
  const [isLoading, setIsLoading] = useState(false);
  const requestRef = useRef(0);

  const generateFromCode = useCallback(
    async (source: string, preferredDirection?: LayoutDirection) => {
      const requestId = requestRef.current + 1;
      requestRef.current = requestId;
      setIsLoading(true);
      try {
        const validation = await validateMermaid(source);
        if (requestRef.current !== requestId) return;
        onValidation(validation);
        if (!validation.valid) return;
        let parsed;
        try {
          parsed = await parseMermaidFlowchartAst(source);
          if (!parsed.nodes.length) parsed = parseMermaidFlowchart(source);
        } catch {
          parsed = parseMermaidFlowchart(source);
        }
        if (requestRef.current !== requestId) return;
        const direction = preferredDirection ?? parsed.direction;
        const normalized = normalizeArchitecture(parsed);
        const laidOut = await layoutArchitecture(normalized, direction);
        if (requestRef.current !== requestId) return;
        onDirection(direction);
        onModel(laidOut);
        onSuggestions(getMockPolishSuggestions(laidOut));
        onClearSelection();
      } catch (error) {
        if (requestRef.current !== requestId) return;
        onValidation({
          valid: false,
          message: error instanceof Error ? error.message : "Unable to generate diagram."
        });
      } finally {
        if (requestRef.current === requestId) setIsLoading(false);
      }
    },
    [onClearSelection, onDirection, onModel, onSuggestions, onValidation]
  );

  return { generateFromCode, isLoading };
}
