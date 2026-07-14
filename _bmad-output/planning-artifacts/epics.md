---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-osefdetalife-2026-07-12/prd.md
  - _bmad-output/planning-artifacts/architecture/architecture-osefdetalife-2026-07-12/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/ux-designs/ux-osefdetalife-2026-07-14/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-osefdetalife-2026-07-14/EXPERIENCE.md
---

# osefdetalife - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for osefdetalife, decomposing the requirements from the PRD, UX Design, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR-1: Widget renders as `<booking-widget>` custom element via embed code. Shows restaurant name and address (if configured) on landing step with "Book now" button.
FR-2: Party size selector shows options 1-8. Party size is required before proceeding.
FR-3: Calendar shows only dates where restaurant is open (based on hours config). Closed dates are hidden.
FR-4: Time picker shows available 15-minute slots for selected party size and date. If no availability, show "No availability for this date" message.
FR-5: Details form shows: Name (required), Email (required), Custom field (optional, label set by restaurant). If custom field not configured, field is not visible.
FR-6: On submit: booking created in Firestore with status "confirmed". Confirmation screen shows summary: date, time, party size.
FR-7: Back button available on all steps except landing. Returns to previous step with selection preserved.
FR-8: Loading spinner shown during step transitions and data fetches.
FR-9: Invalid slug: "Restaurant not found" message. Firebase down: "Something went wrong. Please try again." message.
FR-10: Widget adapts to mobile and desktop. Fixed width (min 375px), full width of container.
FR-11: Project includes a standalone HTML page that embeds the widget for development and testing. Page allows entering a restaurant slug and renders the widget.
FR-12: Dashboard home shows list of bookings for today. Each booking shows: time, party size, diner name, custom field value (if configured).
FR-13: Date picker allows selecting any date. "Today" button returns to today's view.
FR-14: When no bookings for selected date, show "No bookings for this date" message.
FR-15: Bookings appear in dashboard immediately when created via widget (no refresh required) — real-time updates.
FR-16: Restaurant owner can update restaurant name. Changes saved immediately.
FR-17: Restaurant owner can set open/close times for each day of week. Each day can be marked as closed. Weekly schedule saved as `Record<number, {open, close}>`.
FR-18: Restaurant owner can update address. Displayed on widget landing page.
FR-19: Timezone auto-assigned to UTC on creation. Editable via dropdown for future flexibility.
FR-20: Restaurant owner can add table groups by entering capacity (number) and count (number). Multiple groups supported.
FR-21: Restaurant owner can edit capacity and count of existing table groups.
FR-22: Restaurant owner can delete a table group. Existing bookings for that capacity are preserved but no new bookings can be made for that capacity.
FR-23: Restaurant owner can set primary color (hex picker). Applied to widget accent elements.
FR-24: Restaurant owner can set secondary color (hex picker). Applied to widget secondary elements.
FR-25: Restaurant owner can set: label (text), required (toggle), enabled (toggle). If disabled, field is not shown on widget.
FR-26: Restaurant owner can change password from dashboard. Requires current password confirmation.
FR-27: Sign out button in header/nav. Returns to login page.
FR-28: Restaurant owner can create account with email and password. System sends email verification on sign up.
FR-29: Restaurant owner can create account via Google OAuth.
FR-30: Login page shows both sign up options (email/password + Google). Provides "Forgot password" link. Redirects to dashboard on successful login.
FR-31: After first sign up, restaurant owner is redirected to onboarding wizard. System detects first-time sign up.
FR-32: Onboarding Step 1 — Restaurant Name (required). System auto-generates slug preview.
FR-33: Onboarding Step 2 — Slug (required). Auto-generated from name, editable, validated for uniqueness in real-time. Format: lowercase + hyphens only.
FR-34: Onboarding Step 3 — Address (optional). Text input, allows empty.
FR-35: Onboarding Step 4 — Opening Hours (required). Weekly schedule (Monday-Sunday). Toggle open/closed per day. Set open/close times. Validate at least one day open.
FR-36: Onboarding Step 5 — Table Groups (required). Form to add capacity + count pairs. Multiple groups. Validate at least one group exists.
FR-37: Onboarding Step 6 — White-Label Colors (optional). Color pickers for primary and secondary. Sensible defaults.
FR-38: Onboarding Step 7 — Custom Field (optional). Label input, required toggle, enabled toggle. Defaults to disabled.
FR-39: Restaurant owner can skip optional steps (address, colors, custom field). Completes onboarding without skipped steps. Allows completing skipped steps later in Settings.
FR-40: After wizard completes, restaurant owner is redirected to dashboard. Onboarding marked complete. Widget live with configured slug.
FR-41: Dashboard includes a "Deploy" page showing embed code snippet. Includes restaurant slug. Provides link to demo page.
FR-42: One-click copy button for embed code. Copies to clipboard. Shows confirmation message.
FR-43: Embed code page includes link to demo page. Opens in new tab. Shows widget rendering with restaurant's configuration.
FR-44: System stores restaurant profile in Firestore at `restaurants/{restaurantId}`. Stores: name, slug (unique), ownerId, address, colors, customField, createdAt. Enforces required fields.
FR-45: System stores table groups as subcollection at `restaurants/{restaurantId}/tables/{tableId}`. Stores: capacity, count.
FR-46: System stores opening hours as field on restaurant document. `Record<number, {open, close}>`. Keys are ISO day numbers (1=Monday, 7=Sunday).
FR-47: System stores bookings as subcollection at `restaurants/{restaurantId}/bookings/{bookingId}`. Stores: date, time, partySize, name, email, customFieldValue, status, createdAt. Default status: "confirmed".
FR-48: System resolves slug to restaurant ID via `slugs/{slug}` → `{restaurantId}`. Creates slug document on restaurant creation. Enforces uniqueness via Firestore transaction.
FR-49: Any user can read restaurant profile, hours, and tables. Blocks unauthenticated write access.
FR-50: Authenticated owner can manage own restaurant. Allows write access to own profile, hours, tables, bookings. Blocks cross-restaurant access.
FR-51: Diner can create bookings without authentication. System validates document shape and restaurant existence via Firestore rules. Validates required fields. Blocks read access (owner-only). Blocks update/delete.
FR-52: System calculates availability at query time. Queries existing bookings for selected date. Subtracts booked tables from table groups. Returns available 15-minute slots.
FR-53: System enforces unique slugs across all restaurants. Uses Firestore transaction. Rejects slug if taken. Allows slug change by owner.

