# Simple Project Structure (Team Starter)

This is a simplified structure for our project so everyone can start quickly.

Use this as the default team map.

## 1) Simple folder map

```text
UtmarkProjekt/
├─ apps/
│  ├─ mobile/                      # Frontend app (React Native + Expo + TypeScript)
│  │  ├─ src/
│  │  │  ├─ screens/               # Full app pages: Login, Map, Profile
│  │  │  ├─ components/            # Reusable UI pieces: buttons, cards, modals
│  │  │  ├─ services/              # Calls to Supabase / backend
│  │  │  ├─ hooks/                 # Reusable React logic
│  │  │  ├─ navigation/            # App navigation setup
│  │  │  └─ utils/                 # Small helper functions
│  │  └─ package.json
│  │
│  └─ api/                         # Optional custom backend (add later only if needed)
│     ├─ src/
│     └─ package.json
│
├─ packages/
│  └─ types/                       # Shared TypeScript types used by mobile + backend
│
├─ docs/                           # Team docs and onboarding files
│
├─ .github/
│  └─ workflows/                   # GitHub Actions (lint/test/build checks)
│
├─ .env.example                    # Environment template (no secrets)
└─ README.md                       # Main project intro
```

## 2) What each part means

- `apps/mobile`: where most daily coding happens (frontend app)
- `apps/api`: backend logic if we need custom endpoints later
- `packages/types`: one shared source of truth for data shapes
- `docs`: guides for team workflow and setup
- `.github/workflows`: automatic checks on pull requests

## 3) Where to build each feature

- Login screen -> `apps/mobile/src/screens`
- Map UI and route display -> `apps/mobile/src/screens` + `components`
- Supabase fetch/save -> `apps/mobile/src/services`
- Shared user/route/achievement types -> `packages/types`
- Secure rule checks (if needed later) -> `apps/api` or Supabase functions

## 4) Team workflow (simple)

1. Pull latest `main`
2. Create a feature branch
3. Build small changes
4. Push branch and open PR
5. Review and merge

## 5) Recommended first implementation order

1. Create `apps/mobile` and base navigation
2. Add login flow
3. Add map screen
4. Add route/achievement screens
5. Add shared `packages/types`
6. Add CI checks in `.github/workflows`

## 6) Keep it simple rule

Start with:
- frontend in `apps/mobile`
- Supabase for auth + database

Only add `apps/api` when we really need custom server-side logic.
