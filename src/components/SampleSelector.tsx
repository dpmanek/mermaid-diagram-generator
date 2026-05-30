import type { SampleDiagram } from "../data/samples";

type SampleSelectorProps = {
  samples: SampleDiagram[];
  value: string;
  onChange: (id: string) => void;
};

export function SampleSelector({ samples, value, onChange }: SampleSelectorProps) {
  const selectedSample = samples.find((sample) => sample.id === value);

  return (
    <section className="panel-section">
      <label className="field-label">Sample diagram</label>
      <select className="select-input" value={value} onChange={(event) => onChange(event.target.value)}>
        {samples.map((sample) => (
          <option key={sample.id} value={sample.id}>
            {sample.name}
          </option>
        ))}
      </select>
      <p className="mt-2 text-xs leading-5 text-slate-500">
        {selectedSample?.description}
      </p>
    </section>
  );
}
