---
title: 'Story 3.1: Dashboard Shell Polish — Sign Out, Responsive, Styling'
type: 'feature'
created: '2026-09-29'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: 4a05efe31126ed0e1e6529ba5b1f16afcf71827e
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The 1.7 shell is functional but not usable. `AuthService.signOut()` (`auth.service.ts:56`) is wired to no UI, so an owner cannot end a session. The sidebar is a fixed `width: 240px; flex-shrink: 0` host with no narrow-viewport behaviour. Its colours predate DESIGN.md — grey `--bg-color: #e8e8e8` and `rgba(128,128,128,0.2)` instead of linen `#F5F0EB` and hairline `#E5E0DB` — and it still says "Deploy" after the 2026-08-12 pivot.

**Approach:** Polish in place, do not rebuild. Add a sign-out control at the sidebar foot; collapse the sidebar to a 64px icon rail below 768px with every item still named; move shell colours onto DESIGN.md tokens; rename Deploy to Booking Link.

**Decisions (human-approved 2026-09-29):** one cohesive PR — all four deliverables edit the same two components and the styling pass restructures the markup the other two add. The six non-Booking-Link items keep their `/dashboard` placeholder links, and both the "link to the 3.2–3.7 routes" and "active state updates to the current section" criteria defer to those stories (the second is entailed by the first: six items sharing one route all legitimately read as active there). Krub stays and DESIGN.md's "Inter" criterion is an accepted deviation, repeating the call settled in `2-1-public-booking-page-foundation-landing.md:103`.

**Decisions (human-approved 2026-09-30):**
- **DESIGN.md pass covers the shell and both pages.** `home-page` and `deploy-page` adopt the same linen canvas, surface and hairline tokens as the shell, so the dashboard reads as one surface. Colour and border classes only; copy and structure unchanged.
- **The route renames with the label.** The Booking Link page lives at `/dashboard/booking-link`; `/dashboard/deploy` redirects there so existing deep links keep working. The branding-page Skip/Complete navigation and the e2e flow follow the new path.
- **No manual collapse toggle.** The sidebar collapses automatically below 768px only.

## Boundaries & Constraints

**Always:**
- Shell shape preserved: flex row + `router-outlet`; exactly 7 sidebar items in order Bookings, Info, Hours, Tables, Branding, Booking Link, Account.
- Sign out is a real `<button>` at the sidebar foot (EXPERIENCE.md:88), disabled in flight, awaiting `AuthService.signOut()` then `router.navigate(['/login'])` — the guards are `CanActivateFn`s, not reactive to the auth signal, so the explicit navigation is mandatory.
- Under 768px the sidebar is 64px, labels hidden, icons visible; 768px+ is 240px with labels. Mobile-first CSS (Tailwind `md:`), no `MediaMatcher` or resize listener.
- Every item carries an accessible name at both widths; the active item keeps its 3px sage left border at both.
- Shell colours come from DESIGN.md tokens (linen `#F5F0EB`, surface `#FFFFFF`, hairline `#E5E0DB`, ink `#1A1A1A`, sage `#8FA67A`); `.dark-theme` keeps inverting them.
- Stylesheets stay under the 2 kB `anyComponentStyle` warning: layout/spacing/typography as Tailwind utilities, SCSS only for `:host` and token fallbacks.
- Specs keep `[P0]`/`[P1]` and stub services with `{ provide: X, useValue: stub }`.

**Never:**
- No new routes or placeholder pages for 3.2–3.7 (the booking-link path and its redirect are the only route changes); no new dependency; no animations provider.
- No global font import, no `styles.scss` font or Material-theme change.
- No changes to `firestore.rules`, `app.routes.ts`, or the auth guards.
- No change to the Booking Link page's content — copy, structure and behaviour stay; only colour/border classes move to tokens.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| SIGN_OUT | Owner clicks Sign Out | Button disabled in flight; session ends; router lands on `/login` | — |
| SIGN_OUT_FAIL | `signOut()` rejects | Button re-enabled; `role="alert"`; no navigation | User may retry |
| WIDE | Viewport ≥ 768px | Sidebar 240px, labels and wordmark visible | — |
| NARROW | Viewport < 768px | Sidebar 64px, labels hidden, icons visible, each item still named | — |
| ACTIVE | Item matches current route | 3px sage left border + tint, at both widths | — |
| OLD_LINK | Owner opens `/dashboard/deploy` | Lands on `/dashboard/booking-link`; Booking Link item active | — |

