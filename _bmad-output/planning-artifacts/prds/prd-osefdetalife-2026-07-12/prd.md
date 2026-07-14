---
title: Restaurant Booking Platform
created: 2026-07-12
updated: 2026-07-13
---

# PRD: Restaurant Booking Platform
*Working title — confirm.*

## 0. Document Purpose
This PRD is for the product manager, architect, and downstream workflow owners (UX, dev, QA). It's structured with Glossary-anchored vocabulary, features grouped with FRs nested, assumptions tagged inline and indexed. This PRD builds on the Product Brief and Architecture Spine, it does not duplicate them.

## 1. Vision
A white-label, embeddable booking widget for small independent restaurants in the United Kingdom. The widget renders on the restaurant's own website via a script tag, letting diners book tables without leaving the restaurant's site. Restaurants manage bookings from a simple Angular dashboard.

The platform targets small restaurants (~50 covers) who want to take online bookings without paying per-cover commissions to platforms like OpenTable. A flat monthly subscription fee makes costs predictable. The widget is fully white-labeled — it appears as part of the restaurant's website, with customizable colors and optional custom fields.

For MVP, the system provides: a diner-facing booking widget (landing → party size → date → time → details → confirmation), a restaurant-facing dashboard (settings + read-only booking list), and a guided onboarding flow. No integrations, no payments, no AI — just a simple, beautiful booking experience.

## 2. Target User

### 2.1 Jobs To Be Done
- **Restaurant Owner:** "I want to take online bookings without paying per-cover fees, so I can focus on cooking, not logistics."
- **Restaurant Owner:** "I want a booking widget that looks like part of my website, so diners trust the experience."
- **Restaurant Owner:** "I want to see today's bookings at a glance, so I can prepare for service."
- **Diner:** "I want to book a table quickly, without creating an account, so I can get on with my day."
- **Diner:** "I want to see available times for my party size, so I can choose what works best."

### 2.2 Non-Users (v1)
- **Multi-location chains (5+ locations):** One restaurant per account for MVP.
- **Restaurants needing POS integration:** No integrations in MVP.
- **Restaurants wanting deposit/prepayment:** No payments in MVP.
- **Diners wanting to manage existing bookings:** No cancellation/management in MVP.

### 2.3 Key User Journeys

- **UJ-1. Diner books a table via the widget.**
  - **Persona + context:** Alex, a diner visiting a restaurant's website to book dinner for 4.
  - **Entry state:** On restaurant's website, clicks "Book a Table" button.
  - **Path:** Widget opens → selects party size (4) → sees available time slots for today → selects 19:00 → fills name + email → submits.
  - **Climax:** Confirmation screen shows booking details. Diner knows the table is reserved.
  - **Resolution:** Diner receives confirmation (displayed on screen). Widget closes or stays open for another booking.
  - **Edge case:** No availability for party of 4 today. Widget shows next available date.

- **UJ-2. Restaurant owner sets up their account.**
  - **Persona + context:** Maria, a restaurant owner who wants to start taking online bookings.
  - **Entry state:** On platform website, clicks "Sign Up".
  - **Path:** Creates account (email/password or Google) → onboarding wizard guides through: restaurant name, slug, address, opening hours, table groups, colors, custom field → completes setup.
  - **Climax:** Dashboard shows empty booking list. Embed code page provides the script tag. Maria copies the code.
  - **Resolution:** Maria pastes embed code into her website. Widget is live. She can now see bookings in the dashboard.
  - **Edge case:** Maria skips optional steps (colors, custom field) and completes them later in Settings.

- **UJ-3. Restaurant owner checks today's bookings.**
  - **Persona + context:** Maria, during service prep, opens the dashboard.
  - **Entry state:** Authenticated, on dashboard.
  - **Path:** Dashboard loads → shows today's bookings by default → Maria sees list of bookings with times, party sizes, names.
  - **Climax:** Maria knows exactly what to expect for tonight's service.
  - **Resolution:** Maria closes dashboard. Bookings are confirmed, no action needed.
  - **Edge case:** No bookings today. Dashboard shows empty state with encouragement to share the widget.

