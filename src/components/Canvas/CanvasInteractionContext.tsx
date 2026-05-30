import { createContext, useContext } from "react";
import type { ArchitectureEdge, ArchitectureNode } from "../../types/architecture";

export type CanvasInteraction = {
  editingId: string | null;
  beginEdit: (id: string) => void;
  endEdit: () => void;
  updateNode: (node: ArchitectureNode) => void;
  duplicateNode: (node: ArchitectureNode) => void;
  deleteNode: (id: string) => void;
  renameGroup: (id: string, label: string) => void;
  updateGroupColor: (id: string, color: string) => void;
  deleteGroup: (id: string) => void;
  updateEdge: (edge: ArchitectureEdge) => void;
  deleteEdge: (id: string) => void;
};

const noop = () => {};

const fallback: CanvasInteraction = {
  editingId: null,
  beginEdit: noop,
  endEdit: noop,
  updateNode: noop,
  duplicateNode: noop,
  deleteNode: noop,
  renameGroup: noop,
  updateGroupColor: noop,
  deleteGroup: noop,
  updateEdge: noop,
  deleteEdge: noop
};

export const CanvasInteractionContext = createContext<CanvasInteraction>(fallback);

export const useCanvasInteraction = () => useContext(CanvasInteractionContext);
