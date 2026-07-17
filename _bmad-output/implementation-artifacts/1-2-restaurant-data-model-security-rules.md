# Story 1.2: Restaurant Data Model & Security Rules

Status: ready-for-dev
baseline_commit: fbf1a247858fbc1640f1258272d1439d4fcf093c

## Story

As a developer,
I want the Firestore data model created with security rules enforced,
So that restaurant data is stored correctly and access is controlled.

## Acceptance Criteria

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

## Tasks / Subtasks

- [x] Task 1: Create Firestore Security Rules (AC: 4, 5)
  - [x] Subtask 1.1: Create `firestore.rules` file at project root
  - [x] Subtask 1.2: Define `restaurants` collection rules — public read, owner-only write
  - [x] Subtask 1.3: Define `slugs` collection rules — public read, owner-only create (no update/delete)
  - [x] Subtask 1.4: Define `bookings` subcollection rules — unauthenticated create with validation, owner-only read, no update/delete
  - [x] Subtask 1.5: Define `tables` subcollection rules — public read, owner-only write
  - [x] Subtask 1.6: Validate `request.resource.data` shape on all write paths (required fields, types, positive integers for capacity/count)
  - [x] Subtask 1.7: Enforce cross-restaurant isolation — owner can only write to `request.auth.uid == resource.data.ownerId`
  - [x] Subtask 1.8: Enforce unauthenticated booking writes reference an existing restaurant via `get(/databases/$(database)/documents/restaurants/$(request.resource.data.restaurantId))`

- [x] Task 2: Add Slug Resolution Types (AC: 3)
  - [x] Subtask 2.1: Create `src/shared/types/slug.ts` with `SlugMapping` interface (`{ slug: string; restaurantId: string }`)
  - [x] Subtask 2.2: Export from `src/shared/types/index.ts`

- [ ] Task 3: Create Slug Uniqueness Helper (AC: 3)
  - [ ] Subtask 3.1: Create `src/shared/slug-utils.ts` with `createRestaurantWithSlug()` function using Firestore `runTransaction`
  - [ ] Subtask 3.2: Function creates restaurant document + slug mapping document atomically
  - [ ] Subtask 3.3: Function rejects if slug already exists in `slugs/{slug}` collection
  - [ ] Subtask 3.4: Export from `src/shared/index.ts`

- [ ] Task 4: Update firebase.json with Firestore Rules Path (AC: 4, 5)
  - [ ] Subtask 4.1: Add `"firestore": { "rules": "firestore.rules", "indexes": "firestore.indexes.json" }` to `firebase.json`
  - [ ] Subtask 4.2: Create empty `firestore.indexes.json` at project root

- [ ] Task 5: Refine Existing Types for Data Model Alignment (AC: 1, 2)
  - [ ] Subtask 5.1: In `src/shared/types/restaurant.ts` — `OpeningHours` keys must be constrained to 1-7 (ISO day numbers)
  - [ ] Subtask 5.2: In `src/shared/types/booking.ts` — remove `'pending'` from `Booking.status` union (only `'confirmed' | 'cancelled'` per AD-7/AD-12)
  - [ ] Subtask 5.3: Verify `TableGroup` interface has `capacity: number` and `count: number` — positive integers enforced in security rules only

- [ ] Task 6: Write Security Rules Unit Tests (AC: 4, 5)
  - [ ] Subtask 6.1: Create `firestore.rules.test.ts` using `@firebase/rules-unit-testing` or emulator-based approach
  - [ ] Subtask 6.2: Test unauthenticated read on restaurant — expect ALLOW
  - [ ] Subtask 6.3: Test unauthenticated write on restaurant — expect DENY
  - [ ] Subtask 6.4: Test authenticated owner write on own restaurant — expect ALLOW
  - [ ] Subtask 6.5: Test authenticated owner write on other restaurant — expect DENY
  - [ ] Subtask 6.6: Test unauthenticated booking create with valid shape — expect ALLOW
  - [ ] Subtask 6.7: Test unauthenticated booking create with missing required fields — expect DENY
  - [ ] Subtask 6.8: Test unauthenticated booking create with invalid status (not "confirmed") — expect DENY
  - [ ] Subtask 6.9: Test slug creation — unauthenticated create denied, owner-only
  - [ ] Subtask 6.10: Test table subcollection — public read allowed, owner-only write

