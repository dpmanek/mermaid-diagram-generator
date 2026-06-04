import { toJpeg, toPng, toSvg } from "html-to-image";
import { downloadBlob, downloadDataUrl, imageExportOptions } from "./download";

export async function exportPng(node: HTMLElement, filename = "archforge-diagram.png") {
  const dataUrl = await toPng(node, imageExportOptions(node));
  downloadDataUrl(dataUrl, filename);
}

export async function exportJpeg(node: HTMLElement, filename = "archforge-diagram.jpeg") {
  const dataUrl = await toJpeg(node, { ...imageExportOptions(node), quality: 0.96 });
  downloadDataUrl(dataUrl, filename);
}

export async function exportSvg(node: HTMLElement, filename = "archforge-diagram.svg") {
  const dataUrl = await toSvg(node, imageExportOptions(node));
  const svg = decodeURIComponent(dataUrl.replace("data:image/svg+xml;charset=utf-8,", ""));
  downloadBlob(svg, filename, "image/svg+xml;charset=utf-8");
}
