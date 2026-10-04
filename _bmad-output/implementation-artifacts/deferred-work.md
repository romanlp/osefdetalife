# Deferred Work

Items surfaced during code reviews that are pre-existing issues or out of scope for the current story.

### DW-1: guard catch blocks fail open in opposite directions

origin: migrated from legacy ledger ("Story 1.4 - Onboarding Basics Step"), 2026-10-01
location: src/app/routing/guard/onboarding.guard.ts:22-24
source_spec: _bmad-output/implementation-artifacts/1-4-onboarding-basics-step.md
severity: high
reason: isOnboardedGuard redirects to /onboarding on a Firestore error while isNotOnboardedGuard returns true, so an outage bounces an onboarded owner back into onboarding; both catch blocks are bare `catch {}` and discard the error
status: open

### DW-2: onboarding guards run an uncached live query on every navigation

origin: migrated from legacy ledger ("Story 1.4 - Onboarding Basics Step"), 2026-10-01
location: src/app/routing/guard/onboarding.guard.ts:13-15
source_spec: _bmad-output/implementation-artifacts/1-4-onboarding-basics-step.md
severity: medium
reason: each canActivate does a bare getFirestore() plus getDocs(q) with no cache, onSnapshot or memo, and the query is duplicated verbatim in both guards so any fix must be made twice
status: open

### DW-3: updateRestaurant and getRestaurant have no client-side owner check

origin: migrated from legacy ledger ("Story 1.4 - Onboarding Basics Step"), 2026-10-01
location: src/app/services/onboarding.service.ts:82-97
source_spec: _bmad-output/implementation-artifacts/1-4-onboarding-basics-step.md
severity: medium
reason: updateDoc and getDoc on restaurants/{id} never compare ownerId against this.auth.currentUser, so access control rests entirely on Firestore rules; the service already holds auth at line 18 so the check is cheap
status: open

### DW-4: five login and onboarding components use FormsModule instead of Signal Forms

origin: migrated from legacy ledger ("Story 1.4 - Onboarding Basics Step"), 2026-10-01
location: src/app/login/login-page/login-page.component.ts:7
source_spec: _bmad-output/implementation-artifacts/1-4-onboarding-basics-step.md
severity: low
reason: login-page, signup-page, reset-password-page, availability-page and branding-page are all template-driven while AGENTS.md prefers Signal Forms; the newest booking code (details-step) already uses ReactiveFormsModule so the codebase is merely inconsistent
status: open

### DW-5: Restaurant.createdAt is typed Date but stored as a Firestore Timestamp

origin: migrated from legacy ledger ("Story 1.4 - Onboarding Basics Step"), 2026-10-01
location: src/shared/types/restaurant.ts:13
source_spec: _bmad-output/implementation-artifacts/1-4-onboarding-basics-step.md
severity: low
reason: the write path already avoids lying via Omit<Restaurant,'id'|'createdAt'> at onboarding.service.ts:53, so what remains is the read type being fictional and masked by `as Restaurant` casts at onboarding.service.ts:96 and :111; nothing reads the field
status: open

### DW-6: getRestaurantByOwner picks the first doc from an unordered query

origin: migrated from legacy ledger ("Deferred from: code review of 1-4-onboarding-basics-step (2026-07-20)"), 2026-10-01
location: src/app/services/onboarding.service.ts:105-111
source_spec: _bmad-output/implementation-artifacts/1-4-onboarding-basics-step.md
severity: low
reason: query(where('ownerId','==',ownerId)) has no orderBy before snapshot.docs[0], same pattern at onboarding.guard.ts:19 and :40; unreachable while one restaurant per account is an invariant but nothing enforces or tests it
status: open

### DW-7: new singleton services use Injectable instead of Service

