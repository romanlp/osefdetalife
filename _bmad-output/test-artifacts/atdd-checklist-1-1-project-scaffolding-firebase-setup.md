---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-generation-mode', 'step-03-test-strategy', 'step-04-generate-tests']
lastStep: 'step-04-generate-tests'
lastSaved: '2026-07-14'
storyId: '1.1'
storyKey: '1-1-project-scaffolding-firebase-setup'
storyFile: '_bmad-output/planning-artifacts/epics.md'
atddChecklistPath: '_bmad-output/test-artifacts/atdd-checklist-1-1-project-scaffolding-firebase-setup.md'
generatedTestFiles:
  - 'e2e/tests/story-1-1-dashboard.spec.ts'
  - 'e2e/tests/story-1-1-build-firebase.spec.ts'
  - 'src/shared/story-1-1-typescript-structure.spec.ts'
inputDocuments:
  - '_bmad-output/planning-artifacts/epics.md'
  - '_bmad-output/project-context.md'
  - '_bmad/tea/config.yaml'
  - '.agents/skills/bmad-tea/resources/knowledge/data-factories.md'
  - '.agents/skills/bmad-tea/resources/knowledge/component-tdd.md'
  - '.agents/skills/bmad-tea/resources/knowledge/test-quality.md'
  - '.agents/skills/bmad-tea/resources/knowledge/test-healing-patterns.md'
  - '.agents/skills/bmad-tea/resources/knowledge/selector-resilience.md'
  - '.agents/skills/bmad-tea/resources/knowledge/timing-debugging.md'
---

# ATDD Checklist: Story 1.1 - Project Scaffolding & Firebase Setup

## Step 1: Preflight & Context Loading

### Stack Detection

- **Detected Stack**: frontend
- **Framework**: Angular 22+ + Firebase
- **Test Framework**: Playwright + Vitest

### Prerequisites

| Requirement | Status | Notes |
|-------------|--------|-------|
| Story approved with clear acceptance criteria | ✅ | Story 1.1 has 9 acceptance criteria |
| Test framework configured | ✅ | `playwright.config.ts` exists |
| Development environment available | ✅ | Project structure exists |

### Story Context

- **Story ID**: 1.1
- **Story Key**: 1-1-project-scaffolding-firebase-setup
- **Title**: Project Scaffolding & Firebase Setup
- **Epic**: 1 - Restaurant Setup & Onboarding

**Acceptance Criteria:**

1. Angular dashboard app boots on localhost with placeholder home route
2. TypeScript strict mode enabled
3. Project structure matches Architecture Spine (`src/dashboard/`, `src/widget/`, `src/shared/`)
4. Widget builds to standalone JS bundle at `dist/widget/`
5. Bundle exports `<booking-widget>` custom element
6. Shared TypeScript interfaces available (`Restaurant`, `Booking`, `TableGroup`, `OpeningHours`, `CustomField`)
7. Shared Firebase initialization module exported
8. Firebase emulators available locally (Firestore, Auth, Hosting)
9. Dashboard connects to emulators in development mode

### Framework & Patterns

- Playwright config exists at `playwright.config.ts`
- Fixture architecture in `e2e/fixtures/` (Firebase, Restaurant, Booking, Auth fixtures)
- `mergeTests` composition pattern

### Knowledge Fragments Loaded

- Core: `data-factories.md`, `component-tdd.md`, `test-quality.md`, `test-healing-patterns.md`
- Frontend: `selector-resilience.md`, `timing-debugging.md`

### TEA Config

- `tea_use_playwright_utils`: true
- `tea_browser_automation`: auto
- `test_stack_type`: frontend

## Step 2: Generation Mode Selection

**Mode Selected**: AI Generation

**Rationale:**
- Acceptance criteria are clear and well-defined (9 criteria)
- Scenarios are standard (project scaffolding, Firebase configuration, build verification)
- This is a foundation story with no complex UI interactions to record
- No live browser verification needed for scaffolding tests

**Recording Mode**: Not needed for this story.

## Step 3: Test Strategy

### Acceptance Criteria to Test Scenarios

| AC | Acceptance Criterion | Test Scenario | Test Level | Priority | Rationale |
|----|---------------------|---------------|------------|----------|-----------|
| AC1 | Angular dashboard app boots on localhost with placeholder home route | Verify Angular app loads and shows placeholder home route | E2E | P0 | Critical user journey - app must boot |
| AC2 | TypeScript strict mode enabled | Verify TypeScript config has strict mode | Unit | P1 | Configuration verification |
| AC3 | Project structure matches Architecture Spine | Verify directory structure exists (`src/dashboard/`, `src/widget/`, `src/shared/`) | Unit | P1 | Structure validation |
| AC4 | Widget builds to standalone JS bundle at `dist/widget/` | Verify Vite build produces bundle | Integration | P0 | Build process critical |
| AC5 | Bundle exports `<booking-widget>` custom element | Verify custom element is registered | Integration | P0 | Widget functionality critical |
| AC6 | Shared TypeScript interfaces available | Verify interfaces can be imported | Unit | P1 | Type safety |
| AC7 | Shared Firebase initialization module exported | Verify Firebase module can be imported | Unit | P1 | Firebase setup |
| AC8 | Firebase emulators available locally | Verify emulators start and respond | Integration | P0 | Development environment critical |
| AC9 | Dashboard connects to emulators in development mode | Verify dashboard uses emulator config | Integration | P0 | Development workflow critical |

### Test Level Selection Rationale

- **E2E**: AC1 (app boot) - Critical user journey requiring browser verification
- **Integration**: AC4, AC5, AC8, AC9 - Build process and Firebase setup require system integration
- **Unit**: AC2, AC3, AC6, AC7 - Configuration and type verification are isolated checks

### Priority Distribution

- **P0 (Critical)**: 5 tests (AC1, AC4, AC5, AC8, AC9)
- **P1 (Important)**: 4 tests (AC2, AC3, AC6, AC7)

### Red Phase Requirements

All tests are designed to **fail before implementation**:

1. **E2E Test**: Will fail because Angular app doesn't exist yet
2. **Integration Tests**: Will fail because build process and Firebase not configured
3. **Unit Tests**: Will fail because TypeScript configs and modules don't exist

**Total Tests**: 9 (5 P0, 4 P1)

## Step 4: Generate Tests

### Generated Test Files

| File | Type | Tests | Priority |
|------|------|-------|----------|
| `e2e/tests/story-1-1-dashboard.spec.ts` | E2E | 2 | P0 |
| `e2e/tests/story-1-1-build-firebase.spec.ts` | Integration | 3 | P0 |
| `src/shared/story-1-1-typescript-structure.spec.ts` | Unit | 4 | P1 |

### Test Summary

- **Total Tests**: 9
- **P0 Tests**: 5 (E2E + Integration)
- **P1 Tests**: 4 (Unit)
- **TDD Phase**: RED (all tests use `test.skip()`)
- **Status**: Tests will fail until feature is implemented

### Red Phase Compliance

✅ All tests are marked with `test.skip()` (TDD red phase)
✅ Tests assert EXPECTED behavior (will fail when activated)
✅ No active passing tests generated
✅ Tests scaffolded for developer activation