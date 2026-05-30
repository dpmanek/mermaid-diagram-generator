import type { Edge } from "@xyflow/react";
import { themes } from "../../data/themes";
import type { ArchitectureModel, ThemeId } from "../../types/architecture";
import { decorateEdge } from "./edgeStyle";
import { buildGroupBounds } from "./groupBounds";
import { handlesForRelationship } from "./handles";
import { inferGroupRelationships } from "./inferredEdges";

export function buildFlowEdges(model: ArchitectureModel, themeId: ThemeId): Edge[] {
  const theme = themes[themeId];
  const { visibleGroups, groupBounds } = buildGroupBounds(model);
  const visibleGroupIds = new Set(visibleGroups.map((group) => group.id));
  const nodeIds = new Set(model.nodes.map((node) => node.id));
  const groupById = new Map(model.groups.map((group) => [group.id, group]));

  const resolveRenderableEndpoint = (id: string) => {
    if (nodeIds.has(id)) return id;
    if (visibleGroupIds.has(id)) return id;
    const group = groupById.get(id);
    if (!group) return id;
    return (
      visibleGroups.find((visible) => group.nodeIds.some((nodeId) => visible.nodeIds.includes(nodeId)))?.id ?? id
    );
  };

  const parsedEdges = model.edges.flatMap((edge) => {
    const source = resolveRenderableEndpoint(edge.source);
    const target = resolveRenderableEndpoint(edge.target);
    if (source === target) return [];
    const isGroupRelationship = visibleGroupIds.has(source) || visibleGroupIds.has(target);
    const bothGroups = visibleGroupIds.has(source) && visibleGroupIds.has(target);
    const handles = bothGroups ? handlesForRelationship(source, target, groupBounds) : {};
    return [decorateEdge(edge, source, target, theme, isGroupRelationship, handles)];
  });

  if (parsedEdges.some((edge) => edge.className === "relationship-edge")) return parsedEdges;

  return [...parsedEdges, ...inferGroupRelationships(visibleGroups, groupBounds, theme)];
}
