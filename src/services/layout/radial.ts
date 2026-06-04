import type { ArchitectureModel } from "../../types/architecture";

type Point = { x: number; y: number };

const CENTER: Point = { x: 1300, y: 900 };
const CENTER_SIZE = 240;
const BRANCH_WIDTH = 210;
const BRANCH_HEIGHT = 76;
const LEAF_WIDTH = 190;
const LEAF_HEIGHT = 68;
const FIRST_RING_RADIUS = 460;
const TREE_DEPTH_GAP = 320;
const CHILD_SPREAD = 0.24;
const LANE_GAP_X = 34;
const LANE_GAP_Y = 28;
const COLLISION_PAD = 34;

type Side = "top" | "right" | "bottom" | "left";
type Slot = { side: Side; center: Point };

export function layoutRadialHub(model: ArchitectureModel): ArchitectureModel {
  const root = pickRootNode(model);
  if (!root) return model;

  const adjacency = buildAdjacency(model);
  const directedChildren = buildDirectedChildren(model);
  const visited = new Set<string>([root.id]);
  const rootChildren = directedChildren.get(root.id) ?? [];
  const branches = (rootChildren.length ? rootChildren : adjacency.get(root.id) ?? []).filter((id) =>
    model.nodes.some((node) => node.id === id)
  );
  const branchSizes = new Map(branches.map((id) => [id, countSubtree(id, adjacency, visited)]));
  const orderedBranches = orderBranches(branches, branchSizes);
  const positions = new Map<string, Point>();
  const sizes = new Map<string, { width: number; height: number }>();

  sizes.set(root.id, { width: CENTER_SIZE, height: CENTER_SIZE });
  positions.set(root.id, centerToPosition(CENTER, CENTER_SIZE, CENTER_SIZE));

  if (model.nodes.length > 28 || orderedBranches.length > 14) {
    placeDensePresentationMap({ rootId: root.id, branches: orderedBranches, directedChildren, positions, sizes, visited });
    resolveOverlaps(positions, sizes, root.id);
    return applyRadialPositions(model, positions, sizes);
  }

  orderedBranches.forEach((branchId, index) => {
    const angle = branchAngle(index, orderedBranches.length);
    placeBranch({
      nodeId: branchId,
      parentId: root.id,
      rootCenter: CENTER,
      angle,
      depth: 1,
      adjacency,
      positions,
      sizes,
      visited
    });
  });

  const unplaced = model.nodes.filter((node) => !positions.has(node.id));
  unplaced.forEach((node, index) => {
    const angle = branchAngle(index, Math.max(unplaced.length, 1)) + Math.PI / Math.max(unplaced.length, 6);
    const radius = FIRST_RING_RADIUS + TREE_DEPTH_GAP * 1.5;
    const center = polar(CENTER, radius, angle);
    const size = nodeSize(node);
    sizes.set(node.id, size);
    positions.set(node.id, centerToPosition(center, size.width, size.height));
  });

  resolveOverlaps(positions, sizes, root.id);
  return applyRadialPositions(model, positions, sizes);
}

function applyRadialPositions(
  model: ArchitectureModel,
  positions: Map<string, Point>,
  sizes: Map<string, { width: number; height: number }>
): ArchitectureModel {
  return {
    ...model,
    nodes: model.nodes.map((node) => {
      const rootSize = sizes.get(node.id);
      const size = rootSize ?? nodeSize(node);
      return {
        ...node,
        position: positions.get(node.id) ?? node.position ?? { x: 0, y: 0 },
        size
      };
    })
  };
}

export function shouldUseRadialHubLayout(model: ArchitectureModel, diagramType?: string) {
  if (model.groups.length || model.nodes.length < 3) return false;
  if (diagramType === "mindmap") return true;

  const root = pickRootNode(model);
  if (!root) return false;

  const degree = model.edges.filter((edge) => edge.source === root.id || edge.target === root.id).length;
  const leafCount = model.nodes.filter((node) => {
    const nodeDegree = model.edges.filter((edge) => edge.source === node.id || edge.target === node.id).length;
    return node.id !== root.id && nodeDegree <= 2;
  }).length;

  return degree >= Math.max(4, Math.ceil(model.nodes.length * 0.28)) && leafCount / Math.max(model.nodes.length - 1, 1) > 0.55;
}

