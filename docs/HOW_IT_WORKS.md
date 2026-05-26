# How Utmark Works — A Complete Walkthrough

This document explains the entire codebase: folder structure, how a request flows through every layer, why things are built the way they are, and where to find anything. 

---



The stack has six pieces:

1. **Mobile app** (Expo / React Native) — what the user actually taps.
2. **API Gateway** (Express + Node.js + TypeScript, port `3000`) — the single public HTTP entry-point the phone calls.
3. **auth-service** (port `3001`) — user accounts, password hashing, JWT issuance.
4. **profile-service** (port `3002`) — user profiles + gamification stats.
5. **routes-service** (port `3003`) — saved routes, active runs, route challenges.
6. **friend-service** (port `3004`) — friend requests, acceptance, lists.

All four internal services talk to the **same MongoDB instance** (different collections). The phone never touches MongoDB — it only talks to the gateway.

Authentication uses **JWT**: the phone stores a signed token and sends it on every protected request.

---

## 1. The Big Picture

```
┌────────────────┐     HTTP/JSON      ┌─────────────────────────────────────────┐
│  Mobile App    │ ─────────────────► │           API Gateway  :3000            │
│  (Expo / RN)   │ ◄───────────────── │           apps/api                      │
└────────────────┘                    └───────────┬──────────────────────────────┘
    apps/mobile                                   │  internal HTTP (localhost)
                                    ┌─────────────┼─────────────────────────┐
                                    ▼             ▼             ▼            ▼
                             :3001           :3002          :3003         :3004
                          auth-service  profile-service  routes-service  friend-service
                                    │             │             │            │
                                    └─────────────┴─────────────┴────────────┘
                                                          │
                                                          ▼
                                                      MongoDB
                                              (utmarkprojekt database)
```

Key points:
- The **gateway** is the only service the phone ever knows about.
- The **gateway** verifies JWTs and proxies requests — it has no database connection of its own.
- Internal services trust the `x-user-id` header the gateway adds after verifying the token (they never see the raw JWT).
- Route **generation** and **green area lookup** (Overpass API) happen directly inside the gateway.

---

## 2. Folder Tour

### Monorepo root

```
apps/
  api/               ← API Gateway
  auth-service/      ← accounts + auth
  profile-service/   ← profiles + stats
  routes-service/    ← routes, runs, challenges
  friend-service/    ← friends
  mobile/            ← Expo app
packages/
  types/             ← shared TypeScript types (defined, not yet imported everywhere)
docs/                ← you are here
.github/workflows/   ← CI (format, lint, test)
ecosystem.api.config.js        ← PM2: gateway
ecosystem.services.config.js   ← PM2: all four internal services
```

### Gateway — `apps/api/src/`

```
app.ts              ← ALL gateway routes live here (the menu)
server.ts           ← bootstraps Express, connects nothing (gateway has no DB)
config/env.ts       ← reads .env: PORT, JWT_SECRET, service URLs, CORS_ORIGIN
middleware/
  authMiddleware.ts ← verifies JWT Bearer token → req.userId
  errorHandler.ts   ← turns thrown errors into clean { error } JSON
controllers/
  routeController.ts    ← generateRouteController (checkpoint placement logic)
  greenAreaController.ts ← listGreenAreas (calls Overpass)
services/
  GreenAreaService.ts   ← Overpass API wrapper
utils/jwt.ts        ← signToken / verifyToken helpers
routes/routeRouter.ts   ← legacy, not wired in (safe to ignore)
```

### Internal services — each follows the same shape

```
apps/<service>/src/
  app.ts              ← Express app + routes
  server.ts           ← listens on its port
  config/db.ts        ← Mongoose connect
  config/env.ts       ← reads .env
  models/             ← Mongoose schemas
  controllers/        ← request handlers
  middleware/
    gatewayAuthMiddleware.ts  ← trusts x-user-id header (no JWT verify needed)
    errorHandler.ts
```

### Mobile — `apps/mobile/src/`

```
config/env.ts         ← reads EXPO_PUBLIC_API_URL
lib/api.ts            ← THE file. Every API call + JWT storage lives here.
screens/              ← one file per screen (see section 4)
components/           ← shared UI (map layers, bottom sheets, modals, nav bar)
hooks/                ← useTracking, useUserLocation, useUserBadges, …
services/
  LocationService.ts  ← GPS track-point accumulator during a run
data/badges.ts        ← badge definitions
services/badgeUnlock.ts ← client-side badge unlock logic
storage/              ← AsyncStorage wrappers (favorites, celebrated badges)
context/BadgeCelebrationContext.tsx ← global badge-unlock modal state
types/navigation.ts   ← RootStackParamList (also declared in App.tsx)
```

