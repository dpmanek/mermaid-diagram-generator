import type { ArchitectureModel, LayoutDirection, MermaidDiagramType } from "../../types/architecture";
import { layoutWithElk } from "./elk";
import { layoutPresentationBoard } from "./presentation";
import { layoutRadialHub, shouldUseRadialHubLayout } from "./radial";

export async function layoutArchitecture(
  model: ArchitectureModel,
  direction: LayoutDirection,
  diagramType?: MermaidDiagramType
): Promise<ArchitectureModel> {
  if (model.groups.length >= 2) return layoutPresentationBoard(model);
  if (shouldUseRadialHubLayout(model, diagramType)) return layoutRadialHub(model);
  return layoutWithElk(model, direction);
}