### NonFunctional Requirements

NFR-1: Widget load time < 2 seconds (validates FR-1 through FR-11).
NFR-2: Booking completion rate > 80% (validates FR-1 through FR-5).
NFR-3: Onboarding completion time < 10 minutes (validates FR-31 through FR-40).
NFR-4: Slug lookup < 100ms.
NFR-5: Firestore SLA 99.9%.
NFR-6: WCAG 2.1 AA accessibility compliance.
NFR-7: Security Rules enforce all access control.
NFR-8: 5 restaurants embed widget in first month.
NFR-9: 50 bookings per restaurant per month (steady state).

### Additional Requirements (Architecture)

- Serverless-event-driven architecture on Firebase. No servers to manage.
- Direct Firebase from browser (no API layer). Widget and dashboard use Firebase client SDK directly.
- Firestore Security Rules enforce access control.
- Web Components with Shadow DOM for widget rendering (style isolation).
- Compute-on-read for availability (no pre-computed slots).
- No table splitting (party of N requires single table of capacity >= N).
- Auto-confirm bookings (status "confirmed" immediately).
- One restaurant per account (MVP).
- Firebase Hosting for dashboard deployment.
- Vite for widget build tool.
- TypeScript 7.x for both widget and dashboard.
- Weekly recurring hours (no holiday overrides for MVP).
- All dates/times in restaurant's configured IANA timezone.
- Booking duration: configurable per restaurant (default 2 hours), stored on booking document.

### UX Design Requirements

