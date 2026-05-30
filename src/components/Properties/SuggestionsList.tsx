type Props = { suggestions: string[] };

export function SuggestionsList({ suggestions }: Props) {
  return (
    <div className="grid gap-2">
      {suggestions.map((suggestion) => (
        <div key={suggestion} className="suggestion-card">
          {suggestion}
        </div>
      ))}
    </div>
  );
}
