import { useMemo } from "react";
import type { ArchitectureModel, ArchitectureProject, LayoutDirection, ThemeId } from "../types/architecture";

type Args = {
  title: string;
  description: string;
  mermaidCode: string;
  model: ArchitectureModel;
  themeId: ThemeId;
  layoutDirection: LayoutDirection;
  suggestions: string[];
};

export function useProject(args: Args): ArchitectureProject {
  return useMemo(
    () => ({
      title: args.title,
      description: args.description,
      originalMermaid: args.mermaidCode,
      model: args.model,
      theme: args.themeId,
      layoutDirection: args.layoutDirection,
      updatedAt: new Date().toISOString(),
      polishSuggestions: args.suggestions
    }),
    [
      args.title,
      args.description,
      args.mermaidCode,
      args.model,
      args.themeId,
      args.layoutDirection,
      args.suggestions
    ]
  );
}
