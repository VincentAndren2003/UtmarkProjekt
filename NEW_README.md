# Utmark — languages, tools, and starter guide

This README is the main onboarding document for the project structure used in this repository.

It explains:
- what to install
- which languages and tools we use
- what to think about when coding
- how to start as a new collaborator

## 1) Project structure

```text
UtmarkPrototype/
├─ apps/
│  └─ api/                     # TypeScript backend (NestJS + Prisma)
│     ├─ src/
│     │  ├─ auth/              # Register/login/JWT/me
│     │  ├─ users/             # User create/find/password checks
│     │  ├─ map-entities/      # Nearby entities query (PostGIS)
│     │  ├─ capture/           # Capture validation + scoring + idempotency
│     │  ├─ progress/          # User score + completed entities
│     │  ├─ session-seed/      # Seed demo checkpoint ring
│     │  ├─ health/            # Health endpoint
│     │  ├─ prisma/            # Prisma service/module
│     │  ├─ common/            # Shared backend utilities
│     │  ├─ app.module.ts
│     │  └─ main.ts
│     └─ prisma/
│        ├─ schema.prisma
│        └─ migrations/
├─ packages/
│  └─ types/                   # Shared Zod schemas and API types
├─ Sources/UtmarkPrototype/    # SwiftUI iOS prototype (legacy demo track)
├─ package.json                # Monorepo scripts
├─ pnpm-workspace.yaml         # Workspace packages
├─ turbo.json                  # Task pipeline
├─ GETTING_STARTED.md          # Quick checklist
└─ CONTRIBUTING.md             # Team workflow and PR rules
```

## 2) Languages and frameworks

| Area | Language | Frameworks / libraries |
|---|---|---|
| API | TypeScript | NestJS, Prisma |
| Shared contracts | TypeScript | Zod (`@utmark/types`) |
| Database | SQL | PostgreSQL + PostGIS |
| iOS prototype | Swift | SwiftUI, Mapbox Maps SDK |
| Automation/config | YAML/JSON | GitHub Actions, Turbo, pnpm workspaces |

## 3) What to install (downloads)

### Required for all collaborators
- [Git](https://git-scm.com/)
- [Node.js LTS](https://nodejs.org/)
- [Cursor](https://cursor.com/) or VS Code

### Required for TypeScript/API work
- `pnpm` via Corepack:
  ```bash
  corepack enable
  corepack prepare pnpm@9 --activate
  ```
- PostgreSQL with PostGIS (local or hosted)
- Optional for local DB setup: [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Required for iOS prototype work
- macOS + full Xcode (with iOS simulator)
- Mapbox public token ([Mapbox account](https://account.mapbox.com/))

## 4) Important things to think about while coding

### API and data correctness
- Validate all incoming DTOs (`class-validator`).
- Never trust client capture coordinates without server-side checks.
- Use idempotency (`clientRequestId`) for capture to prevent duplicate scoring.
- Keep score updates inside DB transactions.

### Geospatial logic
- Use PostGIS distance checks (`ST_DWithin`) for proximity rules.
- Keep radius constants explicit and documented (capture radius, query radius).
- Be careful with coordinate order: longitude first in `ST_MakePoint(lng, lat)`.

### Security and secrets
- Never commit `.env`, tokens, or secrets.
- Use `JWT_SECRET` from environment variables only.
- Keep auth guards on protected endpoints.

### Shared contracts
- Update `packages/types` when changing request/response shapes.
- Keep API responses consistent with shared Zod types.

### Team workflow
- Use feature branches and PRs.
- Keep PRs small and testable.
- Update docs when setup or behavior changes.

## 5) Starter guide (where to start)

### Step A — clone and open

```bash
git clone <repo-url>
cd UtmarkPrototype
```

Open the repository root in Cursor:
- **File -> Open Folder...** -> select `UtmarkPrototype`

### Step B — install workspace dependencies

```bash
pnpm install
pnpm --filter @utmark/types build
```

### Step C — configure API environment

Create `apps/api/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?schema=public"
JWT_SECRET="replace-with-long-random-value"
PORT=3000
```

### Step D — run DB migration and API

```bash
cd apps/api
pnpm prisma generate
pnpm prisma migrate deploy
pnpm dev
```

Verify:
- Health: `http://localhost:3000/health`
- API base: `http://localhost:3000/v1`

### Step E — create your first branch

```bash
git checkout -b feat/your-first-task
git push -u origin feat/your-first-task
```

Then open a PR to `main`.

## 6) Module responsibility (API)

| Module | Responsibility | Main routes |
|---|---|---|
| `auth` | Register/login/JWT/current user | `POST /v1/auth/register`, `POST /v1/auth/login`, `GET /v1/auth/me` |
| `map-entities` | Nearby entities query | `GET /v1/entities?lat&lng&radiusM` |
| `capture` | Validate capture and update score | `POST /v1/capture` |
| `progress` | Return score/completions | `GET /v1/me/progress` |
| `session-seed` | Seed demo route/entities | `POST /v1/session/seed` |
| `health` | Liveness | `GET /health` |

## 7) Current status and next implementation priorities

- Backend skeleton exists in `apps/api`.
- Shared types exist in `packages/types`.
- Swift demo exists in `Sources/UtmarkPrototype`.
- Expo mobile app folder is not yet fully scaffolded.

Recommended next steps:
1. Add `apps/mobile` (Expo + TypeScript).
2. Add CI workflow (`lint`, `test`, `build`) in `.github/workflows/`.
3. Add Dockerfile for API and optional `docker-compose` for local Postgres/PostGIS.

## 8) Team docs

- Quick checklist: [`GETTING_STARTED.md`](GETTING_STARTED.md)
- Collaboration rules: [`CONTRIBUTING.md`](CONTRIBUTING.md)
- Git and GitHub workflow: [`README_GITHUB_WORKFLOW.md`](README_GITHUB_WORKFLOW.md)
- TypeScript for Java developers: [`README_TYPESCRIPT_FOR_JAVA.md`](README_TYPESCRIPT_FOR_JAVA.md)
- Terminal commands (macOS + Windows): [`README_TERMINAL_COMMANDS_MAC_WINDOWS.md`](README_TERMINAL_COMMANDS_MAC_WINDOWS.md)
