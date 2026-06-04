import { MarkerType, type Edge } from "@xyflow/react";
import type { ArchitectureEdge, ArchitectureTheme, VisualSettings } from "../../types/architecture";
import type { GroupBounds } from "./groupBounds";
import { handlesForRelationship } from "./handles";

const edgeColors: Record<ArchitectureEdge["type"], string> = {
  sync: "#2563eb",
  async: "#7c3aed",
  data: "#0f766e",
  control: "#dc2626",
  unknown: "#64748b"
};

export function makeRelationshipEdge(
  id: string,
  source: string,
  target: string,
  label: string | undefined,
  edgeType: ArchitectureEdge["type"],
  theme: ArchitectureTheme,
  visualSettings: VisualSettings,
  groupBounds: Map<string, GroupBounds>
): Edge {
  const relationshipHandles = handlesForRelationship(source, target, groupBounds);
  const stroke = edgeColors[edgeType] ?? theme.accent;
  return {
    id,
    source,
    target,
    ...relationshipHandles,
    label,
    type: "editable",
    markerEnd: { type: MarkerType.ArrowClosed, color: stroke, width: 14, height: 14 },
    style: {
      stroke,
      strokeWidth: visualSettings.edgeThickness + 0.4,
      strokeDasharray: edgeType === "async" ? "8 8" : undefined
    },
    className: "relationship-edge",
    zIndex: 3,
    data: { labelColor: theme.text, labelBg: theme.panel, visualSettings }
  };
}

export function decorateEdge(
  edge: ArchitectureEdge,
  source: string,
  target: string,
  theme: ArchitectureTheme,
  visualSettings: VisualSettings,
  isGroupRelationship: boolean,
  relationshipHandles: { sourceHandle?: string; targetHandle?: string }
): Edge {
  const isImplicitContainment = /^contains$/i.test(edge.label ?? "");
  const stroke = isGroupRelationship ? theme.accent : edgeColors[edge.type] ?? theme.edge;
  const strokeWidth = isImplicitContainment
    ? Math.max(1, visualSettings.edgeThickness - 0.7)
    : isGroupRelationship
      ? visualSettings.edgeThickness + 0.4
      : visualSettings.edgeThickness;
  return {
    id: edge.id,
    source,
    target,
    ...relationshipHandles,
    label: isImplicitContainment ? undefined : edge.label,
    type: "editable",
    markerEnd: isImplicitContainment
      ? undefined
      : {
          type: MarkerType.ArrowClosed,
          color: stroke,
          width: isGroupRelationship ? 14 : 12,
          height: isGroupRelationship ? 14 : 12
        },
    style: {
      stroke,
      strokeWidth,
      strokeDasharray: edge.type === "async" ? "8 8" : undefined,
      opacity: isImplicitContainment ? 0.42 : undefined
    },
    className: `${isGroupRelationship ? "relationship-edge" : "component-edge"}${isImplicitContainment ? " containment-edge" : ""}`,
    zIndex: isGroupRelationship ? 3 : 2,
    data: {
      edge,
      labelColor: theme.text,
      labelBg: theme.panel,
      visualSettings,
      pathVariant: isImplicitContainment ? "soft" : "step"
    }
  };
}
