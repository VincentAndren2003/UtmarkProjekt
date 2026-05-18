export function normalizeDistance(distance: unknown): number {
  return Math.max(1, Math.min(30, Number(distance) || 1));
}

export function normalizeFilters(filters: unknown): string[] {
  return Array.isArray(filters)
    ? filters.filter((f): f is string => typeof f === 'string')
    : [];
}
