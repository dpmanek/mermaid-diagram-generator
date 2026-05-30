import ELK from "elkjs/lib/elk.bundled.js";
import type { ArchitectureModel, LayoutDirection } from "../../types/architecture";
import { NODE_HEIGHT, NODE_WIDTH } from "./constants";

const elk = new ELK();

export async function layoutWithElk(model: ArchitectureModel, direction: LayoutDirection): Promise<ArchitectureModel> {
  const graph = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": direction === "LR" ? "RIGHT" : "DOWN",
      "elk.spacing.nodeNode": "70",
      "elk.layered.spacing.nodeNodeBetweenLayers": "96",
      "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
      "elk.edgeRouting": "ORTHOGONAL"
    },
    children: model.nodes.map((node) => ({
      id: node.id,
      width: node.size?.width ?? NODE_WIDTH,
      height: node.size?.height ?? NODE_HEIGHT
    })),
    edges: model.edges.map((edge) => ({ id: edge.id, sources: [edge.source], targets: [edge.target] }))
  };

  const result = await elk.layout(graph);
  const positions = new Map(result.children?.map((node) => [node.id, { x: node.x ?? 0, y: node.y ?? 0 }]));

  return {
    ...model,
    nodes: model.nodes.map((node) => ({
      ...node,
      position: positions.get(node.id) ?? node.position ?? { x: 0, y: 0 },
      size: node.size ?? { width: NODE_WIDTH, height: NODE_HEIGHT }
    }))
  };
}
