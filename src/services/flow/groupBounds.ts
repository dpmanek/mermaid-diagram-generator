import type { ArchitectureGroup, ArchitectureModel } from "../../types/architecture";
import { getVisibleGroupId, getVisibleGroups } from "../../utils/groups";

export const GROUP_PADDING_X = 46;
export const GROUP_PADDING_TOP = 76;
export const GROUP_PADDING_BOTTOM = 42;
export const DEFAULT_NODE_WIDTH = 210;
export const DEFAULT_NODE_HEIGHT = 104;

export type GroupBounds = { x: number; y: number; width: number; height: number };

export type GroupBoundsResult = {
  visibleGroups: ArchitectureGroup[];
  groupBounds: Map<string, GroupBounds>;
};

export function buildGroupBounds(model: ArchitectureModel): GroupBoundsResult {
  const visibleGroups = getVisibleGroups(model.groups);
  const groupBounds = new Map<string, GroupBounds>();

  for (const group of visibleGroups) {
    const children = model.nodes.filter((node) => getVisibleGroupId(node, model.groups) === group.id);
    if (!children.length) continue;
    const minX = Math.min(...children.map((node) => node.position?.x ?? 0));
    const minY = Math.min(...children.map((node) => node.position?.y ?? 0));
    const maxX = Math.max(
      ...children.map((node) => (node.position?.x ?? 0) + (node.size?.width ?? DEFAULT_NODE_WIDTH))
    );
    const maxY = Math.max(
      ...children.map((node) => (node.position?.y ?? 0) + (node.size?.height ?? DEFAULT_NODE_HEIGHT))
    );
    groupBounds.set(group.id, {
      x: minX - GROUP_PADDING_X,
      y: minY - GROUP_PADDING_TOP,
      width: maxX - minX + GROUP_PADDING_X * 2,
      height: maxY - minY + GROUP_PADDING_TOP + GROUP_PADDING_BOTTOM
    });
  }

  return { visibleGroups, groupBounds };
}
