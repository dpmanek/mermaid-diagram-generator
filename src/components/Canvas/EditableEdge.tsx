import { useEffect, useState } from "react";
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from "@xyflow/react";
import { Trash2 } from "lucide-react";
import type { ArchitectureEdge } from "../../types/architecture";
import { useCanvasInteraction } from "./CanvasInteractionContext";

type EdgeData = {
  edge?: ArchitectureEdge;
  labelColor?: string;
  labelBg?: string;
};

export function EditableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  style,
  label,
  selected,
  data
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8
  });

  const ix = useCanvasInteraction();
  const { edge, labelColor, labelBg } = (data ?? {}) as EdgeData;
  const isSelected = Boolean(selected);
  const editable = isSelected && Boolean(edge);
  const [draft, setDraft] = useState((label as string) ?? "");

  useEffect(() => {
    if (editable) setDraft(edge?.label ?? "");
  }, [editable, edge?.label]);

  const commit = () => {
    if (edge) ix.updateEdge({ ...edge, label: draft.trim() || undefined });
  };

  const toggleDashed = () => {
    if (edge) ix.updateEdge({ ...edge, type: edge.type === "async" ? "sync" : "async" });
  };

  const transform = `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`;

  const edgeStyle = isSelected
    ? { ...style, strokeWidth: Math.max(Number(style?.strokeWidth ?? 2) + 1, 3) }
    : style;

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={edgeStyle} />
      <EdgeLabelRenderer>
        {editable ? (
          <div className="edge-toolbar nodrag nopan" style={{ transform }}>
            <input
              className="edge-label-input"
              value={draft}
              placeholder="label"
              onChange={(event) => setDraft(event.target.value)}
              onBlur={commit}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  commit();
                  (event.target as HTMLInputElement).blur();
                } else if (event.key === "Escape") {
                  event.preventDefault();
                  setDraft(edge?.label ?? "");
                  (event.target as HTMLInputElement).blur();
                }
              }}
            />
            <button
              className="edge-toolbar-btn"
              title={edge?.type === "async" ? "Make solid line" : "Make dashed line"}
              onClick={toggleDashed}
            >
              {edge?.type === "async" ? "—" : "┄"}
            </button>
            <button
              className="edge-toolbar-btn danger"
              title="Delete relationship"
              onClick={() => edge && ix.deleteEdge(edge.id)}
            >
              <Trash2 size={13} />
            </button>
          </div>
        ) : label ? (
          <div
            className="edge-label-chip"
            style={{ transform, color: labelColor, background: labelBg }}
          >
            {label}
          </div>
        ) : null}
      </EdgeLabelRenderer>
    </>
  );
}
