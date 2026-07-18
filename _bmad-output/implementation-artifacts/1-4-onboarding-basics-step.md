---
baseline_commit: 50f33a0
---

# Story 1.4: Onboarding — Basics Step

Status: ready-for-dev

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

## Tasks / Subtasks

- [ ] Task 1: Create Onboarding Service (AC: 1, 2, 3, 4)
  - [ ] Subtask 1.1: Create `src/app/services/onboarding.service.ts`
  - [ ] Subtask 1.2: Implement `createRestaurant(name, slug, address?)` — creates restaurant document in Firestore
  - [ ] Subtask 1.3: Implement `checkSlugAvailability(slug)` — checks if slug is unique in real-time
  - [ ] Subtask 1.4: Implement `generateSlug(name)` — converts name to slug format (lowercase, hyphens)
  - [ ] Subtask 1.5: Implement `updateRestaurant(restaurantId, data)` — updates restaurant document
  - [ ] Subtask 1.6: Implement `getRestaurant(restaurantId)` — gets restaurant document

- [ ] Task 2: Create Onboarding Page Component (AC: 1, 2, 3, 4, 5)
  - [ ] Subtask 2.1: Create `src/app/onboarding/onboarding-page/onboarding-page.component.ts`
  - [ ] Subtask 2.2: Implement step indicator ("Step 1 of 3: Restaurant basics")
  - [ ] Subtask 2.3: Implement restaurant name input with label
  - [ ] Subtask 2.4: Implement slug input with real-time validation
  - [ ] Subtask 2.5: Implement slug preview ("Your booking link: bookable.co/{slug}")
  - [ ] Subtask 2.6: Implement address input (optional, with "(optional)" label)
  - [ ] Subtask 2.7: Implement "Continue" button with loading state
  - [ ] Subtask 2.8: Implement form validation (name required, slug required and unique)
  - [ ] Subtask 2.9: Style per DESIGN.md: centered card, max-width 480px, Inter font, warm linen background

- [ ] Task 3: Create Onboarding Guard (AC: 1)
  - [ ] Subtask 3.1: Create `src/app/routing/guard/onboarding.guard.ts`
  - [ ] Subtask 3.2: Implement functional guard that checks if user has completed onboarding
  - [ ] Subtask 3.3: Redirect to dashboard if onboarding already completed
  - [ ] Subtask 3.4: Redirect to onboarding if not completed

- [ ] Task 4: Update Angular Routing (AC: 1)
  - [ ] Subtask 4.1: Update `src/app/app.routes.ts` to add `/onboarding` route
  - [ ] Subtask 4.2: Add onboarding guard to route
  - [ ] Subtask 4.3: Update redirect logic to handle onboarding flow

- [ ] Task 5: Write Unit Tests (AC: 1, 2, 3, 4, 5)
  - [ ] Subtask 5.1: Test OnboardingService — createRestaurant creates document in Firestore
  - [ ] Subtask 5.2: Test OnboardingService — checkSlugAvailability returns true/false
  - [ ] Subtask 5.3: Test OnboardingService — generateSlug converts name to slug format
  - [ ] Subtask 5.4: Test OnboardingPageComponent — form validation works correctly
  - [ ] Subtask 5.5: Test OnboardingPageComponent — slug auto-generates from name
  - [ ] Subtask 5.6: Test OnboardingPageComponent — address field is optional
  - [ ] Subtask 5.7: Test OnboardingGuard — redirects based on onboarding status

- [ ] Task 6: Integration Testing (AC: 1, 2, 3, 4, 5)
  - [ ] Subtask 6.1: Test complete onboarding flow from sign-up to Step 1
  - [ ] Subtask 6.2: Test slug uniqueness validation with existing restaurants
  - [ ] Subtask 6.3: Test form submission and Firestore document creation
  - [ ] Subtask 6.4: Test error handling for Firestore failures

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

### References

- [Source: ARCHITECTURE-SPINE.md — AD-2 (Direct Firebase), AD-9 (Restaurant Slug), AD-13 (One Restaurant per Account)]
- [Source: epics.md — Story 1.4 (Onboarding — Basics Step)]
- [Source: DESIGN.md — Onboarding card styling, centered layout, max-width 480px]
- [Source: src/shared/types/restaurant.ts — Restaurant interface]
- [Source: src/shared/firebase-config.ts — getFirebaseDb() export]
- [Source: firestore.rules — Owner-based access control already enforced]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

### Review Findings

#### Patches

#### Deferred
