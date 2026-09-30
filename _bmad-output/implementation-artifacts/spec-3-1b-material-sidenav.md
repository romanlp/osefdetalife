---
title: 'Story 3.1b: Dashboard Navigation on Angular Material'
type: 'refactor'
created: '2026-09-30'
status: 'ready-for-dev'
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
- [ ] `src/dashboard/shell/dashboard-shell.component.{ts,html,scss}` -- sidenav container, breakpoint-driven mode, narrow toolbar + menu button, scoped sidenav overrides
- [ ] `src/dashboard/shell/dashboard-sidebar.component.{ts,html,scss}` -- `mat-nav-list` items, sign-out as a `mat-list-item` button, snack bar error, `itemSelected` output, list overrides + left border
- [ ] `src/dashboard/shell/*.spec.ts` -- the full matrix at unit level
- [ ] `e2e/tests/dashboard-flow.spec.ts` -- replace the rail test with NARROW + OPEN_CLOSE + narrow sign-out

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
