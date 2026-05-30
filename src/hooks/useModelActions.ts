import { useCallback } from "react";
import type { ArchitectureEdge, ArchitectureModel, ArchitectureNode, ArchitectureNodeType } from "../types/architecture";
import {
  alignNodes,
  appendEdge,
  applyEdgeChange,
  applyNodeChange,
  bringNodeToFront,
  createNode,
  distributeNodes,
  duplicateNode as duplicateNodeMutation,
  reconnectEdge as reconnectEdgeMutation,
  removeEdge,
  removeGroup,
  removeNode,
  removeNodes,
  setGroupColor,
  setGroupLabel
} from "../state/projectMutations";

type Architecture = {
  updateModel: (updater: (model: ArchitectureModel) => ArchitectureModel, opts?: { record?: boolean }) => void;
};

type Args = {
  architecture: Architecture;
  onSelect: (id: string) => void;
  onClearSelection: () => void;
  onError: (message: string) => void;
};

export function useModelActions({ architecture, onSelect, onClearSelection, onError }: Args) {
  const updateNode = useCallback(
    (updated: ArchitectureNode) => architecture.updateModel((model) => applyNodeChange(model, updated)),
    [architecture]
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      architecture.updateModel((model) => removeNode(model, nodeId));
      onClearSelection();
    },
    [architecture, onClearSelection]
  );

  const deleteEdge = useCallback(
    (edgeId: string) => {
      architecture.updateModel((model) => removeEdge(model, edgeId));
      onClearSelection();
    },
    [architecture, onClearSelection]
  );

  const updateEdge = useCallback(
    (updated: ArchitectureEdge) => architecture.updateModel((model) => applyEdgeChange(model, updated)),
    [architecture]
  );

  const deleteGroup = useCallback(
    (groupId: string) => {
      architecture.updateModel((model) => removeGroup(model, groupId));
      onClearSelection();
    },
    [architecture, onClearSelection]
  );

  const addNode = useCallback(
    (options?: { position?: { x: number; y: number }; type?: ArchitectureNodeType; label?: string }) => {
      let createdId = "";
      architecture.updateModel((model) => {
        const result = createNode(model, options);
        createdId = result.id;
        return result.model;
      });
      if (createdId) onSelect(createdId);
    },
    [architecture, onSelect]
  );

  const duplicateNode = useCallback(
    (nodeId: string) => {
      let createdId = "";
      architecture.updateModel((model) => {
        const result = duplicateNodeMutation(model, nodeId);
        createdId = result.id;
        return result.model;
      });
      if (createdId) onSelect(createdId);
    },
    [architecture, onSelect]
  );

  const duplicateNodes = useCallback(
    (nodeIds: string[]) => {
      let lastCreatedId = "";
      architecture.updateModel((model) => {
        let next = model;
        nodeIds.forEach((nodeId, index) => {
          const result = duplicateNodeMutation(next, nodeId, { x: 36 + index * 18, y: 36 + index * 18 });
          next = result.model;
          if (result.id) lastCreatedId = result.id;
        });
        return next;
      });
      if (lastCreatedId) onSelect(lastCreatedId);
    },
    [architecture, onSelect]
  );

  const addEdge = useCallback(
    (source: string, target: string) => {
      architecture.updateModel((model) => {
        const result = appendEdge(model, source, target);
        if (typeof result === "string") {
          onError(result);
          return model;
        }
        return result;
      });
    },
    [architecture, onError]
  );

  const reconnectEdge = useCallback(
    (edgeId: string, source: string, target: string) => {
      architecture.updateModel((model) => {
        const result = reconnectEdgeMutation(model, edgeId, source, target);
        if (typeof result === "string") {
          onError(result);
          return model;
        }
        return result;
      });
    },
    [architecture, onError]
  );

  const renameGroup = useCallback(
    (groupId: string, label: string) =>
      architecture.updateModel((model) => setGroupLabel(model, groupId, label)),
    [architecture]
  );

  const updateGroupColor = useCallback(
    (groupId: string, color: string) => architecture.updateModel((model) => setGroupColor(model, groupId, color)),
    [architecture]
  );

  const bringToFront = useCallback(
    (id: string) => architecture.updateModel((model) => bringNodeToFront(model, id)),
    [architecture]
  );

  const deleteManyNodes = useCallback(
    (nodeIds: string[]) => {
      architecture.updateModel((model) => removeNodes(model, nodeIds));
      onClearSelection();
    },
    [architecture, onClearSelection]
  );

  const alignSelectedNodes = useCallback(
    (nodeIds: string[], axis: Parameters<typeof alignNodes>[2]) =>
      architecture.updateModel((model) => alignNodes(model, nodeIds, axis)),
    [architecture]
  );

  const distributeSelectedNodes = useCallback(
    (nodeIds: string[], axis: Parameters<typeof distributeNodes>[2]) =>
      architecture.updateModel((model) => distributeNodes(model, nodeIds, axis)),
    [architecture]
  );

  return {
    updateNode,
    deleteNode,
    deleteEdge,
    updateEdge,
    deleteGroup,
    addNode,
    duplicateNode,
    duplicateNodes,
    addEdge,
    reconnectEdge,
    renameGroup,
    updateGroupColor,
    bringToFront,
    deleteManyNodes,
    alignSelectedNodes,
    distributeSelectedNodes
  };
}
