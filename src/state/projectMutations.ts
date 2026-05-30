import { defaultIconByType } from "../data/iconMap";
import type { ArchitectureEdge, ArchitectureModel, ArchitectureNode, ArchitectureNodeType } from "../types/architecture";
import { classifyNode, edgeTypeFromLabel } from "../utils/classification";
import { newId } from "../utils/id";

export function applyNodeChange(model: ArchitectureModel, updated: ArchitectureNode): ArchitectureModel {
  return {
    ...model,
    nodes: model.nodes.map((node) =>
      node.id === updated.id
        ? { ...updated, icon: updated.icon ?? defaultIconByType[updated.type] }
        : node
    ),
    groups: model.groups.map((group) => ({
      ...group,
      nodeIds:
        updated.groupId === group.id
          ? Array.from(new Set([...group.nodeIds, updated.id]))
          : group.nodeIds.filter((id) => id !== updated.id)
    }))
  };
}

function nextZIndex(model: ArchitectureModel) {
  return Math.max(0, ...model.nodes.map((node) => node.zIndex ?? 1), ...model.groups.map((group) => group.zIndex ?? 0)) + 1;
}

export function removeNode(model: ArchitectureModel, nodeId: string): ArchitectureModel {
  return {
    nodes: model.nodes.filter((node) => node.id !== nodeId),
    edges: model.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
    groups: model.groups.map((group) => ({
      ...group,
      nodeIds: group.nodeIds.filter((id) => id !== nodeId)
    }))
  };
}

export function removeEdge(model: ArchitectureModel, edgeId: string): ArchitectureModel {
  return { ...model, edges: model.edges.filter((edge) => edge.id !== edgeId) };
}

export function applyEdgeChange(model: ArchitectureModel, updated: ArchitectureEdge): ArchitectureModel {
  return {
    ...model,
    edges: model.edges.map((edge) => (edge.id === updated.id ? { ...edge, ...updated } : edge))
  };
}

export function removeGroup(model: ArchitectureModel, groupId: string): ArchitectureModel {
  return {
    ...model,
    nodes: model.nodes.map((node) => (node.groupId === groupId ? { ...node, groupId: undefined } : node)),
    groups: model.groups.filter((group) => group.id !== groupId)
  };
}

export function bringNodeToFront(model: ArchitectureModel, nodeId: string): ArchitectureModel {
  const zIndex = nextZIndex(model);
  return {
    ...model,
    nodes: model.nodes.map((node) => (node.id === nodeId ? { ...node, zIndex } : node)),
    groups: model.groups.map((group) => (group.id === nodeId ? { ...group, zIndex } : group))
  };
}

export function removeNodes(model: ArchitectureModel, nodeIds: string[]): ArchitectureModel {
  const ids = new Set(nodeIds);
  return {
    nodes: model.nodes.filter((node) => !ids.has(node.id)),
    edges: model.edges.filter((edge) => !ids.has(edge.source) && !ids.has(edge.target)),
    groups: model.groups
      .filter((group) => !ids.has(group.id))
      .map((group) => ({ ...group, nodeIds: group.nodeIds.filter((id) => !ids.has(id)) }))
  };
}

export function duplicateNode(
  model: ArchitectureModel,
  nodeId: string,
  offset = { x: 36, y: 36 }
): { model: ArchitectureModel; id: string } {
  const source = model.nodes.find((node) => node.id === nodeId);
  if (!source) return { model, id: "" };
  const id = newId("node");
  const node: ArchitectureNode = {
    ...source,
    id,
    label: `${source.label} copy`,
    position: { x: (source.position?.x ?? 0) + offset.x, y: (source.position?.y ?? 0) + offset.y },
    zIndex: nextZIndex(model)
  };
  return {
    model: {
      ...model,
      nodes: [...model.nodes, node],
      groups: model.groups.map((group) =>
        group.id === node.groupId ? { ...group, nodeIds: [...group.nodeIds, id] } : group
      )
    },
    id
  };
}

type CreateNodeOptions = {
  position?: { x: number; y: number };
  type?: ArchitectureNodeType;
  label?: string;
};

export function createNode(model: ArchitectureModel, options: CreateNodeOptions = {}): { model: ArchitectureModel; id: string } {
  const id = newId("node");
  const label = options.label ?? "New Component";
  const type = options.type ?? classifyNode(label);
  const node: ArchitectureNode = {
    id,
    label,
    type,
    icon: defaultIconByType[type],
    position: options.position ?? { x: 120 + model.nodes.length * 22, y: 120 + model.nodes.length * 18 },
    size: { width: 210, height: 104 },
    zIndex: nextZIndex(model)
  };
  return { model: { ...model, nodes: [...model.nodes, node] }, id };
}

