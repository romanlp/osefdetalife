# Epic 3 Context: Restaurant Dashboard & Management

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Turn the existing dashboard shell into the restaurant owner's working surface: a live view of bookings for service prep, plus settings for every piece of restaurant configuration. Settings changes write straight back to the restaurant profile, so the public booking page reflects them immediately — one source of truth drives both owner-facing and diner-facing surfaces.

## Stories

- Story 3.1: Dashboard Shell Polish — Sign Out, Responsive, Styling
- Story 3.2: Bookings List & Date Picker
- Story 3.3: Restaurant Info Settings
- Story 3.4: Opening Hours Settings
- Story 3.5: Table Groups Settings
- Story 3.6: White Label & Custom Field Settings
- Story 3.7: Account Settings

## Requirements & Constraints

- **Bookings list** — Defaults to today; date picker above the list plus a "Today" shortcut. Rows show time (12-hour display), party size, diner name, and custom field value when configured; time-sorted, hairline dividers, no actions (read-only for MVP). Empty dates show "No bookings for this date" with the picker still usable. New bookings appear without refresh and must not disturb scroll position.
- **Restaurant info** — Name required and validated non-empty (save blocked otherwise); address optional; timezone an IANA dropdown defaulting to UTC. Edits save on blur or Enter with a confirmation message. Timezone changes update every time-related display.
- **Opening hours** — Weekly Monday–Sunday schedule with a per-day open/closed toggle that hides the time inputs; at least one day open. Saving updates the booking page calendar.
- **Table groups** — Add, edit, delete groups of capacity + count (positive integers, at least one required). Deletion is confirmed, preserves existing bookings at that capacity, blocks new ones. Availability recalculates on change.
- **White label** — Hex pickers for primary and secondary colors with a live booking-page preview. Custom field has label, required, enabled controls; disabling hides it on the booking page but preserves label and required settings.
- **Account** — Password change requires the current password and passes strength validation; a wrong current password errors without changing anything. Sign out ends the Firebase Auth session and returns to the login page.
- **Accessibility & quality** — WCAG 2.1 AA, 4.5:1 contrast, dashboard tap targets ≥ 48px, labels associated with inputs, errors linked via `aria-describedby`, full keyboard operation, dark mode re-verified against dark tokens, security rules enforcing all access control.
- **Non-goals** — Booking confirm/cancel actions, analytics or booking-volume metrics, visual table maps, drag-and-drop, badge counts, infinite scroll.

## Technical Decisions

- **Single Angular app** (Angular 22+, standalone components, signals). Dashboard code under `src/dashboard/`; shared types and Firebase init in `src/shared/`.
- **Direct Firebase from the browser** — Firestore and Auth via client SDK. No API layer, no Cloud Functions; Firestore Security Rules are the only access control, and dashboard-facing and booking-page-facing rule sets must be authored together.
- **Data model** — The restaurant document holds name, slug, timezone, hours, tableGroups, whiteLabel, customField. The booking document holds date, time, duration, partySize, dinerName, dinerEmail, customFieldValue, status.
- **PII split** — Full booking documents carry diner PII and are owner-only readable. A non-PII projection subcollection is written in the same batch so unauthenticated availability reads work. Any owner-side write must keep both consistent.
- **Storage conventions** — Dates ISO `YYYY-MM-DD`; times stored `HH:mm`, displayed 12-hour; Firestore server timestamps; lowercase status strings. Table groups are an array of `{capacity, count}`; hours a record keyed by ISO day number (1 = Monday … 7 = Sunday). Status supports `confirmed` and `cancelled` though the UI exposes neither.
- **Compute-on-read availability** — Derived at query time from table groups minus bookings, 15-minute increments, shared with the booking page. No pre-computed slots.
- **One restaurant per account** — multi-location deferred, so settings always scope to the signed-in owner's restaurant.
- **White-label theming is CSS custom properties on the booking page only** — the dashboard always uses the platform neutral palette.
- **Errors** — toasts for transient failures, console logging for debug.

## UX & Interaction Patterns

**Visual language ("Bookable").** Warm minimal — quiet confidence, earthy tones, generous whitespace, nothing decorative. Warm linen canvas, white raised surface, ink for primary text and primary button fill, muted grey for secondary text and labels, sage green as the *only* chromatic color (success, secondary button, active nav indicator, tags), hairline borders between surfaces, error red reserved for destructive and error states. Inter or system stack: 700 headings, 400 body, 500 meta. Spacing scale 4/8/12/16/24/32/48; radii 8px inputs, 12px cards and buttons, 16px modals. Depth is tone plus a hairline border and one barely-visible card shadow, max two levels. No gradients, no pills, no perfect circles.

**Dark mode is designed in, not bolted on.** The palette inverts to deep ink canvas, warm dark raised surface, linen text, brighter sage accent, darker hairline. Token swap is instant with no transition.

**Layout.** 240px fixed left sidebar, icon + label nav items, active item marked by a sage left border, sign-out at the bottom; main content single-column filling the rest. Under 768px the sidebar collapses to icons only, main area takes the full width, and each item needs a tooltip or accessible name.

**Components.** Booking row: time, party size, name, custom field, hairline separator, no actions. Date picker above the list with a "Today" button. Color picker as a hex input beside a native swatch. Dashboard CTAs are black — colored CTAs are reserved for the booking page.

**Interaction and voice.** Mouse and keyboard first: click nav to switch sections, click the picker to navigate dates, tab through inputs, Enter to submit. No drag-and-drop, custom shortcuts, or hover-only affordances. Microcopy is short complete sentences, no exclamation marks, no corporate enthusiasm. Loading is a centered spinner. Empty states always carry guidance.

## Cross-Story Dependencies

- **3.1 is a scope boundary, not a rebuild.** The shell and sidebar shipped with Epic 1; 3.1 adds sign-out, narrow-viewport collapse, the styling pass, and nav wiring. It must not re-implement the shell or restate the existing sidebar criteria.
- **3.1 gates 3.2–3.7.** Nav items link to routes the later stories create, and active state must track the current section. Labels are fixed: Bookings, Info, Hours, Tables, Branding, Booking Link, Account.
- **"Booking Link" replaces a former Deploy/embed entry** after the first-party booking page pivot — the booking page is a shareable route with a QR code, so no dashboard surface produces embeddable code.
- **3.2 depends on Epic 2's write path** — real-time rows only work if the booking page writes the full booking and its public projection together.
- **3.3–3.6 write the same restaurant profile the onboarding wizard populated**, and every save must surface on the public booking page (address, calendar dates, colors, custom field). Verify end to end.
- **3.5 and Epic 2 share compute-on-read availability**, so a table-group change must yield the same result the booking page would.
- **Sign-out appears in two places** (sidebar and Account) but is one behavior — implement it once.
- **Security rules span epics.** Full bookings stay owner-only-readable while the projection is public, so any dashboard write touching bookings must respect that split.