import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SavedRouteRecord } from '../lib/api';

const STORAGE_KEY = 'favorite_routes_v1';

/** Sparad rutt + visningsnamn (namn lagras lokalt tills backend stödjer det). */
export type FavoriteRoute = {
  displayName: string;
  route: SavedRouteRecord;
  /** När rutten lades till i favoriter (lokal tidpunkt). */
  favoritedAt: string;
};

type StoredFavorites = FavoriteRoute[];

async function readAll(): Promise<StoredFavorites> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as StoredFavorites;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAll(items: StoredFavorites): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export async function getFavoriteRoutes(): Promise<FavoriteRoute[]> {
  const items = await readAll();
  return items.sort(
    (a, b) =>
      new Date(b.favoritedAt).getTime() - new Date(a.favoritedAt).getTime()
  );
}

export async function isRouteFavorited(routeId: string): Promise<boolean> {
  const items = await readAll();
  return items.some((f) => f.route._id === routeId);
}

export async function addFavoriteRoute(
  route: SavedRouteRecord,
  displayName: string
): Promise<FavoriteRoute> {
  const items = await readAll();
  const trimmed = displayName.trim() || 'Min rutt';
  const existingIndex = items.findIndex((f) => f.route._id === route._id);
  const entry: FavoriteRoute = {
    displayName: trimmed,
    route,
    favoritedAt: new Date().toISOString(),
  };
  if (existingIndex >= 0) {
    items[existingIndex] = entry;
  } else {
    items.unshift(entry);
  }
  await writeAll(items);
  return entry;
}

export async function updateFavoriteName(
  routeId: string,
  displayName: string
): Promise<void> {
  const trimmed = displayName.trim();
  if (!trimmed) return;
  const items = await readAll();
  const index = items.findIndex((f) => f.route._id === routeId);
  if (index < 0) return;
  items[index] = { ...items[index], displayName: trimmed };
  await writeAll(items);
}

export async function removeFavoriteRoute(routeId: string): Promise<void> {
  const items = await readAll();
  await writeAll(items.filter((f) => f.route._id !== routeId));
}

export function formatFavoriteMeta(
  favoritedAt: string,
  distanceKm: number
): string {
  const label = formatRelativeTimeSv(favoritedAt);
  return `${label}, ${distanceKm} km`;
}

function formatRelativeTimeSv(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Idag';
  if (diffDays === 1) return 'Igår';
  if (diffDays < 7) return `För ${diffDays} dagar sedan`;

  const weeks = Math.floor(diffDays / 7);
  if (weeks === 1) return 'För 1 vecka sedan';
  if (weeks < 5) return `För ${weeks} veckor sedan`;

  const months = Math.floor(diffDays / 30);
  if (months === 1) return 'För 1 månad sedan';
  return `För ${months} månader sedan`;
}
