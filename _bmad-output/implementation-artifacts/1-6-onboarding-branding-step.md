---
baseline_commit: 7a7e6ff
status: ready-for-dev
---

# Story 1.6: Onboarding — Branding Step

Status: ready-for-dev

## Story

As a restaurant owner,
I want to customize my widget colors and add a custom field,
so that the widget matches my brand.

## Acceptance Criteria

**Given** the branding step
**When** it loads
**Then** a centered card shows "Step 3 of 3: Branding"
**And** a "Skip" link is visible (this step is optional)

**Given** the branding step
**When** the owner configures colors
**Then** a hex color picker is shown for primary color
**And** a hex color picker is shown for secondary color
**And** sensible defaults are pre-filled

**Given** the branding step
**When** the owner configures a custom field
**Then** inputs are shown for: label (text), required (toggle), enabled (toggle)
**And** the custom field defaults to disabled

**Given** the branding step
**When** the owner clicks "Skip"
**Then** the onboarding is completed without saving branding changes
**And** the owner can configure these later in Settings

**Given** the branding step
**When** the owner clicks "Complete"
**Then** the branding data is saved to the restaurant profile
**And** onboarding is marked as complete

## Tasks / Subtasks

- [ ] Task 1: Create Branding Page Component (AC: 1, 2, 3, 5)
  - [ ] Subtask 1.1: Create `src/app/onboarding/branding-page/branding-page.component.ts`
  - [ ] Subtask 1.2: Implement step indicator ("Step 3 of 3: Branding")
  - [ ] Subtask 1.3: Implement heading "Style your booking widget"
  - [ ] Subtask 1.4: Implement "Skip" link (optional-step affordance, link-style button), disabled while saving
  - [ ] Subtask 1.5: Implement primary color picker (hex text input + native color swatch)
  - [ ] Subtask 1.6: Implement secondary color picker (hex text input + native color swatch)
  - [ ] Subtask 1.7: Pre-fill sensible defaults from existing `restaurant.whiteLabel` (fallback to DESIGN palette `#1A1A1A` / `#8FA67A`)
  - [ ] Subtask 1.8: Implement hex validation (`^#[0-9a-fA-F]{6}$`) with error message; block "Complete" when invalid
  - [ ] Subtask 1.9: Implement custom field: label (text input), required (toggle), enabled (toggle), defaulting to disabled
  - [ ] Subtask 1.10: Implement "Complete" button (filled, full-width) with loading state, error handling, disabled state + `aria-busy` during save
  - [ ] Subtask 1.11: Style per DESIGN.md: centered card, max-width 480px, warm linen background

- [ ] Task 2: Update Onboarding Service (AC: 2, 5)
  - [ ] Subtask 2.1: Update `createRestaurant` whiteLabel defaults from `#000000`/`#FFFFFF` to the DESIGN.md platform palette (`#1A1A1A` primary / `#8FA67A` secondary)
  - [ ] Subtask 2.2: Reuse `updateRestaurant` for branding data — no new service methods required

- [ ] Task 3: Update Angular Routing (AC: 5)
  - [ ] Subtask 3.1: Add `/onboarding/branding` route to `app.routes.ts` (lazy `loadComponent`, guards `[isAuthenticatedGuard, isNotOnboardedGuard]`)
  - [ ] Subtask 3.2: Verify Step 2 "Continue" navigates to `/onboarding/branding` (already implemented in Story 1.5 — no change expected)

- [ ] Task 4: Write Unit Tests (AC: 1, 2, 3, 4, 5)
  - [ ] Subtask 4.1: Test BrandingPageComponent — step indicator renders
  - [ ] Subtask 4.2: Test BrandingPageComponent — "Skip" link visible
  - [ ] Subtask 4.3: Test BrandingPageComponent — color pickers pre-filled from restaurant doc (or DESIGN defaults)
  - [ ] Subtask 4.4: Test BrandingPageComponent — invalid hex blocks "Complete"
  - [ ] Subtask 4.5: Test BrandingPageComponent — custom field defaults to disabled
  - [ ] Subtask 4.6: Test BrandingPageComponent — "Complete" saves `{ whiteLabel, customField, onboardingCompleted: true }` (customField persisted even when `enabled: false`) and navigates to `/dashboard`
  - [ ] Subtask 4.7: Test BrandingPageComponent — "Skip" saves only `onboardingCompleted: true` and navigates to `/dashboard`
  - [ ] Subtask 4.8: Test OnboardingService — `createRestaurant` uses DESIGN palette defaults

