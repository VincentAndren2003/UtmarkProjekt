//   screens/  -->  lib/api.ts   (everything network-related is here)
// What's in this file:
//   1. tokenStorage        — wraps expo-secure-store (save/get/clear the JWT)
//   2. request<T>()        — internal fetch helper (private, only used here)
//   3. signup / login / signOut          — auth functions used by screens
//   4. getMyProfile / saveMyProfile      — profile functions used by screens

import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../config/env';
import { Coordinate, RouteResponse } from '../types/route';

// -----------------------------------------------------------------------------
// 1. Token storage
// -----------------------------------------------------------------------------
// We need to keep the JWT somewhere safe across app restarts. expo-secure-store
// puts it in the device keychain (iOS) / keystore (Android). Way safer than
// AsyncStorage for sensitive stuff like auth tokens.
const TOKEN_KEY = 'auth_token';

const tokenStorage = {
  get: () => SecureStore.getItemAsync(TOKEN_KEY),
  set: (token: string) => SecureStore.setItemAsync(TOKEN_KEY, token),
  clear: () => SecureStore.deleteItemAsync(TOKEN_KEY),
};

// -----------------------------------------------------------------------------
// 2. Generic request helper (private — used internally by the named
//    functions below, NOT exported; screens never call this directly).
// -----------------------------------------------------------------------------
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

  // If this endpoint requires auth, attach the JWT we saved at signup/login.
  // The backend's authMiddleware checks for "Authorization: Bearer <token>".
  if (opts.auth) {
    const token = await tokenStorage.get();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  // The actual HTTP call. API_URL comes from config/env.ts
  const res = await fetch(`${API_URL}${path}`, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  // Try to parse the response body as JSON. If parsing fails (e.g. empty
  // body), fall back to {} so the rest of the function doesn't crash.
  const data = await res.json().catch(() => ({}));

  // res.ok is true for status 200-299, false for 4xx/5xx.
  // On error, throw with the server's error message so screens can show it.
  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && 'error' in data
        ? String((data as { error: unknown }).error)
        : null) ?? `HTTP ${res.status}`;
    throw new Error(message);
  }

  return data as T;
}

// -----------------------------------------------------------------------------
// 3. Public types — what screens get back from auth/profile calls.
// -----------------------------------------------------------------------------
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
};

// -----------------------------------------------------------------------------
// 4. Auth functions
// -----------------------------------------------------------------------------

// Create a new account.
// Hits POST /api/auth/signup, then automatically saves the returned JWT so
// future protected requests work. Throws if the email is already taken.
export async function signup(
  email: string,
  password: string
): Promise<AuthResponse> {
  const result = await request<AuthResponse>('/api/auth/signup', {
    method: 'POST',
    body: { email, password },
  });
  await tokenStorage.set(result.token);
  return result;
}

// Log in to an existing account.
// Same as signup but hits POST /api/auth/login. Throws on bad credentials.
export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const result = await request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  await tokenStorage.set(result.token);
  return result;
}

// Forget the JWT so the app behaves as logged out.
// (No backend call needed — JWTs are stateless; we just throw ours away.)
export async function signOut(): Promise<void> {
  await tokenStorage.clear();
}

// -----------------------------------------------------------------------------
// 5. Profile functions (protected — auth: true sends the JWT)
// -----------------------------------------------------------------------------

// Fetch the logged-in user's profile.
// Backend returns 404 if they haven't created one yet — request() will throw
// in that case, so the caller can use try/catch to detect "no profile yet".
export function getMyProfile(): Promise<Profile> {
  return request<Profile>('/api/profile/me', { auth: true });
}

// Create or update the logged-in user's profile in one call ("upsert").
// PUT, not POST, so calling it twice with the same body has the same effect
// as calling it once (no duplicate profiles).
export function saveMyProfile(input: ProfileInput): Promise<Profile> {
  return request<Profile>('/api/profile/me', {
    method: 'PUT',
    body: input,
    auth: true,
  });
}

export async function generateRoute(
  start: Coordinate,
  distance: number
): Promise<RouteResponse> {
  return request<RouteResponse>('/api/routes/generate-route', {
    method: 'POST',
    body: {
      id: `route-${Date.now()}`,
      start,
      distance,
    },
    auth: false, // true if login requerd
  });
}
