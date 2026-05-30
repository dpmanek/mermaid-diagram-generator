export const firstLinePattern = /^(flowchart|graph)\s+(LR|TD|TB)\s*$/i;
export const simpleEdgePattern = /^(.+?)\s*(-\.->|-\.-|-->|---|==>|===)\s*(?:\|([^|]+)\|\s*)?(.+)$/;
export const arrowLabelPattern = /^(.+?)\s+--\s+(.+?)\s+-->\s+(.+)$/;
export const lineLabelPattern = /^(.+?)\s+--\s+(.+?)\s+---\s+(.+)$/;
export const bidirectionalPattern = /^(.+?)\s*<-->\s*(.+)$/;
export const subgraphPattern = /^subgraph\s+(.+)$/i;
export const endPattern = /^end$/i;
export const directivePattern = /^(classDef|class|style|linkStyle|click|direction|accTitle|accDescr)\b/i;
export const malformedEdgePattern = /\s(?:--+|==+|-\.+-?)\s/;

export function cleanLine(line: string) {
  return line.replace(/%%.*$/, "").trim();
}

export function isDirective(line: string) {
  return directivePattern.test(line);
}

export function looksLikeMalformedEdge(line: string) {
  return malformedEdgePattern.test(line);
}