- [ ] Task 7: Write Type Unit Tests (AC: 1, 2, 3)
  - [ ] Subtask 7.1: Verify `SlugMapping` interface shape
  - [ ] Subtask 7.2: Verify `OpeningHours` type accepts ISO day keys 1-7
  - [ ] Subtask 7.3: Verify `Booking.status` only allows `'confirmed' | 'cancelled'`

## Dev Notes

### Architecture Patterns & Constraints

**Serverless-Event-Direct Firebase (AD-2):**
- Widget and dashboard use Firebase client SDK directly
- No API layer or Cloud Functions for MVP
- Firestore Security Rules enforce all access control
- Widget and dashboard rule sets must be authored together, not independently

**Restaurant Slug for Identification (AD-9):**
- Each restaurant has a unique slug used in widget embed
- Slug resolution uses `slugs/{slug}` lookup document, not collection query
- Firestore rules enforce slug uniqueness

**Compute on Read (AD-5):**
- Availability calculated at query time by querying existing bookings
- No pre-computed slots stored

**Auto-Confirm Bookings (AD-7):**
- Status set to "confirmed" immediately on submission
- Only "confirmed" and "cancelled" statuses exist in the model

**One Restaurant per Account (AD-13):**
- Single restaurant per auth account for MVP
- `ownerId` on restaurant document = `auth.uid`

**Consistency Conventions:**
- Entity IDs: Firestore auto-generated (no custom slugs for document IDs)
- Restaurant slug: lowercase, hyphenated, unique (e.g., `the-blue-bistro`)
- Timestamps: Firestore server timestamps (`FieldValue.serverTimestamp()`)
- Status values: lowercase strings — `confirmed`, `cancelled`
- Hours shape: `Record<number, {open: string, close: string}>` — keys are ISO day numbers (1=Monday, 7=Sunday)
- Timezone: IANA string stored on restaurant document (e.g., `Europe/London`)

### Previous Story Learnings

**From Story 1.1 (Project Scaffolding & Firebase Setup):**

**Files created/modified:**
- `src/shared/types/restaurant.ts` — `Restaurant`, `WhiteLabel`, `OpeningHours`, `DayHours`, `TableGroup`, `CustomField` interfaces
- `src/shared/types/booking.ts` — `Booking` interface
- `src/shared/types/index.ts` — barrel exports
- `src/shared/firebase-config.ts` — `getFirebaseApp()`, `getFirebaseDb()`, `getFirebaseAuth()`, `connectToEmulators()`
- `src/shared/index.ts` — barrel re-exports
- `firebase.json` — emulator config (Firestore: 8080, Auth: 9099, Hosting: 4200)

**Deferred review items relevant to this story:**
1. `Booking.date`/`time` are untyped strings — no format convention documented. Downstream parsing bugs likely. **Action for this story:** Add JSDoc comments documenting ISO 8601 date format (`YYYY-MM-DD`) and 24-hour time format (`HH:mm`).
2. `OpeningHours` allows any numeric key — no bounds check for 0-6 day range. Architecture spine says 1-7 (ISO day numbers). **Action for this story:** Add type constraint or documentation clarifying ISO day numbers (1=Monday, 7=Sunday).
3. Hardcoded color strings with no validation — `WhiteLabel.primaryColor`/`secondaryColor` accept any string. **Action for this story:** Add JSDoc documenting hex color format (`#RRGGBB`).
4. `Booking.status` includes `'pending'` but architecture only defines `'confirmed'` and `'cancelled'`. **Action for this story:** Remove `'pending'` from the union.
5. `connectToEmulators()` was never called. **Not in this story's scope** — deferred to auth/dashboard wiring.
6. Widget `loadRestaurant()` swallows all exceptions — deferred, not in scope.
7. Barrel re-exports internal types (`DayHours`, `TableGroup`) — deferred, not in scope.

