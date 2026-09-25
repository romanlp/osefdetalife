---
title: 'Story 2.5: Navigation, Loading & Error Handling'
type: 'feature'
created: '2026-09-21'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: 6183f92868bbf04a3ae3e41b9f50b4c3a0218254
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Stories 2.1–2.4 deliver the whole six-step funnel, but the flow shell still misses Story 2.5's experience contract. Nothing marks a step change as in progress — `flow.step.set()` is synchronous and only the time step owns a spinner ("Checking availability…") — so the epic's "spinner during the transition" AC has no implementation. The page-level Firestore failure renders as two disconnected fragments (`booking-page.component.html:16-17`: "Something went wrong." + "Please try again.") instead of the epic's single sentence. Typed details are destroyed by back-then-forward because the `FormGroup` is component-local (`details-step.component.ts:38-42` — the deferral 2.4's review filed against 2-5). And `BookingFlowService` guards only `confirm()`, so an out-of-order `chooseDate`/`chooseSlot` can jump the flow past its own steps (deferred from the 2.2/2.3 reviews).

**Approach:** Harden the shell, not the steps. A page-owned transition-busy state (spinner + `aria-busy` on the step host) driven from the flow service; one exact-sentence error surface per failure with a retry control; details values held as flow state so back → forward restores them; origin guards on every transition. The epic's tap-target and contrast ACs are satisfied by verification, not restyling.

