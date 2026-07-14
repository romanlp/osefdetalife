---
name: Bookable
status: final
sources:
  - {planning_artifacts}/prds/prd-osefdetalife-2026-07-12/prd.md
  - {planning_artifacts}/architecture/architecture-osefdetalife-2026-07-12/ARCHITECTURE-SPINE.md
updated: 2026-07-14
---

# Bookable — Experience Spine

## Foundation

Two-surface product: a diner-facing booking widget (Web Component, Shadow DOM, mobile-first) and a restaurant-facing management dashboard (Angular SPA, desktop-first). Dark mode supported from day one. `DESIGN.md` is the visual identity reference; this spine is the experience.

The widget is embedded on restaurant websites via script tag. It renders in isolation (Shadow DOM) with restaurant-specific colors. The dashboard is a standalone Angular app hosted on Firebase Hosting. Onboarding is required before dashboard access.

## Information Architecture

### Widget

| Surface | Reached from | Purpose |
|---|---|---|
| Landing | Embed code on restaurant site | Restaurant name + "Book a Table" CTA |
| Party Size | Landing → "Book a Table" | Select 1-8 guests |
| Date | Party Size → selection | Pick an open date |
| Time | Date → selection | Pick a 15-min slot |
| Details | Time → selection | Name, email, optional custom field |
| Confirmation | Details → submit | Booking summary, success |

All steps except Landing show a back button. Selections preserved on back navigation. Loading spinner on step transitions.

### Dashboard

| Surface | Reached from | Purpose |
|---|---|---|
| Login | App entry | Email/password or Google sign-in |
| Onboarding | First login | 3-step guided setup |
| Bookings | Sidebar → Bookings | Today's bookings, date picker |
| Restaurant Info | Sidebar → Info | Name, address, timezone |
| Opening Hours | Sidebar → Hours | Weekly schedule |
| Table Groups | Sidebar → Tables | Add, edit, delete table groups |
| White Label | Sidebar → Branding | Primary/secondary colors, custom field |
| Account | Sidebar → Account | Change password, sign out |
| Deploy | Sidebar → Deploy | Embed code, demo page link |

Sidebar nav (240px). Active item: sage left border. Collapses to icons on narrow viewports.

### Onboarding (3 steps)

| Step | Content | Required |
|---|---|---|
| 1. Basics | Restaurant name, slug (auto-generated, editable), address | Yes |
| 2. Availability | Opening hours (weekly schedule), table groups (capacity + count) | Yes |
| 3. Branding | Primary color, secondary color, custom field (label, required, enabled) | Optional — skip allowed |

After completion: redirect to Deploy page showing embed code. Onboarding skipped if restaurant profile already exists.

## Voice and Tone

Microcopy. Brand voice and aesthetic posture live in `DESIGN.md`.

| Context | Do | Don't |
|---|---|---|
| Widget landing | "Book a Table" | "Reserve your spot now!" |
| Empty slots | "No available times for this date" | "Sorry, we're fully booked!" |
| Error | "Something went wrong. Please try again." | "Error 500: Internal Server Error" |
| Invalid slug | "Restaurant not found" | "The restaurant you're looking for doesn't exist." |
| Dashboard empty | "No bookings for this date" | "No data available" |
| Onboarding | "Let's set up your restaurant" | "Welcome to the onboarding wizard!" |
| Confirmation | "You're all set." | "Your booking has been successfully confirmed!" |

Short, complete sentences. No exclamation marks. No corporate enthusiasm.

## Component Patterns

Behavioral. Visual specs live in `DESIGN.md.Components`.

| Component | Use | Behavioral rules |
|---|---|---|
| Widget container | All widget steps | Fixed min 375px. Restaurant colors applied via CSS custom properties. Shadow DOM isolation. |
| Back button | Steps 2-6 | Left-aligned arrow. Preserves all selections. Hidden on landing. |
| Party size grid | Step 2 | 2×4 grid of circular buttons. Single select. Tap to select, tap again to deselect not allowed — must select to proceed. |
| Date calendar | Step 3 | Month view. Only open days selectable (per restaurant hours). Closed days hidden entirely (not grayed out). |
| Time slot pills | Step 4 | Horizontal scroll container. 15-min increments within open hours. Single select. |
| Details form | Step 5 | Stacked inputs: name (required), email (required), custom field (optional, restaurant-defined label). Validate on submit, not on blur. |
| Confirmation | Step 6 | Checkmark icon (sage), date/time/party summary, "You're all set." message. No action buttons — flow complete. |
| Dashboard sidebar | Dashboard | 240px fixed. Nav items: icon + label. Active: sage left border. Sign out at bottom. |
| Booking row | Bookings list | Time, party size, diner name, custom field value. Hairline separator. No actions (read-only). |
| Date picker | Bookings list | Above booking list. "Today" button returns to current date. |
| Onboarding card | Onboarding | Centered, max 480px. Step number + title, form content, primary CTA. "Skip" link for optional steps. |

## State Patterns