---

## 3. Complete API Map

### Gateway endpoints (`apps/api/src/app.ts`)

| Method | Path | Auth | What it does |
|--------|------|------|--------------|
| GET | `/api/health` | Public | `{ status: 'ok' }` |
| POST | `/api/auth/signup` | Public | Proxy → auth-service |
| POST | `/api/auth/login` | Public | Proxy → auth-service |
| GET | `/api/profile/me` | JWT | Proxy → profile-service + `x-user-id` |
| PUT | `/api/profile/me` | JWT | Proxy → profile-service |
| GET | `/api/stats/me` | JWT | Proxy → profile-service |
| POST | `/api/stats/complete-run` | JWT | Proxy → profile-service |
| POST | `/api/stats/increment-generated` | JWT | Proxy → profile-service |
| POST | `/api/stats/increment-shared` | JWT | Proxy → profile-service |
| POST | `/api/stats/increment-recieved` | JWT | Proxy → profile-service |
| POST | `/api/route-records` | JWT | Proxy → routes-service `POST /routes` |
| GET | `/api/route-records/:id` | JWT | Proxy → routes-service `GET /routes/:id` |
| POST | `/api/runs` | JWT | Proxy → routes-service |
| GET | `/api/runs/me` | JWT | Proxy → routes-service |
| PATCH | `/api/runs/:id/complete` | JWT | Proxy → routes-service |
| POST | `/api/challenges` | JWT | Proxy → routes-service |
| GET | `/api/challenges/me` | JWT | Proxy → routes-service |
| ALL | `/api/friends/*` | JWT | Catch-all proxy → friend-service |
| GET | `/api/green-areas` | Public | Overpass API lookup (in gateway) |
| POST | `/api/routes/generate-route` | Public | Checkpoint generation (in gateway) |
| GET | `/tiles/*` | Public | Serves map tiles from `/var/www/html/tiles` |

### Internal service endpoints

**auth-service `:3001`**

| Method | Path | What it does |
|--------|------|--------------|
| GET | `/health` | Health check |
| POST | `/auth/signup` | Validate → bcrypt hash → User.create → JWT |
| POST | `/auth/login` | Validate → User.findOne → bcrypt.compare → JWT |

**profile-service `:3002`**

| Method | Path | What it does |
|--------|------|--------------|
| GET | `/health` | Health check |
| GET | `/profile/me` | Profile.findOne by x-user-id |
| PUT | `/profile/me` | Profile.findOneAndUpdate (upsert) |
| GET | `/stats/me` | UserStats.findOne |
| POST | `/stats/complete-run` | Update streak, distance, run count |
| POST | `/stats/increment-*` | Increment a specific counter |

**routes-service `:3003`**

| Method | Path | What it does |
|--------|------|--------------|
| GET | `/health` | Health check |
| POST | `/routes` | Save a generated route |
| GET | `/routes/:id` | Fetch a saved route |
| POST | `/runs` | Start a run (status: in_progress) |
| GET | `/runs/me` | List user's runs (filterable by status) |
| PATCH | `/runs/:id/complete` | Finalise run + store track points |
| POST | `/challenges` | Send a route challenge to a friend |
| GET | `/challenges/me` | List challenges sent/received |

**friend-service `:3004`**

| Method | Path | What it does |
|--------|------|--------------|
| GET | `/health` | Health check |
| GET | `/api/friends` | List accepted friends (aggregated with profiles) |
| GET | `/api/friends/count` | Friend count |
| GET | `/api/friends/pending` | Incoming requests |
| GET | `/api/friends/search` | Search users by username |
| POST | `/api/friends/request/:friendId` | Send friend request |
| POST | `/api/friends/accept/:requesterId` | Accept friend request |
| DELETE | `/api/friends/:friendId` | Remove friend |

---

## 4. Walkthrough: What Happens When You Tap "Create Account"

This is the most important walkthrough — it touches every layer from phone to database.

### Step 1 — Screen calls `signup()` (`CreateAccountScreen.tsx`)

The screen does exactly one thing: call `signup(email, password)` from `lib/api.ts`, then navigate on success or show the error message.

