# How Our App Works — A Walkthrough for the Team

This is the doc to read (or present) **after** someone has the app running locally. It explains, in plain language, what every folder is for, how a request flows through the code, and why we structured things the way we did.

If you're presenting this, each numbered section is roughly 5 minutes of talking time — split or skip as you like.

---

## TL;DR (the 30-second pitch)

We built a full-stack app split into three pieces (and we can also run the backend as microservices for the course requirement):

1. **Mobile app** (Expo / React Native) — what the user actually taps.
2. **API Gateway** (Express + Node.js + TypeScript) — the single public HTTP entrypoint the phone calls.
3. **Services + Database**:
   - **Auth service** + **Profile service** (Node/Express + Mongoose) — store users/profiles in MongoDB
   - MongoDB (local or Atlas)

Authentication uses **JWT** (a signed token the phone keeps and sends on every request). The whole stack is small, deliberately simple, and organized so you can find any piece of code in two clicks.

For the microservice setup (ports, env vars, how to run on the VM), see `docs/MICROSERVICES.md`.

---

## 1. The Big Picture

```
┌───────────────┐     HTTP + JSON     ┌───────────────┐     HTTP + JSON     ┌────────────────┐   Mongoose   ┌───────────────┐
│   Mobile App  │  ─────────────────► │ API Gateway   │  ─────────────────► │ Auth/Profile   │ ───────────► │   MongoDB     │
│  (Expo / RN)  │  ◄───────────────── │ (apps/api)    │  ◄───────────────── │ services       │ ◄─────────── │ (local/Atlas) │
└───────────────┘                     └───────────────┘                     └────────────────┘             └───────────────┘
   apps/mobile
```

- The **mobile app** never touches MongoDB directly. It only knows how to talk to our API.
- The **gateway** does auth + routing/proxy. The **services** talk to MongoDB.
- They communicate over **HTTP** (`fetch` calls) carrying **JSON** bodies.

That's it. Three pieces, two boundaries.

---

## 2. Folder Tour

### Backend — `apps/api/src/`

```
config/
  env.ts            ← reads .env vars (JWT secret, service URLs, port, ...)
controllers/
  greenAreaController.ts   ← lists green areas (map data)
middleware/
  authMiddleware.ts ← verifies JWT, attaches req.userId to the request
  errorHandler.ts   ← turns thrown errors into clean JSON responses
utils/
  jwt.ts            ← signToken / verifyToken helpers
services/
  GreenAreaService.ts ← wraps the external Overpass API (kept because it has its own concerns)
app.ts              ← THE file. All routes live here.
server.ts           ← bootstrap: start gateway
```

### Backend services — `apps/auth-service/` and `apps/profile-service/`

- `apps/auth-service`: `/auth/signup`, `/auth/login` + MongoDB (Mongoose) + JWT signing
- `apps/profile-service`: `/profile/me` (GET/PUT) + MongoDB (Mongoose)

**One sentence per file** — every file has a clear, single job. If a file's purpose can't be explained in one sentence, that's a smell. Right now they all can.

### Mobile — `apps/mobile/src/`

```
config/
  env.ts            ← reads EXPO_PUBLIC_API_URL (where the backend lives)
lib/
  api.ts            ← THE file. All API calls + token storage live here.
screens/
  CreateAccountScreen.tsx
  LoginScreen.tsx
  ProfileUpsertScreen.tsx
  WelcomeScreen.tsx
  MapScreen.tsx
  OrienteeringMapScreen.tsx
navigation/
  types.ts          ← TypeScript types for navigation
```

**Mental model:** screens are dumb. They render UI and call functions from `lib/api.ts`. `lib/api.ts` does the real network work. That's it.

---

## 3. Walkthrough: What Happens When You Tap "Create Account"

This is the most important section — it touches every layer. Follow it once and the rest of the codebase makes sense.

### Step 1 — User taps the button (`CreateAccountScreen.tsx`)

```14:22:apps/mobile/src/screens/CreateAccountScreen.tsx
  const handleSignUp = async () => {
    setMsg('');
    try {
      await signup(email.trim(), password);
      navigation.navigate('CreateRoute', { from: 'CreateAccount' });
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Sign up failed');
    }
  };
```

The screen does **one** thing: call `signup(...)` and react to success or failure. It has no idea how signup actually works under the hood. That's the whole point.

### Step 2 — `signup` runs (`lib/api.ts`)

