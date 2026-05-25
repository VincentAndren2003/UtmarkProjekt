import { SavedRouteRecord } from '../lib/api';
import { RouteResponse } from '../types/route';

export function savedRouteToRouteResponse(
  route: SavedRouteRecord
): RouteResponse {
  return {
    id: route._id,
    start: route.start,
    distance: route.distance,
    checkpoints: route.checkpoints.map((cp) => ({
      id: cp.id,
      coordinate: cp.coordinate,
      radius: cp.radius ?? 20,
      completed: false,
    })),
  };
}

export function formatDurationClock(seconds?: number): string {
  if (seconds == null || seconds < 0) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
