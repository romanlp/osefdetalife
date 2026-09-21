---
title: 'Story 2.4: Details Form & Booking Submission'
type: 'feature'
created: '2026-09-11'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: d9ce2117fcc18cc2cec9b773d6f767b0d674c591
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** After Story 2.3, picking a time slot lands on a static details placeholder — diners cannot submit a booking and no Firestore write exists. This story adds the details form (name, email, optional restaurant-configured custom field) and the booking submission that writes the booking plus its non-PII public projection in one batch, ending on a confirmation screen and completing step 5–6 of the 6-step flow.

**Approach:** A `createBooking` batched write in `BookingService` (booking doc + `bookings-public` projection with matching ID), a new self-contained `details-step` component with a Reactive form validating on submit, and a new `confirmation` flow state rendered by the booking page; flow service gains `confirm` transition while back-from-details preserves all selections. Decisions: confirmation echoes raw ISO date + 24-hour time verbatim; submit button reads "Confirm Booking".

## Boundaries & Constraints

**Always:**
- Standalone components, `osef-` prefix, `inject()`, signals, strict TS (no `any`), native control flow, colocated `*.spec.ts`; vitest describe-per-scenario (`HAPPY_PATH`…) with `[P0]`/`[P1]` prefixes.
- Reactive forms (consistent with existing codebase); validation runs on submit only, never on blur/input.
- Details fields: Name required (non-empty after trim), Email required + format validated, custom field shown only when `restaurant.customField.enabled` is true with the restaurant-defined label, required iff `customField.required`; hidden entirely otherwise.
- Submission payload: `date`, `time`, `partySize`, `name` (trimmed), `email` (trimmed), `customFieldValue` (trimmed, only when field shown — omit otherwise), `status: 'confirmed'`, `duration: BOOKING_DURATION_MINUTES`, `restaurantId`, `createdAt: serverTimestamp()`; projection in the same batch carries only `restaurantId/date/time/partySize/status: 'confirmed'` under the same document ID.
- Confirmation: centered checkmark icon in accent, summary echoes raw ISO date + 24-hour time verbatim plus party size, submit button reads "Confirm Booking", message exactly "You're all set.", no action buttons; step a11y contract unchanged (focus to heading, "Step N of 6" live region — add Confirmation entry).
- In-step Firestore failure shows "Something went wrong. Please try again." + retry resubmitting current selections; missing flow selections never attempt a write.
- Back from details preserves slot/date/party; no back offered from confirmation (flow complete).

**Never:**
- No availability recomputation or slot re-validation before write (Story 2.3 owns availability; double-booking race out of scope).
- No firestore.rules/indexes changes (unauthenticated create + projection shape already allowed); no auth/dashboard/route changes.
- No Angular Material, no new font imports; no changes to calendar/party-size/time-slot steps or utils.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH_SUBMIT | Valid name/email, slot+date+party selected | Booking + projection written in one batch; auto-advance to confirmation with summary | N/A |
| CUSTOM_REQUIRED | `customField` enabled + required | Field shown with label, submit blocked until non-empty | Inline required error on submit |
| CUSTOM_OPTIONAL | `customField` enabled, not required | Field shown, empty submits without `customFieldValue` | N/A |
| CUSTOM_HIDDEN | No `customField` or disabled | No custom input; payload omits `customFieldValue` | N/A |
| VALIDATION_EMPTY | Submit with empty name or email | Inline errors shown, no write attempted | Errors via `aria-describedby` |
| VALIDATION_EMAIL | Submit with malformed email | Inline format error, no write attempted | Same as above |
| SUBMIT_FAILURE | Firestore batch rejects | "Something went wrong. Please try again." + retry resubmits | Retry preserves form values |
| DOUBLE_SUBMIT | Tap submit twice quickly | Second submit ignored while pending | Submit disabled during pending |

</frozen-after-approval>

## Code Map