```tsx
const handleSignUp = async () => {
  try {
    await signup(email.trim(), password);
    navigation.navigate('CreateRoute', { from: 'CreateAccount' });
  } catch (err) {
    setMsg(err instanceof Error ? err.message : 'Sign up failed');
  }
};
```

The screen has no idea what "signup" involves. That's the point.

### Step 2 — `signup()` in `lib/api.ts`

```typescript
export async function signup(email: string, password: string) {
  const result = await request<AuthResponse>('/api/auth/signup', {
    method: 'POST',
    body: { email, password },
  });
  await tokenStorage.set(result.token);
  return result;
}
```

1. Calls the internal `request()` helper with `POST /api/auth/signup`.
2. Saves the returned JWT to the device's **secure keychain** (`expo-secure-store`).
3. Returns the response.

### Step 3 — `request()` does the `fetch`

This is the **only place in the entire mobile app where `fetch()` is called.** It:
- Adds `Content-Type: application/json` (always).
- Adds `Authorization: Bearer <token>` if `auth: true` is passed.
- Serialises the body to JSON.
- Parses the response and either returns it or throws an `Error` with the server's message.

### Step 4 — Request arrives at the gateway (`app.ts`)

The route is registered as:

```typescript
app.post('/api/auth/signup', async (req, res, next) => {
  try {
    await proxyJson(res, `${env.AUTH_SERVICE_URL}/auth/signup`, {
      method: 'POST',
      body: req.body,
    });
  } catch (err) {
    next(err);
  }
});
```

Two middlewares have already run: `cors()` (allows the phone) and `express.json()` (parses the body). This is a public route — no `authMiddleware`.

### Step 5 — Gateway proxies to auth-service

`proxyJson` does an internal `fetch` to `http://127.0.0.1:3001/auth/signup`. The **auth-service** then runs the real work:

1. Validate the request body.
2. Normalise email to lowercase.
3. `User.findOne({ email })` — reject if already exists.
4. `bcrypt.hash(password, 10)` — slow hash on purpose.
5. `User.create({ email, passwordHash })` → MongoDB.
6. `signToken({ userId })` → JWT (7-day expiry by default).
7. `res.status(201).json({ token, user })`.

### Step 6 — Phone saves the token, screen navigates

Back in `signup()`, `tokenStorage.set(result.token)` saves the JWT. The screen then navigates to `CreateRoute`.

### The full flow visualised

```
[Phone] tap "Create Account"
   │
   ▼ CreateAccountScreen.tsx (handleSignUp)
   │ calls signup()
   ▼ lib/api.ts (signup → request → fetch)
   │
   ──── HTTP POST /api/auth/signup ────────────────────────►
                                               apps/api/src/app.ts
                                               cors() + json()
                                               proxyJson → :3001
                                                   │
                                                   ▼ apps/auth-service
                                                   1. validate
                                                   2. bcrypt.hash
                                                   3. User.create ──► MongoDB
                                                   4. signToken
                                                   5. res.json({ token })
   ◄──── HTTP 201 { token, user } ─────────────────────────
   │
   ▼ lib/api.ts: tokenStorage.set(token)
   │
   ▼ CreateAccountScreen: navigate('CreateRoute')
```

---

## 5. Walkthrough: A Protected Request (`GET /api/profile/me`)

Same pattern, but with one extra step: **authMiddleware** runs before the proxy.

```typescript
app.get('/api/profile/me', authMiddleware, async (req, res, next) => {
  await proxyJson(res, `${env.PROFILE_SERVICE_URL}/profile/me`, {
    method: 'GET',
    headers: { 'x-user-id': req.userId! },
  });
});
```

### What `authMiddleware` does

```typescript
export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  try {
    const { userId } = verifyToken(header.slice('Bearer '.length));
    req.userId = userId;
    next(); // ← only if token is valid
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
```

In plain English:
1. Check for `Authorization: Bearer <token>`. Missing → 401, stop.
2. `verifyToken(token)` — checks the JWT signature using `JWT_SECRET`. Valid → returns `{ userId }`.
3. Attach `userId` to `req` and call `next()`.
4. If anything throws → 401. The controller never runs.

### Gateway adds `x-user-id`, profile-service trusts it

The gateway never forwards the raw JWT to internal services. Instead it adds `x-user-id: <userId>`. The profile-service reads this header via `gatewayAuthMiddleware`:

```typescript
export function gatewayAuthMiddleware(req, res, next) {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Missing x-user-id header' });
  req.userId = userId;
  next();
}
```

