import type { ArchitectureTheme, LayoutDirection, ThemeId, VisualSettings } from "../types/architecture";

type ThemeSelectorProps = {
  themes: ArchitectureTheme[];
  themeId: ThemeId;
  direction: LayoutDirection;
  visualSettings: VisualSettings;
  onThemeChange: (theme: ThemeId) => void;
  onDirectionChange: (direction: LayoutDirection) => void;
  onVisualSettingsChange: (settings: VisualSettings) => void;
};

export function ThemeSelector({
  themes,
  themeId,
  direction,
  visualSettings,
  onThemeChange,
  onDirectionChange,
  onVisualSettingsChange
}: ThemeSelectorProps) {
  const updateEdgeThickness = (value: string) => {
    onVisualSettingsChange({ ...visualSettings, edgeThickness: Number(value) });
  };
  const updateTextSize = (value: string) => {
    onVisualSettingsChange({ ...visualSettings, textSize: Number(value) });
  };

  return (
    <section className="panel-section grid gap-3">
      <div>
        <label className="field-label">Presentation theme</label>
        <select className="select-input" value={themeId} onChange={(event) => onThemeChange(event.target.value as ThemeId)}>
          {themes.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="field-label">Layout direction</label>
        <div className="segmented-control">
          {(["LR", "TD", "TB"] as LayoutDirection[]).map((item) => (
            <button key={item} className={direction === item ? "active" : ""} onClick={() => onDirectionChange(item)}>
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="visual-controls">
        <label className="field-label" htmlFor="edge-thickness">
          Line thickness <span>{visualSettings.edgeThickness.toFixed(1)}</span>
        </label>
        <input
          id="edge-thickness"
          className="range-input"
          type="range"
          min="1"
          max="6"
          step="0.2"
          value={visualSettings.edgeThickness}
          onInput={(event) => updateEdgeThickness(event.currentTarget.value)}
          onChange={(event) => updateEdgeThickness(event.currentTarget.value)}
        />
      </div>
      <div className="visual-controls">
        <label className="field-label" htmlFor="text-size">
          Text size <span>{visualSettings.textSize}px</span>
        </label>
        <input
          id="text-size"
          className="range-input"
          type="range"
          min="10"
          max="22"
          step="1"
          value={visualSettings.textSize}
          onInput={(event) => updateTextSize(event.currentTarget.value)}
          onChange={(event) => updateTextSize(event.currentTarget.value)}
        />
      </div>
    </section>
  );
}
