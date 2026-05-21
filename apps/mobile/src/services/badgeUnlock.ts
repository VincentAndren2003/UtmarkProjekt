import type { UserStats } from '../lib/api';
import { BADGES, Badge } from '../data/badges';

/** Badge IDs unlocked from current user stats (extend as more rules are added). */
export function getUnlockedBadgeIds(stats: UserStats | null): string[] {
  if (!stats) return [];

  const ids: string[] = [];

  if (stats.routesGeneratedCount >= 1) {
    ids.push('forsta-rutten');
  }

  return ids;
}

export function getBadgeById(id: string): Badge | undefined {
  return BADGES.find((b) => b.id === id);
}

/** IDs that are newly unlocked and have not been celebrated with the popup yet. */
export function getNewUnlockIds(
  stats: UserStats,
  celebratedIds: ReadonlySet<string>
): string[] {
  return getUnlockedBadgeIds(stats).filter((id) => !celebratedIds.has(id));
}
