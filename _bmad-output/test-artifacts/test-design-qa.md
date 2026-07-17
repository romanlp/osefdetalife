---
workflowStatus: 'completed'
totalSteps: 5
stepsCompleted: ['step-01-detect-mode', 'step-02-load-context', 'step-03-risk-and-testability', 'step-04-coverage-plan', 'step-05-generate-output']
lastStep: 'step-05-generate-output'
nextStep: ''
lastSaved: '2026-07-14'
workflowType: 'testarch-test-design'
inputDocuments:
  - '_bmad-output/planning-artifacts/prds/prd-osefdetalife-2026-07-12/prd.md'
  - '_bmad-output/planning-artifacts/architecture/architecture-osefdetalife-2026-07-12/ARCHITECTURE-SPINE.md'
  - '_bmad-output/planning-artifacts/epics.md'
---

# Test Design for QA: osefdetalife

**Purpose:** Test execution recipe for QA team. Defines what to test, how to test it, and what QA needs from other teams.

**Date:** 2026-07-14
**Author:** TEA Master Test Architect
**Status:** Draft
**Project:** osefdetalife

**Related:** See Architecture doc (test-design-architecture.md) for testability concerns and architectural blockers.

---

## Executive Summary

**Scope:** White-label restaurant booking & reservation SaaS platform. Testing covers widget, onboarding wizard, dashboard, security, performance, and reliability.

**Risk Summary:**

- Total Risks: 10 (3 high-priority score ≥6, 4 medium, 3 low)
- Critical Categories: SEC, TECH, OPS

**Coverage Summary:**

- P0 tests: ~20 (critical paths, security)
- P1 tests: ~22 (important features, integration)
- P2 tests: ~7 (edge cases, regression)
- P3 tests: ~3 (exploratory, benchmarks)
- **Total**: ~52 tests (~4-8 weeks with 1 QA)

---

## Not in Scope

| Item | Reasoning | Mitigation |
|------|-----------|------------|
| **Load Testing** | Low traffic volume initially | Add k6 testing post-MVP |
| **Chaos Testing** | Firebase handles availability | Add fault injection post-MVP |
| **Multi-language Support** | UK market only | N/A |
| **Mobile Native Apps** | Web-based widget only | N/A |

**Note:** Items listed here have been reviewed and accepted as out-of-scope by QA, Dev, and PM.

---

## Dependencies & Test Blockers

**CRITICAL:** QA cannot proceed without these items from other teams.

### Backend/Architecture Dependencies (Pre-Implementation)

1. **Firebase Project Setup** - Development team - Before development
   - Firebase project created
   - Firestore database configured
   - Authentication enabled

2. **Input Validation Rules** - Development team - Before test development
   - Define validation rules for all form fields
   - Implement Angular Reactive Forms with Validators
   - Add XSS sanitization for custom fields

3. **Logging/Monitoring Strategy** - Development team - Before MVP launch
   - Add Angular ErrorHandler for global error catching
   - Implement structured logging with console methods
   - Add Sentry for error tracking

### QA Infrastructure Setup (Pre-Implementation)

1. **Test Data Factories** - QA
   - Restaurant factory with faker-based randomization
   - Booking factory with date/time generation
   - Table group factory with capacity/count

2. **Test Environments** - QA
   - Local: Firebase Emulator (Auth: 9099, Firestore: 8080, Hosting: 4200)
   - CI/CD: GitHub Actions with Firebase Emulator
   - Staging: Firebase project (post-MVP)

**Example factory pattern:**

```typescript
import { mergeTests } from '@playwright/test';
import { test as base } from '@playwright/test';
import { faker } from '@faker-js/faker';

export const test = mergeTests(
  base,
  // Add custom fixtures here
);

export { expect } from '@playwright/test';

// Factory example
export async function createRestaurant(overrides?: Partial<Restaurant>) {
  return {
    name: faker.company.name(),
    slug: faker.helpers.slugify(faker.company.name()),
    address: faker.location.streetAddress(),
    ...overrides,
  };
}
```

---

## Risk Assessment

**Note:** Full risk details in Architecture doc. This section summarizes risks relevant to QA test planning.

### High-Priority Risks (Score ≥6)