export function appendEdge(model: ArchitectureModel, source: string, target: string): ArchitectureModel | string {
  const endpointIds = new Set([
    ...model.nodes.map((node) => node.id),
    ...model.groups.map((group) => group.id)
  ]);
  if (source === target) {
    return "A relationship needs two different endpoints.";
  }
  if (!endpointIds.has(source)) {
    return `Source node "${source}" does not exist.`;
  }
  if (!endpointIds.has(target)) {
    return `Target node "${target}" does not exist.`;
  }
  if (model.edges.some((edge) => edge.source === source && edge.target === target)) {
    return "That relationship already exists.";
  }
  const edge: ArchitectureEdge = {
    id: newId(`edge_${source}_${target}`),
    source,
    target,
    type: edgeTypeFromLabel()
  };
  return { ...model, edges: [...model.edges, edge] };
}

export function reconnectEdge(
  model: ArchitectureModel,
  edgeId: string,
  source: string,
  target: string
): ArchitectureModel | string {
  const endpointIds = new Set([
    ...model.nodes.map((node) => node.id),
    ...model.groups.map((group) => group.id)
  ]);
  if (source === target) return "A relationship needs two different endpoints.";
  if (!endpointIds.has(source)) return `Source node "${source}" does not exist.`;
  if (!endpointIds.has(target)) return `Target node "${target}" does not exist.`;
  if (model.edges.some((edge) => edge.id !== edgeId && edge.source === source && edge.target === target)) {
    return "That relationship already exists.";
  }
  return {
    ...model,
    edges: model.edges.map((edge) => (edge.id === edgeId ? { ...edge, source, target } : edge))
  };
}

export function setGroupLabel(model: ArchitectureModel, groupId: string, label: string): ArchitectureModel {
  return {
    ...model,
    groups: model.groups.map((group) => (group.id === groupId ? { ...group, label } : group))
  };
}

export function setGroupColor(model: ArchitectureModel, groupId: string, color: string): ArchitectureModel {
  return {
    ...model,
    groups: model.groups.map((group) => (group.id === groupId ? { ...group, color } : group))
  };
}

export function alignNodes(
  model: ArchitectureModel,
  nodeIds: string[],
  axis: "left" | "center" | "right" | "top" | "middle" | "bottom"
): ArchitectureModel {
  const ids = new Set(nodeIds);
  const selected = model.nodes.filter((node) => ids.has(node.id));
  if (selected.length < 2) return model;
  const bounds = selected.map((node) => ({
    id: node.id,
    x: node.position?.x ?? 0,
    y: node.position?.y ?? 0,
    width: node.size?.width ?? 210,
    height: node.size?.height ?? 104
  }));
  const left = Math.min(...bounds.map((item) => item.x));
  const right = Math.max(...bounds.map((item) => item.x + item.width));
  const top = Math.min(...bounds.map((item) => item.y));
  const bottom = Math.max(...bounds.map((item) => item.y + item.height));
  return {
    ...model,
    nodes: model.nodes.map((node) => {
      const rect = bounds.find((item) => item.id === node.id);
      if (!rect) return node;
      const position = { ...(node.position ?? { x: 0, y: 0 }) };
      if (axis === "left") position.x = left;
      if (axis === "center") position.x = left + (right - left) / 2 - rect.width / 2;
      if (axis === "right") position.x = right - rect.width;
      if (axis === "top") position.y = top;
      if (axis === "middle") position.y = top + (bottom - top) / 2 - rect.height / 2;
      if (axis === "bottom") position.y = bottom - rect.height;
      return { ...node, position };
    })
  };
}

export function distributeNodes(
  model: ArchitectureModel,
  nodeIds: string[],
  axis: "horizontal" | "vertical"
): ArchitectureModel {
  const ids = new Set(nodeIds);
  const selected = model.nodes
    .filter((node) => ids.has(node.id))
    .map((node) => ({
      node,
      x: node.position?.x ?? 0,
      y: node.position?.y ?? 0
    }))
    .sort((a, b) => (axis === "horizontal" ? a.x - b.x : a.y - b.y));
  if (selected.length < 3) return model;
  const first = axis === "horizontal" ? selected[0].x : selected[0].y;
  const last = axis === "horizontal" ? selected[selected.length - 1].x : selected[selected.length - 1].y;
  const step = (last - first) / (selected.length - 1);
  const positions = new Map(
    selected.map((item, index) => [
      item.node.id,
      axis === "horizontal"
        ? { ...(item.node.position ?? { x: 0, y: 0 }), x: first + step * index }
        : { ...(item.node.position ?? { x: 0, y: 0 }), y: first + step * index }
    ])
  );
  return {
    ...model,
    nodes: model.nodes.map((node) => (positions.has(node.id) ? { ...node, position: positions.get(node.id)! } : node))
  };
}
