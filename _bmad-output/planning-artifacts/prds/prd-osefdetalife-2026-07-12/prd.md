---
title: Restaurant Booking Platform
created: 2026-07-12
updated: 2026-08-14
---

# PRD: Restaurant Booking Platform
*Working title — confirm.*

## 0. Document Purpose
This PRD is for the product manager, architect, and downstream workflow owners (UX, dev, QA). It's structured with Glossary-anchored vocabulary, features grouped with FRs nested, assumptions tagged inline and indexed. This PRD builds on the Product Brief and Architecture Spine, it does not duplicate them.

## 1. Vision
A white-label public booking page for small independent restaurants in the United Kingdom. Each restaurant gets a first-party public booking page at `/book/{slug}`, letting diners book tables directly on the platform. Restaurants manage bookings from a simple Angular dashboard.

The platform targets small restaurants (~50 covers) who want to take online bookings without paying per-cover commissions to platforms like OpenTable. A flat monthly subscription fee makes costs predictable. The public booking page is fully white-labeled — it carries the restaurant's brand with customizable colors and optional custom fields.

For MVP, the system provides: a diner-facing public booking page (landing → party size → date → time → details → confirmation), a restaurant-facing dashboard (settings + read-only booking list), and a guided onboarding flow. No integrations, no payments, no AI — just a simple, beautiful booking experience.

## 2. Target User

### 2.1 Jobs To Be Done
- **Restaurant Owner:** "I want to take online bookings without paying per-cover fees, so I can focus on cooking, not logistics."
- **Restaurant Owner:** "I want a public booking page that carries my brand, so diners trust the experience."
- **Restaurant Owner:** "I want to see today's bookings at a glance, so I can prepare for service."
- **Diner:** "I want to book a table quickly, without creating an account, so I can get on with my day."
- **Diner:** "I want to see available times for my party size, so I can choose what works best."

### 2.2 Non-Users (v1)
- **Multi-location chains (5+ locations):** One restaurant per account for MVP.
- **Restaurants needing POS integration:** No integrations in MVP.
- **Restaurants wanting deposit/prepayment:** No payments in MVP.
- **Diners wanting to manage existing bookings:** No cancellation/management in MVP.

### 2.3 Key User Journeys

- **UJ-1. Diner books a table via the public booking page.**
  - **Persona + context:** Alex, a diner opening a restaurant's booking link to book dinner for 4.
  - **Entry state:** Opens the shared booking link to the restaurant's public booking page at `/book/{slug}`.
  - **Path:** Booking page opens → selects party size (4) → picks today's date → sees available time slots for that date → selects 19:00 → fills name + email → submits.
  - **Climax:** Confirmation screen shows booking details. Diner knows the table is reserved.
  - **Resolution:** Diner receives confirmation (displayed on screen). Page stays open for another booking.
  - **Edge case:** No availability for party of 4 today. Booking page shows next available date.

- **UJ-2. Restaurant owner sets up their account.**
  - **Persona + context:** Maria, a restaurant owner who wants to start taking online bookings.
  - **Entry state:** On platform website, clicks "Sign Up".
  - **Path:** Creates account (email/password or Google) → onboarding wizard guides through: restaurant name, slug, address, opening hours, table groups, colors, custom field → completes setup.
  - **Climax:** Dashboard shows empty booking list. Booking link page shows the restaurant's booking link and QR code. Maria copies the link.
  - **Resolution:** Maria shares her booking link with diners. The public booking page is live at `/book/{slug}`. She can now see bookings in the dashboard.
  - **Edge case:** Maria skips optional steps (colors, custom field) and completes them later in Settings.

- **UJ-3. Restaurant owner checks today's bookings.**
  - **Persona + context:** Maria, during service prep, opens the dashboard.
  - **Entry state:** Authenticated, on dashboard.
  - **Path:** Dashboard loads → shows today's bookings by default → Maria sees list of bookings with times, party sizes, names.
  - **Climax:** Maria knows exactly what to expect for tonight's service.
  - **Resolution:** Maria closes dashboard. Bookings are confirmed, no action needed.
  - **Edge case:** No bookings today. Dashboard shows empty state with encouragement to share the booking link.

## 3. Glossary
- **Table Group** — A set of identical tables (e.g., "3 × four-tops"). The basic unit for availability calculation. Cardinality: restaurant has 1+ table groups.
- **Slug** — URL-safe unique identifier for a restaurant (e.g., "the-blue-bistro"). Used in the public booking page URL (`/book/{slug}`) and URL resolution. One per restaurant.
- **Compute-on-Read** — Availability calculated at query time by checking existing bookings against table groups. No pre-computed slots stored.
- **15-Minute Slot** — Time granularity for available booking times (e.g., 18:00, 18:15, 18:30, 18:45).
- **White-Label** — Public booking page renders under restaurant's brand (colors, name) with no platform branding visible to diners.
- **Booking Link** — Shareable URL to a restaurant's public booking page at `/book/{slug}`, paired with a QR code. Diners open the link to book directly on the platform.
- **Onboarding Wizard** — Guided setup flow after sign up, walking restaurant through all configurable settings.
- **Restaurant Profile** — Firestore document containing restaurant metadata (name, slug, address, colors, custom field).
- **Booking Status** — Current state of a booking: `confirmed` (default) or `cancelled`. Read-only in MVP dashboard.
- **Custom Field** — Optional single text field on booking form, label defined by restaurant, enabled/disabled toggle.

## 4. Features

