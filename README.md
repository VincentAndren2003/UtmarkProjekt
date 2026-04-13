# Getting started

The **full starter guide** for this repository (overview, both tracks, setup commands) is in **[README.md](README.md)** at the repo root.

This file is a **short checklist** for day-one workflow.

## Cursor

1. **File → Open Folder…** → select the **repository root**.
2. Install ESLint / Prettier / Prisma extensions if prompted.

## Git branches

1. Bottom-left: click the branch name → **Create new branch…** → e.g. `feat/your-topic`.
2. Commit (`Cmd+Shift+G`), **Push**, open a **Pull Request** on GitHub.

```bash
git checkout -b feat/your-topic
git push -u origin feat/your-topic
```

## TypeScript API (quick)

```bash
pnpm install
pnpm --filter @utmark/types build
# Set apps/api/.env: DATABASE_URL, JWT_SECRET — see README.md
cd apps/api && pnpm prisma generate && pnpm prisma migrate deploy && pnpm dev
```

Health: `GET http://localhost:3000/health`
