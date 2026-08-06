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
