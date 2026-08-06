---
baseline_commit: 7fdc494
status: done
---

# Story 1.7: Onboarding Completion & Deploy

Status: done

## Story

As a restaurant owner,
I want to see my embed code and know how to deploy the widget,
so that I can add the booking widget to my website.

## Acceptance Criteria

**Given** the owner completes onboarding
**When** they are redirected from the wizard
**Then** the Deploy page is shown in the dashboard sidebar
**And** the page displays the embed code snippet with the restaurant's slug

**Given** the Deploy page
**When** the owner views the embed code
**Then** it includes a `<script>` tag pointing to the widget bundle
**And** it includes a `<booking-widget restaurant="{slug}">` element

**Given** the Deploy page
**When** the owner clicks the copy button
**Then** the embed code is copied to the clipboard
**And** a confirmation message "Copied!" is shown

**Given** the Deploy page
**When** the owner clicks the demo page link
**Then** a new tab opens with the demo page
**And** the demo page renders the widget with the restaurant's configuration

**Given** the dashboard
**When** the owner signs in after completing onboarding
**Then** they land on the dashboard (not the onboarding wizard)
**And** the sidebar shows all navigation items (Bookings, Info, Hours, Tables, Branding, Deploy, Account)

## Tasks / Subtasks

- [x] Task 1: Dashboard Shell + Sidebar (AC: 1, 5)
  - [x] Subtask 1.1: Create `src/dashboard/shell/dashboard-shell.component.{ts,html,scss,spec.ts}` — layout: fixed sidebar (240px) + `<router-outlet>` content area, dark-mode aware via existing theme classes
  - [x] Subtask 1.2: Create `src/dashboard/shell/dashboard-sidebar.component.{ts,html,scss,spec.ts}` — nav list with exactly these items in this order: Bookings, Info, Hours, Tables, Branding, Deploy, Account
  - [x] Subtask 1.3: Nav item = icon + label (mat-icon + text); active item gets sage left-border per UX-DR7; use `routerLink` + `routerLinkActive` with `[routerLinkActiveOptions]="{ exact: true }"` so only one item is active at a time (home-linked items route to `''`)
  - [x] Subtask 1.4: Deploy item links to `/dashboard/deploy`; the other six items link to the dashboard home placeholder (route `''`) until their pages land in Epic 3
  - [x] Subtask 1.5: Wrap dashboard routes in the shell: `dashboard.routes.ts` gets a shell parent route with children `''` (existing `HomePageComponent`) and `deploy` (new DeployPageComponent, lazy `loadComponent`)
  - [x] Subtask 1.6: Update onboarding completion redirect to land on `/dashboard/deploy` — change the two `router.navigate(['/dashboard'])` calls in BrandingPageComponent ("Complete" and "Skip", lines ~129/~155) to `['/dashboard/deploy']` (UX EXPERIENCE.md:57 "redirect to Deploy page showing embed code"); e2e re-verifies

- [x] Task 2: Deploy Page (AC: 1, 2, 3, 4)
  - [x] Subtask 2.1: Create `src/dashboard/pages/deploy/deploy-page.component.{ts,html,scss,spec.ts}` with `osef-` selector prefix
  - [x] Subtask 2.2: Load current user (`AuthService`) → `onboardingService.getRestaurantByOwner(user.uid)` → restaurant `slug`; loading + error states (reuse 1-6 patterns: `loading` signal, `data-testid`, `aria-busy`)
  - [x] Subtask 2.3: Build embed snippet: `<script src="{widgetBundleUrl}" type="module"></script>` + `<booking-widget restaurant="{slug}"></booking-widget>` (AD-1 format), shown in a read-only `<code>` block
  - [x] Subtask 2.4: Copy button → `navigator.clipboard.writeText(snippet)`; on success show `role="status"` "Copied!" confirmation, auto-hide after ~2s; on failure show an error message (do NOT show "Copied!")
  - [x] Subtask 2.5: "View demo page" link → opens in new tab (`target="_blank"` + `rel="noopener"`), URL = demo page origin + `/assets/demo.html?slug={slug}`
  - [x] Subtask 2.6: Style per DESIGN.md: centered card, max-width 480px, warm linen background, dark-mode aware

