import { useCallback } from "react";
import type { ArchitectureModel, LayoutDirection, MermaidDiagramType } from "../types/architecture";
import { layoutArchitecture } from "../services/layout";

type Architecture = {
  model: ArchitectureModel;
  setModel: (model: ArchitectureModel, opts?: { record?: boolean }) => void;
};

type Args = {
  architecture: Architecture;
  diagramType?: MermaidDiagramType;
  layoutDirection: LayoutDirection;
  setLayoutDirection: (direction: LayoutDirection) => void;
};

export function useLayoutActions({ architecture, diagramType, layoutDirection, setLayoutDirection }: Args) {
  const relayout = useCallback(async () => {
    if (!architecture.model.nodes.length) return;
    const laidOut = await layoutArchitecture(architecture.model, layoutDirection, diagramType);
    architecture.setModel(laidOut);
  }, [architecture, diagramType, layoutDirection]);

  const changeDirection = useCallback(
    async (direction: LayoutDirection) => {
      setLayoutDirection(direction);
      if (architecture.model.nodes.length) {
        const laidOut = await layoutArchitecture(architecture.model, direction, diagramType);
        architecture.setModel(laidOut);
      }
    },
    [architecture, diagramType, setLayoutDirection]
  );

  return { relayout, changeDirection };
}
