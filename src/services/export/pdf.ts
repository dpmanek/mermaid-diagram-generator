import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { imageExportOptions } from "./download";

export async function exportPdf(node: HTMLElement, title: string, filename = "archforge-diagram.pdf") {
  const dataUrl = await toPng(node, imageExportOptions(node));
  const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text(title || "ArchForge Architecture Diagram", 36, 36);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text(`Generated ${new Date().toLocaleString()}`, 36, 54);

  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = reject;
    image.src = dataUrl;
  });

  const maxWidth = pageWidth - 72;
  const maxHeight = pageHeight - 96;
  const scale = Math.min(maxWidth / image.width, maxHeight / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  const x = (pageWidth - width) / 2;
  const y = 74 + (maxHeight - height) / 2;
  pdf.addImage(dataUrl, "PNG", x, y, width, height);
  pdf.save(filename);
}
