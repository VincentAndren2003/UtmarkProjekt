import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'celebrated_badge_ids_v1';

async function readAll(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
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
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...ids, badgeId]));
}