UX-DR1: Widget container — min 375px width, responsive wider, Shadow DOM isolation, white-labeled with restaurant colors via CSS custom properties.
UX-DR2: Party size selector — 2×4 grid of circular buttons, single select, selected state uses accent fill.
UX-DR3: Date calendar — minimal month grid, open days selectable, closed days hidden entirely (not grayed), selected state uses accent fill.
UX-DR4: Time slots — horizontal scroll container, 15-min increments, pill-shaped buttons, single select, accent fill.
UX-DR5: Details form — stacked inputs with labels above, input styling (hairline border, 8px radius), validate on submit not on blur.
UX-DR6: Confirmation — centered checkmark icon (sage), booking summary, "You're all set." message, no action buttons.
UX-DR7: Dashboard sidebar — 240px fixed width, nav items with icon + label, active state: sage left border, sign out at bottom.
UX-DR8: Booking row — time, party size, diner name, custom field value, hairline separator, no actions (read-only MVP).
UX-DR9: Date picker — above booking list, "Today" button returns to current date.
UX-DR10: Onboarding card — centered, max-width 480px, step number + title, form content, primary CTA, "Skip" link for optional steps.
UX-DR11: Dark mode — full palette inversion from day one. Warm linen becomes deep ink, sage brightens for dark surfaces.
UX-DR12: Typography — Inter font family, 700 weight headings, 400 weight body, 500 weight meta. No display sizes.
UX-DR13: Spacing scale — 4/8/12/16/24/32/48px. Generous vertical rhythm in widget steps.
UX-DR14: Border radius — 8px inputs/small, 12px cards/buttons/widget, 16px modals/onboarding.
UX-DR15: Elevation — subtle card shadow (0 1px 3px rgba(0,0,0,0.04)), hairline borders, no heavy shadows.
UX-DR16: Widget step transitions — smooth fade or slide animations. Loading spinner during transitions.
UX-DR17: Back navigation — arrow button on all steps except landing. Preserves all selections.
UX-DR18: Error states — "Restaurant not found" for invalid slug, "Something went wrong. Please try again." for Firebase errors, retry button on transient errors.
UX-DR19: Empty states — "No available times for this date" (widget), "No bookings for this date" (dashboard), helpful guidance not apologetic.
UX-DR20: Focus management — widget step transitions move focus to new step heading, tab order follows reading order.
UX-DR21: Screen reader support — step changes announced ("Step 2 of 6: Party Size"), form inputs have associated labels, error messages via aria-describedby.
UX-DR22: Tap targets — minimum 44px (widget) / 48px (dashboard).
UX-DR23: Voice and tone — short complete sentences, no exclamation marks, no corporate enthusiasm. "Book a Table" not "Reserve your spot now!".
UX-DR24: Microcopy patterns — "You're all set." (confirmation), "No bookings for this date" (empty), "Let's set up your restaurant" (onboarding).

### FR Coverage Map

FR-1: Epic 2 — Widget landing page
FR-2: Epic 2 — Party size selection
FR-3: Epic 2 — Date selection (open dates only)
FR-4: Epic 2 — Time slot selection
FR-5: Epic 2 — Details form (name, email, custom field)
FR-6: Epic 2 — Booking submission & confirmation
FR-7: Epic 2 — Back navigation
FR-8: Epic 2 — Loading states
FR-9: Epic 2 — Error handling
FR-10: Epic 2 — Responsive design
FR-11: Epic 2 — Demo page
FR-12: Epic 3 — Today's bookings list
FR-13: Epic 3 — Date picker navigation
FR-14: Epic 3 — Empty state
FR-15: Epic 3 — Real-time updates
FR-16: Epic 3 — Edit restaurant name
FR-17: Epic 3 — Configure opening hours
FR-18: Epic 3 — Edit address
FR-19: Epic 3 — Timezone setting
FR-20: Epic 3 — Add table groups
FR-21: Epic 3 — Edit table groups
FR-22: Epic 3 — Delete table groups
FR-23: Epic 3 — Set primary color
FR-24: Epic 3 — Set secondary color
FR-25: Epic 3 — Configure custom field
FR-26: Epic 3 — Change password
FR-27: Epic 3 — Sign out
FR-28: Epic 1 — Sign up with email/password
FR-29: Epic 1 — Sign up with Google
FR-30: Epic 1 — Login page
FR-31: Epic 1 — Onboarding wizard redirect
FR-32: Epic 1 — Onboarding: restaurant name
FR-33: Epic 1 — Onboarding: slug
FR-34: Epic 1 — Onboarding: address
FR-35: Epic 1 — Onboarding: opening hours
FR-36: Epic 1 — Onboarding: table groups
FR-37: Epic 1 — Onboarding: white-label colors
FR-38: Epic 1 — Onboarding: custom field
FR-39: Epic 1 — Skip optional steps
FR-40: Epic 1 — Onboarding completion
FR-41: Epic 1 — Deploy page (embed code)
FR-42: Epic 1 — Copy embed code
FR-43: Epic 1 — Demo page link
FR-44: Epic 1 — Restaurant profile data model
FR-45: Epic 1 — Table groups data model
FR-46: Epic 1 — Opening hours data model
FR-47: Epic 2 — Bookings data model
FR-48: Epic 1 — Slug resolution
FR-49: Epic 1 — Security rules: public read
FR-50: Epic 1 — Security rules: owner write
FR-51: Epic 2 — Security rules: diner booking
FR-52: Epic 2 — Compute-on-read availability
FR-53: Epic 1 — Slug uniqueness enforcement

## Epic List

### Epic 1: Restaurant Setup & Onboarding
Restaurant owner can sign up, configure their restaurant (name, hours, tables, colors), and get an embed code to deploy the widget.
**FRs covered:** FR-28 to FR-46, FR-48 to FR-50, FR-53 (23 FRs)

