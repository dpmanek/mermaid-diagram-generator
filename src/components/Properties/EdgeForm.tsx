import { Trash2 } from "lucide-react";
import type { ArchitectureEdge, ArchitectureEdgeType } from "../../types/architecture";

type Props = {
  edge: ArchitectureEdge;
  onDelete: (edgeId: string) => void;
  onChange: (edge: ArchitectureEdge) => void;
};

const edgeTypeOptions: ArchitectureEdgeType[] = ["sync", "async", "data", "control", "unknown"];

export function EdgeForm({ edge, onDelete, onChange }: Props) {
  return (
    <div className="grid gap-3">
      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
        {edge.source} to {edge.target}
      </div>
      <label className="field-stack">
        <span>Label</span>
        <input
          className="text-input"
          value={edge.label ?? ""}
          placeholder="Relationship label"
          onChange={(event) => onChange({ ...edge, label: event.target.value || undefined })}
        />
      </label>
      <label className="field-stack">
        <span>Relationship type</span>
        <select
          className="select-input"
          value={edge.type}
          onChange={(event) => onChange({ ...edge, type: event.target.value as ArchitectureEdgeType })}
        >
          {edgeTypeOptions.map((type) => (
            <option key={type} value={type}>{type === "async" ? "async (dashed)" : type}</option>
          ))}
        </select>
      </label>
      <button className="danger-button" onClick={() => onDelete(edge.id)}>
        <Trash2 size={15} />
        Delete edge
      </button>
    </div>
  );
}