- [x] Task 3: Widget Bundle URL + Demo Page (AC: 2, 4)
  - [x] Subtask 3.1: Add `widgetBundleUrl` to `src/environments/environment.ts`, `environment.prod.ts`, and any dev variant; prod default `https://firebase-crackling-fire-4704.web.app/widget/booking-widget.mjs`; dev default same-origin `http://localhost:4200/widget/booking-widget.mjs`
  - [x] Subtask 3.2: Wire build so `dist/widget/booking-widget.mjs` (vite lib output, run `build:widget`) is copied into the hosting output under `/widget/` — e.g. an angular.json `assets` entry globbing `dist/widget` → `/widget/`; document the `build:widget` → `ng build` ordering (also in `package.json` script if a combined `build` is added)
  - [x] Subtask 3.3: Create minimal standalone `src/assets/demo.html` — inline CSS only, loads the widget bundle via `<script type="module" src="/widget/booking-widget.mjs">` (relative path resolves on the hosting origin in both dev localhost:4200 and prod), reads `?slug=` from the URL and renders `<booking-widget restaurant="{slug}">`; served at `/assets/demo.html` (survives the hosting rewrite because it is a real static file)
  - [x] Subtask 3.4: Note in dev notes: full demo-page UX (slug input + "Load Widget" button, Story 2.6) and Firestore-backed widget rendering (Story 2.1) are Epic 2 scope — this story only needs the page to render the widget element with the slug

- [x] Task 4: Unit Tests (AC: 1, 2, 3, 4, 5)
  - [x] Subtask 4.1: DeployPageComponent — renders restaurant slug inside `<booking-widget restaurant="...">` and inside the `<script>` src
  - [x] Subtask 4.2: DeployPageComponent — copy button calls `navigator.clipboard.writeText` with the full snippet and shows "Copied!"; rejects show error, not "Copied!"
  - [x] Subtask 4.3: DeployPageComponent — demo link `href` contains `/assets/demo.html?slug=...` and has `target="_blank"` + `rel="noopener"`
  - [x] Subtask 4.4: Sidebar — renders exactly the 7 items in order (Bookings, Info, Hours, Tables, Branding, Deploy, Account); active state on current route
  - [x] Subtask 4.5: Shell — renders sidebar + router-outlet; `dashboard.routes.ts` lazy-loads `deploy`

- [x] Task 5: E2E Tests (AC: 1, 2, 3, 4, 5)
  - [x] Subtask 5.1: Extend `e2e/fixtures/onboarding.fixture.ts` with a dashboard/deploy fixture (onboarded user + completed restaurant), reusing existing factory + auth helpers
  - [x] Subtask 5.2: `e2e/tests/deploy-flow.spec.ts` — sign in → land on dashboard → sidebar shows the 7 items → Deploy page shows embed code containing the restaurant's slug → copy → "Copied!" visible → demo link has correct `?slug=`; grant clipboard permission in the Playwright context (`context.grantPermissions(['clipboard-read', 'clipboard-write'])`) or stub the clipboard so `writeText` resolves and the "Copied!" state is asserted
  - [x] Subtask 5.3: Verify existing `widget-embed.spec.ts` still passes (bundle embeddability must not regress)

## Dev Notes

### What already exists (do NOT rebuild)

- **Onboarding completion redirect** currently goes to `/dashboard` in `src/app/onboarding/branding-page/branding-page.component.ts` (`Complete`/`Skip` handlers, lines ~129/155). Per UX EXPERIENCE.md:57 it must land on the **Deploy page** — change both targets to `/dashboard/deploy` (Task 1.6). The guard + redirect mechanism stays as-is.
- **Dashboard is guarded** by `[isAuthenticatedGuard, isOnboardedGuard]` (`src/app/app.routes.ts`); guards already send onboarded users to the dashboard and non-onboarded users to `/onboarding`. AC 5's "land on dashboard, not the wizard" is guard behavior — verify via e2e, do not re-implement.
- **Widget** (`src/widget/booking-widget.ts`): LitElement with `@property restaurant: string`; builds via `vite.config.ts` lib mode → `dist/widget/booking-widget.mjs`. It currently renders placeholder data (`// TODO: Load restaurant data from Firestore using slug`). Embed format must be `<script>` + `<booking-widget restaurant="slug">` per AD-1.
- **OnboardingService** (`src/app/services/onboarding.service.ts`): reuse `getRestaurantByOwner(user.uid)` → `Restaurant` (has `slug`); `updateRestaurant` exists. No new service methods needed.
- **HomePageComponent** placeholder (`src/dashboard/pages/home/`) stays as the destination for the six non-Deploy nav items.
- **e2e foundations**: `e2e/fixtures/onboarding.fixture.ts` (onboarded user), factories, `e2e/utils/firebase.ts` (emulator wiring). Dashboard route has no fixture yet — extend, don't create from scratch.