- [ ] Task 5: E2E / ATDD Coverage (deferred to AT phase via `bmad-testarch-atdd`)
  - [ ] Subtask 5.1: Generate red-phase checklist `_bmad-output/test-artifacts/atdd-checklist-1-6-onboarding-branding-step.md`
  - [ ] Subtask 5.2: E2E tests: extend `e2e/tests/onboarding-wizard.spec.ts` (drive the fresh `onboardingPage` fixture through steps 1→3) or add `e2e/tests/onboarding-branding.spec.ts`; cover full complete flow and skip flow
  - [ ] Subtask 5.3: Consider a seeded "in-progress" restaurant fixture (hours/tableGroups set, `onboardingCompleted: false`) to land directly on Step 3

## Dev Notes

### Architecture Patterns & Constraints

**AD-2 — Direct Firebase from Browser:**
- Onboarding service calls Firestore directly. No API layer.
- Security rules already enforce owner-based access (Story 1.2).

**AD-13 — One Restaurant per Account:**
- Single restaurant per auth account. `getRestaurantByOwner` returns the first match (fine — one per account).

**Completion guard flip (FR-40):**
- After `onboardingCompleted: true` is saved, `isNotOnboardedGuard` redirects away from `/onboarding` and `isOnboardedGuard` permits `/dashboard`.
- Complete and Skip both navigate to `['/dashboard']` after saving.
- The Deploy/embed-code page (FR-41) is Story 1.7 — out of scope here.

### Code patterns established (from Story 1.1–1.5)

- **Component shape:** signal-based, `inject()` for dependencies, standalone (implicit), route-loaded via `loadComponent` (no selector needed).
- **Page chrome:** `<div class="h-screen flex items-center justify-center bg-[#FAF7F2]">` wrapping `mat-card appearance="outlined"` `relative w-full max-w-[480px] mx-4 p-6`; `mat-progress-bar mode="indeterminate"` with `aria-label="Loading"` while `loading()`; step caption `<p class="text-sm text-gray-500 mb-1">` + `<h1 class="text-2xl font-semibold">`.
- **State:** `loading = signal(false)`, `error = signal<string | null>(null)`, derived state via `computed()`, data pre-fill in `ngOnInit` via `getRestaurantByOwner(user.uid)`.
- **Forms:** `FormsModule` + `[(ngModel)]`/`ngModelChange` to stay consistent with the availability step (AGENTS.md prefers Signal Forms for *new* forms; this page follows the established Step 2 pattern — see Deferred Work).
- **Submission:** save via `updateRestaurant(restaurantId, data)`, then `router.navigate(...)`; `aria-busy` + disabled CTA while saving; errors in `role="alert"` `<div class="text-red-700 text-sm">`.
- **Selectors:** `data-testid` attributes on interactive elements for E2E.
- **Firebase access:** `import { getFirebaseDb, getFirebaseAuth } from '../../shared/firebase-config'`.

### Files to create

- `src/app/onboarding/branding-page/branding-page.component.ts` — Branding page component
- `src/app/onboarding/branding-page/branding-page.component.html` — Template
- `src/app/onboarding/branding-page/branding-page.component.scss` — Styles (kept empty; Tailwind utilities inline)
- `src/app/onboarding/branding-page/branding-page.component.spec.ts` — Tests

### Files to modify

- `src/app/services/onboarding.service.ts` — Change `createRestaurant` whiteLabel defaults to `#1A1A1A` / `#8FA67A` (Subtask 2.1)
- `src/app/app.routes.ts` — Add `/onboarding/branding` route (Subtask 3.1)

### Testing requirements

- Unit tests for BrandingPageComponent (mock OnboardingService via `ng-mocks`).
- Never call real Firestore in tests — mock (`vi.mock('firebase/auth')`, `vi.mock('firebase/firestore')`, `vi.mock('firebase/app')`).
- If `effect()` is used, Angular effects are async — tests need `vi.advanceTimersByTime()` + `fixture.whenStable()`.
- Navigation assertions: compare `UrlTree` with `.toString()` when guards return `parseUrl()`.
- Accessibility: native `<input type="color">` has no text content — every color input needs an `aria-label`. Errors must be announced (`role="alert"`); avoid pure black/white widget colors in dark mode (DESIGN.md:103).
- E2E work is deferred to the AT phase (Task 5).

### Previous Story Learnings