origin: migrated from legacy ledger ("Deferred from: code review of 1-4-onboarding-basics-step (2026-07-20)"), 2026-10-01
location: src/app/services/onboarding.service.ts:15
source_spec: _bmad-output/implementation-artifacts/1-4-onboarding-basics-step.md
severity: low
reason: superseded; the deferral questioned whether @Service exists in Angular v22, and it does - all six services now use @Service and zero occurrences of @Injectable remain in src
status: done 2026-10-01
resolution: already resolved - onboarding.service.ts:15 and all five other services use @Service; zero @Injectable in src

### DW-8: Story 3.1 was expected to rebuild the dashboard shell built in Story 1.7

origin: migrated from legacy ledger ("Story 1.7 - Onboarding Completion & Deploy"), 2026-10-01
location: _bmad-output/implementation-artifacts/spec-3-1-dashboard-shell-polish-sign-out-responsive-styling.md
source_spec: _bmad-output/implementation-artifacts/1-7-onboarding-completion-deploy.md
severity: low
reason: superseded; the reconciliation this entry asked for happened - 3-1 polished the 1.7 shell in place per its own spec, then 3-1b converted those same two components to Material sidenav
status: done 2026-10-01
resolution: already resolved - be8c3b7 polished in place, 47462b5 converted to Material sidenav; shell was reused not rebuilt

### DW-9: prod widgetBundleUrl was never verified against the real hosting domain

origin: migrated from legacy ledger ("Story 1.7 - Onboarding Completion & Deploy"), 2026-10-01
location: n/a
source_spec: _bmad-output/implementation-artifacts/1-7-onboarding-completion-deploy.md
severity: low
reason: moot; the embeddable widget was deleted by the public-booking-page pivot so the property no longer exists anywhere - zero matches for widgetBundleUrl or booking-widget.mjs in src, angular.json, package.json or e2e
status: done 2026-10-01
resolution: skipped as obsolete - widget concept removed in ae28f83; deploy page now emits bookingLink plus QR

### DW-10: dev widgetBundleUrl pointed at localhost:4200 while the dev server runs on 4210

origin: migrated from legacy ledger ("Story 1.7 - Onboarding Completion & Deploy"), 2026-10-01
location: n/a
source_spec: _bmad-output/implementation-artifacts/1-7-onboarding-completion-deploy.md
severity: low
reason: moot; the 4200-to-4210 fix landed as 8973c00 and then ae28f83 deleted the whole property, and angular.json plus playwright.config.ts both confirm 4210
status: done 2026-10-01
resolution: skipped as obsolete - property deleted in ae28f83; ports already 4210 in angular.json:120,124 and playwright.config.ts:7

### DW-11: ng build and ng serve require dist/widget to exist

origin: migrated from legacy ledger ("Story 1.7 - Onboarding Completion & Deploy"), 2026-10-01
location: angular.json
source_spec: _bmad-output/implementation-artifacts/1-7-onboarding-completion-deploy.md
severity: low
reason: moot; the assets entry that required dist/widget was removed in ae28f83 and build assets are now exactly src/favicon.ico and src/assets, with no build:widget script and no lit dependency
status: done 2026-10-01
resolution: skipped as obsolete - assets entry removed in ae28f83; clean-clone ng serve no longer needs a prior widget build

### DW-12: product brief keeps three residual widget references and is still a live Architecture source

origin: migrated from legacy ledger ("Public Booking Page pivot review (2026-08-15)"), 2026-10-01
location: _bmad-output/planning-artifacts/briefs/brief-osefdetalife-2026-07-12/brief.md:30
source_spec: _bmad-output/planning-artifacts/briefs/brief-osefdetalife-2026-07-12/brief.md
severity: low
reason: the brief body was rewritten by the pivot to describe /book/{slug} but "Diner-facing (the widget)" at :30, "configure and deploy the widget" at :70 and :22 survive, and ARCHITECTURE-SPINE.md:12 still lists the brief in its sources
status: open

### DW-13: generated architecture.html still describes the pre-pivot widget model

