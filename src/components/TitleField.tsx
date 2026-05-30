type Props = {
  title: string;
  description?: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
};

export function TitleField({ title, description, onTitleChange, onDescriptionChange }: Props) {
  return (
    <section className="panel-section grid gap-2">
      <label className="field-stack">
        <span>Project title</span>
        <input
          className="text-input"
          value={title}
          placeholder="Untitled architecture"
          onChange={(event) => onTitleChange(event.target.value)}
        />
      </label>
      <label className="field-stack">
        <span>Description</span>
        <input
          className="text-input"
          value={description ?? ""}
          placeholder="Optional one-liner"
          onChange={(event) => onDescriptionChange(event.target.value)}
        />
      </label>
    </section>
  );
}
