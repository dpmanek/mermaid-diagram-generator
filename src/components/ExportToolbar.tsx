import { Download, FileCode2, FileImage, FileJson, FileText, Image } from "lucide-react";

type ExportToolbarProps = {
  disabled: boolean;
  onExport: (format: "png" | "jpeg" | "svg" | "pdf" | "markdown" | "json") => void;
};

const buttons = [
  { format: "png", label: "PNG", icon: FileImage },
  { format: "jpeg", label: "JPEG", icon: Image },
  { format: "svg", label: "SVG", icon: FileCode2 },
  { format: "pdf", label: "PDF", icon: FileText },
  { format: "markdown", label: "MD", icon: Download },
  { format: "json", label: "JSON", icon: FileJson }
] as const;

export function ExportToolbar({ disabled, onExport }: ExportToolbarProps) {
  return (
    <section className="panel-section">
      <h2 className="panel-title mb-3">Export</h2>
      <div className="grid grid-cols-3 gap-2">
        {buttons.map(({ format, label, icon: Icon }) => (
          <button key={format} className="export-button" disabled={disabled} onClick={() => onExport(format)}>
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
