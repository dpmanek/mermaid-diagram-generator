import { useCallback, useState } from "react";
import type { Node, OnSelectionChangeParams } from "@xyflow/react";

export type SelectionState = {
  selectedNodeId?: string;
  selectedEdgeId?: string;
  selectedGroupId?: string;
  selectedNodeIds: string[];
  selectedEdgeIds: string[];
  selectedGroupIds: string[];
};

function isSameSelection(current: SelectionState, next: SelectionState) {
  return (
    current.selectedNodeId === next.selectedNodeId &&
    current.selectedEdgeId === next.selectedEdgeId &&
    current.selectedGroupId === next.selectedGroupId &&
    current.selectedNodeIds.join("|") === next.selectedNodeIds.join("|") &&
    current.selectedEdgeIds.join("|") === next.selectedEdgeIds.join("|") &&
    current.selectedGroupIds.join("|") === next.selectedGroupIds.join("|")
  );
}

const EMPTY_SELECTION: SelectionState = {
  selectedNodeIds: [],
  selectedEdgeIds: [],
  selectedGroupIds: []
};

export function useSelection() {
  const [state, setState] = useState<SelectionState>(EMPTY_SELECTION);

  const setSelection = useCallback((next: SelectionState) => {
    setState((current) => (isSameSelection(current, next) ? current : next));
  }, []);

  const clear = useCallback(() => setSelection(EMPTY_SELECTION), [setSelection]);

  const handleFlowSelection = useCallback(
    (params: OnSelectionChangeParams) => {
      const node = params.nodes.find((item) => item.type === "architectureNode");
      const group = params.nodes.find((item) => item.type === "architectureGroup");
      const edge = params.edges[0];
      const selectedNodeIds = params.nodes.filter((item) => item.type === "architectureNode").map((item) => item.id);
      const selectedGroupIds = params.nodes.filter((item) => item.type === "architectureGroup").map((item) => item.id);
      const selectedEdgeIds = params.edges.map((item) => item.id);
      setSelection({
        selectedNodeId: node?.id,
        selectedGroupId: node ? undefined : group?.id,
        selectedEdgeId: node || group ? undefined : edge?.id,
        selectedNodeIds,
        selectedGroupIds,
        selectedEdgeIds
      });
    },
    [setSelection]
  );

  const handleNodeSelect = useCallback((node: Node) => {
    if (node.type === "architectureNode") {
      setSelection({ ...EMPTY_SELECTION, selectedNodeId: node.id, selectedNodeIds: [node.id] });
      return;
    }
    if (node.type === "architectureGroup") {
      setSelection({ ...EMPTY_SELECTION, selectedGroupId: node.id, selectedGroupIds: [node.id] });
    }
  }, [setSelection]);

  const selectNode = useCallback(
    (id: string) => setSelection({ ...EMPTY_SELECTION, selectedNodeId: id, selectedNodeIds: [id] }),
    [setSelection]
  );

  const selectEdge = useCallback(
    (id: string) => setSelection({ ...EMPTY_SELECTION, selectedEdgeId: id, selectedEdgeIds: [id] }),
    [setSelection]
  );

  return { ...state, clear, handleFlowSelection, handleNodeSelect, selectNode, selectEdge };
}
