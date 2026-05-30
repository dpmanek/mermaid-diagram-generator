import { AlignCenter, AlignHorizontalDistributeCenter, AlignLeft, AlignVerticalDistributeCenter, AlignVerticalSpaceAround, Trash2 } from "lucide-react";

type Props = {
  selectedCount: number;
  onAlign: (axis: "left" | "center" | "right" | "top" | "middle" | "bottom") => void;
  onDistribute: (axis: "horizontal" | "vertical") => void;
  onDelete: () => void;
};

export function BulkToolbar({ selectedCount, onAlign, onDistribute, onDelete }: Props) {
  if (selectedCount < 2) return null;

  return (
    <div className="bulk-toolbar no-export nodrag nopan">
      <span>{selectedCount} selected</span>
      <button title="Align left" onClick={() => onAlign("left")}>
        <AlignLeft size={15} />
      </button>
      <button title="Align center" onClick={() => onAlign("center")}>
        <AlignCenter size={15} />
      </button>
      <button title="Align middle" onClick={() => onAlign("middle")}>
        <AlignVerticalSpaceAround size={15} />
      </button>
      <button title="Distribute horizontally" onClick={() => onDistribute("horizontal")}>
        <AlignHorizontalDistributeCenter size={15} />
      </button>
      <button title="Distribute vertically" onClick={() => onDistribute("vertical")}>
        <AlignVerticalDistributeCenter size={15} />
      </button>
      <button className="danger" title="Delete selected" onClick={onDelete}>
        <Trash2 size={15} />
      </button>
    </div>
  );
}