### Component conventions (must follow)

- Standalone components (standalone is default in Angular 22+; do NOT set `standalone: true`), `osef-` selector prefix, signals for state, `input()`/`output()` functions, `computed()` for derived state, `inject()` for DI.
- No `@HostBinding`/`@HostListener` (use `host` in decorator); no `ngClass`/`ngStyle`; native control flow (`@if`/`@for`); external templates/styles with paths relative to the TS file; `OnPush` is default — do not set explicitly.
- Axe/WCAG AA: the "Copied!" confirmation must be announced (use `role="status"`/`aria-live="polite"`), copy button needs an accessible name, demo link uses `rel="noopener"`, loading/error states follow 1-6's `data-testid` + `aria-busy` pattern.
- No new dependencies. `navigator.clipboard` is a standard Web API (secure context — localhost and https both qualify; guard rejection with try/catch).
- Follow the existing 1-4/1-5/1-6 page style: centered card, `max-width: 480px`, warm linen palette, dark-mode aware (theme classes are applied globally by `ThemingService`; the pages already handle both).

### Scope decisions (flagged)

1. **Sidebar scope**: AC 5 + FR-41 ("Deploy page shown in dashboard sidebar") require the full 7-item sidebar in this story, even though the destination pages are Epic 3 work. Sidebar nav labels use the short forms from the AC (Bookings, Info, Hours, Tables, Branding, Deploy, Account); UX docs use longer labels (Restaurant Info, Opening Hours, Table Groups, White Label). The six non-Deploy items route to the existing home placeholder. Sign-out (bottom of sidebar per UX) is NOT in scope — it belongs to Epic 3 (Account/3.1). Note in `deferred-work.md` that Story 3.1 "Dashboard Layout & Sidebar" overlaps the shell built here and should reconcile (e.g. become page work + sign-out + collapse-to-icons).
2. **Demo page scope**: AC 4 requires a demo page link + rendered widget. Full demo-page UX (slug input + "Load Widget", Story 2.6) and Firestore-backed widget rendering (Story 2.1) are Epic 2 work. This story delivers a minimal standalone `demo.html` that embeds the widget with the `?slug=` param so the AC's link + new-tab + element-render requirements are met structurally. The widget will show placeholder data until Epic 2.
3. **Widget bundle hosting**: The bundle is not currently served by Firebase Hosting (hosting `public: dist/browser`, rewrite `** → /index.html`). Served static files win over the rewrite, so copying the bundle to `/widget/booking-widget.mjs` and `demo.html` to `/assets/` in the hosting output makes both resolvable in dev (localhost:4200) and prod. Verify copy wiring in the build; if angular.json assets-from-`dist/widget` causes ordering issues, an explicit post-build copy step is acceptable. **Verify the prod `widgetBundleUrl` against the real hosting domain before release** — the repo's firebase config is inconsistent (`projectId: firebase-crackling-fire-4704` vs `authDomain: crackling-fire-4704.firebaseapp.com`); the e2e suite deliberately uses the "real" project ID, so confirm the hosting URL (e.g. `firebase hosting:sites` / console) when setting the prod default.

### Testing standards

- Unit: Vitest, colocated `*.spec.ts`, Jasmine-style; mock `OnboardingService`/Firestore and stub `navigator.clipboard` in specs (Jasmine `spyOn`); follow 1-6's component test patterns.
- E2E: Playwright, `e2e/tests/*.spec.ts`, fixtures in `e2e/fixtures/`; keep the shared-auth-singleton constraint in mind (disable `fullyParallel` for deploy-flow if it touches auth like other specs do).
- Run: `npm run lint`, the affected unit tests, and the e2e deploy-flow + widget-embed specs before finishing.

### Known deferred work (out of scope — acknowledge in notes, do not fix)

- Guards issue a live Firestore query per navigation (no caching) — `deferred-work.md`.
- `createdAt` declared `Date` but written as `serverTimestamp()` — `deferred-work.md`.
- `FormsModule` used across onboarding though Signal Forms are preferred — not relevant here (no form on this page).

### References

