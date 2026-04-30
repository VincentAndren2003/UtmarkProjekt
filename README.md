# Beginner Monorepo: React Native + Express + MongoDB

This project is a beginner-focused monorepo:

- `frontend` = a dead-simple React Native app with Expo
- `backend` = a Node.js + Express REST API using MongoDB with Mongoose

The goal is to help you understand both:

1. **How it works** (frontend -> API -> database -> response)
2. **Why each tool exists** (Node, Express, MongoDB, Mongoose, CORS, nodemon)

> **New teammate? Start here:** [`docs/ONBOARDING_BEGINNER.md`](./docs/ONBOARDING_BEGINNER.md) — single step-by-step guide to install everything, run Mongo + the API + the mobile app, and verify the full stack works end-to-end (with copy-pasteable commands and curl tests).
>
> **Want to actually understand the code we wrote (not just run it)?** Read [`docs/MIGRATION_TUTORIAL.md`](./docs/MIGRATION_TUTORIAL.md) — a deep, file-by-file walkthrough of the Supabase → Express + MongoDB migration, with every line of code explained and the request flow traced end-to-end.

## Project structure

```txt
.
├── backend
│   ├── src
│   │   ├── models/User.js
│   │   ├── routes/users.js
│   │   ├── scripts/seedUsers.js
│   │   ├── seed/
│   │   │   ├── seedUsersIfEmpty.js
│   │   │   └── usersSeedData.js
│   │   └── server.js
│   └── package.json
├── frontend
│   ├── App.js
│   └── package.json
└── package.json
```

## Mental model cheat sheet

Use these short anchors while reading the rest of this README:

- **Backend as a waiter**: frontend places an order (request), backend fetches from kitchen (database), backend returns result (response)
- **Express as a traffic system**: routes = road map, middleware = checkpoints, controller = final destination logic
- **Mongoose as a translator + guardrail**: translates JavaScript-shaped operations to MongoDB and enforces schema rules
- **Schema as a contract**: "every user document should look like this"
- **HTTP status as outcome signal**: status code says high-level result, JSON body gives details
- **CORS as browser permission slip**: backend tells browser which origins are allowed
- **`.env` as config, not code**: same keys in local file or cloud UI depending on environment
- **`nodemon` as dev convenience**: auto-restarts server; production usually runs plain `node`

---

## Core concepts (beginner guide)

### What is Node.js?

Node.js is a JavaScript runtime that lets you run JavaScript outside the browser.

- In the browser, JS usually handles UI.
- In Node.js, JS can also run servers, read files, connect to databases, and build APIs.

So in this stack:

- React Native app runs on device/simulator (frontend)
- Node.js runs the backend server

Mental model: Node.js is the "engine" that executes backend JavaScript.

### What is Express, and why do we use it?

Express is a tiny web framework on top of Node.js.

Without Express, you can still build an HTTP server with Node's built-in `http` module, but routing and middleware become verbose quickly.

Express gives you clean patterns for:

- route handling (`app.get`, `app.put`, `app.delete`)
- middleware (`app.use(...)`)
- request/response helpers (`req`, `res`)

### Express vs non-Express (what extra code you write without it)

With plain Node `http`, you manually handle method/path checks and low-level response details:

```js
import http from "node:http";

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/api/users") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify([{ name: "Ada" }]));
    return;
  }

  if (req.method === "DELETE" && req.url?.startsWith("/api/users/")) {
    // parse id manually, run delete logic manually, set status manually
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Deleted" }));
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Not found" }));
});
```

With Express, the same intent is higher-level and easier to read:

```js
const app = express();
app.use(express.json());

app.get("/api/users", getUsersController);
app.delete("/api/users/:id", deleteUserController);
```

What Express saves you from repeating:

- manual URL parsing and method branching
- manual body parsing for JSON
- manual status/header boilerplate on every route
- manual middleware chaining
- repetitive error handling patterns

In practice, for CRUD APIs, teams often write noticeably less boilerplate (commonly 2-4x less route plumbing code), and routes are easier for beginners to follow.

### What is `const app = express()`?

`express()` creates an **app instance**, which is your server object.

You register behavior on that app:

- `app.use(cors())` -> run CORS middleware on requests
- `app.use(express.json())` -> parse incoming JSON bodies
- `app.get("/", ...)` -> define route handler
- `app.use("/api/users", usersRouter)` -> mount a router under a path

Think of the app instance as the "main traffic controller" for incoming HTTP requests.

Mental model: `app` is a pipeline you build once (middlewares + routes), then every request flows through it.

What `import express from "express"` + `express()` means:

