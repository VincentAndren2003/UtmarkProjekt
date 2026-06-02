import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMyProfile } from '../lib/api';

const STORAGE_KEY_PREFIX = 'celebrated_badge_ids_v1_';

let cachedUserId: string | null = null;

export function clearCelebratedBadgeUserCache(): void {
  cachedUserId = null;
}

async function resolveStorageKey(): Promise<string | null> {
  if (!cachedUserId) {
    try {
      const profile = await getMyProfile();
      cachedUserId = profile.userId;
    } catch {
      return null;
    }
  }
  return `${STORAGE_KEY_PREFIX}${cachedUserId}`;
}

async function readAll(): Promise<string[]> {
  const key = await resolveStorageKey();
  if (!key) return [];
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function getCelebratedBadgeIds(): Promise<Set<string>> {
  const ids = await readAll();
  return new Set(ids);
}

export async function markBadgeCelebrated(badgeId: string): Promise<void> {
  const ids = await readAll();
  if (ids.includes(badgeId)) return;
  const key = await resolveStorageKey();
  if (!key) return;
  await AsyncStorage.setItem(key, JSON.stringify([...ids, badgeId]));
}

export async function markBadgesCelebrated(
  badgeIds: readonly string[]
): Promise<void> {
  if (badgeIds.length === 0) return;
  const key = await resolveStorageKey();
  if (!key) return;
  const ids = await readAll();
  const merged = [...ids];
  let changed = false;
  for (const id of badgeIds) {
    if (!merged.includes(id)) {
      merged.push(id);
      changed = true;
    }
  }
  if (changed) {
    await AsyncStorage.setItem(key, JSON.stringify(merged));
  }
}
