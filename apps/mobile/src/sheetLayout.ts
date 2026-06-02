export const SHEET_REFERENCE_SCREEN_HEIGHT = 852;
export const SHEET_HANDLE_HEIGHT_EXPANDED = 24;
export const SHEET_HANDLE_HEIGHT_COLLAPSED = 50;
export const SHEET_BOTTOM_CLEARANCE = 7;
export const SHEET_BODY_BOTTOM_PADDING = 16;

export const SHEET_LAYOUT_REFERENCE = {
  requestExpanded: 410,
  requestCollapsedPeek: 88,
  requestCollapsed: 128,
  generatedExpanded: 516,
  generatedCollapsedPeek: 52,
  generatedCollapsed: 128,
  activeExpanded: 384,
  activeCollapsedPeek: 52,
  activeCollapsed: 66,
  placementCollapsed: 184,
  bottomNavOffset: 86,
  activeHudTop: 151,
  activeHudBottom: 145,
  activeHudStatsTop: 69,
} as const;

export function snapHeightForScreen(
  referencePx: number,
  windowHeight: number
): number {
  return Math.round(
    referencePx * (windowHeight / SHEET_REFERENCE_SCREEN_HEIGHT)
  );
}
