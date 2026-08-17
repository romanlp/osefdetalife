# Epic 2 Context: Public Booking Journey

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Diners can book a table through a first-party public booking page at `/book/{slug}` — no account required. The page is white-labeled to the restaurant's brand and walks the diner through a linear flow: landing → party size → date → time → details → confirmation. Booking is auto-confirmed on submission and creates an availability record the dashboard reflects in real time.

## Stories

- Story 2.1: Public Booking Page Foundation & Landing
- Story 2.2: Party Size & Date Selection
- Story 2.3: Time Slot Selection & Availability
- Story 2.4: Details Form & Booking Submission
- Story 2.5: Navigation, Loading & Error Handling

## Requirements & Constraints

- Booking page renders at `/book/{slug}` and is fully white-labeled — restaurant colors applied via CSS custom properties, no platform branding visible to diners.
- Landing shows the restaurant name and address (only if configured) plus a "Book a Table" button.
- Party size is a required single-select of 1–8 before proceeding.
- Calendar shows only dates the restaurant is open; closed dates are hidden entirely, and selection is limited to today and future dates.
- Time picker shows available 15-minute slots for the chosen party size and date; "No available times for this date" when none exist.
- Details form: name (required), email (required, format validated), optional custom field with restaurant-defined label — hidden entirely if the restaurant hasn't configured it. Validation runs on submit, not on blur.
- Submission creates a booking in Firestore with status `confirmed`, then shows a confirmation screen (date, time, party size, "You're all set.") with no further actions.
- Back navigation on every step except landing; all previous selections preserved.
- Loading spinner during step transitions and data fetches.
- Invalid slug → "Restaurant not found" (no retry). Firebase failure → "Something went wrong. Please try again." with a retry button.
- Booking page is responsive and full-viewport width.
- All availability and booking operations run directly against Firestore from the browser; Firestore Security Rules are the sole access-control layer.
- Each booking carries a configurable `duration` (default 2 hours) and occupies its table for that whole window when availability is computed.
- All dates and times live in the restaurant's configured IANA timezone; the page converts the diner's local time to the restaurant's timezone before querying.
- No table splitting: a party of N requires one table of capacity ≥ N.
- Non-functional targets for this epic: page load < 2s, booking completion rate > 80%, and WCAG 2.1 AA accessibility.

## Technical Decisions

- Booking flow order is fixed: party size → date → time → details → confirmation (no date-first).
- Availability is computed on read, never pre-computed: query the day's bookings, subtract from the restaurant's table groups, generate the remaining 15-minute slots within opening hours.
- Bookings store `date`, `time`, `partySize`, `name`, `email`, `customFieldValue`, `status`, `createdAt`, `duration` (PII included).
- A non-PII public projection (`date`, `time`, `partySize`, `status`) is written in the same batch as every booking so the public page can compute availability without exposing diner data; Security Rules reject PII fields on the projection and allow unauthenticated reads of it while full bookings remain owner-only-readable.
- Security Rules permit unauthenticated booking creation only, validating required fields, that status is `confirmed`, and that the referenced restaurant exists; updates/deletes are blocked (owner cancellation is the sole exception).
- Date storage uses ISO `YYYY-MM-DD`; time storage uses 24-hour `HH:mm`; display uses locale-formatted date and 12-hour time. Status values are lowercase `confirmed`/`cancelled`.
- The booking page is a first-party route within the single Angular app (no embed/iframe or external package); it was re-scoped from a widget on 2026-08-14.

## UX & Interaction Patterns

- White-label theming via CSS custom properties (restaurant primary/secondary colors as accent fills).
- Party size: 2×4 grid of circular buttons; selected state uses accent fill with white text; selection auto-advances.
- Calendar: minimal month grid; selected date highlighted with accent fill; auto-advance on selection.
- Time slots: horizontally scrollable pills at 15-minute increments; selected slot highlighted with accent fill; auto-advance on selection.
- Details form: stacked inputs with labels above, hairline borders, 8px radius.
- Confirmation: centered checkmark icon, booking summary, "You're all set." message, no action buttons.
- Step transitions: smooth fade/slide; skipped under Reduce Motion. Focus moves to the new step heading and screen readers announce "Step N of 6: {Step Name}".
- Voice: short complete sentences, no exclamation marks, no corporate enthusiasm (e.g., "Book a Table", not "Reserve your spot now!").
- Tap targets ≥ 44px; all text meets WCAG 2.1 AA contrast; form inputs have real labels and errors are wired via `aria-describedby`.
- Warm minimal aesthetic: Inter font (700 headings / 400 body / 500 meta), 4–48px spacing scale, 12px card radius, subtle card shadow, dark mode supported from day one.

## Cross-Story Dependencies

- Depends on Epic 1: restaurant profile, opening hours, table groups, and the slug→restaurant mapping must exist and be publicly readable, and the public-projection security rules must be deployed, before booking can work.
- Booking creation here feeds Epic 3's real-time dashboard bookings list.
- The Epic 1 in-app booking-page preview renders this same flow, so the booking page must function when embedded within the dashboard.
