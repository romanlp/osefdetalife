---
title: 'Story 2.3: Time Slot Selection & Availability'
type: 'feature'
created: '2026-08-23'
status: 'done'
review_loop_iteration: 0
context: []
baseline_commit: 4bdb8ceff6d6f84cb1cee62b12c8511642b7c787
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** After Story 2.2, picking a date lands on a static time-slot stub — diners see no real availability and cannot progress. This story computes availability on read (day's confirmed bookings from the public projection minus the restaurant's table groups) and renders the resulting 15-minute slots as horizontally scrollable pills, completing step 4 of the 6-step flow.

**Approach:** Pure availability utilities (`slots within opening hours − 120-minute occupancy of matching-capacity tables`), a `getPublicBookings` read of `restaurants/{id}/bookings-public` in `BookingService`, and a new self-fetching `time-slot-step` component replacing the stub; flow service grows a `selectedSlot` signal and a placeholder `details` step (form content is Story 2.4), mirroring how 2.2 stubbed time.

## Boundaries & Constraints

**Always:**
- Standalone components, `osef-` prefix, `inject()`, signals, strict TS (no `any`), native control flow, colocated `*.spec.ts`; vitest describe-per-scenario (`HAPPY_PATH`…) with `[P0]`/`[P1]` prefixes.
- All slot math = pure functions with explicit inputs (`hours`, `iso`, `bookings`, `partySize`, `tableGroups`, `nowMinutes`); "now" only via injected `NOW`; restaurant timezone via `Intl` (never device-local getters); reuse calendar.ts helpers.
- Availability: slot starts every 15 min within open→close for that day; party of N needs one table of capacity ≥ N (embedded `restaurant.tableGroups` is source of truth); each projected booking occupies one such table for `[time, time+120min)` (`BOOKING_DURATION_MINUTES = 120`); slots starting at/before now excluded when date is today; today after close ⇒ empty state.
- Pills: horizontal scroll row, ≥44px targets, `aria-pressed` single-select, selected = `var(--osef-brand-primary)` fill + white text; display 12-hour, value stays `HH:mm`; testids `time-option-HH-mm`, `time-empty`, `time-retry`; empty text exactly "No available times for this date."
- Step a11y contract unchanged (focus to heading, "Step N of 6" live region — add Details entry); in-step Firestore failure shows "Something went wrong. Please try again." + retry refetching current selections.
- Back from details preserves slot/date/party; reset-on-restaurant-reload keeps holding.

**Ask First:**
- Must a new booking's full 120-minute window end ≤ closing time? (proposal: yes — a 21:00 slot at 23:00 close is unavailable)
- Confirm duration stays hard-coded 120 min this story (public projection has no `duration` field; rules changes out of scope).

**Never:**
- No booking writes, no details-form fields, no confirmation screen (Story 2.4).
- No firestore.rules/indexes changes; no auth/dashboard/route changes; no pre-computed availability storage.
- No Angular Material, no new font imports; never read the `tables` subcollection or full `bookings` (projection only).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH_SLOT | Party 4, open date, free tables | 15-min pills spanning open→close; tap → accent highlight, auto-advance to details placeholder | N/A |
| OCCUPIED_WINDOW | Confirmed booking 19:00 on a cap≥N table | Every slot overlapping [19:00, 21:00) absent for that party size | N/A |
| CAPACITY_SCARCITY | Party 6, only cap-6 group qualifies | Slots reflect solely cap-6 availability; smaller-table bookings irrelevant | N/A |
| NO_TIMES | Qualifying tables booked all day, or today past close | "No available times for this date."; only back works | N/A |
| TODAY_PAST_SLOTS | Today selected mid-day | Slots starting ≤ now excluded; later slots shown | N/A |
| FETCH_ERROR | Projections query rejects | In-step error + retry refetches | Retry button |
| BACK_PRESERVES | details → time → date | Slot stays highlighted; date/party intact | N/A |

</frozen-after-approval>

## Code Map

- `booking-page.component.html:84-102` -- `@case ('time')` stub to replace; sibling case :73-83 shows input wiring; live region :37-39; loading/error patterns :2-27. `…ts:67-75` announcement map (add Details); `:110-117` flow reset on reload; `:120-125` time-focus effect (moves into step component, delete here). scss `.back-button/.heading/.summary` :56-98.
- `booking-flow.service.ts:3,:11-13,:27-44,:47-51` -- step union, signals, actions, `previous` map :37-41, reset. Add `'details'`, `selectedSlot`, `chooseSlot`, extend map.
- `calendar-step.component.ts:22-29,:43-46,:96-98` -- copy pattern: required inputs/outputs, `NOW` inject + navTick refresh, `ngAfterViewInit` heading focus; spec FIXED_NOW helper :17-44. Selected-fill scss precedent `party-size-step.component.scss:83-87`.
- `src/booking/utils/calendar.ts:29-63` -- reuse `isoDayNumberOf`/`zonedToday` (UTC fallback)/`isOpenOn`; `clock.ts:7` NOW token (only sanctioned clock).
- `src/shared/types/restaurant.ts:24-36` -- `OpeningHours` ("HH:mm", missing key = closed), `TableGroup {capacity, count}`; `src/shared/types/booking.ts:1-13` -- `Booking`; add projection type + duration const here.
- `booking.service.ts:11-32` -- Firestore via module-lazy `getFirebaseDb()`; add projection query beside `getRestaurantBySlug`; where-clause precedent `onboarding.service.ts:103-112`.
- `firestore.rules:34-46,:97-106` -- bookings-public publicly readable; projection exactly `{restaurantId,date,time,partySize,status}` (no duration ⇒ constant); equality-only queries need no index (indexes.json empty).
- e2e: `factories.ts:31-55` (`createBookingData` lacks `duration` — add 120; `createTableGroupData`), `restaurant.fixture.ts:39-85` (seed embedded `tableGroups`: cap-2 ×2 / cap-4 ×3 / cap-6 ×1), `booking.fixture.ts:15-39` (seeding/cleanup), `public-booking-page.spec.ts:80-125` (`startBooking`/`showMonth` helpers; stub test replaced here).
- UX ground truth: `_bmad-output/planning-artifacts/ux-designs/ux-osefdetalife-2026-07-14/DESIGN.md` (pills/tokens) + `EXPERIENCE.md` (12-hour display, auto-advance, announcements).

