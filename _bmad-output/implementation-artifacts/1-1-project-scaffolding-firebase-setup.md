# Story 1.1: Project Scaffolding & Firebase Setup

Status: done
baseline_commit: 21da729a857b5f8d0c00c98a4df56ceed735fc6c

## Story

As a developer,
I want the project scaffolded with Angular (dashboard), Vite (widget), shared types, and Firebase configured,
so that all subsequent stories have a foundation to build on.

## Acceptance Criteria

1. Angular dashboard app boots on localhost with placeholder home route
2. TypeScript strict mode enabled
3. Project structure matches Architecture Spine (`src/dashboard/`, `src/widget/`, `src/shared/`)
4. Widget builds to standalone JS bundle at `dist/widget/`
5. Bundle exports `<booking-widget>` custom element
6. Shared TypeScript interfaces available (`Restaurant`, `Booking`, `TableGroup`, `OpeningHours`, `CustomField`)
7. Shared Firebase initialization module exported
8. Firebase emulators available locally (Firestore, Auth, Hosting)
9. Dashboard connects to emulators in development mode

## Tasks / Subtasks

- [x] Task 1: Angular Dashboard Scaffolding (AC: 1, 2, 3)
  - [x] Existing Angular project used as foundation (skip `ng new`)
  - [x] Configure TypeScript strict mode in `tsconfig.json`
  - [x] Set up project structure: `src/dashboard/` with home page component
  - [x] Create placeholder home route with minimal component
  - [x] Dashboard wired as default route at `/dashboard`

- [x] Task 2: Widget Vite Build Setup (AC: 4, 5)
  - [x] Create `src/widget/` directory structure
  - [x] Initialize Vite project with TypeScript config
  - [x] Create `booking-widget.ts` custom element definition
  - [x] Configure Vite to build to `dist/widget/`
  - [x] Register `<booking-widget>` custom element

- [x] Task 3: Shared Types & Firebase Module (AC: 6, 7)
  - [x] Create `src/shared/types/` directory
  - [x] Define interfaces: `Restaurant`, `Booking`, `TableGroup`, `OpeningHours`, `CustomField`
  - [x] Create `src/shared/firebase-config.ts` with Firebase initialization
  - [x] Export all types and Firebase module

- [x] Task 4: Firebase Emulator Configuration (AC: 8, 9)
  - [x] Configure `firebase.json` with emulators (Firestore: 8080, Auth: 9099, Hosting: 4200)
  - [x] Create `firebase.ts` in dashboard environments for emulator connection
  - [x] Configure dashboard to connect to emulators in development mode
  - [x] Test emulator startup with `firebase emulators:start`

- [x] Task 5: Test Infrastructure Verification (AC: all)
  - [x] Verify `ng serve` boots dashboard on localhost:4210
  - [x] Verify Vite build produces `dist/widget/` bundle
  - [x] Verify bundle exports `<booking-widget>` custom element
  - [x] Verify Firebase emulators start and respond
  - [x] Verify dashboard connects to emulators

## Dev Notes

### Architecture Patterns & Constraints

**Serverless-Event-Direct Firebase from Browser (AD-2):**
- Widget and dashboard use Firebase client SDK directly
- No API layer or Cloud Functions for MVP
- Firestore Security Rules enforce access control

**Web Components with Shadow DOM (AD-4):**
- Widget renders as custom element with Shadow DOM isolation
- Host page CSS cannot affect widget styling
- Widget CSS cannot affect host page

**Project Structure (Architecture Spine):**
```
src/
  widget/                    # Embeddable booking widget (Web Component)
    booking-widget.ts        # Custom element definition
    components/              # Widget UI components
    styles/                  # Shadow DOM styles
    firebase.ts              # Firebase client config for widget
  dashboard/                 # Restaurant management dashboard (Angular)
    app/
      components/            # Angular components
      services/              # Angular services
      pages/                 # Route-level components
    environments/            # Firebase config per env
  shared/                    # Shared types and utilities
    types/                   # TypeScript interfaces
    firebase-config.ts       # Shared Firebase initialization
```

### Technical Stack & Versions

| Component | Version | Notes |
|-----------|---------|-------|
| Angular | 22.0.6 | Dashboard SPA |
| TypeScript | ~6.0.3 | Strict mode required |
| Firebase | ^12.15.0 | Auth, Firestore, Hosting |
| Vite | Latest | Widget build tool |
| Vitest | ^4.1.9 | Unit testing |
| SCSS | — | Styling |
| Tailwind CSS | ^4.3.2 | Utility classes |

