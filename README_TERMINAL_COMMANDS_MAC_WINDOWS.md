# Terminal Commands Guide for Team Collaboration

This is a practical, beginner-friendly terminal guide for daily teamwork.

- Part A is a complete guide for macOS/Linux.
- Part B is a complete guide for Windows.
- Final section includes a quick cross-platform command map.

---

## Part A: Complete guide for macOS/Linux (zsh/bash)

## A1) First 15 minutes checklist

1. Open Terminal app (or iTerm2).
2. Go to your project folder.
3. Confirm where you are.
4. Check Git branch/status.
5. Run project install/start command.

```bash
cd /path/to/UtmarkProjekt
pwd
ls -la
git branch --show-current
git status
```

What this does:
- `cd ...` enters your project folder.
- `pwd` confirms the current absolute path.
- `ls -la` lists files including hidden files (like `.gitignore`).
- `git branch --show-current` shows your active branch.
- `git status` shows branch + file change status.

## A2) Terminal basics you need every day

Understand prompt and paths:
- `~` means your home directory.
- `.` means current folder.
- `..` means parent folder.
- Paths are case-sensitive on most Linux systems.

Useful commands:

```bash
whoami
pwd
cd ~
cd ..
history
```

What this does:
- `whoami` prints your current OS username.
- `history` prints previous commands so you can repeat reliable steps.

## A3) Navigation and file/folder operations

```bash
ls
ls -la
mkdir docs
touch docs/notes.md
cp docs/notes.md docs/notes-copy.md
mv docs/notes-copy.md docs/notes-renamed.md
rm docs/notes-renamed.md
```

What this does:
- `mkdir` creates folders.
- `touch` creates an empty file.
- `cp` copies files.
- `mv` moves or renames files.
- `rm` deletes files.

Before you run destructive commands:
- Always run `pwd`.
- Use `ls` on the target folder first.
- Avoid `rm -rf` unless you are certain about the path.

## A4) Search and inspect code/files

```bash
rg "TODO"
rg "interface" --glob "*.ts"
less README_GITHUB_WORKFLOW.md
cat package.json
```

What this does:
- `rg` finds matching text in files very quickly.
- `less` opens a scrollable viewer for longer files.
- `cat` prints whole file content directly to terminal.

Tip:
- Prefer `rg` over slow manual searching when debugging.

## A5) Processes, ports, and troubleshooting

```bash
ps aux
lsof -i :3000
kill 12345
kill -9 12345
```

What this does:
- `ps aux` lists running processes.
- `lsof -i :3000` shows what is using port 3000.
- `kill 12345` sends a normal stop signal.
- `kill -9 12345` force-kills only when normal kill fails.

Common issue:
- “Port already in use” -> find process with `lsof -i :3000`, then stop it.

## A6) Environment variables (temporary vs persistent)

Temporary (current terminal only):

```bash
export API_URL="http://localhost:3000"
echo $API_URL
```

What this does:
- `export` sets variable for this shell session.
- `echo` verifies it.

Persistent (future sessions):
- Add `export API_URL="http://localhost:3000"` to `~/.zshrc` (or `~/.bashrc`), then restart terminal.

## A7) Networking and package commands

```bash
ping github.com
curl -I https://example.com
npm install
pnpm install
npm run dev
```

What this does:
- `ping` checks network reachability.
- `curl -I` fetches HTTP headers to check endpoint health.
- `npm/pnpm install` installs dependencies.
- `npm run dev` starts project dev mode.

## A8) Git workflow in terminal (team-safe sequence)

```bash
git checkout main
git pull origin main
git checkout -b feat/short-task-name
git branch --show-current
git status
git add .
git commit -m "feat: short summary"
git push -u origin feat/short-task-name
```

What this does:
- Starts from updated `main`.
- Creates isolated feature branch.
- Commits and pushes your work for PR review.

Collaboration tip:
- Keep branches short-lived and focused on one topic.

## A9) macOS/Linux common mistakes and fixes

- `command not found`:
  - Check tool install (`git --version`, `node --version`).
  - Restart terminal after install.
- `permission denied`:
  - Confirm you are in a writable folder.
  - Check file permissions.
- Wrong folder:
  - Run `pwd` and `ls` before file delete/move commands.

---

## Part B: Complete guide for Windows (PowerShell first, CMD fallback)

For team consistency, use **PowerShell** when possible.

## B1) First 15 minutes checklist

1. Open Windows Terminal -> PowerShell.
2. Move into project folder.
3. Confirm location and list files.
4. Check Git branch/status.
5. Run project install/start command.

```powershell
cd C:\path\to\UtmarkProjekt
Get-Location
Get-ChildItem -Force
git branch --show-current
git status
```

What this does:
- `Get-Location` confirms current path.
- `Get-ChildItem -Force` lists files including hidden ones.
- Git commands confirm branch and changes.

## B2) Terminal basics you need every day

PowerShell:

```powershell
whoami
Get-Location
cd ~
cd ..
Get-History
```

CMD equivalents:

