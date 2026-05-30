import { useCallback } from "react";
import type { ArchitectureModel, LayoutDirection } from "../types/architecture";
import { layoutArchitecture } from "../services/layout";

type Architecture = {
  model: ArchitectureModel;
  setModel: (model: ArchitectureModel, opts?: { record?: boolean }) => void;
};

type Args = {
  architecture: Architecture;
  layoutDirection: LayoutDirection;
  setLayoutDirection: (direction: LayoutDirection) => void;
};

export function useLayoutActions({ architecture, layoutDirection, setLayoutDirection }: Args) {
  const relayout = useCallback(async () => {
    if (!architecture.model.nodes.length) return;
    const laidOut = await layoutArchitecture(architecture.model, layoutDirection);
    architecture.setModel(laidOut);
  }, [architecture, layoutDirection]);

  const changeDirection = useCallback(
    async (direction: LayoutDirection) => {
      setLayoutDirection(direction);
      if (architecture.model.nodes.length) {
        const laidOut = await layoutArchitecture(architecture.model, direction);
        architecture.setModel(laidOut);
      }
    },
    [architecture, setLayoutDirection]
  );

  return { relayout, changeDirection };
}