- `express` (imported value) is a function exported by the Express package
- calling `express()` creates an application object (`app`)
- `app` holds route definitions, middleware stack, and app-level settings
- `app.listen(...)` starts an HTTP server and binds that configured app to a port

So Express is not magic. It is a library that builds and manages request pipeline logic that you would otherwise wire manually.

### What are SDKs, libraries, and frameworks in this project?

Beginner-friendly distinction:

- **Library**: you call its functions when you want
- **Framework**: it defines app structure/patterns and you plug code into it
- **SDK**: a packaged toolbox for a platform/service (often includes libraries + helpers + docs)

In this repo:

- `express` -> framework-style library for HTTP APIs
- `mongoose` -> library/ODM for MongoDB access
- `cors` -> small middleware library
- `dotenv` -> utility library to load `.env` into `process.env`
- `react`, `react-native`, `expo` -> frontend platform libraries/tooling (Expo is more like a full toolchain/SDK experience)

So not every import is an "SDK."  
Most imports here are packages (libraries/frameworks) installed from npm and then imported into code.

### One HTTP request lifecycle (end-to-end mental model)

For this stack, every user action follows roughly this path:

1. UI event happens in React Native (tap button)
2. frontend sends HTTP request (`fetch`)
3. Express receives request
4. middlewares run (CORS, JSON parsing, auth/validation if present)
5. route handler/controller runs business logic
6. service/model talks to database
7. backend returns status code + JSON body
8. frontend updates state and re-renders UI

If something fails, ask: **which step failed?**  
That one question speeds up debugging a lot.

### Async/await and non-blocking behavior (super important)

Database calls are asynchronous, so backend uses `async/await`.

- `await User.find()` means: pause this handler until DB result arrives
- other requests can still be processed by Node's event loop
- without proper `try/catch`, rejected async operations can crash handlers or leak generic errors

Common beginner rule:

- every async route handler should handle errors and return clear status + message

### Promises, `async`/`await`, `resolve`/`reject` (frontend + backend)

A Promise is a JavaScript object that represents a future result.

- **resolved** -> operation succeeded and produced a value
- **rejected** -> operation failed and produced an error
- **pending** -> still running

`async`/`await` is syntax sugar on top of Promises:

- `async function` always returns a Promise
- `await somePromise` pauses that function until Promise settles
- if rejected, `await` throws, so handle with `try/catch`

Frontend example mental flow:

1. `fetch(...)` starts HTTP request and returns a Promise
2. Promise resolves when HTTP response arrives (even for 404/500)
3. you check `response.ok` / `response.status`
4. parse body with `await response.json()` (also async Promise)
5. update UI state or show error

Important beginner point: `fetch` Promise usually rejects only on network-level failures (offline, DNS, blocked connection), not on normal HTTP error status.  
So `404`/`500` often still come through as a resolved response you must inspect.

Backend side is similar:

- Mongoose operations return Promises
- use `await` to read/write DB results
- use `try/catch` to map failures to appropriate HTTP status responses

Mental model: Promise handles "when result arrives"; HTTP status handles "what result means."

### How HTTP protocol fits into this async flow

HTTP is the message protocol between frontend and backend.

Each request has:

- method (`GET`, `PUT`, `DELETE`, etc.)
- URL path (`/api/users/:id`)
- headers (metadata, content type, auth token)
- optional body (JSON payload)

Each response has:

- status code (`200`, `404`, `500`, etc.)
- headers
- optional body (usually JSON)

So flow is:

`frontend Promise (fetch) -> HTTP request/response -> backend Promise (DB) -> HTTP response -> frontend Promise resolution`

### Stateless API mindset

HTTP APIs are usually treated as stateless:

- each request should contain the info needed for that action
- server should not rely on random in-memory request state from previous calls

Why this matters:

- easier scaling across multiple backend instances
- fewer "works locally but breaks in prod" session bugs

### API contract thinking (request/response shape)

An API endpoint is a contract:

- request shape (params, query, body)
- response shape (JSON fields)
- status code semantics

Frontend and backend must agree on that contract.  
When you change it, update both sides (and docs).

### What is CORS and why do we need it?

CORS = Cross-Origin Resource Sharing.

Browsers enforce a security rule called same-origin policy. If your frontend and backend run on different origins (different domain/port/protocol), browser requests can be blocked unless backend explicitly allows them.

Example:

- frontend: `http://localhost:8081` (Expo dev server)
- backend: `http://localhost:4000`

Different ports = different origin.  
`cors()` tells browser "this origin is allowed to call this API."

Mental model: CORS is enforced by browsers; it is a browser-side safety gate, not a backend authentication system.

### What is REST and an endpoint?

An **endpoint** is a URL + HTTP method that does one backend action.