### Epic 2: Diner Booking Widget
Diners can book tables through the embeddable widget on the restaurant's website.
**FRs covered:** FR-1 to FR-11, FR-47, FR-51, FR-52 (14 FRs)

### Epic 3: Restaurant Dashboard & Management
Restaurant owner can view today's bookings in real-time and manage all restaurant settings from the dashboard.
**FRs covered:** FR-12 to FR-27 (16 FRs)

---

## Epic 1: Restaurant Setup & Onboarding

Restaurant owner can sign up, configure their restaurant (name, hours, tables, colors), and get an embed code to deploy the widget.

### Story 1.1: Project Scaffolding & Firebase Setup

As a developer,
I want the project scaffolded with Angular (dashboard), Vite (widget), shared types, and Firebase configured,
So that all subsequent stories have a foundation to build on.

**Acceptance Criteria:**

**Given** the project root
**When** I run `npm install` and `ng serve`
**Then** the Angular dashboard app boots on localhost with a placeholder home route
**And** TypeScript strict mode is enabled
**And** the project structure matches the Architecture Spine (`src/dashboard/`, `src/widget/`, `src/shared/`)

**Given** the widget directory
**When** I run the Vite build
**Then** a standalone JS bundle is produced at `dist/widget/`
**And** the bundle exports a `<booking-widget>` custom element

**Given** the shared directory
**When** I import from `src/shared/`
**Then** TypeScript interfaces for `Restaurant`, `Booking`, `TableGroup`, `OpeningHours`, `CustomField` are available
**And** a shared Firebase initialization module is exported

**Given** the Firebase project
**When** I run `firebase emulators:start`
**Then** Firestore, Auth, and Hosting emulators are available locally
**And** the dashboard connects to the emulators in development mode

---

### Story 1.2: Restaurant Data Model & Security Rules

As a developer,
I want the Firestore data model created with security rules enforced,
So that restaurant data is stored correctly and access is controlled.

**Acceptance Criteria:**

**Given** a new restaurant owner signs up
**When** their restaurant profile is created
**Then** a document exists at `restaurants/{restaurantId}` with fields: name, slug, ownerId, address, colors, customField, timezone, hours, createdAt
**And** the slug field is unique across all restaurants

**Given** a restaurant has table groups
**When** table groups are stored
**Then** documents exist at `restaurants/{restaurantId}/tables/{tableId}` with fields: capacity, count
**And** capacity and count are positive integers

**Given** a slug resolution document
**When** a restaurant is created
**Then** a document exists at `slugs/{slug}` referencing the restaurantId
**And** slug uniqueness is enforced via Firestore transaction

**Given** security rules are deployed
**When** an unauthenticated user reads a restaurant profile
**Then** the read is allowed
**And** unauthenticated writes to restaurant profiles are blocked

**Given** security rules are deployed
**When** an authenticated owner writes to their own restaurant
**Then** the write is allowed
**And** writes to other restaurants' data are blocked

---

### Story 1.3: User Authentication

As a restaurant owner,
I want to create an account with email/password or Google, and log in,
So that I can access the dashboard.

**Acceptance Criteria:**

**Given** a new restaurant owner on the sign-up page
**When** they enter a valid email and password
**Then** a Firebase Auth account is created
**And** a verification email is sent
**And** they are redirected to the onboarding wizard

**Given** a new restaurant owner on the sign-up page
**When** they click "Sign up with Google"
**Then** the Google OAuth flow initiates
**And** on success, a Firebase Auth account is created
**And** they are redirected to the onboarding wizard

**Given** an existing restaurant owner on the login page
**When** they enter correct credentials
**Then** they are authenticated
**And** redirected to the dashboard

**Given** a restaurant owner on the login page
**When** they click "Forgot password"
**Then** a password reset email is sent
**And** a confirmation message is displayed

**Given** the login page
**When** it loads
**Then** both email/password and Google sign-in options are visible
**And** the page follows DESIGN.md styling (centered card, Inter font, warm linen background)

---

### Story 1.4: Onboarding — Basics Step

As a restaurant owner,
I want to enter my restaurant name and see the auto-generated slug,
So that my restaurant is identified on the platform.

**Acceptance Criteria:**

**Given** a restaurant owner completes sign-up
**When** they are redirected to onboarding
**Then** a centered card (max-width 480px) shows "Step 1 of 3: Restaurant basics"
**And** the heading reads "Tell us about your restaurant"

