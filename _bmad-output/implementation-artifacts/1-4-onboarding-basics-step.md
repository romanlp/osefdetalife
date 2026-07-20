---
baseline_commit: 50f33a0
status: done
review_loop_iteration: 0
followup_review_recommended: false
---

# Story 1.4: Onboarding — Basics Step

Status: done

## Story

As a restaurant owner,
I want to enter my restaurant name and see the auto-generated slug,
so that my restaurant is identified on the platform.

## Acceptance Criteria

**Given** a restaurant owner completes sign-up
**When** they are redirected to onboarding
**Then** a centered card (max-width 480px) shows "Step 1 of 3: Restaurant basics"
**And** the heading reads "Tell us about your restaurant"

**Given** the basics step
**When** the owner types a restaurant name
**Then** a slug is auto-generated in real-time (lowercase, hyphens, no special characters)
**And** the slug preview shows: "Your booking link: bookable.co/{slug}"

**Given** the basics step
**When** the owner edits the slug field
**Then** the slug is validated for uniqueness in real-time
**And** a visual indicator shows if the slug is available or taken

**Given** the basics step
**When** the owner enters a name and valid slug
**And** clicks "Continue"
**Then** the data is saved to the restaurant profile
**And** the wizard advances to Step 2

**Given** the basics step
**When** it loads
**Then** the address field is visible with an "(optional)" label
**And** the owner can skip the address by clicking "Continue" without entering one

**Given** a restaurant owner has not yet completed onboarding
**When** they try to navigate to the dashboard
**Then** they are redirected to the onboarding wizard
**And** they see the basics step card

## Tasks / Subtasks

- [x] Task 1: Create Onboarding Service (AC: 1, 2, 3, 4)
  - [x] Subtask 1.1: Create `src/app/services/onboarding.service.ts`
  - [x] Subtask 1.2: Implement `createRestaurant(name, slug, address?)` — creates restaurant document in Firestore
  - [x] Subtask 1.3: Implement `checkSlugAvailability(slug)` — checks if slug is unique in real-time
  - [x] Subtask 1.4: Implement `generateSlug(name)` — converts name to slug format (lowercase, hyphens)
  - [x] Subtask 1.5: Implement `updateRestaurant(restaurantId, data)` — updates restaurant document
  - [x] Subtask 1.6: Implement `getRestaurant(restaurantId)` — gets restaurant document

- [x] Task 2: Create Onboarding Page Component (AC: 1, 2, 3, 4, 5)
  - [x] Subtask 2.1: Create `src/app/onboarding/onboarding-page/onboarding-page.component.ts`
  - [x] Subtask 2.2: Implement step indicator ("Step 1 of 3: Restaurant basics")
  - [x] Subtask 2.3: Implement restaurant name input with label
  - [x] Subtask 2.4: Implement slug input with real-time validation
  - [x] Subtask 2.5: Implement slug preview ("Your booking link: bookable.co/{slug}")
  - [x] Subtask 2.6: Implement address input (optional, with "(optional)" label)
  - [x] Subtask 2.7: Implement "Continue" button with loading state
  - [x] Subtask 2.8: Implement form validation (name required, slug required and unique)
  - [x] Subtask 2.9: Style per DESIGN.md: centered card, max-width 480px, Inter font, warm linen background

- [x] Task 3: Create Onboarding Guard (AC: 1, 6)
  - [x] Subtask 3.1: Create `src/app/routing/guard/onboarding.guard.ts`
  - [x] Subtask 3.2: Implement functional guard that checks if user has completed onboarding
  - [x] Subtask 3.3: Redirect to dashboard if onboarding already completed
  - [x] Subtask 3.4: Redirect to onboarding if not completed

- [x] Task 4: Update Angular Routing (AC: 1)
  - [x] Subtask 4.1: Update `src/app/app.routes.ts` to add `/onboarding` route
  - [x] Subtask 4.2: Add onboarding guard to route
  - [x] Subtask 4.3: Update redirect logic to handle onboarding flow

- [x] Task 5: Write Unit Tests (AC: 1, 2, 3, 4, 5, 6)
  - [x] Subtask 5.1: Test OnboardingService — createRestaurant creates document in Firestore
  - [x] Subtask 5.2: Test OnboardingService — checkSlugAvailability returns true/false
  - [x] Subtask 5.3: Test OnboardingService — generateSlug converts name to slug format
  - [x] Subtask 5.4: Test OnboardingPageComponent — form validation works correctly
  - [x] Subtask 5.5: Test OnboardingPageComponent — slug auto-generates from name
  - [x] Subtask 5.6: Test OnboardingPageComponent — address field is optional
  - [x] Subtask 5.7: Test OnboardingGuard — redirects based on onboarding status
  - [x] Subtask 5.8: Test OnboardingGuard — redirects to onboarding when not completed
  - [x] Subtask 5.9: Test OnboardingGuard — redirects to dashboard when completed

- [x] Task 6: Integration Testing (AC: 1, 2, 3, 4, 5)
  - [x] Subtask 6.1: Test complete onboarding flow from sign-up to Step 1
  - [x] Subtask 6.2: Test slug uniqueness validation with existing restaurants
  - [x] Subtask 6.3: Test form submission and Firestore document creation
  - [x] Subtask 6.4: Test error handling for Firestore failures

