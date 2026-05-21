import type { UserStats } from '../lib/api';
import { BADGES, Badge } from '../data/badges';

/** 1 svensk mil = 10 km, 2 mil = 20 km. */
export const ONE_MIL_METERS = 10_000;
export const TWO_MIL_METERS = 20_000;

/** Completed-run count milestones: unlock when count >= min, celebrate when count equals min. */
const RUN_COMPLETION_MILESTONES = [
  { minCompletedRuns: 1, id: 'ny-utforskare' },
  { minCompletedRuns: 10, id: 'aventyrare' },
  { minCompletedRuns: 25, id: 'skogsmastare' },
  { minCompletedRuns: 100, id: 'legend' },
] as const;

/** Planned route distance milestones (maxRunDistanceCompleted in meters). */
const DISTANCE_MILESTONES = [
  { minMeters: ONE_MIL_METERS, id: 'milen' },
  { minMeters: TWO_MIL_METERS, id: 'halvmaran' },
] as const;

/** Cumulative actual distance milestones (totalDistanceMeters). */
const TOTAL_DISTANCE_MILESTONES = [
  { minMeters: 100_000, id: 'hundra-km' },
  { minMeters: 1_000_000, id: 'tusenkilometaren' },
] as const;

/** Day streak milestones (dayStreakOfCompletedRuns). */
const STREAK_MILESTONES = [{ exactStreak: 3, id: 'tre-i-rad' }] as const;

/** Cumulative checkpoints taken (totalCheckpointsTaken). */
const TOTAL_CHECKPOINTS_MILESTONES = [
  { minCount: 100, id: 'hundra-kontroller' },
] as const;

function pushUnique(ids: string[], id: string | undefined): void {
  if (id && !ids.includes(id)) ids.push(id);
}

function pushAllUnique(ids: string[], more: string[]): void {
  for (const id of more) pushUnique(ids, id);
}

/** Badge IDs unlocked from current user stats (extend as more rules are added). */
export function getUnlockedBadgeIds(stats: UserStats | null): string[] {
  if (!stats) return [];

  const ids: string[] = [];

  if ((stats.routesGeneratedCount ?? 0) >= 1) {
    ids.push('forsta-rutten');
  }

  for (const { minCompletedRuns, id } of RUN_COMPLETION_MILESTONES) {
    if (stats.completedRunsCount >= minCompletedRuns) {
      ids.push(id);
    }
  }

  for (const { minMeters, id } of DISTANCE_MILESTONES) {
    if (stats.maxRunDistanceCompleted >= minMeters) {
      ids.push(id);
    }
  }

  for (const { minMeters, id } of TOTAL_DISTANCE_MILESTONES) {
    if (stats.totalDistanceMeters >= minMeters) {
      ids.push(id);
    }
  }

  for (const { exactStreak, id } of STREAK_MILESTONES) {
    if (stats.dayStreakOfCompletedRuns >= exactStreak) {
      ids.push(id);
    }
  }

  for (const { minCount, id } of TOTAL_CHECKPOINTS_MILESTONES) {
    if (stats.totalCheckpointsTaken >= minCount) {
      ids.push(id);
    }
  }

  return ids;
}

function getRunCountCelebrationBadgeId(
  stats: UserStats,
  celebratedIds: ReadonlySet<string>
): string | undefined {
  const milestone = RUN_COMPLETION_MILESTONES.find(
    (m) => m.minCompletedRuns === stats.completedRunsCount
  );
  if (!milestone || celebratedIds.has(milestone.id)) return undefined;
  return getUnlockedBadgeIds(stats).includes(milestone.id)
    ? milestone.id
    : undefined;
}

function getDistanceCelebrationBadgeIds(
  stats: UserStats,
  celebratedIds: ReadonlySet<string>,
  completedRouteDistanceKm: number
): string[] {
  const completedMeters = completedRouteDistanceKm * 1000;
  const unlocked = getUnlockedBadgeIds(stats);
  const ids: string[] = [];

  for (const milestone of DISTANCE_MILESTONES) {
    if (
      completedMeters >= milestone.minMeters &&
      stats.maxRunDistanceCompleted >= milestone.minMeters &&
      !celebratedIds.has(milestone.id) &&
      unlocked.includes(milestone.id)
    ) {
      ids.push(milestone.id);
    }
  }

  return ids;
}

