export function makeId(value: string) {
  return value
    .trim()
    .replace(/['"`]/g, "")
    .replace(/[^A-Za-z0-9_.:-]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function cleanLabel(value: string) {
  return value
    .trim()
    .replace(/^["'`]|["'`]$/g, "")
    .replace(/<br\s*\/?>/gi, " / ")
    .replace(/<[^>]+>/g, "")
    .replace(/^\[|\]$/g, "")
    .replace(/^\(|\)$/g, "")
    .replace(/^\{|\}$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function stripMermaidClass(value: string) {
  return value.trim().replace(/:::[A-Za-z0-9_-]+\s*$/, "").replace(/;$/, "").trim();
}

export function parseNodeToken(token: string) {
  const trimmed = stripMermaidClass(token);
  const shapeStart =
    ["[", "(", "{"]
      .map((symbol) => trimmed.indexOf(symbol))
      .filter((index) => index >= 0)
      .sort((a, b) => a - b)[0] ?? -1;
  if (shapeStart === -1) {
    const id = makeId(trimmed);
    return { id, label: cleanLabel(trimmed) || id, rawLabel: trimmed };
  }

  const id = makeId(trimmed.slice(0, shapeStart));
  const closer = trimmed.endsWith("]") ? "]" : trimmed.endsWith(")") ? ")" : trimmed.endsWith("}") ? "}" : "";
  const labelBody = closer ? trimmed.slice(shapeStart + 1, -1) : trimmed.slice(shapeStart + 1);
  const label = cleanLabel(labelBody) || id;
  return { id, label, rawLabel: trimmed };
}