## 3. Glossary
- **Table Group** — A set of identical tables (e.g., "3 × four-tops"). The basic unit for availability calculation. Cardinality: restaurant has 1+ table groups.
- **Slug** — URL-safe unique identifier for a restaurant (e.g., "the-blue-bistro"). Used in widget embed and URL resolution. One per restaurant.
- **Compute-on-Read** — Availability calculated at query time by checking existing bookings against table groups. No pre-computed slots stored.
- **15-Minute Slot** — Time granularity for available booking times (e.g., 18:00, 18:15, 18:30, 18:45).
- **White-Label** — Widget renders under restaurant's brand (colors, name) with no platform branding visible to diners.
- **Embed Code** — HTML snippet restaurant adds to their website: `<script>` tag + `<booking-widget>` custom element.
- **Onboarding Wizard** — Guided setup flow after sign up, walking restaurant through all configurable settings.
- **Restaurant Profile** — Firestore document containing restaurant metadata (name, slug, address, colors, custom field).
- **Booking Status** — Current state of a booking: `confirmed` (default) or `cancelled`. Read-only in MVP dashboard.
- **Custom Field** — Optional single text field on booking form, label defined by restaurant, enabled/disabled toggle.

## 4. Features

### 4.1 Booking Widget (Diner-Facing)
**Description:** An embeddable Web Component that renders on the restaurant's website. Diners go through a multi-step flow: landing → party size → date → time → details → confirmation. The widget is white-labeled with restaurant colors. Realizes UJ-1, UJ-3.

**Functional Requirements:**

#### FR-1: Widget Landing
Widget renders as `<booking-widget>` custom element. Shows restaurant name and address (if configured) on landing step with "Book now" button. Realizes UJ-1.

**Consequences (testable):**
- System renders as custom element via embed code.
- System displays restaurant name from restaurant profile.
- System displays address if configured (hidden if not).
- System shows "Book now" button to start booking flow.

#### FR-2: Party Size Selection
Party size selector shows options 1-8. Party size is required before proceeding. Realizes UJ-1.

**Consequences (testable):**
- System displays party size selector with values 1-8.
- System requires party size selection before proceeding to next step.
- System validates party size is a positive integer.

#### FR-3: Date Selection
Calendar shows only dates where restaurant is open (based on hours config). Closed dates are hidden. Realizes UJ-1.

**Consequences (testable):**
- System reads opening hours from restaurant profile.
- System displays calendar with only open dates.
- System hides dates when restaurant is closed.
- System limits selection to current date and future dates.

#### FR-4: Time Selection
Time picker shows available 15-minute slots for selected party size and date. If no availability, show "No availability for this date" message. Realizes UJ-1.

**Consequences (testable):**
- System queries bookings for the selected date and party size.
- System calculates availability by subtracting booked tables from table groups.
- System returns available slots in 15-minute increments within opening hours.
- System displays "No availability for this date" when no slots available.

#### FR-5: Booking Details Form
Details form shows: Name (required), Email (required), Custom field (optional, label set by restaurant). If custom field not configured, field is not visible. Realizes UJ-1.

**Consequences (testable):**
- System requires name (text input).
- System requires email (validated format).
- System shows custom field with restaurant-defined label if configured.
- System hides custom field if not configured.
- System validates all required fields before submission.

#### FR-6: Booking Submission
On submit: booking created in Firestore with status "confirmed". Confirmation screen shows summary: date, time, party size. Realizes UJ-1.

**Consequences (testable):**
- System creates booking document in Firestore with status `confirmed`.
- System displays confirmation screen with date, time, and party size.
- System shows success message.

#### FR-7: Back Navigation
Back button available on all steps except landing. Returns to previous step with selection preserved. Realizes UJ-1.

**Consequences (testable):**
- System displays back button on all steps except landing.
- System returns to previous step on back button click.
- System preserves all selections when navigating back.

#### FR-8: Loading States
Loading spinner shown during step transitions and data fetches. Realizes UJ-1.

**Consequences (testable):**
- System displays loading spinner during step transitions.
- System displays loading spinner during data fetches.
- System hides loading state when data is ready.

#### FR-9: Error Handling
Invalid slug: "Restaurant not found" message. Firebase down: "Something went wrong. Please try again." message. Realizes UJ-1.

**Consequences (testable):**
- System displays "Restaurant not found" message for invalid slug.
- System displays "Something went wrong. Please try again." message on Firebase errors.
- System allows retry on transient errors.

#### FR-10: Responsive Design
Widget adapts to mobile and desktop. Fixed width, full width of container. Realizes UJ-1.

**Consequences (testable):**
- System adapts layout for mobile and desktop screens.
- System uses fixed width within container.
- System maintains usability on touch devices.

