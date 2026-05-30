import type { AlignmentGuide } from "./guideMath";

type Props = {
  guides: AlignmentGuide[];
};

export function AlignmentGuides({ guides }: Props) {
  if (!guides.length) return null;

  return (
    <div className="alignment-guides no-export">
      {guides.map((guide) => (
        <div
          key={`${guide.axis}-${guide.value}`}
          className={`alignment-guide alignment-guide-${guide.axis}`}
          style={guide.axis === "x" ? { left: guide.value } : { top: guide.value }}
        />
      ))}
    </div>
  );
}
