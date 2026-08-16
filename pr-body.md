## Summary

Implements the code cleanup portion of the approved strategic pivot (2026-08-12) from embeddable `<booking-widget>` Web Component to first-party public booking page at `/book/{slug}`.

Planning artifacts (PRD, Architecture, UX, epics.md, sprint-status) were already updated in a previous commit. This PR removes the dead widget code and reworks the Deploy page.

## Changes

### Deleted
- `src/widget/` (entire directory: booking-widget.ts, booking-widget.spec.ts, styles/)
- `vite.config.ts`
- `src/assets/demo.html`
- `e2e/tests/widget-embed.spec.ts`

### Updated configs
- `package.json`: removed `lit` dependency, removed `build:widget` script, simplified `build` script to `ng build --configuration production`
- `angular.json`: removed widget asset entry (`build/widget` -> `/widget`)
- All 4 environment files (`environment.ts`, `.prod.ts`, `.e2e.ts`, `.dev.ts`): removed `widgetBundleUrl`
- `firestore.rules`: added AD-14 rule for unauthenticated availability reads (only when query filters by both `date` AND `partySize`)

### Reworked Deploy page (Story 1.7)
- `deploy-page.component.ts`: replaced `embedSnippet`/`demoUrl` with `bookingLink` + `qrCodeUrl` + `openPreview()`
- `deploy-page.component.html`: new UI — booking link input with copy button, QR code image, preview button
- `deploy-page.component.spec.ts`: updated tests for new behavior

## Verification

- `npm run build` ✅ succeeds without widget pre-step, outputs to `dist/` only
- `npm test` ✅ 159 tests pass
- `npm run lint` on Deploy page ✅ no issues
- All grep checks pass — no residual `lit`, `widgetBundleUrl`, `build:widget`, `build/widget` references
- `src/widget/` and `src/assets/demo.html` removed

## Notes

- Epic 2 stories (2-1 through 2-5) remain `backlog` as planned — this PR only cleans up Epic 1 completion
- QR code uses zero-dep external service (`api.qrserver.com`) per spec
- AD-14 security: unauthenticated bookings read ONLY when both `date` and `partySize` query constraints present

Closes: pivot-public-booking-page cleanup