#### FR-11: Demo Page
Project includes a standalone HTML page that embeds the widget for development and testing. Page allows entering a restaurant slug and renders the widget. Realizes UJ-1.

**Consequences (testable):**
- System provides standalone HTML page for widget testing.
- System allows entering a restaurant slug.
- System renders widget with the entered slug.

### 4.2 Restaurant Dashboard (Restaurant-Facing)
**Description:** An Angular web app where restaurant owners manage settings and view bookings. Dashboard shows today's bookings by default with a date picker to navigate. Settings pages allow configuration of restaurant info, table groups, white-label colors, and account. Realizes UJ-2, UJ-3.

**Functional Requirements:**

#### Dashboard Home

##### FR-12: View Today's Bookings
Dashboard home shows list of bookings for today. Each booking shows: time, party size, diner name, custom field value (if configured). Realizes UJ-3.

**Consequences (testable):**
- System defaults to today's date.
- System displays list of bookings for selected date.
- System shows booking time, party size, and diner name for each booking.
- System shows custom field value if configured and provided by diner.

##### FR-13: Navigate to Other Dates
Date picker allows selecting any date. "Today" button returns to today's view. Realizes UJ-3.

**Consequences (testable):**
- System provides date picker component.
- System loads bookings for selected date.
- System provides "Today" button to return to current date.

##### FR-14: Empty State
When no bookings for selected date, show "No bookings for this date" message. Realizes UJ-3.

**Consequences (testable):**
- System displays "No bookings for this date" when no bookings exist.
- System maintains date picker usability in empty state.

##### FR-15: Real-Time Updates
Bookings appear in dashboard immediately when created via widget (no refresh required). Realizes UJ-3.

**Consequences (testable):**
- System listens for Firestore real-time updates.
- System displays new bookings without manual refresh.
- System maintains scroll position when new bookings arrive.

#### Settings — Restaurant Info

##### FR-16: Edit Restaurant Name
Restaurant owner can update restaurant name. Changes saved immediately. Realizes UJ-2.

**Consequences (testable):**
- System displays current restaurant name in text input.
- System validates name is not empty.
- System saves changes immediately on blur or enter.

##### FR-17: Configure Opening Hours
Restaurant owner can set open/close times for each day of week. Each day can be marked as closed. Weekly schedule saved as `Record<number, {open, close}>`. Realizes UJ-2.

**Consequences (testable):**
- System displays weekly schedule (Monday-Sunday).
- System allows toggle for open/closed per day.
- System allows setting open and close times for open days.
- System validates at least one day is open.
- System saves hours to Firestore.

##### FR-18: Edit Address
Restaurant owner can update address. Displayed on widget landing page. Realizes UJ-2.

**Consequences (testable):**
- System displays current address in text input.
- System allows empty address (optional).
- System saves changes immediately.

##### FR-19: Timezone
Timezone auto-assigned to UTC on creation. Editable via dropdown for future flexibility. Realizes UJ-2.

**Consequences (testable):**
- System defaults timezone to UTC on restaurant creation.
- System displays timezone dropdown with IANA timezones.
- System saves timezone to restaurant profile.

#### Settings — Table Groups

##### FR-20: Add Table Groups
Restaurant owner can add table groups by entering capacity (number) and count (number). Multiple groups supported. Realizes UJ-2.

**Consequences (testable):**
- System displays form to add capacity + count pairs.
- System allows adding multiple table groups.
- System validates capacity and count are positive integers.

##### FR-21: Edit Table Groups
Restaurant owner can edit capacity and count of existing table groups. Realizes UJ-2.

**Consequences (testable):**
- System displays current table groups with edit controls.
- System allows updating capacity and count.
- System validates changes don't break existing bookings.

##### FR-22: Delete Table Groups
Restaurant owner can delete a table group. Existing bookings for that capacity are preserved but no new bookings can be made for that capacity. Realizes UJ-2.

**Consequences (testable):**
- System displays delete button for each table group.
- System confirms deletion before executing.
- System preserves existing bookings for deleted capacity.
- System prevents new bookings for deleted capacity.

#### Settings — White Label

##### FR-23: Set Primary Color
Restaurant owner can set primary color (hex picker). Applied to widget accent elements. Realizes UJ-2.

**Consequences (testable):**
- System displays hex color picker for primary color.
- System applies primary color to widget accent elements.
- System saves color to restaurant profile.

##### FR-24: Set Secondary Color
Restaurant owner can set secondary color (hex picker). Applied to widget secondary elements. Realizes UJ-2.