This is safe because the service ports are **not publicly reachable** (bound to `127.0.0.1`). Only the gateway can call them.

---

## 6. Walkthrough: Running a Route

This is the full product flow from route creation to badge unlock.

### 1. Generate a route

```
[Phone] MapScreen (CreateRouteScreen)
  user picks start point + distance + filters
  ↓
POST /api/routes/generate-route   (public, runs inside gateway)
  ↓
routeController.generateRouteController
  ↓
GreenAreaService → Overpass API (finds parks/forests near the start)
  ↓
Route domain class → places checkpoints within green areas
  ↓
{ checkpoints: [...], distance } returned to phone
```

### 2. Save the route (optional)

```
POST /api/route-records  (JWT)
  ↓ proxy
routes-service POST /routes
  ↓
RouteRecord.create → MongoDB
```

### 3. Start a run

```
POST /api/runs  { routeId }  (JWT)
  ↓ proxy
routes-service POST /runs
  ↓
Run.create { userId, route, status: 'in_progress', startedAt }
  ↓
{ runId } returned to phone
```

### 4. Track in real time (client-side)

`LocationService` accumulates GPS track points. `useTracking` hook reads `expo-location` and checks proximity to the next checkpoint. The `CreateRouteScreen` handles all state transitions (checkpoint taken → next checkpoint → route complete). No server calls happen during the run itself.

### 5. Complete the run

```
PATCH /api/runs/:id/complete  { trackPoints, durationSeconds, distanceMeters, checkpointsCompleted }  (JWT)
  ↓ proxy
routes-service PATCH /runs/:id/complete
  ↓
Run.findByIdAndUpdate → status: 'completed', finishedAt, stats stored

POST /api/stats/complete-run  { distanceMeters, checkpointsCompleted }  (JWT)
  ↓ proxy
profile-service
  ↓
UserStats update: completedRunsCount++, totalDistanceMeters +=, streak logic
```

### 6. Badge unlock (client-side)

After the stats update, the app calls `GET /api/stats/me`, then runs `checkBadgeUnlocks(stats)` in `services/badgeUnlock.ts`. Any newly-unlocked badges are shown via `BadgeCelebrationContext`. Celebrated badge IDs are persisted locally so the modal never re-appears.

---

## 7. Mobile App — Screens

All screens are registered in `App.tsx` and typed via `RootStackParamList`.

| Screen | What it does |
|--------|--------------|
| `Home` | Landing with background video + Sign up / Log in buttons |
| `CreateAccount` | Email + password form → signup → navigate to CreateRoute |
| `Login` | Email + password form → login → navigate to CreateRoute |
| `Welcome` | Onboarding / intro step |
| `ProfileUpsert` | Create or edit profile (username, name, age, gender) |
| `CreateRoute` | **Main hub.** Map + route generation + active run + bottom navigation. ~1600 lines. |
| `RouteStarted` | Transition screen when a run begins |
| `CheckpointTaken` | Celebration screen when a checkpoint is reached |
| `RouteCompleted` | Run summary (duration, distance, checkpoints) |
| `CancelRoute` | Confirmation when cancelling mid-run |
| `Favorites` | Saved favourite routes (stored locally in AsyncStorage) |
| `Profile` | User profile view + stats |
| `History` | List of past runs |
| `RunDetail` | Detail view for a single completed run |
| `Challenges` | Sent and received route challenges |
| `Badges` | Full badge gallery |
| `Friends` | Friend list + search |
| `FriendRequests` | Pending incoming friend requests |

### Mental model for screens

Screens are **thin**. They render UI, call functions from `lib/api.ts`, and react to success/failure. They do not call `fetch` directly. `lib/api.ts` does all network work.

---

## 8. Data Models (MongoDB)

All services share `mongodb://127.0.0.1:27017/utmarkprojekt` (or Atlas). Each service owns its collections.

### `users` — auth-service

```typescript
{
  email: string        // unique, lowercase
  passwordHash: string // bcrypt
  createdAt, updatedAt
}
```

### `profiles` — profile-service

```typescript
{
  userId: ObjectId    // unique, ref users
  username: string    // unique
  fullName: string
  age: number
  gender: 'male' | 'female' | 'other'
  createdAt, updatedAt
}
```

### `userstats` — profile-service

```typescript
{
  userId: ObjectId    // unique
  routesGeneratedCount: number
  routesSharedCount: number
  routesRecievedCount: number
  completedRunsCount: number
  maxRunDistanceCompleted: number
  totalDistanceMeters: number
  dayStreakOfCompletedRuns: number
  lastRunCompletedAt: Date
  totalCheckpointsTaken: number
  createdAt, updatedAt
}
```