In this demo:

- `GET /api/users` -> read users
- `PUT /api/users/:id` -> update one user
- `DELETE /api/users/:id` -> delete one user

`/api/users/:id` means `:id` is a dynamic value, like a specific user id.

REST is a design style where HTTP methods map to actions:

- `GET` -> read
- `POST` -> create
- `PUT/PATCH` -> update
- `DELETE` -> remove

### Endpoint design patterns (good structure)

Use resource-based, predictable endpoint names:

- `GET /api/users` (list)
- `GET /api/users/:id` (get one)
- `POST /api/users` (create)
- `PUT /api/users/:id` or `PATCH /api/users/:id` (update)
- `DELETE /api/users/:id` (delete)

Good endpoint style:

- nouns for resources (`users`, `orders`, `products`)
- HTTP verb decides the action
- consistent plural naming
- stable base path (`/api/...`)

Bad vs good examples:

- Bad: `GET /api/getUsers`
- Good: `GET /api/users`

- Bad: `POST /api/deleteUser/123`
- Good: `DELETE /api/users/123`

- Bad: `POST /api/updateUser`
- Good: `PUT /api/users/:id`

Why this matters:

- frontend developers can guess endpoints faster
- API docs become simpler
- easier to scale API without naming chaos

### Endpoint best practices (do and don't)

Do:

- keep URL patterns consistent across resources
- return clear status codes + consistent JSON error shape
- validate request body/params before DB operations
- keep route handlers thin; move business logic to services

Don't:

- mix verbs into URL names (`/getUsers`, `/deleteUser`)
- return `200` for every outcome (use proper 4xx/5xx when needed)
- leak internal stack traces to clients
- let each route invent a different response structure

Mental model: endpoint naming should feel boring and predictable.

### `PUT` vs `PATCH` (common confusion)

- `PUT` usually means "replace resource state" (or full update contract)
- `PATCH` usually means "partial update"

In real projects, teams define exact behavior in API docs.  
In this demo, `PUT` is implemented as a partial update for simplicity.

### HTTP status codes (how frontend knows success/failure)

Backend responses include a status code + JSON body.

Common status codes in this demo style:

- `200 OK` -> request succeeded
- `400 Bad Request` -> client sent invalid data
- `404 Not Found` -> resource id does not exist
- `409 Conflict` -> duplicate unique value (for example email)
- `500 Internal Server Error` -> unexpected server-side failure

Frontend should check `response.ok` or `response.status`, not only assume success.

Mental model: status code is the headline, JSON body is the article.

### HTTP errors: what to return, when, and why

Good APIs return intentional error responses, not random failures.  
This helps frontend show the right message and helps developers debug quickly.

Why this matters:

- users get useful feedback ("email already exists" vs generic crash)
- frontend can branch behavior by status code
- logs + monitoring are easier to interpret
- API behavior stays consistent across endpoints

Recommended error response shape:

```json
{
  "message": "Human-readable error",
  "code": "OPTIONAL_MACHINE_CODE"
}
```

Use status codes by responsibility:

- `400 Bad Request`
  - request format/content is invalid
  - example: missing required field, invalid email format
- `401 Unauthorized`
  - user is not authenticated
  - example: missing/invalid access token
- `403 Forbidden`
  - authenticated but not allowed
  - example: user tries admin-only action
- `404 Not Found`
  - target resource does not exist
  - example: user id not found
- `409 Conflict`
  - request conflicts with existing data constraints
  - example: duplicate unique email
- `422 Unprocessable Entity` (optional pattern)
  - syntactically valid JSON but semantic validation fails
  - some teams prefer this instead of `400` for validation errors
- `429 Too Many Requests`
  - rate limit exceeded
- `500 Internal Server Error`
  - unexpected backend failure
  - do not leak stack traces/internal implementation details
- `503 Service Unavailable`
  - temporary upstream failure (DB unavailable, maintenance window)

Practical pattern for beginners:

1. return `4xx` for client-fixable problems
2. return `5xx` for server-side/unexpected problems
3. keep error JSON shape consistent across routes
4. log internal error details on server, return safe message to client

Do and don't:

- Do return precise status codes (not always `200`)
- Do keep messages clear and actionable
- Do document error cases in README/API docs
- Don't expose secrets, stack traces, or raw DB internals in API responses
- Don't invent different error shapes per endpoint

### What is MongoDB (NoSQL) vs SQL databases?

MongoDB is a **NoSQL document database**:

- stores data as JSON-like documents (BSON)
- flexible structure (documents in a collection can vary)
- natural fit for JavaScript object-shaped data

SQL databases (PostgreSQL, MySQL, etc.) are relational:

