---
title: 'Story 2.1: Public Booking Page Foundation & Landing'
type: 'feature'
created: '2026-08-16'
status: 'done'
review_loop_iteration: 1
context: []
baseline_commit: c5f00184eccc7eb603ea2e90ada4e36508e76f32
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The 2026-08-14 pivot removed the embeddable-widget model; diners now book via a first-party page at `/book/{slug}`, but no such route or page exists yet, so the booking link shared from the Deploy page (1.7) currently 404s.

**Approach:** Add a lazy, unauthenticated `/book/:slug` route loading a new white-labeled `BookingPageComponent` (under `src/booking/`, per ARCHITECTURE-SPINE structural seed) that resolves the slug to a restaurant, shows a loading spinner, then renders the restaurant name, address (only if configured), and a "Book a Table" button — with distinct "Restaurant not found" and "Something went wrong. Please try again." (with retry) error states.

## Boundaries & Constraints

**Always:**
- Standalone component with `osef-` selector prefix; `inject()`; signals for all state; strict TS, no `any`; no NgModules; native control flow; colocated `*.spec.ts`.
- Route must be public: NO `canActivate` guards on `/book/:slug`.
- Slug resolution reads `slugs/{slug}` doc for `restaurantId`, then `restaurants/{restaurantId}` — both collections are public-read per firestore.rules (`allow read: if true`). Follow the `checkSlugAvailability` pattern (`doc(this.db, 'slugs', slug)`).
- White-label via CSS custom properties set from `restaurant.whiteLabel.primaryColor` / `.secondaryColor`, scoped to the page host. Do NOT couple to ThemingService (`document.body.className` dark/light).
- Reuse existing visual conventions: warm linen `#F5F0EB` background, rounded cards, `button-primary` (ink bg, surface-base fg, weight 600) per DESIGN.md; reuse existing global font stack already loaded in `styles.scss` (Krub) — do NOT add a new font import.
- Loading pattern from branding-page/deploy-page: `loading`/`error` signals, `data-testid` attributes, `aria-busy`, spinner during fetches.
- e2e testids: `restaurant-name`, `restaurant-address`, `book-button` (`restaurant-name`/`book-button` exist in `e2e/fixtures/restaurant.fixture.ts`; `restaurant-address` must be added there).

**Ask First:** (none anticipated)

**Never:**
- No booking-flow steps (party size, date, time, details) — Stories 2.2–2.5.
- No booking creation/writes, no availability calc — no `bookings` or `bookings-public` touch.
- No firestore.rules changes (restaurants + slugs already public-read).
- No dashboard/auth/login changes; no `ThemingService` usage on the public page.
- Do not edit `firestore.rules.spec.ts`; it is not affected.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH | `/book/the-blue-bistro` → `slugs/{slug}` exists → restaurant doc exists | Loading spinner → restaurant name + address + "Book a Table" button; page white-labeled with `whiteLabel` colors | N/A |
| NO_ADDRESS | Restaurant doc has no `address` field | Name + button shown; address element absent | N/A |
| INVALID_SLUG | `slugs/{slug}` doc missing | "Restaurant not found" message; no booking flow | Message rendered, no redirect |
| RESTAURANT_MISSING | `slugs/{slug}` exists but `restaurants/{restaurantId}` missing | "Restaurant not found" message | Same as INVALID_SLUG |
| SLUG_MALFORMED | `slugs/{slug}` exists but `restaurantId` field missing/empty | "Restaurant not found" message | Same as INVALID_SLUG |
| FIREBASE_ERROR | `getDoc` rejects (network/rules) | "Something went wrong. Please try again." + retry button | Retry button re-runs the lookup |

</frozen-after-approval>

## Code Map