## Dev Notes

### Architecture Patterns & Constraints

**AD-2 — Direct Firebase from Browser:**
- Onboarding service calls Firestore directly. No API layer.
- Security rules already enforce owner-based access (Story 1.2).

**AD-9 — Restaurant Slug for Identification:**
- Each restaurant has a unique slug. Used in widget embed: `<booking-widget restaurant="the-blue-bistro">`.
- Slug resolution uses a collection query on the `slug` field, not the document ID.
- Firestore rules enforce slug uniqueness via a `slugs/{slug}` lookup document.

**AD-13 — One Restaurant per Account:**
- Single restaurant per auth account. Onboarding creates the restaurant document.

### Code patterns established (from Story 1.1, 1.2, 1.3)

- **Firebase access:** `import { getFirebaseDb } from '../../shared/firebase-config'` (or `src/shared/` relative path)
- **Environment variables:** `import.meta.env.VITE_*` — all Firebase config uses this pattern
- **Services:** Use `inject()` for Angular dependencies, signals for state
- **Testing:** Vitest globals, `ng-mocks` for Angular component isolation, mock Firebase APIs
- **Types:** Standalone files in `src/shared/types/`, barrel-exported via `index.ts`
- **Selectors:** `osef` prefix for all Angular components
- **Auth guard pattern:** Functional guards with `inject()` for dependencies

### Files to create

- `src/app/services/onboarding.service.ts` — OnboardingService (singleton, `providedIn: 'root'`)
- `src/app/services/onboarding.service.spec.ts` — OnboardingService tests
- `src/app/onboarding/onboarding-page/onboarding-page.component.ts` — Onboarding page component
- `src/app/onboarding/onboarding-page/onboarding-page.component.spec.ts` — Onboarding page tests
- `src/app/routing/guard/onboarding.guard.ts` — Functional onboarding guard
- `src/app/routing/guard/onboarding.guard.spec.ts` — Onboarding guard tests

### Files to modify

- `src/app/app.routes.ts` — Add `/onboarding` route with guard
- `src/shared/types/restaurant.ts` — May need to add `onboardingCompleted` field to Restaurant interface

### Testing requirements

- Unit tests for OnboardingService methods (mock Firestore SDK)
- Unit tests for onboarding guard (mock auth and restaurant state)
- Unit tests for onboarding page component (mock OnboardingService)
- Use `ng-mocks` for Angular component isolation
- Never call real Firestore in tests — always mock
- Test error handling: Firestore failures, slug uniqueness violations
- Test guard behavior: redirect to onboarding when not completed, redirect to dashboard when completed

### Previous Story Learnings

**From Story 1.1 (Project Scaffolding & Firebase Setup):**
- Firebase config uses `import.meta.env.VITE_*` pattern
- `getFirebaseDb()` is already available — do NOT reinitialize Firebase
- Angular app uses standalone components, `osef` selector prefix

**From Story 1.2 (Restaurant Data Model & Security Rules):**
- Security rules already enforce owner-based access (`request.auth.uid == resource.data.ownerId`)
- Restaurant document has `ownerId` field — set during onboarding
- Slug uniqueness enforced via `slugs/{slug}` lookup document
- Test patterns: Vitest + Angular test builder, mock Firebase services

**From Story 1.3 (User Authentication):**
- Auth guard pattern established: functional guards with `inject()` for dependencies
- `isFirstSignIn()` checks if user has no restaurant document yet
- Onboarding redirect happens after successful sign-up
- Code review lesson: Always validate data at boundaries (forms, security rules)

**Story 1.4 (Onboarding Basics Step):**
- New guard needed: `onboarding.guard.ts` to enforce onboarding completion
- Guard should check if user has a restaurant document
- If no restaurant document exists, redirect to `/onboarding`
- If restaurant document exists, allow access to dashboard

### References

- [Source: ARCHITECTURE-SPINE.md — AD-2 (Direct Firebase), AD-9 (Restaurant Slug), AD-13 (One Restaurant per Account)]
- [Source: epics.md — Story 1.4 (Onboarding — Basics Step)]
- [Source: DESIGN.md — Onboarding card styling, centered layout, max-width 480px]
- [Source: src/shared/types/restaurant.ts — Restaurant interface]
- [Source: src/shared/firebase-config.ts — getFirebaseDb() export]
- [Source: firestore.rules — Owner-based access control already enforced]

### ATDD Artifacts

- Checklist: `_bmad-output/test-artifacts/atdd-checklist-1-4-onboarding-basics-step.md`
- API tests: `tests/api/onboarding-service.spec.ts`
- E2E tests: `tests/e2e/onboarding-wizard.spec.ts`
- Test fixtures: `tests/fixtures/test-data.ts`

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

### Review Findings

#### Patches (all applied)