**Consequences (testable):**
- System displays hex color picker for secondary color.
- System applies secondary color to widget secondary elements.
- System saves color to restaurant profile.

##### FR-25: Configure Custom Field
Restaurant owner can set: label (text), required (toggle), enabled (toggle). If disabled, field is not shown on widget. Realizes UJ-2.

**Consequences (testable):**
- System displays label input for custom field.
- System displays required toggle for custom field.
- System displays enabled toggle for custom field.
- System saves custom field config to restaurant profile.

#### Settings — Account

##### FR-26: Change Password
Restaurant owner can change password from dashboard. Requires current password confirmation. Realizes UJ-2.

**Consequences (testable):**
- System displays change password form.
- System requires current password for confirmation.
- System validates new password strength.
- System updates Firebase Auth password.

##### FR-27: Sign Out
Sign out button in header/nav. Returns to login page. Realizes UJ-2.

**Consequences (testable):**
- System displays sign out button in header or navigation.
- System signs out user from Firebase Auth.
- System redirects to login page.

### 4.3 Restaurant Onboarding
**Description:** A guided setup flow that walks restaurant owners through all configurable settings after sign up. Includes account creation (email/password or Google), onboarding wizard, and embed code deployment page. Realizes UJ-2.

**Functional Requirements:**

#### FR-28: Sign Up with Email/Password
Restaurant owner can create account with email and password. Realizes UJ-2.

**Consequences (testable):**
- System displays sign up form with email and password fields.
- System validates email format and password strength.
- System sends email verification on sign up.
- System creates Firebase Auth account.

#### FR-29: Sign Up with Google
Restaurant owner can create account via Google OAuth. Realizes UJ-2.

**Consequences (testable):**
- System displays Google sign-in button.
- System initiates Google OAuth flow.
- System creates Firebase Auth account on successful OAuth.
- System links Google account to restaurant profile.

#### FR-30: Login Page
Login page shows both sign up options. Realizes UJ-2.

**Consequences (testable):**
- System displays email/password form.
- System displays Google sign-in button.
- System provides "Forgot password" link.
- System redirects to dashboard on successful login.

#### FR-31: Guided Setup Flow
After first sign up, restaurant owner is redirected to onboarding wizard. Realizes UJ-2.

**Consequences (testable):**
- System detects first-time sign up.
- System redirects to onboarding wizard.
- System guides through all configuration steps sequentially.
- System allows skipping optional steps.

#### FR-32: Step 1 - Restaurant Name
Required step in onboarding wizard. Realizes UJ-2.

**Consequences (testable):**
- System displays text input for restaurant name.
- System validates name is not empty.
- System auto-generates slug preview (editable in next step).

#### FR-33: Step 2 - Slug
Required step in onboarding wizard. Realizes UJ-2.

**Consequences (testable):**
- System displays auto-generated slug from restaurant name.
- System allows customization of slug.
- System validates slug uniqueness in real-time.
- System formats slug: lowercase + hyphens only.

#### FR-34: Step 3 - Address
Optional step in onboarding wizard. Realizes UJ-2.

**Consequences (testable):**
- System displays text input for address.
- System allows empty address.
- System saves address to restaurant profile.

#### FR-35: Step 4 - Opening Hours
Required step in onboarding wizard. Realizes UJ-2.

**Consequences (testable):**
- System displays weekly schedule (Monday-Sunday).
- System allows toggle for open/closed per day.
- System allows setting open and close times for open days.
- System validates at least one day is open.

#### FR-36: Step 5 - Table Groups
Required step in onboarding wizard. Realizes UJ-2.

**Consequences (testable):**
- System displays form to add capacity + count pairs.
- System allows adding multiple table groups.
- System validates at least one table group exists.

#### FR-37: Step 6 - White-Label Colors
Optional step in onboarding wizard. Realizes UJ-2.

**Consequences (testable):**
- System displays color pickers for primary and secondary colors.
- System provides sensible default colors.
- System saves colors to restaurant profile.

#### FR-38: Step 7 - Custom Field
Optional step in onboarding wizard. Realizes UJ-2.

**Consequences (testable):**
- System displays label input for custom field.
- System displays required toggle for custom field.
- System displays enabled toggle for custom field.
- System defaults custom field to disabled.

#### FR-39: Skip Optional Steps
Restaurant owner can skip optional steps. Realizes UJ-2.