</frozen-after-approval>

## Code Map

- `src/dashboard/shell/dashboard-sidebar.component.ts` -- `NavItem` (5-9), the 7-item array (18-26), rename `Deploy` (24) and swap its embed-era `code` icon for `link`. No DI today; sign-out adds `inject(AuthService)` + `inject(Router)`
- `src/dashboard/shell/dashboard-sidebar.component.html` -- add sign-out after the `nav-list`; the derived test id (8) must be slug-safe or "Booking Link" yields `nav-item-booking link`; add `aria-label` per item
- `src/dashboard/shell/dashboard-sidebar.component.scss` -- 56 bespoke lines; active colour `#8fa67a` (53) becomes a token; layout moves to Tailwind
- `src/dashboard/shell/dashboard-shell.component.{html,scss}` -- `100vh` flex row; `.dashboard-main` (11-16) takes the linen token
- `src/dashboard/shell/dashboard-shell.component.spec.ts` -- no `AuthService` provider, so adding DI to the sidebar throws `NullInjectorError`; stub before the sidebar changes
- `src/dashboard/shell/dashboard-sidebar.component.spec.ts` -- `EXPECTED_LABELS` (6-14) and `EXPECTED_TEST_IDS` (16-24) carry `Deploy`/`nav-item-deploy`; 99-107 assert all six `/dashboard` items active, which stays true
- `src/styles.scss` -- Tailwind import (2), Mat theme (23-29), `--bg-color`/`--color` (8-19); add the token block, change nothing else
- `src/dashboard/dashboard.routes.ts` (16-22) -- `path: 'deploy'` becomes `'booking-link'`; add `{ path: 'deploy', redirectTo: 'booking-link', pathMatch: 'full' }`
- `src/app/onboarding/branding-page/branding-page.component.ts:129,155` (+ spec 244-298) / `e2e/tests/deploy-flow.spec.ts:11,32-35` -- the only other `/dashboard/deploy` and `nav-item-deploy` references; move to the new path and id
- `src/dashboard/pages/home/home-page.component.{html,scss}` -- `.dashboard-home { padding: 24px }` wrapper; move to Tailwind `p-6` + ink text token, delete the class
- `src/dashboard/pages/deploy/deploy-page.component.html` -- `bg-[#FAF7F2]` (1), `border-gray-200` (55), `bg-gray-100`/`bg-white` surfaces (28, 55) → token classes; keep `min-h-screen`→`min-h-full` so it fills the shell, not the viewport. Copy, structure, `.ts` and spec DO NOT CHANGE
- `e2e/tests/dashboard-flow.spec.ts` -- add signed-in sign-out + narrow-viewport coverage; `playwright.config.ts:54` defaults to `devices['Desktop Chrome']` (1280×720)
- `auth.service.ts:56` / `authenticated.guard.ts` / `deploy-page.component.ts` -- DO NOT CHANGE (context)

## Tasks & Acceptance

**Execution:**
- [x] `src/styles.scss` -- add the DESIGN.md light + dark token block beside the existing custom properties -- one palette for shell and pages
- [x] `src/dashboard/shell/dashboard-sidebar.component.ts` -- rename the Deploy item; add the two `inject()`s and an async `signOut()` awaiting the service then navigating to `/login`
- [x] `src/dashboard/shell/dashboard-sidebar.component.html` -- sign-out button at the foot (`data-testid="sign-out-button"`), slug-safe nav test ids, `aria-label` per item
- [x] `src/dashboard/shell/dashboard-sidebar.component.scss` -- rebuild as `:host` + tokens; layout as Tailwind (`w-16 md:w-60`, `hidden md:inline` labels), nav links and sign-out at least 48px tall (epic-3 tap-target rule) -- the 2 kB budget
- [x] `src/dashboard/shell/dashboard-shell.component.{html,scss}` -- `.dashboard-main` takes the linen token; keep the `100vh` flex row
- [x] `src/dashboard/dashboard.routes.ts` -- rename the child path to `booking-link`, add the `deploy` redirect; sidebar item path follows
- [x] `src/app/onboarding/branding-page/branding-page.component.{ts,spec.ts}` -- Skip/Complete navigate to `/dashboard/booking-link`
- [x] `src/dashboard/pages/home/*` / `src/dashboard/pages/deploy/deploy-page.component.html` -- colour and border classes onto the tokens; no copy or structure change
- [x] `src/dashboard/shell/*.spec.ts` -- the full matrix incl. OLD_LINK; the shell spec needs an `AuthService` stub first
- [x] `e2e/tests/dashboard-flow.spec.ts` -- signed-in sign-out spec, plus a narrow-viewport spec via `test.use({ viewport: { width: 375, height: 812 } })`
- [x] `e2e/tests/deploy-flow.spec.ts` / `dashboard-sidebar.component.spec.ts` -- new label, `nav-item-booking-link` id and `/dashboard/booking-link` URL