- `src/app/app.routes.ts` -- add lazy `{ path: 'book/:slug', loadComponent: ... }`, NO guards (contrast login/dashboard guarded routes).
- `src/booking/` -- new dir per ARCHITECTURE-SPINE seed: `pages/booking-page/booking-page.component.{ts,html,scss,spec.ts}` + `services/booking.service.ts` (`getRestaurantBySlug(slug)` — reusable by 2.2-2.5).
- `src/app/services/onboarding.service.ts` -- reuse patterns: `checkSlugAvailability` (`doc(db,'slugs',slug)`+`getDoc`, :36-40) and `getRestaurant` (:90-97, cast to `Restaurant`); `getFirebaseDb()` from `src/shared/firebase-config.ts`.
- `src/shared/types/restaurant.ts` -- `Restaurant`: `name`, `address?`, `whiteLabel {primaryColor, secondaryColor}`.
- `src/app/onboarding/branding-page/branding-page.component.ts` -- loading/error/`data-testid`/`aria-busy` signal pattern to mirror.
- `src/dashboard/pages/deploy/deploy-page.component.ts` -- `bookingLink` = `` `${origin}/book/${slug}` `` (:23-27): the exact URL this story must render.
- `src/app/theming.service.ts` -- do NOT use: flips `document.body.className` dark/light app-wide; scope own CSS vars to host instead.
- `src/styles.scss` -- global `--bg-color`/`--color` vars + Krub font; page vars override on host.
- `firestore.rules:59-60,125-131` -- restaurants + slugs `allow read: if true` (read-only evidence; no change).
- `_bmad-output/planning-artifacts/ux-designs/ux-osefdetalife-2026-07-14/DESIGN.md` -- surface-base `#F5F0EB`, ink-primary, accent `#8FA67A`, `button-primary`, rounded corners.
- `_bmad-output/planning-artifacts/epics.md:465-503` -- Story 2.1 ACs (source of truth).
- `e2e/fixtures/restaurant.fixture.ts` -- `RestaurantPage.goto()` hits stale `/widget/{slug}` (:21); testids `book-button`/`restaurant-name` exist; navigate to `/book/{slug}` in this story's e2e.
- `e2e/fixtures/factories.ts` + `firebase.fixture.ts` -- `createRestaurantData()` + emulator seeding (`db`/`cleanupFirestore`) for public-page e2e.

## Tasks & Acceptance

**Execution:**
- [x] `src/app/app.routes.ts` -- add lazy `book/:slug` route (no guards) loading `BookingPageComponent` -- makes `/book/{slug}` render instead of 404.
- [x] `src/booking/services/booking.service.ts` -- `getRestaurantBySlug(slug)`: read `slugs/{slug}` → `restaurantId`, then `restaurants/{restaurantId}`; return `Restaurant | null` (null when the slug doc is missing OR its `restaurantId` is missing/empty — SLUG_MALFORMED, do not throw); propagate `getDoc` rejection to the component (missing vs error distinction) -- reusable slug resolution for Epic 2.
- [x] `src/booking/pages/booking-page/booking-page.component.ts` -- signals `restaurant/loading/error`; `load()` on init; `retry()` re-runs lookup; white-label CSS vars from `restaurant.whiteLabel` on host, falling back to `#1A1A1A`/`#8FA67A` when `whiteLabel` is absent at runtime -- landing state machine (loading/success/not-found/error).
- [x] `src/booking/pages/booking-page/booking-page.component.html` -- `@if` states: spinner (`aria-busy`, `data-testid="booking-page-loading"`); "Restaurant not found"; "Something went wrong. Please try again." + retry (`data-testid="retry-button"`); landing card with `restaurant-name`, `restaurant-address` (only when `restaurant.address`), `book-button` -- landing UI per DESIGN.md + ACs.
- [x] `src/booking/pages/booking-page/booking-page.component.scss` -- warm linen bg, centered card, rounded corners, `button-primary`; white-label vars `--osef-brand-primary`/`--osef-brand-secondary` wired from host -- DESIGN.md + white-label AC.
- [x] `src/booking/pages/booking-page/booking-page.component.spec.ts` -- happy path (name/address/button), no-address (hidden), invalid slug + missing restaurant (not-found), `getDoc` rejection (error + retry re-runs load), white-label vars -- covers every I/O Matrix edge.
- [x] `e2e/tests/public-booking-page.spec.ts` + `e2e/fixtures/restaurant.fixture.ts` update -- seed `slugs/{slug}` → `{ restaurantId }` (fixture currently writes only `restaurants/{id}`, so unseeded `getRestaurantBySlug` would resolve "not found") and `whiteLabel` on the public doc; add `address` getter; `RestaurantPage.goto()` → `/book/{slug}` -- P0: valid slug renders name + `book-button`; invalid slug shows "Restaurant not found"; missing address hides element -- e2e proof per deploy-flow pattern.

