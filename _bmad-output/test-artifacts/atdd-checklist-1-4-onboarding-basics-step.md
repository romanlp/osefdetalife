---
stepsCompleted: ['step-04c-aggregate']
lastStep: 'step-04c-aggregate'
lastSaved: '2026-07-18'
storyId: '1.4'
storyKey: '1-4-onboarding-basics-step'
storyFile: '_bmad-output/implementation-artifacts/1-4-onboarding-basics-step.md'
atddChecklistPath: '_bmad-output/test-artifacts/atdd-checklist-1-4-onboarding-basics-step.md'
generatedTestFiles:
  - 'tests/api/onboarding-service.spec.ts'
  - 'tests/e2e/onboarding-wizard.spec.ts'
  - 'tests/fixtures/test-data.ts'
---

# ATDD Checklist: Story 1.4 - Onboarding Basics Step

## TDD Red Phase (Current)

✅ Red-phase test scaffolds generated

- API Tests: 5 tests (all skipped)
- E2E Tests: 8 tests (all skipped)

## Acceptance Criteria Coverage

| AC | Description | API Test | E2E Test | Priority |
|---|---|---|---|---|
| AC 1 | Onboarding card displays correctly | - | ✅ | P0 |
| AC 2 | Slug auto-generates from name | ✅ | ✅ | P0 |
| AC 3 | Slug uniqueness validation | ✅ | ✅ | P0 |
| AC 4 | Form submission and wizard advancement | ✅ | ✅ | P0 |
| AC 5 | Address field is optional | ✅ | ✅ | P1 |
| AC 6 | Dashboard redirect when not onboarded | - | ✅ | P0 |

## Test Files Generated

### API Tests
- `tests/api/onboarding-service.spec.ts` (5 tests)
  - [P0] should create restaurant document in Firestore
  - [P0] should check slug availability in real-time
  - [P1] should return 409 when slug already exists
  - [P1] should update restaurant document
  - [P2] should get restaurant document

### E2E Tests
- `tests/e2e/onboarding-wizard.spec.ts` (8 tests)
  - [P0] should display onboarding card with correct heading
  - [P0] should auto-generate slug from restaurant name
  - [P0] should validate slug uniqueness in real-time
  - [P0] should advance to step 2 after valid submission
  - [P1] should show address field as optional
  - [P1] should allow skipping address field
  - [P0] should redirect to onboarding when not completed
  - [P0] should allow dashboard access after onboarding completed

### Test Fixtures
- `tests/fixtures/test-data.ts`

## Next Steps (Task-by-Task Activation)

During implementation of each task:

1. Remove `test.skip()` from the current test file or scenario
2. Run tests: `npm test`
3. Verify the activated test fails first, then passes after implementation (green phase)
4. If any activated tests still fail unexpectedly:
   - Either fix implementation (feature bug)
   - Or fix test (test bug)
5. Commit passing tests

## Implementation Guidance

### API Endpoints to Implement
- POST /api/restaurants - Create restaurant document
- GET /api/restaurants/check-slug/:slug - Check slug availability
- PATCH /api/restaurants/:id - Update restaurant document
- GET /api/restaurants/:id - Get restaurant document

### UI Components to Implement
- Onboarding Wizard page
- Restaurant name input
- Slug input with validation
- Slug preview display
- Address input (optional)
- Continue button with loading state
- Step indicator (Step 1 of 3)
- Onboarding guard for route protection

### Services to Implement
- OnboardingService
  - createRestaurant()
  - checkSlugAvailability()
  - generateSlug()
  - updateRestaurant()
  - getRestaurant()

### Guards to Implement
- onboarding.guard.ts
  - Check if user has completed onboarding
  - Redirect to /onboarding if not completed
  - Redirect to /dashboard if completed
