import { defaultIconByType } from "../data/iconMap";
import type { ArchitectureModel, ParseResult } from "../types/architecture";
import { classifyNode, edgeTypeFromLabel } from "../utils/classification";

export function normalizeArchitecture(parseResult: ParseResult): ArchitectureModel {
  return {
    nodes: parseResult.nodes.map((node) => {
      const type = parseResult.diagramType === "mindmap" ? "unknown" : classifyNode(node.label);
      const isCircle = node.shape === "circle";
      return {
        id: node.id,
        label: node.label,
        rawLabel: node.rawLabel,
        type,
        shape: node.shape,
        groupId: node.groupId,
        icon: defaultIconByType[type],
        technology: parseResult.diagramType === "mindmap" ? undefined : inferTechnology(node.label),
        description: "",
        size: isCircle ? { width: 156, height: 156 } : { width: 210, height: 104 }
      };
    }),
    edges: parseResult.edges.map((edge, index) => ({
      id: `edge_${edge.source}_${edge.target}_${index}`,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: edge.operator?.startsWith("-.") ? "async" : edgeTypeFromLabel(edge.label)
    })),
    groups: parseResult.groups
  };
}

function inferTechnology(label: string) {
  const known = [
    "React",
    "Angular",
    "Lambda",
    "S3",
    "DynamoDB",
    "OpenSearch",
    "Bedrock",
    "Kafka",
    "Postgres",
    "MongoDB",
    "Snowflake",
    "Redis"
  ];
  return known.find((technology) => label.toLowerCase().includes(technology.toLowerCase()));
}
