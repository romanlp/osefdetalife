# Deferred Work

Items surfaced during code reviews that are pre-existing issues or out of scope for the current story.

## Story 1.4 — Onboarding Basics Step

- source_spec: `_bmad-output/implementation-artifacts/1-4-onboarding-basics-step.md`
  summary: Guard catch blocks have inconsistent failure behavior — isOnboardedGuard redirects to /onboarding while isNotOnboardedGuard returns true on Firestore error
  evidence: Pre-existing pattern from auth guard; both guards query Firestore identically but handle errors differently by design

- source_spec: `_bmad-output/implementation-artifacts/1-4-onboarding-basics-step.md`
  summary: No Firestore caching in guards — every navigation triggers a live query
  evidence: Pre-existing pattern from authenticated.guard.ts; no memoization layer exists

- source_spec: `_bmad-output/implementation-artifacts/1-4-onboarding-basics-step.md`
  summary: updateRestaurant / getRestaurant have no client-side ownerId check — relies entirely on Firestore rules
  evidence: AD-2 architecture design: rules enforce owner-based access; client-side check would be defense-in-depth but adds complexity

- source_spec: `_bmad-output/implementation-artifacts/1-4-onboarding-basics-step.md`
  summary: FormsModule used instead of Signal Forms — AGENTS.md prefers Signal Forms for new forms
  evidence: FormsModule is consistent with existing codebase; Signal Forms migration can be done incrementally

- source_spec: `_bmad-output/implementation-artifacts/1-4-onboarding-basics-step.md`
  summary: createdAt declared as Date in restaurantData but written as serverTimestamp() — type mismatch at runtime
  evidence: Existing pattern from Story 1.2; Restaurant type declares createdAt: Date but Firestore stores Timestamp

## Deferred from: code review of 1-4-onboarding-basics-step (2026-07-20)

- source_spec: `_bmad-output/implementation-artifacts/1-4-onboarding-basics-step.md`
  summary: Guard picks first unordered doc — no ordering guarantee on getDocs query
  evidence: AD-13 assumes one restaurant per account; if multiple exist due to a bug, guard silently picks first

- source_spec: `_bmad-output/implementation-artifacts/1-4-onboarding-basics-step.md`
  summary: @Injectable used instead of @Service for new singleton service
  evidence: @Service decorator may not be available in Angular v22; @Injectable works and is consistent

## Story 1.7 — Onboarding Completion & Deploy

- source_spec: `_bmad-output/implementation-artifacts/1-7-onboarding-completion-deploy.md`
  summary: Story 3.1 "Dashboard Layout & Sidebar" overlaps the dashboard shell built here — should reconcile (e.g. become page work + sign-out + collapse-to-icons) rather than rebuilding the shell/sidebar
  evidence: The 7-item sidebar + shell parent route were implemented in 1.7 to satisfy AC 5 / FR-41; Epic 3 scope includes dashboard layout, sign-out (bottom of sidebar per UX), and collapse-to-icons

- source_spec: `_bmad-output/implementation-artifacts/1-7-onboarding-completion-deploy.md`
  summary: Prod `widgetBundleUrl` not verified against the real hosting domain — set to story default `https://firebase-crackling-fire-4704.web.app/widget/booking-widget.mjs`
  evidence: Firebase CLI not authenticated during the 1.7 session; confirm with `firebase hosting:sites` / Firebase console before release

- source_spec: `_bmad-output/implementation-artifacts/1-7-onboarding-completion-deploy.md`
  summary: Dev `widgetBundleUrl` points at `localhost:4200` while the Angular dev server runs on 4210 — embed snippet host only matters for real copy-paste during local dev (e2e/unit assert substring only)
  evidence: `angular.json` serve.development.port = 4210; demo.html uses a same-origin relative path so it is unaffected

