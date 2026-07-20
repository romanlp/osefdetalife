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