**Given** the basics step
**When** the owner types a restaurant name
**Then** a slug is auto-generated in real-time (lowercase, hyphens, no special characters)
**And** the slug preview shows: "Your booking link: bookable.co/{slug}"

**Given** the basics step
**When** the owner edits the slug field
**Then** the slug is validated for uniqueness in real-time
**And** a visual indicator shows if the slug is available or taken

**Given** the basics step
**When** the owner enters a name and valid slug
**And** clicks "Continue"
**Then** the data is saved to the restaurant profile
**And** the wizard advances to Step 2

**Given** the basics step
**When** it loads
**Then** the address field is visible with an "(optional)" label
**And** the owner can skip the address by clicking "Continue" without entering one

---

### Story 1.5: Onboarding — Availability Step

As a restaurant owner,
I want to configure my opening hours and table groups,
So that the widget can show available times.

**Acceptance Criteria:**

**Given** the availability step
**When** it loads
**Then** a centered card shows "Step 2 of 3: Availability"
**And** the heading reads "When are you open?"

**Given** the availability step
**When** the owner configures opening hours
**Then** a weekly schedule (Monday–Sunday) is displayed
**And** each day has an open/closed toggle
**And** open days show time inputs for open and close times
**And** the schedule is saved as `Record<number, {open, close}>` (ISO day numbers)

**Given** the availability step
**When** the owner tries to continue with all days closed
**Then** the "Continue" button is disabled
**And** a message shows "Set your opening hours to continue"

**Given** the availability step
**When** the owner adds a table group
**Then** a form row appears with capacity (number) and count (number) inputs
**And** the owner can add multiple table groups

**Given** the availability step
**When** the owner tries to continue with no table groups
**Then** the "Continue" button is disabled
**And** a message shows "Add at least one table group to continue"

**Given** the availability step
**When** the owner has valid hours and at least one table group
**And** clicks "Continue"
**Then** the data is saved
**And** the wizard advances to Step 3

---

### Story 1.6: Onboarding — Branding Step

As a restaurant owner,
I want to customize my widget colors and add a custom field,
So that the widget matches my brand.

**Acceptance Criteria:**

**Given** the branding step
**When** it loads
**Then** a centered card shows "Step 3 of 3: Branding"
**And** a "Skip" link is visible (this step is optional)

**Given** the branding step
**When** the owner configures colors
**Then** a hex color picker is shown for primary color
**And** a hex color picker is shown for secondary color
**And** sensible defaults are pre-filled

**Given** the branding step
**When** the owner configures a custom field
**Then** inputs are shown for: label (text), required (toggle), enabled (toggle)
**And** the custom field defaults to disabled

**Given** the branding step
**When** the owner clicks "Skip"
**Then** the onboarding is completed without saving branding changes
**And** the owner can configure these later in Settings

**Given** the branding step
**When** the owner clicks "Complete"
**Then** the branding data is saved to the restaurant profile
**And** onboarding is marked as complete

---

### Story 1.7: Onboarding Completion & Deploy

As a restaurant owner,
I want to see my embed code and know how to deploy the widget,
So that I can add the booking widget to my website.

**Acceptance Criteria:**

**Given** the owner completes onboarding
**When** they are redirected from the wizard
**Then** the Deploy page is shown in the dashboard sidebar
**And** the page displays the embed code snippet with the restaurant's slug

**Given** the Deploy page
**When** the owner views the embed code
**Then** it includes a `<script>` tag pointing to the widget bundle
**And** it includes a `<booking-widget restaurant="{slug}">` element

**Given** the Deploy page
**When** the owner clicks the copy button
**Then** the embed code is copied to the clipboard
**And** a confirmation message "Copied!" is shown

**Given** the Deploy page
**When** the owner clicks the demo page link
**Then** a new tab opens with the demo page
**And** the demo page renders the widget with the restaurant's configuration

**Given** the dashboard
**When** the owner signs in after completing onboarding
**Then** they land on the dashboard (not the onboarding wizard)
**And** the sidebar shows all navigation items (Bookings, Info, Hours, Tables, Branding, Deploy, Account)

---

## Epic 2: Diner Booking Widget

Diners can book tables through the embeddable widget on the restaurant's website.

### Story 2.1: Widget Foundation & Landing

As a diner,
I want to see the restaurant's name and a "Book a Table" button when I visit their website,
So that I can start the booking process.

**Acceptance Criteria:**

**Given** a restaurant has deployed the widget
**When** the embed code is added to a webpage
**Then** a `<booking-widget>` custom element renders
**And** the widget is isolated in Shadow DOM (host page CSS cannot affect it)

