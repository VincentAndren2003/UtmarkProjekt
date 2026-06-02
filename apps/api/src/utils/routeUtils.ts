export function normalizeDistance(distance: unknown): number {
  return Math.max(1, Math.min(30, Number(distance) || 1));
}