- data in tables/rows/columns
- strong schema at DB level
- relationships via joins and foreign keys

Neither is "always better."  
MongoDB is often great for fast iteration and document-like app data.

### Why not use MongoDB driver directly only?

You can use the native MongoDB driver directly, and it works.  
We use **Mongoose** because it adds structure and developer ergonomics.

### Is Mongoose an ORM?

Close, but technically Mongoose is usually called an **ODM**:

- ORM = Object Relational Mapper (for SQL databases)
- ODM = Object Document Mapper (for document DBs like MongoDB)

People casually say "ORM" for both, but ODM is the precise word here.

### Why Mongoose exists (key benefits)

Mongoose gives you:

- **Schemas** to define expected document shape
- **Validation** (`required`, type checks, unique constraints, etc.)
- **Models** with simple methods (`find`, `findByIdAndUpdate`, etc.)
- **Middleware/hooks** and cleaner abstraction for common patterns

Without Mongoose, you manually handle more validation and structure in each route.

### How Mongoose schemas work

A schema is a blueprint for documents in a collection.

Example from this project (`backend/src/models/User.js`):

- `name`: required string
- `email`: required, unique, lowercased string
- timestamps enabled (`createdAt`, `updatedAt`)

Why schema matters:

- prevents bad/invalid data shape
- keeps data consistent for frontend usage
- gives clear contracts for team members

In NoSQL, schema can be flexible, but in real apps we still want guardrails.  
Mongoose schema gives those guardrails.

Important nuance: `unique: true` in Mongoose is implemented via a MongoDB unique index.  
It is not a full "validation rule" by itself, so duplicate errors are usually handled when MongoDB writes are attempted.

Mental model: MongoDB is flexible by default; Mongoose adds team-friendly structure on top.

### Why Express + Mongoose instead of bare Node + bare MongoDB?

Short answer: bare tools work, but frameworks remove repetitive low-level work.

You can build this app with:

- Node built-in `http` server (no Express)
- MongoDB native driver (no Mongoose)

That is valid, but for beginners it usually means more boilerplate and more places for mistakes.

Why we choose Express over bare Node HTTP:

- cleaner route definitions (`app.get`, `app.put`, `app.delete`)
- easy middleware pipeline (`app.use`)
- better request/response ergonomics
- faster to read and teach in small examples

Why we choose Mongoose over bare MongoDB driver:

- schema + validation guardrails
- clearer model-based API for CRUD operations
- less repeated parsing/validation logic in route files
- easier consistency as app grows

Rule of thumb:

- use bare tools when you need full low-level control and minimal dependencies
- use Express + Mongoose when you want developer speed, readability, and safer defaults

### Why `package.json` exists in a Node project

`package.json` is the project manifest for Node/npm.  
It tells tools and teammates how this project is defined and run.

In practice it stores:

- project metadata (`name`, `version`, `private`)
- dependencies (`express`, `mongoose`, etc.)
- scripts (`dev`, `start`, `seed`)
- runtime/module settings (for example `"type": "module"`)

Why this is essential:

- everyone installs same dependency set (`npm install`)
- everyone runs same commands (`npm run ...`)
- deployment/CI knows how to start the app

Mental model: `package.json` is the "operating manual" for a Node project.

### How we run backend code with Node and npm scripts

Two common ways:

1. Direct Node execution:
   - `node src/server.js`
   - Node loads file and executes it immediately
2. Script execution via npm:
   - `npm run dev`
   - npm looks up `scripts.dev` in `package.json`, then runs that command

Why use scripts instead of only raw commands:

- shorter commands to remember
- shared conventions across team
- easy to orchestrate monorepo tasks (`--workspace backend`)

Example from this repo:

- root script `dev:backend` delegates to backend workspace
- backend script `dev` runs nodemon
- backend script `seed` runs seed script file

### `node` vs `nodemon`

- `node src/server.js`: runs the file once
- `nodemon src/server.js`: watches files and auto-restarts on changes

Why use `nodemon` in development:

- faster feedback loop
- no manual stop/start after each save

In production, you normally run with plain `node` (or a process manager).

### Why Docker is not required in this demo

You do **not** need Docker here because:

- Node runs directly on your machine
- MongoDB runs locally as a background service
- setup is simple enough for beginner local development

When Docker becomes useful:

- you want identical environment across different machines
- you need one-command spin-up for multi-service stacks
- team/CI wants reproducible containers

So Docker is optional, not mandatory, for this learning setup.

What Docker would change (if you add it later):

- you would run services in containers instead of directly on host OS
- config usually moves into `Dockerfile` + `docker-compose.yml`
- local startup often becomes `docker compose up`
- onboarding can become easier, but debugging can feel more abstract for beginners