**Given** the widget renders
**When** it loads with a valid restaurant slug
**Then** the restaurant name is displayed
**And** the address is displayed (if configured)
**And** a "Book a Table" button is visible

**Given** the widget renders
**When** it loads with an invalid slug
**Then** a "Restaurant not found" message is displayed
**And** no booking flow is initiated

**Given** the widget renders
**When** Firebase is unavailable
**Then** a "Something went wrong. Please try again." message is displayed
**And** a retry button is shown

**Given** the widget
**When** it loads
**Then** the container is min-width 375px and responsive wider
**And** the styling matches DESIGN.md (warm linen background, Inter font, 12px border radius)

**Given** the widget
**When** it loads
**Then** a loading spinner is shown during data fetches
**And** the spinner hides when data is ready

---

### Story 2.2: Party Size & Date Selection

As a diner,
I want to select my party size and pick a date,
So that I can see available times for my group.

**Acceptance Criteria:**

**Given** the diner clicks "Book a Table"
**When** the party size step loads
**Then** a 2×4 grid of circular buttons (1–8) is displayed
**And** the heading reads "How many guests?"
**And** a back button is visible (returns to landing)

**Given** the party size step
**When** the diner taps a number
**Then** that number is selected (sage green fill, white text)
**And** the calendar step loads automatically

**Given** the calendar step
**When** it loads
**Then** a minimal month view is displayed
**And** only open dates (per restaurant hours) are selectable
**And** closed dates are hidden entirely (not grayed out)

**Given** the calendar step
**When** the diner selects an open date
**Then** the time slot step loads automatically
**And** the selected date is highlighted (sage green fill)

**Given** the calendar step
**When** the diner taps the back button
**Then** they return to party size selection
**And** the previously selected party size is preserved

---

### Story 2.3: Time Slot Selection & Availability

As a diner,
I want to see available time slots for my party size and date,
So that I can choose a convenient time.

**Acceptance Criteria:**

**Given** the time slot step
**When** it loads
**Then** available 15-minute slots are displayed for the selected date and party size
**And** slots are shown as pill-shaped buttons in a horizontal scroll container
**And** the heading shows the selected date

**Given** the time slot step
**When** slots are available
**Then** each slot shows the time in 12-hour format (e.g., "7:00 PM")
**And** the diner can tap a slot to select it

**Given** the time slot step
**When** no slots are available for the selected date
**Then** a "No available times for this date" message is displayed
**And** the diner can go back to select a different date

**Given** the time slot step
**When** the diner selects a time slot
**Then** the details form step loads automatically
**And** the selected time is highlighted (sage green fill)

**Given** the time slot step
**When** the diner taps the back button
**Then** they return to the calendar step
**And** the previously selected date is preserved

**Given** the availability calculation
**When** the widget queries for available slots
**Then** the system queries existing bookings for the date
**And** subtracts booked tables from table groups
**And** returns available 15-minute slots within opening hours

---

### Story 2.4: Details Form & Booking Submission

As a diner,
I want to enter my name, email, and optional custom field, and submit my booking,
So that my table is reserved.

**Acceptance Criteria:**

**Given** the details form step
**When** it loads
**Then** a form with Name (required) and Email (required) inputs is displayed
**And** a back button is visible (returns to time selection)

**Given** the details form
**When** the restaurant has a custom field configured
**Then** the custom field is displayed with the restaurant-defined label
**And** the field is required if the restaurant set it as required

**Given** the details form
**When** the restaurant has no custom field configured
**Then** no custom field is displayed

**Given** the details form
**When** the diner submits with empty required fields
**Then** validation errors are shown
**And** the form is not submitted

**Given** the details form
**When** the diner submits with valid data
**Then** a booking document is created in Firestore with status "confirmed"
**And** the confirmation step loads

**Given** the confirmation step
**When** it loads
**Then** a centered checkmark icon (sage green) is displayed
**And** the booking summary shows: date, time, party size
**And** the message reads "You're all set."
**And** no action buttons are shown (flow complete)

**Given** the booking submission
**When** the booking is created
**Then** the document includes: date, time, partySize, name, email, customFieldValue, status, createdAt, duration

---

### Story 2.5: Navigation, Loading & Error Handling

As a diner,
I want smooth transitions between steps and clear error messages,
So that the booking flow feels polished and reliable.

**Acceptance Criteria:**

**Given** any step except landing
**When** the back button is tapped
**Then** the previous step is shown
**And** all previous selections are preserved

**Given** any step transition
**When** the diner advances to the next step
**Then** a loading spinner is shown during the transition
**And** the spinner hides when the new step is ready