**Acceptance Criteria:**
- Given the sidebar, when the owner clicks Sign Out, then the Firebase session ends and the router lands on the login page
- Given the sidebar, when `signOut()` rejects, then the button re-enables, an alert is announced, and no navigation happens
- Given a viewport under 768px, when the sidebar loads, then it is 64px wide, icons only, and the main area fills the remaining width
- Given a viewport of 768px or wider, when the sidebar loads, then it is 240px wide with visible labels
- Given a collapsed sidebar, when an item is inspected, then it exposes an accessible name and shows a tooltip
- Given any viewport, when the dashboard or Booking Link page loads, then both render on the same warm linen canvas with the hairline sidebar border and the sage active border
- Given a completed onboarding branding step, when the owner clicks Skip or Complete, then they land on `/dashboard/booking-link`
- Given the dark colour scheme, when the dashboard loads, then the shell tokens invert as they do today

## Implementation Notes

- Tokens live as `--osef-*` custom properties in `styles.scss` (light in `:root`, dark under `.dark-theme`) and are exposed to Tailwind via `@theme inline` as `linen`, `surface`, `hairline`, `ink`, `ink-muted`, `sage`, `error`. Values match DESIGN.md exactly.
- Sidebar width is a host class (`w-16 md:w-60`); the sidebar spec stubs `OnboardingService` because the booking-link route lazy-loads the deploy page in the router test.
- The collapsed rail keeps the sign-out error `sr-only` below `md` — 64px cannot fit the sentence; `role="alert"` still announces it.
- Deploy page status text (red/green) stays on Tailwind colours: `--osef-error` on linen falls short of 4.5:1.
- Pre-existing, not caused by 3.1: `ThemingService` is never injected, so `.dark-theme` is never applied at runtime (tokens invert correctly when the class is forced). A full reload of any `/dashboard/*` child lands on `/dashboard` (guard sees no user yet), so OLD_LINK is covered by the unit test rather than e2e. `deploy-flow.spec.ts:40` fails at sign-in on a fresh emulator run, same as the 2026-09-25 junit result.
- Verification run 2026-09-30: lint clean; 356/356 unit tests; build has no `anyComponentStyle` warning (initial-bundle budget warning pre-existing); e2e 9/10 with the pre-existing failure above, app served on port 4399 because 4210 is held by a local ssh tunnel.

## Spec Change Log

## Review Triage Log

Pass 1 (2026-09-30) — layers: blind-hunter, edge-case-hunter, verification-gap.