**Code patterns established:**
- Types live in `src/shared/types/` as standalone files, barrel-exported via `index.ts`
- Firebase singletons use lazy initialization pattern in `firebase-config.ts`
- `import.meta.env.VITE_*` for all environment variables
- `lit` dependency used for Web Components

### Technical Requirements

**Firestore Data Model:**

```
restaurants/{restaurantId}          # Restaurant profile document
  ├── name: string                  # Required
  ├── slug: string                  # Required, unique
  ├── ownerId: string               # Required, = auth.uid
  ├── address?: string              # Optional
  ├── timezone: string              # IANA timezone (default: "UTC")
  ├── hours: Record<number, {open, close}>  # ISO day keys 1-7
  ├── whiteLabel: {primaryColor, secondaryColor}  # Hex colors
  ├── customField?: {label, required, enabled}    # Optional
  ├── onboardingComplete: boolean   # Whether onboarding wizard finished
  ├── createdAt: Timestamp          # Server timestamp
  │
  ├── tables/{tableId}              # Subcollection — table groups
  │     ├── capacity: number        # Positive integer
  │     └── count: number           # Positive integer
  │
  └── bookings/{bookingId}          # Subcollection — bookings
        ├── restaurantId: string    # Redundant for security rule lookups
        ├── date: string            # ISO 8601 (YYYY-MM-DD)
        ├── time: string            # 24-hour (HH:mm)
        ├── duration: number        # Minutes (default: 120)
        ├── partySize: number       # Positive integer
        ├── name: string            # Diner name
        ├── email: string           # Diner email
        ├── customFieldValue?: string
        ├── status: 'confirmed' | 'cancelled'
        └── createdAt: Timestamp

slugs/{slug}                        # Slug resolution collection
  └── restaurantId: string          # Reference to restaurants/{restaurantId}
```

**Security Rules Pattern:**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Restaurants — public read, owner write
    match /restaurants/{restaurantId} {
      allow read: if true;
      allow create: if request.auth != null
                    && request.auth.uid == request.resource.data.ownerId
                    && validateRestaurantData(request.resource.data);
      allow update, delete: if request.auth != null
                            && resource.data.ownerId == request.auth.uid;

      // Table groups — public read, owner write
      match /tables/{tableId} {
        allow read: if true;
        allow create, update: if request.auth != null
                              && get(/databases/$(database)/documents/restaurants/$(restaurantId)).data.ownerId == request.auth.uid
                              && request.resource.data.capacity > 0
                              && request.resource.data.count > 0;
        allow delete: if request.auth != null
                      && get(/databases/$(database)/documents/restaurants/$(restaurantId)).data.ownerId == request.auth.uid;
      }

      // Bookings — unauthenticated create (with validation), owner read
      match /bookings/{bookingId} {
        allow read: if request.auth != null
                    && get(/databases/$(database)/documents/restaurants/$(restaurantId)).data.ownerId == request.auth.uid;
        allow create: if validateBookingData(request.resource.data)
                      && isExistingRestaurant(request.resource.data.restaurantId);
        allow update, delete: if false;
      }
    }

    // Slug resolution — public read, owner create
    match /slugs/{slug} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if false;
    }
  }
}
```

**Validation helpers (define in rules):**

```
function validateRestaurantData(data) {
  return data.name is string
    && data.name.size() > 0
    && data.slug is string
    && data.slug.size() > 0
    && data.ownerId is string
    && data.ownerId == request.auth.uid
    && data.timezone is string;
}

function validateBookingData(data) {
  return data.date is string
    && data.date.size() > 0
    && data.time is string
    && data.time.size() > 0
    && data.partySize is number
    && data.partySize > 0
    && data.name is string
    && data.name.size() > 0
    && data.email is string
    && data.email.size() > 0
    && data.status == 'confirmed'
    && data.restaurantId is string;
}

function isExistingRestaurant(restaurantId) {
  return exists(/databases/$(database)/documents/restaurants/$(restaurantId));
}
```

**Slug Uniqueness Transaction Pattern:**

```typescript
import { runTransaction, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseDb } from './firebase-config';