## Tasks & Acceptance

**Execution:**
- [x] `src/shared/types/booking.ts` -- add `PublicBookingProjection` type + `BOOKING_DURATION_MINUTES = 120` -- typed reads, shared constant.
- [x] `src/booking/utils/availability.ts` + `.spec.ts` -- pure helpers: `slotsForDay(hours, iso)` → all 15-min `HH:mm` starts in open→close; `availableSlots({hours, iso, bookings, partySize, tableGroups, nowMinutes})` → capacity-filtered, interval-overlap occupancy-filtered, today-past-filtered -- deterministic core; unit-test every matrix row with fixed clocks.
- [x] `src/booking/services/booking.service.ts` + spec -- `getPublicBookings(restaurantId, dateIso): Promise<PublicBookingProjection[]>` querying `bookings-public` (`where date ==`, `where status == 'confirmed'`) -- first projection consumer.
- [x] `src/booking/services/booking-flow.service.ts` + spec -- `selectedSlot` signal, `chooseSlot(time)` advancing to `details`, extended `previous` map -- state machine parity with prior steps.
- [x] `src/booking/steps/time-slot-step/time-slot-step.component.{ts,html,scss,spec.ts}` -- self-fetching step keyed on date+party: pills row, selected/empty/error/retry states, heading focus, back output -- replaces stub UI.
- [x] `src/booking/pages/booking-page/booking-page.component.{ts,html}` + spec -- swap stub for `<osef-time-slot-step>`, wire outputs, add Details announcement, drop obsolete focus effect.
- [x] `e2e/fixtures/factories.ts` + `restaurant.fixture.ts` -- booking factory gets `duration: 120`; restaurant fixture seeds embedded `tableGroups` cap-2 ×2 / cap-4 ×3 / cap-6 ×1 -- makes availability truthful end-to-end.
- [x] `e2e/tests/public-booking-page.spec.ts` -- replace stub test; [P0] full flow through slot pick → details placeholder; [P1] occupied-window slot absent; [P1] "No available times for this date.".

**Acceptance Criteria:**
- Given party size and date chosen, when the time step loads, then slots render as horizontally scrollable 15-minute pills covering that day's opening hours, computed on read from `bookings-public` minus table-group capacity (≥ party) and 120-minute occupancy.
- Given no slot qualifies (full occupancy or today fully elapsed), then "No available times for this date." appears and back remains the only navigation.
- Given a pill is tapped, then it highlights (accent fill, white text), flow records `selectedSlot`, and the placeholder details view advances automatically; back restores time with the slot highlighted and all selections intact.
- Given the projections fetch fails, then an in-step error with retry appears and retry refetches for the current selections.

## Spec Change Log

## Design Notes

Occupancy = interval overlap against 120-min windows per qualifying table pool:

```ts
const overlaps = (a: number, b: number, dur: number) => a < b + dur && b < a + dur;
// sort bookings by start; greedily assign each to the first qualifying
// table free for its window; a slot survives iff some table stays free
// for [slot, slot+120)
```

Constant duration: the public projection deliberately excludes `duration` (AD-14 non-PII shape), so projected occupancy assumes the documented 2-hour default until configurability arrives.

## Verification

**Commands:**
- `npm test` -- expected: all suites pass incl. availability matrix rows, flow-service additions, time-slot-step, updated page spec.
- `npm run lint` -- expected: clean.
- `npm run build` -- expected: production build succeeds.
- `npx playwright test e2e/tests/public-booking-page.spec.ts` -- expected: updated tests pass against emulators (green sharded e2e baked into done gate per retro item 6).

## Suggested Review Order

- Greedy best-fit occupancy + Intl timezone math is the core of the story
  [`availability.ts:1`](../../src/booking/utils/availability.ts#L1)

- Self-fetching slot pills keyed on date + party, replacing the stub
  [`time-slot-step.component.ts:1`](../../src/booking/steps/time-slot-step/time-slot-step.component.ts#L1)

- Projection read (confirmed-only, equality clauses, no composite index)
  [`booking.service.ts:34`](../../src/booking/services/booking.service.ts#L34)

- State machine grows selectedSlot + details step, clears stale slots
  [`booking-flow.service.ts:1`](../../src/booking/services/booking-flow.service.ts#L1)

- Stub swapped for the live step; focus moves to details placeholder
  [`booking-page.component.ts:1`](../../src/booking/pages/booking-page/booking-page.component.ts#L1)

- Same swap in markup: live step wiring + details placeholder
  [`booking-page.component.html:84`](../../src/booking/pages/booking-page/booking-page.component.html#L84)

- Availability matrix on fixed clocks, incl. stale-slot clearing
  [`availability.spec.ts:1`](../../src/booking/utils/availability.spec.ts#L1)

- Step wiring, empty/error-retry, details focus, back preserves
  [`booking-page.component.spec.ts:1`](../../src/booking/pages/booking-page/booking-page.component.spec.ts#L1)