- source_spec: `_bmad-output/implementation-artifacts/1-7-onboarding-completion-deploy.md`
  summary: `ng build`/`ng serve` now require `dist/widget` to exist (new assets input) — `npm run build` chains `build:widget` first; a clean-clone `ng serve` needs one `npm run build:widget`
  evidence: angular.json assets entry copies `dist/widget/**` → `/widget`

## Public Booking Page pivot review (2026-08-15)

- source_spec: `_bmad-output/implementation-artifacts/spec-pivot-public-booking-docs.md`
  summary: AD-14 security model as approved cannot be implemented exactly as written — Firestore Security Rules cannot validate which fields a query filters by, so "rules must validate that both fields are present in the query" is not enforceable as stated
  evidence: RESOLVED 2026-08-16 — AD-14 reworked to a public projection subcollection `bookings-public/{bookingId}` holding only non-PII fields (date, time, partySize, status). Full bookings stay owner-only; PII never lives on the readable document, so no query-filter validation is needed. firestore.rules + rules spec + ARCHITECTURE-SPINE AD-14 + PRD FR-47/51/52 + epics.md updated. Residual risks: cross-restaurant enumeration limited to availability metadata (date/time/partySize), and client must write both documents in one batch.

- source_spec: `_bmad-output/planning-artifacts/briefs/brief-osefdetalife-2026-07-12/brief.md`
  summary: Product brief still defines the embeddable widget model and is cited as an Architecture source; not updated by the pivot
  evidence: Out of approved scope (proposal 1–19 covers PRD/Architecture/UX DESIGN+EXPERIENCE/epics/sprint-status only).

- source_spec: `_bmad-output/planning-artifacts/prds/prd-osefdetalife-2026-07-12/prd.html` and `_bmad-output/planning-artifacts/architecture/architecture-osefdetalife-2026-07-12/architecture.html`
  summary: prd.html (FR-11 "Demo Page" :561, SM-1 widget load :716, SM-4 "embed widget" :719) and architecture.html (AD-1 script-tag embed rule :388, Shadow DOM rule :420-425, Web Components/Vite stack :574-576, `widget/` structural seed :584-588, widget diagram/capability map :645/:662/:681/:686) still describe the pre-pivot widget model beside the updated docs
  evidence: Generated HTML artifacts (rendered copies of prd.md / ARCHITECTURE-SPINE.md); not in pivot scope.

- source_spec: `_bmad-output/planning-artifacts/implementation-readiness-report-2026-07-14.md`
  summary: Report still gates Epic 2 on widget-era FRs / AD-1 / Story 2.1-2.6
  evidence: Pre-existing report; not in pivot scope.

- source_spec: `_bmad-output/planning-artifacts/ux-designs/ux-osefdetalife-2026-07-14/mockups/key-widget-landing.html` (and key-widget-party-size.html, directions-4.html)
  summary: UX mockup HTML files still render the 375px widget frame
  evidence: Visual mockup artifacts; regeneration is a design task outside the docs-only pivot.

- source_spec: `_bmad-output/planning-artifacts/epics.md`
  summary: No standalone FR for QR generation/scannability; in-app preview is covered redundantly by FR-11, FR-41, FR-43
  evidence: Proposal scope ended at the FR-41/42/43 rework; a standalone QR FR is a post-pivot enhancement.

- source_spec: `_bmad-output/planning-artifacts/epics.md` (NFR-8) / `prd.md` (SM-4)
  summary: Metrics count booking-link sharing, not diner landings on the public page; no acquisition metric for the booking page
  evidence: Proposal 3 approved "5 restaurants share booking link" as the metric; landing-rate is a post-pivot addition.

- source_spec: `_bmad-output/implementation-artifacts/sprint-status.yaml`
  summary: Epic 1 retro action items (epic-1-retro-item-1-verify-prod-widget-bundle-url, epic-1-retro-item-2-fix-dev-widget-port) reference widgetBundleUrl — obsolete under the pivot
  evidence: sprint-status.yaml is verify-only in this spec; retro items are historical records.
