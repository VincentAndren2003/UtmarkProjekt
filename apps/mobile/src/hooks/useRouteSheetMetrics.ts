import { useMemo } from 'react';

import {
  SHEET_BOTTOM_CLEARANCE,
  SHEET_LAYOUT_REFERENCE,
  SHEET_REFERENCE_SCREEN_HEIGHT,
  snapHeightForScreen,
} from '../sheetLayout';
import { useSheetScale } from './useSheetScale';

export function useRouteSheetMetrics(measuredBottomNavHeight: number | null) {
  const { windowHeight } = useSheetScale();

  return useMemo(() => {
    const bottomNavHeight =
      measuredBottomNavHeight ?? SHEET_LAYOUT_REFERENCE.bottomNavOffset;
    /** Align sheet bottom with nav top — clearance is only inside snap height. */
    const sheetBottomInset = bottomNavHeight;

    const collapsedSnap = (referencePx: number) =>
      snapHeightForScreen(referencePx, windowHeight);

    const expandedSnap = (
      bodyHeight: number,
      handleHeight: number,
      fallbackRefPx: number
    ) =>
      bodyHeight > 0
        ? bodyHeight + handleHeight + SHEET_BOTTOM_CLEARANCE
        : collapsedSnap(fallbackRefPx) + SHEET_BOTTOM_CLEARANCE;

    return {
      windowHeight,
      bottomNavHeight,
      sheetBottomInset,
      requestCollapsed: collapsedSnap(SHEET_LAYOUT_REFERENCE.requestCollapsed),
      requestExpandedFallback: collapsedSnap(
        SHEET_LAYOUT_REFERENCE.requestExpanded
      ),
      generatedCollapsed: collapsedSnap(
        SHEET_LAYOUT_REFERENCE.generatedCollapsed
      ),
      generatedExpandedFallback: collapsedSnap(
        SHEET_LAYOUT_REFERENCE.generatedExpanded
      ),
      activeCollapsed: collapsedSnap(SHEET_LAYOUT_REFERENCE.activeCollapsed),
      activeExpandedFallback: collapsedSnap(
        SHEET_LAYOUT_REFERENCE.activeExpanded
      ),
      placementCollapsed: collapsedSnap(
        SHEET_LAYOUT_REFERENCE.placementCollapsed
      ),
      expandedSnap,
      activeHudTop: snapHeightForScreen(
        SHEET_LAYOUT_REFERENCE.activeHudTop,
        windowHeight
      ),
      activeHudBottom: snapHeightForScreen(
        SHEET_LAYOUT_REFERENCE.activeHudBottom,
        windowHeight
      ),
      activeHudStatsTop: snapHeightForScreen(
        SHEET_LAYOUT_REFERENCE.activeHudStatsTop,
        windowHeight
      ),
    };
  }, [windowHeight, measuredBottomNavHeight]);
}

// re-export for consumers that need the reference constant
export { SHEET_REFERENCE_SCREEN_HEIGHT };