**Given** any step transition
**When** the step changes
**Then** focus moves to the new step heading
**And** screen readers announce "Step N of 6: {Step Name}"

**Given** the widget
**When** a Firestore error occurs
**Then** "Something went wrong. Please try again." is displayed
**And** a retry button is shown

**Given** the widget
**When** the slug does not match any restaurant
**Then** "Restaurant not found" is displayed
**And** no booking flow is initiated

**Given** the widget
**When** it loads
**Then** tap targets are minimum 44px
**And** all text meets WCAG 2.1 AA contrast ratios

---

### Story 2.6: Demo Page

As a developer,
I want a standalone HTML page that embeds the widget for testing,
So that I can verify the widget works during development.

**Acceptance Criteria:**

**Given** the project
**When** I open the demo page
**Then** a standalone HTML page is displayed
**And** an input field allows entering a restaurant slug
**And** a "Load Widget" button renders the widget with the entered slug

**Given** the demo page
**When** a valid slug is entered and "Load Widget" is clicked
**Then** the `<booking-widget>` element is rendered on the page
**And** the widget loads the restaurant's configuration

**Given** the demo page
**When** an invalid slug is entered
**Then** the widget displays "Restaurant not found"

**Given** the demo page
**When** it loads
**Then** the page is styled simply (neutral background, centered widget)
**And** no external dependencies are required (inline CSS only)

---

## Epic 3: Restaurant Dashboard & Management

Restaurant owner can view today's bookings in real-time and manage all restaurant settings from the dashboard.

### Story 3.1: Dashboard Layout & Sidebar

As a restaurant owner,
I want a dashboard with sidebar navigation and sign out,
So that I can access all management sections.

**Acceptance Criteria:**

**Given** an authenticated restaurant owner
**When** they load the dashboard
**Then** a sidebar (240px) is displayed on the left
**And** the main content area fills the remaining width

**Given** the sidebar
**When** it loads
**Then** nav items are displayed: Bookings, Restaurant Info, Opening Hours, Table Groups, White Label, Deploy, Account
**And** each item has an icon and label
**And** the active item has a sage green left border

**Given** the sidebar
**When** the owner clicks a nav item
**Then** the corresponding settings page is displayed in the main content area
**And** the active state updates

**Given** the sidebar
**When** the owner clicks "Sign Out"
**Then** they are signed out from Firebase Auth
**And** redirected to the login page

**Given** the dashboard
**When** it loads on a narrow viewport (< 768px)
**Then** the sidebar collapses to icons only
**And** the main content area fills the width

**Given** the dashboard
**When** it loads
**Then** the styling matches DESIGN.md (warm linen background, sidebar with hairline border, Inter font)

---

### Story 3.2: Bookings List & Date Picker

As a restaurant owner,
I want to see today's bookings and navigate to other dates,
So that I can prepare for service.

**Acceptance Criteria:**

**Given** the owner navigates to Bookings
**When** the page loads
**Then** today's date is selected by default
**And** a list of bookings for today is displayed

**Given** the bookings list
**When** bookings exist
**Then** each booking shows: time (12-hour format), party size, diner name, custom field value (if configured)
**And** bookings are separated by hairline dividers
**And** bookings are sorted by time

**Given** the bookings list
**When** no bookings exist for the selected date
**Then** "No bookings for this date" is displayed
**And** the date picker remains functional

**Given** the bookings page
**When** it loads
**Then** a date picker is displayed above the booking list
**And** a "Today" button is visible

**Given** the date picker
**When** the owner selects a different date
**Then** bookings for that date are loaded
**And** the list updates

**Given** the date picker
**When** the owner clicks "Today"
**Then** the date returns to today
**And** today's bookings are displayed

**Given** the bookings page
**When** a new booking is created via the widget
**Then** it appears in the list immediately (no refresh required)
**And** the list scrolls to maintain position

**Given** the bookings page
**When** it loads
**Then** tap targets are minimum 48px
**And** all text meets WCAG 2.1 AA contrast ratios

---

### Story 3.3: Restaurant Info Settings

As a restaurant owner,
I want to update my restaurant name, address, and timezone,
So that my information is accurate on the widget.

**Acceptance Criteria:**

**Given** the owner navigates to Restaurant Info
**When** the page loads
**Then** the current restaurant name is displayed in a text input
**And** the current address is displayed in a text input
**And** the current timezone is displayed in a dropdown

**Given** the Restaurant Info page
**When** the owner updates the name
**Then** the change is saved immediately on blur or Enter
**And** a confirmation message is shown

