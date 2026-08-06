---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-generation-mode', 'step-03-test-strategy', 'step-04-generate-tests', 'step-04c-aggregate', 'step-05-validate-and-complete']
lastStep: 'step-05-validate-and-complete'
lastSaved: '2026-08-04'
storyId: '1.7'
storyKey: '1-7-onboarding-completion-deploy'
storyFile: '_bmad-output/implementation-artifacts/1-7-onboarding-completion-deploy.md'
atddChecklistPath: '_bmad-output/test-artifacts/atdd-checklist-1-7-onboarding-completion-deploy.md'
generatedTestFiles:
  [
    'e2e/tests/deploy-flow.spec.ts',
    'src/dashboard/pages/deploy/deploy-page.component.spec.ts',
    'src/dashboard/shell/dashboard-sidebar.component.spec.ts',
    'src/dashboard/shell/dashboard-shell.component.spec.ts',
  ]
---

# ATDD Checklist: Story 1.7 — Onboarding Completion & Deploy

## TDD Red Phase (Current)

✅ Red-phase test scaffolds generated

- E2E Tests: 5 tests
- Component Tests: 22 tests (deploy-page 12, sidebar 8, shell 2)

> Note: matching the 1-4/1-5/1-6 pattern, scaffolds are written as **active tests**
> (no `test.skip()`). They are RED because the components do not exist yet
> (`DeployPageComponent`, `DashboardSidebarComponent`, `DashboardShellComponent`).

## Acceptance Criteria Coverage

| AC | Description | E2E | Component |
|----|-------------|-----|-----------|
| 1 | Completion redirects to Deploy page; dashboard shows sidebar; embed code shows slug | ✅ | ✅ |
| 2 | Embed code has `<script>` (widget bundle) + `<booking-widget restaurant="{slug}">` | ✅ | ✅ |
| 3 | Copy button → clipboard + "Copied!"; failure → error, not "Copied!" | ✅ | ✅ |
| 4 | Demo link new tab (`_blank` + `noopener`) with `?slug=`; page renders widget | ✅ | ✅ |
| 5 | Onboarded sign-in lands on dashboard; sidebar shows all 7 items; active state exact | ✅ | ✅ |

## Next Steps (Task-by-Task Activation)

During implementation of each task in the story file:

1. Create the component/service/route under test (the spec currently cannot compile — this is the RED signal)
2. Run unit tests: `npm test -- --watch=false` (or `npx ng test`); run e2e: `npx playwright test e2e/tests/deploy-flow.spec.ts`
3. Verify each activated test fails first (still RED), then passes after implementation (green phase)
4. If any tests still fail unexpectedly:
   - Either fix implementation (feature bug)
   - Or fix the test (test bug) — e.g. adjust `navItems` path values or the active-state assertions if the sidebar design differs
5. Commit passing tests

## Implementation Guidance

**Components to implement:**
- `src/dashboard/pages/deploy/deploy-page.component.{ts,html,scss}` — loads restaurant via `AuthService.user()` + `OnboardingService.getRestaurantByOwner(uid)`; exposes `restaurant`, `loading`, `embedSnippet`, `copied`, `demoUrl` signals and a `copy()` method; template testids: `embed-code`, `copy-button`, `copied-message` (`role="status"`), `demo-link`
- `src/dashboard/shell/dashboard-sidebar.component.{ts,html,scss}` — exposes `navItems` (7 items, labels Bookings, Info, Hours, Tables, Branding, Deploy, Account); Deploy path `/dashboard/deploy`, others home; `sidebar-nav` + `nav-item-{kebab}` testids; `routerLinkActive` with `[routerLinkActiveOptions]="{ exact: true }"`
- `src/dashboard/shell/dashboard-shell.component.{ts,html,scss}` — sidebar + `<router-outlet>`

**Routes to add:**
- `src/dashboard/dashboard.routes.ts` — shell parent route with children `''` (existing `HomePageComponent`) and `deploy` (lazy `loadComponent`)

**Navigation to update (Task 1.6):**
- `src/app/onboarding/branding-page/branding-page.component.ts` — both `router.navigate(['/dashboard'])` calls (Complete ~line 129, Skip ~line 155) → `['/dashboard/deploy']`

**Deploy page service/fixture contract:**
- `embedSnippet` = `<script src="{widgetBundleUrl}" type="module"></script>` + `<booking-widget restaurant="{slug}"></booking-widget>`
- `demoUrl` = origin + `/assets/demo.html?slug={slug}`
- `copy()`: `navigator.clipboard.writeText(embedSnippet())`; success → `copied=true`, auto-hide after ~2s; failure → error state, `copied` stays false

**Demo page + widget bundle (Task 3):**
- `src/assets/demo.html` (served at `/assets/demo.html`), loads `/widget/booking-widget.mjs`, renders `<booking-widget restaurant="?slug">`
- Widget bundle copied into hosting output under `/widget/`; `widgetBundleUrl` in `src/environments/environment*.ts`

**Existing E2E to keep green:**
- `e2e/tests/widget-embed.spec.ts` (bundle embeddability must not regress)
- `e2e/tests/onboarding-branding.spec.ts` (its redirect assertions use `/dashboard/` regex — still matches `/dashboard/deploy`, but re-verify)

**Fixture note (Task 5.1):**
- `e2e/fixtures/onboarding.fixture.ts` already provides `onboardedUser` (auth user + completed restaurant, slug `completed-{uid}`) — the new `deploy-flow.spec.ts` reads the real slug via `getDoc(onboardedUser.restaurantRef)`. No fixture change strictly required; a convenience `deployPage`/`dashboardPage` fixture may be added during dev.

## Generated Test Inventory

### Component — `src/dashboard/pages/deploy/deploy-page.component.spec.ts` (12)

- [P0] loads the restaurant for the current user
- [P0] renders the restaurant slug inside the embed code block
- [P0] includes a `<script>` tag pointing to the widget bundle
- [P0] includes a `<booking-widget restaurant="{slug}">` element
- [P0] exposes a loading state that resolves after fetch
- [P1] surfaces an error when the restaurant lookup fails
- [P0] writes the full snippet to the clipboard
- [P0] shows the "Copied!" confirmation after a successful copy
- [P1] auto-hides the "Copied!" confirmation after ~2 seconds
- [P1] shows an error and NOT "Copied!" when the clipboard write fails
- [P0] exposes a demo URL carrying the restaurant slug
- [P0] renders a demo link that opens in a new tab

### Component — `src/dashboard/shell/dashboard-sidebar.component.spec.ts` (8)

- [P0] defines exactly 7 nav items in the required order
- [P0] routes the Deploy item to /dashboard/deploy
- [P0] renders one nav anchor per item
- [P0] renders the seven nav item anchors with expected test ids
- [P1] navigates to /dashboard/deploy when the Deploy item is clicked
- [P1] navigates to the home placeholder when a non-Deploy item is clicked
- [P1] does not mark Deploy active on the /dashboard route
- [P1] marks only Deploy active on the /dashboard/deploy route

### Component — `src/dashboard/shell/dashboard-shell.component.spec.ts` (2)

- [P0] renders the dashboard sidebar
- [P0] renders a router outlet for child routes

### E2E — `e2e/tests/deploy-flow.spec.ts` (5)

- [P0] onboarded owner signs in and lands on the dashboard with all 7 sidebar items
- [P0] Deploy page shows embed code with the restaurant slug and widget bundle
- [P0] clicking the copy button shows the "Copied!" confirmation
- [P0] demo link opens in a new tab and carries the restaurant slug
- [P1] demo page renders a booking-widget element for the restaurant slug
