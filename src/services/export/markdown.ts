import type { ArchitectureProject } from "../../types/architecture";
import { architectureSummary } from "../../utils/graph";
import { downloadBlob } from "./download";

export function exportMarkdown(project: ArchitectureProject, filename = "archforge-diagram.md") {
  const rows = project.model.nodes
    .map((node) => `| ${node.id} | ${node.label} | ${node.type} | ${node.groupId ?? ""} |`)
    .join("\n");
  const edgeRows = project.model.edges
    .map((edge) => `| ${edge.source} | ${edge.target} | ${edge.label ?? ""} | ${edge.type} |`)
    .join("\n");

  const title = project.title?.trim() || "ArchForge Architecture Diagram";
  const markdown = `# ${title}

Generated: ${new Date(project.updatedAt).toLocaleString()}

## Architecture Summary

${architectureSummary(project.model)}

## Original Mermaid

\`\`\`mermaid
${project.originalMermaid}
\`\`\`

## Node Inventory

| ID | Label | Type | Group |
| --- | --- | --- | --- |
${rows}

## Edge Inventory

| Source | Target | Label | Type |
| --- | --- | --- | --- |
${edgeRows}
`;

  downloadBlob(markdown, filename, "text/markdown;charset=utf-8");
}

export function exportJson(project: ArchitectureProject, filename = "archforge-project.json") {
  downloadBlob(JSON.stringify(project, null, 2), filename, "application/json;charset=utf-8");
}