- `src/booking/services/booking.service.ts` -- ADD `createBooking` batched write (`writeBatch`, booking doc + `bookings-public` projection same ID, `serverTimestamp()`); reuse `BOOKING_DURATION_MINUTES`; do not change existing reads
- `src/booking/services/booking-flow.service.ts` -- ADD `confirmation` to `BookingFlowStep`, `confirm()` transition (details to confirmation, back is no-op); reset clears as today
- `src/booking/steps/details-step/details-step.component.*` (NEW) -- Reactive form (name/email/custom), submit-only validation, loading/error states, focus heading on mount; testids `details-name`, `details-email`, `details-custom`, `details-submit`, `details-back`, `details-error`, `details-retry`
- `src/booking/pages/booking-page/booking-page.component.*` -- Replace details placeholder with live step + confirmation view (checkmark, summary, "You're all set."); extend `stepAnnouncement`; focus moves to confirmation heading
- `firestore.rules` -- DO NOT CHANGE (context only: unauthenticated create + projection shape already allowed)
- `e2e/tests/public-booking-page.spec.ts` + `e2e/fixtures/*` -- EXTEND: happy-path submit asserts both docs; custom-field variants via restaurant overrides

## Tasks & Acceptance

**Execution:**
- [x] `src/booking/services/booking.service.ts` -- ADD `createBooking` batch write (booking + projection, same ID) -- submission is the core deliverable
- [x] `src/booking/services/booking-flow.service.ts` -- ADD `confirmation` step + `confirm()` transition -- completes the 6-step flow
- [x] `src/booking/steps/details-step/details-step.component.*` -- NEW Reactive details form with submit-only validation + error/retry -- diner input surface
- [x] `src/booking/pages/booking-page/booking-page.component.*` -- Wire live details step + confirmation view, announcements, focus -- shell completes landing to confirmation
- [x] `src/booking/**/*.spec.ts` -- Unit-test matrix rows (validation, custom variants, batch shape, double-submit guard, back-preserves) -- matrix coverage gate
- [x] `e2e/tests/public-booking-page.spec.ts` -- Submit happy-path + custom-field variants against emulators -- real-Firestore proof incl. projection

**Acceptance Criteria:**
- Given valid details, when the diner submits, then a `confirmed` booking and matching non-PII projection are created in one batch and confirmation loads
- Given empty required fields or malformed email, when the diner submits, then inline errors show and no write is attempted
- Given a Firestore failure, when submission rejects, then the retryable error shows and retry resubmits with values preserved
- Given confirmation, when it loads, then summary (date, time, party size) and "You're all set." show with no action buttons

## Implementation Notes

Implementation (2026-09-11): `createBooking` batch write + `confirmation` flow state + new `osef-details-step` Reactive form + live details/confirmation wiring on booking page. Verified: `npm test` 29 files / 308 tests pass; `npm run lint` clean; `npm run build` succeeds (pre-existing initial-bundle budget warning only). E2E (implementer report): 11/11 pass incl. batch+projection assertions. Follow-ups: no automated AXE pass executed; confirmation checkmark contrast on brand-secondary worth a design check; e2e cleanup hardcodes emulator project ID.

## Spec Change Log

## Review Triage Log

### Code review 2026-09-13 (uncommitted changes vs HEAD, full mode)
Layers: blind-hunter + edge-case-hunter (FAILED — hallucinated `validateBookingInput`, `ValidateBookingInput`, `submittedBooking` signal, `SubmitBooking` entity, `confirmation/` component, `dashboard bookings` query/pagination — none exist in repo; 13 JSON findings rejected as unverifiable) + verification-gap + acceptance-auditor. `npm test` re-verified 29 files / 308 pass. Acceptance audit: all 4 ACs PASS, no spec violations.
Entries below use `### Review Findings` bullets per step-04-present ordering (decision-needed, patch, defer) plus rejected appendix.

