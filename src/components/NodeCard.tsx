import { useEffect, useState, type CSSProperties } from "react";
import { Handle, NodeResizer, NodeToolbar, Position, type NodeProps } from "@xyflow/react";
import * as Icons from "lucide-react";
import { Copy, Pencil, Trash2 } from "lucide-react";
import type { ArchitectureNode, ArchitectureTheme, VisualSettings } from "../types/architecture";
import { nodeTypeOptions } from "../utils/classification";
import { colorOptions } from "../data/iconMap";
import { useCanvasInteraction } from "./Canvas/CanvasInteractionContext";

type NodeData = {
  node: ArchitectureNode;
  theme: ArchitectureTheme;
  visualSettings: VisualSettings;
};

const iconRegistry = Icons as unknown as Record<string, Icons.LucideIcon>;

const typeAccent: Record<string, string> = {
  user: "#38bdf8",
  frontend: "#60a5fa",
  api: "#818cf8",
  service: "#a78bfa",
  database: "#f59e0b",
  storage: "#f59e0b",
  ai: "#c084fc",
  queue: "#22d3ee",
  security: "#34d399",
  external: "#fb7185",
  unknown: "#94a3b8"
};

export function NodeCard({ id, data, selected }: NodeProps) {
  const { node, theme, visualSettings } = data as NodeData;
  const ix = useCanvasInteraction();
  const isSelected = Boolean(selected);
  const editing = isSelected && ix.editingId === id;
  const [draft, setDraft] = useState(node.label);

  useEffect(() => {
    if (editing) setDraft(node.label);
  }, [editing, node.label]);

  const Icon = iconRegistry[node.icon ?? "Box"] ?? Icons.Box;
  const accent = node.color ?? typeAccent[node.type] ?? theme.accent;
  const isCircle = node.shape === "circle";
  const showIcon = !isCircle && node.type !== "unknown";

  const commit = () => {
    const label = draft.trim();
    if (label && label !== node.label) ix.updateNode({ ...node, label });
    ix.endEdit();
  };

  return (
    <div
      className={`architecture-node node-type-${node.type}${isCircle ? " node-shape-circle" : ""}${showIcon ? "" : " node-no-icon"}`}
      onClick={() => {
        if (isSelected && !editing) ix.beginEdit(id);
      }}
      onDoubleClick={(event) => {
        event.stopPropagation();
        ix.beginEdit(id);
      }}
      style={{
        width: node.size?.width ?? 210,
        minHeight: node.size?.height ?? 104,
        height: isCircle ? (node.size?.height ?? node.size?.width ?? 156) : undefined,
        color: theme.text,
        background: `linear-gradient(135deg, ${theme.nodeFill} 0%, ${theme.nodeFill} 54%, ${accent}16 100%)`,
        borderColor: isSelected ? accent : `${accent}80`,
        boxShadow: isSelected ? `0 0 0 3px ${accent}33, ${theme.shadow}` : theme.shadow
      } as CSSProperties}
    >
      <NodeResizer
        isVisible={isSelected && !editing}
        minWidth={isCircle ? 104 : 140}
        minHeight={isCircle ? 104 : 72}
        lineClassName="node-resizer-line"
        handleClassName="node-resizer-handle"
        onResizeEnd={(_, params) => {
          ix.updateNode({ ...node, size: { width: Math.round(params.width), height: Math.round(params.height) } });
        }}
      />
      <NodeToolbar
        isVisible={isSelected && !editing}
        position={Position.Top}
        offset={10}
        className="floating-toolbar nodrag nopan"
        onClick={(event) => event.stopPropagation()}
        onDoubleClick={(event) => event.stopPropagation()}
      >
        <button className="toolbar-btn" title="Rename" onClick={() => ix.beginEdit(id)}>
          <Pencil size={14} />
        </button>
        <span className="toolbar-divider" />
        <select
          className="toolbar-select nodrag"
          value={node.type}
          title="Type"
          onChange={(event) => ix.updateNode({ ...node, type: event.target.value as ArchitectureNode["type"] })}
        >
          {nodeTypeOptions.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <span className="toolbar-divider" />
        <div className="toolbar-swatches">
          {colorOptions.map((color) => (
            <button
              key={color.value}
              className={`toolbar-swatch${node.color === color.value ? " selected" : ""}`}
              title={color.name}
              style={{ background: color.value }}
              onClick={() => ix.updateNode({ ...node, color: color.value })}
            />
          ))}
        </div>
        <span className="toolbar-divider" />
        <button className="toolbar-btn" title="Duplicate" onClick={() => ix.duplicateNode(node)}>
          <Copy size={14} />
        </button>
        <button className="toolbar-btn danger" title="Delete" onClick={() => ix.deleteNode(id)}>
          <Trash2 size={14} />
        </button>
      </NodeToolbar>

      <Handle id="node-left-in" type="target" position={Position.Left} className="architecture-handle" />
      <Handle id="node-left-out" type="source" position={Position.Left} className="architecture-handle" />
      <Handle id="node-right-in" type="target" position={Position.Right} className="architecture-handle" />
      <Handle id="node-right-out" type="source" position={Position.Right} className="architecture-handle" />
      <Handle id="node-top-in" type="target" position={Position.Top} className="architecture-handle" />
      <Handle id="node-top-out" type="source" position={Position.Top} className="architecture-handle" />
      <Handle id="node-bottom-in" type="target" position={Position.Bottom} className="architecture-handle" />
      <Handle id="node-bottom-out" type="source" position={Position.Bottom} className="architecture-handle" />
      <div className={`node-content${showIcon ? "" : " node-content-plain"}`}>
        {showIcon ? (
          <div className="node-icon" style={{ color: accent, background: `${accent}16`, borderColor: `${accent}30` }}>
            <Icon size={19} strokeWidth={2.2} />
          </div>
        ) : null}
        <div className="node-copy">
          {editing ? (
            <input
              className="node-label-input nodrag nopan"
              style={{ fontSize: visualSettings.textSize }}
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
            />
          ) : (
            <div className="node-title" style={{ fontSize: visualSettings.textSize }}>{node.label}</div>
          )}
          {isCircle ? null : <div className="node-meta">
            {node.type !== "unknown" ? (
              <span className="node-badge" style={{ color: theme.badgeText, background: theme.badgeFill }}>
                {node.type}
              </span>
            ) : null}
            {node.technology ? <span className="node-tech">{node.technology}</span> : null}
          </div>}
        </div>
      </div>
      {isSelected && !editing ? (
        <div className="node-quick-edit nodrag nopan" onClick={(event) => event.stopPropagation()}>
          <input
            value={node.technology ?? ""}
            placeholder="Technology"
            onChange={(event) => ix.updateNode({ ...node, technology: event.target.value || undefined })}
          />
          <input
            value={node.description ?? ""}
            placeholder="Description"
            onChange={(event) => ix.updateNode({ ...node, description: event.target.value || undefined })}
          />
        </div>
      ) : null}
      {node.description && (!isSelected || editing) ? <div className="node-description">{node.description}</div> : null}
    </div>
  );
}
