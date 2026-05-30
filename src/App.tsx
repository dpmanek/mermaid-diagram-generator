import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ReactFlowProvider, type OnConnect, type OnReconnect } from "@xyflow/react";
import { DiagramCanvas } from "./components/Canvas";
import { CanvasInteractionContext } from "./components/Canvas/CanvasInteractionContext";
import { LeftPanel } from "./components/LeftPanel";
import { PropertiesPanel } from "./components/Properties";
import { samples } from "./data/samples";
import { themes } from "./data/themes";
import { useArchitecture } from "./hooks/useArchitecture";
import { useExportHandlers } from "./hooks/useExportHandlers";
import { useFlowSync } from "./hooks/useFlowSync";
import { useGeneration } from "./hooks/useGeneration";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useLayoutActions } from "./hooks/useLayoutActions";
import { useModelActions } from "./hooks/useModelActions";
import { loadProject, usePersistence } from "./hooks/usePersistence";
import { useProject } from "./hooks/useProject";
import { useSelection } from "./hooks/useSelection";
import { validateMermaid } from "./services/mermaid";
import type { ArchitectureNode, LayoutDirection, ThemeId } from "./types/architecture";
import "./styles/index.css";

const stored = loadProject();

export default function App() {
  const [title, setTitle] = useState(stored?.title ?? "");
  const [description, setDescription] = useState(stored?.description ?? "");
  const [selectedSampleId, setSelectedSampleId] = useState(samples[0].id);
  const [mermaidCode, setMermaidCode] = useState(stored?.originalMermaid ?? samples[0].mermaid);
  const [themeId, setThemeId] = useState<ThemeId>(stored?.theme ?? "dark-enterprise");
  const [layoutDirection, setLayoutDirection] = useState<LayoutDirection>(stored?.layoutDirection ?? "LR");
  const [validation, setValidation] = useState<{ valid: boolean | null; message: string }>({
    valid: null,
    message: ""
  });
  const [suggestions, setSuggestions] = useState<string[]>(stored?.polishSuggestions ?? []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [clipboardNodeIds, setClipboardNodeIds] = useState<string[]>([]);

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const didInit = useRef(false);

  const architecture = useArchitecture(stored?.model);
  const selection = useSelection();

  const beginEdit = useCallback((id: string) => setEditingId(id), []);
  const endEdit = useCallback(() => setEditingId(null), []);

  const handleSync = useCallback(
    (model: typeof architecture.model) => architecture.setModel(model, { record: false }),
    [architecture]
  );

  const { flowNodes, flowEdges, onNodesChange, onEdgesChange, clearFlowSelection } = useFlowSync({
    model: architecture.model,
    themeId,
    onSync: handleSync
  });

  const { generateFromCode, isLoading } = useGeneration({
    onModel: (model) => architecture.setModel(model),
    onDirection: setLayoutDirection,
    onValidation: setValidation,
    onSuggestions: setSuggestions,
    onClearSelection: selection.clear
  });

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    if (!stored) void generateFromCode(samples[0].mermaid);
  }, [generateFromCode]);

  const actions = useModelActions({
    architecture,
    onSelect: selection.selectNode,
    onClearSelection: selection.clear,
    onError: (message) => setValidation({ valid: false, message })
  });

  useEffect(() => {
    setEditingId(null);
  }, [selection.selectedNodeId, selection.selectedGroupId, selection.selectedEdgeId]);

  const interaction = useMemo(
    () => ({
      editingId,
      beginEdit,
      endEdit,
      updateNode: actions.updateNode,
      duplicateNode: (node: ArchitectureNode) => actions.duplicateNode(node.id),
      deleteNode: actions.deleteNode,
      renameGroup: actions.renameGroup,
      updateGroupColor: actions.updateGroupColor,
      deleteGroup: actions.deleteGroup,
      updateEdge: actions.updateEdge,
      deleteEdge: actions.deleteEdge
    }),
    [
      editingId,
      beginEdit,
      endEdit,
      actions
    ]
  );

  const { relayout, changeDirection } = useLayoutActions({
    architecture,
    layoutDirection,
    setLayoutDirection
  });

  const project = useProject({
    title,
    description,
    mermaidCode,
    model: architecture.model,
    themeId,
    layoutDirection,
    suggestions
  });

  usePersistence(project);
  const handleExport = useExportHandlers(project, canvasRef);

  useKeyboardShortcuts({
    onUndo: architecture.undo,
    onRedo: architecture.redo,
    onDelete: () => {
      if (selection.selectedNodeIds.length > 1) actions.deleteManyNodes(selection.selectedNodeIds);
      else if (selection.selectedNodeId) actions.deleteNode(selection.selectedNodeId);
      else if (selection.selectedGroupId) actions.deleteGroup(selection.selectedGroupId);
      else if (selection.selectedEdgeId) actions.deleteEdge(selection.selectedEdgeId);
    },
    onCopy: () => {
      if (selection.selectedNodeIds.length) setClipboardNodeIds(selection.selectedNodeIds);
      else if (selection.selectedNodeId) setClipboardNodeIds([selection.selectedNodeId]);
    },
    onPaste: () => {
      if (clipboardNodeIds.length) actions.duplicateNodes(clipboardNodeIds);
    },
    onDuplicate: () => {
      if (selection.selectedNodeIds.length > 1) actions.duplicateNodes(selection.selectedNodeIds);
      else if (selection.selectedNodeId) actions.duplicateNode(selection.selectedNodeId);
    },
    onRename: () => {
      if (selection.selectedNodeId) beginEdit(selection.selectedNodeId);
      else if (selection.selectedGroupId) beginEdit(selection.selectedGroupId);
    }
  });

  const handleSelectionChange = useCallback(
    (params: Parameters<typeof selection.handleFlowSelection>[0]) => {
      selection.handleFlowSelection(params);
      if (!params.nodes.length && !params.edges.length) {
        clearFlowSelection();
        endEdit();
      }
    },
    [clearFlowSelection, endEdit, selection.handleFlowSelection]
  );

  const handlePaneClick = useCallback(() => {
    clearFlowSelection();
    selection.clear();
    endEdit();
  }, [clearFlowSelection, endEdit, selection.clear]);

  const handleConnect: OnConnect = useCallback(
    (connection) => {
      if (connection.source && connection.target) {
        actions.addEdge(connection.source, connection.target);
      }
    },
    [actions.addEdge]
  );

  const handleReconnect: OnReconnect = useCallback(
    (edge, connection) => {
      if (connection.source && connection.target) {
        actions.reconnectEdge(edge.id, connection.source, connection.target);
      }
    },
    [actions.reconnectEdge]
  );

  const handleSampleChange = (id: string) => {
    const sample = samples.find((item) => item.id === id);
    if (!sample) return;
    setSelectedSampleId(id);
    setMermaidCode(sample.mermaid);
    void generateFromCode(sample.mermaid);
  };

  const selectedNode = architecture.model.nodes.find((node) => node.id === selection.selectedNodeId);
  const selectedEdge = architecture.model.edges.find((edge) => edge.id === selection.selectedEdgeId);
  const selectedGroup = architecture.model.groups.find((group) => group.id === selection.selectedGroupId);
  const theme = themes[themeId];

  return (
    <ReactFlowProvider>
      <div className="app-shell" style={{ color: theme.text }}>
        <LeftPanel
          theme={theme}
          title={title}
          description={description}
          sampleId={selectedSampleId}
          themeId={themeId}
          direction={layoutDirection}
          mermaidCode={mermaidCode}
          validation={validation}
          isLoading={isLoading}
          exportDisabled={!architecture.model.nodes.length || isLoading}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onSampleChange={handleSampleChange}
          onThemeChange={setThemeId}
          onDirectionChange={(direction) => void changeDirection(direction)}
          onMermaidChange={setMermaidCode}
          onValidate={() => void validateMermaid(mermaidCode).then(setValidation)}
          onGenerate={() => void generateFromCode(mermaidCode)}
          onRelayout={() => void relayout()}
          onExport={(format) => void handleExport(format)}
        />

        <CanvasInteractionContext.Provider value={interaction}>
          <DiagramCanvas
            nodes={flowNodes}
            edges={flowEdges}
            theme={theme}
            canvasRef={canvasRef}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            onReconnect={handleReconnect}
            onSelectionChange={handleSelectionChange}
            onNodeSelect={selection.handleNodeSelect}
            onEdgeSelect={selection.selectEdge}
            onPaneClick={handlePaneClick}
            onAddNodeAt={(position, type) => actions.addNode({ position, type })}
            onDuplicateNode={actions.duplicateNode}
            onDeleteNode={actions.deleteNode}
            onDeleteEdge={actions.deleteEdge}
            onBringToFront={actions.bringToFront}
            selectedNodeIds={selection.selectedNodeIds}
            onBulkDelete={() => actions.deleteManyNodes(selection.selectedNodeIds)}
            onBulkAlign={(axis) => actions.alignSelectedNodes(selection.selectedNodeIds, axis)}
            onBulkDistribute={(axis) => actions.distributeSelectedNodes(selection.selectedNodeIds, axis)}
          />
        </CanvasInteractionContext.Provider>

        <PropertiesPanel
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          selectedGroup={selectedGroup}
          nodes={architecture.model.nodes}
          groups={architecture.model.groups}
          suggestions={suggestions}
          onNodeChange={actions.updateNode}
          onDeleteNode={actions.deleteNode}
          onDeleteEdge={actions.deleteEdge}
          onUpdateEdge={actions.updateEdge}
          onAddNode={actions.addNode}
          onAddEdge={actions.addEdge}
          onRenameGroup={actions.renameGroup}
          onUpdateGroupColor={actions.updateGroupColor}
          onDeleteGroup={actions.deleteGroup}
        />
      </div>
    </ReactFlowProvider>
  );
}
