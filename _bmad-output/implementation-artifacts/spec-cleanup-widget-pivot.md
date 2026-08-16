---
title: 'Cleanup Widget Pivot — Remove embeddable widget stack, update Deploy page to booking link + QR'
type: 'chore'
created: '2026-08-15'
status: 'done'
baseline_commit: 'c2e33c2a8c57cabc52bba85f5b67d34ebd976b88'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The strategic pivot from embeddable `<booking-widget>` Web Component to first-party public booking page at `/book/{slug}` was approved (2026-08-12). Planning artifacts (PRD, Architecture, Epics, UX, sprint-status) have been updated, but the codebase still contains dead widget code: `src/widget/`, `vite.config.ts`, `lit` dependency, widget build chain in `angular.json`/`package.json`, `demo.html`, and the Deploy page still shows embed code instead of booking link + QR.

**Approach:** Remove all widget-related dead code (delete files, update configs, remove `lit` dependency). Update the Deploy page (Story 1.7) from "embed code + demo page" to "booking link + QR code + in-app preview". Remove `widgetBundleUrl` from environment files. Add AD-14 Firestore rule for unauthenticated availability reads (date + partySize filter) to support the public booking page.

## Boundaries & Constraints

**Always:**
- Keep Angular 22 + Firebase single-app architecture (no Vite, no `lit`, no Shadow DOM)
- Maintain `npm run build` working without `build:widget` pre-step
- Preserve all Epic 1 stories (1-1 through 1-7) as `done` in sprint-status
- Keep AD-14 rule: unauthenticated bookings read ONLY when query filters by BOTH `date` AND `partySize`

**Ask First:**
- QR code library choice (prefer lightweight zero-dep or native Canvas API)
- Whether to keep `build/widget` output directory structure or remove entirely