### `routrecords` — routes-service

```typescript
{
  createdBy: ObjectId
  start: { latitude: number, longitude: number }
  distance: number
  checkpoints: [{ id: string, coordinate: { latitude, longitude }, radius: number }]
  filters: string[]
  createdAt, updatedAt
}
// Index: { createdBy: 1, createdAt: -1 }
```

### `runs` — routes-service

```typescript
{
  route: ObjectId      // ref routrecords
  userId: ObjectId
  status: 'in_progress' | 'completed' | 'abandoned'
  startedAt: Date
  finishedAt?: Date
  durationSeconds?: number
  checkpointsCompleted?: number
  distanceMeters?: number
  trackPoints: [{ lat: number, long: number, timeStamp: number }]
  createdAt, updatedAt
}
```

### `routechallenges` — routes-service

```typescript
{
  route: ObjectId
  fromUserId: ObjectId
  toUserId: ObjectId
  sourceRun?: ObjectId
  status: 'pending' | 'accepted' | 'declined' | 'cancelled'
  createdAt, updatedAt
}
```

### `friendships` — friend-service

```typescript
{
  requester: ObjectId
  recipient: ObjectId
  status: 'pending' | 'accepted'
  createdAt, updatedAt
}
// Unique compound index: { requester: 1, recipient: 1 }
```

---

## 9. Infrastructure & Deployment

### Local development

Each app runs with `npm run dev` (uses `ts-node-dev` or `expo start`). Services need their own `.env` files — copy from `.env.example`.

**Start all services:**
```bash
# In separate terminals (or use PM2)
cd apps/auth-service   && npm run dev   # :3001
cd apps/profile-service && npm run dev  # :3002
cd apps/routes-service  && npm run dev  # :3003
cd apps/friend-service  && npm run dev  # :3004
cd apps/api            && npm run dev   # :3000
cd apps/mobile         && npm run start # Expo
```

### Production (VM + PM2)

```bash
# Build each service
npm run build   # runs tsc inside each app

# Start with PM2
pm2 start ecosystem.api.config.js       # gateway
pm2 start ecosystem.services.config.js  # all four services
```

- Gateway on **port 3000** (public, or Nginx proxy on 80 → 127.0.0.1:3000)
- Services on **127.0.0.1:3001–3004** (not publicly reachable)
- Map tiles served from `/var/www/html/tiles` via the gateway's `/tiles/*` route
- Mobile default `EXPO_PUBLIC_API_URL` = `http://79.76.60.222:3000`

### CI (GitHub Actions)

On push/PR to `main`:
1. `npm ci` at root and in `apps/mobile`, `apps/api`, `apps/auth-service`, `apps/profile-service`
2. `npm run format` (Prettier check)
3. `npm run lint`
4. `npm test`

### Environment variables

| App | Key vars |
|-----|----------|
| `apps/api` | `PORT=3000`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN`, `AUTH_SERVICE_URL`, `PROFILE_SERVICE_URL`, `ROUTES_SERVICE_URL`, `FRIENDS_SERVICE_URL` |
| `apps/auth-service` | `PORT=3001`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN` |
| `apps/profile-service` | `PORT=3002`, `MONGODB_URI` |
| `apps/routes-service` | `PORT=3003`, `MONGODB_URI` |
| `apps/friend-service` | `PORT=3004`, `MONGODB_URI` |
| `apps/mobile` | `EXPO_PUBLIC_API_URL` |

`JWT_SECRET` must be **identical** in `apps/api` and `apps/auth-service`. The gateway verifies; the auth-service signs.

---

## 10. "Where Do I Edit If I Want To…?" — Cheat Sheet

