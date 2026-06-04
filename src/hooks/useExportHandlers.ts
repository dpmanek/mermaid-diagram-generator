import { useCallback, type RefObject } from "react";
import type { ReactFlowInstance } from "@xyflow/react";
import {
  exportJpeg,
  exportJson,
  exportMarkdown,
  exportPdf,
  exportPng,
  exportSvg
} from "../services/export";
import type { ArchitectureProject } from "../types/architecture";

export type ExportFormat = "png" | "jpeg" | "svg" | "pdf" | "markdown" | "json";

function nextPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

async function withExportViewport<T>(
  canvas: HTMLDivElement,
  flow: ReactFlowInstance | null,
  exportAction: () => Promise<T>
) {
  if (!flow?.viewportInitialized) return exportAction();

  const nodes = flow.getNodes().filter((node) => !node.hidden);
  if (!nodes.length) return exportAction();

  const previousViewport = flow.getViewport();
  canvas.classList.add("is-exporting");

  try {
    await flow.fitBounds(flow.getNodesBounds(nodes), { padding: 0.1, duration: 0 });
    await nextPaint();
    return await exportAction();
  } finally {
    await flow.setViewport(previousViewport, { duration: 0 });
    canvas.classList.remove("is-exporting");
  }
}

export function useExportHandlers(
  project: ArchitectureProject,
  canvasRef: RefObject<HTMLDivElement | null>,
  flowInstanceRef: RefObject<ReactFlowInstance | null>
) {
  return useCallback(
    async (format: ExportFormat) => {
      if (format === "markdown") return exportMarkdown(project);
      if (format === "json") return exportJson(project);
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      return withExportViewport(canvas, flowInstanceRef.current, async () => {
        if (format === "png") return exportPng(canvas);
        if (format === "jpeg") return exportJpeg(canvas);
        if (format === "svg") return exportSvg(canvas);
        return exportPdf(canvas, project.title?.trim() || "ArchForge Architecture Diagram");
      });
    },
    [canvasRef, flowInstanceRef, project]
  );
}
