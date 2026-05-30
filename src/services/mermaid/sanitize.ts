// Normalizes loosely-formatted Mermaid source (typically produced by LLMs or
// pasted from docs) into the strict subset that mermaid@strict and our own
// pipe-only edge parser both accept.
//
// Idempotent: running it twice yields the same output, so it is safe to call at
// every parse/validate entry point without double-escaping anything.

// Inline edge-label forms (`A -. text .-> B`) that mermaid renders but our
// pipe-only edge regex misses. We rewrite each to the canonical `OP|label|`
// form. The arrow tokens live outside quoted labels, so masking (below) keeps
// these from matching inside node-label text.
const dottedInlineLabel = /\s-\.\s+(.+?)\s+\.-(>?)(\s)/g;
const thickInlineLabel = /\s==\s+(.+?)\s+==(>|=)(\s)/g;
const normalInlineLabel = /\s--\s+(.+?)\s+--(>|-)(\s)/g;

// Placeholder sentinel for masked quoted spans. U+E000 is a Private Use Area
// code point, so `<index>` cannot collide with real label, port, or
// arrow text in any sane Mermaid source.
const SENTINEL = "";
const maskPattern = /(\d+)/;
const maskPatternGlobal = /(\d+)/g;

// Resolves a captured edge label: restores a masked quoted span if present,
// then drops the surrounding quotes so the emitted `|label|` renders cleanly.
function unmaskAndStrip(label: string, quoted: string[]): string {
  let text = label.trim();
  const masked = text.match(maskPattern);
  if (masked) text = quoted[Number(masked[1])] ?? text;
  return text.trim().replace(/^"([\s\S]*)"$/, "$1").trim();
}

export function sanitizeMermaid(source: string): string {
  let out = source;

  // Smart quotes -> straight quotes (copy/paste from rich-text editors).
  out = out.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");

  // Literal "\n" inside labels -> <br/>. A real newline is the 0x0A char, never
  // the two-char backslash-n sequence, so this only touches escaped breaks.
  out = out.replace(/\\n/g, "<br/>");

  // Mask quoted spans so edge rewriting can never corrupt label text that
  // happens to contain arrow-like characters (e.g. `N["a -- b --> c"]`).
  const quoted: string[] = [];
  out = out.replace(/"[^"\n]*"/g, (match) => {
    quoted.push(match);
    return `${SENTINEL}${quoted.length - 1}${SENTINEL}`;
  });

  // Inline edge labels -> pipe form. Distinct arrow tokens, so order-independent.
  out = out.replace(
    dottedInlineLabel,
    (_m, label, head, tail) => ` -.${head ? "->" : "-"}|${unmaskAndStrip(label, quoted)}|${tail}`
  );
  out = out.replace(
    thickInlineLabel,
    (_m, label, head, tail) => ` ==${head === ">" ? ">" : "="}|${unmaskAndStrip(label, quoted)}|${tail}`
  );
  out = out.replace(
    normalInlineLabel,
    (_m, label, head, tail) => ` --${head === ">" ? ">" : "-"}|${unmaskAndStrip(label, quoted)}|${tail}`
  );

  // Restore any quoted spans that were not consumed as edge labels.
  out = out.replace(maskPatternGlobal, (_m, index) => quoted[Number(index)] ?? "");

  return out;
}