```typescript
export async function signup(email, password) {
  const result = await request<AuthResponse>('/api/auth/signup', {
    method: 'POST',
    body: { email, password },
  });
  await tokenStorage.set(result.token);
  return result;
}
```

This function:
1. Calls the internal `request()` helper to send a POST to `/api/auth/signup` with the email + password.
2. After it gets a response back, saves the returned JWT to the device's secure keychain.
3. Returns the response so the screen can use it if it wants.

### Step 3 — `request` does the actual HTTP call (`lib/api.ts`)

This is the only place in the whole mobile app where `fetch()` is called.

It builds the headers (always `Content-Type: application/json`, plus `Authorization: Bearer ...` if the call needs auth), serializes the body to a JSON string, calls `fetch`, parses the response, and either returns it or throws an Error with the server's message.

### Step 4 — The request hits the backend (`app.ts`)

```50:115:apps/api/src/app.ts
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Auth (public) — gateway proxies to auth-service.
  app.post('/api/auth/signup', async (req, res, next) => { /* proxyJson(...) */ });
  app.post('/api/auth/login', async (req, res, next) => { /* proxyJson(...) */ });

  // Profile (protected) — gateway verifies JWT, then proxies to profile-service.
  app.get('/api/profile/me', authMiddleware, async (req, res, next) => { /* proxyJson(...) */ });
  app.put('/api/profile/me', authMiddleware, async (req, res, next) => { /* proxyJson(...) */ });

  // Green areas (public — anyone can view).
  app.get('/api/green-areas', listGreenAreas);
```

**This is the menu.** Every URL the Gateway answers is defined here. For `POST /api/auth/signup` the gateway proxies to the auth-service.

Two middlewares run before that:
- `cors()` — allows the phone (different origin) to call us.
- `express.json()` — parses the JSON body into `req.body`.

### Step 5 — The gateway proxies to the auth-service

The gateway does an internal HTTP call to the auth-service:

```55:76:apps/api/src/app.ts
  // Auth (public — no JWT required to call these).
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

Then the auth-service runs the real signup logic (validation, hashing, MongoDB, JWT signing).

Done. That's the whole signup flow.

### Step 6 — Phone gets the response, saves the token

Back in `signup()` (mobile), `tokenStorage.set(result.token)` saves the JWT to the device's secure keychain so we can send it on every protected request later.

### Step 7 — Screen navigates forward

`navigation.navigate('CreateRoute')` — user moves to the next screen.

### The same flow visually

```
[Phone] tap "Create Account"
   │
   ▼
CreateAccountScreen.tsx (handleSignUp)
   │  calls
   ▼
lib/api.ts (signup)
   │  calls
   ▼
lib/api.ts (request)
   │  fetch()  ──── HTTP POST ────►  [Network]
                                          │
                                          ▼
                                    apps/api/src/app.ts
                                       (matches /api/auth/signup)
                                          │
                                          ▼
                                    proxyJson(...) to auth-service
                                          │
                                          ▼
                                  apps/auth-service (signup)
                                     1. validate body
                                     2. normalize email
                                     3. User.findOne     ──► MongoDB
                                     4. bcrypt.hash
                                     5. User.create      ──► MongoDB
                                     6. signToken
                                     7. res.json({ token, user })
                                          │
   ◄────── HTTP 201 ─────────────────────┘
   │
lib/api.ts (request resumes, returns body)
   │
lib/api.ts (signup resumes, saves token)
   │
CreateAccountScreen.tsx (handleSignUp resumes)
   │
   ▼
