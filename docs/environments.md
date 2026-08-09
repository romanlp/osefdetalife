# Environment & Emulator Strategy

Decisions made to answer: "CI must run against the Firebase emulators, production
must use Firebase directly, and local dev must be able to choose between the two."

## How `useEmulators` is selected

`useEmulators` is a **build-time** flag baked into the environment file that the
active Angular configuration replaces in via `fileReplacements`
(`angular.json` → `build` → `configurations` → `fileReplacements`).

| Build configuration | Environment file | `useEmulators` | Used by |
|---------------------|------------------|----------------|---------|
| `development`       | `environment.dev.ts`  | **manual toggle** | `ng serve` (local dev) |
| `e2e`               | `environment.e2e.ts`  | `true`          | Playwright app server (local + CI) |
| `production`        | `environment.prod.ts` | `false`         | `ng build` / deploy |

`src/environments/environment.ts` (the base file) is **not** used by any
configuration and is effectively dead code for this purpose.

`main.ts` calls `connectToEmulators()` only when the active file has
`useEmulators: true` (and `connectToEmulators()` itself only connects when the
page host is `localhost`). Production never reaches that branch.

## Rules

- **Production (deploy):** `ng build` → `environment.prod.ts` →
  `useEmulators: false` → real Firebase. Never emulators.
- **CI E2E:** Playwright serves the app with `ng serve --configuration e2e`
  → `environment.e2e.ts` → `useEmulators: true`. The emulator is started with
  the **real** project ID (`firebase-crackling-fire-4704`) so the emulator, the
  browser app, and the test-side SDK (`e2e/utils/firebase.ts`) all agree on the
  same project.
- **Local dev:** flip `useEmulators` in `src/environments/environment.dev.ts`
  by hand:
  - `true` → emulators (Auth `9099`, Firestore `8081`; start with `npm run emulators`)
  - `false` → real Firebase project

## Emulator ports & project

- Firestore emulator: **8081** (was 8080 — changed to avoid a conflict with the
  SSH tunnel on 8080).
- Auth emulator: **9099**.
- Single project ID everywhere: **`firebase-crackling-fire-4704`**
  (`.firebaserc` default). Do not mix project IDs: the emulator only serves the
  project it was started with, so a mismatch shows up as Firestore "Not Found"
  errors.
- Emulator admin endpoints use the `/emulator/v1/projects/{project}/...` path
  (e.g. `e2e/utils/test-helpers.ts` clear endpoints).

## How to run

```bash
# Local dev against emulators
npm run emulators          # terminal 1
ng serve                   # terminal 2 (after setting useEmulators: true in environment.dev.ts)

# Local dev against real Firebase
ng serve                   # useEmulators: false in environment.dev.ts

# E2E (local or CI): always emulators, uses the e2e build config
npm run e2e
```

## Configuration files

| File | Purpose |
|------|---------|
| `angular.json` — build config `e2e` | Mirrors `production`, swaps in `environment.e2e.ts` |
| `angular.json` — serve config `e2e` | `ng serve --configuration e2e` on port 4210 |
| `playwright.config.ts` | Starts emulators (`--project firebase-crackling-fire-4704`) and serves `ng serve --configuration e2e` |
| `.github/workflows/test.yml` | Starts emulators, waits on 8081/9099 readiness, runs Playwright shards + burn-in against the emulators |