- Story source/ACs: `_bmad-output/planning-artifacts/epics.md` — "Story 1.7: Onboarding Completion & Deploy"
- Requirements: `_bmad-output/planning-artifacts/prds/prd-osefdetalife-2026-07-12/prd.md` — FR-40, FR-41, FR-42, FR-43; success metric SM-4
- Architecture: `_bmad-output/planning-artifacts/architecture/architecture-osefdetalife-2026-07-12/ARCHITECTURE-SPINE.md` — AD-1 (embed format `<script>` + custom element), AD-2 (direct Firebase from browser)
- UX: `_bmad-output/planning-artifacts/ux-designs/ux-osefdetalife-2026-07-14/EXPERIENCE.md` — Information Architecture table (sidebar items), lines 39-47, 102 (Deploy page: embed code block + copy button + demo link), 173 (Maria pastes embed code); `DESIGN.md` line 148 (sidebar active sage left border), line 121 (240px sidebar layout)
- Previous story pattern: `_bmad-output/implementation-artifacts/1-6-onboarding-branding-step.md` (page component structure, loading/error/busy patterns, `data-testid`, spec layout)
- Routes: `src/app/app.routes.ts` (dashboard lazy + guards), `src/dashboard/dashboard.routes.ts` (currently single `''` child)
- Services: `src/app/services/onboarding.service.ts` (`getRestaurantByOwner`), auth service for `user.uid`
- Widget/build: `src/widget/booking-widget.ts`, `vite.config.ts` (lib build → `dist/widget/booking-widget.mjs`)
- Hosting/env: `firebase.json` (public `dist/browser`, rewrite, emulators auth 9099 / firestore 8081 / hosting 4200), `src/environments/environment*.ts` (projectId `firebase-crackling-fire-4704`)
- e2e: `e2e/fixtures/onboarding.fixture.ts`, `e2e/utils/firebase.ts`, `e2e/tests/widget-embed.spec.ts`, `e2e/tests/dashboard-flow.spec.ts`
- Deferred work: `_bmad-output/implementation-artifacts/deferred-work.md`

### ATDD Artifacts

- Checklist: `_bmad-output/test-artifacts/atdd-checklist-1-7-onboarding-completion-deploy.md` (RED phase — 27 scaffolds)
- E2E tests: `e2e/tests/deploy-flow.spec.ts` (5 tests, red-phase scaffolds)
- Component tests: `src/dashboard/pages/deploy/deploy-page.component.spec.ts` (12), `src/dashboard/shell/dashboard-sidebar.component.spec.ts` (8), `src/dashboard/shell/dashboard-shell.component.spec.ts` (2)

## Dev Agent Record

### Agent Model Used

- opencode / big-pickle (CLI agent session)

### Debug Log References

- `/tmp/ngtest-red-17.log` — RED run: compile failures for the 3 missing components (confirmed contract)
- `/tmp/ngtest-green-17*.log` — `npx ng test --watch=false` runs (final: 164/164 passed, 21 files)
- `/tmp/lint-17.log` — `ng lint` clean
- `/tmp/widget-build-17.log` — `npm run build:widget` → `dist/widget/booking-widget.mjs` (24.07 kB)
- `/tmp/e2e-deploy-17.log` — `npx playwright test e2e/tests/deploy-flow.spec.ts` (5/5 passed)
- `/tmp/e2e-regress-17b.log` — `widget-embed.spec.ts` (4/4) + `dashboard-flow.spec.ts` (2/2) passed

### Completion Notes List

