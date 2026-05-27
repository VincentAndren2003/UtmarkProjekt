/** Screen point at the geographic center of the map for the given mapPadding. */
export function mapVisualCenterPoint(
  windowWidth: number,
  windowHeight: number,
  topInset: number,
  bottomPadding: number
): { x: number; y: number } {
  return {
    x: windowWidth / 2,
    y: topInset + (windowHeight - topInset - bottomPadding) / 2,
  };
}
