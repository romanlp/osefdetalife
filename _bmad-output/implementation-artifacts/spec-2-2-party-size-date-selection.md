---
title: 'Story 2.2: Party Size & Date Selection'
type: 'feature'
created: '2026-08-21'
status: 'done'
review_loop_iteration: 0
context: []
baseline_commit: 0b4b4334aeb077d183660fd203ef583ee5f6c3bf
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** After Story 2.1, `/book/{slug}` ends at a static landing — diners cannot begin a booking. This story adds the first two flow steps: party size (2×4 grid of circular buttons 1–8) and an open-dates-only calendar, with auto-advance and back navigation preserving selections.

**Approach:** Make `BookingPageComponent` the shell of a signal-driven step flow (landing → party size → date → time-slot stub); flow state in a new `BookingFlowService`, UI in two new step components, date logic in pure calendar utilities driven by `restaurant.hours` in the restaurant's IANA timezone. The time-slot view is a minimal stub replaced by Story 2.3.

## Boundaries & Constraints

**Always:**
- Standalone components, `osef-` prefix, `inject()`, signals, strict TS (no `any`), native control flow, colocated `*.spec.ts`; vitest describe-per-scenario (`HAPPY_PATH`…) with `[P0]`/`[P1]` test prefixes.
- Flow state in `BookingFlowService` (`@Service()`): `step` (`landing|party-size|date|time`), `partySize`, `selectedDate` signals + actions (`start/choosePartySize/chooseDate/back/reset`); reset on restaurant reload.
- Calendar logic = pure functions taking explicit `(hours, timezone, now)`; "today" via `Intl.DateTimeFormat` with `restaurant.timezone` (never device-local getters); cell weekdays from UTC-constructed dates; no bare `new Date()` outside an injected clock.
- Hours keys are `DayNumber` 1=Mon..7=Sun; missing key = closed. Only open AND today-or-future dates render as buttons; closed/past days absent from the DOM entirely (hidden, not grayed).
- Reuse host vars `--osef-brand-primary`/`--osef-brand-secondary`; selected state = primary fill + white text; tap targets ≥44px; each transition moves focus to the new step heading (`tabindex="-1"` + `.focus()`) and a polite live region announces "Step N of 6: {Step Name}".
- data-testids: `party-size-option-{n}`, `party-size-back`, `calendar-prev`, `calendar-next`, `date-option-{YYYY-MM-DD}`, `calendar-back`.
- Fix e2e seeding to match the app type: `factories.ts` hours re-keyed to 1–7; align `getNextAvailableDate`.

**Ask First:** upper bound on forward month navigation, or an all-closed empty-month message, if deemed needed.

**Never:**
- No availability computation; no `bookings`/`bookings-public` reads/writes (Story 2.3+); no time-slot UI beyond the stub; no details form.
- No firestore.rules changes; no auth/dashboard changes; no `ThemingService`.
- No Angular Material in booking flow; no new font imports; no route changes (flow stays inside `/book/:slug`).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH_PARTY | Landing; tap "Book a Table", then "4" | Party step: 2×4 grid, "How many guests?", back→landing; "4" highlighted (primary fill, white text); auto-advance to calendar | N/A |
| BACK_PRESERVES | On calendar after choosing 4; tap back | Party step with "4" still highlighted | N/A |
| OPEN_DATE_SELECT | Calendar; tap open future date | Date highlighted; auto-advance to time-slot stub showing selected summary | N/A |
| DAY_HIDDEN | Weekday closed in `hours`, or open day before today (restaurant tz) | Cell absent from grid everywhere; month nav + back still work when a month renders zero buttons | N/A |
| MONTH_NAV | Tap next / prev | Grid rebuilds; prev disabled while viewing current month | N/A |
| TZ_TODAY_BOUNDARY | Device tz ≠ restaurant tz near midnight | "Today"/weekday derivation use `restaurant.timezone` | N/A |

</frozen-after-approval>

## Code Map