origin: migrated from legacy ledger ("Public Booking Page pivot review (2026-08-15)"), 2026-10-01
location: _bmad-output/planning-artifacts/architecture/architecture-osefdetalife-2026-07-12/architecture.html:421
source_spec: _bmad-output/planning-artifacts/prds/prd-osefdetalife-2026-07-12/prd.html
severity: medium
reason: the source ARCHITECTURE-SPINE.md is clean and drops AD-4, but architecture.html still carries the removed AD-4 Web Components/Shadow DOM decision at :421 and :426, the widget system diagram at :644 and :661-668, and is missing AD-14 entirely, so it needs a full re-render rather than an edit; prd.html needs one line at :777
status: open

### DW-14: implementation-readiness report gates Epic 2 on widget-era FRs and stories

origin: migrated from legacy ledger ("Public Booking Page pivot review (2026-08-15)"), 2026-10-01
location: _bmad-output/planning-artifacts/implementation-readiness-report-2026-07-14.md:147
source_spec: _bmad-output/planning-artifacts/implementation-readiness-report-2026-07-14.md
severity: low
reason: stale vocabulary, not a wrong assessment - the pivot renamed requirements rather than replacing them, so the FR count of 53 still matches prd.md exactly and the FR-to-story mapping still holds; what is actually wrong is the tech stack line naming Web Components and Vite, the per-epic FR split predating FR-11's reassignment from Epic 2 to Epic 1, the unused 2.1-2.6 story range, and ~19 widget/embed wordings
status: done 2026-10-01
resolution: resolved 2026-10-01 - added a dated historical-snapshot banner stating what still holds, what is stale, and that prd.md and epics.md are authoritative; deleted the widget-era Story Sizing Validation table. The Acceptance Criteria Review table below it keeps a stale 2.1-2.6 row, left as-is because it is a point-in-time record
decision: 2026-10-01 dated supersede banner — the report's substance survives the pivot, so banner rather than rewrite or delete

### DW-15: two UX mockups still render a fixed 375px widget frame

origin: migrated from legacy ledger ("Public Booking Page pivot review (2026-08-15)"), 2026-10-01
location: _bmad-output/planning-artifacts/ux-designs/ux-osefdetalife-2026-07-14/mockups/key-widget-landing.html:31
source_spec: _bmad-output/planning-artifacts/ux-designs/ux-osefdetalife-2026-07-14/mockups/key-widget-landing.html
severity: low
reason: the mockup content was retitled to the public booking page and DESIGN.md/EXPERIENCE.md are clean, but key-widget-landing.html:31 and key-widget-party-size.html:31 still set width 375px which contradicts DESIGN.md:119 full-viewport responsive; the phone-frame in directions-4.html:64 is a legitimate device preview
status: open

### DW-16: no standalone FR covers QR generation or scannability

origin: migrated from legacy ledger ("Public Booking Page pivot review (2026-08-15)"), 2026-10-01
location: _bmad-output/planning-artifacts/prds/prd-osefdetalife-2026-07-12/prd.md:438
source_spec: _bmad-output/planning-artifacts/epics.md
severity: low
reason: no FR states QR requirements - no scannability, error correction, size or contrast criterion anywhere - and the shipped code delegates generation to a third-party image API (deploy-page.component.ts:33 builds an api.qrserver.com URL rendered as an img at deploy-page.component.html:52-58) with no QR library in package.json; the unit and e2e tests assert only that URL string, never that the image loads or that the code decodes
status: done 2026-10-01
resolution: closed by decision - third-party QR generation via api.qrserver.com is accepted as-is and a decode-based acceptance criterion is not wanted, so FR-41 plus the Story 1.7 acceptance criteria (epics.md:429,437,442) remain the requirement. The FR-11/FR-43 duplicate in-app-preview consequence noted in this entry moved to the pivot-doc-cleanup bundle rather than being lost
decision: 2026-10-01 close as covered — third-party generation accepted, no testable decode criterion required

### DW-17: no success metric measures diner landings on the public booking page