Mental model: Docker is a packaging/reproducibility tool, not a requirement for backend fundamentals.

### This stack vs Firebase vs Supabase

All are valid choices. They optimize for different priorities.

### Comparison by architecture responsibility

Express + MongoDB (this project):

- you design and own endpoint contracts
- you control middleware, auth flow, validation, and error structure
- you choose deployment strategy and scaling details
- you are responsible for more operational setup

Firebase:

- strongly managed platform with SDK-first workflow
- common path is direct client SDK use + security rules + optional Cloud Functions
- excellent speed for MVPs and mobile-first products
- architecture can feel event/platform-driven vs classic REST API server

Supabase:

- managed Postgres platform with auth/storage/realtime and generated APIs
- SQL-first workflow with strong relational querying
- can move very fast with built-in features
- custom backend still possible, but many teams lean on platform primitives first

### Data model and query style differences

This stack (MongoDB + Mongoose):

- document model (JSON-like documents)
- flexible schema with app-level guardrails via Mongoose
- natural for nested/object-shaped data

Firebase (Firestore):

- document collections with Firestore query/rule model
- great realtime/mobile SDK story
- complex relational patterns can require denormalization and careful data modeling

Supabase (Postgres):

- relational SQL model with tables, joins, constraints
- strong fit for relational business data and analytics-friendly querying
- schema migrations and SQL design are central skills

### "Black box" tradeoff explained

Managed platforms (Firebase/Supabase) abstract many backend concerns:

- provisioning infrastructure
- auth/session primitives
- data APIs and hosting integrations

This reduces setup work, but can hide internals:

- less visibility into full request lifecycle
- behavior often shaped by platform defaults and conventions
- deeper customization may require platform-specific patterns

Custom Express backend is less abstract:

- more moving parts to manage
- clearer learning path for HTTP/middleware/controller/service/data boundaries
- easier to reason about portability between cloud providers

### Vendor lock-in and portability

Express + MongoDB:

- lower platform lock-in at app layer
- easier to move host/provider with minimal app rewrite

Firebase:

- deeper lock-in to Firebase-specific SDKs/rules/functions patterns
- migration later can require larger architecture changes

Supabase:

- SQL/Postgres core is portable, which helps
- some Supabase platform features still create coupling (auth/storage/realtime patterns)

### Scaling and operations mindset

Express + DB:

- you control scaling strategy (instances, caching, queueing, observability)
- you also own incident handling, runtime tuning, and more ops decisions

Firebase/Supabase:

- many operational concerns are managed for you
- faster initial delivery, less infrastructure burden
- limits/quotas/pricing/feature boundaries become design constraints

### Cost-shape intuition (early stage)

- managed platforms often feel cheaper/faster early because fewer engineering hours
- custom backend may be cheaper long-term in some cases, but costs more developer setup time early
- the "cheapest" option depends on team experience and product complexity, not only cloud bill

### Decision guide (practical)

Choose **Express + MongoDB** when:

- learning backend architecture deeply is a primary goal
- you need full control over endpoint behavior and middleware
- you expect custom business logic beyond standard CRUD/auth

Choose **Firebase** when:

- you want fastest path to mobile/web MVP
- SDK-driven realtime/auth flows fit your product
- team prefers managed services over server ownership

Choose **Supabase** when:

- you want managed backend with SQL/Postgres power
- relational data and joins are core requirements
- you want fast iteration but still strong data-model discipline

Rule of thumb:

- managed platforms optimize for speed/convenience
- custom backend optimizes for control/transparency/flexibility

Mental model: you are choosing where complexity lives - in your codebase, or in platform abstractions.

---

## How frontend and backend connect in this project

In `frontend/App.js`, the app calls backend endpoints using `fetch`:

- `fetch("http://localhost:4000/api/users")`
- `fetch("http://localhost:4000/api/users/:id", { method: "PUT", ... })`
- `fetch("http://localhost:4000/api/users/:id", { method: "DELETE" })`

Flow for one request:

1. User taps button in React Native
2. Frontend sends HTTP request to backend endpoint
3. Express route handler runs
4. Mongoose talks to MongoDB
5. Backend sends JSON response
6. Frontend updates UI state from that JSON

### How Node backend and MongoDB communicate

Think of it as a chain:

`React Native app -> Express route -> Mongoose model -> MongoDB server (mongod)`

Detailed flow:

1. Backend starts and runs `mongoose.connect(MONGODB_URI)`
2. Mongoose opens a TCP connection from Node.js process to MongoDB (`mongod`), usually on `127.0.0.1:27017` in local dev
3. When a route calls something like `User.find()` or `User.findByIdAndUpdate(...)`, Mongoose converts that into MongoDB database operations
4. MongoDB executes operation on collections/documents and returns results
5. Mongoose converts results into JavaScript objects/documents
6. Express sends those results as JSON in HTTP response to frontend

