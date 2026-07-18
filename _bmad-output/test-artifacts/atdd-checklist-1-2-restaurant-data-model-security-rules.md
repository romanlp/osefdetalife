---
stepsCompleted: ['step-01-preflight-and-context']
lastStep: 'step-01-preflight-and-context'
lastSaved: '2026-07-17'
storyId: '1.2'
storyKey: '1-2-restaurant-data-model-security-rules'
storyFile: '_bmad-output/implementation-artifacts/1-2-restaurant-data-model-security-rules.md'
atddChecklistPath: '_bmad-output/test-artifacts/atdd-checklist-1-2-restaurant-data-model-security-rules.md'
generatedTestFiles: []
inputDocuments:
  - '_bmad-output/implementation-artifacts/1-2-restaurant-data-model-security-rules.md'
  - 'firestore.rules'
  - 'src/shared/types/restaurant.ts'
  - 'src/shared/types/booking.ts'
  - '.agents/skills/bmad-testarch-atdd/resources/knowledge/data-factories.md'
  - '.agents/skills/bmad-testarch-atdd/resources/knowledge/test-quality.md'
  - '.agents/skills/bmad-testarch-atdd/resources/knowledge/test-healing-patterns.md'
  - '.agents/skills/bmad-testarch-atdd/resources/knowledge/selector-resilience.md'
  - '.agents/skills/bmad-testarch-atdd/resources/knowledge/fixture-architecture.md'
---

# ATDD Checklist — Story 1.2: Restaurant Data Model & Security Rules

## Preflight Summary

- **Stack**: frontend (Angular + Vite + Firebase)
- **Test frameworks**: Vitest (unit), Playwright (e2e)
- **Story file**: `_bmad-output/implementation-artifacts/1-2-restaurant-data-model-security-rules.md`
- **Story status**: in-progress (Task 1 complete, Tasks 2-7 remaining)

## Red-Phase Test Scaffolds

### Task 2: Add Slug Resolution Types

| Test file | Test | Status |
|-----------|------|--------|
| `src/shared/types/slug.spec.ts` | SlugMapping has `slug: string` and `restaurantId: string` | 🔴 Red |

### Task 3: Create Slug Uniqueness Helper

| Test file | Test | Status |
|-----------|------|--------|
| `src/shared/slug-utils.spec.ts` | createRestaurantWithSlug exists and is a function | 🔴 Red |
| `src/shared/slug-utils.spec.ts` | creates restaurant + slug atomically | 🔴 Red |
| `src/shared/slug-utils.spec.ts` | rejects if slug already exists | 🔴 Red |

### Task 4: Update firebase.json

| Test file | Test | Status |
|-----------|------|--------|
| No unit test needed | firebase.json is config, validated by emulator startup | — |

### Task 5: Refine Existing Types

| Test file | Test | Status |
|-----------|------|--------|
| `src/shared/types/restaurant.spec.ts` | OpeningHours accepts keys 1-7 | 🔴 Red |
| `src/shared/types/booking.spec.ts` | Booking.status is 'confirmed' \| 'cancelled' only | 🔴 Red |
| `src/shared/types/restaurant.spec.ts` | TableGroup has capacity and count as numbers | 🔴 Red |

### Task 6: Security Rules Unit Tests

| Test file | Test | Status |
|-----------|------|--------|
| `firestore.rules.spec.ts` | Unauthenticated read on restaurant — ALLOW | 🔴 Red |
| `firestore.rules.spec.ts` | Unauthenticated write on restaurant — DENY | 🔴 Red |
| `firestore.rules.spec.ts` | Authenticated owner write on own restaurant — ALLOW | 🔴 Red |
| `firestore.rules.spec.ts` | Authenticated owner write on other restaurant — DENY | 🔴 Red |
| `firestore.rules.spec.ts` | Unauthenticated booking create valid — ALLOW | 🔴 Red |
| `firestore.rules.spec.ts` | Unauthenticated booking create missing fields — DENY | 🔴 Red |
| `firestore.rules.spec.ts` | Unauthenticated booking create invalid status — DENY | 🔴 Red |
| `firestore.rules.spec.ts` | Slug create unauthenticated — DENY | 🔴 Red |
| `firestore.rules.spec.ts` | Table public read — ALLOW | 🔴 Red |
| `firestore.rules.spec.ts` | Table owner write — ALLOW | 🔴 Red |

### Task 7: Type Unit Tests

| Test file | Test | Status |
|-----------|------|--------|
| `src/shared/types/slug.spec.ts` | SlugMapping interface shape | 🔴 Red |
| `src/shared/types/restaurant.spec.ts` | OpeningHours ISO day keys 1-7 | 🔴 Red |
| `src/shared/types/booking.spec.ts` | Booking.status only confirmed\|cancelled | 🔴 Red |
