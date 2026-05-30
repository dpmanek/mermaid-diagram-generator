import { Trash2 } from "lucide-react";
import type { ArchitectureGroup } from "../../types/architecture";
import { ColorSwatches } from "./ColorSwatches";

type Props = {
  group: ArchitectureGroup;
  onRename: (groupId: string, label: string) => void;
  onColorChange: (groupId: string, color: string) => void;
  onDelete: (groupId: string) => void;
};

export function GroupForm({ group, onRename, onColorChange, onDelete }: Props) {
  return (
    <div className="grid gap-3">
      <label className="field-stack">
        <span>Group label</span>
        <input
          className="text-input"
          value={group.label}
          onChange={(event) => onRename(group.id, event.target.value)}
        />
      </label>
      <label className="field-stack">
        <span>Group color</span>
        <ColorSwatches value={group.color} onChange={(color) => onColorChange(group.id, color)} />
      </label>
      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
        {group.nodeIds.length} {group.nodeIds.length === 1 ? "component" : "components"}
      </div>
      <button className="danger-button" onClick={() => onDelete(group.id)}>
        <Trash2 size={15} />
        Ungroup &amp; delete
      </button>
    </div>
  );
}
