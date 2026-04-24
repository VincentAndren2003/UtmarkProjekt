# CI Workflow Guide (`format.yml`)

This file explains your workflow file as we are now using github actions.

The goal is to make it easy for us in this project UTMARK to understand what happens when code is pushed or a Pull Request is created.

---

## What is this workflow?

A workflow is an automated checklist that GitHub runs for your project.

In your case, the checklist is:

1. Install dependencies
2. Check code formatting
3. Run lint checks
4. Run tests

If one step fails, the workflow fails.

---

## When does it run?

From your `format.yml`:

- On `push` to branch `main`
- On every `pull_request`

That means:

- If someone opens or updates a PR, checks run automatically.
- If someone pushes directly to `main`, checks also run.

---

## Full workflow (simple view)

Your workflow has one job called `quality`.

It runs these steps in order:

1. Checkout repository code
2. Setup Node.js 20
3. Install root dependencies
4. Install `apps/mobile` dependencies
5. Install `apps/api` dependencies
6. Run `npm run format`
7. Run `npm run lint`
8. Run `npm test`


## Everyday use

1. Run this in root directory in terminal and you can test before commits so its easier to find errors

npm run format && npm run lint && npm test

2. Or it runs automatically when pushed to github


---

## Step-by-step explanation

### 1) Checkout

```yaml
- name: Checkout
  uses: actions/checkout@v4
```

GitHub creates a fresh virtual machine, then downloads your repo into it.

Without checkout, the runner has no project files to test.

---

### 2) Setup Node.js

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'npm'
```

This installs Node.js version 20 (same runtime your project expects).

`cache: 'npm'` stores npm package cache between runs so installs are faster.

---

### 3) Install root dependencies

```yaml
- name: Install dependencies
  run: npm ci
```

`npm ci` means "clean install from lockfile".

Why use `npm ci` in CI:

- faster and more consistent than `npm install`
- uses exact versions from `package-lock.json`
- good for reproducible builds

---

### 4) Install mobile dependencies

```yaml
- name: Install mobile dependencies
  run: npm ci --prefix apps/mobile
```

`--prefix apps/mobile` means:

- run npm command inside `apps/mobile`
- install dependencies for mobile app specifically

---

### 5) Install api dependencies

```yaml
- name: Install api dependencies
  run: npm ci --prefix apps/api
```

Same idea as mobile, but for API package.

---

### 6) Check formatting

```yaml
- name: Check formatting
  run: npm run format
```

At root, your `package.json` has:

```json
"format": "npx prettier --check ."
```

This checks if files follow Prettier style rules.

- It does **not** change files.
- It fails if formatting is wrong.

---

### 7) Lint

```yaml
- name: Lint
  run: npm run lint
```

At root, your script runs:

- `lint:mobile`
- `lint:api`

Those run ESLint in each app.

Lint checks for common code problems (unused variables, suspicious patterns, hook issues, etc.).

---

### 8) Test

```yaml
- name: Test
  run: npm test
```

At root, your script runs:

- `test:mobile`
- `test:api`

Both currently use Vitest.

This confirms tests pass in both app folders.

---

## Where the real logic lives

Important beginner concept:

- `format.yml` tells GitHub **what commands to run**
- `package.json` files define **what those commands do**
- lint config files define **lint rules**
- test files define **test behavior**

In this project:

- Root scripts: `package.json`
- Mobile scripts: `apps/mobile/package.json`
- API scripts: `apps/api/package.json`
- Mobile lint rules: `apps/mobile/eslint.config.mjs`
- API lint rules: `apps/api/eslint.config.mjs`
- Tests: `apps/mobile/src/*.test.ts`, `apps/api/src/*.test.ts`

---

## How to run the same checks locally

From repo root:

```bash
npm run format
npm run lint
npm test
```

Run only one app:

```bash
npm --prefix apps/mobile run lint
npm --prefix apps/api run test
```

---

## How to read failures in GitHub Actions

If CI fails:

1. Open the failed workflow run in GitHub Actions tab
2. Open the failed step (`Check formatting`, `Lint`, or `Test`)
3. Read the error output
4. Fix locally
5. Commit and push again

Quick mapping:

- `Check formatting` failed -> run formatter / fix style
- `Lint` failed -> fix lint errors
- `Test` failed -> fix code or tests

---

## Beginner tips

- Keep steps small and clear (exactly like now).
- Use `npm ci` in CI, not `npm install`.
- Keep one source of truth for scripts in `package.json`.
- Start with warning-level lint rules, then tighten later.
- Add more tests gradually (smoke -> unit -> integration).

---

## Summary

Your `format.yml` is a quality gate for every PR and main push:

- format must pass
- lint must pass
- tests must pass

That helps catch problems early before code is merged.