### Review Findings
- [x] [Review][Decision] Retry-after-ambiguous-failure duplicate booking — RESOLVED 2026-09-13: accept duplicates as out-of-scope (spec Never: double-booking race out of scope; matches chosen option). No code change. [details-step.component.ts:122-125 + booking.service.ts:72-74]
- [x] [Review][Patch] Disable back + retry while pending — APPLIED 2026-09-13: back + retry buttons bind [disabled]="pending()"; added BACK_NAVIGATION unit asserting both disabled mid-submit. [details-step.component.html:2-10 + details-step.component.html:66-73]
- [x] [Review][Patch] Double-submit guard bypassed by disabled-button test — APPLIED 2026-09-13: added DOUBLE_SUBMIT unit invoking submit()/retry() programmatically while pending; single createBooking asserted. [details-step.component.spec.ts:262]
- [x] [Review][Patch] Missing-selection guard pins only empty-date disjunct — APPLIED 2026-09-13: parameterized it.each for restaurantId ''/time ''/partySize 0; no write asserted per disjunct. [details-step.component.spec.ts:250 + details-step.component.ts:97]
- [x] [Review][Patch] Confirmation singular-guest branch never asserted — APPLIED 2026-09-13: plural control 'for 4 guests' on existing confirmation test + new [P1] party-of-one test asserting 'for 1 guest'. [booking-page.component.spec.ts:567-570]
- [x] [Review][Patch] Empty custom label renders empty accessible name — APPLIED 2026-09-13: customLabel falls back to 'Additional details' on blank; unit covers blank-label case. [details-step.component.ts:54 + details-step.component.html:49]
- [x] [Review][Defer] Form state lost on back-then-forward (name/email/custom cleared; slot/date/party preserved) — deferred: real but belongs to Story 2-5 navigation scope, not 2-4 submit scope [details-step.component.ts:38-42]
- [x] [Review][Defer] E2E cleanup hardcodes emulator project ID — deferred: pre-existing test-infra brittleness, zero product impact [e2e/tests/public-booking-page.spec.ts:413-419]
- Rejected (false): confirmation echoes raw ISO + 24h verbatim — spec Intent explicitly decides this; acceptance-auditor confirms AC4 PASS. No action.
- Rejected (false): confirmation omits name/email/custom values — spec confirmation contract is date/time/party + "You're all set." only; auditor confirms AC4 PASS. No action.
- Rejected (false): createBooking performs no date/time/partySize/email-shape validation — spec Code Map assigns validation to the details-step form (submit-only) and batch shape to the service; form trims + validates, service writes verbatim by design. No action.
- Rejected (false): showCustom blank-optional drops explicit empty string — spec payload says customFieldValue trimmed, only when field shown, omit otherwise; empty-omitted is the specified shape. No action.
- Rejected (false): page restaurant reload/slug change resets flow wiping in-flight form — reset-on-(re)load is specified (page TS effect + DestroyRef reset) so same-slug revisit starts fresh. No action.
- Rejected (false): submitError stays visible while editing with no live re-validation — spec mandates validation runs on submit only, never on blur/input. No action.
- Rejected (false): missing flow selections never attempt a write with no user feedback — spec mandates missing selections never attempt a write; page never renders details without selections. No action.
- Rejected (false): submit failure focus not moved to alert/first invalid — step a11y contract is focus-to-heading + Step N live region only; unit asserts aria-describedby wiring. No action.
- Rejected (low): no maxlength on name/email/custom — Firestore rejects oversize server-side; diner-typed overlong values are everyday-rare and fix adds new constraints beyond spec. Not worth it.
- Rejected (low): confirmation shows no booking ID/reference — spec confirmation is summary + "You're all set." with no further actions. Not worth it.
- Rejected (low): retry button has no own disabled/loading state — retry() funnels into submit() which returns early while pending; overlapping path already guarded. Not worth it.
- Rejected (low): success path shows created booking ID nowhere — same as booking-ID item above; spec defines confirmation content. Not worth it.
- Rejected (edge-layer): all 13 edge-case-hunter JSON findings — unverifiable against repo (symbols/files do not exist); layer marked failed per step-02 rule 4.

## Verification

**Commands:**
- `npm test` -- expected: all suites pass incl. details-step matrix, flow additions, batch shape, updated page spec
- `npm run lint` -- expected: clean
- `npm run build` -- expected: production build succeeds
- `npx playwright test e2e/tests/public-booking-page.spec.ts` -- expected: updated tests pass against emulators

