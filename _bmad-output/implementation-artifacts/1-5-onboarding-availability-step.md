---
baseline_commit: b7178c5
status: ready-for-dev
---

# Story 1.5: Onboarding — Availability Step

Status: ready-for-dev

## Story

As a restaurant owner,
I want to configure my opening hours and table groups,
so that the widget can show available times and table sizes.

## Acceptance Criteria

**Given** the availability step
**When** it loads
**Then** a centered card shows "Step 2 of 3: Availability"
**And** the heading reads "When are you open?"

**Given** the availability step
**When** the owner configures opening hours
**Then** a weekly schedule (Monday–Sunday) is displayed
**And** each day has an open/closed toggle
**And** open days show time inputs for open and close times
**And** the schedule is saved as `Record<number, {open, close}>` (ISO day numbers)

**Given** the availability step
**When** the owner tries to continue with all days closed
**Then** the "Continue" button is disabled
**And** a message shows "Set your opening hours to continue"

**Given** the availability step
**When** the owner adds a table group
**Then** a form row appears with capacity (number) and count (number) inputs
**And** the owner can add multiple table groups

**Given** the availability step
**When** the owner tries to continue with no table groups
**Then** the "Continue" button is disabled
**And** a message shows "Add at least one table group to continue"

**Given** the availability step
**When** the owner has valid hours and at least one table group
**And** clicks "Continue"
**Then** the data is saved
**And** the wizard advances to Step 3

## Tasks / Subtasks

- [ ] Task 1: Create Availability Page Component (AC: 1, 2, 3, 4, 5)
  - [ ] Subtask 1.1: Create `src/app/onboarding/availability-page/availability-page.component.ts`
  - [ ] Subtask 1.2: Implement step indicator ("Step 2 of 3: Availability")
  - [ ] Subtask 1.3: Implement weekly schedule (Mon–Sun) with open/closed toggle per day
  - [ ] Subtask 1.4: Implement time inputs (open/close) for enabled days
  - [ ] Subtask 1.5: Implement table group form with capacity + count inputs
  - [ ] Subtask 1.6: Implement "Add Table Group" button
  - [ ] Subtask 1.7: Implement "Continue" button with disabled state when invalid
  - [ ] Subtask 1.8: Implement validation messages (hours required, table groups required)
  - [ ] Subtask 1.9: Style per DESIGN.md: centered card, max-width 480px, warm linen background

- [ ] Task 2: Update Onboarding Service (AC: 6)
  - [ ] Subtask 2.1: Add `updateHours(restaurantId, hours)` method to OnboardingService
  - [ ] Subtask 2.2: Add `updateTableGroups(restaurantId, tableGroups)` method

- [ ] Task 3: Update Angular Routing (AC: 6)
  - [ ] Subtask 3.1: Add `/onboarding/availability` route to `app.routes.ts`
  - [ ] Subtask 3.2: Add onboarding guard to new route
  - [ ] Subtask 3.3: Update Step 1 navigation to go to `/onboarding/availability`

- [ ] Task 4: Write Unit Tests (AC: 1, 2, 3, 4, 5, 6)
  - [ ] Subtask 4.1: Test AvailabilityPageComponent — step indicator renders correctly
  - [ ] Subtask 4.2: Test AvailabilityPageComponent — weekly schedule renders
  - [ ] Subtask 4.3: Test AvailabilityPageComponent — toggle enables/disables time inputs
  - [ ] Subtask 4.4: Test AvailabilityPageComponent — table group form works
  - [ ] Subtask 4.5: Test AvailabilityPageComponent — validation messages display
  - [ ] Subtask 4.6: Test AvailabilityPageComponent — continue saves data and navigates
  - [ ] Subtask 4.7: Test OnboardingService — updateHours saves to Firestore
  - [ ] Subtask 4.8: Test OnboardingService — updateTableGroups saves to Firestore

## Dev Notes

### Architecture Patterns & Constraints

**AD-2 — Direct Firebase from Browser:**
- Onboarding service calls Firestore directly. No API layer.
- Security rules already enforce owner-based access (Story 1.2).

**AD-13 — One Restaurant per Account:**
- Single restaurant per auth account. Onboarding updates the restaurant document.

### Code patterns established (from Story 1.1–1.4)