origin: migrated from legacy ledger ("Public Booking Page pivot review (2026-08-15)"), 2026-10-01
location: _bmad-output/planning-artifacts/prds/prd-osefdetalife-2026-07-12/prd.md:605
source_spec: _bmad-output/planning-artifacts/epics.md
severity: low
reason: SM-4 counts restaurants sharing their booking link and SM-5 counts bookings per restaurant, so nothing measures acquisition and the two cannot distinguish a working public page from one busy restaurant; SM-2 booking completion rate at prd.md:601 is a primary metric that is separately unmeasurable because nothing records a session start to serve as its denominator. Firebase Analytics is already provisioned (app.config.ts:22, firebase.ts:101-107,157) and emits zero events
status: done 2026-10-01
resolution: closed by decision 2026-10-01 - analytics instrumentation declined, so the unmeasurable metrics were retired rather than chased. provideAnalytics() now calls setConsent denying analytics_storage and all three ad signals (firebase.ts:101-116, covered by firebase.spec.ts), which stops the analytics storage that was being written with consent defaulted to granted. PRD section 7 rewritten to keep only SM-5 and SM-C1, the two derivable from Firestore, and to record why SM-1 through SM-4 are retired and what each would have needed
decision: 2026-10-01 drop the analytics metrics, do not build them - setConsent denies analytics_storage and the ad signals, the unmeasurable SM-1 through SM-4 are retired in the PRD, and provideAppCheck() reCAPTCHA v3 is knowingly left running after review

### DW-18: Epic 1 retro action item 2 still names the deleted widgetBundleUrl variable

origin: migrated from legacy ledger ("Public Booking Page pivot review (2026-08-15)"), 2026-10-01
location: _bmad-output/implementation-artifacts/sprint-status.yaml:68
source_spec: _bmad-output/implementation-artifacts/sprint-status.yaml
severity: low
reason: item-1 (verify-prod-widget-bundle-url) is already absent from action_items, but item-2 remains as a done entry whose action text names a variable the pivot deleted; epic-1-retro-2026-08-14.md:105 also still poses an open question the pivot already answered
status: open

### DW-19: AD-14 could not be implemented as written because rules cannot validate query filters

origin: migrated from legacy ledger ("Public Booking Page pivot review (2026-08-15)"), 2026-10-01
location: firestore.rules:97
source_spec: _bmad-output/implementation-artifacts/spec-pivot-public-booking-docs.md
severity: critical
reason: the entry was flagged as resolved on 2026-08-16 and that resolution is verified - the bookings-public projection subcollection is declared at firestore.rules:97-106 with a PII-rejecting validator at :34-46, written in the same batch by booking.service.ts:99, and covered by firestore.rules.spec.ts:279-322 and public-booking-page.spec.ts:86-92
status: done 2026-08-16
resolution: already resolved by the 2026-08-16 pivot rework - public projection subcollection landed across rules, spine AD-14, PRD FR-47/51/52, code and both test suites

### DW-20: BookingService initialises Firestore eagerly at construction

origin: migrated from legacy ledger ("Deferred from: code review of 2-1-public-booking-page-foundation-landing (2026-08-18)"), 2026-10-01
location: src/booking/services/booking.service.ts:23
source_spec: _bmad-output/implementation-artifacts/2-1-public-booking-page-foundation-landing.md
severity: low
reason: a field initializer runs getFirebaseDb() at construction, which would break under SSR or prerender; impact is limited because the service is providedIn root and only injected by booking-route components, and getFirebaseDb itself memoizes
status: open

### DW-21: e2e fixtures assert auth.currentUser without a guard

origin: migrated from legacy ledger ("Deferred from: code review of 2-1-public-booking-page-foundation-landing (2026-08-18)"), 2026-10-01
location: e2e/fixtures/restaurant.fixture.ts:52
source_spec: _bmad-output/implementation-artifacts/2-1-public-booking-page-foundation-landing.md
severity: low
reason: restaurant.fixture.ts:52 and :69 use auth.currentUser! and onboarding.fixture.ts:31,34-35 use user!.uid with no guard; pre-existing test practice, and the emulator happens to propagate auth state synchronously
status: open

