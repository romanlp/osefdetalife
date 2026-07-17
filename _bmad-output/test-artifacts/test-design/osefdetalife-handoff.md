---
title: 'TEA Test Design → BMAD Handoff Document'
version: '1.0'
workflowType: 'testarch-test-design-handoff'
inputDocuments:
  - '_bmad-output/test-artifacts/test-design-architecture.md'
  - '_bmad-output/test-artifacts/test-design-qa.md'
sourceWorkflow: 'testarch-test-design'
generatedBy: 'TEA Master Test Architect'
generatedAt: '2026-07-14'
projectName: 'osefdetalife'
---

# TEA → BMAD Integration Handoff

## Purpose

This document bridges TEA's test design outputs with BMAD's epic/story decomposition workflow (`create-epics-and-stories`). It provides structured integration guidance so that quality requirements, risk assessments, and test strategies flow into implementation planning.

## TEA Artifacts Inventory

| Artifact | Path | BMAD Integration Point |
|----------|------|------------------------|
| Test Design Document | `_bmad-output/test-artifacts/test-design-architecture.md` | Epic quality requirements, story acceptance criteria |
| Test Design Document | `_bmad-output/test-artifacts/test-design-qa.md` | Story test requirements, execution strategy |
| Risk Assessment | (embedded in test design) | Epic risk classification, story priority |
| Coverage Strategy | (embedded in test design) | Story test requirements |

## Epic-Level Integration Guidance

### Risk References

| Risk ID | Category | P×I | Recommended Story/Epic | Test Level |
|---------|----------|-----|------------------------|------------|
| SEC-001 | SEC | 6 | Epic 1 (Widget) - Input validation | E2E |
| TECH-002 | TECH | 6 | Epic 3 (Operations) - Logging/monitoring | Integration |
| OPS-001 | OPS | 6 | Epic 3 (Operations) - Alerting | Integration |

### Quality Gates

| Epic | Quality Gate | Threshold |
|------|--------------|-----------|
| Epic 1 (Widget) | P0 tests passing | 100% |
| Epic 2 (Dashboard) | P0 tests passing | 100% |
| Epic 3 (Operations) | Security tests passing | 100% |

## Story-Level Integration Guidance

### P0/P1 Test Scenarios → Story Acceptance Criteria

| Story | Test Scenario | Priority | Acceptance Criteria |
|-------|---------------|----------|---------------------|
| Widget Landing | W-001: Widget loads correctly | P0 | Widget renders on restaurant website |
| Widget Booking | W-002-W-006: Booking flow | P0 | Complete booking flow works end-to-end |
| Onboarding | O-001-O-006: Onboarding flow | P0 | Restaurant can complete onboarding |
| Dashboard | D-001-D-008: Dashboard features | P0 | Restaurant can manage bookings and settings |
| Security | S-001-S-008: Security tests | P0/P1 | All security tests passing |

### Data-TestId Requirements

| Component | data-testid | Purpose |
|-----------|-------------|---------|
| Widget Container | `widget-container` | E2E test targeting |
| Party Size Selector | `party-size-selector` | Booking flow tests |
| Date Picker | `date-picker` | Booking flow tests |
| Time Slots | `time-slots` | Booking flow tests |
| Booking Form | `booking-form` | Form validation tests |
| Confirmation | `booking-confirmation` | Success flow tests |

## Risk-to-Story Mapping

| Risk ID | Category | P×I | Recommended Story/Epic | Test Level |
|---------|----------|-----|------------------------|------------|
| SEC-001 | SEC | 6 | Epic 1 (Widget) - Input validation | E2E |
| SEC-002 | SEC | 4 | Epic 1 (Widget) - CSRF protection | E2E |
| SEC-003 | SEC | 4 | Epic 1 (Widget) - Rate limiting | Integration |
| TECH-001 | TECH | 4 | Epic 3 (Operations) - Error handling | E2E |
| TECH-002 | TECH | 6 | Epic 3 (Operations) - Logging/monitoring | Integration |
| PERF-001 | PERF | 4 | Epic 3 (Operations) - Performance testing | E2E |
| DATA-001 | DATA | 4 | Epic 1 (Widget) - Security Rules | Integration |
| OPS-001 | OPS | 6 | Epic 3 (Operations) - Alerting | Integration |
| OPS-002 | OPS | 3 | Epic 3 (Operations) - Backup strategy | Integration |
| PERF-002 | PERF | 3 | Epic 3 (Operations) - Load testing | Integration |

## Recommended BMAD → TEA Workflow Sequence

1. **TEA Test Design** (`TD`) → produces this handoff document
2. **BMAD Create Epics & Stories** → consumes this handoff, embeds quality requirements
3. **TEA ATDD** (`AT`) → generates acceptance tests per story
4. **BMAD Implementation** → developers implement with test-first guidance
5. **TEA Automate** (`TA`) → generates full test suite
6. **TEA Trace** (`TR`) → validates coverage completeness

## Phase Transition Quality Gates

| From Phase | To Phase | Gate Criteria |
|------------|----------|---------------|
| Test Design | Epic/Story Creation | All P0 risks have mitigation strategy |
| Epic/Story Creation | ATDD | Stories have acceptance criteria from test design |
| ATDD | Implementation | Failing acceptance tests exist for all P0/P1 scenarios |
| Implementation | Test Automation | All acceptance tests pass |
| Test Automation | Release | Trace matrix shows ≥80% coverage of P0/P1 requirements |