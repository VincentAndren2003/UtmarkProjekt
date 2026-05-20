import { TrackPoint } from '../lib/api';

export function trackPointsToPolyline(points: TrackPoint[] | undefined) {
  if (!points?.length) return [];
  return points.map((p) => ({
    latitude: p.lat,
    longitude: p.long,
  }));
}

/** Reduce point count for large tracks before sending to API. */
export function simplifyTrackPoints(
  points: TrackPoint[],
  maxPoints = 2000
): TrackPoint[] {
  if (points.length <= maxPoints) return points;
  const step = Math.ceil(points.length / maxPoints);
  const simplified: TrackPoint[] = [];
  for (let i = 0; i < points.length; i += step) {
    simplified.push(points[i]);
  }
  const last = points[points.length - 1];
  if (simplified[simplified.length - 1] !== last) {
    simplified.push(last);
  }
  return simplified;
}
