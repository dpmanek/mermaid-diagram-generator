import type { ArchitectureModel } from "../../types/architecture";
import { CARD_GAP_X, CARD_GAP_Y, GROUP_PAD_TOP, GROUP_PAD_X, NODE_HEIGHT, NODE_WIDTH } from "./constants";
import {
  buildGroupMetrics,
  buildWeightedEdgeMap,
  gatherGroupContext,
  pickCentralGroupId,
  partitionRelations,
  type GroupMetric
} from "./presentationMetrics";
import { placeGroups } from "./presentationPlacement";

export function layoutPresentationBoard(model: ArchitectureModel): ArchitectureModel {
  const { visibleGroups, nodeGroup, groupsById, nodesByVisibleGroup } = gatherGroupContext(model);
  const weightedEdges = buildWeightedEdgeMap(model, groupsById, nodeGroup);
  const groupMetrics = buildGroupMetrics(visibleGroups, nodesByVisibleGroup);
  const centralId = pickCentralGroupId(visibleGroups, nodesByVisibleGroup, weightedEdges);
  const { incoming, outgoing } = partitionRelations(weightedEdges, centralId);
  const groupPositions = placeGroups({ visibleGroups, groupsById, groupMetrics, centralId, incoming, outgoing });

  const nodes = model.nodes.map((node) =>
    positionNode({
      node,
      model,
      nodeGroup,
      nodesByVisibleGroup,
      groupMetrics,
      groupPositions,
      centralId
    })
  );

  return { ...model, nodes };
}

function positionNode({
  node,
  model,
  nodeGroup,
  nodesByVisibleGroup,
  groupMetrics,
  groupPositions,
  centralId
}: {
  node: ArchitectureModel["nodes"][number];
  model: ArchitectureModel;
  nodeGroup: Map<string, string | undefined>;
  nodesByVisibleGroup: Map<string, string[]>;
  groupMetrics: Map<string, GroupMetric>;
  groupPositions: Map<string, { x: number; y: number }>;
  centralId: string | undefined;
}) {
  const groupId = nodeGroup.get(node.id);
  const groupPosition = groupId ? groupPositions.get(groupId) : undefined;
  const groupNodeIds = groupId ? nodesByVisibleGroup.get(groupId) ?? [] : [];
  const metrics = groupId ? groupMetrics.get(groupId) : undefined;
  const index = groupNodeIds.indexOf(node.id);

  if (groupPosition && metrics && index >= 0) {
    const column = index % metrics.columns;
    const row = Math.floor(index / metrics.columns);
    return {
      ...node,
      position: {
        x: groupPosition.x + GROUP_PAD_X + column * (NODE_WIDTH + CARD_GAP_X),
        y: groupPosition.y + GROUP_PAD_TOP + row * (NODE_HEIGHT + CARD_GAP_Y)
      },
      size: { width: NODE_WIDTH, height: NODE_HEIGHT }
    };
  }

  return positionOrphan({ node, model, nodeGroup, groupMetrics, groupPositions, centralId });
}

function positionOrphan({
  node,
  model,
  nodeGroup,
  groupMetrics,
  groupPositions,
  centralId
}: {
  node: ArchitectureModel["nodes"][number];
  model: ArchitectureModel;
  nodeGroup: Map<string, string | undefined>;
  groupMetrics: Map<string, GroupMetric>;
  groupPositions: Map<string, { x: number; y: number }>;
  centralId: string | undefined;
}) {
  const outgoing = model.edges.filter((edge) => edge.source === node.id).length;
  const incoming = model.edges.filter((edge) => edge.target === node.id).length;
  const centerPosition = centralId ? groupPositions.get(centralId) : undefined;
  const centerWidth = centralId ? groupMetrics.get(centralId)?.width ?? 760 : 760;
  const x =
    outgoing >= incoming
      ? Math.max(40, (centerPosition?.x ?? 440) - 260)
      : (centerPosition?.x ?? 440) + centerWidth + 90;
  const orphans = model.nodes.filter((candidate) => !nodeGroup.get(candidate.id));
  const y = (centerPosition?.y ?? 90) + 170 + orphans.findIndex((candidate) => candidate.id === node.id) * 126;
  return { ...node, position: { x, y }, size: { width: NODE_WIDTH, height: NODE_HEIGHT } };
}
