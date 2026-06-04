import { useCallback, useEffect, useState, type MouseEvent as ReactMouseEvent } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useReactFlow,
  type Edge,
  type OnConnect,
  type OnReconnect,
  type Node,
  type OnEdgesChange,
  type OnNodeDrag,
  type OnNodesChange,
  type ReactFlowInstance,
  type OnSelectionChangeParams
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { ArchitectureNodeType, ArchitectureTheme, VisualSettings } from "../../types/architecture";
import { AlignmentGuides } from "./AlignmentGuides";
import { BulkToolbar } from "./BulkToolbar";
import { CanvasContextMenu, type CanvasMenu } from "./ContextMenu";
import { CanvasEmptyState } from "./EmptyState";
import { NodePalette } from "./NodePalette";
import { RelationshipOverlay } from "./RelationshipOverlay";
import { findAlignmentGuides, type AlignmentGuide } from "./guideMath";
import { edgeTypes } from "./edgeTypes";
import { nodeTypes } from "./nodeTypes";
import { useAutoFit } from "./useAutoFit";

type Props = {
  nodes: Node[];
  edges: Edge[];
  theme: ArchitectureTheme;
  visualSettings: VisualSettings;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onFlowReady: (instance: ReactFlowInstance) => void;
  onConnect: OnConnect;
  onReconnect: OnReconnect;
  onSelectionChange: (params: OnSelectionChangeParams) => void;
  onNodeSelect: (node: Node) => void;
  onEdgeSelect: (edgeId: string) => void;
  onPaneClick: () => void;
  onAddNodeAt: (position: { x: number; y: number }, type?: ArchitectureNodeType) => void;
  onDuplicateNode: (nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
  onBringToFront: (id: string) => void;
  selectedNodeIds: string[];
  onBulkDelete: () => void;
  onBulkAlign: (axis: "left" | "center" | "right" | "top" | "middle" | "bottom") => void;
  onBulkDistribute: (axis: "horizontal" | "vertical") => void;
};

export function DiagramCanvas({
  nodes,
  edges,
  theme,
  visualSettings,
  canvasRef,
  onNodesChange,
  onEdgesChange,
  onFlowReady,
  onConnect,
  onReconnect,
  onSelectionChange,
  onNodeSelect,
  onEdgeSelect,
  onPaneClick,
  onAddNodeAt,
  onDuplicateNode,
  onDeleteNode,
  onDeleteEdge,
  onBringToFront,
  selectedNodeIds,
  onBulkDelete,
  onBulkAlign,
  onBulkDistribute
}: Props) {
  const [isInteractive, setIsInteractive] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAppFullscreen, setIsAppFullscreen] = useState(false);
  const [menu, setMenu] = useState<CanvasMenu | null>(null);
  const [guides, setGuides] = useState<AlignmentGuide[]>([]);
  const { fitView, screenToFlowPosition } = useReactFlow();
  useAutoFit(nodes);

  const fitCanvasView = useCallback(() => {
    window.setTimeout(() => fitView({ padding: 0.18, duration: 240 }), 80);
  }, [fitView]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNativeFullscreen = document.fullscreenElement === canvasRef.current;
      setIsFullscreen(isNativeFullscreen);
      if (isNativeFullscreen) {
        setIsAppFullscreen(false);
        fitCanvasView();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [canvasRef, fitCanvasView]);

  useEffect(() => {
    if (!isAppFullscreen) return;
    fitCanvasView();
  }, [fitCanvasView, isAppFullscreen]);

  useEffect(() => {
    if (!isAppFullscreen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsAppFullscreen(false);
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isAppFullscreen]);

  const toggleFullscreen = useCallback(() => {
    const target = canvasRef.current;
    if (!target) return;

    if (document.fullscreenElement === target) {
      void document.exitFullscreen();
      return;
    }

    if (isAppFullscreen) {
      setIsAppFullscreen(false);
      setIsFullscreen(false);
      return;
    }

    if (document.fullscreenEnabled && target.requestFullscreen) {
      void target.requestFullscreen().catch(() => {
        setIsAppFullscreen(true);
        setIsFullscreen(true);
      });
      return;
    }

    setIsAppFullscreen(true);
    setIsFullscreen(true);
  }, [canvasRef, isAppFullscreen]);

  const eventPosition = (event: MouseEvent | ReactMouseEvent) =>
    screenToFlowPosition({ x: event.clientX, y: event.clientY });

  const handleNodeDrag: OnNodeDrag = (_, node) => {
    setGuides(findAlignmentGuides(node, nodes));
  };

  return (
    <main className="canvas-shell" style={{ background: theme.canvas }} onClick={() => menu && setMenu(null)}>
      <div
        ref={canvasRef}
        className={`canvas-export-surface${isAppFullscreen ? " is-app-fullscreen" : ""}`}
        style={{ background: theme.canvas }}
        onDoubleClick={(event) => {
          if (event.target instanceof Element && event.target.classList.contains("react-flow__pane")) {
            onAddNodeAt(eventPosition(event));
          }
        }}
      >
        <button
          type="button"
          className="canvas-fullscreen-button no-export nodrag nopan"
          aria-label={isFullscreen ? "Exit fullscreen" : "View graph fullscreen"}
          title={isFullscreen ? "Exit fullscreen" : "View graph fullscreen"}
          onClick={(event) => {
            event.stopPropagation();
            toggleFullscreen();
          }}
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
        {nodes.length ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onInit={onFlowReady}
            onConnect={onConnect}
            onReconnect={onReconnect}
            onSelectionChange={onSelectionChange}
            onNodeClick={(_, node) => onNodeSelect(node)}
            onEdgeClick={(_, edge) => onEdgeSelect(edge.id)}
            onNodeContextMenu={(event, node) => {
              event.preventDefault();
              setMenu({ kind: "node", id: node.id, x: event.clientX, y: event.clientY });
            }}
            onEdgeContextMenu={(event, edge) => {
              event.preventDefault();
              setMenu({ kind: "edge", id: edge.id, x: event.clientX, y: event.clientY });
            }}
            onPaneClick={() => {
              setMenu(null);
              onPaneClick();
            }}
            onPaneContextMenu={(event) => {
              event.preventDefault();
              setMenu({ kind: "pane", x: event.clientX, y: event.clientY, flowPosition: eventPosition(event) });
            }}
            onDrop={(event) => {
              event.preventDefault();
              const type = event.dataTransfer.getData("application/archforge-node-type") as ArchitectureNodeType;
              if (type) onAddNodeAt(eventPosition(event), type);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "copy";
            }}
            onNodeDrag={handleNodeDrag}
            onNodeDragStop={() => setGuides([])}
            nodesDraggable={isInteractive}
            nodesConnectable={isInteractive}
            edgesReconnectable={isInteractive}
            elementsSelectable={isInteractive}
            selectNodesOnDrag={isInteractive}
            selectionOnDrag={isInteractive}
            snapToGrid
            snapGrid={[16, 16]}
            panOnDrag={isInteractive ? [1, 2] : false}
            zoomOnScroll={isInteractive}
            zoomOnPinch={isInteractive}
            zoomOnDoubleClick={false}
            fitView={nodes.length <= 18}
            fitViewOptions={{ padding: 0.18 }}
            minZoom={0.18}
            maxZoom={1.7}
            defaultEdgeOptions={{
              type: "smoothstep",
              animated: false,
              style: { stroke: theme.edge, strokeWidth: visualSettings.edgeThickness },
              markerEnd: { type: "arrowclosed", color: theme.edge }
            }}
          >
            <NodePalette onQuickAdd={(type) => onAddNodeAt({ x: 120, y: 120 }, type)} />
            <BulkToolbar
              selectedCount={selectedNodeIds.length}
              onAlign={onBulkAlign}
              onDistribute={onBulkDistribute}
              onDelete={onBulkDelete}
            />
            <AlignmentGuides guides={guides} />
            <CanvasContextMenu
              menu={menu}
              onClose={() => setMenu(null)}
              onAddNode={onAddNodeAt}
              onDuplicateNode={onDuplicateNode}
              onDeleteNode={onDeleteNode}
              onDeleteEdge={onDeleteEdge}
              onBringToFront={onBringToFront}
            />
            <RelationshipOverlay nodes={nodes} edges={edges} color={theme.accent} strokeWidth={visualSettings.edgeThickness + 0.4} />
            <Background color={theme.border} gap={26} size={1} />
            <Controls className="no-export" onInteractiveChange={setIsInteractive} />
            <MiniMap
              className="no-export"
              pannable={isInteractive}
              zoomable={isInteractive}
              nodeStrokeWidth={2}
              nodeColor={(node) => (node.type === "architectureGroup" ? theme.groupBorder : theme.accent)}
            />
          </ReactFlow>
        ) : (
          <CanvasEmptyState />
        )}
      </div>
    </main>
  );
}
