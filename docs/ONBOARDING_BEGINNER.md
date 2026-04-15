# Utmark — New collaborator setup (beginner, step by step)

This guide is for someone who is **new to programming workflows**. It explains **what to install**, **why**, and **exact commands** to work on this repo (Expo app in `apps/mobile`, optional Docker in `docker`).

---

## Part A — What you are setting up (simple mental model)

1. **Git** — download the project and save your changes in a controlled way.
2. **Node.js** — runs JavaScript/TypeScript tooling (`npm`, Expo).
3. **A code editor** — Cursor or VS Code to edit files.
4. **Expo / React Native** — the mobile app in `apps/mobile` (dependencies install via `npm`, not a separate “Expo coding app”).
5. **Optional: Xcode (Mac only)** — gives you an **iPhone on screen** (Simulator).
6. **Optional: Android Studio** — gives you an **Android phone on screen** (emulator), on any OS.
7. **Optional: Docker** — only if you use local database tools from `docker/`.

You do not need to understand everything on day one. Follow the steps in order.

---

## Part B — Accounts (do this first)

1. **GitHub account** (if you do not have one): [https://github.com/signup](https://github.com/signup)  
   **Why:** The code lives on GitHub; you clone and open pull requests.

2. Ask the project owner to **add you as a collaborator** on the repo before you rely on private access.

---

## Part C — Install tools (everyone: Mac, Windows, Linux)

### 1) Git

- **Mac:** Often preinstalled. Check in Terminal: `git --version`  
  If missing: install **Xcode Command Line Tools** when macOS prompts, or install Git from [https://git-scm.com](https://git-scm.com).

- **Windows:** Install **Git for Windows** from [https://git-scm.com](https://git-scm.com) (includes Git Bash).

- **Linux:** Use your package manager, e.g. Ubuntu:  
  `sudo apt update && sudo apt install git`

**Why:** Without Git you cannot clone or push.

---

### 2) Node.js (LTS)

- Download **LTS** from [https://nodejs.org](https://nodejs.org) and install (default options are fine).

**Why:** Provides `node` and `npm`. The mobile app and Expo run through npm.

**Check after install** (same on Mac / Windows / Linux):

```bash
node -v
npm -v
```

You should see version numbers, not “command not found”.

---

### 3) Code editor: Cursor or VS Code

- **Cursor:** [https://cursor.com](https://cursor.com)
- **VS Code:** [https://code.visualstudio.com](https://code.visualstudio.com)

**Why:** Edit project files and use an integrated terminal.

---

### 4) Expo Go on your phone (optional but very useful)

- iPhone: App Store → search **Expo Go**
- Android: Play Store → **Expo Go**

**Why:** Scan the QR code from the dev server to run the app on a real device without Simulator.

---

## Part D — Mac only: iOS Simulator (iPhone on your Mac screen)

You need **full Xcode** from the App Store (large download).

1. Open **App Store** → search **Xcode** → Install.
2. Open **Xcode** once; accept license if asked.
3. **Xcode → Settings → Platforms** (or **Components** on older Xcode): download an **iOS Simulator** runtime if offered.
4. **Window → Devices and Simulators → Simulators → +** → create an **iPhone** simulator.

**Why:** Expo’s `i` shortcut needs at least one bootable iOS simulator. If none exists, you see: `No iOS devices available in Simulator.app`.

**Quick check (Terminal on Mac):**

```bash
xcrun simctl list devices available
```

You should see iPhone entries.

---

## Part E — Windows / Linux: Android emulator (optional)

If you do not use a physical Android phone:

1. Install **Android Studio** from [https://developer.android.com/studio](https://developer.android.com/studio)
2. Open Android Studio → **More Actions → Virtual Device Manager** → create a **Pixel** (or any) device → download a system image if asked → finish.

**Why:** Expo’s `a` opens the app on the Android emulator.

---

## Part F — Clone the project (first time)

**Mac / Linux (Terminal):**

```bash
cd ~
git clone https://github.com/VincentAndren2003/UtmarkProjekt.git
cd UtmarkProjekt
```

**Windows (PowerShell or Git Bash):**

```powershell
cd $HOME
git clone https://github.com/VincentAndren2003/UtmarkProjekt.git
cd UtmarkProjekt
```

Use the **real repo URL** your team gives you if it differs.

**Why `git clone`:** Downloads the full project.  
**Why `cd UtmarkProjekt`:** All next commands must run inside this folder.


---

## Part G — Open the project in your editor

- Cursor / VS Code: **File → Open Folder** → select the **`UtmarkProjekt`** folder (the repo root).

**Why:** You see `README.md`, `apps/`, `docs/`, etc. in one place.

**Also** run `npm install` in the main project folder. You can do this via the integrated terminal in your editor. 
This will make sure that automatic formatting of the code is done when you do a commit. 

---

## Part H — Run the mobile app (Expo) — main workflow

**Same commands on Mac, Windows, Linux:**

```bash
cd apps/mobile
npm install
npm start
```

**What happens:**

- `cd apps/mobile` — enter the mobile app folder.
- `npm install` — downloads dependencies (first time can take a few minutes).
- `npm start` — starts the Expo dev server; you see a QR code and a menu.

**Then, in that same terminal** (where `npm start` is running):

- Press **`i`** — open **iOS Simulator** (**Mac + Xcode only**).
- Press **`a`** — open **Android emulator** (if installed and running).
- Press **`w`** — open **web** (if the project supports it).
- Or scan the **QR code** with **Expo Go** on your phone (same Wi‑Fi as the computer).

**If the phone cannot connect**, stop with `Ctrl+C` and try:

```bash
npx expo start --tunnel
```

**Why tunnel:** Some networks block device-to-computer connection; tunnel routes through Expo’s servers.

---

## Part I — Quick “does TypeScript work?” check (optional)

With terminal in `apps/mobile`:

```bash
npx tsc --noEmit
```

No errors printed usually means OK.

---

## Part J — Optional: local database with Docker (only if your team uses it)

**Install Docker Desktop** (Mac/Windows) or Docker Engine (Linux): [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)

**Mac / Linux:**

```bash
cd docker
cp .env.example .env
docker compose up -d --build
```

**Windows (PowerShell):**

```powershell
cd docker
copy .env.example .env
docker compose up -d --build
```

Follow [`docker/README.md`](../docker/README.md) for pgAdmin URL and login.  
**Why:** Local Postgres + pgAdmin for development. **Not required** only to see the Expo UI.

---

## Part K — Daily Git workflow (how you save work for the team)

Always start updated:

```bash
git checkout main
git pull origin main
```

Create a branch for your task:

```bash
git checkout -b feat/your-short-task-name
```

After you change files:

```bash
git status
git add .
git commit -m "feat: short description of what you did"
git push -u origin feat/your-short-task-name
```

Then open a **Pull Request** on GitHub into `main` (see [`README_GITHUB_WORKFLOW.md`](README_GITHUB_WORKFLOW.md)).

**Why branches:** Keeps `main` stable and lets others review your changes.

---

## Part L — Where to work in this repo

| What you do                    | Where                             |
| ------------------------------ | --------------------------------- |
| Mobile UI, screens, app logic  | `apps/mobile` (especially `src/`) |
| Backend API (when implemented) | `apps/api`                        |
| Shared types                   | `packages/types`                  |
| Team guides                    | `docs/`                           |
| Docker / local DB              | `docker/`                         |

Root [`README.md`](../README.md) is the short map of the repo.

---

## Part M — Troubleshooting (short)

| Problem                          | What to try                                                                             |
| -------------------------------- | --------------------------------------------------------------------------------------- |
| `npm: command not found`         | Install Node LTS, restart terminal.                                                     |
| `No iOS devices available` (Mac) | Xcode: download Simulator runtime; Devices and Simulators → create + boot an iPhone.    |
| Phone won’t load app             | Same Wi‑Fi; try `npx expo start --tunnel`.                                              |
| Old `expo-cli` warnings          | Use project’s `npm start` / `npx expo start`; uninstall global `expo-cli` if installed. |

---

## Part N — Minimum “day one” checklist

1. Install **Git**, **Node LTS**, **Cursor/VS Code**.
2. On **Mac**: install **Xcode** if you want iOS Simulator.
3. `git clone` → `cd UtmarkProjekt`.
4. `cd apps/mobile` → `npm install` → `npm start`.
5. Press **`i`** (Mac) or scan QR with **Expo Go**, or **`a`** on Android.
6. Use a **feature branch** + **PR** for real changes.

---

## Related docs

- [README_GITHUB_WORKFLOW.md](README_GITHUB_WORKFLOW.md) — branches, PRs, merge
- [README_TERMINAL_COMMANDS_MAC_WINDOWS.md](README_TERMINAL_COMMANDS_MAC_WINDOWS.md) — terminal basics
- [README_TYPESCRIPT_FOR_JAVA.md](README_TYPESCRIPT_FOR_JAVA.md) — TypeScript primer
- [`apps/mobile/README.md`](../apps/mobile/README.md) — Expo run commands
