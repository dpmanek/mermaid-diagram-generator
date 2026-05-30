import { useEffect, useState } from "react";
import { Handle, NodeToolbar, Position, type NodeProps } from "@xyflow/react";
import { Pencil, Trash2 } from "lucide-react";
import { colorOptions } from "../data/iconMap";
import type { ArchitectureGroup, ArchitectureTheme } from "../types/architecture";
import { useCanvasInteraction } from "./Canvas/CanvasInteractionContext";

type GroupData = {
  group: ArchitectureGroup;
  theme: ArchitectureTheme;
};

function groupAccent(label: string) {
  const value = label.toLowerCase();
  if (/(input|goes in|browser|frontend|user)/.test(value)) return "#38bdf8";
  if (/(output|comes out|artifact|report|workbook)/.test(value)) return "#4ade80";
  if (/(ai|llm|agent|vision|schema)/.test(value)) return "#c084fc";
  if (/(storage|data|database|mongo|rag|cmdb)/.test(value)) return "#f59e0b";
  if (/(deploy|vpc|cloud|on-prem|security)/.test(value)) return "#f87171";
  if (/(api|service|core|controller|engine|mie)/.test(value)) return "#3b82f6";
  return "#94a3b8";
}

export function GroupContainer({ id, data, selected }: NodeProps) {
  const { group, theme } = data as GroupData;
  const ix = useCanvasInteraction();
  const isSelected = Boolean(selected);
  const editing = isSelected && ix.editingId === id;
  const [draft, setDraft] = useState(group.label);
  const accent = group.color ?? groupAccent(group.label);

  useEffect(() => {
    if (editing) setDraft(group.label);
  }, [editing, group.label]);

  const commit = () => {
    const label = draft.trim();
    if (label && label !== group.label) ix.renameGroup(id, label);
    ix.endEdit();
  };

  return (
    <div
      className="architecture-group"
      onClick={(event) => {
        if (isSelected && !editing) ix.beginEdit(id);
      }}
      onDoubleClick={(event) => {
        event.stopPropagation();
        ix.beginEdit(id);
      }}
      style={{
        color: theme.text,
        background: theme.groupFill,
        borderColor: isSelected ? theme.accent : accent,
        boxShadow: `7px 7px 0 rgba(0, 0, 0, 0.28), inset 0 0 0 1px ${accent}22`
      }}
    >
      <NodeToolbar
        isVisible={isSelected && !editing}
        position={Position.Top}
        offset={10}
        className="floating-toolbar nodrag nopan"
        onClick={(event) => event.stopPropagation()}
        onDoubleClick={(event) => event.stopPropagation()}
      >
        <button className="toolbar-btn" title="Rename group" onClick={() => ix.beginEdit(id)}>
          <Pencil size={14} />
        </button>
        <span className="toolbar-divider" />
        <div className="toolbar-swatches">
          {colorOptions.map((color) => (
            <button
              key={color.value}
              className={`toolbar-swatch${group.color === color.value ? " selected" : ""}`}
              title={color.name}
              style={{ background: color.value }}
              onClick={() => ix.updateGroupColor(id, color.value)}
            />
          ))}
        </div>
        <span className="toolbar-divider" />
        <button className="toolbar-btn danger" title="Ungroup &amp; delete" onClick={() => ix.deleteGroup(id)}>
          <Trash2 size={14} />
        </button>
      </NodeToolbar>

      <Handle id="group-left-in" type="target" position={Position.Left} className="group-handle" />
      <Handle id="group-left-out" type="source" position={Position.Left} className="group-handle" />
      <Handle id="group-right-in" type="target" position={Position.Right} className="group-handle" />
      <Handle id="group-right-out" type="source" position={Position.Right} className="group-handle" />
      <Handle id="group-top-in" type="target" position={Position.Top} className="group-handle" />
      <Handle id="group-top-out" type="source" position={Position.Top} className="group-handle" />
      <Handle id="group-bottom-in" type="target" position={Position.Bottom} className="group-handle" />
      <Handle id="group-bottom-out" type="source" position={Position.Bottom} className="group-handle" />
      {editing ? (
        <input
          className="group-label-input nodrag nopan"
          autoFocus
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onClick={(event) => event.stopPropagation()}
          onFocus={(event) => event.target.select()}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit();
            } else if (event.key === "Escape") {
              event.preventDefault();
              ix.endEdit();
            }
          }}
          style={{ borderColor: accent }}
        />
      ) : (
        <div className="group-title" style={{ borderColor: accent, background: `${accent}1f` }}>
          <span className="group-title-dot" style={{ background: accent }} />
          {group.label}
        </div>
      )}
    </div>
  );
}