| Risk ID | Category | Description | Score | QA Test Coverage |
|---------|----------|-------------|-------|------------------|
| **SEC-001** | SEC | No input validation on widget form fields | **6** | E2E tests with malicious payloads, XSS prevention tests |
| **TECH-002** | TECH | No logging/monitoring strategy | **6** | Integration tests verifying error logging, monitoring setup |
| **OPS-001** | OPS | No alerting for production issues | **6** | Integration tests verifying alert configuration |

### Medium/Low-Priority Risks

| Risk ID | Category | Description | Score | QA Test Coverage |
|---------|----------|-------------|-------|------------------|
| SEC-002 | SEC | No CSRF protection on booking creation | 4 | E2E tests verifying CSRF token validation |
| SEC-003 | SEC | No rate limiting on booking API | 4 | Integration tests with rapid requests |
| PERF-001 | PERF | No performance testing or SLO definition | 4 | Lighthouse tests, basic performance assertions |
| TECH-001 | TECH | No error handling strategy defined | 4 | E2E tests for error boundaries, graceful degradation |
| DATA-001 | DATA | No data validation on Firestore writes | 4 | Integration tests for Security Rules |
| PERF-002 | PERF | No load testing for widget under traffic | 3 | Post-MVP: k6 load tests |
| OPS-002 | OPS | No backup strategy for Firestore data | 3 | Post-MVP: backup/restore tests |

---

## NFR Test Coverage Plan

| NFR Category | Requirement / Threshold | Planned Validation | Tool / Level | Evidence Artifact | Priority |
|--------------|-------------------------|-------------------|--------------|-------------------|----------|
| Security | Input validation | Form validation tests | E2E (Playwright) | test-results/security-validation/ | P0 |
| Security | XSS prevention | Malicious payload tests | E2E (Playwright) | test-results/xss-prevention/ | P0 |
| Security | CSRF protection | Token validation tests | E2E (Playwright) | test-results/csrf-protection/ | P1 |
| Performance | Page load <2s | Lighthouse scores | E2E (Playwright) | test-results/performance/ | P1 |
| Performance | API response <1s | Timing assertions | E2E (Playwright) | test-results/performance/ | P1 |
| Reliability | Error handling | Error boundary tests | E2E (Playwright) | test-results/reliability/ | P0 |
| Reliability | Graceful degradation | Firebase failure tests | E2E (Playwright) | test-results/reliability/ | P0 |
| Maintainability | Test coverage ≥80% | Coverage reports | CI (Vitest) | coverage/ | P1 |

**Missing thresholds or evidence sources:** All performance and reliability thresholds are UNKNOWN and need stakeholder clarification.

---

## Entry Criteria

**QA testing cannot begin until ALL of the following are met:**

- [ ] All requirements and assumptions agreed upon by QA, Dev, PM
- [ ] Test environments provisioned and accessible
- [ ] Test data factories ready or seed data available
- [ ] Pre-implementation blockers resolved (see Dependencies section)
- [ ] Feature deployed to test environment
- [ ] Firebase project setup complete
- [ ] Input validation rules defined

## Exit Criteria

**Testing phase is complete when ALL of the following are met:**

- [ ] All P0 tests passing
- [ ] All P1 tests passing (or failures triaged and accepted)
- [ ] No open high-priority / high-severity bugs
- [ ] Test coverage agreed as sufficient by QA Lead and Dev Lead
- [ ] Performance baselines met (if applicable)

---

## Test Coverage Plan

**IMPORTANT:** P0/P1/P2/P3 = **priority and risk level** (what to focus on if time-constrained), NOT execution timing. See "Execution Strategy" for when tests run.

### P0 (Critical)

**Criteria:** Blocks core functionality + High risk (≥6) + No workaround + Affects majority of users

