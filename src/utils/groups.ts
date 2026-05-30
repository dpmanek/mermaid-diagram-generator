import type { ArchitectureGroup, ArchitectureNode } from "../types/architecture";

export function getVisibleGroups(groups: ArchitectureGroup[]) {
  return groups.filter((group) => {
    const ids = new Set(group.nodeIds);
    return !groups.some((candidate) => {
      if (candidate.id === group.id || candidate.nodeIds.length <= group.nodeIds.length) return false;
      return group.nodeIds.every((id) => candidate.nodeIds.includes(id)) && candidate.nodeIds.some((id) => !ids.has(id));
    });
  });
}

export function getVisibleGroupId(node: ArchitectureNode, groups: ArchitectureGroup[]) {
  const visibleGroups = getVisibleGroups(groups);
  if (node.groupId && visibleGroups.some((group) => group.id === node.groupId)) return node.groupId;

  return visibleGroups
    .filter((group) => group.nodeIds.includes(node.id))
    .sort((a, b) => a.nodeIds.length - b.nodeIds.length)[0]?.id;
}
