# Test Review — osefdetalife Suite-Wide

**Reviewed:** 2026-07-17 | **Mode:** Create (suitable for new codebase assessment) | **Stack:** Frontend

---

## Summary

| Metric | Value |
|--------|-------|
| E2E test files | 7 (Playwright) |
| Unit/integration test files | 10 (Vitest) |
| Security rule tests | 1 (Firestore rules) |
| Total test cases | ~120+ |
| Overall health | **Good** — fundamentals solid, key gaps in coverage and resilience |

**Verdict:** The test suite is well-structured and aligned with the architecture. Two critical gaps (navigation selector resilience, API route assertion stability) and several medium-severity issues should be addressed before sprint completion.

---

## Critical Findings

### C1 — Dashboard nav tests use `a` tag selectors instead of `nav` landmark
**Files:** `dashboard-nav.spec.ts:20,29,38,47,56`
**Risk:** P0 — High likelihood of flakiness if link markup changes
**Evidence:** All navigation tests select `a` tags directly. If the sidebar adds icons, badges, or restructures the `a` content, every assertion breaks.
**Fix:** Use `nav` landmark as the parent scope: `page.getByRole('link', { name: 'Dashboard' }).first()` or `page.locator('nav').getByRole('link', { name: ... })`.

### C2 — Auth flow test checks for `/` redirect but URL assertion is fragile
**Files:** `auth-flow.spec.ts:24`
**Risk:** P0 — URL assertion `toContain('/')` matches any URL, providing false confidence
**Evidence:** `await expect(page).toContainURL('/');` — this passes for any URL containing `/` (i.e., every URL). Should assert the actual dashboard route.
**Fix:** `await expect(page).toHaveURL(/\/dashboard/);` or the exact expected path.

---

## High Findings

### H1 — Widget embed test depends on exact `text=` selector for booking widget heading
**Files:** `widget-embed.spec.ts:14`
**Risk:** P1 — Widget template changes (wording, heading level) will silently break this test
**Evidence:** `await expect(iframe.locator('text=Osez Féter !')).toBeVisible();` — string literal match with no semantic anchor.
**Fix:** Use `getByRole('heading', { name: 'Osez Féter !' })` or a data-testid on the widget root.

### H2 — `dashboard-flow.spec.ts` uses `page.route` to mock auth but never verifies the mock was applied
**Files:** `dashboard-flow.spec.ts:12-18`
**Risk:** P1 — If route intercept fails silently, the test passes against real Firebase (flaky in CI)
**Fix:** Add a request assertion or use `expect` on route handler invocation count before proceeding.

### H3 — No test for Firestore security rules denying unauthenticated write to bookings
**Files:** `firestore.rules.spec.ts` — only positive (allowed) paths tested for bookings
**Risk:** P1 — Security regression: a rules change could open booking writes to unauthenticated users with no test catching it
**Fix:** Add denial assertion: `await expect(firestore.addDoc(bookingRef, validBooking)).rejects.toThrow('Missing or insufficient permissions');`

### H4 — `time.util.spec.ts` and `time.spec.ts` overlap in coverage
**Files:** `src/shared/time.spec.ts`, `src/shared/time.util.spec.ts`
**Risk:** P1 — Redundant coverage with slightly different test cases; maintenance burden
**Fix:** Consolidate into one test file per module, or clearly differentiate scope (unit vs. integration).

---

## Medium Findings

### M1 — `auth-login.spec.ts` uses hardcoded `test2@test.com` without fixture abstraction
**Files:** `auth-login.spec.ts:12`
**Risk:** P2 — Test account credentials scattered; if password changes in CI secrets, all tests break simultaneously
**Fix:** Use the existing `authSession` fixture or a shared `TEST_CREDENTIALS` constant.

### M2 — `restaurant-settings.spec.ts` clicks "Save" but doesn't verify the save actually persisted
**Files:** `restaurant-settings.spec.ts:15-18`
**Risk:** P2 — Test verifies button click and optional success message, but not that the data round-tripped through Firebase
**Fix:** Reload the page and assert the field still contains the typed value.