Important mental model:

- Backend does **not** "push" data directly to frontend automatically.
- Frontend asks via HTTP request.
- Backend then asks database.
- Database answers backend.
- Backend answers frontend.

So backend is the middle layer that controls validation, business logic, and what data is exposed.

### Typical backend folder structure (routes, controllers, services)

As backend grows, people often split logic like this:

```txt
backend/src
├── routes/
├── controllers/
├── services/
├── models/
├── middlewares/
└── server.js
```

What belongs where:

- `routes/`
  - maps HTTP method + path to handlers
  - keeps endpoint declarations readable
  - example: `router.put("/:id", auth, accessControl("admin"), updateUserController)`
- `controllers/`
  - receives `req`/`res`, handles HTTP-level concerns
  - reads params/body/query, calls service, sends response/status code
- `services/`
  - pure business logic and orchestration
  - should be reusable from multiple controllers
  - talks to models/repositories and returns domain results
- `models/`
  - Mongoose schemas/models and database shape rules
- `middlewares/`
  - reusable request pipeline steps (auth, role checks, validation, rate limit, logging)

Why split this way:

- easier to reason about each file's job
- less giant "do everything" route handlers
- easier testing (service logic can be tested without HTTP)
- easier team collaboration and long-term maintenance

Mental model:

- routes = "where to go"
- controllers = "HTTP in/out"
- services = "business decisions"
- models = "data shape and DB operations"
- middlewares = "cross-cutting checks"

### Validation boundaries (where checks should happen)

A strong backend usually validates in layers:

1. **Request layer** (middleware/controller): required fields, type/format checks
2. **Domain layer** (service): business rules ("email already used", "cannot delete protected user")
3. **Database layer** (schema/index): schema constraints and unique indexes

Do not rely on only one layer.  
Good systems fail early at request layer and still keep DB-level guardrails.

### Error handling pattern (beginner-safe approach)

Aim for predictable API errors:

- expected user errors -> return clear `4xx` with readable message
- unexpected failures -> return generic `500` (do not leak internals)
- log internal details on server side for debugging

This keeps frontend behavior consistent and avoids exposing sensitive internals.

### Middleware: auth, access control, validation

Middleware is a function that runs before your final controller.

Common examples:

- `authMiddleware` -> verifies token/session and sets `req.user`
- `requireRole("admin")` -> authorization (access control) based on user role
- `validateBody(schema)` -> rejects invalid input early

Yes, you usually add middleware in route arguments before controller:

```js
router.put(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  validateUpdateUser,
  updateUserController
);
```

Order matters:

1. authenticate user
2. check permissions
3. validate input
4. run controller

This keeps security and validation centralized instead of rewriting checks in every controller.

Mental model: middleware is a reusable checkpoint chain before protected business logic runs.

Small-project note: for tiny demos, route + controller in one file is fine.  
As soon as logic grows or multiple people contribute, splitting into controllers/services/middlewares pays off quickly.

