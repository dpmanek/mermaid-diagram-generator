import { Sparkles } from "lucide-react";
import { ExportToolbar } from "./ExportToolbar";
import { MermaidEditor } from "./MermaidEditor";
import { SampleSelector } from "./SampleSelector";
import { ThemeSelector } from "./ThemeSelector";
import { TitleField } from "./TitleField";
import { samples } from "../data/samples";
import { themes } from "../data/themes";
import type { ArchitectureTheme, LayoutDirection, ThemeId } from "../types/architecture";

type ExportFormat = "png" | "jpeg" | "svg" | "pdf" | "markdown" | "json";

type Props = {
  theme: ArchitectureTheme;
  title: string;
  description?: string;
  sampleId: string;
  themeId: ThemeId;
  direction: LayoutDirection;
  mermaidCode: string;
  validation: { valid: boolean | null; message: string };
  isLoading: boolean;
  exportDisabled: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSampleChange: (id: string) => void;
  onThemeChange: (theme: ThemeId) => void;
  onDirectionChange: (direction: LayoutDirection) => void;
  onMermaidChange: (value: string) => void;
  onValidate: () => void;
  onGenerate: () => void;
  onRelayout: () => void;
  onExport: (format: ExportFormat) => void;
};

export function LeftPanel(props: Props) {
  const { theme } = props;
  return (
    <aside className="left-panel" style={{ background: theme.panel, borderColor: theme.border }}>
      <div className="app-title">
        <Sparkles size={20} />
        <div>
          <strong>ArchForge</strong>
          <span>Mermaid to enterprise architecture</span>
        </div>
      </div>
      <TitleField
        title={props.title}
        description={props.description}
        onTitleChange={props.onTitleChange}
        onDescriptionChange={props.onDescriptionChange}
      />
      <SampleSelector samples={samples} value={props.sampleId} onChange={props.onSampleChange} />
      <ThemeSelector
        themes={Object.values(themes)}
        themeId={props.themeId}
        direction={props.direction}
        onThemeChange={props.onThemeChange}
        onDirectionChange={props.onDirectionChange}
      />
      <MermaidEditor
        value={props.mermaidCode}
        validationMessage={props.validation.message}
        isValid={props.validation.valid}
        isLoading={props.isLoading}
        onChange={props.onMermaidChange}
        onValidate={props.onValidate}
        onGenerate={props.onGenerate}
        onRelayout={props.onRelayout}
      />
      <ExportToolbar disabled={props.exportDisabled} onExport={props.onExport} />
    </aside>
  );
}
