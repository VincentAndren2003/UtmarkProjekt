import { useCallback, useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

import { SHEET_REFERENCE_SCREEN_HEIGHT } from '../sheetLayout';

export function useSheetScale() {
  const { height: windowHeight } = useWindowDimensions();

  const scale = useCallback(
    (value: number) =>
      Math.round(value * (windowHeight / SHEET_REFERENCE_SCREEN_HEIGHT)),
    [windowHeight]
  );

  return useMemo(() => ({ scale, windowHeight }), [scale, windowHeight]);
}
