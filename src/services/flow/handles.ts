import type { GroupBounds } from "./groupBounds";
import type { ArchitectureModel } from "../../types/architecture";

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

export function handlesForNodeRelationship(
  source: string,
  target: string,
  nodesById: Map<string, ArchitectureModel["nodes"][number]>
): Partial<HandlePair> {
  const sourceNode = nodesById.get(source);
  const targetNode = nodesById.get(target);
  if (!sourceNode?.position || !targetNode?.position) return {};

  const sourceWidth = sourceNode.size?.width ?? 220;
  const sourceHeight = sourceNode.size?.height ?? 96;
  const targetWidth = targetNode.size?.width ?? 220;
  const targetHeight = targetNode.size?.height ?? 96;
  const sourceCenter = {
    x: sourceNode.position.x + sourceWidth / 2,
    y: sourceNode.position.y + sourceHeight / 2
  };
  const targetCenter = {
    x: targetNode.position.x + targetWidth / 2,
    y: targetNode.position.y + targetHeight / 2
  };
  const dx = targetCenter.x - sourceCenter.x;
  const dy = targetCenter.y - sourceCenter.y;

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx >= 0
      ? { sourceHandle: "node-right-out", targetHandle: "node-left-in" }
      : { sourceHandle: "node-left-out", targetHandle: "node-right-in" };
  }

  return dy >= 0
    ? { sourceHandle: "node-bottom-out", targetHandle: "node-top-in" }
    : { sourceHandle: "node-top-out", targetHandle: "node-bottom-in" };
}