```cmd
cd
cd %USERPROFILE%
cd ..
doskey /history
```

What this does:
- Helps you navigate safely and reuse known-good commands.

## B3) Navigation and file/folder operations

PowerShell:

```powershell
Get-ChildItem
mkdir docs
New-Item docs\notes.md -ItemType File
Copy-Item docs\notes.md docs\notes-copy.md
Move-Item docs\notes-copy.md docs\notes-renamed.md
Remove-Item docs\notes-renamed.md
```

CMD equivalents:

```cmd
dir
mkdir docs
type nul > docs\notes.md
copy docs\notes.md docs\notes-copy.md
move docs\notes-copy.md docs\notes-renamed.md
del docs\notes-renamed.md
```

What this does:
- Same workflow as macOS/Linux: create, copy, rename, delete.

Before you run destructive commands:
- Confirm location with `Get-Location` (or `cd` in CMD).
- Inspect target with `Get-ChildItem` or `dir`.
- Avoid recursive forced delete unless needed.

## B4) Search and inspect code/files

PowerShell:

```powershell
rg "TODO"
rg "interface" --glob "*.ts"
Get-Content README_TYPESCRIPT_FOR_JAVA.md
```

CMD:

```cmd
rg "TODO"
type README_TYPESCRIPT_FOR_JAVA.md
```

What this does:
- `rg` is still the fastest codebase text search.
- `Get-Content` and `type` print file content.

## B5) Processes, ports, and troubleshooting

PowerShell:

```powershell
Get-Process
Get-NetTCPConnection -LocalPort 3000
Stop-Process -Id 12345
```

CMD:

```cmd
tasklist
netstat -ano | findstr :3000
taskkill /PID 12345 /F
```

What this does:
- Find active processes, inspect used ports, stop stuck tasks.

Common issue:
- “Port already in use” -> find PID from connection list, then stop process.

## B6) Environment variables (temporary vs persistent)

PowerShell temporary (current session):

```powershell
$env:API_URL = "http://localhost:3000"
echo $env:API_URL
```

CMD temporary:

```cmd
set API_URL=http://localhost:3000
echo %API_URL%
```

Persistent:
- Use Windows System Settings -> Environment Variables, then open a new terminal.

## B7) Networking and package commands

```powershell
ping github.com
curl -I https://example.com
npm install
pnpm install
npm run dev
```

What this does:
- Checks network and installs/starts project dependencies.

## B8) Git workflow in terminal (team-safe sequence)

```powershell
git checkout main
git pull origin main
git checkout -b feat/short-task-name
git branch --show-current
git status
git add .
git commit -m "feat: short summary"
git push -u origin feat/short-task-name
```

What this does:
- Same safe team workflow as macOS/Linux.

## B9) Windows common mistakes and fixes

- Execution policy blocks scripts:
  - Use team-approved policy commands with your admin if needed.
- Locked file errors:
  - Close app/editor using the file, then retry.
- Wrong path separator:
  - Use `\` on Windows paths.

---

## Part C: Collaboration workflows and safety rules

## C1) Daily teamwork workflow (terminal + IDE)

1. Pull latest `main`.
2. Create feature branch.
3. Implement changes in IDE.
4. Use terminal to verify changed files (`git status`, `git diff`).
5. Commit with clear message.
6. Push branch and open PR.
7. Review comments, update branch, and re-push.

Why this works:
- Everyone sees reproducible, reviewable changes.
- Small branches reduce merge conflict risk.

## C2) Commands that help teams work better

```bash
git status
git diff
git log --oneline --decorate --graph -n 20
npm run lint
npm test
```

What this does:
- Shows current state, exact changes, and recent commit context.
- Verifies quality checks before pushing.

## C3) Safety checklist before push

- Confirm branch name is not `main`.
- Confirm only intended files are staged.
- Confirm no secrets or `.env` files are included.
- Run project checks (`lint`, `test`, or project-specific scripts).

## C4) Destructive command warning list

Review carefully before running:
- macOS/Linux: `rm -rf ...`
- PowerShell: `Remove-Item ... -Recurse -Force`
- CMD: `rmdir /s /q ...`

Rule:
- If unsure, list files first and ask a teammate before deleting recursively.

---

## Part D: Cross-platform quick map

| Task | macOS/Linux | Windows PowerShell | Windows CMD |
|---|---|---|---|
| Show current folder | `pwd` | `Get-Location` | `cd` |
| List all files | `ls -la` | `Get-ChildItem -Force` | `dir /a` |
| Find text in project | `rg "text"` | `rg "text"` | `rg "text"` |
| Show process using port 3000 | `lsof -i :3000` | `Get-NetTCPConnection -LocalPort 3000` | `netstat -ano \| findstr :3000` |
| Stop process by PID | `kill 12345` | `Stop-Process -Id 12345` | `taskkill /PID 12345 /F` |
| Set temp environment variable | `export KEY=value` | `$env:KEY = "value"` | `set KEY=value` |

Use this document as a training reference for new collaborators and as a quick refresher for everyday terminal work.
