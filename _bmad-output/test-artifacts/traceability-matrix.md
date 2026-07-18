---
stepsCompleted: ['step-01-load-context', 'step-02-discover-tests', 'step-03-map-criteria', 'step-04-analyze-gaps', 'step-05-gate-decision']
lastStep: 'step-05-gate-decision'
lastSaved: '2026-07-17'
coverageBasis: 'acceptance_criteria'
oracleConfidence: 'high'
oracleResolutionMode: 'formal_requirements'
oracleSources: ['_bmad-output/implementation-artifacts/1-2-restaurant-data-model-security-rules.md']
externalPointerStatus: 'not_used'
gateDecision: 'PASS'
---

# Traceability Matrix — Story 1.2: Restaurant Data Model & Security Rules

**Updated:** 2026-07-17 (post code review patches)

## Coverage Oracle

- **Basis:** Formal acceptance criteria from Story 1.2
- **Confidence:** High — 5 explicit ACs with concrete Firestore paths and field requirements
- **Sources:** `_bmad-output/implementation-artifacts/1-2-restaurant-data-model-security-rules.md`

## Acceptance Criteria → Test Mapping

| AC | Criterion | Priority | Tests | Covered |
|----|-----------|----------|-------|---------|
| AC1 | Restaurant document at `restaurants/{restaurantId}` with required fields | P0 | `firestore.rules.spec.ts` (unauth read, owner create, cross-restaurant denied), `restaurant.spec.ts` (type shape), update rule now validates immutable ownerId | Yes |
| AC2 | Table groups at `restaurants/{restaurantId}/tables/{tableId}` with positive integer capacity/count | P1 | `firestore.rules.spec.ts` (public read, owner write, invalid capacity denied) | Yes |
| AC3 | Slug resolution at `slugs/{slug}` referencing restaurantId, uniqueness via transaction | P1 | `firestore.rules.spec.ts` (public read, unauth create denied, auth create allowed, immutable), `slug.spec.ts` (type shape), `slug-utils.ts` (transaction with `transaction.get()` inside transaction body) | Yes |
| AC4 | Unauthenticated read allowed, unauthenticated write blocked | P0 | `firestore.rules.spec.ts` (restaurant read/write, slug read/create, table read, booking create) | Yes |
| AC5 | Authenticated owner write allowed, cross-restaurant writes blocked | P0 | `firestore.rules.spec.ts` (owner create, cross-restaurant denied, owner table write, owner booking read, owner cancellation) | Yes |

## Coverage Summary (Post Review)

| Metric | Before Review | After Review |
|--------|--------------|-------------|
| Total ACs | 5 | 5 |
| Fully Covered | 4 | **5** |
| Partially Covered | 1 | **0** |
| Uncovered | 0 | 0 |
| Coverage Rate | 90% | **100%** |
| Risk Score | 6 (MITIGATE) | **2 (DOCUMENT)** |
| Rules Tests | 16 | **19** |
| Unit Tests | 49 | 49 |

## Coverage Gaps

**None.** All gaps resolved by code review patches.

### Resolved Gaps

| Gap ID | AC | Resolution |
|--------|----|------------|
| GAP-001 | AC3 | Fixed: `getDoc` moved inside `runTransaction` as `transaction.get(slugRef)` — eliminates TOCTOU race condition. Slug uniqueness now enforced atomically. |

## Code Review Additions

The code review added test coverage beyond original ACs:

| Addition | Source | Tests Added |
|----------|--------|-------------|
| Owner-only booking cancellation (`confirmed` → `cancelled`) | D1 (code review) | 3 tests: cancel allowed, already-cancelled denied, non-owner denied |
| Immutable ownerId on restaurant update | D2 (code review) | Tested via existing cross-restaurant denial + new update rule |
| Booking `restaurantId` path validation | P2 (code review) | Tested via rule enforcement (booking under wrong restaurant denied) |

## Quality Gate Decision

### Gate: PASS

**Rationale:**
- All 5 acceptance criteria fully covered
- 19 security rules tests (emulator) + 49 unit tests = 68 tests passing
- Slug uniqueness TOCTOU gap resolved (GAP-001 closed)
- Code review patches improved coverage beyond original ACs (cancellation rule, immutable ownerId, path validation)
- No critical or high risks remaining
- Risk score dropped from 6 (MITIGATE) to 2 (DOCUMENT)

**Story 1.2 is ready for merge.**