| # | Layer | Finding | Verdict | Evidence | Route |
|---|-------|---------|---------|----------|-------|
| 1 | blind + edge | `signOut()` leaves the button disabled if `router.navigate` rejects | low | `navigate` sits outside the `try`; a failed `/login` chunk load rejects it, `signingOut` never resets and the click handler throws unhandled. Fix is a direct `try/finally` | patch |
| 2 | edge | `navigate` resolves `false` after sign-out, leaving a signed-out owner on the dashboard | false | `isNotAuthenticatedGuard` (`authenticated.guard.ts:26-35`) returns `true` for a null user, which is what `firebaseSignOut` leaves; the e2e sign-out spec lands on `/login` | reject |
| 3 | blind + edge + verif-gap | Sign-out error is `max-md:sr-only`, so sighted users at <768px see no failure | medium | `dashboard-sidebar.component.html` alert carries `max-md:sr-only`; below `md` a failure only re-enables the button | patch |
| 4 | blind | Six placeholder items all carry `aria-current="page"` on `/dashboard` | low | True, but the human decision in Intent accepts all six reading as active until 3.2–3.7 give them routes; `aria-current` mirrors that accepted state | reject (intent) |
| 5 | blind | Dark `--osef-error` `#e06060` on dark surface `#252320` is ~3.7:1, under 4.5:1 | low | Contrast computed 3.76:1. Values are DESIGN.md's own dark tokens and dark mode never applies at runtime (see 13) | defer |
| 6 | blind | Collapsed rail's only visual label is `title`, invisible to keyboard and touch | medium | Native `title` never shows on focus or touch; the spec's manual check requires naming "on hover and on focus" | patch |
| 7 | blind | Sidebar SCSS repeats every token hex as a fallback instead of Tailwind host utilities | low | `:host` and `.nav-link` hard-code `#ffffff`/`#1a1a1a`/`#e5e0db`/`#8fa67a` fallbacks that diverge silently if a token changes; `bg-surface text-ink border-r border-hairline` exist. Direct fix | patch |
| 8 | blind | Rename partial: `DeployPageComponent`, folder, e2e file keep `deploy`; route has no `title` | false | File names kept by the spec's Design Notes; no route in the app sets `title` (`rg "title:" src/**/*routes.ts` is empty) | reject |
| 9 | blind | No e2e for the `/dashboard/deploy` redirect | low | Real, but blocked by the pre-existing reload bounce (14); unit test covers the redirect and active state | defer (with 14) |
| 10 | blind | `100vh`/`h-screen` hides the sidebar foot behind mobile browser chrome | low | Shell `:host { height: 100vh }` plus `h-screen`; on mobile Safari the new sign-out button can sit under the toolbar. Direct swap to `dvh` | patch |
| 11 | blind + edge | E2E widths use exact `toBe` and don't null-check `boundingBox()` | low | `dashboard-flow.spec.ts` asserts `?.width).toBe(240)`; a null box yields an `undefined` mismatch. Direct fix | patch |
| 12 | edge | Emulator banner can intercept the wide sign-out click | false | The wide `[P0]` sign-out spec passed on both local runs at 1280×720 without the style tag | reject |
| 13 | blind | Mutable public `navItems` and signals (R8) | low | `navItems`, `signingOut`, `signOutError` lack `readonly`; direct fix | patch |
| 14 | blind | Sign-out-then-navigate belongs in a service (R10) | low | No present harm; 3.7's Account sign-out is the second caller and should extract it then | reject |
| 15 | blind | Focus is lost after a failed sign-out | medium | Disabling the focused button drops focus to `body`; on re-enable nothing restores it, so keyboard users lose their place | patch |
| 16 | edge (claim) | Pages changed more than "colour and border classes" | false | `min-h-screen`→`min-h-full` and `.dashboard-home`→`p-6` are both named in the Code Map; neither changes rendered layout inside the shell | reject |
| 17 | impl notes | `ThemingService` never injected, so `.dark-theme` never applies | medium | Pre-existing: no `inject(ThemingService)` anywhere in `src` | defer |
| 18 | impl notes | Full reload of `/dashboard/*` bounces to `/dashboard` | medium | Pre-existing guard race; reproduced on `/dashboard/booking-link` itself | defer |
| 19 | impl notes | `deploy-flow.spec.ts:40` fails at sign-in on a fresh emulator | medium | Pre-existing: same failure at `:20` in the 2026-09-25 junit; login and fixtures untouched by this diff | defer |

## Design Notes

**Tooltip without a dependency.** No `MatTooltip` in the repo and no animations provider, so the collapsed item's tooltip is the native `title`. `aria-label` is set at both widths, not only when collapsed, keeping the DOM stable across the breakpoint.

**Stable test ids.** Slugifying the space in `'nav-item-' + label.toLowerCase()` changes only the renamed item, leaving the six existing ids untouched and adding no `NavItem` field.

**Route renames, files do not.** Only the URL segment changes. `DeployPageComponent`, its folder and `deploy-flow.spec.ts` keep their names: owners never see them, and renaming them would double the diff without changing behaviour.

**No epic context loaded.** `epic-3-context.md` is 1,600 tokens about stories 3.2–3.7 — bookings, hours, tables, white label — none of which 3.1 touches. `context` stays empty; the design tokens and layout rules that do apply are in Boundaries above.

## Verification

**Commands:**
- `npm run lint` -- expected: clean
- `npm run test:coverage` -- expected: all suites green
- `npm run build` -- expected: success, no `anyComponentStyle` warning
- `npx playwright test e2e/tests/dashboard-flow.spec.ts` -- expected: both new specs green

**Manual checks:**
- Sign in, narrow the window under 768px, confirm the rail collapses and each icon names itself on hover and on focus
- Switch the OS colour scheme and confirm the shell canvas inverts