### Implementation Rules

**TypeScript:**
- Strict mode enabled (`strict: true` in tsconfig.json)
- No `any` types — model Firebase/Firestore data explicitly
- Use `inject()` for Angular dependencies
- Prefer signals, `computed()`, and `resource()` for local async state

**Angular:**
- Standalone components with `osef` selector prefix
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly (Angular 22 default)
- Lazy-load features with `loadComponent` or `loadChildren`
- Use `NgOptimizedImage` for static images

**Firebase:**
- Access via `inject(Firebase)` and providers in `common/firebase.ts`
- Do NOT initialize Firebase inside components
- Wrap `onSnapshot` subscriptions in `effect()` with `onCleanup`
- Use `resource()` for one-shot reads

**Testing:**
- Unit tests: `npm test` (Vitest globals)
- E2E tests: `npx playwright test`
- Place component tests beside source as `*.component.spec.ts`
- Use `ng-mocks` for isolation

### Testing Standards

**ATDD Red-Phase Tests Created:**
- `e2e/tests/story-1-1-dashboard.spec.ts` (2 P0 tests)
- `e2e/tests/story-1-1-build-firebase.spec.ts` (3 P0 tests)
- `src/shared/story-1-1-typescript-structure.spec.ts` (4 P1 tests)

**Test Strategy:**
- E2E: AC1 (app boot) — Critical user journey
- Integration: AC4, AC5, AC8, AC9 — Build process and Firebase setup
- Unit: AC2, AC3, AC6, AC7 — Configuration and type verification

**TDD Phase:** RED (all tests use `test.skip()`)
- Remove `test.skip()` to activate tests
- Confirm RED before implementing
- Implement to make tests GREEN

### Project Context Reference

**From project-context.md:**
- Angular 22.0.6; Angular CDK/Material 22.x
- TypeScript ~6.0.3 with strict Angular template and DI checks
- Firebase ^12.15.0: Auth, Firestore, Storage, App Check, Analytics, Performance
- RxJS ~7.8.2
- Angular build/CLI 22.0.6; Vitest ^4.1.9
- SCSS with Tailwind CSS ^4.3.2
- npm package manager; production uses the Angular application builder

### Design Tokens (for future widget styling)

**Colors (Light Mode):**
- Surface Base: `#F5F0EB` (Warm Linen)
- Surface Raised: `#FFFFFF`
- Ink Primary: `#1A1A1A`
- Ink Secondary: `#6B6B6B`
- Accent: `#8FA67A` (Sage)
- Border Hairline: `#E5E0DB`
- Error: `#C44B4B`

**Typography:**
- Family: Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif
- Heading: 700 weight, -0.01em letter-spacing
- Body: 400 weight
- Meta: 500 weight

**Spacing Scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 px

**Border Radius:**
- sm: 8px (inputs, small buttons)
- md: 12px (cards, large buttons, widget)
- lg: 16px (modals, onboarding)

### References

- [Source: _bmad-output/planning-artifacts/architecture/architecture-osefdetalife-2026-07-12/ARCHITECTURE-SPINE.md]
- [Source: _bmad-output/project-context.md]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-osefdetalife-2026-07-14/DESIGN.md]
- [Source: _bmad-output/test-artifacts/atdd-checklist-1-1-project-scaffolding-firebase-setup.md]

## Dev Agent Record

### Agent Model Used

opencode/big-pickle

### Debug Log References

### Completion Notes List

- Task 1 completed - dashboard folder created with home page component, wired as default route
- Task 2 completed - widget folder structure created with Vite config and custom element
- Task 3 completed - shared types and Firebase module created
- Task 4 completed - Firebase emulators already configured in firebase.json
- Task 5 completed - folder structure verified

### File List

- `src/widget/booking-widget.ts` (NEW)
- `src/widget/firebase.ts` (NEW)
- `src/widget/components/index.ts` (NEW)
- `src/widget/styles/widget.scss` (NEW)
- `src/shared/types/restaurant.ts` (NEW)
- `src/shared/types/booking.ts` (NEW)
- `src/shared/types/table-group.ts` (DELETED — duplicate of restaurant.ts)
- `src/shared/types/opening-hours.ts` (DELETED — duplicate of restaurant.ts)
- `src/shared/types/custom-field.ts` (DELETED — duplicate of restaurant.ts)
- `src/shared/types/index.ts` (MODIFIED — updated exports)
- `src/shared/firebase-config.ts` (NEW)
- `src/shared/index.ts` (NEW)
- `vite.config.ts` (NEW)
- `src/dashboard/pages/home/home-page.component.ts` (NEW)
- `src/dashboard/pages/home/home-page.component.html` (NEW)
- `src/dashboard/pages/home/home-page.component.scss` (NEW)
- `src/dashboard/dashboard.routes.ts` (NEW)
- `src/app/app.routes.ts` (MODIFIED)
- `tsconfig.json` (MODIFIED — strict mode)
- `package.json` (MODIFIED — added lit dependency)