- `src/booking/pages/booking-page/booking-page.component.{ts,html,scss}` -- shell to extend: `resource()` fetch (:23-31), brand CSS var computeds (:10-13,:33-46), retry (:59-61); `book-button` handler-less (html:46); existing testids html:7-46.
- `src/booking/services/booking.service.ts` -- `getRestaurantBySlug()`; reuse as-is.
- `src/shared/types/restaurant.ts` -- `timezone: string` (:7, IANA; hardcoded `'Europe/London'` at creation, onboarding.service.ts:57); `OpeningHours = Partial<Record<DayNumber, DayHours>>` (:21-30), `"HH:mm"` values.
- `src/app/app.routes.ts:38-44` -- single lazy `/book/:slug` + input binding; no route changes.
- `src/app/onboarding/` -- per-step routes work there because state persists server-side; not followed here (ephemeral state → signal service).
- `_bmad-output/planning-artifacts/ux-designs/ux-osefdetalife-2026-07-14/DESIGN.md` -- :142-144 step header/party grid/calendar specs; tokens :95-101 (accent #8FA67A hover #7A9168, ink #1A1A1A, muted #6B6B6B, hairline #E5E0DB, surface #F5F0EB); radius 8/12/16; spacing 4–48.
- `.../EXPERIENCE.md` -- :31,:82 back preserves selections; :83 single-select no deselect; :84 closed hidden entirely; :131-132 focus-to-heading + "Step N of 6"; :134 ≥44px; :137 Reduce Motion.
- `.../mockups/key-widget-party-size.html:79-106` -- exact party-size CSS: grid `repeat(4,1fr)` gap 12px; buttons `aspect-ratio:1; border-radius:50%; border:2px solid #E5E0DB; background:#FFF; font-size:1.125rem; font-weight:600`; selected accent bg/border + white text; hover border #6B6B6B. No calendar mockup exists — DESIGN.md:144 is the only visual spec.
- `e2e/fixtures/factories.ts:13-20` -- ⚠️ seeds hours with JS 0-indexed day keys (0=Sun..5=Fri), conflicting with the app type; re-key here.
- `e2e/utils/test-helpers.ts:36-65` -- `formatDate`/`getNextAvailableDate` use local-time `getDay()`; align to 1–7.
- `e2e/fixtures/restaurant.fixture.ts:38-91` -- seeding + cleanup pattern; `RestaurantPage` page object :15-36; `e2e/tests/public-booking-page.spec.ts` shows `getByTestId`/`toHaveCount(0)` patterns.
- `src/booking/pages/booking-page/booking-page.component.spec.ts:26-66` -- vitest spy-object + `provideRouter([])` + `setInput` + `resolveLoad`/`whenStable` patterns; `booking.service.spec.ts:5-41` shows `vi.mock('firebase/firestore')`.
- `firestore.rules:93-106` -- `bookings-public` rules exist (read-only evidence; Story 2.3).

## Tasks & Acceptance

**Execution:**
- [x] `src/booking/utils/calendar.ts` + `.spec.ts` -- pure helpers: `zonedToday(timezone, now)` → `{iso, dayNumber}`; `isOpenOn(hours, iso)`; `buildMonthGrid(year, month, hours, todayIso)` → cells `{iso, dayNumber, selectable}` omitting closed/past -- deterministic core; unit-test TZ boundary with fixed `now`.
- [x] `src/booking/services/booking-flow.service.ts` -- `@Service()` singleton holding the flow state machine -- reused by Stories 2.3–2.5.
- [x] `src/booking/steps/party-size-step/party-size-step.component.{ts,html,scss,spec.ts}` -- 2×4 circular grid 1–8, heading, back output; emits selection, parent advances -- AC grid/heading/back/auto-advance.
- [x] `src/booking/steps/calendar-step/calendar-step.component.{ts,html,scss,spec.ts}` -- month header + prev/next (prev disabled on current month), grid from `buildMonthGrid`, back output; month-offset signal -- AC open-only/today+/hidden/nav.
- [x] `src/booking/pages/booking-page/booking-page.component.{ts,html,scss,spec.ts}` -- wire `book-button` → `flow.start()`; `@switch` rendering active step; stub time view (summary + back); focus-to-heading; sr-only live region; reduced-motion-safe transition -- orchestration + a11y precedents for 2.3–2.5.
- [x] `e2e/fixtures/factories.ts` + `e2e/utils/test-helpers.ts` -- re-key hours to 1=Mon..7=Sun; align `getNextAvailableDate` -- unblocks truthful calendar e2e.
- [x] `e2e/tests/public-booking-page.spec.ts` (extend) -- P0: book → tap 3 → pick next open date → stub shows summary; P1: back preserves party size; P1: closed weekday absent (`toHaveCount(0)`) -- end-to-end proof.

**Acceptance Criteria:**
- Given landing, when the diner taps "Book a Table", then the party-size step shows a 2×4 grid of circular buttons 1–8, the heading "How many guests?", and a back button returning to landing.
- Given the party-size step, when a number is tapped, then it is highlighted (accent fill, white text) and the calendar step loads automatically.
- Given the calendar step, then only open dates (per `hours`, restaurant timezone) from today onward are tappable; closed and past dates appear nowhere in the grid.
- Given an open date is selected, then the time-slot area loads automatically showing the selections; its back returns to the calendar with the date highlighted, and the calendar's back returns to party size with the number selected.
- Given any step transition, then focus moves to the new step heading and a live region announces "Step N of 6: {Step Name}".

## Spec Change Log

- Implementation-time infra addition: `playwright.config.ts` webServer URL now honors `PLAYWRIGHT_TEST_BASE_URL` (same env var `baseURL` already used) — a local Colima/Lima tunnel occupied port 4210 with a 404, permanently failing Playwright's readiness check. Default behavior unchanged; no app code affected.
- Review round 1 — human resolved the frozen *Ask First*: calendar gets an empty-month message ("No available dates in this month."); forward navigation stays unbounded by explicit human decision. KEEP: signal-based flow state machine, pure `(hours, timezone, now)` calendar utils with UTC-derived weekdays, hidden-not-grayed non-selectable days, existing testids.
- Review round 1 — patch batch applied: e2e asserts chosen date in stub summary; unit tests added for time-back preserving date, "Step 4 of 6: Time" announcement, time-heading focus, party-size reselect-after-back; a11y fixes (destination-specific back labels, single month-label announcement, focus target on return to landing, weekday header row); invalid-timezone Intl fallback to UTC parts (never device-local); dead `formatDate` helper removed.

## Matrix Test Audit

| Matrix row | Verified by |
|---|---|
| HAPPY_PATH_PARTY | unit `party-size-step.component.spec.ts` HAPPY_PATH ([P0] grid+heading, [P0] emit on tap), unit `booking-flow.service.spec.ts` [P0] walk landing→time, e2e "Booking Flow [P0] book → choose party size → pick next open date → stub" |
| BACK_PRESERVES | unit `booking-flow.service.spec.ts` BACK_PRESERVES ×3, unit `calendar-step.component.spec.ts` SELECTION_STATE highlight-on-return + BACK_NAVIGATION emit, e2e "[P1] back from the calendar preserves the chosen party size" |
| OPEN_DATE_SELECT | unit `calendar-step.component.spec.ts` [P0] emit ISO on open-date tap, unit flow walk, e2e Booking Flow [P0] |
| DAY_HIDDEN | unit `calendar.spec.ts` DAY_HIDDEN ×2 (past-open omitted, today included), unit `calendar-step.component.spec.ts` DAY_HIDDEN ×2 (past-open, closed-weekday), e2e "[P1] closed weekday is absent from the calendar" |
| MONTH_NAV | unit `calendar.spec.ts` MONTH_NAV zero-selectable-days month, unit `calendar-step.component.spec.ts` MONTH_NAV ([P0] prev disabled on current month, [P1] grid rebuilds), e2e "[P1] …navigation still works" |
| TZ_TODAY_BOUNDARY | unit `calendar.spec.ts` zonedToday TZ_BOUNDARY (fixed `now` at 2026-08-20T23:30Z London/NY boundary), unit `calendar-step.component.spec.ts` TZ_BOUNDARY device-clock independence |

**Verification evidence:** `npm test -- --watch=false` → 26 files / 227 tests passing after review round 1 patches (incl. every matrix row above); `npm run lint` → clean; `npm run build` → production build succeeds (new code in 18 kB lazy booking chunk); Playwright `public-booking-page.spec.ts` → 6/6 pass (3 pre-existing landing tests + 3 new booking-flow tests).

## Design Notes

Onboarding uses URL-per-step because state persists server-side; booking selections are ephemeral until final submit (2.4), so one signal service avoids guard/URL plumbing while keeping components small.

Timezone safety — never device-local getters for "today"/weekday:

```ts
const iso = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
const wd = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(now); // Mon..Sun → 1..7
const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // cell weekday: ((dow + 6) % 7) + 1
```

Accent mapping follows 2-1: selected fills use `var(--osef-brand-primary)` (same as `book-button`).

## Verification

**Commands:**
- `npm test` -- expected: all suites pass incl. calendar util, both step components, updated booking-page spec (every matrix row covered).
- `npm run lint` -- expected: clean.
- `npm run build` -- expected: production build succeeds.
- `npx playwright test e2e/tests/public-booking-page.spec.ts` -- expected: existing 3 tests + new scenarios pass against emulators.

## Suggested Review Order

**Flow state machine**

- Entry point: signal-based step machine reused by Stories 2.3–2.5
  [`booking-flow.service.ts:10`](../../src/booking/services/booking-flow.service.ts#L10)

- Back preserves selections — the BACK_PRESERVES contract
  [`booking-flow.service.ts:33`](../../src/booking/services/booking-flow.service.ts#L33)

**Calendar core (pure, SSR-safe)**

- "Today"/weekday from restaurant timezone via Intl; UTC fallback on bad zones
  [`calendar.ts:36`](../../src/booking/utils/calendar.ts#L36)

- Open-day lookup: missing key = closed
  [`calendar.ts:53`](../../src/booking/utils/calendar.ts#L53)

- Month grid omits closed/past days entirely — hidden-not-grayed invariant
  [`calendar.ts:62`](../../src/booking/utils/calendar.ts#L62)

**Step UI**

- 2×4 circular grid, single-select, auto-advance
  [`party-size-step.component.html:22`](../../src/booking/steps/party-size-step/party-size-step.component.html#L22)

- Weekday header row + month nav with prev disabled on current month
  [`calendar-step.component.html:38`](../../src/booking/steps/calendar-step/calendar-step.component.html#L38)

- Empty-month message per human decision; forward nav intentionally unbounded
  [`calendar-step.component.html:59`](../../src/booking/steps/calendar-step/calendar-step.component.html#L59)

**Orchestration & accessibility**

- "Step N of 6" live-region announcement map
  [`booking-page.component.ts:63`](../../src/booking/pages/booking-page/booking-page.component.ts#L63)

- Effects: flow reset on restaurant change, focus targets per transition
  [`booking-page.component.ts:99`](../../src/booking/pages/booking-page/booking-page.component.ts#L99)

- @switch shell rendering the active step
  [`booking-page.component.html:42`](../../src/booking/pages/booking-page/booking-page.component.html#L42)

- Time-slot stub — deliberately minimal, replaced by Story 2.3
  [`booking-page.component.html:84`](../../src/booking/pages/booking-page/booking-page.component.html#L84)

**E2E proof & fixtures**

- P0 full flow + P1 back-preserves and closed-weekday-absent
  [`public-booking-page.spec.ts:78`](../../e2e/tests/public-booking-page.spec.ts#L78)

- Hours re-keyed to 1=Mon..7=Sun (was JS 0-indexed — silent mismatch)
  [`factories.ts:13`](../../e2e/fixtures/factories.ts#L13)

- e2e base URL env override (local port-squat workaround, default unchanged)
  [`playwright.config.ts:7`](../../playwright.config.ts#L7)
