---
title: 'Story 3.1b: Dashboard Navigation on Angular Material'
type: 'refactor'
created: '2026-09-30'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: be8c3b726bf241643af79ebc2283dae901e5e5f5
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Story 3.1 (PR #195) built the dashboard shell and sidebar from hand-written markup, Tailwind and ~1 kB of bespoke SCSS — a custom flex row, a custom `<ul>` nav, a CSS focus-label hack and an absolutely-positioned error popout. The owner wants the app to rely on Angular Material as much as possible.

**Approach:** Rebuild the shell and sidebar on Material 22 components with the same seven items, sign-out and DESIGN.md look. Below 768px the sidenav no longer collapses to an icon rail: it is hidden behind a menu button and slides over the content (`mode="over"`). Stacked on PR #195 as its own PR.

**Decisions (human-approved 2026-09-30):**
- Stacked PR on `story/3-1-dashboard-shell-polish-sign-out-responsive-styling`, branch `story/3-1b-material-sidenav`.
- Narrow viewports use Material's over-mode drawer with a menu button, replacing 3.1's 64px icon rail. This reverses 3.1's "no `MediaMatcher`" rule: CDK `BreakpointObserver` drives the mode.

## Boundaries & Constraints

**Always:**
- Same 7 items, order, labels, icons, paths, `data-testid`s (`nav-item-*`, `sign-out-button`, `sidebar-nav`) and sign-out behaviour as 3.1: disabled in flight, `/login` on success, visible error + focus back on the button on failure, `signingOut` always resets.
- Shell: `mat-sidenav-container` > `mat-sidenav` + `mat-sidenav-content` with `<router-outlet>`; nav: `mat-nav-list` with `<a mat-list-item>`, `matListItemIcon`, `matListItemTitle`, `[activated]` from `routerLinkActive`.
- ≥768px: `mode="side"`, always open, 240px, no menu button. <768px: `mode="over"`, closed by default; a `mat-toolbar` with a `mat-icon-button` (`aria-label="Open navigation"`, `aria-expanded`) opens it; Esc, scrim and choosing an item close it; focus returns to the menu button.
- DESIGN.md look via Material overrides fed from the `--osef-*` tokens: linen content, white sidenav, hairline divider, ink text, square (not pill) active indicator with sage tint plus the 3px sage left border. `.dark-theme` still inverts through the tokens.
- Sign-out failure is reported through `MatSnackBar`.
- Tap targets ≥48px; every component stylesheet under the 2 kB warning.

**Never:**
- No global `mat.theme` palette change (violet stays for login/onboarding); overrides are scoped to the dashboard shell.
- No `@angular/animations` / animations provider; no new npm dependency.
- No change to routes, guards, `AuthService`, or the dashboard pages.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| WIDE | Viewport ≥ 768px | Side mode, 240px, open, labels visible, no toolbar | — |
| NARROW | Viewport < 768px | Toolbar with menu button; sidenav closed; content full width | — |
| OPEN_CLOSE | Narrow, menu clicked, then item / Esc / scrim | Drawer opens over content, closes; focus back on menu button | — |
| RESIZE | Narrow with drawer open → widen | Side mode, open, toolbar gone | — |
| SIGN_OUT | Click Sign out | Disabled in flight; lands on `/login` | — |
| SIGN_OUT_FAIL | `signOut()` rejects | Snack bar error; button re-enabled and focused; no navigation | User may retry |
| ACTIVE | Item matches route | Sage-tinted square indicator + 3px sage left border | — |

</frozen-after-approval>

## Code Map

- `src/dashboard/shell/dashboard-shell.component.{ts,html,scss}` -- today a `flex h-dvh` row. Becomes the `mat-sidenav-container` owner: `BreakpointObserver.observe('(min-width: 768px)')` via `toSignal` → `isWide`; `mode`/`opened` computed from it plus a `menuOpen` signal; toolbar + menu button when narrow. SCSS holds the scoped `mat.sidenav-overrides` (`container-width: 240px`, `container-shape: 0`, `container-background-color`, `container-divider-color`, `content-background-color`, text colours) — `@use '@angular/material' as mat` works in component SCSS
- `src/dashboard/shell/dashboard-sidebar.component.{ts,html,scss}` -- keep `navItems`, `signOut()`, `signingOut`, `viewChild` focus-return (`afterNextRender`). Replace `signOutError` + inline alert with `inject(MatSnackBar).open('Unable to sign out. Please try again.', 'Dismiss')`. Drop Tailwind width/rail classes, `title`, redundant `aria-label`s and the `@media (width < 48rem)` focus-label CSS. Add an `itemSelected` output so the shell closes the drawer in over mode. SCSS: `mat.list-overrides` (`active-indicator-shape: 0`, `active-indicator-color` sage tint, label/icon colours → ink) + the `.active` 3px sage left border
- `src/dashboard/shell/*.spec.ts` -- stub `BreakpointObserver` with `{ observe: () => of({ matches, breakpoints: {} }) }` per case (jsdom has no real `matchMedia`); keep `AuthService` stub; assert snack bar via a `MatSnackBar` stub `{ open: vi.fn() }`
- `e2e/tests/dashboard-flow.spec.ts` -- the 3.1 narrow test asserts a 64px rail and hidden labels; rewrite for NARROW + OPEN_CLOSE (menu button, drawer, item closes it, sign-out from the open drawer). The wide 240px test stays
- `e2e/tests/deploy-flow.spec.ts` -- desktop only; should pass unchanged
- `node_modules/@angular/material/{sidenav/_m3-sidenav,list/_m3-list}.scss` -- source of override key names (drop the `sidenav-`/`list-` prefix)
- `src/styles.scss` -- `--osef-*` tokens and `mat.theme` -- DO NOT CHANGE

## Tasks & Acceptance

**Execution:**
- [x] `src/dashboard/shell/dashboard-shell.component.{ts,html,scss}` -- sidenav container, breakpoint-driven mode, narrow toolbar + menu button, scoped sidenav overrides
- [x] `src/dashboard/shell/dashboard-sidebar.component.{ts,html,scss}` -- `mat-nav-list` items, sign-out as a `mat-list-item` button, snack bar error, `itemSelected` output, list overrides + left border
- [x] `src/dashboard/shell/*.spec.ts` -- the full matrix at unit level
- [x] `e2e/tests/dashboard-flow.spec.ts` -- replace the rail test with NARROW + OPEN_CLOSE + narrow sign-out

**Acceptance Criteria:**
- Given any viewport, when the dashboard renders, then no custom layout CSS remains beyond Material overrides and the active left border
- Given a keyboard user on a narrow viewport, when they open the drawer, then focus moves into it, Tab stays inside until it closes, and Esc closes it
- Given the dark colour scheme class, when the dashboard renders, then sidenav, list and content colours follow the dark tokens

## Design Notes

**Why `BreakpointObserver` now.** `mat-sidenav`'s `mode` and `opened` are inputs, not CSS, so a pure `md:` class cannot switch side ↔ over; this is the Material-idiomatic way and is the reason 3.1's no-`MediaMatcher` rule is reversed.

**Tooltips disappear.** In over mode the drawer is full width with labels, so the collapsed-rail tooltips, `title` attributes and the CSS focus label have no job left.

**Scoped overrides, not a theme swap.** `mat.sidenav-overrides` / `mat.list-overrides` inside each component's `:host` emit only CSS variables, so login and onboarding keep the violet theme; moving the whole app onto DESIGN.md is a separate change.

## Verification

**Commands:**
- `npm run lint` -- expected: clean
- `npm run test:coverage` -- expected: all suites green
- `npm run build` -- expected: success, no `anyComponentStyle` warning
- `PLAYWRIGHT_TEST_BASE_URL=http://localhost:<port> npx playwright test e2e/tests/dashboard-flow.spec.ts e2e/tests/deploy-flow.spec.ts` -- expected: all green except the pre-existing `deploy-flow.spec.ts:40` sign-in failure (see `deferred-work.md`)

**Manual checks:**
- At 375px: open the drawer, Tab cycles inside it, Esc closes and focus returns to the menu button
- Force `.dark-theme` on `<html>` and confirm the sidenav, list and content invert

## Review Triage Log

| # | Source | Location | Finding | Verdict | Evidence | Route |
|---|--------|----------|---------|---------|----------|-------|
| 1 | blind, edge, verification-gap | `dashboard-shell.component.html` | Esc in wide side mode closes the sidebar permanently | high | `sidenav.mjs:225` closes on Esc unless `disableClose`; `opened()` stays true so the binding never reopens it | patch — `[disableClose]="isWide()"` + WIDE unit test |
| 2 | blind | `dashboard-shell.component.html` | Narrow toolbar scrolls off with long content | low | Toolbar is a plain child of the scrolling `mat-sidenav-content` | patch — `sticky top-0 z-10` |
| 3 | blind, edge | `dashboard-sidebar.component.ts` | Failure snack bar (no duration) stays on screen after a successful retry, over `/login` | medium | 3.1 cleared `signOutError` on retry; nothing dismisses the snack bar ref | patch — `snackBar.dismiss()` at sign-out start + spec |
| 4 | blind, edge | `dashboard-sidebar.component.ts` | Snack bar announces politely, weaker than 3.1's `role="alert"` | low | `snack-bar.mjs:87` defaults `politeness = 'polite'` | patch — `{ politeness: 'assertive' }` |
| 5 | blind | `dashboard-shell.component.html` | `<main>` lost linen/ink/min-w-0/overflow classes | false | `content-background-color`/`content-text-color` overrides supply the canvas; `mat-sidenav-content` owns scrolling | reject |
| 6 | blind | `dashboard-sidebar.component.scss` | Disabled sign-out no longer looks disabled | false | M3 list keeps `disabled-label-text-opacity: 0.38` / icon opacity; only colour was overridden | reject |
| 7 | blind | shell | Reduced-motion rule dropped for drawer animation | false | Material's animation chunk already honours `prefers-reduced-motion`; the removed rule targeted a transition that no longer exists | reject |
| 8 | blind | `dashboard-shell.component.ts` | `WIDE_QUERY` duplicates Tailwind `md` literal | low | Developer-only drift risk, no user impact today | reject |
| 9 | blind | shell | Open drawer lacks accessible name / dialog role | false | Focus moves into the `aria-label="Dashboard navigation"` landmark, which names the context | reject |
| 10 | blind | sidebar/toolbar | Brand duplicated on narrow and not a heading | low | Cosmetic; `<p>` brand pre-dates this change | reject |
| 11 | blind | specs | `setTimeout` waits, no Shift+Tab, hard-coded backdrop point | low | Tests pass reliably; Enter on an anchor fires click so keyboard selection is covered | reject |
| 12 | blind | diff | Spec file absent from diff | false | Excluded by design; spec is the claims file | reject |
| 13 | edge | `dashboard-shell.component.ts` | Narrowing with focus inside side sidebar drops focus to body | low | Needs keyboard focus in sidebar during a resize; fix adds an effect | reject |
| 14 | edge | `dashboard-shell.component.html` | Closing during the open transition loses focus restore | low | Sub-400ms window; fix adds focus bookkeeping | reject |
| 15 | edge | `dashboard-sidebar.component.html` | Ctrl/Meta-click closes the drawer without navigating | low | Rare on narrow/touch viewports; fix adds a branch | reject |
