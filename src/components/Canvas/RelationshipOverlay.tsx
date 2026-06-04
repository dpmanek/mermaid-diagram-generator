import { ViewportPortal, type Edge, type Node } from "@xyflow/react";
import {
  extractOverlayGroups,
  makeArrow,
  pickCenter,
  type OverlayArrow,
  type OverlayGroup
} from "./overlayMath";

type Props = { nodes: Node[]; edges: Edge[]; color: string; strokeWidth: number };

export function RelationshipOverlay({ nodes, edges, color, strokeWidth }: Props) {
  const groups = extractOverlayGroups(nodes);
  if (groups.length < 2) return null;

  const groupsById = new Map(groups.map((group) => [group.id, group]));
  const relationshipEdges = edges.filter((edge) => groupsById.has(edge.source) && groupsById.has(edge.target));
  const arrows = relationshipEdges.length
    ? arrowsFromEdges(relationshipEdges, groupsById)
    : arrowsFromHeuristic(groups);
  if (!arrows.length) return null;

  return <ArrowSvg arrows={arrows} color={color} strokeWidth={strokeWidth} />;
}

function arrowsFromEdges(edges: Edge[], groupsById: Map<string, OverlayGroup>) {
  const seen = new Set<string>();
  const out: OverlayArrow[] = [];
  for (const edge of edges) {
    const source = groupsById.get(edge.source);
    const target = groupsById.get(edge.target);
    if (!source || !target) continue;
    const id = `${source.id}-${target.id}`;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(makeArrow(source, target, Boolean((edge.style as { strokeDasharray?: unknown } | undefined)?.strokeDasharray)));
  }
  return out;
}

function arrowsFromHeuristic(groups: OverlayGroup[]) {
  const center = pickCenter(groups, []);
  const centerPoint = { x: center.x + center.width / 2, y: center.y + center.height / 2 };
  const out: OverlayArrow[] = [];
  for (const group of groups) {
    if (group.id === center.id) continue;
    const point = { x: group.x + group.width / 2, y: group.y + group.height / 2 };
    if (point.x < centerPoint.x - 120 && Math.abs(point.y - centerPoint.y) < center.height) out.push(makeArrow(group, center));
    if (point.x > centerPoint.x + 120 && Math.abs(point.y - centerPoint.y) < center.height) out.push(makeArrow(center, group));
  }

  const lower = groups
    .filter((group) => group.id !== center.id && group.y > center.y + center.height * 0.5)
    .sort((a, b) => a.y - b.y);
  let previous = center;
  for (const group of lower) {
    out.push(makeArrow(previous, group, true));
    previous = group;
  }
  return out;
}

function ArrowSvg({ arrows, color, strokeWidth }: { arrows: OverlayArrow[]; color: string; strokeWidth: number }) {
  const minX = Math.min(...arrows.flatMap((arrow) => [arrow.sx, arrow.tx])) - 80;
  const minY = Math.min(...arrows.flatMap((arrow) => [arrow.sy, arrow.ty])) - 80;
  const maxX = Math.max(...arrows.flatMap((arrow) => [arrow.sx, arrow.tx])) + 80;
  const maxY = Math.max(...arrows.flatMap((arrow) => [arrow.sy, arrow.ty])) + 80;

  return (
    <ViewportPortal>
      <svg
        className="presentation-relationship-overlay"
        style={{ left: minX, top: minY, width: maxX - minX, height: maxY - minY }}
        viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
      >
        <defs>
          <marker id="presentation-arrowhead" markerWidth="13" markerHeight="10" refX="11" refY="5" orient="auto" markerUnits="userSpaceOnUse">
            <path d="M 0 0 L 13 5 L 0 10 z" fill={color} />
          </marker>
        </defs>
        {arrows.map((arrow) => {
          const midX = (arrow.sx + arrow.tx) / 2;
          const path =
            Math.abs(arrow.sx - arrow.tx) > Math.abs(arrow.sy - arrow.ty)
              ? `M ${arrow.sx} ${arrow.sy} C ${midX} ${arrow.sy}, ${midX} ${arrow.ty}, ${arrow.tx} ${arrow.ty}`
              : `M ${arrow.sx} ${arrow.sy} L ${arrow.sx} ${(arrow.sy + arrow.ty) / 2} L ${arrow.tx} ${(arrow.sy + arrow.ty) / 2} L ${arrow.tx} ${arrow.ty}`;
          return (
            <path
              key={arrow.id}
              d={path}
              className="presentation-arrow-path"
              stroke={color}
              strokeWidth={strokeWidth}
              style={{ strokeWidth }}
              strokeDasharray={arrow.dashed ? "12 12" : undefined}
              markerEnd="url(#presentation-arrowhead)"
            />
          );
        })}
      </svg>
    </ViewportPortal>
  );
}