| Goal | File(s) to edit |
|------|-----------------|
| Add a new gateway endpoint | `apps/api/src/app.ts` |
| Add a new auth endpoint | `apps/auth-service/src/app.ts` + `controllers/authController.ts` |
| Add a new profile endpoint | `apps/profile-service/src/app.ts` + `controllers/` |
| Add a new routes/runs endpoint | `apps/routes-service/src/app.ts` + `services/RoutesService.ts` |
| Add a new friend endpoint | `apps/friend-service/src/app.ts` + `controllers/friendsController.ts` |
| Add a field to a user | `apps/auth-service/src/models/User.ts` |
| Add a field to a profile | `apps/profile-service/src/models/Profile.ts` |
| Add a field to user stats | `apps/profile-service/src/models/UserStats.ts` |
| Add a new badge | `apps/mobile/src/data/badges.ts` + `services/badgeUnlock.ts` |
| Change JWT expiry / secret | `apps/api/.env` AND `apps/auth-service/.env` (must match) |
| Change which origins can call the API | `apps/api/.env` → `CORS_ORIGIN` |
| Change the API URL the phone calls | `apps/mobile/.env` → `EXPO_PUBLIC_API_URL` |
| Add a new mobile API function | `apps/mobile/src/lib/api.ts` (new export using `request()`) |
| Add a new screen | `apps/mobile/src/screens/` + register in `App.tsx` |
| Change the map tile source | `apps/mobile/src/screens/CreateRouteScreen.tsx` (UrlTile component) |
| Change gateway error format | `apps/api/src/middleware/errorHandler.ts` |
| Change service error format | `errorHandler.ts` in each service |

---

## 11. Concept Glossary

These are standard web-dev concepts used throughout the project.

### JWT (JSON Web Token)
A signed string: `header.payload.signature`. The payload holds `{ userId }`. The signature is computed with `JWT_SECRET` — only our server can produce valid tokens. The phone stores the JWT in `expo-secure-store` and sends it as `Authorization: Bearer <jwt>` on every protected request.

### Middleware
Functions that run **before** the route handler. Express runs them in order. Each can either call `next()` to continue, or send a response and stop the chain. We use them for: CORS, JSON parsing, JWT verification, `x-user-id` trust, error handling.

### Proxy
The gateway doesn't implement business logic for auth/profile/etc. Instead it forwards ("proxies") the request to the appropriate internal service and sends back whatever the service returns.

### `x-user-id` header
After verifying a JWT, the gateway strips the token and instead adds a plain `x-user-id` header to the internal service request. Internal services trust this header — they don't need to verify JWTs themselves.

### Controller
A function that handles a specific route. Takes `(req, res, next)`, does the real work (validation, DB queries, etc.), and sends a response.

### Mongoose / ODM
Mongoose is an Object Document Mapper for MongoDB. We define schemas, get TypeScript types, and use ergonomic queries (`User.findOne`, `Run.create`) instead of raw Mongo driver calls.

### bcrypt
A deliberately slow password-hashing function. We hash before storing; we call `bcrypt.compare(plaintext, hash)` on login. The real password is never stored.

### SecureStore (`expo-secure-store`)
iOS/Android encrypted key-value storage. Used to persist the JWT between app sessions without storing it in plain AsyncStorage.

### AsyncStorage
React Native's simple async key-value storage (not encrypted). Used for less sensitive data: favourite routes, celebrated badge IDs.

### `async` / `await`
JavaScript's way to write asynchronous code (network calls, DB queries) that reads like synchronous code. `await` pauses until the Promise resolves; errors propagate to the nearest `try/catch`.

### Idempotent
A request where repeating it with the same input gives the same result. `PUT /api/profile/me` is idempotent — calling it twice with the same body leaves the DB in the same state. That's why we use PUT (not POST) for profile saves.

---

## 12. Known Issues & Technical Debt

These are documented here so nothing surprises you.

| Issue | Detail |
|-------|--------|
| `packages/types` unused | Shared types exist but services and mobile duplicate them inline. Not a problem, just not wired up. |
| `routeCreator.ts` legacy file | `apps/api/src/routes/routeCreator.ts` is a dead file (marked outdated). Safe to delete. |
| friend-service wrong name | `package.json` says `@utmarkprojekt/auth-service`; `server.ts` logs `"auth-service listening"`. Cosmetic, doesn't affect runtime. |
| routes-service env | Reads `process.env.port` (lowercase) for `PORT` — defaults to `3003` anyway. |
| Cross-service DB reads | friend-service reads the `profiles` collection directly via Mongoose (same DB). Works because all services share one MongoDB instance, but couples the services. |
| Friendship model duplicated | Both friend-service and routes-service define `Friendship`. Same collection, so data is consistent. |
| CI coverage gap | routes-service and friend-service are not linted/tested in root CI scripts. |
| No Docker | Deployment is VM + PM2. No docker-compose. |

---

## Further Reading

| Document | Content |
|----------|---------|
| `docs/ONBOARDING_BEGINNER.md` | Step-by-step local setup guide |
| `ToDos.md` | Team backlog and open questions |
