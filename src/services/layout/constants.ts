export const NODE_WIDTH = 220;
export const NODE_HEIGHT = 96;
export const CARD_GAP_X = 32;
export const CARD_GAP_Y = 28;
export const GROUP_PAD_X = 46;
export const GROUP_PAD_TOP = 76;
export const GROUP_PAD_BOTTOM = 42;
export const TOP_Y = 80;
export const LEFT_X = 80;
export const GUTTER = 120;
export const ROW_GAP = 54;

export function isBottomStoryGroup(label: string) {
  return /(why|choose|value|deploy|where you need|benefit)/i.test(label);
}