### DW-22: dead template branch for an undefined slug

origin: migrated from legacy ledger ("Deferred from: code review of 2-1-public-booking-page-foundation-landing (2026-08-18)"), 2026-10-01
location: src/booking/pages/booking-page/booking-page.component.ts:48
source_spec: _bmad-output/implementation-artifacts/2-1-public-booking-page-foundation-landing.md
severity: low
reason: moot as written; the template has never contained a slug branch (zero matches, and git log -S finds no such commit), and the surviving loader guard at :48 is reachable whenever the input is unset, which the unit tests exercise
status: done 2026-10-01
resolution: skipped as obsolete - no template branch ever existed; the loader guard is reachable and covered by booking-page.component.spec.ts:161-164

### DW-23: restaurant resource has no equal comparator

origin: migrated from legacy ledger ("Deferred from: code review of 2-1-public-booking-page-foundation-landing (2026-08-18)"), 2026-10-01
location: src/booking/pages/booking-page/booking-page.component.ts:45
source_spec: _bmad-output/implementation-artifacts/2-1-public-booking-page-foundation-landing.md
severity: low
reason: moot as written; Angular's `equal` option compares the loader's return value, not the request, so it can neither cause nor prevent the re-fetches this entry describes - the params linkedSignal only re-evaluates when slug() changes
status: done 2026-10-01
resolution: skipped as obsolete - `equal` cannot affect request re-fetches; the stated risk does not exist

### DW-24: styleUrl and styleUrls are mixed across components

origin: migrated from legacy ledger ("Deferred from: code review of 2-1-public-booking-page-foundation-landing (2026-08-18)"), 2026-10-01
location: src/app/login/login-page/login-page.component.ts:11
source_spec: _bmad-output/implementation-artifacts/2-1-public-booking-page-foundation-landing.md
severity: low
reason: nine components use the modern styleUrl including all Epic 2 and 3 code, while six legacy src/app files still use styleUrls; both are valid non-deprecated Angular 22 API so this is purely cosmetic
status: open

### DW-25: address e2e test mutates data after fixture setup instead of overriding it

origin: migrated from legacy ledger ("Deferred from: code review of 2-1-public-booking-page-foundation-landing (2026-08-18)"), 2026-10-01
location: e2e/tests/public-booking-page.spec.ts:213
source_spec: _bmad-output/implementation-artifacts/2-1-public-booking-page-foundation-landing.md
severity: low
reason: the test calls updateDoc with deleteField after the restaurant fixture seeded, and no override path exists because restaurant.fixture.ts:39-54 hardcodes its own createRestaurantData call
status: open

### DW-26: BookingService casts raw Firestore data to Restaurant without shape validation

origin: migrated from legacy ledger ("Deferred from: code review of 2-1-public-booking-page-foundation-landing (2026-08-18)"), 2026-10-01
location: src/booking/services/booking.service.ts:43
source_spec: _bmad-output/implementation-artifacts/2-1-public-booking-page-foundation-landing.md
severity: medium
reason: line 43 spreads restaurantDoc.data() and casts to Restaurant with no runtime validation, same at :63 for PublicBookingProjection; this is an unauthenticated public read path, and only the input side (slug pattern at :26-28) is validated
status: open

### DW-27: the calendar still offers today after the restaurant has closed

origin: migrated from legacy ledger ("Deferred from: review of spec-2-2-party-size-date-selection (2026-08-21)"), 2026-10-01
location: src/booking/utils/calendar.ts:82
source_spec: _bmad-output/implementation-artifacts/spec-2-2-party-size-date-selection.md
severity: low
reason: buildMonthGrid takes (year, month, hours, todayIso) and filters only on iso < todayIso and !isOpenOn, so it has no notion of time of day and cannot know the restaurant has closed today; the diner can select today and reach the time step's "No available times for this date" empty state
status: done 2026-10-01
resolution: closed by decision - this is spec-compliant, not a defect. spec-2-2's DAY_HIDDEN row defines a hidden cell as a closed weekday or an open day before today and does not include today-after-close, and Story 2.3 already added the correct guard one layer down at availability.ts:134-135 (m <= effectiveNow), so the outcome is a clear empty state the diner can back out of
decision: 2026-10-01 close as spec-compliant and gracefully handled. Noted for Story 3-2 - the dashboard bookings date picker will face the same today-relative-to-close question, and if it is ever tightened the rule should be written once in calendar.ts and compared against the close minute for that weekday rather than end of day