export async function createRestaurantWithSlug(
  restaurantId: string,
  slug: string,
  data: Omit<Restaurant, 'id' | 'createdAt'>
): Promise<void> {
  const db = getFirebaseDb();
  const slugRef = doc(db, 'slugs', slug);
  const restaurantRef = doc(db, 'restaurants', restaurantId);
  const slugDoc = await getDoc(slugRef);

  if (slugDoc.exists()) {
    throw new Error(`Slug "${slug}" is already taken`);
  }

  await runTransaction(db, async (transaction) => {
    transaction.set(restaurantRef, {
      ...data,
      slug,
      createdAt: serverTimestamp(),
    });
    transaction.set(slugRef, { restaurantId });
  });
}
```

### File Structure

**NEW files to create:**
- `firestore.rules` — Firestore security rules
- `firestore.indexes.json` — Firestore indexes (empty initially)
- `src/shared/types/slug.ts` — `SlugMapping` interface
- `src/shared/slug-utils.ts` — `createRestaurantWithSlug()` helper

**MODIFY existing files:**
- `firebase.json` — add `firestore` config with rules/indexes paths
- `src/shared/types/restaurant.ts` — add JSDoc for `OpeningHours` keys (1-7), `WhiteLabel` hex format
- `src/shared/types/booking.ts` — remove `'pending'` from `Booking.status`, add JSDoc for date/time formats
- `src/shared/types/index.ts` — add `export * from './slug'`
- `src/shared/index.ts` — add `export * from './slug-utils'`

### Testing Requirements

**Security Rules Tests:**
- Use `@firebase/rules-unit-testing` package (add to devDependencies)
- Or test against running emulators with `firebase emulators:start`
- Test each collection's read/write rules independently
- Test both allowed and denied scenarios
- Validate document shape enforcement in rules

**Type Tests:**
- Verify `SlugMapping` has `slug: string` and `restaurantId: string`
- Verify `OpeningHours` accepts `Record<number, DayHours>` with keys 1-7
- Verify `Booking.status` is `'confirmed' | 'cancelled'` (no `'pending'`)
- Verify `TableGroup` has `capacity: number` and `count: number`

### Testing Standards

**ATDD approach (from project-context.md):**
- Run unit tests with `npm test` (Vitest globals)
- Place tests beside source as `*.spec.ts` files
- Use `ng-mocks` for Angular component isolation
- Mock Firebase APIs rather than using live Firestore
- Never commit focused tests (`describe.only`, `it.only`, `test.only`)

### References

- [Source: _bmad-output/planning-artifacts/architecture/architecture-osefdetalife-2026-07-12/ARCHITECTURE-SPINE.md — Data Model, Consistency Conventions, AD-2, AD-5, AD-7, AD-9, AD-13]
- [Source: _bmad-output/planning-artifacts/prds/prd-osefdetalife-2026-07-12/prd.md — FR-44, FR-45, FR-46, FR-48, FR-49, FR-50, FR-51, FR-53]
- [Source: _bmad-output/planning-artifacts/epics.md — Story 1.2 Acceptance Criteria (lines 241-274)]
- [Source: _bmad-output/implementation-artifacts/1-1-project-scaffolding-firebase-setup.md — Previous story learnings, deferred review items]
- [Source: _bmad-output/project-context.md — Testing rules, TypeScript rules, Firebase access patterns]
- [Source: src/shared/types/restaurant.ts — Existing type definitions]
- [Source: src/shared/types/booking.ts — Existing Booking type]
- [Source: src/shared/firebase-config.ts — Firebase initialization pattern]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List
- Task 1: Created `firestore.rules` with validation helpers (`validateRestaurantData`, `validateBookingData`, `isExistingRestaurant`, `isOwner`). Restaurants: public read, owner create/update/delete. Tables: public read, owner write with positive integer validation. Bookings: unauthenticated create with shape validation, owner read, no update/delete. Slugs: public read, authenticated create only.
- Task 2: Created `src/shared/types/slug.ts` with `SlugMapping` interface. Exported from barrel.

### File List
- `firestore.rules` (NEW)
- `src/shared/types/slug.ts` (NEW)
- `src/shared/types/slug.spec.ts` (NEW)
- `src/shared/types/restaurant.spec.ts` (NEW)
- `src/shared/types/booking.spec.ts` (NEW)

