import { useCallback, type RefObject } from "react";
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

export function useExportHandlers(project: ArchitectureProject, canvasRef: RefObject<HTMLDivElement | null>) {
  return useCallback(
    async (format: ExportFormat) => {
      if (format === "markdown") return exportMarkdown(project);
      if (format === "json") return exportJson(project);
      if (!canvasRef.current) return;
      if (format === "png") return exportPng(canvasRef.current);
      if (format === "jpeg") return exportJpeg(canvasRef.current);
      if (format === "svg") return exportSvg(canvasRef.current);
      return exportPdf(canvasRef.current, project.title?.trim() || "ArchForge Architecture Diagram");
    },
    [canvasRef, project]
  );
}
