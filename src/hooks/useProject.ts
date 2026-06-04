import { useMemo } from "react";
import type {
  ArchitectureModel,
  ArchitectureProject,
  LayoutDirection,
  MermaidDiagramType,
  ThemeId,
  VisualSettings
} from "../types/architecture";

type Args = {
  title: string;
  description: string;
  mermaidCode: string;
  diagramType: MermaidDiagramType;
  model: ArchitectureModel;
  themeId: ThemeId;
  layoutDirection: LayoutDirection;
  visualSettings: VisualSettings;
  suggestions: string[];
};

export function useProject(args: Args): ArchitectureProject {
  return useMemo(
    () => ({
      title: args.title,
      description: args.description,
      originalMermaid: args.mermaidCode,
      diagramType: args.diagramType,
      model: args.model,
      theme: args.themeId,
      layoutDirection: args.layoutDirection,
      visualSettings: args.visualSettings,
      updatedAt: new Date().toISOString(),
      polishSuggestions: args.suggestions
    }),
    [
      args.title,
      args.description,
      args.mermaidCode,
      args.diagramType,
      args.model,
      args.themeId,
      args.layoutDirection,
      args.visualSettings,
      args.suggestions
    ]
  );
}