| Test ID | Requirement | Test Level | Risk Link | Notes |
|---------|-------------|------------|-----------|-------|
| **P0-001** | Widget loads correctly on restaurant website | E2E | SEC-001 | Core functionality |
| **P0-002** | Party size selection (1-8) | E2E | - | Critical user flow |
| **P0-003** | Date selection (open dates only) | E2E | - | Critical user flow |
| **P0-004** | Time slot selection (15-min intervals) | E2E | - | Critical user flow |
| **P0-005** | Details form validation (name, email, custom field) | E2E | SEC-001 | Security critical |
| **P0-006** | Booking confirmation | E2E | - | Critical user flow |
| **P0-007** | Error handling - restaurant not found | E2E | TECH-001 | Critical error case |
| **P0-008** | Error handling - Firebase down | E2E | TECH-001 | Critical error case |
| **P0-009** | Widget isolation via Shadow DOM | Component | - | Architecture critical |
| **P0-010** | Widget embeddability via script tag | E2E | - | Architecture critical |
| **P0-011** | Step 1: Basics (name, slug, address) | E2E | - | Critical onboarding flow |
| **P0-012** | Step 2: Availability (hours, table groups) | E2E | - | Critical onboarding flow |
| **P0-013** | Validation on each step | E2E | - | Critical validation |
| **P0-014** | Redirect to dashboard after completion | E2E | - | Critical flow |
| **P0-015** | Onboarding required before dashboard access | E2E | - | Security critical |
| **P0-016** | Slug uniqueness validation | Unit | DATA-001 | Data integrity |
| **P0-017** | Dashboard Home - today's bookings | E2E | - | Core functionality |
| **P0-018** | Settings - Restaurant Info | E2E | - | Critical settings |
| **P0-019** | Settings - Table Groups (add, edit, delete) | E2E | - | Critical settings |
| **P0-020** | Settings - Account (change password, sign out) | E2E | - | Critical security |

**Total P0:** ~20 tests

---

### P1 (High)

**Criteria:** Important features + Medium risk (3-4) + Common workflows + Workaround exists but difficult

| Test ID | Requirement | Test Level | Risk Link | Notes |
|---------|-------------|------------|-----------|-------|
| **P1-001** | Back navigation between steps | E2E | - | Important user experience |
| **P1-002** | Loading spinner on transitions | E2E | - | User experience |
| **P1-003** | Widget customization - primary/secondary colors | Unit | - | Business logic |
| **P1-004** | Widget customization - custom field | Unit | - | Business logic |
| **P1-005** | Step 3: Branding (colors, custom field) | E2E | - | Important onboarding flow |
| **P1-006** | Skip/optional steps | E2E | - | User experience |
| **P1-007** | Dashboard Home - date picker | E2E | - | Important functionality |
| **P1-008** | Dashboard Home - empty state | E2E | - | User experience |
| **P1-009** | Dashboard Home - real-time updates | E2E | - | Important functionality |
| **P1-010** | Settings - White Label (colors, custom field) | E2E | - | Important settings |
| **P1-011** | Table group deletion preserves existing bookings | Unit | DATA-001 | Data integrity |
| **P1-012** | Real-time booking updates | Integration | - | Important functionality |
| **P1-013** | Dashboard access control | E2E | - | Security critical |
| **P1-014** | Settings access control | E2E | - | Security critical |
| **P1-015** | XSS prevention on custom fields | E2E | SEC-001 | Security critical |
| **P1-016** | CSRF protection on booking creation | E2E | SEC-002 | Security important |
| **P1-017** | Rate limiting on booking API | Integration | SEC-003 | Security important |
| **P1-018** | Firestore Security Rules - widget read | Integration | DATA-001 | Security critical |
| **P1-019** | Firestore Security Rules - owner write | Integration | DATA-001 | Security critical |
| **P1-020** | Firestore Security Rules - booking create | Integration | DATA-001 | Security critical |
| **P1-021** | Authentication flow - email/password | E2E | - | Security critical |
| **P1-022** | Error boundary catches exceptions | E2E | TECH-001 | Reliability critical |

**Total P1:** ~22 tests

---

### P2 (Medium)

**Criteria:** Secondary features + Low risk (1-2) + Edge cases + Regression prevention

| Test ID | Requirement | Test Level | Risk Link | Notes |
|---------|-------------|------------|-----------|-------|
| **P2-001** | Widget load time < 2 seconds | E2E | PERF-001 | Performance important |
| **P2-002** | Dashboard load time < 3 seconds | E2E | PERF-001 | Performance important |
| **P2-003** | Booking creation < 1 second | E2E | PERF-001 | Performance important |
| **P2-004** | Lighthouse score > 90 | E2E | PERF-001 | Performance nice-to-have |
| **P2-005** | Widget render time < 500ms | E2E | PERF-001 | Performance important |
| **P2-006** | Graceful degradation on Firebase failure | E2E | TECH-001 | Reliability critical |
| **P2-007** | Retry logic on transient failures | Integration | TECH-001 | Reliability important |

**Total P2:** ~7 tests

