# Utmark Project Structure (Simple Guide)

This README explains the folder structure in a clear way.

**New to the project?** Start with the step-by-step setup guide: [`docs/ONBOARDING_BEGINNER.md`](docs/ONBOARDING_BEGINNER.md).

## Quick overview

- Frontend code is in `apps/mobile`
- Backend code is in `apps/api`
- Shared types are in `packages/types`
- Docker files are in `docker`
- Team documentation is in `docs`

## Run the mobile app (Expo)

```bash
cd apps/mobile
npm install
npm start
```

Then press `i` (iOS Simulator), `a` (Android), or scan the QR code with **Expo Go**. See `apps/mobile/README.md` for details.

## Folder structure

```text
UtmarkProjekt/
├─ apps/                          # Application code (frontend + backend)
│  ├─ mobile/                     # Frontend (React Native + Expo + TypeScript)
│  │  ├─ src/                     # Mobile app source code
│  │  │  ├─ screens/              # App screens (Login, Map, Profile, etc.)
│  │  │  ├─ components/           # Reusable UI parts
│  │  │  ├─ navigation/           # Navigation setup
│  │  │  ├─ services/             # Calls to backend/Supabase
│  │  │  ├─ hooks/                # Reusable React hooks
│  │  │  ├─ utils/                # Helper functions
│  │  │  └─ types/                # Mobile-only types
│  │  ├─ package.json             # Frontend dependencies/scripts
│  │  └─ tsconfig.json            # Frontend TypeScript config
│  │
│  └─ api/                        # Backend (TypeScript API)
│     ├─ src/
│     │  ├─ main.ts               # Backend entrypoint
│     │  ├─ modules/              # Feature modules (auth, routes, etc.)
│     │  ├─ middleware/           # Request/auth middleware
│     │  ├─ services/             # Business logic layer
│     │  ├─ repositories/         # Database access layer
│     │  └─ utils/                # Backend helpers
│     ├─ package.json             # Backend dependencies/scripts
│     └─ tsconfig.json            # Backend TypeScript config
│
├─ packages/                      # Shared code used by multiple apps
│  └─ types/                      # Shared TypeScript types (frontend + backend)
│
├─ docker/                        # Docker setup files
│  ├─ Dockerfile
│  ├─ docker-compose.yml
│  └─ README.md                   # Docker-specific setup instructions
│
├─ docs/                          # Team docs and onboarding guides
│  ├─ ONBOARDING_BEGINNER.md      # Full beginner install + first run (read this first)
│  ├─ README_GITHUB_WORKFLOW.md
│  ├─ README_TYPESCRIPT_FOR_JAVA.md
│  ├─ README_TERMINAL_COMMANDS_MAC_WINDOWS.md
│  ├─ README_PROJECT_STRUCTURE_AND_TOOLS.md
│  └─ README_SIMPLE_PROJECT_STRUCTURE.md
│
├─ .github/workflows/             # GitHub Actions CI workflows
├─ .gitignore                     # Git ignore rules
└─ .env.example                   # Environment template (if present at root)
```

## Where should I code?

- Working on app UI/screens? -> `apps/mobile/src`
- Working on backend logic/API? -> `apps/api/src`
- Adding shared request/response types? -> `packages/types`
- Updating setup/help docs? -> `docs`
- Updating local containers/services? -> `docker`

## Team rule of thumb

- Frontend work goes in `apps/mobile`
- Backend work goes in `apps/api`
- Shared data models go in `packages/types`
- Keep docs in `docs`
- Keep Docker files in `docker`
