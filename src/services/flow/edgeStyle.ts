import { MarkerType, type Edge } from "@xyflow/react";
import type { ArchitectureEdge, ArchitectureTheme } from "../../types/architecture";
import type { GroupBounds } from "./groupBounds";
import { handlesForRelationship } from "./handles";

export function makeRelationshipEdge(
  id: string,
  source: string,
  target: string,
  label: string | undefined,
  edgeType: ArchitectureEdge["type"],
  theme: ArchitectureTheme,
  groupBounds: Map<string, GroupBounds>
): Edge {
  const relationshipHandles = handlesForRelationship(source, target, groupBounds);
  return {
    id,
    source,
    target,
    ...relationshipHandles,
    label,
    type: "editable",
    markerEnd: { type: MarkerType.ArrowClosed, color: theme.accent, width: 14, height: 14 },
    style: {
      stroke: theme.accent,
      strokeWidth: 2.4,
      strokeDasharray: edgeType === "async" ? "8 8" : undefined
    },
    className: "relationship-edge",
    zIndex: 3,
    data: { labelColor: theme.text, labelBg: theme.panel }
  };
}

export function decorateEdge(
  edge: ArchitectureEdge,
  source: string,
  target: string,
  theme: ArchitectureTheme,
  isGroupRelationship: boolean,
  relationshipHandles: { sourceHandle?: string; targetHandle?: string }
): Edge {
  return {
    id: edge.id,
    source,
    target,
    ...relationshipHandles,
    label: edge.label,
    type: "editable",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: isGroupRelationship ? theme.accent : theme.edge,
      width: isGroupRelationship ? 14 : 12,
      height: isGroupRelationship ? 14 : 12
    },
    style: {
      stroke: isGroupRelationship ? theme.accent : theme.edge,
      strokeWidth: isGroupRelationship ? 2.4 : 1.8,
      strokeDasharray: edge.type === "async" ? "8 8" : undefined
    },
    className: isGroupRelationship ? "relationship-edge" : "component-edge",
    zIndex: isGroupRelationship ? 3 : 2,
    data: { edge, labelColor: theme.text, labelBg: theme.panel }
  };
}
