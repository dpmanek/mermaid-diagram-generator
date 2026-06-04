import { useCallback, useEffect, useRef, useState } from "react";
import {
  applyEdgeChanges,
  applyNodeChanges,
  type Edge,
  type Node,
  type OnEdgesChange,
  type OnNodesChange
} from "@xyflow/react";
import type { ArchitectureModel, ThemeId, VisualSettings } from "../types/architecture";
import { buildFlowEdges, buildFlowNodes, syncModelFromFlow } from "../services/flow";

type Args = {
  model: ArchitectureModel;
  themeId: ThemeId;
  visualSettings: VisualSettings;
  onSync: (model: ArchitectureModel) => void;
};

export function useFlowSync({ model, themeId, visualSettings, onSync }: Args) {
  const [flowNodes, setFlowNodes] = useState<Node[]>([]);
  const [flowEdges, setFlowEdges] = useState<Edge[]>([]);

  const flowNodesRef = useRef(flowNodes);
  const flowEdgesRef = useRef(flowEdges);
  const modelRef = useRef(model);

  useEffect(() => {
    flowNodesRef.current = flowNodes;
  }, [flowNodes]);

  useEffect(() => {
    flowEdgesRef.current = flowEdges;
  }, [flowEdges]);

  useEffect(() => {
    modelRef.current = model;
  }, [model]);

  useEffect(() => {
    const prevNodeSelection = new Map(flowNodesRef.current.map((node) => [node.id, node.selected]));
    const prevEdgeSelection = new Map(flowEdgesRef.current.map((edge) => [edge.id, edge.selected]));
    const nextNodes = buildFlowNodes(model, themeId, visualSettings).map((node) =>
      prevNodeSelection.get(node.id) ? { ...node, selected: true } : node
    );
    const nextEdges = buildFlowEdges(model, themeId, visualSettings).map((edge) =>
      prevEdgeSelection.get(edge.id) ? { ...edge, selected: true } : edge
    );
    flowNodesRef.current = nextNodes;
    flowEdgesRef.current = nextEdges;
    setFlowNodes(nextNodes);
    setFlowEdges(nextEdges);
  }, [model, themeId, visualSettings]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      const next = applyNodeChanges(changes, flowNodesRef.current);
      flowNodesRef.current = next;
      setFlowNodes(next);
      const shouldSync = changes.some((change) => change.type === "position" || change.type === "remove");
      if (shouldSync) onSync(syncModelFromFlow(modelRef.current, next, flowEdgesRef.current));
    },
    [onSync]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      const next = applyEdgeChanges(changes, flowEdgesRef.current);
      flowEdgesRef.current = next;
      setFlowEdges(next);
      const shouldSync = changes.some((change) => change.type === "remove");
      if (shouldSync) {
        const removedEdgeIds = new Set(
          changes
            .filter((change) => change.type === "remove")
            .map((change) => change.id)
        );
        onSync(syncModelFromFlow(modelRef.current, flowNodesRef.current, next, { removedEdgeIds }));
      }
    },
    [onSync]
  );

  const clearFlowSelection = useCallback(() => {
    setFlowNodes((current) =>
      current.some((node) => node.selected) ? current.map((node) => ({ ...node, selected: false })) : current
    );
    setFlowEdges((current) =>
      current.some((edge) => edge.selected) ? current.map((edge) => ({ ...edge, selected: false })) : current
    );
  }, []);

  return { flowNodes, flowEdges, onNodesChange, onEdgesChange, clearFlowSelection };
}
