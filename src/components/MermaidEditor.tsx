import { CheckCircle2, Play, RotateCcw } from "lucide-react";
import { diagramTypeLabel } from "../services/mermaid";
import type { MermaidDiagramType } from "../types/architecture";

type MermaidEditorProps = {
  value: string;
  diagramType: MermaidDiagramType;
  validationMessage: string;
  isValid: boolean | null;
  isLoading: boolean;
  onChange: (value: string) => void;
  onValidate: () => void;
  onGenerate: () => void;
  onRelayout: () => void;
};

export function MermaidEditor({
  value,
  diagramType,
  validationMessage,
  isValid,
  isLoading,
  onChange,
  onValidate,
  onGenerate,
  onRelayout
}: MermaidEditorProps) {
  return (
    <section className="panel-section min-h-0 flex-1">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="panel-title">Mermaid Source</h2>
        <span className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{diagramTypeLabel(diagramType)}</span>
      </div>
      <textarea
        className="editor-textarea"
        value={value}
        spellCheck={false}
        onChange={(event) => onChange(event.target.value)}
      />
      <div className="mt-3 grid grid-cols-3 gap-2">
        <button className="primary-button" onClick={onGenerate} disabled={isLoading}>
          <Play size={16} />
          Generate
        </button>
        <button className="secondary-button" onClick={onValidate} disabled={isLoading}>
          <CheckCircle2 size={16} />
          Validate
        </button>
        <button className="secondary-button" onClick={onRelayout} disabled={isLoading}>
          <RotateCcw size={16} />
          Re-layout
        </button>
      </div>
      {validationMessage ? (
        <div className={`validation-message ${isValid === false ? "validation-error" : "validation-success"}`}>
          {validationMessage}
        </div>
      ) : null}
    </section>
  );
}