1. **[HIGH] Non-atomic slug+restaurant write** — ✅ Fixed: Firestore batch makes writes atomic
2. **[MEDIUM] Slug TOCTOU race** — ✅ Fixed: batch commit prevents concurrent slug claims
3. **[MEDIUM] Guard uses raw Firestore instead of shared config** — ✅ Fixed: imports from shared/firebase-config
4. **[MEDIUM] Double slug check per keystroke** — ✅ Fixed: onSlugInput no longer calls checkSlugAvailability
5. **[MEDIUM] Manual slug edits overwritten by effect** — ✅ Fixed: userEditedSlug signal gates auto-generation
6. **[MEDIUM] Progress bar not positioned within card** — ✅ Fixed: added relative to mat-card
7. **[MEDIUM] slugCheckTimeout not cleaned up on destroy** — ✅ Fixed: DestroyRef.onDestroy clears timeout
8. **[LOW] generateSlug returns empty string** — ✅ Fixed: fallback to 'restaurant'
9. **[LOW] Step indicator missing suffix** — ✅ Fixed: added ': Restaurant basics'
10. **[LOW] Button missing busy state** — ✅ Fixed: added aria-busy attribute
11. **[LOW] Slug hints not live region** — ✅ Fixed: added aria-live polite div

#### Deferred

1. `isOnboardedGuard` catch redirects to `/onboarding` while `isNotOnboardedGuard` catch returns `true` — inconsistent failure behavior (pre-existing architectural pattern from auth guard).
2. No Firestore caching in guards — every navigation triggers a live query (pre-existing pattern).
3. `updateRestaurant` / `getRestaurant` have no client-side ownerId check — relies on Firestore rules (AD-2 architecture: rules enforce access).
4. `FormsModule` used instead of Signal Forms — per AGENTS.md preference, but FormsModule works and is consistent with existing code.
5. `createdAt` declared as `Date` in restaurantData but written as `serverTimestamp()` — type mismatch at runtime; existing pattern from Story 1.2.

#### Code Review 2 (2026-07-20)

**Patches (to apply):**

- [ ] [Review][Patch] JAVA_HOME hardcoded in playwright.config.ts [playwright.config.ts:41] — non-portable path; use env var or conditional
- [ ] [Review][Patch] `/onboarding/step-2` undefined route [onboarding-page.component.ts:131] — navigate to `/onboarding` instead (step-2 doesn't exist yet)
- [ ] [Review][Patch] Sprint status inconsistency — sprint-status.yaml says in-progress, spec says done [sprint-status.yaml]
- [ ] [Review][Patch] Missing P0 E2E test: dashboard access after onboarding completed [onboarding-wizard.spec.ts]
- [ ] [Review][Patch] `onboardedUser` fixture name misleading — creates new user, not onboarded [onboarding.fixture.ts:8]

**Deferred:**

- [x] [Review][Defer] `isNotOnboardedGuard` fails open on Firestore error [onboarding.guard.ts:43-44] — deferred, pre-existing pattern
- [x] [Review][Defer] `createdAt` type mismatch — Date vs Firestore Timestamp [onboarding.service.ts:65] — deferred, existing pattern from Story 1.2
- [x] [Review][Defer] `FormsModule` used instead of Signal Forms [onboarding-page.component.ts:2] — deferred, consistent with existing code
- [x] [Review][Defer] Guard picks first unordered doc (no ordering guarantee) [onboarding.guard.ts:19] — deferred, AD-13 assumes one restaurant per account
- [x] [Review][Defer] `@Injectable` instead of `@Service` [onboarding.service.ts:13] — deferred, @Service may not be available
- [x] [Review][Defer] No Firestore caching in guards [onboarding.guard.ts:14-15] — deferred, pre-existing pattern

### Review Triage Log

#### 2026-07-20 — Review pass (code review round 2)
- intent_gap: 0
- bad_spec: 0
- decision_needed: 0
- patch: 5 (high 4, medium 1)
- defer: 6 (medium 4, low 2)
- dismiss: 15
- failed_layers: 0

#### 2026-07-18 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 11: (high 1, medium 6, low 4)
- defer: 5
- reject: 0
- addressed_findings:
  - `[high]` `[patch]` Non-atomic slug+restaurant write — replaced sequential setDoc with Firestore batch
  - `[medium]` `[patch]` Slug TOCTOU race — batch commit makes slug+restaurant write atomic
  - `[medium]` `[patch]` Guard uses raw Firestore — replaced getFirestore/getAuth with shared config imports
  - `[medium]` `[patch]` Double slug check per keystroke — removed checkSlugAvailability from onSlugInput; effect handles auto-generation only
  - `[medium]` `[patch]` Manual slug edits overwritten — added userEditedSlug signal; effect skips auto-generation when true
  - `[medium]` `[patch]` Progress bar not positioned within card — added relative class to mat-card
  - `[medium]` `[patch]` slugCheckTimeout not cleaned up — added DestroyRef.onDestroy cleanup
  - `[low]` `[patch]` generateSlug returns empty string — added fallback to 'restaurant'
  - `[low]` `[patch]` Step indicator missing suffix — added ': Restaurant basics' to match AC1
  - `[low]` `[patch]` Button missing busy state — added aria-busy attribute
  - `[low]` `[patch]` Slug hints not live region — added aria-live polite div for screen readers
