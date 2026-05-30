import type { ArchitectureGroup } from "../../types/architecture";

type Props = { groups: ArchitectureGroup[]; onRename: (groupId: string, label: string) => void };

export function GroupsList({ groups, onRename }: Props) {
  if (!groups.length) {
    return <p className="empty-copy">Subgraphs will appear here as visual containers.</p>;
  }
  return (
    <div className="grid gap-2">
      {groups.map((group) => (
        <input
          key={group.id}
          className="text-input"
          value={group.label}
          onChange={(event) => onRename(group.id, event.target.value)}
        />
      ))}
    </div>
  );
}