### DW-28: zoned-day date math is duplicated between app and e2e helpers

origin: migrated from legacy ledger ("Deferred from: code review of spec-2-2-party-size-date-selection (2026-08-23)"), 2026-10-01
location: e2e/utils/test-helpers.ts:45
source_spec: _bmad-output/implementation-artifacts/spec-2-2-party-size-date-selection.md
severity: low
reason: now four copies rather than three - calendar.ts:29-33,41-58, e2e/utils/test-helpers.ts:45-71, and nextClosedDayIso plus nextFutureOpenDate at public-booking-page.spec.ts:17-38 and :55-75; the Epic 2 retro (F2-3) explicitly accepted this as boundary discipline between test harness and app runtime
status: done 2026-10-01
resolution: closed by prior decision - epic-2-retro-2026-09-26.md:48-50 (F2-3) accepted the duplication as-is to preserve the src/e2e boundary; noted that it has since grown to four copies

### DW-29: back-button and heading styles are copy-pasted across booking stylesheets

origin: migrated from legacy ledger ("Deferred from: code review of spec-2-2-party-size-date-selection (2026-08-23)"), 2026-10-01
location: src/booking/steps/calendar-step/calendar-step.component.scss:13
source_spec: _bmad-output/implementation-artifacts/spec-2-2-party-size-date-selection.md
severity: medium
reason: the duplication is wider than first recorded - .back-button is byte-identical across all four step stylesheets and near-identical in booking-page, and .heading is identical in four of five; extraction is blocked by the 2 kB anyComponentStyle budget so it needs a global or SCSS-mixin approach rather than utility classes
status: open

### DW-30: booking feature still hardcodes hex colors instead of the DESIGN.md tokens

origin: migrated from legacy ledger ("Deferred from: code review of spec-2-2-party-size-date-selection (2026-08-23)"), 2026-10-01
location: src/booking/pages/booking-page/booking-page.component.scss:9
source_spec: _bmad-output/implementation-artifacts/spec-2-2-party-size-date-selection.md
severity: medium
reason: the var infrastructure this entry said did not exist shipped in Story 3-1 - styles.scss:44-62 defines the tokens and the dashboard adopted them, but all four booking stepsheets still hardcode the hexes; additionally booking-page.component.scss:4-5 read var(--osef-brand-surface) and var(--osef-brand-ink) which nothing ever sets, so those two always fall through
status: open

### DW-31: BookingFlowService actions were unguarded against out-of-order invocation

origin: migrated from legacy ledger ("Deferred from: code review of spec-2-2-party-size-date-selection (2026-08-23)"), 2026-10-01
location: src/booking/services/booking-flow.service.ts:50
source_spec: _bmad-output/implementation-artifacts/spec-2-2-party-size-date-selection.md
severity: medium
reason: resolved in Story 2.5 - every action now begins with an origin check and back() is guarded by the BACK_TARGET map, covered by booking-flow.service.spec.ts:137,325
status: done 2026-09-26
resolution: already resolved in 916d8bc (feat(2-5): navigation, loading and error handling)

### DW-32: BookingFlowService needs origin checks on each transition

