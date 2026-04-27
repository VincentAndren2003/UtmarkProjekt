# How Our App Works — A Walkthrough for the Team

This is the doc to read (or present) **after** someone has the app running locally. It explains, in plain language, what every folder is for, how a request flows through the code, and why we structured things the way we did.

If you're presenting this, each numbered section is roughly 5 minutes of talking time — split or skip as you like.

---

## TL;DR (the 30-second pitch)

We built a full-stack app split into three pieces:

1. **Mobile app** (Expo / React Native) — what the user actually taps.
2. **API server** (Express + Node.js + TypeScript) — answers HTTP requests.
3. **Database** (MongoDB via Mongoose) — stores users and profiles.

Authentication uses **JWT** (a signed token the phone keeps and sends on every request). The whole stack is small, deliberately simple, and organized so you can find any piece of code in two clicks.

---

## 1. The Big Picture

```
┌───────────────┐     HTTP + JSON     ┌───────────────┐    Mongoose     ┌───────────────┐
│   Mobile App  │  ─────────────────► │   API Server  │ ──────────────► │   MongoDB     │
│  (Expo / RN)  │  ◄───────────────── │  (Express)    │ ◄────────────── │  (database)   │
└───────────────┘                     └───────────────┘                  └───────────────┘
   apps/mobile                          apps/api                        local mongod or Atlas
```

- The **mobile app** never touches MongoDB directly. It only knows how to talk to our API.
- The **API** is the only thing that talks to the database. That's the whole reason it exists — a security/structure boundary.
- They communicate over **HTTP** (`fetch` calls) carrying **JSON** bodies.

That's it. Three pieces, two boundaries.

---

## 2. Folder Tour

### Backend — `apps/api/src/`

```
config/
  env.ts            ← reads .env vars (DB URL, JWT secret, port, ...)
  db.ts             ← connects to MongoDB on startup
controllers/
  authController.ts        ← signup + login logic
  profileController.ts     ← get / save profile logic
  greenAreaController.ts   ← lists green areas (map data)
middleware/
  authMiddleware.ts ← verifies JWT, attaches req.userId to the request
  errorHandler.ts   ← turns thrown errors into clean JSON responses
models/
  User.ts           ← what a user document looks like in Mongo
  Profile.ts        ← what a profile document looks like in Mongo
utils/
  jwt.ts            ← signToken / verifyToken helpers
services/
  GreenAreaService.ts ← wraps the external Overpass API (kept because it has its own concerns)
app.ts              ← THE file. All routes live here.
server.ts           ← bootstrap: connect DB, then start listening
```

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
      navigation.navigate('ProfileUpsert');
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

```37:51:apps/api/src/app.ts
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Auth (public — no JWT required to call these).
  app.post('/api/auth/signup', signup);
  app.post('/api/auth/login', login);

  // Profile (protected — authMiddleware runs first; if no valid JWT it
  // returns 401 and the controller never runs).
  app.get('/api/profile/me', authMiddleware, getMyProfile);
  app.put('/api/profile/me', authMiddleware, upsertMyProfile);

  // Green areas (public — anyone can view).
  app.get('/api/green-areas', listGreenAreas);
```

**This is the menu.** Every URL the API answers, in one screen. The backend looks at the URL + method and finds the matching line. For `POST /api/auth/signup` it runs the `signup` controller.

Two middlewares run before that:
- `cors()` — allows the phone (different origin) to call us.
- `express.json()` — parses the JSON body into `req.body`.

### Step 5 — The signup controller does the work (`authController.ts`)

The controller does, in order:

1. Pull `email` and `password` from `req.body`.
2. Bail if either is missing → 400 "Bad Request."
3. Normalize email (`trim().toLowerCase()`).
4. `User.findOne({ email })` — check if the email is already taken. If yes → 409 "Conflict."
5. `bcrypt.hash(password, 10)` — scramble the password into a hash we can safely store.
6. `User.create(...)` — insert the new user document into MongoDB.
7. `signToken({ userId })` — make a JWT.
8. `res.status(201).json({ token, user })` — send it back.

Done. That's the whole signup flow.

### Step 6 — Phone gets the response, saves the token

Back in `signup()` (mobile), `tokenStorage.set(result.token)` saves the JWT to the device's secure keychain so we can send it on every protected request later.

### Step 7 — Screen navigates forward

