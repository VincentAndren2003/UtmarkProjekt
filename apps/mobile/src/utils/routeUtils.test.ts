import { describe, expect, test } from 'vitest';
import {
  challengeTargetLabel,
  formatDurationClock,
  savedRouteToRouteResponse,
} from './routeUtils';

describe('formatDurationClock', () => {
  test('formaterar minuter och sekunder', () => {
    expect(formatDurationClock(125)).toBe('2:05');
    expect(formatDurationClock(0)).toBe('0:00');
  });

  test('returnerar streck för ogiltiga värden', () => {
    expect(formatDurationClock(undefined)).toBe('—');
    expect(formatDurationClock(-1)).toBe('—');
  });
});

describe('challengeTargetLabel', () => {
  test('visar tid att slå när sekunder finns', () => {
    expect(challengeTargetLabel(90)).toBe('Tid att slå: 1:30');
  });

  test('visar fallback utan måltid', () => {
    expect(challengeTargetLabel(undefined)).toContain('ingen måltid');
  });
});

describe('savedRouteToRouteResponse', () => {
  test('mappar sparad rutt till RouteResponse', () => {
    const result = savedRouteToRouteResponse({
      _id: 'route-1',
      start: { latitude: 59.3, longitude: 18.0 },
      distance: 5,
      checkpoints: [
        {
          id: 'cp-1',
          coordinate: { latitude: 59.31, longitude: 18.01 },
        },
      ],
    });

    expect(result.id).toBe('route-1');
    expect(result.distance).toBe(5);
    expect(result.checkpoints[0].radius).toBe(20);
    expect(result.checkpoints[0].completed).toBe(false);
  });
});