function pickRootNode(model: ArchitectureModel) {
  const nodeIds = new Set(model.nodes.map((node) => node.id));
  const incoming = new Map<string, number>();
  const outgoing = new Map<string, number>();

  model.edges.forEach((edge) => {
    if (nodeIds.has(edge.source)) outgoing.set(edge.source, (outgoing.get(edge.source) ?? 0) + 1);
    if (nodeIds.has(edge.target)) incoming.set(edge.target, (incoming.get(edge.target) ?? 0) + 1);
  });

  return [...model.nodes].sort((a, b) => {
    const scoreA = rootScore(a.id, incoming, outgoing);
    const scoreB = rootScore(b.id, incoming, outgoing);
    if (scoreA !== scoreB) return scoreB - scoreA;
    return model.nodes.indexOf(a) - model.nodes.indexOf(b);
  })[0];
}

function rootScore(id: string, incoming: Map<string, number>, outgoing: Map<string, number>) {
  const out = outgoing.get(id) ?? 0;
  const inc = incoming.get(id) ?? 0;
  if (inc === 0 && out > 0) return 1000 + out * 10;
  return out * 4 + inc + Math.max(out - inc, 0) * 2;
}

function buildAdjacency(model: ArchitectureModel) {
  const adjacency = new Map<string, string[]>();
  model.nodes.forEach((node) => adjacency.set(node.id, []));
  model.edges.forEach((edge) => {
    adjacency.get(edge.source)?.push(edge.target);
    adjacency.get(edge.target)?.push(edge.source);
  });
  return adjacency;
}

function buildDirectedChildren(model: ArchitectureModel) {
  const children = new Map<string, string[]>();
  model.nodes.forEach((node) => children.set(node.id, []));
  model.edges.forEach((edge) => children.get(edge.source)?.push(edge.target));
  return children;
}

function countSubtree(nodeId: string, adjacency: Map<string, string[]>, inheritedVisited: Set<string>) {
  const visited = new Set(inheritedVisited);
  const stack = [nodeId];
  let count = 0;

  while (stack.length) {
    const current = stack.pop()!;
    if (visited.has(current)) continue;
    visited.add(current);
    count += 1;
    (adjacency.get(current) ?? []).forEach((next) => {
      if (!visited.has(next)) stack.push(next);
    });
  }

  return count;
}

function orderBranches(branches: string[], branchSizes: Map<string, number>) {
  return [...branches].sort((a, b) => (branchSizes.get(b) ?? 0) - (branchSizes.get(a) ?? 0));
}

function placeDensePresentationMap({
  rootId,
  branches,
  directedChildren,
  positions,
  sizes,
  visited
}: {
  rootId: string;
  branches: string[];
  directedChildren: Map<string, string[]>;
  positions: Map<string, Point>;
  sizes: Map<string, { width: number; height: number }>;
  visited: Set<string>;
}) {
  const slots = buildPresentationSlots(branches.length);

  branches.forEach((branchId, index) => {
    const slot = slots[index];
    const size = { width: BRANCH_WIDTH, height: BRANCH_HEIGHT };
    sizes.set(branchId, size);
    positions.set(branchId, centerToPosition(slot.center, size.width, size.height));
    visited.add(branchId);

    const descendants = collectDirectedDescendants(branchId, rootId, directedChildren, visited);
    placeDescendantLane({ descendants, slot, positions, sizes, visited });
  });
}

function buildPresentationSlots(count: number): Slot[] {
  const base = Math.floor(count / 4);
  let remaining = count % 4;
  const counts: Record<Side, number> = {
    top: base,
    right: base,
    bottom: base,
    left: base
  };

  (["top", "right", "bottom", "left"] as Side[]).forEach((side) => {
    if (remaining > 0) {
      counts[side] += 1;
      remaining -= 1;
    }
  });

  return [
    ...sideSlots("top", counts.top),
    ...sideSlots("right", counts.right),
    ...sideSlots("bottom", counts.bottom),
    ...sideSlots("left", counts.left)
  ];
}