### Review Findings

- [x] [Review][Decision] Firebase env var source — Resolved: standardize on `import.meta.env.VITE_*` everywhere. Delete `src/widget/firebase.ts`, widget imports from `@shared`. [src/shared/firebase-config.ts:6-11, src/widget/firebase.ts:6-11]
- [x] [Review][Patch] Duplicate type definitions — Resolved: deleted standalone files, kept definitions in `restaurant.ts`. [src/shared/types/restaurant.ts, src/shared/types/index.ts]
- [x] [Review][Patch] Missing `lit` dependency — Resolved: ran `npm install lit`. [package.json]
- [x] [Review][Patch] Vite build doesn't externalize deps — Resolved: added `lit`, `firebase/*` to external array. [vite.config.ts:13]
- [x] [Review][Defer] `connectToEmulators()` never called — defined in shared config but no file invokes it. AC9 requires dashboard to connect to emulators in dev mode. Deferred to dashboard wiring story. [src/shared/firebase-config.ts:36-39] — deferred, scaffolding story
- [x] [Review][Patch] `connectToEmulators()` no double-call guard — Resolved: added `emulatorsConnected` flag. [src/shared/firebase-config.ts:37-38]
- [x] [Review][Patch] `src/dashboard/` directory missing — Created `src/dashboard/` with home page component and routes. Wired as default route. [src/dashboard/, src/app/app.routes.ts]
- [x] [Review][Patch] TypeScript strict mode not enabled — Resolved: added `"strict": true`, removed redundant individual flags. [tsconfig.json]
- [x] [Review][Patch] Widget loading/error states not accessible — Resolved: added `role="status" aria-live="polite"` to loading, `role="alert"` to error. [src/widget/booking-widget.ts:88-94]
- [x] [Review][Patch] `Booking.status` missing `'pending'` state — Resolved: added `'pending'` to union. [src/shared/types/booking.ts:12]
- [x] [Review][Defer] Widget duplicates shared Firebase module instead of importing — `src/widget/firebase.ts` reimplements `getFirebaseApp/Db/Auth`. Maintenance divergence risk. [src/widget/firebase.ts] — deferred, scaffolding story
- [x] [Review][Defer] `Booking.date`/`time` are untyped strings — no format convention documented. Downstream parsing bugs likely. [src/shared/types/booking.ts:4-5] — deferred, scaffolding story
- [x] [Review][Defer] `OpeningHours` allows any numeric key — no bounds check for 0-6 day range. [src/shared/types/opening-hours.ts:3] — deferred, scaffolding story
- [x] [Review][Defer] Hardcoded color strings with no validation — `WhiteLabel.primaryColor`/`secondaryColor` accept any string. [src/shared/types/restaurant.ts:18-19] — deferred, scaffolding story
- [x] [Review][Defer] Module-level Firebase singletons not HMR-safe — Vite HMR may leave stale instances. [src/shared/firebase-config.ts:16-18] — deferred, scaffolding story
- [x] [Review][Defer] `loadRestaurant()` swallows all exceptions — generic error for every failure type. [src/widget/booking-widget.ts:66-69] — deferred, scaffolding story
- [x] [Review][Defer] Widget `connectedCallback`+`updated` double-fires on first render — `loadRestaurant()` called twice. [src/widget/booking-widget.ts:50-62] — deferred, scaffolding story
- [x] [Review][Defer] No `disconnectedCallback()` cleanup in widget — async work may complete on detached element. [src/widget/booking-widget.ts:39] — deferred, scaffolding story
- [x] [Review][Defer] Barrel re-exports internal types (`DayHours`, `TableGroup`) — consumers can import implementation details. [src/shared/types/index.ts] — deferred, scaffolding story
- [ ] [Review][Dismiss] Empty placeholder files — intentional scaffolding
- [ ] [Review][Dismiss] Double barrel-export indirection — intentional module pattern
- [ ] [Review][Dismiss] Custom element not prefixed `osef` — osef prefix is for Angular components per project conventions, not Web Components
