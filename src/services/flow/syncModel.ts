import type { Edge, Node } from "@xyflow/react";
import type { ArchitectureModel } from "../../types/architecture";

type SyncOptions = {
  removedEdgeIds?: Set<string>;
};

export function syncModelFromFlow(
  model: ArchitectureModel,
  flowNodes: Node[],
  _flowEdges: Edge[],
  options: SyncOptions = {}
): ArchitectureModel {
  const groupPositions = new Map(
    flowNodes.filter((node) => node.type === "architectureGroup").map((node) => [node.id, node.position])
  );
  const visibleNodeIds = new Set(
    flowNodes.filter((node) => node.type === "architectureNode").map((node) => node.id)
  );
  const groupIds = new Set(model.groups.map((group) => group.id));
  const renderableEndpointIds = new Set([...visibleNodeIds, ...groupIds]);

  return {
    nodes: model.nodes
      .filter((node) => visibleNodeIds.has(node.id))
      .map((node) => {
        const flow = flowNodes.find((item) => item.id === node.id);
        if (!flow) return node;
        const parentPosition = flow.parentId ? groupPositions.get(flow.parentId) : undefined;
        return {
          ...node,
          position: {
            x: flow.position.x + (parentPosition?.x ?? 0),
            y: flow.position.y + (parentPosition?.y ?? 0)
          },
          size:
            typeof flow.width === "number" && typeof flow.height === "number"
              ? { width: Math.round(flow.width), height: Math.round(flow.height) }
              : node.size
        };
      }),
    edges: model.edges.filter(
      (edge) =>
        !options.removedEdgeIds?.has(edge.id) &&
        renderableEndpointIds.has(edge.source) &&
        renderableEndpointIds.has(edge.target)
    ),
    groups: model.groups.map((group) => ({
      ...group,
      nodeIds: group.nodeIds.filter((id) => visibleNodeIds.has(id))
    }))
  };
}
