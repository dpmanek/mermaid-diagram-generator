import type { ArchitectureModel } from "../types/architecture";

export function architectureSummary(model: ArchitectureModel) {
  const counts = model.nodes.reduce<Record<string, number>>((acc, node) => {
    acc[node.type] = (acc[node.type] ?? 0) + 1;
    return acc;
  }, {});

  const highlights = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => `${count} ${type}`)
    .join(", ");

  return `Architecture contains ${model.nodes.length} components, ${model.edges.length} relationships, and ${model.groups.length} visual groups. Component mix: ${highlights || "none"}.`;
}