function getTotalDistanceCelebrationBadgeIds(
  stats: UserStats,
  celebratedIds: ReadonlySet<string>,
  previousTotalMeters: number
): string[] {
  const unlocked = getUnlockedBadgeIds(stats);
  const ids: string[] = [];

  for (const milestone of TOTAL_DISTANCE_MILESTONES) {
    if (
      previousTotalMeters < milestone.minMeters &&
      stats.totalDistanceMeters >= milestone.minMeters &&
      !celebratedIds.has(milestone.id) &&
      unlocked.includes(milestone.id)
    ) {
      ids.push(milestone.id);
    }
  }

  return ids;
}

function getStreakCelebrationBadgeId(
  stats: UserStats,
  celebratedIds: ReadonlySet<string>
): string | undefined {
  const milestone = STREAK_MILESTONES.find(
    (m) => m.exactStreak === stats.dayStreakOfCompletedRuns
  );
  if (!milestone || celebratedIds.has(milestone.id)) return undefined;
  return getUnlockedBadgeIds(stats).includes(milestone.id)
    ? milestone.id
    : undefined;
}

function getTotalCheckpointsCelebrationBadgeIds(
  stats: UserStats,
  celebratedIds: ReadonlySet<string>,
  previousTotalCheckpoints: number
): string[] {
  const unlocked = getUnlockedBadgeIds(stats);
  const ids: string[] = [];

  for (const milestone of TOTAL_CHECKPOINTS_MILESTONES) {
    if (
      previousTotalCheckpoints < milestone.minCount &&
      stats.totalCheckpointsTaken >= milestone.minCount &&
      !celebratedIds.has(milestone.id) &&
      unlocked.includes(milestone.id)
    ) {
      ids.push(milestone.id);
    }
  }

  return ids;
}

/** All badges to celebrate on RouteCompleted for this run, in display order. */
export function getRunCompletionCelebrationBadgeIds(
  stats: UserStats,
  celebratedIds: ReadonlySet<string>,
  completedRouteDistanceKm: number,
  previousTotalDistanceMeters: number,
  previousTotalCheckpoints: number
): string[] {
  const ids: string[] = [];
  pushUnique(ids, getRunCountCelebrationBadgeId(stats, celebratedIds));
  pushUnique(ids, getStreakCelebrationBadgeId(stats, celebratedIds));
  pushAllUnique(
    ids,
    getDistanceCelebrationBadgeIds(
      stats,
      celebratedIds,
      completedRouteDistanceKm
    )
  );
  pushAllUnique(
    ids,
    getTotalDistanceCelebrationBadgeIds(
      stats,
      celebratedIds,
      previousTotalDistanceMeters
    )
  );
  pushAllUnique(
    ids,
    getTotalCheckpointsCelebrationBadgeIds(
      stats,
      celebratedIds,
      previousTotalCheckpoints
    )
  );
  return ids;
}

export function getBadgeById(id: string): Badge | undefined {
  return BADGES.find((b) => b.id === id);
}

export function getBadgesFromIds(ids: readonly string[]): Badge[] {
  return ids
    .map((id) => getBadgeById(id))
    .filter((b): b is Badge => b !== undefined);
}

/** IDs that are newly unlocked and have not been celebrated with the popup yet. */
export function getNewUnlockIds(
  stats: UserStats,
  celebratedIds: ReadonlySet<string>
): string[] {
  return getUnlockedBadgeIds(stats).filter((id) => !celebratedIds.has(id));
}

/** Badges to celebrate after generating a route (first generation → Första rutten). */
export function getRouteGeneratedCelebrationBadgeIds(
  stats: UserStats,
  celebratedIds: ReadonlySet<string>,
  previousRoutesGeneratedCount: number
): string[] {
  const ids: string[] = [];
  const prev = previousRoutesGeneratedCount ?? 0;
  const next = stats.routesGeneratedCount ?? 0;
  if (
    prev < 1 &&
    next >= 1 &&
    !celebratedIds.has('forsta-rutten') &&
    getUnlockedBadgeIds(stats).includes('forsta-rutten')
  ) {
    ids.push('forsta-rutten');
  }
  return ids;
}
