# Git and GitHub Collaboration Workflow

This guide gives a complete team workflow for branching, committing, pushing, opening pull requests, resolving merge conflicts, and safely merging to `main`.

## 1) Start here after you already have the repo

Use this exact flow every time you start a new task.

### 1. Open terminal in the repository folder

```bash
cd /path/to/UtmarkProjekt
```

This moves you into the project folder so all Git commands run in the correct repo.

### 2. Check which branch you are on right now

```bash
git branch --show-current
```

This prints your active branch name (you usually want to start from `main`).

You can also run:

```bash
git status
```

This confirms branch name and whether your working tree is clean.

### 3. Switch to `main` if needed

```bash
git checkout main
```

This puts you on `main` so your new branch starts from the latest base branch.

### 4. Pull newest changes from GitHub

```bash
git pull origin main
```

This updates local `main` with the newest commits from remote `main`.

### 5. Create a new branch named after your task

```bash
git checkout -b feat/add-capture-validation
```

This creates a branch and switches to it immediately.

Name pattern suggestions:

- `feat/what-you-are-building`
- `fix/what-you-are-fixing`
- `docs/what-you-are-documenting`
- `chore/maintenance-task`

### 6. Verify you are really on the new branch

```bash
git branch --show-current
```

This should show your new branch (for example `feat/add-capture-validation`).

### 7. Write or edit code/files in your IDE

Make your changes in Cursor or another IDE, then return to terminal.

IDE checks:

- Bottom status bar usually shows current branch name
- Source control panel shows changed files

### 8. Check exactly what changed

```bash
git status
```

This lists changed and untracked files.

Optional detailed diff:

```bash
git diff
```

This shows line-by-line unstaged changes.

### 9. Stage your files

Stage specific files (safer):

```bash
git add path/to/file.ts path/to/file.md
```

This stages only the files you name.

Or stage everything in current repo folder:

```bash
git add .
```

This stages all changed/new files.

### 10. Commit your work

```bash
git commit -m "feat: add capture validation service"
```

This saves a snapshot of staged changes in your current branch.

Good commit type prefixes:

- `feat:` new behavior
- `fix:` bug fix
- `docs:` documentation only
- `refactor:` internal code improvement
- `test:` test changes

### 11. Push your branch to GitHub

First push for a new branch:

```bash
git push -u origin feat/add-capture-validation
```

This uploads your branch and sets upstream tracking.

Later pushes to the same branch:

```bash
git push
```

This sends your latest local commits to the same remote branch.

### 12. Open a pull request (PR) to get code into `main`

Option A (GitHub website):

1. Open the repo on GitHub
2. Click **Compare & pull request** on your branch
3. Set base = `main`, compare = your branch
4. Add title + description + test notes
5. Create PR

Option B (GitHub CLI):

```bash
gh pr create --base main --head feat/add-capture-validation --title "feat: add capture validation service" --body "Summary and test plan"
```

This opens a PR from your branch into `main` from terminal.

### 13. After PR approval, merge into `main`

Usually done in GitHub UI by clicking **Merge pull request** (or **Squash and merge**, based on team rule).

### 14. Sync your local `main` after merge

```bash
git checkout main
git pull origin main
```

This ensures your local `main` has the merged result.

### 15. Optional cleanup: delete merged branch

Delete local branch:

```bash
git branch -d feat/add-capture-validation
```

This removes your local branch after it is merged.

Delete remote branch:

```bash
git push origin --delete feat/add-capture-validation
```

This removes the branch from GitHub.

## 4) Pull request workflow

1. Push branch
2. Open PR from your branch into `main`
3. Fill PR template with summary and testing notes
4. Request review
5. Address comments with additional commits
6. Merge only when checks pass and approvals are complete

CLI option (if GitHub CLI is installed):

```bash
gh pr create --base main --head feat/short-description --title "feat: ..." --body "Summary and test plan"
```

## 5) Keep your branch updated with `main`

Use this often to reduce conflicts:

```bash
git checkout main
git pull origin main
git checkout feat/short-description
git merge main
```

If merge succeeds:

```bash
git push
```

## 6) Merge conflict resolution (step by step)

When `git merge main` reports conflicts:

1. Run:
   ```bash
   git status
   ```
2. Open each conflicted file and find markers:
   - `<<<<<<< HEAD`
   - `=======`
   - `>>>>>>> main`
3. Edit file to keep the correct final version
4. Remove all conflict marker lines
5. Stage resolved files:
   ```bash
   git add path/to/conflicted-file.ts
   ```
6. Complete merge commit:
   ```bash
   git commit
   ```
7. Push:
   ```bash
   git push
   ```

Verify no remaining conflicts:

```bash
git status
```

## 7) Merge to `main` (maintainer flow)

Recommended through GitHub UI:

- Click **Merge pull request** (or **Squash and merge** based on team preference)

Then sync local:

```bash
git checkout main
git pull origin main
```

Delete merged branch locally:

```bash
git branch -d feat/short-description
```

Delete merged branch remotely:

```bash
git push origin --delete feat/short-description
```

## 8) Common problems and fixes

### Problem: pushed to wrong branch

If not committed yet:

```bash
git stash
git checkout correct-branch
git stash pop
```

If committed on wrong branch:

```bash
git checkout wrong-branch
git log --oneline -n 3
git checkout correct-branch
git cherry-pick <commit-hash>
```

### Problem: `git push` rejected (non-fast-forward)

Your branch is behind remote:

```bash
git pull --rebase origin feat/short-description
git push
```

### Problem: accidentally committed large or secret file

Do not push. Remove it from the commit history before sharing with team. Notify maintainers immediately if any secret was already pushed.

### Problem: detached HEAD

Create a branch from current state:

```bash
git switch -c rescue/detached-work
```

## 9) Team checklist (copy before each PR)

- Branch created from latest `main`
- Small, focused commits with clear messages
- Tests/lint run locally (if available)
- PR includes summary and test notes
- Branch updated with latest `main`
- Merge conflicts resolved cleanly
- CI checks green before merge

## 10) High-value commands quick reference

```bash
git status
git log --oneline --decorate --graph -n 20
git checkout -b feat/my-feature
git add .
git commit -m "feat: ..."
git push -u origin feat/my-feature
git pull origin main
git merge main
git branch -d feat/my-feature
```