### M3 — `booking-management.spec.ts` navigates to bookings but doesn't test CRUD lifecycle
**Files:** `booking-management.spec.ts:9-13`
**Risk:** P2 — Only verifies the page loads and has "Bookings" heading; no create/read/update/cancel flow
**Fix:** Add a test that creates a booking, verifies it appears in the list, then cancels it.

### M4 — `config.service.spec.ts` mocks `import.meta.env` with `vi.stubEnv` but doesn't restore in all cases
**Files:** `config.service.spec.ts`
**Risk:** P2 — `vi.stubEnv` state can leak between test files if `afterAll` cleanup is missing
**Fix:** Ensure `afterAll(() => vi.unstubAllEnvs())` or use `vi.restoreAllMocks()`.

### M5 — `validation.util.spec.ts` tests only valid inputs; no invalid input edge cases
**Files:** `validation.util.spec.ts`
**Risk:** P2 — Validation functions are tested happy-path only; invalid inputs (null, undefined, empty strings, wrong types) are untested
**Fix:** Add negative test cases for each validation function.

### M6 — Firestore rules tests don't test `tables` collection edge cases
**Files:** `firestore.rules.spec.ts`
**Risk:** P2 — Tables rules allow public read and owner write, but no test for table count limits, group name validation, or cross-restaurant access denial
**Fix:** Add tests for: unauthenticated write denial, cross-restaurant read/write denial, table capacity type validation.

---

## Low Findings

### L1 — Widget embed test `page.goto` doesn't verify page load success
**Files:** `widget-embed.spec.ts:7`
**Risk:** P3 — If the server doesn't start, the test will fail with a timeout rather than a clear message
**Fix:** Add `await expect(page).toHaveURL(/localhost/);` or check for console errors.

### L2 — No `@axe-core/playwright` integration in any E2E test
**Risk:** P3 — Accessibility checks are not automated; reliance on manual checks
**Fix:** Add a single `a11y.spec.ts` that runs axe on every major page route.

### L3 — Test files don't consistently use `test.describe` blocks for logical grouping
**Risk:** P3 — Some files group all tests at the top level, making selective runs harder
**Fix:** Wrap related tests in `test.describe` with descriptive block names.

---

## Positive Observations

1. **Good separation of concerns** — Widget tests (`widget-embed.spec.ts`) correctly use `page.route` and iframe isolation, avoiding Firebase dependency
2. **Consistent `authSession` fixture pattern** — Most authenticated tests use the shared fixture (`tests/fixtures/auth-session.ts`), reducing duplication
3. **Security rules are tested** — The `firestore.rules.spec.ts` file covers the most critical paths (restaurant create, booking create, slug creation)
4. **Type ATDD tests exist** — `slug.spec.ts`, `restaurant.spec.ts`, `booking.spec.ts` validate type structures, catching schema drift early
5. **CI-aware configuration** — `playwright.config.ts` uses `webServer` auto-start, `repeat-each: process.env.CI ? 3 : 1` for flake detection, and `workers: process.env.CI ? 2 : undefined`

---

## Recommendations (Priority Order)

| # | Action | Severity | Effort |
|---|--------|----------|--------|
| 1 | Fix C2 (`toContainURL('/')` → exact path) | Critical | 5 min |
| 2 | Add H3 (booking denial test in firestore rules) | High | 15 min |
| 3 | Fix C1 (nav selector resilience) | Critical | 10 min |
| 4 | Fix H1 (widget heading selector) | High | 5 min |
| 5 | Add H2 (mock verification in dashboard-flow) | High | 10 min |
| 6 | Fix M5 (validation negative cases) | Medium | 20 min |
| 7 | Fix M2 (settings save persistence check) | Medium | 10 min |
| 8 | Add M3 (booking CRUD lifecycle test) | Medium | 30 min |
| 9 | Add L2 (axe-core accessibility test) | Low | 30 min |
| 10 | Consolidate H4 (time test overlap) | Medium | 10 min |

---

*Generated by bmad-testarch-test-review — Create mode, suite-wide scope, frontend stack*