- **Firebase access:** `import { getFirebaseDb } from '../../shared/firebase-config'`
- **Services:** Use `inject()` for Angular dependencies, signals for state
- **Testing:** Vitest globals, `ng-mocks` for Angular component isolation, mock Firebase APIs
- **Types:** `OpeningHours = Partial<Record<DayNumber, DayHours>>`, `DayNumber = 1-7` (ISO), `TableGroup = {capacity, count}`
- **Selectors:** `osef` prefix for all Angular components
- **Routing:** Functional guards with `inject()` for dependencies

### Files to create

- `src/app/onboarding/availability-page/availability-page.component.ts` — Availability page component
- `src/app/onboarding/availability-page/availability-page.component.html` — Template
- `src/app/onboarding/availability-page/availability-page.component.scss` — Styles
- `src/app/onboarding/availability-page/availability-page.component.spec.ts` — Tests

### Files to modify

- `src/app/services/onboarding.service.ts` — Add `updateHours` and `updateTableGroups` methods
- `src/app/app.routes.ts` — Add `/onboarding/availability` route
- `src/app/onboarding/onboarding-page/onboarding-page.component.ts` — Update navigation to `/onboarding/availability`

### Testing requirements

- Unit tests for AvailabilityPageComponent (mock OnboardingService)
- Unit tests for OnboardingService updateHours/updateTableGroups (mock Firestore)
- Use `ng-mocks` for Angular component isolation
- Never call real Firestore in tests — always mock
- Test validation: hours required, table groups required
- Test navigation: continue saves and navigates to Step 3

### Previous Story Learnings

**From Story 1.4 (Onboarding Basics Step):**
- OnboardingService already has `updateRestaurant(restaurantId, data)` — can use for hours/tableGroups
- Component uses `FormsModule` (not Signal Forms) — keep consistent
- Guard pattern: functional guards with `inject()` for dependencies
- Firebase mocking: `vi.mock('firebase/auth')`, `vi.mock('firebase/firestore')`, `vi.mock('firebase/app')`
- Angular `effect()` is async — tests need `vi.advanceTimersByTime()` + `fixture.whenStable()`
- Router guards return `UrlTree` from `router.parseUrl()` — must compare with `.toString()`

### References

- [Source: epics.md — Story 1.5 (Onboarding — Availability Step)]
- [Source: src/shared/types/restaurant.ts — OpeningHours, DayNumber, DayHours, TableGroup]
- [Source: src/app/services/onboarding.service.ts — updateRestaurant, createRestaurant]
- [Source: src/app/onboarding/onboarding-page/onboarding-page.component.ts — Step 1 pattern]
- [Source: src/app/app.routes.ts — Current routing structure]

### ATDD Artifacts

- Checklist: `_bmad-output/test-artifacts/atdd-checklist-1-5-onboarding-availability-step.md`
- E2E tests: `tests/e2e/onboarding-availability.spec.ts`
- Component tests: `src/app/onboarding/availability-page/availability-page.component.spec.ts`

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

### Review Findings

- [ ] [Review][Patch] No close > open time validation [availability-page.component.ts:100-106]
- [ ] [Review][Patch] No persistence of existing restaurant data on page load [availability-page.component.ts:33-41]
- [ ] [Review][Patch] Add/Remove buttons not disabled during save [availability-page.component.html:64-71]
- [x] [Review][Defer] Clearing number input reverts to stale value [availability-page.component.ts:66-78] — deferred, low priority input handling
- [x] [Review][Defer] No upper bound on capacity/count [availability-page.component.ts:66-78] — deferred, low priority
- [x] [Review][Defer] getRestaurantByOwner picks first of multiple [onboarding.service.ts:117-126] — deferred, one restaurant per account
- [x] [Review][Defer] router.navigate failure leaves user in limbo [availability-page.component.ts:115] — deferred, rare edge case
- [x] [Review][Defer] User navigates away mid-submission [availability-page.component.ts:92-121] — deferred, SPA lifecycle
- [x] [Review][Defer] Route not nested under /onboarding [app.routes.ts:46-53] — deferred, architectural decision
- [x] [Review][Defer] Midday time wrap unhandled [restaurant.ts] — deferred, data model limitation
