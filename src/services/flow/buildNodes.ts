import type { Node } from "@xyflow/react";
import { themes } from "../../data/themes";
import type { ArchitectureModel, ThemeId } from "../../types/architecture";
import { getVisibleGroupId } from "../../utils/groups";
import { DEFAULT_NODE_HEIGHT, DEFAULT_NODE_WIDTH, buildGroupBounds } from "./groupBounds";

export function buildFlowNodes(model: ArchitectureModel, themeId: ThemeId): Node[] {
  const theme = themes[themeId];
  const { visibleGroups, groupBounds } = buildGroupBounds(model);

  const groupNodes: Node[] = visibleGroups
    .filter((group) => groupBounds.has(group.id))
    .map((group) => {
      const bounds = groupBounds.get(group.id)!;
      return {
        id: group.id,
        type: "architectureGroup",
        position: { x: bounds.x, y: bounds.y },
        data: { group, theme },
        width: bounds.width,
        height: bounds.height,
        initialWidth: bounds.width,
        initialHeight: bounds.height,
        style: { width: bounds.width, height: bounds.height },
        zIndex: group.zIndex ?? 0
      };
    });

  const architectureNodes = model.nodes.map<Node>((node) => {
    const visibleGroupId = getVisibleGroupId(node, model.groups);
    const bounds = visibleGroupId ? groupBounds.get(visibleGroupId) : undefined;
    return {
      id: node.id,
      type: "architectureNode",
      parentId: bounds ? visibleGroupId : undefined,
      extent: bounds ? "parent" : undefined,
      width: node.size?.width ?? DEFAULT_NODE_WIDTH,
      height: node.size?.height ?? DEFAULT_NODE_HEIGHT,
      initialWidth: node.size?.width ?? DEFAULT_NODE_WIDTH,
      initialHeight: node.size?.height ?? DEFAULT_NODE_HEIGHT,
      position: bounds
        ? { x: (node.position?.x ?? 0) - bounds.x, y: (node.position?.y ?? 0) - bounds.y }
        : node.position ?? { x: 0, y: 0 },
      data: { node, theme },
      zIndex: node.zIndex ?? 1
    };
  });

  return [...groupNodes, ...architectureNodes];
}