origin: migrated from legacy ledger ("Deferred from: planning split of spec-2-3-time-slot-selection-availability (2026-08-23)"), 2026-10-01
location: src/booking/services/booking-flow.service.ts:26
source_spec: _bmad-output/implementation-artifacts/spec-2-3-time-slot-selection-availability.md
severity: medium
reason: duplicate of the guard work recorded alongside DW-31; the guards landed with Story 2.5 and the service documents the invariant at :26-27
status: done 2026-09-26
resolution: already resolved in 916d8bc - start :50, choosePartySize :56, chooseDate :70, chooseSlot :81, confirm :91 all origin-guarded

### DW-33: e2e fixture seeds an unused restaurants/{id}/tables subcollection

origin: migrated from legacy ledger ("Deferred from: planning split of spec-2-3-time-slot-selection-availability (2026-08-23)"), 2026-10-01
location: e2e/fixtures/restaurant.fixture.ts:85
source_spec: _bmad-output/implementation-artifacts/spec-2-3-time-slot-selection-availability.md
severity: low
reason: the fixture writes and tears down a tables subcollection that the app never reads - availability runs off the embedded tableGroups array at availability.ts:81-90 - and no spec requests tableGroups, so the writes are doubly dead
status: open

### DW-34: typed details were lost on back-then-forward

origin: migrated from legacy ledger ("Deferred from: code review of spec-2-4-details-form-booking-submission (2026-09-13)"), 2026-10-01
location: src/booking/services/booking-flow.service.ts:45
source_spec: _bmad-output/implementation-artifacts/spec-2-4-details-form-booking-submission.md
severity: medium
reason: resolved in Story 2.5 - DetailsDraft is held in the flow service, seeded into the form by details-step.component.ts:43-45 and written back via saveDetails on valueChanges at :56-58, and correctly cleared only when party size, date or slot actually changes
status: done 2026-09-26
resolution: already resolved in 916d8bc - covered by booking-flow.service.spec.ts:164-274

### DW-35: e2e cleanup hardcodes the emulator project ID in four places

origin: migrated from legacy ledger ("Deferred from: code review of spec-2-4-details-form-booking-submission (2026-09-13)"), 2026-10-01
location: e2e/tests/public-booking-page.spec.ts:92
source_spec: _bmad-output/implementation-artifacts/spec-2-4-details-form-booking-submission.md
severity: low
reason: the literal firebase-crackling-fire-4704 appears at public-booking-page.spec.ts:92 and :643 plus e2e/utils/test-helpers.ts:11 and :23, while playwright.config.ts:5,59 already exports GCLOUD_PROJECT
status: open

### DW-36: dark mode never applies because nothing injects ThemingService

origin: migrated from legacy ledger ("Deferred from: code review of spec-3-1-dashboard-shell-polish-sign-out-responsive-styling (2026-09-30)"), 2026-10-01
location: src/app/theming.service.ts:34
source_spec: _bmad-output/implementation-artifacts/spec-3-1-dashboard-shell-polish-sign-out-responsive-styling.md
severity: high
reason: the service is tree-shaken away because the only references to ThemingService in src are its own definition and spec, so .dark-theme is never applied; note the class target is correct - theming.service.ts:34 sets it on document.body and styles.scss:37,54 use bare .dark-theme class selectors that body satisfies, so injecting the service is the whole fix
status: open

### DW-37: DESIGN.md dark error token misses WCAG AA contrast