| State | Surface | Treatment |
|---|---|---|
| Widget loading | All steps | Spinner centered. No skeleton — steps are simple enough. |
| No availability | Time step | "No available times for this date." Suggest trying another date. |
| Invalid slug | Widget | "Restaurant not found." No retry — slug is wrong. |
| Firebase error | Widget | "Something went wrong. Please try again." Retry button. |
| Dashboard empty | Bookings list | "No bookings for this date." Neutral, not apologetic. |
| Onboarding complete | Deploy page | Embed code block with copy button. Link to demo page. |
| No table groups | Onboarding step 2 | "Add at least one table group to continue." Primary CTA disabled until valid. |
| No hours configured | Onboarding step 2 | "Set your opening hours to continue." At least one day open required. |
| Dark mode | All surfaces | Palette swaps per `DESIGN.md` dark tokens. No transition animation — instant swap. |

## Interaction Primitives

**Widget (touch-first):**
- Tap to select party size, date, time.
- Tap to proceed (primary CTA).
- Tap back arrow to return.
- Scroll horizontally on time slots.
- No swipe gestures (Shadow DOM isolation).
- No long-press.

**Dashboard (mouse + keyboard):**
- Click sidebar nav to switch sections.
- Click date picker to navigate dates.
- Tab through form inputs.
- Enter to submit forms.
- No drag-and-drop (MVP).
- No keyboard shortcuts beyond standard browser.

**Banned:** carousels, hero animations on open, badge counts, push notifications, infinite scroll (pagination only), hover-only affordances.

## Accessibility Floor

Behavioral. Visual contrast lives in `DESIGN.md`.

- WCAG 2.1 AA across both surfaces.
- Focus management: widget step transitions move focus to new step heading. Tab order follows reading order.
- Screen reader announces step changes: "Step 2 of 6: Party Size."
- Color contrast: all text meets 4.5:1 against its background (verified in `DESIGN.md` tokens).
- Tap targets ≥ 44px (widget) / 48px (dashboard).
- Form inputs have associated labels (not placeholder-only).
- Error messages associated with inputs via `aria-describedby`.
- Reduce Motion: skip step transition animations; show content immediately.
- Dark mode: all contrast ratios re-verified against dark tokens.

## Inspiration & Anti-patterns

- **Lifted from Airbnb:** clean booking flow, minimal chrome, smooth step transitions, clear CTAs, trust signals.
- **Lifted from Linear:** sidebar nav pattern, keyboard-friendly dashboard.
- **Rejected — Complex table maps:** table groups are the right abstraction for small restaurants. Visual maps add complexity without value at this scale.
- **Rejected — Per-cover pricing UI:** no booking volume metrics, no commission tracking. Flat fee means the dashboard stays simple.
- **Rejected — Multi-step onboarding with 7+ steps:** condensed to 3 steps. Get the restaurant live fast, let them customize later.
- **Rejected — Diner authentication:** diners book without accounts. Auth adds friction to the booking flow.

## Key Flows

### Flow 1 — Diner books a table (Alex, Tuesday evening, on restaurant's website)

1. Alex visits the restaurant's website.
2. Widget renders on the page: restaurant name, "Book a Table" button.
3. Alex taps "Book a Table."
4. Party size selector appears: Alex taps "4."
5. Calendar appears: Alex taps Friday the 18th.
6. Time slots appear: Alex taps "19:00."
7. Details form appears: Alex enters name and email.
8. Alex taps "Confirm Booking."
9. **Climax:** Confirmation screen: "You're all set." Alex sees the booking details — date, time, party of 4. The table is reserved.

Failure: no availability for 4 on Friday → "No available times for this date." Alex tries Saturday — slots appear.

### Flow 2 — Restaurant owner sets up (Maria, Monday morning, first time)

1. Maria signs up with email/password.
2. Onboarding card appears: "Let's set up your restaurant."
3. Step 1: Maria enters restaurant name "La Trattoria." Slug auto-generates: "la-trattoria." She tweaks it to "la-trattoria-london." Address optional — she skips.
4. Step 2: Maria sets hours (Mon-Sat 17:00-22:00, Sun closed). Adds table groups: "2 × two-tops, 3 × four-tops, 1 × six-top."
5. Step 3: Branding — she picks colors (or skips, uses defaults). Adds custom field: "Dietary requirements" (optional).
6. **Climax:** Deploy page shows embed code. Maria copies it and pastes into her WordPress site. Widget is live.
7. Maria opens the dashboard. Empty booking list: "No bookings for this date." She's ready.

### Flow 3 — Restaurant owner checks today's bookings (Maria, Saturday afternoon)

1. Maria opens the dashboard.
2. Bookings tab loads: today's date selected by default.
3. She sees 5 bookings: 18:00 (2 guests), 18:30 (4 guests), 19:00 (6 guests), 19:15 (2 guests), 19:30 (4 guests).
4. She taps the date picker to check tomorrow — 3 bookings.
5. She taps "Today" to return.
6. **Climax:** Maria knows exactly what to expect for tonight's service. She closes the dashboard.

Failure: Firebase temporarily down → error message with retry. Maria tries again in a minute.
