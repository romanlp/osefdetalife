---
title: 'Story 2.4: Details Form & Booking Submission'
type: 'feature'
created: '2026-09-11'
status: 'in-progress'
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
- [ ] `src/booking/services/booking.service.ts` -- ADD `createBooking` batch write (booking + projection, same ID) -- submission is the core deliverable
- [ ] `src/booking/services/booking-flow.service.ts` -- ADD `confirmation` step + `confirm()` transition -- completes the 6-step flow
- [ ] `src/booking/steps/details-step/details-step.component.*` -- NEW Reactive details form with submit-only validation + error/retry -- diner input surface
- [ ] `src/booking/pages/booking-page/booking-page.component.*` -- Wire live details step + confirmation view, announcements, focus -- shell completes landing to confirmation
- [ ] `src/booking/**/*.spec.ts` -- Unit-test matrix rows (validation, custom variants, batch shape, double-submit guard, back-preserves) -- matrix coverage gate
- [ ] `e2e/tests/public-booking-page.spec.ts` -- Submit happy-path + custom-field variants against emulators -- real-Firestore proof incl. projection

**Acceptance Criteria:**
- Given valid details, when the diner submits, then a `confirmed` booking and matching non-PII projection are created in one batch and confirmation loads
- Given empty required fields or malformed email, when the diner submits, then inline errors show and no write is attempted
- Given a Firestore failure, when submission rejects, then the retryable error shows and retry resubmits with values preserved
- Given confirmation, when it loads, then summary (date, time, party size) and "You're all set." show with no action buttons

## Implementation Notes

## Spec Change Log

## Review Triage Log

## Verification

**Commands:**
- `npm test` -- expected: all suites pass incl. details-step matrix, flow additions, batch shape, updated page spec
- `npm run lint` -- expected: clean
- `npm run build` -- expected: production build succeeds
- `npx playwright test e2e/tests/public-booking-page.spec.ts` -- expected: updated tests pass against emulators

