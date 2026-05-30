import type { Node } from "@xyflow/react";

export type AlignmentGuide = {
  axis: "x" | "y";
  value: number;
};

const GUIDE_THRESHOLD = 6;

function nodeRect(node: Node) {
  const width = node.width ?? node.initialWidth ?? 0;
  const height = node.height ?? node.initialHeight ?? 0;
  return {
    left: node.position.x,
    centerX: node.position.x + width / 2,
    right: node.position.x + width,
    top: node.position.y,
    centerY: node.position.y + height / 2,
    bottom: node.position.y + height
  };
}

export function findAlignmentGuides(active: Node, nodes: Node[]): AlignmentGuide[] {
  if (active.type !== "architectureNode") return [];
  const activeRect = nodeRect(active);
  const guides: AlignmentGuide[] = [];

  for (const node of nodes) {
    if (node.id === active.id || node.type !== "architectureNode") continue;
    const rect = nodeRect(node);
    const x = [
      [activeRect.left, rect.left],
      [activeRect.centerX, rect.centerX],
      [activeRect.right, rect.right]
    ].find(([a, b]) => Math.abs(a - b) <= GUIDE_THRESHOLD)?.[1];
    const y = [
      [activeRect.top, rect.top],
      [activeRect.centerY, rect.centerY],
      [activeRect.bottom, rect.bottom]
    ].find(([a, b]) => Math.abs(a - b) <= GUIDE_THRESHOLD)?.[1];

    if (typeof x === "number" && !guides.some((guide) => guide.axis === "x" && guide.value === x)) {
      guides.push({ axis: "x", value: x });
    }
    if (typeof y === "number" && !guides.some((guide) => guide.axis === "y" && guide.value === y)) {
      guides.push({ axis: "y", value: y });
    }
    if (guides.length >= 2) break;
  }

  return guides;
}
