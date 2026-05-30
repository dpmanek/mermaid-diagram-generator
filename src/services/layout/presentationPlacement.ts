import type { ArchitectureGroup } from "../../types/architecture";
import { GUTTER, LEFT_X, ROW_GAP, TOP_Y, isBottomStoryGroup } from "./constants";
import type { GroupMetric } from "./presentationMetrics";

type Args = {
  visibleGroups: ArchitectureGroup[];
  groupsById: Map<string, ArchitectureGroup>;
  groupMetrics: Map<string, GroupMetric>;
  centralId: string | undefined;
  incoming: Set<string>;
  outgoing: Set<string>;
};

export function placeGroups({ visibleGroups, groupsById, groupMetrics, centralId, incoming, outgoing }: Args) {
  const positions = new Map<string, { x: number; y: number }>();
  const center = centralId ? groupsById.get(centralId) : undefined;
  const centerMetrics = centralId ? groupMetrics.get(centralId) : undefined;
  if (!center || !centerMetrics) return positions;

  const leftIds = [...incoming].filter((id) => id !== center.id);
  const rightIds = [...outgoing].filter((id) => id !== center.id && !isBottomStoryGroup(groupsById.get(id)?.label ?? ""));
  const maxLeftWidth = Math.max(260, ...leftIds.map((id) => groupMetrics.get(id)?.width ?? 0));
  const centerX = LEFT_X + maxLeftWidth + GUTTER;
  positions.set(center.id, { x: centerX, y: TOP_Y });

  let leftY = TOP_Y;
  for (const groupId of leftIds) {
    const metrics = groupMetrics.get(groupId);
    if (!metrics) continue;
    positions.set(groupId, { x: LEFT_X, y: leftY });
    leftY += metrics.height + ROW_GAP;
  }

  let rightY = TOP_Y;
  const rightX = centerX + centerMetrics.width + GUTTER;
  for (const groupId of rightIds) {
    const metrics = groupMetrics.get(groupId);
    if (!metrics) continue;
    positions.set(groupId, { x: rightX, y: rightY });
    rightY += metrics.height + ROW_GAP;
  }

  placeRemainingBelow({ visibleGroups, groupMetrics, positions, centerX, centerY: TOP_Y, centerMetrics });
  return positions;
}

function placeRemainingBelow({
  visibleGroups,
  groupMetrics,
  positions,
  centerX,
  centerY,
  centerMetrics
}: {
  visibleGroups: ArchitectureGroup[];
  groupMetrics: Map<string, GroupMetric>;
  positions: Map<string, { x: number; y: number }>;
  centerX: number;
  centerY: number;
  centerMetrics: GroupMetric;
}) {
  const remaining = visibleGroups.filter((group) => !positions.has(group.id));
  let x = centerX;
  let y = centerY + centerMetrics.height + 74;
  let rowHeight = 0;
  const maxRowWidth = Math.max(centerMetrics.width, 760);
  for (const group of remaining) {
    const metrics = groupMetrics.get(group.id);
    if (!metrics) continue;
    if (x > centerX && x + metrics.width > centerX + maxRowWidth) {
      x = centerX;
      y += rowHeight + ROW_GAP;
      rowHeight = 0;
    }
    positions.set(group.id, { x, y });
    x += metrics.width + 42;
    rowHeight = Math.max(rowHeight, metrics.height);
  }
}
