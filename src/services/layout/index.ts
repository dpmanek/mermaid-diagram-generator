import type { ArchitectureModel, LayoutDirection } from "../../types/architecture";
import { layoutWithElk } from "./elk";
import { layoutPresentationBoard } from "./presentation";

export async function layoutArchitecture(model: ArchitectureModel, direction: LayoutDirection): Promise<ArchitectureModel> {
  if (model.groups.length >= 2) return layoutPresentationBoard(model);
  return layoutWithElk(model, direction);
}
