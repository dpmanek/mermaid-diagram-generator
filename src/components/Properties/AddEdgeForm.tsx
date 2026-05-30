import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import type { ArchitectureNode } from "../../types/architecture";

type Props = {
  selectedNode: ArchitectureNode;
  nodes: ArchitectureNode[];
  onAddEdge: (source: string, target: string) => void;
};

export function AddEdgeForm({ selectedNode, nodes, onAddEdge }: Props) {
  const targets = useMemo(() => nodes.filter((node) => node.id !== selectedNode.id), [nodes, selectedNode.id]);
  const [targetId, setTargetId] = useState(targets[0]?.id ?? "");

  useEffect(() => {
    setTargetId((current) => (targets.some((node) => node.id === current) ? current : targets[0]?.id ?? ""));
  }, [targets]);

  return (
    <div className="grid gap-2">
      <select className="select-input" value={targetId} onChange={(event) => setTargetId(event.target.value)}>
        {targets.map((node) => (
          <option key={node.id} value={node.id}>{node.label}</option>
        ))}
      </select>
      <button className="secondary-button w-full" disabled={!targetId} onClick={() => onAddEdge(selectedNode.id, targetId)}>
        <Plus size={15} />
        Add edge from selected
      </button>
    </div>
  );
}