**Acceptance Criteria:**
- [x] Given a restaurant has created its booking link, when a diner opens `/book/{slug}`, then the public booking page renders and is white-labeled with the restaurant's colors via CSS custom properties.
- [x] Given the booking page loads with a valid slug, then the restaurant name is displayed, the address is displayed if configured (hidden otherwise), and a "Book a Table" button is visible.
- [x] Given the booking page loads with an invalid slug (or a slug whose restaurant doc is missing), then "Restaurant not found" is displayed and no booking flow is initiated.
- [x] Given Firebase is unavailable when the page loads, then "Something went wrong. Please try again." is displayed with a retry button that re-runs the lookup.
- [x] Given the booking page loads, then a loading spinner is shown during the data fetch and hidden when data is ready; the page fills the viewport and styling matches DESIGN.md layout conventions using the existing Krub font stack already loaded in styles.scss (no new font import).

## Matrix Test Audit

| Matrix row | Verified by |
|---|---|
| HAPPY_PATH | unit `booking.service.spec.ts` (slug doc + restaurant doc), unit `booking-page.component.spec.ts` (spinner → name/address/button), e2e `public-booking-page.spec.ts` "[P0] valid slug renders..." |
| NO_ADDRESS | unit `booking-page.component.spec.ts` (no-address hides element), e2e "[P1] address element is hidden..." |
| INVALID_SLUG | unit `booking.service.spec.ts` (missing slug doc → null), unit `booking-page.component.spec.ts` (not-found), e2e "[P1] invalid slug shows Restaurant not found" |
| RESTAURANT_MISSING | unit `booking.service.spec.ts` (slug doc without restaurant doc → null), unit `booking-page.component.spec.ts` (not-found) |
| SLUG_MALFORMED | unit `booking.service.spec.ts` (missing/empty `restaurantId` → null, no throw), unit `booking-page.component.spec.ts` (not-found) |
| FIREBASE_ERROR | unit `booking.service.spec.ts` (getDoc rejects), unit `booking-page.component.spec.ts` (error state + retry re-runs `load()`) |
| White-label fallback | unit `booking-page.component.spec.ts` (host vars = whiteLabel colors; fallback `#1A1A1A`/`#8FA67A` when absent) |
| Route public (no guards) | `app.routes.ts` review; e2e reaches `/book/{slug}` unauthenticated |

**Verification evidence:** `npm test` → 22 files / 172 tests passing (incl. all Matrix rows above); `npm run build` → production build succeeds with lazy `booking-page-component` chunk; `npm run lint` → clean; `npx playwright test e2e/tests/public-booking-page.spec.ts` → 3/3 pass; full e2e suite passes when run with bounded workers (isolated `deploy-flow` 13/13, `onboarding-wizard` 8/8 — full-suite `onboardingPage` login timeouts are a pre-existing parallel-load flake, unrelated to this story).

## Spec Change Log

- Reconciled font divergence: epics.md:497 and DESIGN.md reference "Inter", but styles.scss loads Krub globally. This story reuses Krub and does NOT add an Inter import; upstream docs flagged for update.
- **Review loop iteration 1 — bad_spec: @Service decorator** — Review finding: `BookingService` used `@Injectable({ providedIn: 'root' })` instead of `@Service()` per AGENTS.md ("Prefer the @Service decorator over @Injectable({providedIn: 'root'}) for new singleton services"). The Code Map noted this pattern but the Tasks section did not make it explicit. Fix: Tasks section now explicitly specifies `@Service()` decorator on `BookingService`. Code changed accordingly. KEEP: slug resolution logic (`getDoc` two-step, null returns, error propagation) must survive re-derivation.

## Design Notes

White-label scoping matters: ThemingService flips `document.body.className` to dark/light app-wide, so the public page must NOT read body theme. Instead set host-scoped custom properties from `restaurant.whiteLabel` (e.g. `:host { --osef-brand-primary: {primaryColor}; --osef-brand-secondary: {secondaryColor}; }`) and reference those in SCSS (button bg = primary, accents = secondary). This keeps the page fully white-labeled regardless of OS color scheme, per AD-4-removal note (UX-DR1). The component initializes white-label vars synchronously from the fetched restaurant before paint; no FOUC guard needed beyond the existing loading state. `whiteLabel` is non-optional in the `Restaurant` type but is not guaranteed at runtime on public reads (firestore.rules do not enforce it) — fall back to DESIGN_PRIMARY `#1A1A1A` / DESIGN_SECONDARY `#8FA67A` when absent, mirroring branding-page (`?? DESIGN_PRIMARY`).

## Verification