function sideSlots(side: Side, count: number): Slot[] {
  if (count <= 0) return [];
  const horizontalGap = BRANCH_WIDTH + Math.max(118, Math.min(220, count * 14));
  const verticalGap = BRANCH_HEIGHT + Math.max(118, Math.min(220, count * 16));
  const topY = CENTER.y - Math.max(560, 500 + count * 14);
  const bottomY = CENTER.y + Math.max(560, 500 + count * 14);
  const leftX = CENTER.x - Math.max(780, 700 + count * 18);
  const rightX = CENTER.x + Math.max(780, 700 + count * 18);

  return Array.from({ length: count }, (_, index) => {
    const offset = index - (count - 1) / 2;
    if (side === "top") return { side, center: { x: CENTER.x + offset * horizontalGap, y: topY } };
    if (side === "bottom") return { side, center: { x: CENTER.x + offset * horizontalGap, y: bottomY } };
    if (side === "right") return { side, center: { x: rightX, y: CENTER.y + offset * verticalGap } };
    return { side, center: { x: leftX, y: CENTER.y + offset * verticalGap } };
  });
}

function collectDirectedDescendants(
  nodeId: string,
  rootId: string,
  directedChildren: Map<string, string[]>,
  inheritedVisited: Set<string>
) {
  const descendants: string[] = [];
  const stack = [...(directedChildren.get(nodeId) ?? [])].filter((id) => id !== rootId);
  const seen = new Set<string>();

  while (stack.length) {
    const current = stack.shift()!;
    if (seen.has(current) || inheritedVisited.has(current)) continue;
    seen.add(current);
    descendants.push(current);
    stack.push(...(directedChildren.get(current) ?? []).filter((id) => id !== rootId));
  }

  return descendants;
}

function placeDescendantLane({
  descendants,
  slot,
  positions,
  sizes,
  visited
}: {
  descendants: string[];
  slot: Slot;
  positions: Map<string, Point>;
  sizes: Map<string, { width: number; height: number }>;
  visited: Set<string>;
}) {
  if (!descendants.length) return;

  const maxColumns = slot.side === "top" || slot.side === "bottom" ? 3 : Math.ceil(descendants.length / 4);
  const columns = Math.max(1, Math.min(maxColumns, descendants.length));
  const rows = Math.max(1, Math.ceil(descendants.length / columns));

  descendants.forEach((childId, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const size = { width: LEAF_WIDTH, height: LEAF_HEIGHT };
    sizes.set(childId, size);
    positions.set(childId, centerToPosition(descendantCenter(slot, row, column, columns, rows), size.width, size.height));
    visited.add(childId);
  });
}

function descendantCenter(slot: Slot, row: number, column: number, columns: number, rows: number): Point {
  const offset = column - (columns - 1) / 2;
  const xStep = LEAF_WIDTH + LANE_GAP_X;
  const yStep = LEAF_HEIGHT + LANE_GAP_Y;
  const rowOffset = row - (rows - 1) / 2;

  if (slot.side === "top") {
    return { x: slot.center.x + offset * xStep, y: slot.center.y - (row + 1) * yStep };
  }
  if (slot.side === "bottom") {
    return { x: slot.center.x + offset * xStep, y: slot.center.y + (row + 1) * yStep };
  }
  if (slot.side === "right") {
    return { x: slot.center.x + (column + 1) * xStep, y: slot.center.y + rowOffset * yStep };
  }
  return { x: slot.center.x - (column + 1) * xStep, y: slot.center.y + rowOffset * yStep };
}

function branchAngle(index: number, count: number) {
  if (count <= 1) return 0;
  return -Math.PI / 2 + (index * Math.PI * 2) / count;
}