origin: migrated from legacy ledger ("Deferred from: code review of spec-3-1-dashboard-shell-polish-sign-out-responsive-styling (2026-09-30)"), 2026-10-01
location: _bmad-output/planning-artifacts/ux-designs/ux-osefdetalife-2026-07-14/DESIGN.md:15
source_spec: _bmad-output/implementation-artifacts/spec-3-1-dashboard-shell-polish-sign-out-responsive-styling.md
severity: medium
reason: the original entry audited the wrong colour - it recorded ~3.76:1 for error-dark #E06060 on #252320, but that pair computes to 4.486:1 and 3.76:1 is in fact #ef4444 (Tailwind red-500) on white; the 3.76 figure came from Story 3-1's own review (spec-3-1:119), which attributed a Tailwind measurement to the DESIGN.md hex while its line 103 correctly noted the text was still on Tailwind colours. The real defect was that --osef-error had zero consumers: 15 error texts across 7 templates hardcoded text-red-500 or text-red-700
status: done 2026-10-01
resolution: resolved 2026-10-01 by adopting Angular Material's mat-text-error utility across all 15 sites in 7 templates and deleting the bespoke token. mat-text-error sets color: var(--mat-sys-error), which styles.scss:23-32 resolves via mat.system-classes() and mat.theme() to light-dark(#ba1a1a, #ffb4ab) - #ba1a1a measures 6.461:1 on surface, 5.706:1 on linen and 6.046:1 on the hardcoded #FAF7F2, passing AA everywhere, so no bespoke colour and no DESIGN.md hex are needed. --osef-error is removed from both palettes and the @theme inline bridge; DESIGN.md now directs error colour to Material's theme
decision: 2026-10-01 adopt Angular Material's mat-text-error per the Material theming guidelines and remove the custom error token - mat.theme() alone does NOT emit the utility classes, so mat.system-classes() had to be added to styles.scss or all 15 sites would have referenced a nonexistent class. Dark mode remains unaddressed per owner decision and is still unmeasurable until DW-36 lands; Material's own dark error #ffb4ab was not evaluated

### DW-38: reloading a /dashboard/* child route lands on /dashboard

origin: migrated from legacy ledger ("Deferred from: code review of spec-3-1-dashboard-shell-polish-sign-out-responsive-styling (2026-09-30)"), 2026-10-01
location: src/app/routing/guard/onboarding.guard.ts:10
source_spec: _bmad-output/implementation-artifacts/spec-3-1-dashboard-shell-polish-sign-out-responsive-styling.md
severity: high
reason: the end-state is real but the recorded cause is not - any dashboard guard failure bounces to /login (authenticated.guard.ts:22, onboarding.guard.ts:11,17,21,23) and isNotAuthenticatedGuard then sends the user to router.parseUrl('/dashboard') at authenticated.guard.ts:32, silently collapsing the child; the likely trigger is the synchronous getAuth().currentUser read at onboarding.guard.ts:10 and :33 racing auth restoration, and there is no ** wildcard route so a genuinely unmatched child renders nothing
status: open

### DW-39: e2e sign-in timeouts and PERMISSION_DENIED cleanup across Playwright workers

origin: migrated from legacy ledger ("Deferred from: code review of spec-3-1-dashboard-shell-polish-sign-out-responsive-styling (2026-09-30)"), 2026-10-01
location: e2e/utils/test-helpers.ts:9
source_spec: _bmad-output/implementation-artifacts/spec-3-1-dashboard-shell-polish-sign-out-responsive-styling.md
severity: high
reason: not a defect of the first deploy-flow test - it is structurally identical to the other four and the same timeout hit five tests across three files; the real cause is that firebase.fixture.ts:27-35 auto-fixtures call clearFirestore and clearAuth, wiping the entire shared emulator DB and all auth accounts while playwright.config.ts:36 runs multiple workers against that one emulator, so one worker's teardown deletes another worker's account mid-test
status: done 2026-10-04
resolution: fixed 2026-10-04 - removed the per-test auto-fixtures cleanupFirestore and cleanupAuth from firebase.fixture.ts, which issued a DELETE against the whole emulator database and all auth accounts after every test, and replaced them with a single wipe in e2e/global-setup.ts registered as globalSetup. Verified: baseline a1ca8d1 scores 40 passed / 10 failed with 12 PERMISSION_DENIED occurrences on a clean run; the change scores 50/50 across three consecutive runs
decision: 2026-10-04 fix by removing the per-test global wipes rather than forcing workers 1 - every test already creates uniquely keyed data (faker.internet.email emails, id-derived slugs) and no spec requests the cleanup fixtures, so the wipes bought no isolation while destroying other workers' state. connectToEmulators() was hardened in the same change: it previously gated on hostname === 'localhost' and skipped silently on any other origin, which sent the browser to the real Firebase project