navigation.navigate('CreateRoute')
```

---

## 4. Walkthrough: A Protected Request (`GET /api/profile/me`)

Same pattern, but with one extra step: **authMiddleware runs first.**

The route is registered in `app.ts` with TWO functions:

```typescript
app.get('/api/profile/me', authMiddleware, async (req, res, next) => {
  // proxyJson(...) to profile-service, with x-user-id header
});
```

When the request comes in, Express runs `authMiddleware` first. Only if it calls `next()` does the gateway proxy to the profile-service.

### What `authMiddleware` does

```12:30:apps/api/src/middleware/authMiddleware.ts
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  try {
    const { userId } = verifyToken(header.slice('Bearer '.length));
    req.userId = userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
```

In plain English:
1. Read the `Authorization` header. If it doesn't start with `Bearer ` → 401, stop.
2. Slice off `Bearer ` to get just the token.
3. `verifyToken(...)` checks the signature using `JWT_SECRET`. If valid → returns `{ userId }`. If invalid or expired → throws.
4. Stick `userId` onto `req` and call `next()` to continue to `getMyProfile`.

If anything fails, the controller never runs. The user gets 401.

### Then the gateway proxies to profile-service

The gateway forwards the user identity to the profile-service via a trusted header:

- Gateway verifies JWT and sets `req.userId`.
- Gateway calls the profile-service with header `x-user-id: <userId>`.
- Profile-service reads `x-user-id`, queries MongoDB, and returns either the profile or 404.

**That's the magic of middleware:** the controller can just trust `req.userId` exists. Auth is handled before the controller ever sees the request.

---

## 5. "Where Do I Edit If I Want To...?" — Cheat Sheet

| Goal | File(s) to edit |
|------|-----------------|
| Add a new public gateway endpoint | `apps/api/src/app.ts` (route + proxy or controller) |
| Add a new auth endpoint | `apps/auth-service/src/app.ts` + `apps/auth-service/src/controllers/` |
| Add a new profile endpoint | `apps/profile-service/src/app.ts` + `apps/profile-service/src/controllers/` |
| Add a field to a user | `apps/auth-service/src/models/User.ts` |
| Add a field to a profile | `apps/profile-service/src/models/Profile.ts` |
| Change auth rules for protected routes | `apps/api/src/app.ts` (add/remove `authMiddleware`) |
| Change how passwords are hashed | `apps/auth-service/src/controllers/authController.ts` |
| Change JWT expiration / secret | `apps/api/.env` AND `apps/auth-service/.env` (must match) |
| Change which origins can call the API | `apps/api/.env` (edit `CORS_ORIGIN`) |
| Change the API URL the phone calls | `apps/mobile/.env` (edit `EXPO_PUBLIC_API_URL`) |
| Add a new function the phone can call | `apps/mobile/src/lib/api.ts` (export a new helper using `request()`) |
| Add a new screen | `apps/mobile/src/screens/` + register in `App.tsx` |
| Change gateway error message format | `apps/api/src/middleware/errorHandler.ts` |
| Change service error message format | `apps/auth-service/src/middleware/errorHandler.ts` and `apps/profile-service/src/middleware/errorHandler.ts` |

If you ever can't find something, search by feature name (`signup`, `profile`, `green-areas`) — names are consistent across the codebase.

---

## 6. Concept Glossary (the things that confused us)

These are universal web-dev concepts. Worth knowing.

### JWT (JSON Web Token)
A signed string with three parts: `header.payload.signature`. The payload holds data (we put `userId` in it). The signature is computed using `JWT_SECRET` — only our server has the secret, so only our server can produce valid tokens. The phone keeps the JWT and sends it on every protected request as `Authorization: Bearer <jwt>`.

### Middleware
Functions that run **before** the controller. Express runs them in order. Each one can either:
- Call `next()` → continue to the next middleware/controller.
- Send a response (`res.status(...).json(...)`) → stop the chain.

We use them for: CORS, JSON parsing, JWT verification, error handling.

### Controller
A function that handles a specific request. Takes `(req, res, next)`. Does the real work (validation, DB calls, hashing, etc.) and sends a response via `res`.

### Model
A schema definition (via Mongoose) that says what a document in MongoDB looks like. Models give us validation + TypeScript types + ergonomic query methods (`User.findOne(...)`, `User.create(...)`). In our microservice setup, models live in the service that owns that data (auth/profile services), not in the gateway.

### ODM (Object Document Mapper) — Mongoose
The tool that lets us define schemas, get types, and do `User.findOne(...)` instead of writing raw Mongo queries. Like an ORM but for document databases.

### `async` / `await`
A way to write asynchronous code (network/DB calls) that looks like synchronous code. `await` pauses the function until the Promise resolves. Errors propagate to the surrounding `try/catch`.

### `Promise<T>`
A "future value box" — JavaScript's way of saying "this work isn't done yet, but I'll deliver a value of type T (or fail) later." `Promise<void>` means "I'll finish, but I won't return anything useful."

### CORS (Cross-Origin Resource Sharing)
A browser/network security feature that blocks requests between different origins (e.g. `http://localhost:19006` calling `http://localhost:3000`). The `cors()` middleware tells the API "yes, accept requests from this origin."

### bcrypt
A password-hashing function. Slow on purpose. We hash before storing, then `bcrypt.compare(password, hash)` to check on login. We never store the actual password.

### Idempotent
A request you can repeat without changing the result. `PUT /api/profile/me` is idempotent — calling it twice with the same body gives the same end state. That's why we use PUT (not POST) for profile saves.

--