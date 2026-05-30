import type { ArchitectureGroup, ArchitectureModel } from "../../types/architecture";
import { getVisibleGroupId, getVisibleGroups } from "../../utils/groups";
import {
  CARD_GAP_X,
  CARD_GAP_Y,
  GROUP_PAD_BOTTOM,
  GROUP_PAD_TOP,
  GROUP_PAD_X,
  NODE_HEIGHT,
  NODE_WIDTH
} from "./constants";

export type GroupMetric = { width: number; height: number; columns: number; rows: number };

export function gatherGroupContext(model: ArchitectureModel) {
  const visibleGroups = getVisibleGroups(model.groups);
  const nodeGroup = new Map(model.nodes.map((node) => [node.id, getVisibleGroupId(node, model.groups)]));
  const groupsById = new Map(visibleGroups.map((group) => [group.id, group]));
  const nodesByVisibleGroup = new Map<string, string[]>();
  for (const group of visibleGroups) {
    nodesByVisibleGroup.set(
      group.id,
      model.nodes.filter((node) => getVisibleGroupId(node, model.groups) === group.id).map((node) => node.id)
    );
  }
  return { visibleGroups, nodeGroup, groupsById, nodesByVisibleGroup };
}

export function buildGroupMetrics(visibleGroups: ArchitectureGroup[], nodesByVisibleGroup: Map<string, string[]>) {
  const metrics = new Map<string, GroupMetric>();
  for (const group of visibleGroups) {
    const count = Math.max(1, nodesByVisibleGroup.get(group.id)?.length ?? 0);
    const columns = count >= 11 ? 4 : count >= 5 ? 3 : count >= 3 ? 2 : 1;
    const rows = Math.ceil(count / columns);
    metrics.set(group.id, {
      columns,
      rows,
      width: GROUP_PAD_X * 2 + columns * NODE_WIDTH + (columns - 1) * CARD_GAP_X,
      height: GROUP_PAD_TOP + GROUP_PAD_BOTTOM + rows * NODE_HEIGHT + (rows - 1) * CARD_GAP_Y
    });
  }
  return metrics;
}

export function buildWeightedEdgeMap(model: ArchitectureModel, groupsById: Map<string, ArchitectureGroup>, nodeGroup: Map<string, string | undefined>) {
  const weighted = new Map<string, number>();
  const resolve = (id: string) => (groupsById.has(id) ? id : nodeGroup.get(id));
  for (const edge of model.edges) {
    const source = resolve(edge.source);
    const target = resolve(edge.target);
    if (!source || !target || source === target) continue;
    const key = `${source}->${target}`;
    weighted.set(key, (weighted.get(key) ?? 0) + 1);
  }
  return weighted;
}

export function pickCentralGroupId(
  visibleGroups: ArchitectureGroup[],
  nodesByVisibleGroup: Map<string, string[]>,
  weightedEdges: Map<string, number>
) {
  const degree = (groupId: string) => {
    let score = nodesByVisibleGroup.get(groupId)?.length ?? 0;
    for (const [key, count] of weightedEdges) {
      if (key.startsWith(`${groupId}->`) || key.endsWith(`->${groupId}`)) score += count * 2;
    }
    return score;
  };
  return visibleGroups.slice().sort((a, b) => degree(b.id) - degree(a.id))[0]?.id ?? visibleGroups[0]?.id;
}

export function partitionRelations(weightedEdges: Map<string, number>, centralId: string | undefined) {
  const incoming = new Set<string>();
  const outgoing = new Set<string>();
  if (!centralId) return { incoming, outgoing };
  for (const key of weightedEdges.keys()) {
    const [source, target] = key.split("->");
    if (target === centralId) incoming.add(source);
    if (source === centralId) outgoing.add(target);
  }
  return { incoming, outgoing };
}