function placeBranch({
  nodeId,
  parentId,
  rootCenter,
  angle,
  depth,
  adjacency,
  positions,
  sizes,
  visited
}: {
  nodeId: string;
  parentId: string;
  rootCenter: Point;
  angle: number;
  depth: number;
  adjacency: Map<string, string[]>;
  positions: Map<string, Point>;
  sizes: Map<string, { width: number; height: number }>;
  visited: Set<string>;
}) {
  if (visited.has(nodeId)) return;
  visited.add(nodeId);

  const size = sizes.get(nodeId) ?? (depth === 1 ? { width: BRANCH_WIDTH, height: BRANCH_HEIGHT } : { width: LEAF_WIDTH, height: LEAF_HEIGHT });
  sizes.set(nodeId, size);
  const radius = FIRST_RING_RADIUS + (depth - 1) * TREE_DEPTH_GAP;
  positions.set(nodeId, centerToPosition(polar(rootCenter, radius, angle), size.width, size.height));

  const children = (adjacency.get(nodeId) ?? []).filter((id) => id !== parentId && !visited.has(id));
  const gap = clamp(CHILD_SPREAD / Math.max(depth * 0.6, 1), 0.12, 0.28);
  children.forEach((childId, index) => {
    const offset = (index - (children.length - 1) / 2) * gap;
    placeBranch({
      nodeId: childId,
      parentId: nodeId,
      rootCenter,
      angle: angle + offset,
      depth: depth + 1,
      adjacency,
      positions,
      sizes,
      visited
    });
  });
}

function nodeSize(node: ArchitectureModel["nodes"][number]) {
  if (node.shape === "circle") {
    const side = Math.max(node.size?.width ?? 156, node.size?.height ?? 156, 156);
    return { width: side, height: side };
  }
  return node.size ?? { width: BRANCH_WIDTH, height: BRANCH_HEIGHT };
}

function polar(origin: Point, radius: number, angle: number): Point {
  return {
    x: origin.x + Math.cos(angle) * radius,
    y: origin.y + Math.sin(angle) * radius
  };
}

function centerToPosition(center: Point, width: number, height: number): Point {
  return {
    x: Math.round(center.x - width / 2),
    y: Math.round(center.y - height / 2)
  };
}

function resolveOverlaps(positions: Map<string, Point>, sizes: Map<string, { width: number; height: number }>, lockedId: string) {
  const ids = [...positions.keys()];

  for (let pass = 0; pass < 90; pass += 1) {
    let moved = false;

    for (let i = 0; i < ids.length; i += 1) {
      for (let j = i + 1; j < ids.length; j += 1) {
        const aId = ids[i];
        const bId = ids[j];
        const a = rectFor(aId, positions, sizes);
        const b = rectFor(bId, positions, sizes);
        if (!a || !b) continue;

        const overlapX = (a.width + b.width) / 2 + COLLISION_PAD - Math.abs(a.cx - b.cx);
        const overlapY = (a.height + b.height) / 2 + COLLISION_PAD - Math.abs(a.cy - b.cy);
        if (overlapX <= 0 || overlapY <= 0) continue;

        const pushOnX = overlapX < overlapY;
        const sign = pushOnX ? directionSign(a.cx - b.cx, aId, bId) : directionSign(a.cy - b.cy, aId, bId);
        const amount = (pushOnX ? overlapX : overlapY) + 1;
        nudgePosition(aId, positions, pushOnX ? { x: (amount * sign) / 2, y: 0 } : { x: 0, y: (amount * sign) / 2 }, lockedId);
        nudgePosition(bId, positions, pushOnX ? { x: (-amount * sign) / 2, y: 0 } : { x: 0, y: (-amount * sign) / 2 }, lockedId);
        moved = true;
      }
    }

    if (!moved) break;
  }
}

function rectFor(
  id: string,
  positions: Map<string, Point>,
  sizes: Map<string, { width: number; height: number }>
) {
  const position = positions.get(id);
  const size = sizes.get(id);
  if (!position || !size) return undefined;
  return {
    ...size,
    cx: position.x + size.width / 2,
    cy: position.y + size.height / 2
  };
}

function nudgePosition(id: string, positions: Map<string, Point>, delta: Point, lockedId: string) {
  const position = positions.get(id);
  if (!position || id === lockedId) return;
  positions.set(id, { x: Math.round(position.x + delta.x), y: Math.round(position.y + delta.y) });
}

function directionSign(delta: number, aId: string, bId: string) {
  if (Math.abs(delta) > 1) return delta > 0 ? 1 : -1;
  return aId.localeCompare(bId) >= 0 ? 1 : -1;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
