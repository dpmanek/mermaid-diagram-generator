import { cleanLabel, makeId } from "./tokens";

export type SubgraphHeader = { alias: string; id: string; label: string };

export function parseSubgraphHeader(value: string, index: number): SubgraphHeader {
  const body = value.trim();
  const aliased = body.match(/^([A-Za-z0-9_.:-]+)\s*(?:\[([\s\S]+)\]|\(([\s\S]+)\)|\{([\s\S]+)\})?$/);
  if (aliased) {
    const alias = makeId(aliased[1]) || `subgraph_${index + 1}`;
    const label = cleanLabel(aliased[2] ?? aliased[3] ?? aliased[4] ?? aliased[1]);
    return { alias, id: `group_${alias}`, label };
  }

  const label = cleanLabel(body);
  const alias = makeId(label) || `subgraph_${index + 1}`;
  return { alias, id: `group_${alias}`, label };
}
