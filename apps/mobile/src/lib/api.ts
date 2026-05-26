import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../config/env';
import { Checkpoint, Coordinate, RouteResponse } from '../types/route';

const TOKEN_KEY = 'auth_token';

const tokenStorage = {
  get: () => SecureStore.getItemAsync(TOKEN_KEY),
  set: (token: string) => SecureStore.setItemAsync(TOKEN_KEY, token),
  clear: () => SecureStore.deleteItemAsync(TOKEN_KEY),
};

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  auth?: boolean;
};

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  // Always send JSON.
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (opts.auth) {
    const token = await tokenStorage.get();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_URL}${path}`, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && 'error' in data
        ? String((data as { error: unknown }).error)
        : null) ?? `HTTP ${res.status}`;
    throw new Error(message);
  }

  return data as T;
}

//— what screens get back from auth/profile calls.
export type AuthUser = { id: string; email: string };
export type AuthResponse = { token: string; user: AuthUser };
export type Gender = 'male' | 'female' | 'other';

export type ProfileInput = {
  username: string;
  fullName: string;
  age: number;
  gender: Gender;
};

export type Profile = ProfileInput & {
  _id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  avatarUrl: string | null;
};

// Auth functions

export async function signup(
  email: string,
  password: string
): Promise<AuthResponse> {
  const result = await request<AuthResponse>('/api/auth/signup', {
    method: 'POST',
    body: { email, password },
  });
  await tokenStorage.set(result.token);
  const { clearCelebratedBadgeUserCache } =
    await import('../services/celebratedBadgesStorage');
  clearCelebratedBadgeUserCache();
  return result;
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const result = await request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  await tokenStorage.set(result.token);
  const { clearCelebratedBadgeUserCache } =
    await import('../services/celebratedBadgesStorage');
  clearCelebratedBadgeUserCache();
  return result;
}

export async function signOut(): Promise<void> {
  const { clearCelebratedBadgeUserCache } =
    await import('../services/celebratedBadgesStorage');
  clearCelebratedBadgeUserCache();
  await tokenStorage.clear();
}

export async function deleteMyAccount(): Promise<void> {
  await request('/api/profile/me', { method: 'DELETE', auth: true });
  await request('/api/auth/me', { method: 'DELETE', auth: true });
  const { clearCelebratedBadgeUserCache } =
    await import('../services/celebratedBadgesStorage');
  clearCelebratedBadgeUserCache();
  await tokenStorage.clear();
}

// Profile functions (protected — auth: true sends the JWT)

export function getMyProfile(): Promise<Profile> {
  return request<Profile>('/api/profile/me', { auth: true });
}

export function saveMyProfile(input: ProfileInput): Promise<Profile> {
  return request<Profile>('/api/profile/me', {
    method: 'PUT',
    body: input,
    auth: true,
  });
}

export function uploadAvatar(base64: string): Promise<Profile> {
  return request<Profile>('/api/profile/me/avatar', {
    method: 'POST',
    body: { base64 },
    auth: true,
  });
}

export async function generateRoute(
  start: Coordinate,
  distance: number,
  end?: Coordinate
): Promise<RouteResponse> {
  return request<RouteResponse>('/api/routes/generate-route', {
    method: 'POST',
    body: {
      id: `route-${Date.now()}`,
      start,
      distance,
      ...(end ? { end } : {}),
    },
    auth: false, // true if login requerd
  });
}

// -----------------------------------------------------------------------------
// 6. Friends (protected — kräver inloggning)
// -----------------------------------------------------------------------------

// Profil för en vän, plus när vänskapen accepterades (från GET /api/friends).
export type Friend = Profile & {
  friendsSince?: string;
};

// Hämtar alla accepterade vänner för den inloggade användaren.
// Backend: GET /api/friends — returnerar profilfält + friendsSince (ISO-datum).
export function getFriends(): Promise<Friend[]> {
  return request<Friend[]>('/api/friends', { auth: true });
}

// Antal accepterade vänner (används på profilskärmen).
export function getFriendCount(): Promise<{ count: number }> {
  return request<{ count: number }>('/api/friends/count', { auth: true });
}

// Inkommande vänförfrågningar (profiler som skickat förfrågan till dig).
// Backend: GET /api/friends/pending
export function getPendingFriendRequests(): Promise<Friend[]> {
  return request<Friend[]>('/api/friends/pending', { auth: true });
}

// Accepterar en inkommande förfrågan.
// Backend: POST /api/friends/accept/:requesterId
export function acceptFriendRequest(
  requesterId: string
): Promise<{ message: string }> {
  return request<{ message: string }>(`/api/friends/accept/${requesterId}`, {
    method: 'POST',
    auth: true,
  });
}

// Tar bort en vän eller avbryter en väntande förfrågan.
// Backend: DELETE /api/friends/:friendId
export function removeFriend(friendId: string): Promise<{ message: string }> {
  return request<{ message: string }>(`/api/friends/${friendId}`, {
    method: 'DELETE',
    auth: true,
  });
}

// Personsök — mobilen är redo; backend-teamet ska implementera endpointen.
// Förväntat: GET /api/profile/search?q= (minst 2 tecken, returnerar Profile[]).
export function searchProfiles(query: string): Promise<Profile[]> {
  const q = encodeURIComponent(query.trim());
  return request<Profile[]>(`/api/profile/search?q=${q}`, { auth: true });
}

// Skickar vänförfrågan till en användare.
// Backend: POST /api/friends/request/:friendId
export function sendFriendRequest(
  friendId: string
): Promise<{ message: string }> {
  return request<{ message: string }>(`/api/friends/request/${friendId}`, {
    method: 'POST',
    auth: true,
  });
}

// Sök användare att skicka vänförfrågan till.
export function searchUsers(query: string): Promise<Profile[]> {
  return request<Profile[]>(
    `/api/friends/search?query=${encodeURIComponent(query)}`,
    {
      auth: true,
    }
  );
}

// Persisted routes + runs (gateway -> routes-service)

export type SavedRouteRecord = {
  _id: string;
  start: Coordinate;
  distance: number;
  checkpoints: Checkpoint[];
  filters?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type TrackPoint = {
  lat: number;
  long: number;
  timeStamp: number;
};

export type RunRecord = {
  _id: string;
  route: string | SavedRouteRecord;
  status: 'in_progress' | 'completed' | 'abandoned';
  startedAt?: string;
  finishedAt?: string;
  durationSeconds?: number;
  checkpointsCompleted?: number;
  distanceMeters?: number;
  trackPoints?: TrackPoint[];
  createdAt?: string;
  updatedAt?: string;
};

export type CompleteRunInput = {
  durationSeconds?: number;
  checkpointsCompleted?: number;
  distanceMeters?: number;
  trackPoints?: TrackPoint[];
  status?: 'completed' | 'abandoned';
};

// Route challenges (gateway -> routes-service)

export type RouteChallengeRecord = {
  _id: string;
  route: SavedRouteRecord;
  fromUserId: string;
  toUserId: string;
  sourceRun?: RunRecord;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
};

export type CreateChallengeInput = {
  friendId: string;
  routeId: string;
  sourceRunId?: string;
};

export function createRouteChallenge(
  body: CreateChallengeInput
): Promise<RouteChallengeRecord> {
  return request<RouteChallengeRecord>('/api/challenges', {
    method: 'POST',
    body,
    auth: true,
  });
}

export function getMyRouteChallenges(): Promise<RouteChallengeRecord[]> {
  return request<RouteChallengeRecord[]>('/api/challenges/me', { auth: true });
}

export function getRouteRecord(id: string): Promise<SavedRouteRecord> {
  return request<SavedRouteRecord>(
    `/api/route-records/${encodeURIComponent(id)}`,
    { auth: true }
  );
}

/** Persist generated route. Requires login. */
export function savePersistedRoute(
  route: RouteResponse
): Promise<SavedRouteRecord> {
  return request<SavedRouteRecord>('/api/route-records', {
    method: 'POST',
    auth: true,
    body: {
      start: route.start,
      distance: route.distance,
      checkpoints: route.checkpoints.map(({ id, coordinate, radius }) => ({
        id,
        coordinate,
        radius,
      })),
      filters: [],
    },
  });
}

export function startRun(routeId: string): Promise<RunRecord> {
  return request<RunRecord>('/api/runs', {
    method: 'POST',
    auth: true,
    body: { routeId },
  });
}

export function completeRun(
  runId: string,
  body: CompleteRunInput = {}
): Promise<RunRecord> {
  return request<RunRecord>(`/api/runs/${encodeURIComponent(runId)}/complete`, {
    method: 'PATCH',
    auth: true,
    body,
  });
}

export function getMyRuns(status?: RunRecord['status']): Promise<RunRecord[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  return request<RunRecord[]>(`/api/runs/me${qs}`, { auth: true });
}

export type UserStats = {
  _id: string;
  userId: string;
  routesGeneratedCount: number;
  routesSharedCount: number;
  routesRecievedCount: number;
  completedRunsCount: number;
  maxRunDistanceCompleted: number;
  totalDistanceMeters: number;
  dayStreakOfCompletedRuns: number;
  lastRunCompletedAt: string | null;
  totalCheckpointsTaken: number;
  createdAt: string;
  updatedAt: string;
};

export type CompleteRunStatsInput = {
  generatedRouteDistanceMeters: number;
  actualRunDistanceMeters: number;
  checkpointsTakenCount: number;
};

export function getMyStats(): Promise<UserStats> {
  return request<UserStats>('/api/stats/me', { auth: true });
}

export function completeRunStats(
  body: CompleteRunStatsInput
): Promise<UserStats> {
  return request<UserStats>('/api/stats/complete-run', {
    method: 'POST',
    auth: true,
    body,
  });
}

export function incrementSharedStats(): Promise<UserStats> {
  return request<UserStats>('/api/stats/increment-shared', {
    method: 'POST',
    auth: true,
  });
}

export function incrementRecievedStats(): Promise<UserStats> {
  return request<UserStats>('/api/stats/increment-recieved', {
    method: 'POST',
    auth: true,
  });
}

export function incrementGeneratedStats(): Promise<UserStats> {
  return request<UserStats>('/api/stats/increment-generated', {
    method: 'POST',
    auth: true,
  });
}
