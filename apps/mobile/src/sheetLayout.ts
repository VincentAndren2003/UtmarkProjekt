/** Portrait logical height for iPhone 16/17 — baseline when sheet UI was tuned. */
export const SHEET_REFERENCE_SCREEN_HEIGHT = 852;

/** Handle area above sheet body (expanded state, no hint line). */
export const SHEET_HANDLE_HEIGHT_EXPANDED = 24;

/** Handle + hint when collapsed. */
export const SHEET_HANDLE_HEIGHT_COLLAPSED = 50;

/** Extra space so the bottom action button is not clipped above the nav bar. */
export const SHEET_BOTTOM_CLEARANCE = 7;

/** White fill below sheet content so the map does not show through above the nav. */
export const SHEET_BODY_BOTTOM_PADDING = 16;

/** Snap point and inset values tuned on the reference device (iPhone 17 class). */
export const SHEET_LAYOUT_REFERENCE = {
  requestExpanded: 410,
  /** Handle + greeting only (collapsed peek on reference device). */
  requestCollapsedPeek: 88,
  requestCollapsed: 128,
  generatedExpanded: 516,
  /** Generated route collapsed: handle + hint only (no "Din rutt" peek). */
  generatedCollapsedPeek: 52,
  generatedCollapsed: 128,
  activeExpanded: 384,
  /** Active run collapsed: handle + hint only (no sheet body peek). */
  activeCollapsedPeek: 52,
  activeCollapsed: 66,
  placementCollapsed: 184,
  /** Fallback until bottom nav is measured via onLayout (iPhone 17 reference). */
  bottomNavOffset: 86,
  activeHudTop: 151,
  activeHudBottom: 145,
  activeHudStatsTop: 69,
} as const;

/** Proportional snap height — same screen share as on the reference device. */
export function snapHeightForScreen(
  referencePx: number,
  windowHeight: number
): number {
  return Math.round(
    referencePx * (windowHeight / SHEET_REFERENCE_SCREEN_HEIGHT)
  );
}
