import type { GroupBounds } from "./groupBounds";

export type HandlePair = { sourceHandle: string; targetHandle: string };

export function handlesForRelationship(
  source: string,
  target: string,
  groupBounds: Map<string, GroupBounds>
): HandlePair {
  const sourceBounds = groupBounds.get(source);
  const targetBounds = groupBounds.get(target);
  if (!sourceBounds || !targetBounds) {
    return { sourceHandle: "group-right-out", targetHandle: "group-left-in" };
  }

  const sourceRight = sourceBounds.x + sourceBounds.width;
  const targetRight = targetBounds.x + targetBounds.width;
  const sourceBottom = sourceBounds.y + sourceBounds.height;
  const targetBottom = targetBounds.y + targetBounds.height;
  const verticalOverlap = Math.min(sourceBottom, targetBottom) - Math.max(sourceBounds.y, targetBounds.y);
  const horizontalOverlap = Math.min(sourceRight, targetRight) - Math.max(sourceBounds.x, targetBounds.x);
  const hasMeaningfulVerticalOverlap = verticalOverlap > Math.min(sourceBounds.height, targetBounds.height) * 0.2;
  const hasMeaningfulHorizontalOverlap = horizontalOverlap > Math.min(sourceBounds.width, targetBounds.width) * 0.2;

  if (!hasMeaningfulVerticalOverlap && hasMeaningfulHorizontalOverlap) {
    return targetBounds.y >= sourceBounds.y
      ? { sourceHandle: "group-bottom-out", targetHandle: "group-top-in" }
      : { sourceHandle: "group-top-out", targetHandle: "group-bottom-in" };
  }

  return targetBounds.x >= sourceBounds.x
    ? { sourceHandle: "group-right-out", targetHandle: "group-left-in" }
    : { sourceHandle: "group-left-out", targetHandle: "group-right-in" };
}
