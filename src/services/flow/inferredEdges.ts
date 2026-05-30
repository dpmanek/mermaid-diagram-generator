import type { Edge } from "@xyflow/react";
import type { ArchitectureGroup, ArchitectureTheme } from "../../types/architecture";
import type { GroupBounds } from "./groupBounds";
import { makeRelationshipEdge } from "./edgeStyle";

type PositionedGroup = { group: ArchitectureGroup; bounds: GroupBounds };

export function inferGroupRelationships(
  visibleGroups: ArchitectureGroup[],
  groupBounds: Map<string, GroupBounds>,
  theme: ArchitectureTheme
): Edge[] {
  const positioned = visibleGroups
    .map<PositionedGroup | undefined>((group) => {
      const bounds = groupBounds.get(group.id);
      return bounds ? { group, bounds } : undefined;
    })
    .filter((item): item is PositionedGroup => Boolean(item));
  if (positioned.length < 2) return [];

  const center = positioned.slice().sort((a, b) => b.bounds.width * b.bounds.height - a.bounds.width * a.bounds.height)[0];
  const centerX = center.bounds.x + center.bounds.width / 2;
  const centerY = center.bounds.y + center.bounds.height / 2;
  const out: Edge[] = [];

  for (const item of positioned) {
    if (item.group.id === center.group.id) continue;
    const itemX = item.bounds.x + item.bounds.width / 2;
    const itemY = item.bounds.y + item.bounds.height / 2;
    if (itemX < centerX - 80 && Math.abs(itemY - centerY) < center.bounds.height) {
      out.push(
        makeRelationshipEdge(`inferred_${item.group.id}_${center.group.id}`, item.group.id, center.group.id, undefined, "sync", theme, groupBounds)
      );
    } else if (itemX > centerX + 80 && Math.abs(itemY - centerY) < center.bounds.height) {
      out.push(
        makeRelationshipEdge(`inferred_${center.group.id}_${item.group.id}`, center.group.id, item.group.id, undefined, "sync", theme, groupBounds)
      );
    }
  }

  const lower = positioned
    .filter((item) => item.group.id !== center.group.id && item.bounds.y > center.bounds.y + center.bounds.height * 0.5)
    .sort((a, b) => a.bounds.y - b.bounds.y);
  let previous = center.group.id;
  for (const item of lower) {
    out.push(makeRelationshipEdge(`inferred_${previous}_${item.group.id}`, previous, item.group.id, undefined, "async", theme, groupBounds));
    previous = item.group.id;
  }

  return out;
}
