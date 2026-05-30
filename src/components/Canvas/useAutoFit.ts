import { useEffect, useRef } from "react";
import { useReactFlow, type Node } from "@xyflow/react";

const LARGE_GRAPH_THRESHOLD = 18;
const LARGE_ZOOM = 0.62;

export function useAutoFit(nodes: Node[]) {
  const { fitView, setViewport } = useReactFlow();
  const nodesRef = useRef(nodes);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    const currentNodes = nodesRef.current;
    if (!currentNodes.length) return;
    const frame = window.requestAnimationFrame(() => {
      if (currentNodes.length > LARGE_GRAPH_THRESHOLD) {
        const anchors = currentNodes.filter((node) => node.type === "architectureGroup");
        const positioned = anchors.length ? anchors : currentNodes;
        const minX = Math.min(...positioned.map((node) => node.position.x));
        const minY = Math.min(...positioned.map((node) => node.position.y));
        window.setTimeout(() => {
          void setViewport(
            { x: 54 - minX * LARGE_ZOOM, y: 54 - minY * LARGE_ZOOM, zoom: LARGE_ZOOM },
            { duration: 260 }
          );
        }, 180);
        return;
      }

      void fitView({ padding: 0.18, duration: 260 });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [fitView, nodes.length, setViewport]);
}
