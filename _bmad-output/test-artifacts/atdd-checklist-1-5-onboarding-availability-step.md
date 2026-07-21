---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-generation-mode', 'step-03-test-strategy', 'step-04-generate-tests', 'step-04c-aggregate', 'step-05-validate-and-complete']
lastStep: 'step-05-validate-and-complete'
lastSaved: '2026-07-21'
storyId: '1.5'
storyKey: '1-5-onboarding-availability-step'
storyFile: '_bmad-output/implementation-artifacts/1-5-onboarding-availability-step.md'
atddChecklistPath: '_bmad-output/test-artifacts/atdd-checklist-1-5-onboarding-availability-step.md'
generatedTestFiles: ['tests/e2e/onboarding-availability.spec.ts', 'src/app/onboarding/availability-page/availability-page.component.spec.ts']
---

# ATDD Checklist: Story 1.5 — Onboarding — Availability Step

## TDD Red Phase (Current)

✅ Red-phase test scaffolds generated

- E2E Tests: 10 tests (all skipped)
- Component Tests: 11 tests (all skipped)

## Acceptance Criteria Coverage

| AC | Description | E2E | Component |
|----|-------------|-----|-----------|
| 1 | Step indicator and heading | ✅ | ✅ |
| 2 | Weekly schedule with toggles | ✅ | ✅ |
| 3 | Time inputs for open days | ✅ | ✅ |
| 4 | Hours validation message | ✅ | ✅ |
| 5 | Table groups validation | ✅ | ✅ |
| 6 | Save and navigate to Step 3 | ✅ | ✅ |

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
- `src/app/onboarding/availability-page/availability-page.component.ts`
- `src/app/onboarding/availability-page/availability-page.component.html`
- `src/app/onboarding/availability-page/availability-page.component.scss`

**Service methods to add:**
- `OnboardingService.updateHours(restaurantId, hours)`
- `OnboardingService.updateTableGroups(restaurantId, tableGroups)`

**Routes to add:**
- `/onboarding/availability` in `app.routes.ts`

**Navigation to update:**
- `onboarding-page.component.ts`: Step 1 continue navigates to `/onboarding/availability`

## Generated Test Files

### E2E Tests
- `tests/e2e/onboarding-availability.spec.ts` — 10 tests covering all acceptance criteria

### Component Tests
- `src/app/onboarding/availability-page/availability-page.component.spec.ts` — 11 tests covering all acceptance criteria

## Knowledge Fragments Used

- component-tdd.md
- test-quality.md
- selector-resilience.md
- data-factories.md