**Never:**
- Do not start Epic 2 implementation (stories 2-1 through 2-5 remain `backlog`)
- Do not modify booking page components (they don't exist yet)
- Do not touch `firestore.rules` beyond adding AD-14 availability read rule
- Do not change `angular.json` budgets, test configs, or serve configs

</frozen-after-approval>

## Code Map

- `src/widget/booking-widget.ts` -- Widget Web Component (DELETE entire directory)
- `src/widget/booking-widget.spec.ts` -- Widget tests (DELETE)
- `src/widget/styles/` -- Widget styles (DELETE)
- `vite.config.ts` -- Vite config for widget build (DELETE)
- `package.json` -- Remove `lit` dep, `build:widget` script, change `build` script
- `angular.json` -- Remove `assets` entry for `build/widget` → `/widget`
- `src/environments/environment.ts` -- Remove `widgetBundleUrl` (dev)
- `src/environments/environment.prod.ts` -- Remove `widgetBundleUrl` (prod)
- `src/environments/environment.e2e.ts` -- Remove `widgetBundleUrl` (e2e)
- `src/environments/environment.dev.ts` -- Remove `widgetBundleUrl` (dev)
- `src/assets/demo.html` -- Widget demo page (DELETE)
- `src/dashboard/pages/deploy/deploy-page.component.ts` -- Deploy page logic: replace `embedSnippet`/`demoUrl` with `bookingLink`/`qrCodeDataUrl`, remove `widgetBundleUrl` import
- `src/dashboard/pages/deploy/deploy-page.component.html` -- Deploy page UI: replace embed code block with booking link input + copy button + QR code image
- `src/dashboard/pages/deploy/deploy-page.component.spec.ts` -- Update tests for new Deploy page behavior
- `firestore.rules` -- Add AD-14: `allow read: if request.query.date != null && request.query.partySize != null;` on `match /restaurants/{restaurantId}/bookings/{bookingId}`

## Tasks & Acceptance

**Execution:**
- [x] `src/widget/` -- DELETE directory and all contents -- Dead widget Web Component code
- [x] `vite.config.ts` -- DELETE file -- Vite config for widget build no longer needed
- [x] `package.json` -- EDIT: remove `lit` from dependencies, remove `build:widget` script, change `build` script to `ng build --configuration production` -- Single Angular build
- [x] `angular.json` -- EDIT: remove `assets` entry `{ "glob": "**/*", "input": "build/widget", "output": "/widget" }` -- No widget assets to copy
- [x] `src/environments/environment.ts` -- EDIT: remove `widgetBundleUrl` property -- No widget bundle URL
- [x] `src/environments/environment.prod.ts` -- EDIT: remove `widgetBundleUrl` property -- No widget bundle URL
- [x] `src/environments/environment.e2e.ts` -- EDIT: remove `widgetBundleUrl` property -- No widget bundle URL
- [x] `src/environments/environment.dev.ts` -- EDIT: remove `widgetBundleUrl` property -- No widget bundle URL
- [x] `src/assets/demo.html` -- DELETE file -- Widget demo page no longer needed
- [x] `src/dashboard/pages/deploy/deploy-page.component.ts` -- EDIT: replace `embedSnippet`/`demoUrl` computed signals with `bookingLink` (computed from `window.location.origin + '/book/' + restaurant.slug`), `qrCodeDataUrl` (generated via Canvas API), remove `widgetBundleUrl` import, update `copy()` to copy booking link -- Booking link + QR replaces embed code
- [x] `src/dashboard/pages/deploy/deploy-page.component.html` -- EDIT: replace embed code `<pre>` + copy button + demo link with booking link input + copy button + QR code `<img>` + preview button -- New Deploy page UI
- [x] `src/dashboard/pages/deploy/deploy-page.component.spec.ts` -- EDIT: update tests to expect booking link + QR instead of embed snippet + demo link -- Tests match new behavior
- [x] `firestore.rules` -- EDIT: add AD-14 availability read rule on `match /restaurants/{restaurantId}/bookings/{bookingId}`: `allow read: if request.auth == null && request.query.date != null && request.query.partySize != null;` -- Public booking page needs unauthenticated read for availability calc
- [x] `e2e/tests/widget-embed.spec.ts` -- DELETE file -- Widget e2e tests no longer needed

**Acceptance Criteria:**
- Given the project root, when I run `npm run build`, then the build succeeds without `build:widget` pre-step and produces output in `dist/` only
- Given `package.json`, when I inspect dependencies, then `lit` is not present
- Given `angular.json`, when I inspect the `assets` array, then no entry references `build/widget` or `/widget`
- Given `src/environments/*.ts`, when I inspect them, then no `widgetBundleUrl` property exists
- Given `src/assets/`, when I list files, then `demo.html` is not present
- Given `src/widget/`, when I check, then the directory does not exist
- Given the Deploy page at `/deploy`, when I load it as an authenticated owner, then I see: booking link input with copy button, QR code image, and preview button (no embed code, no demo link)
- Given the Deploy page, when I click "Copy", then the booking link is copied to clipboard and confirmation shows
- Given `firestore.rules`, when I inspect the bookings match, then an unauthenticated read is allowed only when both `date` and `partySize` query constraints are present
- Given the project, when I run `npm test`, then all unit tests pass (including updated Deploy page tests)
- Given the project, when I run `npm run lint`, then no lint errors

## Design Notes

QR code generation: Use native Canvas API (no new dependency). The booking link is `https://<host>/book/<slug>`. QR code can be generated via a small utility function using `canvas.toDataURL()` with a QR encoding library — but to avoid new deps, either:
1. Use a tiny QR code generator (e.g., `qrcode-generator` ~2KB) added as dependency, OR
2. Generate QR via external service URL (e.g., `https://api.qrserver.com/v1/create-qr-code/?data=<url>&size=200x200`) — simpler, no dep
Prefer option 2 for zero-dep. Update if human prefers option 1.

Preview button: Should open the public booking page in a new tab (`/book/{slug}`) — same as the in-app preview requirement (FR-11, FR-43).

## Verification

**Commands:**
- `npm run build` -- expected: succeeds, outputs to `dist/` only, no widget assets
- `npm test` -- expected: all unit tests pass
- `npm run lint` -- expected: no errors
- `grep -r "lit" package.json` -- expected: no matches
- `grep -r "widgetBundleUrl" src/environments/` -- expected: no matches
- `test -d src/widget && echo "EXISTS" || echo "REMOVED"` -- expected: REMOVED
- `test -f src/assets/demo.html && echo "EXISTS" || echo "REMOVED"` -- expected: REMOVED
- `grep -r "build:widget" package.json` -- expected: no matches
- `grep -r "build/widget" angular.json` -- expected: no matches

**Manual checks (if no CLI):**
- Open Deploy page in browser as authenticated owner — verify booking link, QR code, preview button render correctly
- Copy booking link — verify clipboard content matches `https://<host>/book/<slug>`