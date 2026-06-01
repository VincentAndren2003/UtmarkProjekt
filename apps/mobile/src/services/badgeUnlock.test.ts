import { describe, expect, test, vi } from 'vitest';

vi.mock('../data/badges', () => ({
  BADGES: [],
}));

import { getUnlockedBadgeIds } from './badgeUnlock';
import type { UserStats } from '../lib/api';

function stats(overrides: Partial<UserStats>): UserStats {
  return {
    routesGeneratedCount: 0,
    routesSharedCount: 0,
    routesRecievedCount: 0,
    completedRunsCount: 0,
    maxRunDistanceCompleted: 0,
    totalDistanceMeters: 0,
    dayStreakOfCompletedRuns: 0,
    totalCheckpointsTaken: 0,
    ...overrides,
  };
}

describe('getUnlockedBadgeIds', () => {
  test('returnerar tom lista utan stats', () => {
    expect(getUnlockedBadgeIds(null)).toEqual([]);
  });

  test('låser upp första-rutten vid genererad rutt', () => {
    const ids = getUnlockedBadgeIds(stats({ routesGeneratedCount: 1 }));
    expect(ids).toContain('forsta-rutten');
  });

  test('låser upp ny-utforskare efter första avklarade run', () => {
    const ids = getUnlockedBadgeIds(stats({ completedRunsCount: 1 }));
    expect(ids).toContain('ny-utforskare');
  });

  test('låser upp tre-i-rad vid streak 3', () => {
    const ids = getUnlockedBadgeIds(
      stats({ dayStreakOfCompletedRuns: 3 })
    );
    expect(ids).toContain('tre-i-rad');
  });
});
