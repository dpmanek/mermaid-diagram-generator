import type { ArchitectureTheme, LayoutDirection, ThemeId } from "../types/architecture";

type ThemeSelectorProps = {
  themes: ArchitectureTheme[];
  themeId: ThemeId;
  direction: LayoutDirection;
  onThemeChange: (theme: ThemeId) => void;
  onDirectionChange: (direction: LayoutDirection) => void;
};

export function ThemeSelector({ themes, themeId, direction, onThemeChange, onDirectionChange }: ThemeSelectorProps) {
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
    </section>
  );
}