**Consequences (testable):**
- System allows skipping address, colors, and custom field steps.
- System completes onboarding without skipped steps.
- System allows completing skipped steps later in Settings.

#### FR-40: Onboarding Completion
After wizard completes, restaurant owner is redirected to dashboard. Realizes UJ-2.

**Consequences (testable):**
- System marks onboarding as complete in restaurant profile.
- System redirects to dashboard.
- System makes widget live with configured slug.

#### FR-41: Embed Code Page
Dashboard includes a "Deploy" page showing embed code snippet. Realizes UJ-2.

**Consequences (testable):**
- System displays embed code with script tag + custom element.
- System includes restaurant slug in embed code.
- System provides link to demo page for testing.

#### FR-42: Copy Embed Code
One-click copy button for embed code. Realizes UJ-2.

**Consequences (testable):**
- System provides copy button next to embed code.
- System copies code to clipboard on click.
- System shows confirmation message on copy.

#### FR-43: Demo Page Link
Embed code page includes link to demo page. Realizes UJ-2.

**Consequences (testable):**
- System provides link to demo page.
- System opens demo page in new tab.
- System shows widget rendering with restaurant's configuration.

### 4.4 Firebase Infrastructure
**Description:** Backend layer using Firebase services. Firestore for data storage, Firebase Auth for authentication, Security Rules for access control. Direct client-side access (no API layer). Realizes all user journeys.

**Functional Requirements:**

#### FR-44: Restaurant Profile Data Model
System stores restaurant profile in Firestore. Realizes UJ-2.

**Consequences (testable):**
- System creates document at `restaurants/{restaurantId}`.
- System stores: name, slug (unique), ownerId, address, colors, customField, createdAt.
- System enforces required fields: name, slug, ownerId.

#### FR-45: Table Groups Data Model
System stores table groups as subcollection. Realizes UJ-1, UJ-2.

**Consequences (testable):**
- System creates subcollection at `restaurants/{restaurantId}/tables/{tableId}`.
- System stores: capacity, count.
- System enforces at least one table group per restaurant.

#### FR-46: Opening Hours Data Model
System stores opening hours as field on restaurant document. Realizes UJ-1, UJ-2.

**Consequences (testable):**
- System stores hours as `Record<number, {open: string, close: string}>` on restaurant document.
- Keys are ISO day numbers (1=Monday, 7=Sunday).
- System enforces at least one day open.

#### FR-47: Bookings Data Model
System stores bookings as subcollection. Realizes UJ-1, UJ-3.

**Consequences (testable):**
- System creates subcollection at `restaurants/{restaurantId}/bookings/{bookingId}`.
- System stores: date, time, partySize, name, email, customFieldValue, status, createdAt.
- System sets default status to `confirmed`.

#### FR-48: Slug Resolution
System resolves slug to restaurant ID. Realizes UJ-1.

**Consequences (testable):**
- System stores slug mapping at `slugs/{slug}` → `{restaurantId}`.
- System creates slug document on restaurant creation.
- System enforces slug uniqueness via Firestore transaction.

#### FR-49: Security Rules - Public Read
Any user can read restaurant profile, hours, and tables. Realizes UJ-1.

**Consequences (testable):**
- System allows unauthenticated read access to restaurant profiles.
- System allows unauthenticated read access to hours and tables.
- System blocks unauthenticated write access.

#### FR-50: Security Rules - Owner Write
Authenticated owner can manage own restaurant. Realizes UJ-2.

**Consequences (testable):**
- System allows authenticated write access to own restaurant profile.
- System allows authenticated write access to own hours and tables.
- System allows authenticated write access to own bookings.
- System blocks cross-restaurant access.

#### FR-51: Security Rules - Diner Booking
Diner can create bookings without authentication. System validates document shape and restaurant existence via Firestore rules. Realizes UJ-1.

**Consequences (testable):**
- System allows unauthenticated create access to bookings.
- System validates required fields: date, time, partySize, name, email, status.
- System validates status is `"confirmed"`.
- System validates restaurantId references an existing restaurant.
- System blocks read access to bookings (owner-only for MVP).
- System blocks update/delete access to bookings.

#### FR-52: Compute-on-Read Availability
System calculates availability at query time. Realizes UJ-1.

**Consequences (testable):**
- System queries existing bookings for selected date.
- System subtracts booked tables from table groups.
- System returns available 15-minute slots.
- System handles no availability gracefully.

