# Get started with Utmark — setup + run locally

A single, beginner-friendly guide. Follow the steps in order:

1. [Mental model](#1-mental-model-what-actually-runs)
2. [Install the tools (once)](#2-install-the-tools-once)
3. [Clone the repo (once)](#3-clone-the-repo-once)
4. [Install dependencies + env files (once)](#4-install-dependencies--env-files-once)
5. [Run the stack (every time)](#5-run-the-stack-every-time)
6. [Verify it works](#6-verify-it-works)
7. [Run on a real phone](#7-run-on-a-real-phone)
8. [Daily Git workflow](#8-daily-git-workflow)
9. [Where to work in the repo](#9-where-to-work-in-the-repo)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Mental model (what actually runs)

There are two supported backend modes:

- **Mode A (microservices, recommended for the course requirement)**: Gateway + Auth service + Profile service (3 Node servers)
- **Mode B (legacy monolith)**: a single API server that contains all backend logic

### Mode A — microservices (Gateway + services)

Four things run on your machine **at the same time**:

```
 Mobile app (Expo) ──HTTP──▶ Gateway (Express) ──HTTP──▶ Auth/Profile services ──Mongoose──▶ MongoDB
 apps/mobile                  apps/api                      apps/auth-service + apps/profile-service    127.0.0.1:27017
```

- **MongoDB** stores the data.
- **Auth/Profile services** talk to MongoDB (not the Gateway).
- **Mobile app** only talks to the API (never to MongoDB directly).

If something breaks, ask: *which of the three is the problem?*

---

## 2. Install the tools (once)

| Tool | Why you need it | Install |
|---|---|---|
| **Git** | Clone the repo, commit your work | https://git-scm.com (Windows/Linux) — Mac usually has it (`git --version`) |
| **Node.js (LTS)** | Runs the API and the Expo dev server | https://nodejs.org — pick **LTS** |
| **MongoDB Community + mongosh** | The local database | **Mac:** `brew tap mongodb/brew && brew install mongodb-community mongosh` <br>**Windows/Linux:** [installer](https://www.mongodb.com/try/download/community) |
| **A code editor** | Edit files + integrated terminal | [Cursor](https://cursor.com) or [VS Code](https://code.visualstudio.com) |
| **Expo Go** (phone app) | Run the mobile app on your real phone | App Store / Play Store → search **Expo Go** |
| *(optional)* MongoDB Compass | GUI to browse the database | https://www.mongodb.com/products/compass |
| *(optional, Mac)* Xcode | iOS Simulator on your Mac | Mac App Store |
| *(optional)* Android Studio | Android emulator on Win/Linux/Mac | https://developer.android.com/studio |

**Verify after install:**

```bash
git --version
node -v
npm -v
mongosh --version
```

You should see version numbers, not "command not found".

> **iOS Simulator (Mac only):** Open Xcode once → **Settings → Platforms** → download an iOS runtime if offered. Then **Window → Devices and Simulators → +** to create an iPhone. Without this, pressing `i` in Expo prints "No iOS devices available".

---

## 3. Clone the repo (once)

```bash
cd ~
git clone https://github.com/VincentAndren2003/UtmarkProjekt.git
cd UtmarkProjekt
```

> **Windows:** use **Git Bash** or **PowerShell**. Replace `cd ~` with `cd $HOME`.

Then open the `UtmarkProjekt` folder in Cursor / VS Code (**File → Open Folder**).

---

## 4. Install dependencies + env files (once)

From the repo root:

```bash
# 1. Install everything
npm install
npm install --prefix apps/api
npm install --prefix apps/mobile

# 2. Create env files from the templates
cp apps/api/.env.example    apps/api/.env
cp apps/mobile/.env.example apps/mobile/.env

# 3. Generate a real JWT secret (copy the output)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Open `apps/api/.env` and replace `JWT_SECRET=replace_with_a_long_random_secret` with the random string you just generated.

> **Windows (PowerShell):** use `copy` instead of `cp`.

---

## 5. Run the stack (every time)

Open **5 terminals** at the repo root (microservice mode).

### Terminal 1 — MongoDB

Start it once; it auto-starts on every reboot from now on:

```bash
# Mac
brew services start mongodb-community

# Verify it's listening on port 27017
nc -z 127.0.0.1 27017 && echo "Mongo UP"
```

> **Windows:** MongoDB installs as a Windows Service and starts automatically. Verify with `Get-Service MongoDB`.

### Terminal 2 — Auth service

```bash
cd apps/auth-service
npm run dev
```

You should see:

```
MongoDB connected
auth-service listening on http://localhost:3001
```

### Terminal 3 — Profile service

```bash
cd apps/profile-service
npm run dev
```

You should see:

```
MongoDB connected
profile-service listening on http://localhost:3002
```

### Terminal 4 — Gateway

```bash
cd apps/api
npm run dev
```

You should see:

```
API listening on http://localhost:3000
```

### Terminal 5 — Mobile app

```bash
cd apps/mobile
npx expo start
```

Then in that same terminal:

- Press **`i`** → iOS Simulator (Mac + Xcode only)
- Press **`a`** → Android emulator (if installed and running)
- Press **`w`** → web browser
- Or scan the QR code with **Expo Go** on your phone (same Wi‑Fi)

---

## 6. Verify it works

### Quick API health check

```bash
curl http://localhost:3000/api/health
# → {"status":"ok"}
```

### Full flow with curl (signup → login → profile)

```bash
# Signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"email":"alice@test.com","password":"hunter2"}'

# Login and capture the token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"alice@test.com","password":"hunter2"}' \
  | python3 -c "import json,sys; print(json.load(sys.stdin)['token'])")

# Create profile (uses the token)
curl -X PUT http://localhost:3000/api/profile/me \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"username":"alice","fullName":"Alice","age":25,"gender":"female"}'

# Read it back
curl http://localhost:3000/api/profile/me -H "Authorization: Bearer $TOKEN"
```

### Test in the mobile app

In Expo Go: **Create Account** → email/password → fill profile → **Save**.

### See the data in MongoDB

```bash
mongosh mongodb://127.0.0.1:27017/utmarkprojekt --eval "
  db.users.find().toArray();
  db.profiles.find().toArray();
"
```

Or open **MongoDB Compass** → connect to `mongodb://127.0.0.1:27017` → click `utmarkprojekt` → `users` / `profiles`.

### Wipe the database (start fresh)

```bash
mongosh mongodb://127.0.0.1:27017/utmarkprojekt --eval "db.dropDatabase()"
```

---

## 7. Run on a real phone

By default the mobile app calls `http://localhost:3000`. On a real phone, `localhost` means *the phone itself*, not your computer — so the request fails.

**Fix:** find your computer's LAN IP and put it in `apps/mobile/.env`.

```bash
# Mac / Linux
ipconfig getifaddr en0      # e.g. 192.168.1.110

# Windows (PowerShell)
ipconfig
```

Edit `apps/mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.110:3000
```

Then press **`r`** in the Expo terminal to reload. Phone and computer must be on the **same Wi‑Fi**.

> Network blocking the connection? Restart Expo with `npx expo start --tunnel` — it routes through Expo's servers.

---

## 8. Daily Git workflow

Always start from a fresh `main`:

```bash
git checkout main
git pull origin main
```

Make a branch for each task:

```bash
git checkout -b feat/short-task-name
```

After editing files:

```bash
git status
git add .
git commit -m "feat: short description of what you did"
git push -u origin feat/short-task-name
```

Then open a **Pull Request** on GitHub into `main`. Details in [`README_GITHUB_WORKFLOW.md`](README_GITHUB_WORKFLOW.md).

---

## 9. Where to work in the repo

| What you're doing | Where |
|---|---|
| Mobile screens, UI, app logic | `apps/mobile/src/` |
| API routes, controllers, models | `apps/api/src/` |
| Shared TypeScript types | `packages/types/src/` |
| Team docs | `docs/` |

Root [`README.md`](../README.md) is the short map of the repo.

---

## 10. Troubleshooting

| Problem | Fix |
|---|---|
| `MongooseServerSelectionError` | Mongo isn't running → `brew services start mongodb-community` |
| `Missing required env var` | You skipped step 4 → `cp .env.example .env` and fill `JWT_SECRET` |
| `EADDRINUSE :::3000` | Old API still running → `lsof -i :3000` then `kill <PID>` |
| Mobile app: `Network request failed` | Wrong IP in `apps/mobile/.env` → use your LAN IP, press `r` in Expo |
| QR scan does nothing | Phone and computer aren't on the same Wi‑Fi — try `npx expo start --tunnel` |
| `409 Email already in use` | Use a new email or wipe the DB (see step 6) |
| `npm: command not found` | Install Node LTS, then restart your terminal |
| `No iOS devices available` (Mac) | Open Xcode → Settings → Platforms → install iOS runtime → create an iPhone simulator |
| TypeScript errors confusing you | From `apps/mobile` or `apps/api`: `npx tsc --noEmit` shows them all at once |

---

## Day‑one checklist

- [ ] Install Git, Node LTS, MongoDB, an editor, Expo Go
- [ ] `git clone` → `cd UtmarkProjekt`
- [ ] `npm install` (root + `apps/api` + `apps/mobile`)
- [ ] Copy `.env.example` → `.env` in both apps; set `JWT_SECRET`
- [ ] Mongo running → API running → Expo running (3 terminals)
- [ ] `curl http://localhost:3000/api/health` → `{"status":"ok"}`
- [ ] Create an account in the app and see it appear in Compass

---

## Related docs

- [`README_GITHUB_WORKFLOW.md`](README_GITHUB_WORKFLOW.md) — branches, PRs, merging
- [`README_TERMINAL_COMMANDS_MAC_WINDOWS.md`](README_TERMINAL_COMMANDS_MAC_WINDOWS.md) — terminal basics
- [`README_TYPESCRIPT_FOR_JAVA.md`](README_TYPESCRIPT_FOR_JAVA.md) — TypeScript primer
- [`HOW_IT_WORKS.md`](HOW_IT_WORKS.md) — how the stack fits together
- [`MIGRATION_TUTORIAL.md`](MIGRATION_TUTORIAL.md) — file-by-file walkthrough of the code