### 4.1 Public Booking Page (Diner-Facing)
**Description:** A first-party public booking page that renders at `/book/{slug}`. Diners go through a multi-step flow: landing → party size → date → time → details → confirmation. The booking page is white-labeled with restaurant colors. Realizes UJ-1.

**Functional Requirements:**

#### FR-1: Booking Page Landing
Booking page renders at `/book/{slug}`. Shows restaurant name and address (if configured) on landing step with "Book a Table" button. Realizes UJ-1.

**Consequences (testable):**
- System renders the public booking page at `/book/{slug}`.
- System displays restaurant name from restaurant profile.
- System displays address if configured (hidden if not).
- System shows "Book a Table" button to start booking flow.

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
Time picker shows available 15-minute slots for selected party size and date. If no availability, show "No available times for this date" message. Realizes UJ-1.

**Consequences (testable):**
- System queries bookings for the selected date and party size.
- System calculates availability by subtracting booked tables from table groups.
- System returns available slots in 15-minute increments within opening hours.
- System displays "No available times for this date" when no slots available.

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
Booking page adapts to mobile and desktop. Full viewport width. Realizes UJ-1.

**Consequences (testable):**
- System adapts layout for mobile and desktop screens.
- System uses full viewport width.
- System maintains usability on touch devices.

#### FR-11: In-App Preview
Dashboard includes an in-app preview of the booking page. Preview renders the booking page for the restaurant's slug. Realizes UJ-1.

**Consequences (testable):**
- System provides an in-app preview of the booking page.
- System allows previewing the booking page for a restaurant slug.
- System renders the booking page with the restaurant's configuration.

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
Bookings appear in dashboard immediately when created via the public booking page (no refresh required). Realizes UJ-3.

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
Restaurant owner can update address. Displayed on the booking page landing step. Realizes UJ-2.

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
Restaurant owner can set primary color (hex picker). Applied to booking page accent elements. Realizes UJ-2.

**Consequences (testable):**
- System displays hex color picker for primary color.
- System applies primary color to booking page accent elements.
- System saves color to restaurant profile.

##### FR-24: Set Secondary Color
Restaurant owner can set secondary color (hex picker). Applied to booking page secondary elements. Realizes UJ-2.

**Consequences (testable):**
- System displays hex color picker for secondary color.
- System applies secondary color to booking page secondary elements.
- System saves color to restaurant profile.

##### FR-25: Configure Custom Field
Restaurant owner can set: label (text), required (toggle), enabled (toggle). If disabled, field is not shown on the booking page. Realizes UJ-2.

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
**Description:** A guided setup flow that walks restaurant owners through all configurable settings after sign up. Includes account creation (email/password or Google), onboarding wizard, and booking link deployment page. Realizes UJ-2.

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
- System makes the public booking page live at `/book/{slug}`.

#### FR-41: Booking Link Page
Dashboard includes a "Booking Link" page showing the restaurant's booking link and QR code. Realizes UJ-2.

**Consequences (testable):**
- System displays the booking link for the restaurant's slug.
- System includes the restaurant slug in the booking link.
- System provides a link to preview the booking page.

#### FR-42: Copy Booking Link
One-click copy button for the booking link. Realizes UJ-2.

**Consequences (testable):**
- System provides copy button next to the booking link.
- System copies the link to clipboard on click.
- System shows confirmation message on copy.

#### FR-43: Preview Booking Page
Booking link page includes an in-app preview of the booking page. Realizes UJ-2.

**Consequences (testable):**
- System provides an in-app preview of the booking page.
- System opens the preview within the dashboard.
- System shows the booking page rendering with restaurant's configuration.

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
- System also creates a non-PII public projection at `restaurants/{restaurantId}/bookings-public/{bookingId}` (date, time, partySize, status) in the same batch (AD-14), so the public booking page can compute availability without exposing diner PII.

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
- System blocks read access to full bookings (owner-only — these documents hold diner PII).
- System allows unauthenticated read of the non-PII `bookings-public` projection for the public booking page's availability calculation (AD-14).
- System blocks update/delete access to bookings (except owner cancellation).

#### FR-52: Compute-on-Read Availability
System calculates availability at query time. Realizes UJ-1.

**Consequences (testable):**
- System queries the public `bookings-public` projection (non-PII: date, time, partySize, status) for selected date.
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
- Diner-facing public booking page (`/book/{slug}`)
- Restaurant-facing dashboard (Angular)
- Guided onboarding wizard
- Table groups for availability
- 15-minute time slots
- Auto-confirm bookings
- White-label customization (colors, custom field)
- Slug-based booking page deployment
- Firebase backend (Firestore, Auth, Security Rules)
- Responsive design (mobile booking page, desktop dashboard)
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
- **SM-1:** Booking page load time < 2 seconds — validates FR-1 through FR-10.
- **SM-2:** Booking completion rate > 80% — validates FR-1 through FR-5.
- **SM-3:** Onboarding completion time < 10 minutes — validates FR-31 through FR-40.

**Secondary**
- **SM-4:** 5 restaurants share their booking link in first month — validates FR-41 through FR-43.
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
- Tech stack: Angular 22+, Firebase, TypeScript 7.x.
- Architecture: Serverless, direct Firebase from browser, no API layer.
- Target market: UK, small restaurants (~50 covers), single location or small chain (1-4 locations).
- User: Expert skill level, solo project, low budget for hosting.
- Hours: Weekly recurring schedule, no holiday overrides for MVP.
- Bookings: Diner creates booking without authentication. Diner cannot read or edit bookings for MVP. OTP-based editing deferred to v2.