**Decisions (human-approved 2026-09-21):** the busy state is fetch-coupled — it appears only while the incoming step actually has work in flight (today the time step's availability fetch), never via a minimum-display timer; typed details live in the flow service, are restored when the diner returns to the details step, and are cleared when the party size, date or slot changes; the page-level Firestore failure renders the epic's sentence as one visible line inside its alert; the tap-target and contrast ACs are verified by assertions, with no new dependency.

## Boundaries & Constraints

**Always:**
- Standalone components, `osef-` prefix, `inject()`, signals, strict TS (no `any`), native control flow, colocated `*.spec.ts`; vitest describe-per-scenario (`HAPPY_PATH`…) with `[P0]`/`[P1]` prefixes.
- Back stays offered on party-size, date, time and details only (landing is step 1, confirmation ends the flow); returning preserves every selection that still satisfies the flow — party size, date and slot survive any back step.
- Every flow transition (`start`, `choosePartySize`, `chooseDate`, `chooseSlot`, `confirm`, `back`) is origin-guarded: from an unexpected step it is a no-op, never a skip. `reset()` keeps clearing everything, including details values.
- Error copy is exactly "Something went wrong. Please try again." in one rendered string per failing surface, followed by a "Try again" control; a missing slug or restaurant renders exactly "Restaurant not found" with no retry and no flow state change.
- Announcements stay `Step N of 6: {Step Name}` in the existing polite live region; focus still moves to the incoming step's heading (`tabindex="-1"`), to landing's CTA on return, and to the confirmation heading after submit.
- Busy state is fetch-coupled: it shows only while the incoming step has work in flight (currently the time step's availability fetch) and clears when that step is ready or has failed; advances with no work show no spinner and stay instant.
- Busy indicators respect `prefers-reduced-motion`; every interactive control keeps a ≥44px target; no color or design-token changes.
- Details draft lives in the flow service and is cleared by `reset()` and by a new party-size, date or slot selection, so a changed booking intent never prefills stale values.

**Never:**
- No Firestore rules, index, data-model or booking-document changes; no changes to availability math, calendar utils, or the booking write path; no new Firestore reads.
- No routing, guard, or `app.routes.ts` changes; no visual redesign of steps, calendar, pills, or form; no dark-mode work.
- No back affordance on landing or confirmation; no artificial delay or minimum-display timer whose only purpose is to make a spinner perceivable.
- No new dependency: text-contrast and tap-target claims are verified with assertions.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| BACK_PRESERVES | Back from details, then forward again | Party size, date, slot and previously typed details all still shown | N/A |
| BACK_TO_LANDING | Back from party size | Landing renders with focus on "Book a Table"; no selection lost | N/A |
| TRANSITION_BUSY | Advance to the time step (its availability fetch is in flight) | Busy indicator visible and the step host reports `aria-busy="true"` while the fetch runs | Indicator clears when the fetch resolves **or** rejects (the step's own error + retry then shows) |
| TRANSITION_INSTANT | Advance to a step with no work in flight (party size, date, details, confirmation) | No spinner, no `aria-busy`; the step renders immediately with the existing step-in animation | N/A |
| LOAD_ERROR | `getRestaurantBySlug` rejects | Page shows the single sentence + retry; retry refetches and renders the restaurant | Retry disabled while loading |
| SLUG_MISSING | Slug doc or restaurant doc absent | Exact "Restaurant not found", no retry control, flow stays on landing | No retry offered |
| DETAILS_WRITE_ERROR | `createBooking` rejects | Details step shows the same sentence + retry resubmitting the preserved values | Values preserved, submit re-enabled |
| SLOT_CHANGED_AFTER_BACK | Back from details, pick a different slot | Details opens empty (previous draft cleared for the new booking intent) | N/A |
| OUT_OF_ORDER | `chooseDate`/`chooseSlot`/`choosePartySize` invoked from the wrong step | No state change; step unchanged; announcements unaffected | N/A |

</frozen-after-approval>

## Code Map

- `src/booking/services/booking-flow.service.ts` -- ADD origin guards to `start`/`choosePartySize`/`chooseDate`/`chooseSlot` (mirror `confirm`'s `if (this.step() === …)` at lines 42-46); ADD a transition-busy signal the incoming step raises and clears while its fetch is in flight; ADD a details-draft signal (`name`/`email`/`custom`) with save/clear, cleared on a new party size, date or slot; keep `back()`'s map (52-61) and `reset()` (64-69) — `reset()` must also clear the draft
- `src/booking/pages/booking-page/booking-page.component.html` -- page error block (13-27) becomes the single visible sentence "Something went wrong. Please try again." + `retry-button`; loading block (2-12) unchanged; the `.step-host` wrapper (41) gains `aria-busy` bound to the flow's busy state and renders the busy indicator
- `src/booking/pages/booking-page/booking-page.component.scss` -- busy-indicator styles reusing the existing `.spinner` (39-46) and `.step-host` animation (48-50); extend the `prefers-reduced-motion` block (135-143). `.back-button` (56-78) is dead here (the page template never uses it) — leave it alone rather than folding a cleanup into this story
- `src/booking/pages/booking-page/booking-page.component.ts` -- wire busy + details-draft state into the flow calls (136-154); keep the focus effects (110-133) and the `DestroyRef` reset (88)
- `src/booking/steps/details-step/details-step.component.ts` / `.html` -- seed the `FormGroup` from the flow draft and write back on change instead of owning the values; keep submit-only validation (`submitAttempted`), the `pending` disable, and the `details-error`/`details-retry` markup
- `src/booking/steps/time-slot-step/time-slot-step.component.html` (14-25) / `.ts` (46-78) -- the `time-loading` / `time-retry` pattern the page-level indicator mirrors; this step raises and clears the flow's busy signal around its availability fetch
- `src/booking/pages/booking-page/booking-page.component.spec.ts`, `src/booking/services/booking-flow.service.spec.ts`, `src/booking/steps/*/*.component.spec.ts` -- matrix coverage; the page spec already asserts loading, both not-found paths, error + retry, per-step focus and every announcement (lines 107-731), so new cases extend rather than duplicate
- `e2e/tests/public-booking-page.spec.ts` -- ADD the full back-chain preservation, the page-level Firestore failure + retry (request interception on the emulator origin; no `page.route` usage exists yet), and the ≥44px target measurements
- `src/styles.scss` -- global sheet holds only Tailwind/Material/Krub tokens; every booking spinner is component-local, so add nothing here
- `firestore.rules` / `src/app/app.routes.ts` -- DO NOT CHANGE (context only: rules and the input-bound `book/:slug` route already satisfy this story)

## Tasks & Acceptance

**Execution:**
- [x] `src/booking/services/booking-flow.service.ts` -- origin-guard every transition, hold the transition-busy and details-draft state -- the shell contract lives here so the steps stay dumb
- [x] `src/booking/pages/booking-page/booking-page.component.*` -- single-visible-line error surface + fetch-coupled busy indicator wired to the flow -- the AC2/AC4 surfaces
- [x] `src/booking/steps/time-slot-step/time-slot-step.component.ts` -- raise and clear the flow's busy signal around its availability fetch (resolve and reject) -- the only step with work in flight today
- [x] `src/booking/steps/details-step/details-step.component.*` -- back → forward restores typed values from the flow draft -- closes 2.4's filed deferral
- [x] `src/booking/{services,pages,steps}/**/*.spec.ts` -- one test per I/O matrix row plus the focus and announcement assertions on transition -- matrix coverage gate
- [x] `e2e/tests/public-booking-page.spec.ts` -- back chain, page-level Firestore failure + retry, ≥44px targets, AA-contrast sampling -- interactive proof of AC1/AC4/AC6

**Acceptance Criteria:**
- Given any step except landing, when the diner taps back, then the previous step renders with every earlier selection intact and focus on its heading
- Given an advance into a step with work in flight, when that step is still preparing, then the busy indicator is visible and the step host reports `aria-busy="true"`, and both clear once the step is ready or has failed
- Given an advance into a step with no work in flight, when the step renders, then no spinner or `aria-busy` appears and the transition stays instant
- Given a Firestore failure anywhere in the flow, when it surfaces, then "Something went wrong. Please try again." shows with a working retry
- Given an unknown or stale slug, when the page loads, then "Restaurant not found" shows with no retry and no flow state
- Given every interactive control across the six steps, when measured, then each renders ≥44px and its text meets WCAG 2.1 AA contrast
- Given a reduced-motion preference, when steps advance, then neither the spinner animation nor the step transition plays

## Implementation Notes

Implementation (2026-09-22, baseline `6183f92868bbf04a3ae3e41b9f50b4c3a0218254`): `BookingFlowService` gained origin guards on every transition, the `transitionBusy` signal with `beginTransition()`/`endTransition()`, and a `detailsDraft` signal (`DetailsDraft`, `saveDetails()`, cleared by `reset()`); the time-slot step is the only raiser (its availability `resource` loader wraps the fetch in try/finally, so the flag clears on resolve *and* reject); the page renders the fetch-coupled indicator plus `aria-busy` on `.step-host` and the page error as one visible sentence; the details step seeds its `FormGroup` from the draft and writes every edit back via `takeUntilDestroyed()`.

Decisions/interpretations worth carrying forward:
- "A new party-size/date/slot selection" is implemented as *a changed value*, not *any re-selection*. Re-confirming the same size/date/slot is the same booking intent, so the slot and the typed details survive. This was not cosmetic: re-selecting the same party size previously re-nulled `selectedSlot` (`choosePartySize`), which then made the following same-slot pick look like a different slot and silently wiped the draft — caught by the e2e back chain, not by the unit suite. Regression test added (`booking-flow.service.spec.ts`, "should keep the draft and the slot when the same party size is re-confirmed").
- AC6's evidence lives in e2e, not vitest: jsdom has no layout, so ≥44px is measured from real bounding boxes in the tap-target test and text contrast is computed in-browser (first opaque ancestor background) for name/address/heading/subheading/labels/input/error copy. The check carries a documented 0.5px tolerance — a 44px rule can measure 43.99998 after layout rounding.
- The page-level busy indicator is deliberately additive: the time step keeps its own "Checking availability..." block, so that step announces twice (page strip + in-card status). Accepted for now; collapsing the two would change 2.3's owned markup.
- Removed the intermediate `.transition-busy`/`.error-message` component CSS in favour of the Tailwind utilities the page already uses; the added CSS had pushed `booking-page.component.scss` over the 2 kB `anyComponentStyle` budget (new build warning). The production build is warning-free apart from the pre-existing initial-bundle overage.

Verification: `npm test` 29 files / 345 tests pass; `npm run lint` clean; `npm run build` succeeds with only the pre-existing initial-bundle warning; booking e2e 16/16 pass (incl. the new back chain, page-level Firestore failure + retry via request abort on the emulator origin, 44px targets, contrast sampling). Run note: this machine's port 4210 is held by colima's SSH mux, so the app was served on 4310 and Playwright run with `PLAYWRIGHT_TEST_BASE_URL=http://localhost:4310`; a stale Firestore emulator from the first attempt was killed so Playwright could start auth+firestore itself.

## Spec Change Log

## Review Triage Log

### Code review 2026-09-26 (full review against baseline 6183f92)
Layers evaluated: blind-hunter, edge-case-hunter, verification-gap. Diff size: ~52kB (floor N=8 findings).

### Review Findings
- Rejected (false): Double announcement on time-step load ("Checking availability..." in step + "Loading..." on page) — Spec Intent explicitly documents page-level busy indicator as additive without altering 2.3 step markup.
- Rejected (false): Details draft not synced if form edited programmatically without valueChanges event — Angular Reactive Forms emit valueChanges on all standard controls; programmatic patching in tests manually handles or uses controls.
- Rejected (false): Sub-pixel rounding on tap targets in mobile viewports — e2e test uses 0.5px tolerance to account for floating-point CSS bounding rect values; actual layout targets are >= 44px.
- Rejected (false): Time slot step retry does not clear previous slot selection — Step retry re-queries availability for the current date/party; re-selecting or back handles slot revision cleanly.
- Rejected (low): Details step does not throttle `valueChanges` subscription writes to `BookingFlowService` — Synchronous in-memory signal writes for small 3-field object add zero measurable overhead and avoid debounce timing edge cases on unmount.
- Rejected (low): Flow transitions could be triggered while `transitionBusy` is active — UI controls are either unmounted or step-isolated during transition; no concurrent interactions possible.
- Rejected (low): `BookingFlowService.detailsDraft` is not deep-frozen — Single-depth plain object cloned on read/write; no mutation leaks in practice.
- Rejected (low): Calendar step previous month button disabled state contrast in dark themes — Dark theme tokens are global and out of scope for story 2.5 per Boundaries & Constraints ("no dark-mode work").


## Verification

**Commands:**
- `npm test` -- expected: all suites pass, including the new guard, busy-state, draft-restore and page-error cases
- `npm run lint` -- expected: clean
- `npm run build` -- expected: production build succeeds
- `npx playwright test e2e/tests/public-booking-page.spec.ts` -- expected: all booking e2e pass against the emulators Playwright starts via `webServer`


