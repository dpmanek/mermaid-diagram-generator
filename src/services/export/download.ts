export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

export function downloadBlob(content: BlobPart, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function imageExportOptions(node?: HTMLElement) {
  const backgroundColor = node ? getComputedStyle(node).backgroundColor : "#ffffff";

  return {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: backgroundColor === "rgba(0, 0, 0, 0)" ? "#ffffff" : backgroundColor,
    filter: (node: HTMLElement) =>
      !node.classList?.contains("no-export") && !node.classList?.contains("react-flow__attribution")
  };
}
