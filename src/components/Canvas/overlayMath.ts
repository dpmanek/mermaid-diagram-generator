import type { Edge, Node } from "@xyflow/react";

export type OverlayGroup = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
};

export type OverlayArrow = {
  id: string;
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  dashed?: boolean;
};

export function extractOverlayGroups(nodes: Node[]): OverlayGroup[] {
  return nodes
    .filter((node) => node.type === "architectureGroup")
    .map((node) => {
      const width = Number(node.width ?? node.style?.width ?? 0);
      const height = Number(node.height ?? node.style?.height ?? 0);
      return {
        id: node.id,
        x: node.position.x,
        y: node.position.y,
        width,
        height,
        label: String((node.data as { group?: { label?: string } })?.group?.label ?? "")
      };
    })
    .filter((node) => node.width > 0 && node.height > 0);
}

export function centralityScore(group: OverlayGroup, degree: Map<string, number>) {
  const label = group.label.toLowerCase();
  const semanticScore = /(mie|engine|core|platform|service|application|system)/.test(label) ? 1_000 : 0;
  const supportScore = /(input|goes in|output|comes out|value|why|deploy|where you need)/.test(label) ? -250 : 0;
  return (degree.get(group.id) ?? 0) * 100 + semanticScore + supportScore + group.width * group.height * 0.0001;
}

export function pickCenter(groups: OverlayGroup[], edges: Edge[]): OverlayGroup {
  const ids = new Set(groups.map((group) => group.id));
  const relationshipEdges = edges.filter((edge) => ids.has(edge.source) && ids.has(edge.target));
  const degree = new Map<string, number>();
  for (const edge of relationshipEdges) {
    degree.set(edge.source, (degree.get(edge.source) ?? 0) + 1);
    degree.set(edge.target, (degree.get(edge.target) ?? 0) + 1);
  }
  return groups.slice().sort((a, b) => centralityScore(b, degree) - centralityScore(a, degree))[0];
}

export function makeArrow(source: OverlayGroup, target: OverlayGroup, dashed = false): OverlayArrow {
  const sourceCenter = { x: source.x + source.width / 2, y: source.y + source.height / 2 };
  const targetCenter = { x: target.x + target.width / 2, y: target.y + target.height / 2 };
  const sourceRight = source.x + source.width;
  const targetRight = target.x + target.width;
  const sourceBottom = source.y + source.height;
  const targetBottom = target.y + target.height;
  const verticalOverlap = Math.min(sourceBottom, targetBottom) - Math.max(source.y, target.y);
  const horizontalOverlap = Math.min(sourceRight, targetRight) - Math.max(source.x, target.x);
  const hasMeaningfulVerticalOverlap = verticalOverlap > Math.min(source.height, target.height) * 0.2;
  const hasMeaningfulHorizontalOverlap = horizontalOverlap > Math.min(source.width, target.width) * 0.2;

  if (!hasMeaningfulVerticalOverlap && hasMeaningfulHorizontalOverlap) {
    return {
      id: `${source.id}-${target.id}`,
      sx: sourceCenter.x,
      sy: target.y >= source.y ? source.y + source.height : source.y,
      tx: targetCenter.x,
      ty: target.y >= source.y ? target.y : target.y + target.height,
      dashed
    };
  }

  return {
    id: `${source.id}-${target.id}`,
    sx: target.x >= source.x ? source.x + source.width : source.x,
    sy: sourceCenter.y,
    tx: target.x >= source.x ? target.x : target.x + target.width,
    ty: targetCenter.y,
    dashed
  };
}