- **Dashboard shell + sidebar**: created `dashboard-shell` (fixed 240px sidebar + `<router-outlet>`, theme-aware via `--bg-color`/`--color`) and `dashboard-sidebar` (7 nav items in required order, mat-icon + label, `routerLink` + `routerLinkActive` with `{ exact: true }`, sage left-border on active). Six non-Deploy items link to `/dashboard` (home placeholder); Deploy links to `/dashboard/deploy`. `dashboard.routes.ts` now has a shell parent with lazy `''` (home) and `deploy` children.
- **Deploy page**: loads the owner's restaurant via `AuthService.user` → `getRestaurantByOwner(user.uid)`; `embedSnippet` computed emits `<script src="{widgetBundleUrl}" type="module"></script>` + `<booking-widget restaurant="{slug}"></booking-widget>`; copy button uses `navigator.clipboard.writeText`, shows `role="status"` "Copied!" for ~2s, renders a `role="alert"` on failure (never "Copied!"); demo link opens `/assets/demo.html?slug={slug}` in a new tab (`_blank` + `noopener`). Loading + error states present.
- **Widget bundle URL + demo page**: `widgetBundleUrl` added to `environment.{ts,dev,prod}` (dev/base `http://localhost:4200/...`, prod `https://firebase-crackling-fire-4704.web.app/...`); angular.json `assets` entry copies `dist/widget/**` → `/widget/`; `npm run build` chains `build:widget && ng build`. `src/assets/demo.html` (standalone, inline CSS) loads the bundle from `/widget/booking-widget.mjs`, reads `?slug=`, and renders `<booking-widget restaurant="{slug}">`.
- **Branding redirect**: Complete + Skip now navigate to `['/dashboard/deploy']` (Story 1.6's specs asserting `['/dashboard']` updated accordingly).
- **Unit**: 164/164 green. Two red-phase spec fixes (semantics preserved): (a) sidebar spec's `loadChildren: () => import('../dashboard.routes')` → `.then((m) => m.dashboardRoutes)` (raw namespace import is not a `Routes`, TS2322); (b) deploy spec's `expect(null?.textContent).not.toContain('Copied!')` → `expect(fixture.nativeElement.textContent).not.toContain('Copied!')` (vitest rejects `undefined` actual). Deploy component exposes `restaurant`/`error`/`copyError`/`loading`/`copied` as public signals (Angular 22 strict templates reject private members in templates; `restaurant`/`error` are only read by the template).
- **E2E**: deploy-flow 5/5, widget-embed 4/4, dashboard-flow 2/2 green. Leftover emulator `java` on port 9099 from a prior run had to be killed once before the regression run (Playwright's webServer could not reuse the orphan).

### Review Findings

- [x] [Note][Verify] **Prod `widgetBundleUrl` must be verified before release** — set to the story-default `https://firebase-crackling-fire-4704.web.app/widget/booking-widget.mjs`; Firebase CLI is not authenticated (`firebase projects:list` → "Failed to authenticate"), so the real hosting domain could not be confirmed. Confirm with `firebase hosting:sites` (or the Firebase console) when releasing.
- [x] [Note] **Dev `widgetBundleUrl` origin ambiguity** — base + dev use `http://localhost:4200/widget/booking-widget.mjs` per the story (unit spec hard-codes the base value). The Angular dev server actually runs on port **4210** (`angular.json` `serve.development.port`); e2e passes because it only asserts the `booking-widget.mjs` substring and `demo.html` uses a same-origin relative path. If a developer wants the embed snippet to point at the running `ng serve` instance, dev should use 4210 (or a relative/derived URL). Flagged rather than changed to respect the story's explicit dev default.
- [x] [Note] **Sidebar active state** — the six home-linked items share `/dashboard` with `routerLinkActive` + `{ exact: true }`, so on the home route all six show the active style (Bookings/Info/Hours/Tables/Branding/Account). This satisfies the unit contract (Bookings active, Deploy not, at `/dashboard`; exactly one active at `/dashboard/deploy`). Story 3.1 reconciliation may restyle this once distinct pages exist.
- [x] [Note] **Build ordering dependency** — `ng build`/`ng serve` now require `dist/widget` to exist (assets input). `npm run build` chains `build:widget` first; for `ng serve` on a clean clone run `npm run build:widget` once. Documented in the story notes.

### File List

- `src/dashboard/shell/dashboard-shell.component.{ts,html,scss,spec.ts}` — new shell layout component + activated tests
- `src/dashboard/shell/dashboard-sidebar.component.{ts,html,scss,spec.ts}` — new sidebar component + activated tests
- `src/dashboard/pages/deploy/deploy-page.component.{ts,html,scss,spec.ts}` — new deploy page + activated tests
- `src/dashboard/dashboard.routes.ts` — shell parent route + `deploy` child
- `src/app/onboarding/branding-page/branding-page.component.ts` — Complete/Skip redirect → `/dashboard/deploy`
- `src/app/onboarding/branding-page/branding-page.component.spec.ts` — 2 redirect assertions updated to `/dashboard/deploy`
- `src/environments/environment.ts`, `environment.dev.ts`, `environment.prod.ts` — added `widgetBundleUrl`
- `src/assets/demo.html` — new minimal demo page
- `angular.json` — assets entry `dist/widget/**` → `/widget`
- `package.json` — `build` chains `build:widget`
- `e2e/tests/deploy-flow.spec.ts` — 5 activated tests
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — 1-7 → done
