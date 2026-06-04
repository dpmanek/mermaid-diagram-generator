import { useCallback, useRef, useState } from "react";
import type { ArchitectureModel, LayoutDirection, MermaidDiagramType } from "../types/architecture";
import { normalizeArchitecture } from "../services/architectureNormalizer";
import { layoutArchitecture } from "../services/layout";
import { parseMermaidDiagram, validateMermaid } from "../services/mermaid";
import { getMockPolishSuggestions } from "../services/polish";

type Args = {
  onModel: (model: ArchitectureModel) => void;
  onDirection: (direction: LayoutDirection) => void;
  onDiagramType: (diagramType: MermaidDiagramType) => void;
  onValidation: (validation: { valid: boolean | null; message: string; diagramType?: MermaidDiagramType }) => void;
  onSuggestions: (suggestions: string[]) => void;
  onClearSelection: () => void;
};

export function useGeneration({ onModel, onDirection, onDiagramType, onValidation, onSuggestions, onClearSelection }: Args) {
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
        const parsed = await parseMermaidDiagram(source);
        if (requestRef.current !== requestId) return;
        const direction = preferredDirection ?? parsed.direction;
        const normalized = normalizeArchitecture(parsed);
        const laidOut = await layoutArchitecture(normalized, direction, parsed.diagramType);
        if (requestRef.current !== requestId) return;
        onDirection(direction);
        if (parsed.diagramType) onDiagramType(parsed.diagramType);
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
    [onClearSelection, onDiagramType, onDirection, onModel, onSuggestions, onValidation]
  );

  return { generateFromCode, isLoading };
}
