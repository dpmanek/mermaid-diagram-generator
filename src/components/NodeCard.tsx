import { useEffect, useState } from "react";
import { Handle, NodeResizer, NodeToolbar, Position, type NodeProps } from "@xyflow/react";
import * as Icons from "lucide-react";
import { Copy, Pencil, Trash2 } from "lucide-react";
import type { ArchitectureNode, ArchitectureTheme } from "../types/architecture";
import { nodeTypeOptions } from "../utils/classification";
import { colorOptions } from "../data/iconMap";
import { useCanvasInteraction } from "./Canvas/CanvasInteractionContext";

type NodeData = {
  node: ArchitectureNode;
  theme: ArchitectureTheme;
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
  const { node, theme } = data as NodeData;
  const ix = useCanvasInteraction();
  const isSelected = Boolean(selected);
  const editing = isSelected && ix.editingId === id;
  const [draft, setDraft] = useState(node.label);

  useEffect(() => {
    if (editing) setDraft(node.label);
  }, [editing, node.label]);

  const Icon = iconRegistry[node.icon ?? "Box"] ?? Icons.Box;
  const accent = node.color ?? typeAccent[node.type] ?? theme.accent;

  const commit = () => {
    const label = draft.trim();
    if (label && label !== node.label) ix.updateNode({ ...node, label });
    ix.endEdit();
  };

  return (
    <div
      className={`architecture-node node-type-${node.type}`}
      onClick={(event) => {
        if (isSelected && !editing) ix.beginEdit(id);
      }}
      onDoubleClick={(event) => {
        event.stopPropagation();
        ix.beginEdit(id);
      }}
      style={{
        width: node.size?.width ?? 210,
        minHeight: node.size?.height ?? 104,
        color: theme.text,
        background: theme.nodeFill,
        borderColor: isSelected ? accent : theme.nodeBorder,
        boxShadow: isSelected ? `0 0 0 3px ${accent}33, ${theme.shadow}` : theme.shadow
      }}
    >
      <NodeResizer
        isVisible={isSelected && !editing}
        minWidth={140}
        minHeight={72}
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

      <Handle type="target" position={Position.Left} className="architecture-handle" />
      <Handle type="source" position={Position.Right} className="architecture-handle" />
      <Handle type="target" position={Position.Top} className="architecture-handle" />
      <Handle type="source" position={Position.Bottom} className="architecture-handle" />
      <div className="node-content">
        <div className="node-icon" style={{ color: accent, background: `${accent}16`, borderColor: `${accent}30` }}>
          <Icon size={19} strokeWidth={2.2} />
        </div>
        <div className="node-copy">
          {editing ? (
            <input
              className="node-label-input nodrag nopan"
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
            <div className="node-title">{node.label}</div>
          )}
          <div className="node-meta">
            {node.type !== "unknown" ? (
              <span className="node-badge" style={{ color: theme.badgeText, background: theme.badgeFill }}>
                {node.type}
              </span>
            ) : null}
            {node.technology ? <span className="node-tech">{node.technology}</span> : null}
          </div>
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