Middleware best practices (do and don't):

Do:

- keep middleware focused on one concern (auth OR validation OR logging)
- put auth/authorization before protected controllers
- return early on failed checks with explicit status code/message

Don't:

- hide heavy business logic inside generic middleware
- mutate request objects in surprising ways
- silently continue after auth/validation failure

---

## Prerequisites

- Node.js (LTS)
- npm
- MongoDB running locally on default port

## Install

From repo root:

```bash
npm run install:all
```

## Configure backend env

Copy and edit:

```bash
cp backend/.env.example backend/.env
```

Default values already work for local MongoDB:

- `PORT=4000`
- `HOST=localhost`
- `MONGODB_URI=mongodb://127.0.0.1:27017/beginner_rest_demo`

## Start MongoDB locally (background)

Your backend cannot read/write users unless a MongoDB server process is running.

That is why the backend previously failed with:

`connect ECONNREFUSED 127.0.0.1:27017`

It means: "I tried to connect to MongoDB on this machine and port, but nothing was listening."

### Start MongoDB with Homebrew service (recommended on macOS)

What is running in background:

- `mongod` is the MongoDB **database server process** (daemon)
- `brew services ...` tells macOS to run `mongod` in the background for you
- so you do not have to keep one terminal window open just to run MongoDB

Start in background:

```bash
brew services start mongodb/brew/mongodb-community
```

Check status:

```bash
brew services list
```

Stop it later:

```bash
brew services stop mongodb/brew/mongodb-community
```

Why background service is useful:

- MongoDB stays running while you code
- you can close/reopen terminal and backend still works
- your backend can reliably connect for local testing

If backend starts before MongoDB, backend fails to connect.  
Start MongoDB first, then restart backend (`rs` in nodemon or rerun `npm run dev:backend`).

### How to verify `mongod` is really running

Check process:

```bash
ps aux | rg mongod
```

Check default MongoDB port:

```bash
lsof -nP -iTCP:27017 -sTCP:LISTEN
```

If you see `mongod` listening on `127.0.0.1:27017`, local MongoDB is up.

### How to look at your local databases

Option 1: terminal (`mongosh`)

```bash
mongosh
```

Inside shell:

```javascript
show dbs
use beginner_rest_demo
show collections
db.users.find().pretty()
```

Option 2: GUI

- Use MongoDB Compass and connect to `mongodb://127.0.0.1:27017`
- Browse databases, collections, and documents visually

### MongoDB Compass walkthrough (GUI, no terminal)

If you prefer a visual tool, MongoDB Compass is the easiest way to inspect local data.

1. Install MongoDB Compass from [mongodb.com/products/tools/compass](https://www.mongodb.com/products/tools/compass)
2. Open Compass
3. In connection string, paste:
   - `mongodb://127.0.0.1:27017`
4. Click **Connect**
5. In left sidebar, open database:
   - `beginner_rest_demo` (or whatever DB name is in `MONGODB_URI`)
6. Open collection:
   - `users`
7. Interact with data using UI tabs/buttons:
   - **Documents** tab to browse rows
   - **Filter** bar to search (example: `{ "email": "ada@example.com" }`)
   - **Add Data** button to insert new document
   - click a document to edit fields inline
   - delete a document via trash/delete action

Good beginner workflow:

- run backend
- trigger requests from app (`GET/PUT/DELETE`)
- refresh Compass and observe how documents changed

Mental model: Compass is like a database "file explorer" for MongoDB.

### How to use a new local database name

Change the database name in `MONGODB_URI`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/my_new_local_db
```

Then restart backend.  
MongoDB creates that database automatically the first time your app writes data to it.

## Seeding data (starter users)

This project now keeps seed logic outside `server.js` so responsibilities are clearer:

- startup seed helper: `backend/src/seed/seedUsersIfEmpty.js`
- seed data source: `backend/src/seed/usersSeedData.js`
- manual seed script entrypoint: `backend/src/scripts/seedUsers.js`

Why separate files:

- `server.js` stays focused on app setup + startup
- seed data can be reused in startup and manual scripts
- easier to add more seed scripts later (for products, orders, etc.)

Current behavior:

- on backend startup, app seeds starter users only if collection is empty
- you can also run seeding manually with npm scripts

Manual seed commands:

```bash
# from monorepo root
npm run seed:backend

# force replace current users with starter users
npm run seed:backend:force
```

```bash
# same commands directly inside backend folder
npm run seed
npm run seed:force
```

## Understanding npm scripts (and how to extend them)

`scripts` in `package.json` are named terminal commands.

Example:

- `"dev": "nodemon src/server.js"` means `npm run dev` executes that command

Why scripts are useful:

- shared team commands (everyone runs same command)
- shorter commands (alias complex shell commands)
- easier automation in CI/deploy pipelines

### Scripts in this monorepo

Root (`/package.json`) scripts orchestrate workspaces:

- `dev:backend` -> run backend dev server in backend workspace
- `dev:frontend` -> run Expo in frontend workspace
- `seed:backend` -> run backend seed script
- `seed:backend:force` -> run force seed

Backend (`/backend/package.json`) scripts run backend-specific tasks:

- `dev` -> nodemon server for local development
- `start` -> plain node server (production style)
- `seed` -> run manual seed script (non-destructive if data exists)
- `seed:force` -> clear users and reseed starter users

### How to add your own script

1. Create a script file (example: `backend/src/scripts/resetDb.js`)
2. Add entry in `backend/package.json`:

```json
{
  "scripts": {
    "reset:db": "node src/scripts/resetDb.js"
  }
}
```

3. Run it:

```bash
npm run reset:db --workspace backend
```

Mental model: npm scripts are your project's "command palette" for repeatable tasks.

## Run the backend

```bash
npm run dev:backend
```

On startup it prints:

- backend base URL
- health endpoint URL
- users endpoint URL

It also seeds 3 demo users if collection is empty.

## Run the frontend (new terminal)

```bash
npm run dev:frontend
```

Then open in Expo Go / iOS simulator / Android emulator.

## Important URL note for physical devices

If running on a real phone, `localhost` points to the phone itself (not your computer).

In `frontend/App.js`, set `API_BASE_URL` to your computer's local network IP:

```js
const API_BASE_URL = "http://192.168.1.50:4000";
```

Additional local-network reminders:

- your phone and computer must be on the same Wi-Fi
- firewall settings can block inbound local connections
- Android emulator often uses `http://10.0.2.2:4000` to reach host machine

## Local `.env` vs deployed environment variables

Yes, in this project `.env` is mainly for local development.

When deploying backend, you usually do **not** upload `.env` to git/repo.  
Instead, you set the same keys in the hosting provider dashboard (their UI).

Think of it like this:

- local machine -> values in `backend/.env`
- cloud host -> values in host's Environment Variables page

The code still reads `process.env.*` in both cases.

## Deploying backend (what changes)

When hosted (Railway/Render/Fly.io/etc.), your backend runs on a cloud server instead of your laptop.

Main changes:

1. **Database is remote**
   - In this project, for a deployed backend, you should use hosted MongoDB (usually MongoDB Atlas), not local `127.0.0.1`.
   - `127.0.0.1` in cloud means "the cloud server itself", not your laptop.
2. **Port is provided by platform**
   - Many hosts inject `PORT` dynamically.
3. **Frontend must call deployed URL**
   - Not `http://localhost:4000` anymore.
4. **CORS should be restricted**
   - In production, allow only your frontend domain(s), not everything.

### Typical environment variables in hosting UI

Set these in Railway/Render/Fly dashboard:

- `MONGODB_URI` -> your MongoDB Atlas connection string
- `PORT` -> sometimes optional (platform may auto-provide)
- `HOST` -> optional in this project (used only for printed log URL)
- `NODE_ENV=production` -> standard production flag

You may also add app-specific secrets in future (JWT secret, API keys, etc.).

### MongoDB Atlas free cluster (quick setup)

For this demo, this is the easiest production-friendly path:

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas/database)
2. Create a free shared cluster (`M0`)
3. Create database user (username + password)
4. In Network Access, allow your backend host IP (for quick testing many beginners use `0.0.0.0/0`, then tighten later)
5. Click Connect -> Drivers -> copy connection string
6. Replace placeholders:
   - `<username>` and `<password>`
   - database name (for example `beginner_rest_demo`)
7. Paste that final URI into backend host env var:
   - `MONGODB_URI=mongodb+srv://...`

After that, redeploy/restart backend and it will connect to Atlas instead of local MongoDB.

Security reminder:

- `0.0.0.0/0` means "allow from anywhere" and should be temporary
- prefer restricting Atlas Network Access to known backend egress IPs when possible
- never commit real connection strings/passwords to git

### Free-tier hosting examples for beginners

- Railway
- Render
- Fly.io
- Koyeb

For MongoDB itself, MongoDB Atlas has a free tier in many regions.

### Deployment mental model

Local development:

- frontend and backend run on your computer
- database can be local MongoDB

Production/deployed:

- backend runs on provider infrastructure
- database usually runs on managed cloud MongoDB
- env vars are configured in provider UI, not `.env` file in repo

---

## Try API directly with curl (optional)

`curl` is a command-line tool for sending HTTP requests.

Why beginners use `curl` for API testing:

- it talks directly to backend endpoints (no app UI involved)
- it helps isolate problems ("is backend broken, or frontend broken?")
- it is fast for checking status codes, JSON responses, and request bodies
- it works in almost every terminal, so it is a universal debugging tool

In short: if `curl` works but app does not, your API is probably fine and the issue is likely frontend/network setup.

Get users:

```bash
curl http://localhost:4000/api/users
```

Update one user:

```bash
curl -X PUT http://localhost:4000/api/users/<USER_ID> \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name","email":"updated@example.com"}'
```

Delete one user:

```bash
curl -X DELETE http://localhost:4000/api/users/<USER_ID>
```

---

## Common beginner misconceptions and easy misses

- "If backend is running, frontend will auto-update" -> not by default; frontend must make an HTTP request
- "CORS blocks all non-browser requests" -> CORS is mainly a browser enforcement; tools like curl/Postman are different
- "`localhost` always means my computer" -> only true from that machine's own perspective
- "`.env` is secure by itself" -> it is just a local file; keep it out of git and secrets managers handle production secrets
- "MongoDB database appears instantly after URI change" -> a DB usually appears after first successful write
- "Mongoose `unique` fully validates duplicates before write" -> duplicate key is typically caught at DB write time
- "Status 200 means business result is correct" -> check response body too, not just status code

If stuck debugging, test in this order:

1. check MongoDB is running
2. check backend logs and `curl` endpoint
3. check frontend base URL
4. check CORS and network origin
