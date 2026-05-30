import { Database, Globe2, Plus, Server, Shield, Sparkles, UserRound } from "lucide-react";
import type { ArchitectureNodeType } from "../../types/architecture";

const paletteItems: Array<{ type: ArchitectureNodeType; label: string; icon: typeof UserRound }> = [
  { type: "user", label: "User", icon: UserRound },
  { type: "frontend", label: "UI", icon: Globe2 },
  { type: "api", label: "API", icon: Server },
  { type: "database", label: "DB", icon: Database },
  { type: "ai", label: "AI", icon: Sparkles },
  { type: "security", label: "Security", icon: Shield }
];

type Props = {
  onQuickAdd: (type: ArchitectureNodeType) => void;
};

export function NodePalette({ onQuickAdd }: Props) {
  return (
    <div className="node-palette no-export nodrag nopan" onDoubleClick={(event) => event.stopPropagation()}>
      <button className="palette-add" title="Add component" onClick={() => onQuickAdd("service")}>
        <Plus size={15} />
      </button>
      {paletteItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.type}
            draggable
            title={item.label}
            onClick={() => onQuickAdd(item.type)}
            onDragStart={(event) => {
              event.dataTransfer.setData("application/archforge-node-type", item.type);
              event.dataTransfer.effectAllowed = "copy";
            }}
          >
            <Icon size={15} />
          </button>
        );
      })}
    </div>
  );
}
