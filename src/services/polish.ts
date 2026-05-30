import type { ArchitectureModel } from "../types/architecture";

export function getMockPolishSuggestions(model: ArchitectureModel) {
  const suggestions = [
    "Use executive-friendly labels for externally visible systems.",
    "Group runtime services separately from data persistence components.",
    "Keep edge labels short so the diagram remains slide-ready."
  ];

  if (!model.nodes.some((node) => node.type === "security")) {
    suggestions.push("Consider adding identity, authorization, or policy guardrails.");
  }

  if (!model.nodes.some((node) => node.type === "user")) {
    suggestions.push("Add an actor node so the workflow has a clear starting point.");
  }

  return suggestions.slice(0, 5);
}
