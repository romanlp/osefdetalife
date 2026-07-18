---
stepsCompleted: ['step-01-gather-context', 'step-02-review', 'step-03-triage', 'step-04-present']
lastStep: 'step-04-present'
lastSaved: '2026-07-17'
review_mode: 'full'
spec_file: '_bmad-output/implementation-artifacts/1-2-restaurant-data-model-security-rules.md'
story_key: '1-2-restaurant-data-model-security-rules'
---

# Code Review — Story 1.2: Restaurant Data Model & Security Rules

**Branch:** `story/1-2-restaurant-data-model-security-rules` vs `master`
**Review layers:** Blind Hunter, Edge Case Hunter, Acceptance Auditor
**Files changed:** 21 (10 new, 11 modified)

## Triage Summary

| Bucket | Count |
|--------|-------|
| decision-needed | 2 |
| patch | 3 |
| defer | 6 |
| dismiss | 3 |

## decision-needed Findings

### D1: Booking cancellation unreachable — rules block all updates
- **Sources:** blind+edge+auditor
- **Location:** `firestore.rules:68`, `src/shared/types/booking.ts:7`
- **Detail:** `Booking.status` includes `'cancelled'` but `allow update, delete: if false` on bookings means no code path can transition a booking from `'confirmed'` to `'cancelled'`. The type promises functionality the rules block.
- **Options:**
  1. Allow owner to update booking status to `'cancelled'` only (add `allow update: if isOwner(restaurantId) && request.resource.data.status == 'cancelled' && resource.data.status == 'confirmed'`)
  2. Remove `'cancelled'` from `Booking.status` type (bookings are immutable once created)
  3. Defer — handle in a future story when cancellation UI is built

### D2: Owner can transfer restaurant ownership to any uid
- **Sources:** blind
- **Location:** `firestore.rules:49-50`
- **Detail:** The update rule checks `resource.data.ownerId == request.auth.uid` (current owner) but never validates `request.resource.data.ownerId`. An owner can set `ownerId` to any other uid, irrevocably transferring control. `validateRestaurantData` is not called on update.
- **Options:**
  1. Add `&& request.resource.data.ownerId == resource.data.ownerId` to the update rule (owner cannot change)
  2. Allow ownership transfer with a separate mechanism (e.g., Cloud Function)
  3. Defer — accept the risk for MVP since it's a single-owner model

## patch Findings

### P1: Slug TOCTOU race — uniqueness not enforced under concurrency
- **Sources:** blind+edge+auditor
- **Location:** `src/shared/slug-utils.ts:20-23`
- **Detail:** `getDoc(slugRef)` is called outside `runTransaction`. Two concurrent requests with the same slug both pass the existence check. Both transactions succeed, and the second silently overwrites the slug mapping.
- **Fix:** Move slug existence check inside the transaction using `transaction.get(slugRef)`.

### P2: Booking `restaurantId` not validated against path parameter
- **Sources:** blind+edge
- **Location:** `firestore.rules:66-67`
- **Detail:** `validateBookingData` checks `data.restaurantId is string` but never verifies `request.resource.data.restaurantId == restaurantId` (the path parameter). A booking under `/restaurants/A/bookings/X` can claim `restaurantId: "B"`, creating cross-restaurant data corruption.
- **Fix:** Add `&& request.resource.data.restaurantId == restaurantId` to the booking create rule.

### P3: Hardcoded Java path — breaks on non-macOS-arm64
- **Sources:** blind
- **Location:** `firestore-rules-setup.ts:9`
- **Detail:** `const javaHome = '/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home'` only works on macOS ARM64 with Homebrew. CI runners, Intel Macs, and Linux will fail.
- **Fix:** Use `process.env.JAVA_HOME || detectJavaHome()` or remove the override and rely on system `JAVA_HOME`.

## defer Findings

- [x] [Review][Defer] No validation on restaurant update [firestore.rules:49-50] — deferred, owner-only context limits blast radius
- [x] [Review][Defer] Slug squatting — any authenticated user can reserve slugs [firestore.rules:76] — deferred, slug reclamation out of scope for MVP
- [x] [Review][Defer] No upper bound on partySize/capacity/count [firestore.rules:24,56-59] — deferred, application-layer validation can enforce
- [x] [Review][Defer] No string length limits on validated fields [firestore.rules:8-15,18-31] — deferred, Firestore 1 MiB doc limit provides natural bound
- [x] [Review][Defer] No email format validation [firestore.rules:27-28] — deferred, format validation better handled at app layer
- [x] [Review][Defer] Teardown race — double-resolve in emulator shutdown [firestore-rules-setup.ts:66-73] — deferred, test infrastructure only

## dismissed Findings

- **Unauthenticated booking creation (by design)** — The spec explicitly requires unauthenticated create for customer-facing widget. Dismissed.
- **Emulator stderr error detection** — Low-impact test infrastructure issue. Dismissed.
- **Slug ownership metadata** — Out of scope for MVP slug model. Dismissed.

## Severity Summary

| Severity | Count | Details |
|----------|-------|---------|
| High | 2 | D1 (booking cancellation unreachable), D2 (ownership transfer) |
| Medium | 3 | P1 (slug TOCTOU), P2 (booking path mismatch), P3 (hardcoded Java) |
| Low | 6 | All deferred findings |