---

### P3 (Low)

**Criteria:** Nice-to-have + Exploratory + Performance benchmarks + Documentation validation

| Test ID | Requirement | Test Level | Notes |
|---------|-------------|------------|-------|
| **P3-001** | Offline handling | E2E | Reliability nice-to-have |
| **P3-002** | Error logging and monitoring | Integration | Reliability important |
| **P3-003** | Visual regression tests | E2E | UI consistency |

**Total P3:** ~3 tests

---

## Execution Strategy

**Philosophy:** Run everything in PRs unless there's significant infrastructure overhead. Playwright with parallelization is extremely fast (100s of tests in ~10-15 min).

### Every PR: Playwright Tests (~10-15 min)

**All functional tests** (from any priority level):

- All E2E, API, integration, unit tests using Playwright
- Parallelized across 4 shards
- Total: ~52 Playwright tests (includes P0, P1, P2, P3)

**Why run in PRs:** Fast feedback, no expensive infrastructure

### Nightly: Performance & Security Tests (~30-60 min)

**All performance and security tests** (from any priority level):

- Lighthouse performance tests
- OWASP ZAP security scans
- Total: ~10 tests (may include P0, P1, P2)

**Why defer to nightly:** Expensive infrastructure, longer-running

### Weekly: Chaos & Long-Running (~hours)

**Special infrastructure tests** (from any priority level):

- Load testing with k6
- Chaos testing (Firebase failures)
- Endurance tests (4+ hours runtime)

**Why defer to weekly:** Very expensive infrastructure, very long-running, infrequent validation sufficient

---

## QA Effort Estimate

**QA test development effort only** (excludes DevOps, Backend, Data Eng, Finance work):

| Priority | Count | Effort Range | Notes |
|----------|-------|--------------|-------|
| P0 | ~20 | ~2-4 weeks | Critical paths, security, core functionality |
| P1 | ~22 | ~2-4 weeks | Important features, integration, security |
| P2 | ~7 | ~1-2 weeks | Edge cases, performance, regression |
| P3 | ~3 | ~3-5 days | Exploratory, benchmarks |
| **Total** | ~52 | **~4-8 weeks** | **1 QA engineer, full-time** |

**Assumptions:**

- Includes test design, implementation, debugging, CI integration
- Excludes ongoing maintenance (~10% effort)
- Assumes test infrastructure (factories, fixtures) ready

---

## Tooling & Access

| Tool or Service | Purpose | Access Required | Status |
|-----------------|---------|-----------------|--------|
| Playwright | E2E testing | Local installation | Ready |
| Vitest | Unit testing | Local installation | Ready |
| Firebase Emulator | Integration testing | Local installation | Ready |
| GitHub Actions | CI/CD pipeline | Repository access | Ready |

**Access requests needed (if any):**

- [ ] Firebase project access (for staging environment post-MVP)

---

## Appendix A: Code Examples & Tagging

**Playwright Tags for Selective Execution:**

```typescript
import { test, expect } from '@playwright/test';

// P0 critical test
test('@P0 @Security input validation prevents XSS', async ({ page }) => {
  await page.goto('/widget');
  await page.fill('input[name="name"]', '<script>alert("xss")</script>');
  await page.click('button[type="submit"]');
  await expect(page.locator('.error')).toBeVisible();
});

// P1 integration test
test('@P1 @Integration Firestore Security Rules prevent unauthorized writes', async ({ }) => {
  // Test security rules with Firebase Emulator
});
```

**Run specific tags:**

```bash
# Run only P0 tests
npx playwright test --grep @P0

# Run P0 + P1 tests
npx playwright test --grep "@P0|@P1"

# Run only security tests
npx playwright test --grep @Security

# Run all Playwright tests in PR (default)
npx playwright test
```

---

## Appendix B: Knowledge Base References

- **Risk Governance**: `risk-governance.md` - Risk scoring methodology
- **Test Priorities Matrix**: `test-priorities-matrix.md` - P0-P3 criteria
- **Test Levels Framework**: `test-levels-framework.md` - E2E vs API vs Unit selection
- **Test Quality**: `test-quality.md` - Definition of Done (no hard waits, <300 lines, <1.5 min)

---

**Generated by:** BMad TEA Agent
**Workflow:** `bmad-testarch-test-design`
**Version:** 4.0 (BMad v6)