**Given** the Restaurant Info page
**When** the owner updates the address
**Then** the change is saved immediately
**And** the widget landing page reflects the new address

**Given** the Restaurant Info page
**When** the owner changes the timezone
**Then** the timezone is saved
**And** all time-related displays update to the new timezone

**Given** the Restaurant Info page
**When** the owner tries to save an empty name
**Then** a validation error is shown
**And** the save is blocked

**Given** the Restaurant Info page
**When** it loads
**Then** the address field is optional (can be empty)
**And** the timezone defaults to UTC

---

### Story 3.4: Opening Hours Settings

As a restaurant owner,
I want to configure my weekly opening hours,
So that the widget shows accurate availability.

**Acceptance Criteria:**

**Given** the owner navigates to Opening Hours
**When** the page loads
**Then** a weekly schedule (Monday–Sunday) is displayed
**And** each day shows the current open/close times (if configured)

**Given** the Opening Hours page
**When** the owner toggles a day to "closed"
**Then** the time inputs are hidden for that day
**And** the schedule is saved

**Given** the Opening Hours page
**When** the owner sets open and close times for a day
**Then** the times are saved as 24-hour format (HH:mm)
**And** the schedule is stored as `Record<number, {open, close}>`

**Given** the Opening Hours page
**When** the owner tries to save with all days closed
**Then** a validation error is shown
**And** the save is blocked

**Given** the Opening Hours page
**When** changes are saved
**Then** the widget calendar updates to reflect the new open dates
**And** a confirmation message is shown

---

### Story 3.5: Table Groups Settings

As a restaurant owner,
I want to add, edit, and delete table groups,
So that the widget can calculate availability accurately.

**Acceptance Criteria:**

**Given** the owner navigates to Table Groups
**When** the page loads
**Then** existing table groups are displayed
**And** each group shows capacity and count
**And** an "Add Table Group" button is visible

**Given** the Table Groups page
**When** the owner clicks "Add Table Group"
**Then** a new form row appears with capacity (number) and count (number) inputs
**And** the owner can add multiple groups

**Given** the Table Groups page
**When** the owner edits a table group's capacity or count
**Then** the change is saved
**And** the availability calculation updates

**Given** the Table Groups page
**When** the owner clicks delete on a table group
**Then** a confirmation dialog is shown
**And** on confirm, the table group is deleted
**And** existing bookings for that capacity are preserved
**And** no new bookings can be made for that capacity

**Given** the Table Groups page
**When** the owner tries to save with no table groups
**Then** a validation error is shown
**And** the save is blocked

**Given** the Table Groups page
**When** it loads
**Then** capacity and count inputs are positive integers only
**And** the UI follows DESIGN.md styling (card layout, hairline borders)

---

### Story 3.6: White Label & Custom Field Settings

As a restaurant owner,
I want to customize my widget colors and configure a custom field,
So that the widget matches my brand and collects the info I need.

**Acceptance Criteria:**

**Given** the owner navigates to White Label
**When** the page loads
**Then** hex color pickers are displayed for primary and secondary colors
**And** the current colors are pre-filled
**And** a custom field configuration section is visible

**Given** the White Label page
**When** the owner changes the primary color
**Then** the color is saved
**And** the widget preview updates to reflect the new color

**Given** the White Label page
**When** the owner changes the secondary color
**Then** the color is saved
**And** the widget preview updates to reflect the new color

**Given** the White Label page
**When** the owner configures the custom field
**Then** inputs are shown for: label (text), required (toggle), enabled (toggle)
**And** the changes are saved

**Given** the White Label page
**When** the owner disables the custom field
**Then** the custom field is not shown on the widget
**And** the label and required settings are preserved

**Given** the White Label page
**When** changes are saved
**Then** a confirmation message is shown
**And** the widget reflects the new configuration immediately

---

### Story 3.7: Account Settings

As a restaurant owner,
I want to change my password,
So that my account stays secure.

**Acceptance Criteria:**

**Given** the owner navigates to Account
**When** the page loads
**Then** a "Change Password" section is displayed
**And** a "Sign Out" button is visible

**Given** the Change Password section
**When** the owner enters their current password and a new password
**Then** the password is updated in Firebase Auth
**And** a confirmation message is shown

**Given** the Change Password section
**When** the owner enters an incorrect current password
**Then** an error message is shown
**And** the password is not changed

**Given** the Change Password section
**When** the new password is too weak
**Then** a validation error is shown
**And** the save is blocked

**Given** the Account page
**When** the owner clicks "Sign Out"
**Then** they are signed out from Firebase Auth
**And** redirected to the login page
