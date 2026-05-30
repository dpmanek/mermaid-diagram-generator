import { arrowLabelPattern, bidirectionalPattern, lineLabelPattern, simpleEdgePattern } from "./patterns";
import { cleanLabel } from "./tokens";

export type EdgeMatch = {
  source: string;
  target: string;
  label?: string;
  operator?: string;
  bidirectional?: boolean;
};

export function parseEdgeLine(line: string): EdgeMatch | undefined {
  const bidirectional = line.match(bidirectionalPattern);
  if (bidirectional) {
    return { source: bidirectional[1], target: bidirectional[2], bidirectional: true };
  }

  const arrowLabel = line.match(arrowLabelPattern);
  if (arrowLabel) {
    return { source: arrowLabel[1], target: arrowLabel[3], label: cleanLabel(arrowLabel[2]) };
  }

  const lineLabel = line.match(lineLabelPattern);
  if (lineLabel) {
    return { source: lineLabel[1], target: lineLabel[3], label: cleanLabel(lineLabel[2]) };
  }

  const simpleEdge = line.match(simpleEdgePattern);
  if (simpleEdge) {
    return {
      source: simpleEdge[1],
      target: simpleEdge[4],
      label: simpleEdge[3]?.trim(),
      operator: simpleEdge[2]
    };
  }

  return undefined;
}
