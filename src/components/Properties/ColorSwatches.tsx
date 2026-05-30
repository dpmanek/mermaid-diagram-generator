import { colorOptions } from "../../data/iconMap";

type Props = { value?: string; onChange: (color: string) => void };

export function ColorSwatches({ value, onChange }: Props) {
  return (
    <div className="swatch-row">
      {colorOptions.map((color) => (
        <button
          key={color.value}
          className={value === color.value ? "swatch selected" : "swatch"}
          title={color.name}
          style={{ background: color.value }}
          onClick={() => onChange(color.value)}
        />
      ))}
    </div>
  );
}