`navigation.navigate('ProfileUpsert')` — user moves to the next screen.

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
                                    authController.ts (signup)
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
navigation.navigate('ProfileUpsert')
```

---

## 4. Walkthrough: A Protected Request (`GET /api/profile/me`)

Same pattern, but with one extra step: **authMiddleware runs first.**

The route is registered in `app.ts` with TWO functions:

```typescript
app.get('/api/profile/me', authMiddleware, getMyProfile);
```

When the request comes in, Express runs `authMiddleware` first. Only if it calls `next()` does `getMyProfile` run.

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

### Then `getMyProfile` runs

It reads `req.userId` (set by the middleware), calls `Profile.findOne({ userId })`, and returns either the profile or 404.

**That's the magic of middleware:** the controller can just trust `req.userId` exists. Auth is handled before the controller ever sees the request.

---

## 5. "Where Do I Edit If I Want To...?" — Cheat Sheet

| Goal | File(s) to edit |
|------|-----------------|
| Add a new API endpoint | `app.ts` (add the route) + a new function in `controllers/` |
| Add a field to a user / profile | `models/User.ts` or `models/Profile.ts` (add to schema) |
| Change auth rules (e.g. require auth on more routes) | `app.ts` (add `authMiddleware` to the route) |
| Change how passwords are hashed | `controllers/authController.ts` (`bcrypt.hash` line) |
| Change JWT expiration / secret | `apps/api/.env` (edit `JWT_EXPIRES_IN`, `JWT_SECRET`) |
| Change which origins can call the API | `apps/api/.env` (edit `CORS_ORIGIN`) |
| Change the API URL the phone calls | `apps/mobile/.env` (edit `EXPO_PUBLIC_API_URL`) |
| Add a new function the phone can call | `apps/mobile/src/lib/api.ts` (export a new helper using `request()`) |
| Add a new screen | `apps/mobile/src/screens/` + register in `App.tsx` |
| Change error message format | `middleware/errorHandler.ts` |

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
A schema definition (via Mongoose) that says what a document in MongoDB looks like. Models give us validation + TypeScript types + ergonomic query methods (`User.findOne(...)`, `User.create(...)`).

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

---

## 7. What We Simplified (and Why)

Worth showing the team so they see the journey, not just the destination.

### The original structure had:

- A `routes/` folder with `index.ts`, `authRoutes.ts`, `profileRoutes.ts`, `greenAreaRoutes.ts` — 4 files of pure URL forwarding.
- A `services/` folder with `authService.ts`, `profileService.ts` — middlemen between controllers and models.
- On mobile, a `services/` folder + `lib/apiClient.ts` + `lib/storage.ts` — 4 files for what is essentially "send a request and save the token."

### What we did:

| Change | Reason |
|--------|--------|
| Deleted the entire `routes/` folder; moved all routes into `app.ts` | For 5 endpoints, route splitting was over-engineering. One file = whole API surface. |
| Deleted `services/authService.ts` + `services/profileService.ts` (backend) | Controllers were just passing data through. Now controllers do the work directly. |
| Deleted `services/authService.ts` + `services/profileService.ts` (mobile) | Same problem. Replaced with named exports in `lib/api.ts`. |
| Merged `lib/apiClient.ts` + `lib/storage.ts` into `lib/api.ts` | They worked together; one file = one place to look. |

### What we kept (and why):

| Kept | Reason |
|------|--------|
| `models/` | Schemas need their own files — they're not just code, they're data shape definitions. |
| `middleware/` | Middleware is reusable across routes; deserves its own home. |
| `utils/jwt.ts` | Both `authController` and `authMiddleware` use it; centralizing prevents drift. |
| `config/env.ts`, `config/db.ts` | Different jobs (read env, connect DB). Cheaper to keep separate. |
| `services/GreenAreaService.ts` | Different kind of "service" — wraps an external API with its own concerns. |
| `tokenStorage` (mobile) | Without persistent storage, users log out on every app restart. Tiny cost, huge UX win. |

### What we did NOT do (and why):

- **Did not delete TypeScript / use plain JS.** Type safety pays for itself in caught bugs.
- **Did not use raw MongoDB queries.** Mongoose schemas validate writes and give us types. Worth keeping.
- **Did not collapse everything into one mega-file.** Past a certain point you trade understanding for line-count. We stopped at the right level.

---

## 8. How To Read This Codebase Going Forward

When you want to understand any feature, do this:

1. **Find the user action.** What does the user tap? Open that screen.
2. **Find the function it calls.** It'll be imported from `lib/api.ts`.
3. **Open `lib/api.ts`** → see the URL it hits.
4. **Open `apps/api/src/app.ts`** → find that URL → see which controller runs.
5. **Open the controller** → read top to bottom. That's the whole logic.

**4 files maximum** for any feature. The whole stack fits in your head.

If you ever feel lost: open `app.ts` (backend) and `lib/api.ts` (mobile) side by side. Those two files are the spine of the codebase. Everything else is supporting parts.

---

## 9. Closing Thoughts (for your presentation)

A few takeaways worth saying out loud:

- **Less code is better than more, until it isn't.** We deleted lots of "best practice" structure because for our size it was just noise. If we grow, we'll add it back.
- **One job per file** is more important than "one pattern per project." Small project, simple structure. Big project, structured structure. Don't cargo-cult.
- **The flow is always the same:** screen → API client → HTTP → backend route → controller → model → DB → and back. Once you internalize this, every feature is just a variation on the theme.
- **Concepts > code.** JWT, middleware, async/await, JSON, CORS — these are the things to truly understand. The rest is just where they show up in our specific files.

Good luck explaining! If anyone gets stuck on a concept, the glossary in section 6 is the fastest cheat sheet to point them at.