#### FR-53: Slug Uniqueness Enforcement
System enforces unique slugs across all restaurants. Realizes UJ-2.

**Consequences (testable):**
- System uses Firestore transaction to check slug uniqueness.
- System rejects slug if already taken.
- System allows slug change by owner.

**Feature-specific NFRs:**
- Performance: Slug lookup < 100ms.
- Security: Security Rules enforce all access control.
- Reliability: Firestore SLA 99.9%.

## 5. Non-Goals (Explicit)
- **Integrations:** Google Reserve, POS sync, delivery platforms — complexity, requires partnerships.
- **Payments:** Deposit/prepayment, Stripe integration — PCI compliance overhead, not critical for MVP.
- **AI Features:** Voice booking, chatbot, demand forecasting — future differentiation, not MVP.
- **Multi-Location:** Multiple restaurants per account, chain management — one restaurant per account for MVP.
- **Advanced Booking:** Table splitting, waitlist, walk-in management — complexity, defer to iteration 2.
- **Communication:** Email/SMS confirmations, reminders, marketing — requires email service integration.
- **Analytics:** Reporting, dashboards, insights — nice-to-have, not MVP.
- **Mobile Apps:** Native iOS/Android apps — web-first, responsive design.
- **Internationalization:** Multi-language, multi-currency — UK only for MVP.
- **Table Management:** Visual table map, drag-and-drop — table groups only for MVP.

## 6. MVP Scope

### 6.1 In Scope
- Diner-facing booking widget (Web Component, Shadow DOM)
- Restaurant-facing dashboard (Angular)
- Guided onboarding wizard
- Table groups for availability
- 15-minute time slots
- Auto-confirm bookings
- White-label customization (colors, custom field)
- Slug-based widget deployment
- Firebase backend (Firestore, Auth, Security Rules)
- Responsive design (mobile widget, desktop dashboard)
- WCAG 2.1 AA accessibility

### 6.2 Out of Scope for MVP
- Google Reserve integration — requires partnership, defer to v2.
- POS sync — requires hardware integration, defer to v2.
- Deposit/prepayment — PCI compliance overhead, defer to v2.
- Email/SMS confirmations — requires email service, defer to v2.
- Booking cancellation by diner — defer to iteration 2.
- Analytics dashboard — nice-to-have, defer to v2.
- Multi-location support — one restaurant per account for MVP.
- Visual table map — table groups only for MVP.
- Native mobile apps — web-first for MVP.
- Multi-language support — UK only for MVP.

## 7. Success Metrics

**Primary**
- **SM-1:** Widget load time < 2 seconds — validates FR-1 through FR-11.
- **SM-2:** Booking completion rate > 80% — validates FR-1 through FR-5.
- **SM-3:** Onboarding completion time < 10 minutes — validates FR-31 through FR-40.

**Secondary**
- **SM-4:** 5 restaurants embed widget in first month — validates FR-41 through FR-43.
- **SM-5:** 50 bookings per restaurant per month (steady state) — validates FR-1 through FR-5.

**Counter-metrics (do not optimize)**
- **SM-C1:** Booking volume — why this should *not* be optimized. Counterbalances SM-2 (quality over quantity).

## 8. Open Questions
1. **Booking cancellation policy:** Diner contacts restaurant directly for MVP (recommended).
2. **Max party size:** Limited to max table capacity (recommended).
3. **Booking lead time:** Up to 30 days ahead (recommended).
4. **Time slot granularity:** 15-minute slots (recommended).
5. **Max advance booking window:** 30 days (recommended).
6. **Booking confirmation:** Auto-confirm for MVP (recommended).
7. **Slug format:** Lowercase + hyphens only (recommended).
8. **Restaurant logo:** Not in MVP (recommended).

## 9. Assumptions Index
- Product name: TBD — brainstorming session planned later.
- Timeline: side project, ~30 hours to MVP, no fixed deadline.
- Pricing: monthly subscription fee (amount TBD), no per-cover commission.
- Tech stack: Angular 22+, Firebase, Web Components, Vite, TypeScript 7.x.
- Architecture: Serverless, direct Firebase from browser, no API layer.
- Target market: UK, small restaurants (~50 covers), single location or small chain (1-4 locations).
- User: Expert skill level, solo project, low budget for hosting.
- Hours: Weekly recurring schedule, no holiday overrides for MVP.
- Bookings: Diner creates booking without authentication. Diner cannot read or edit bookings for MVP. OTP-based editing deferred to v2.
