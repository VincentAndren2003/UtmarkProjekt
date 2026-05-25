import { useCallback, useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

import { SHEET_REFERENCE_SCREEN_HEIGHT } from '../sheetLayout';

/** Scales layout values from the iPhone 17 reference height to the current screen. */
export function useSheetScale() {
  const { height: windowHeight } = useWindowDimensions();

  const scale = useCallback(
    (value: number) =>
      Math.round(value * (windowHeight / SHEET_REFERENCE_SCREEN_HEIGHT)),
    [windowHeight]
  );

  return useMemo(() => ({ scale, windowHeight }), [scale, windowHeight]);
}