**From Story 1.5 (Availability Step):**
- Reuse `updateRestaurant(restaurantId, data)` — its signature `Partial<Omit<Restaurant, 'id' | 'slug' | 'ownerId'>>` already accepts `whiteLabel`, `customField`, and `onboardingCompleted`. No new service methods needed.
- Step 2 "Continue" already navigates to `['/onboarding/branding']` — only the route registration is missing.
- E2E location lesson: Story 1.5 planned a standalone availability spec under `tests/e2e/`, but it was never created — availability coverage lives folded into `e2e/tests/onboarding-wizard.spec.ts`. For 1.6, plan E2E under `e2e/tests/` (extend the wizard spec or add `onboarding-branding.spec.ts`), not a legacy `tests/e2e/` path.
- `getRestaurantByOwner` returns the first of multiple (fine — AD-13 one restaurant per account).
- Validation messages: `computed()` returning a message string + `role="alert"` div + disabled CTA.
- Native color input always returns `#rrggbb`; validate the hex text input and keep both controls in sync.

**Story 1.6-specific decisions (confirmed):**
- Heading is **"Style your booking widget"**.
- Sensible defaults: pre-fill from existing `restaurant.whiteLabel` (guaranteed non-null — `createRestaurant` always sets it); fall back to the DESIGN.md platform palette only for legacy/missing docs. `createRestaurant` defaults change to `#1A1A1A` (Ink) primary / `#8FA67A` (Sage) secondary.
- Required/enabled toggles use `MatSlideToggle` (design language: "toggle"). `MatCheckbox` remains available for consistency if preferred.
- Skip must NOT write `whiteLabel`/`customField` — save only `{ onboardingCompleted: true }`.
- Complete persists **exactly** `{ whiteLabel, customField, onboardingCompleted: true }`. `customField` is saved as configured even when `enabled: false` — the widget (Epic 2) respects the flag per FR-38/AD-8.
- **No new dependencies:** the color picker uses the native `<input type="color">` plus existing Angular Material (`MatSlideToggle`, `MatCard`, `MatButton`, `MatInput`, `MatFormField`, `MatProgressBar`) — do not add a third-party color-picker package.

### Project Structure Notes

- Standalone components live under `src/app/onboarding/<page>-page/` with colocated `*.spec.ts`.
- No NgModules; routes lazy-load components via `loadComponent`.
- `WhiteLabel { primaryColor, secondaryColor }` and `CustomField { label, required, enabled }` types already exist and are optional `customField?` on `Restaurant` — no type changes required.

### References

- [Source: epics.md — Story 1.6 (Onboarding — Branding Step), lines 392-427]
- [Source: ARCHITECTURE-SPINE.md — AD-8 (custom field optional with restaurant-defined label, lines 78-80); Data Model (Firestore) `whiteLabel`/`customField` fields, lines 160-198]
- [Source: PRD — FR-37 White-Label Colors, FR-38 Custom Field, FR-39 Skip Optional Steps, FR-40 Onboarding Completion (lines 404-436); FR-41 Embed Code Page (line 437, out of scope)]
- [Source: EXPERIENCE.md — Step 3 table (line 55); onboarding card + skip link (line 91); Step 3 walkthrough (line 172)]
- [Source: DESIGN.md — palette Ink `#1A1A1A` / Sage `#8FA67A` (lines 8-17); avoid pure black/white in dark mode (line 103); onboarding card (line 150); color picker = hex input + native color swatch (line 151)]
- [Source: src/shared/types/restaurant.ts — WhiteLabel, CustomField]
- [Source: src/app/services/onboarding.service.ts — createRestaurant, updateRestaurant, getRestaurantByOwner]
- [Source: src/app/onboarding/availability-page/availability-page.component.{ts,html} — Step 2 pattern to mirror]
- [Source: src/app/app.routes.ts — route registration pattern (`onboarding/availability`)]
- [Source: src/app/routing/guard/onboarding.guard.ts — isNotOnboardedGuard / isOnboardedGuard flip]
- [Source: e2e/fixtures/onboarding.fixture.ts — `onboardedUser` fixture pattern for a future seeded in-progress fixture]

### ATDD Artifacts

- Checklist: `_bmad-output/test-artifacts/atdd-checklist-1-6-onboarding-branding-step.md` (RED phase — 33 scaffolds)
- E2E tests: `e2e/tests/onboarding-branding.spec.ts` (7 tests, all `test.skip`)
- Component tests: `src/app/onboarding/branding-page/branding-page.component.spec.ts` (26 tests, all `it.skip`)

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

### Review Findings
