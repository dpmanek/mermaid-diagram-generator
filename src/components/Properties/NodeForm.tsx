import { Trash2 } from "lucide-react";
import { iconOptions } from "../../data/iconMap";
import type { ArchitectureGroup, ArchitectureNode } from "../../types/architecture";
import { nodeTypeOptions } from "../../utils/classification";
import { ColorSwatches } from "./ColorSwatches";

type Props = {
  node: ArchitectureNode;
  groups: ArchitectureGroup[];
  onChange: (node: ArchitectureNode) => void;
  onDelete: (nodeId: string) => void;
};

export function NodeForm({ node, groups, onChange, onDelete }: Props) {
  return (
    <div className="grid gap-3">
      <label className="field-stack">
        <span>Label</span>
        <input
          className="text-input"
          value={node.label}
          onChange={(event) => onChange({ ...node, label: event.target.value })}
        />
      </label>
      <label className="field-stack">
        <span>Node type</span>
        <select
          className="select-input"
          value={node.type}
          onChange={(event) => onChange({ ...node, type: event.target.value as ArchitectureNode["type"] })}
        >
          {nodeTypeOptions.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </label>
      <label className="field-stack">
        <span>Icon</span>
        <select
          className="select-input"
          value={node.icon ?? "Box"}
          onChange={(event) => onChange({ ...node, icon: event.target.value })}
        >
          {iconOptions.map((icon) => (
            <option key={icon} value={icon}>{icon}</option>
          ))}
        </select>
      </label>
      <label className="field-stack">
        <span>Category color</span>
        <ColorSwatches value={node.color} onChange={(color) => onChange({ ...node, color })} />
      </label>
      <label className="field-stack">
        <span>Technology</span>
        <input
          className="text-input"
          value={node.technology ?? ""}
          onChange={(event) => onChange({ ...node, technology: event.target.value })}
        />
      </label>
      <label className="field-stack">
        <span>Notes</span>
        <textarea
          className="notes-input"
          value={node.description ?? ""}
          onChange={(event) => onChange({ ...node, description: event.target.value })}
        />
      </label>
      <label className="field-stack">
        <span>Group</span>
        <select
          className="select-input"
          value={node.groupId ?? ""}
          onChange={(event) => onChange({ ...node, groupId: event.target.value || undefined })}
        >
          <option value="">No group</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>{group.label}</option>
          ))}
        </select>
      </label>
      <button className="danger-button" onClick={() => onDelete(node.id)}>
        <Trash2 size={15} />
        Delete node
      </button>
    </div>
  );
}
