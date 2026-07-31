---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-generation-mode', 'step-03-test-strategy', 'step-04-generate-tests', 'step-04c-aggregate', 'step-05-validate-and-complete']
lastStep: 'step-05-validate-and-complete'
lastSaved: '2026-07-31'
storyId: '1.6'
storyKey: '1-6-onboarding-branding-step'
storyFile: '_bmad-output/implementation-artifacts/1-6-onboarding-branding-step.md'
atddChecklistPath: '_bmad-output/test-artifacts/atdd-checklist-1-6-onboarding-branding-step.md'
generatedTestFiles: ['e2e/tests/onboarding-branding.spec.ts', 'src/app/onboarding/branding-page/branding-page.component.spec.ts']
---

# ATDD Checklist: Story 1.6 — Onboarding — Branding Step

## TDD Red Phase (Current)

✅ Red-phase test scaffolds generated

- E2E Tests: 7 tests (all skipped)
- Component Tests: 26 tests (all skipped)

## Acceptance Criteria Coverage

| AC | Description | E2E | Component |
|----|-------------|-----|-----------|
| 1 | Step indicator, heading, and Skip link | ✅ | ✅ |
| 2 | Color pickers with sensible defaults and hex validation | ✅ | ✅ |
| 3 | Custom field controls defaulting to disabled | ✅ | ✅ |
| 4 | Skip completes onboarding without saving branding | ✅ | ✅ |
| 5 | Complete saves branding data and navigates to dashboard | ✅ | ✅ |

## Next Steps (Task-by-Task Activation)

During implementation of each task:

1. Remove `test.skip()` from the current test file or scenario
2. Run tests: `npx vitest run` (component) or `npx playwright test` (E2E)
3. Verify the activated test fails first, then passes after implementation (green phase)
4. If any activated tests still fail unexpectedly:
   - Either fix implementation (feature bug)
   - Or fix test (test bug)
5. Commit passing tests

## Implementation Guidance

**Component to implement:**
- `src/app/onboarding/branding-page/branding-page.component.ts`
- `src/app/onboarding/branding-page/branding-page.component.html`
- `src/app/onboarding/branding-page/branding-page.component.scss`

**Service default changes:**
- `OnboardingService.createRestaurant`: whiteLabel defaults → `#1A1A1A` / `#8FA67A` (DESIGN palette)

**Routes to add:**
- `/onboarding/branding` in `app.routes.ts`

**Navigation to update:**
- `availability-page.component.ts`: Step 2 continue navigates to `/onboarding/branding`

**Existing E2E to keep green:**
- `e2e/tests/onboarding-wizard.spec.ts` (steps 1→2; update only if it asserted the old `/onboarding` redirect after step 2)

## Generated Test Files

### E2E Tests
- `e2e/tests/onboarding-branding.spec.ts` — 7 tests (4 P0, 2 P1, 1 P2) covering all acceptance criteria; uses the fresh `onboardingPage` fixture driven through steps 1→2, Firestore persistence check via `db` fixture

### Component Tests
- `src/app/onboarding/branding-page/branding-page.component.spec.ts` — 26 tests (12 P0, 11 P1, 3 P2) covering all acceptance criteria; spies on `OnboardingService` (`updateRestaurant`, `getRestaurant`, `getCurrentUser`, `getRestaurantByOwner`) with `provideRouter`

## Knowledge Fragments Used

- component-tdd.md
- test-quality.md
- selector-resilience.md
- data-factories.md
- fixture-architecture.md