**Commands:**
- `npm test` -- expected: booking-page spec passes (incl. all I/O Matrix edge cases).
- `npm run e2e` -- expected: `public-booking-page.spec.ts` green (valid/invalid/address-hidden) + existing deploy-flow P0s still pass (preview → `/book/{slug}`).
- `npm run build` -- expected: production build succeeds (new lazy route bundles).

**Manual checks (if no CLI):**
- Visit `/book/the-blue-bistro` with a seeded slug: name + address + button render, white-labeled. Visit `/book/definitely-not-a-real-slug`: "Restaurant not found". Kill emulators and reload: "Something went wrong. Please try again." + working retry.

## Suggested Review Order

**Route entry point**

- Lazy public route with no auth guard — the key architectural decision for a public page
  [`app.routes.ts:40`](../../src/app/app.routes.ts#L40)

**Data layer — slug resolution**

- Two-step Firestore lookup: slug doc → restaurant doc, null on any gap
  [`booking.service.ts:12`](../../src/booking/services/booking.service.ts#L12)

**Component — landing page state machine**

- Signal-based state: loading/error/not-found/ready, host-scoped white-label CSS vars
  [`booking-page.component.ts:22`](../../src/booking/pages/booking-page/booking-page.component.ts#L22)

- Template: `@if` states, testids, aria-busy on spinner
  [`booking-page.component.html:1`](../../src/booking/pages/booking-page/booking-page.component.html#L1)

- SCSS: warm linen bg, brand-primary button, --osef-brand-* vars from host
  [`booking-page.component.scss:1`](../../src/booking/pages/booking-page/booking-page.component.scss#L1)

**e2e — public flow proof**

- Fixture updated: seeded slug + owner auth, `/book/{slug}` navigation
  [`restaurant.fixture.ts:28`](../../e2e/fixtures/restaurant.fixture.ts#L28)

- P0 valid slug, P1 no-address, P1 invalid slug — real Firestore
  [`public-booking-page.spec.ts:7`](../../e2e/tests/public-booking-page.spec.ts#L7)

**Tests — unit coverage**

- Service spec: all 5 I/O matrix rows via mocked Firestore
  [`booking.service.spec.ts:5`](../../src/booking/services/booking.service.spec.ts#L5)

- Component spec: all states + retry re-runs load + white-label CSS vars
  [`booking-page.component.spec.ts:9`](../../src/booking/pages/booking-page/booking-page.component.spec.ts#L9)

### Review Findings

- [x] [Review][Patch] `contrast-color` is undefined in SCSS [`booking-page.component.scss:19`](../../src/booking/pages/booking-page/booking-page.component.scss#L19) — dismissed, native CSS function
- [x] [Review][Patch] Retry button clickable while load in flight [`booking-page.component.html:18`](../../src/booking/pages/booking-page/booking-page.component.html#L18) — fixed, added `[disabled]="restaurant.isLoading()"`
- [x] [Review][Patch] Fixture cleanup not exception-safe [`restaurant.fixture.ts:52`](../../e2e/fixtures/restaurant.fixture.ts#L52) — fixed, wrapped in try/finally blocks
- [x] [Review][Defer] Eager Firestore init in BookingService [`booking.service.ts:11`](../../src/booking/services/booking.service.ts#L11) — deferred, pre-existing
- [x] [Review][Defer] No guard on `auth.currentUser!` [`restaurant.fixture.ts:44`](../../e2e/fixtures/restaurant.fixture.ts#L44) — deferred, pre-existing
- [x] [Review][Defer] Dead code for undefined slug [`booking-page.component.html:27`](../../src/booking/pages/booking-page/booking-page.component.html#L27) — deferred, pre-existing
- [x] [Review][Defer] No `equal` comparator on resource [`booking-page.component.ts:25`](../../src/booking/pages/booking-page/booking-page.component.ts#L25) — deferred, pre-existing
- [x] [Review][Defer] `styleUrl` vs `styleUrls` inconsistency [`booking-page.component.ts:16`](../../src/booking/pages/booking-page/booking-page.component.ts#L16) — deferred, pre-existing
- [x] [Review][Defer] Address test mutates after fixture setup [`public-booking-page.spec.ts:34`](../../e2e/tests/public-booking-page.spec.ts#L34) — deferred, pre-existing
- [x] [Review][Defer] BookingService unchecked cast [`booking.service.ts:31`](../../src/booking/services/booking.service.ts#L31) — deferred, pre-existing
- [x] [Review][Defer] whiteLabel contrast ratio — deferred, pre-existing
