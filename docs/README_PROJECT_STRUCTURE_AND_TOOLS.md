# Project Structure and Tools (Beginner Guide)

This file explains how we work in this project in simple terms:
- what frontend and backend mean
- where React Native and Expo fit
- how TypeScript is used
- how we organize files and folders
- what tools we use as a team

If you are new, start here before coding.

## 1) The simple idea

Our app has two main parts:

- **Frontend (mobile app)**: what users see and tap
- **Backend (data + logic)**: where data is stored and business rules run

Both can use **TypeScript**.

That means:
- one language across mobile + backend
- easier collaboration
- shared types reduce mistakes

## 2) Frontend vs backend (in plain language)

## Frontend (React Native app)

Frontend is the app on the user phone.

It handles:
- screens (login, map, profile, achievements)
- navigation between screens
- user input (buttons, forms, route actions)
- showing data from backend

It does **not** decide final secure game logic by itself.

## Backend (server/database side)

Backend handles:
- login/auth rules
- saving and reading user data
- achievements, badges, competitions, route progress
- secure validation of important actions

For this project, backend storage/auth is planned with **Supabase**.

## 3) Where React Native and Expo fit

## React Native

React Native is the framework used to build the mobile app UI.

You write components and screens in TypeScript/JavaScript, and React Native renders native mobile UI for iOS/Android.

## Expo

Expo is the tooling platform around React Native.

It helps with:
- starting local dev quickly
- testing on phone/simulator
- handling mobile build workflows
- easier use of device features

Simple relationship:
- React Native = app framework
- Expo = dev/build toolchain for that framework

## 4) Recommended folder structure

Use one repo with clearly separated folders:

```text
UtmarkProjekt/
├─ apps/
│  ├─ mobile/                 # React Native + Expo app (frontend)
│  │  ├─ src/
│  │  │  ├─ screens/
│  │  │  ├─ components/
│  │  │  ├─ features/
│  │  │  ├─ services/         # API/Supabase calls
│  │  │  └─ navigation/
│  │  ├─ app.json
│  │  └─ package.json
│  └─ api/                    # Optional custom backend (if needed later)
│     ├─ src/
│     └─ package.json
├─ packages/
│  └─ types/                  # Shared TS types/interfaces/schemas
│     ├─ src/
│     └─ package.json
├─ docs/                      # Team guides and onboarding docs
├─ .github/workflows/         # GitHub Actions (CI)
└─ README*.md
```

## 5) Where each feature belongs

- **Login/Auth UI** -> `apps/mobile/src/screens` + `apps/mobile/src/services`
- **User profile display** -> mobile screens/components
- **Routes on map** -> mobile map feature + backend/supabase route data
- **Achievements/badges/competitions**:
  - UI and interaction: mobile app
  - saved data and validation: backend/supabase
- **Shared DTO/types** -> `packages/types`

Rule of thumb:
- "How it looks" -> frontend
- "What is stored and trusted" -> backend/data layer

## 6) Tools we use and why

- **Node.js**: runtime needed for TypeScript tooling (`npm`, `tsc`, scripts)
- **TypeScript**: safer code with type checking
- **React Native**: mobile app framework
- **Expo**: fast mobile development/testing/build flow
- **Supabase**: auth + database backend services
- **Git + GitHub**: collaboration, branches, pull requests
- **GitHub Actions**: automatic checks on pull requests
- **Docker** (if used): consistent local services for all collaborators

## 7) Collaboration workflow (how we work together)

1. Pull latest `main`
2. Create feature branch
3. Build in small commits
4. Push branch and open Pull Request
5. Review + checks
6. Merge to `main`
7. Delete branch after merge

This keeps `main` stable and easy to trust.

## 8) GitHub Actions in this project

GitHub Actions are automated checks that run on PRs/pushes.

Typical checks:
- install dependencies
- typecheck
- lint
- tests
- build

Why it matters:
- catches issues early
- keeps quality consistent
- prevents broken code from reaching `main`

## 9) Important decisions for our team

- Use TypeScript in both frontend and backend.
- Keep frontend and backend separated in folders.
- Keep shared types in one package.
- Keep security-sensitive rules in backend/data layer, not only mobile app.
- Use PRs for every change.

## 10) New collaborator quick start

1. Install Node.js LTS, Git, and project package manager.
2. Clone repo and install dependencies.
3. Start mobile app (`apps/mobile`).
4. Read docs:
   - `README_GITHUB_WORKFLOW.md`
   - `README_TYPESCRIPT_FOR_JAVA.md`
   - `README_TERMINAL_COMMANDS_MAC_WINDOWS.md`
   - this file

If anything is unclear, ask in team chat before implementing assumptions.
