import { Copy, Layers, Plus, Trash2 } from "lucide-react";

export type CanvasMenu =
  | { kind: "node"; id: string; x: number; y: number }
  | { kind: "edge"; id: string; x: number; y: number }
  | { kind: "pane"; x: number; y: number; flowPosition: { x: number; y: number } };

type Props = {
  menu: CanvasMenu | null;
  onClose: () => void;
  onAddNode: (position: { x: number; y: number }) => void;
  onDuplicateNode: (id: string) => void;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (id: string) => void;
  onBringToFront: (id: string) => void;
};

export function CanvasContextMenu({
  menu,
  onClose,
  onAddNode,
  onDuplicateNode,
  onDeleteNode,
  onDeleteEdge,
  onBringToFront
}: Props) {
  if (!menu) return null;

  const run = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div className="canvas-context-menu no-export" style={{ left: menu.x, top: menu.y }} onContextMenu={(event) => event.preventDefault()}>
      {menu.kind === "pane" ? (
        <button onClick={() => run(() => onAddNode(menu.flowPosition))}>
          <Plus size={14} />
          Add node here
        </button>
      ) : null}
      {menu.kind === "node" ? (
        <>
          <button onClick={() => run(() => onDuplicateNode(menu.id))}>
            <Copy size={14} />
            Duplicate
          </button>
          <button onClick={() => run(() => onBringToFront(menu.id))}>
            <Layers size={14} />
            Bring to front
          </button>
          <button className="danger" onClick={() => run(() => onDeleteNode(menu.id))}>
            <Trash2 size={14} />
            Delete
          </button>
        </>
      ) : null}
      {menu.kind === "edge" ? (
        <button className="danger" onClick={() => run(() => onDeleteEdge(menu.id))}>
          <Trash2 size={14} />
          Delete relationship
        </button>
      ) : null}
    </div>
  );
}
