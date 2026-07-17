---
workflowStatus: 'completed'
totalSteps: 5
stepsCompleted: ['step-01-detect-mode', 'step-02-load-context', 'step-03-risk-and-testability', 'step-04-coverage-plan', 'step-05-generate-output']
lastStep: 'step-05-generate-output'
nextStep: ''
lastSaved: '2026-07-14'
workflowType: 'testarch-test-design'
inputDocuments:
  - '_bmad-output/planning-artifacts/prds/prd-osefdetalife-2026-07-12/prd.md'
  - '_bmad-output/planning-artifacts/architecture/architecture-osefdetalife-2026-07-12/ARCHITECTURE-SPINE.md'
  - '_bmad-output/planning-artifacts/epics.md'
---

# Test Design for Architecture: osefdetalife

**Purpose:** Architectural concerns, testability gaps, and NFR requirements for review by Architecture/Dev teams. Serves as a contract between QA and Engineering on what must be addressed before test development begins.

**Date:** 2026-07-14
**Author:** TEA Master Test Architect
**Status:** Architecture Review Pending
**Project:** osefdetalife
**PRD Reference:** _bmad-output/planning-artifacts/prds/prd-osefdetalife-2026-07-12/prd.md
**ADR Reference:** _bmad-output/planning-artifacts/architecture/architecture-osefdetalife-2026-07-12/ARCHITECTURE-SPINE.md

---

## Executive Summary

**Scope:** White-label restaurant booking & reservation SaaS platform for small independent restaurants in the UK. B2B2C model with embeddable widget, onboarding wizard, and restaurant dashboard.

**Business Context** (from PRD):

- **Revenue/Impact:** Flat-fee monthly subscription (no per-cover commission)
- **Problem:** Small restaurants need affordable online booking without commission fees
- **GA Launch:** ~30 hours to MVP, side project with no fixed deadline

**Architecture** (from Architecture Spine):

- **Key Decision 1:** Angular 22+ + Firebase (Firestore, Auth, Hosting)
- **Key Decision 2:** Web Components with Shadow DOM for widget isolation
- **Key Decision 3:** Serverless-event-driven, direct Firebase from browser (no API layer)

**Expected Scale:**

- Single location or small city chain (1-4 locations)
- ~50 covers per restaurant
- Low traffic volume initially

**Risk Summary:**

- **Total risks**: 10
- **High-priority (≥6)**: 3 risks requiring immediate mitigation
- **Test effort**: ~52 test scenarios (~4-8 weeks for 1 QA)

---

## Quick Guide

### 🚨 BLOCKERS - Team Must Decide (Can't Proceed Without)

**Pre-Implementation Critical Path** - These MUST be completed before QA can write integration tests:

1. **SEC-001: Input Validation Strategy** - Define validation rules for all form fields (widget, onboarding, dashboard) (recommended owner: Development team)
2. **TECH-002: Logging/Monitoring Strategy** - Implement structured logging and error tracking (recommended owner: Development team)
3. **OPS-001: Alerting Strategy** - Define alerting thresholds and notification channels (recommended owner: Development team)

**What we need from team:** Complete these 3 items pre-implementation or test development is blocked.

---

### ⚠️ HIGH PRIORITY - Team Should Validate (We Provide Recommendation, You Approve)

1. **SEC-002: CSRF Protection** - Recommend Firebase Auth tokens for CSRF protection (implementation phase)
2. **SEC-003: Rate Limiting** - Recommend Cloud Functions for rate limiting on booking API (implementation phase)
3. **TECH-001: Error Handling Strategy** - Recommend error boundaries and graceful degradation pattern (implementation phase)

**What we need from team:** Review recommendations and approve (or suggest changes).

---

### 📋 INFO ONLY - Solutions Provided (Review, No Decisions Needed)

1. **Test strategy**: E2E for critical paths, unit for business logic, integration for Firestore Security Rules
2. **Tooling**: Playwright (E2E), Vitest (unit), Firebase Emulator (integration)
3. **Tiered CI/CD**: PR (functional tests <15 min), Nightly (performance/security), Weekly (chaos/load)
4. **Coverage**: ~52 test scenarios prioritized P0-P3 with risk-based classification
5. **Quality gates**: P0 pass rate 100%, P1 pass rate ≥95%, coverage ≥80%

**What we need from team:** Just review and acknowledge (we already have the solution).

---

## For Architects and Devs - Open Topics

### Risk Assessment

**Total risks identified**: 10 (3 high-priority score ≥6, 4 medium, 3 low)

#### High-Priority Risks (Score ≥6) - IMMEDIATE ATTENTION

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner | Timeline |
|---------|----------|-------------|-------------|--------|-------|------------|-------|----------|
| **SEC-001** | **SEC** | No input validation on widget form fields | 2 | 3 | **6** | Implement input validation, sanitize all user inputs | Development team | Before MVP launch |
| **TECH-002** | **TECH** | No logging/monitoring strategy | 3 | 2 | **6** | Implement structured logging and monitoring | Development team | Before MVP launch |
| **OPS-001** | **OPS** | No alerting for production issues | 3 | 2 | **6** | Implement alerting for critical errors | Development team | Before MVP launch |

#### Medium-Priority Risks (Score 3-5)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner |
|---------|----------|-------------|-------------|--------|-------|------------|-------|
| SEC-002 | SEC | No CSRF protection on booking creation | 2 | 2 | 4 | Implement CSRF tokens or use Firebase Auth | Development team |
| SEC-003 | SEC | No rate limiting on booking API | 2 | 2 | 4 | Implement Cloud Functions rate limiting | Development team |
| PERF-001 | PERF | No performance testing or SLO definition | 2 | 2 | 4 | Define SLOs, implement performance testing | Development team |
| TECH-001 | TECH | No error handling strategy defined | 2 | 2 | 4 | Implement error boundaries, define error handling | Development team |
| DATA-001 | DATA | No data validation on Firestore writes | 2 | 2 | 4 | Implement Firestore Security Rules validation | Development team |

#### Low-Priority Risks (Score 1-2)

| Risk ID | Category | Description | Probability | Impact | Score | Action |
|---------|----------|-------------|-------------|--------|-------|--------|
| PERF-002 | PERF | No load testing for widget under traffic | 1 | 3 | 3 | Monitor |
| OPS-002 | OPS | No backup strategy for Firestore data | 1 | 3 | 3 | Monitor |

#### Risk Category Legend

- **TECH**: Technical/Architecture (flaws, integration, scalability)
- **SEC**: Security (access controls, auth, data exposure)
- **PERF**: Performance (SLA violations, degradation, resource limits)
- **DATA**: Data Integrity (loss, corruption, inconsistency)
- **BUS**: Business Impact (UX harm, logic errors, revenue)
- **OPS**: Operations (deployment, config, monitoring)

---

### NFR Testability Requirements

| NFR Category | Threshold / Requirement | Current Design Support | Gap / Decision Needed | Planned Evidence |
|--------------|-------------------------|------------------------|----------------------|------------------|
| Security | Input validation, XSS prevention, CSRF protection | Partial | Define validation rules, implement sanitization | Security tests, OWASP ZAP scans |
| Performance | Page load <2s, API response <1s | Unknown | Define SLOs, implement performance testing | Lighthouse scores, k6 load tests |
| Reliability | Error handling, retry logic, graceful degradation | Unknown | Define error handling strategy | Error boundary tests, fault injection |
| Maintainability | Test coverage ≥80%, code quality | Partial | Implement test infrastructure | Test reports, linting results |

**Unknown thresholds:** All performance and reliability thresholds are UNKNOWN and need stakeholder clarification.

**Assessment boundary:** Final PASS/CONCERNS/FAIL status belongs in `nfr-assess` after implementation evidence exists.

---

### Testability Concerns and Architectural Gaps

#### 1. Blockers to Fast Feedback (WHAT WE NEED FROM ARCHITECTURE)

| Concern | Impact | What Architecture Must Provide | Owner | Timeline |
|---------|--------|--------------------------------|-------|----------|
| **No API Layer for Mocking** | Harder to test business logic in isolation | Use Firebase Emulator for integration tests, create service mocks for unit tests | Development team | Before test development |
| **No Logging/Metrics/Error Tracking** | Difficult to diagnose issues in production | Implement structured logging, metrics collection, and error tracking | Development team | Before MVP launch |
| **No Fault Injection Testing** | Unknown behavior when Firebase services fail | Add fault injection tests for Firebase failures | Development team | Before MVP launch |
| **No Performance Testing** | Unknown performance characteristics under load | Define SLOs, implement performance testing with Lighthouse and k6 | Development team | Before MVP launch |

#### 2. Architectural Improvements Needed (WHAT SHOULD BE CHANGED)

1. **Implement Structured Logging**
   - **Current problem**: No logging framework specified
   - **Required change**: Add logging library (e.g., Angular ErrorHandler, Sentry)
   - **Impact if not fixed**: Cannot diagnose production issues
   - **Owner**: Development team
   - **Timeline**: Before MVP launch

2. **Add Error Tracking**
   - **Current problem**: No error tracking specified
   - **Required change**: Implement error tracking service (e.g., Sentry)
   - **Impact if not fixed**: Silent failures in production
   - **Owner**: Development team
   - **Timeline**: Before MVP launch

---

### Testability Assessment Summary

#### What Works Well

- ✅ Firebase Emulator provides excellent local testing environment
- ✅ Fixture architecture with auto-cleanup and faker integration
- ✅ Web Components isolation via Shadow DOM
- ✅ CI/CD pipeline configured with GitHub Actions
- ✅ Playwright + Vitest + Firebase Emulator working together

#### Accepted Trade-offs (No Action Required)

For osefdetalife Phase 1 (MVP), the following trade-offs are acceptable:

- **No API Layer** - Direct Firebase calls are acceptable for MVP; revisit if testing becomes difficult
- **No Performance Testing** - Basic Lighthouse checks sufficient for MVP; add k6 later
- **No Fault Injection** - Basic error handling sufficient for MVP; add chaos testing later

---

### Risk Mitigation Plans (High-Priority Risks ≥6)

#### SEC-001: No input validation on widget form fields (Score: 6) - CRITICAL

**Mitigation Strategy:**

1. Define validation rules for all form fields (name, email, party size, custom field)
2. Implement Angular Reactive Forms with Validators
3. Add XSS sanitization for custom fields
4. Test with malicious payloads

**Owner:** Development team
**Timeline:** Before MVP launch
**Status:** Planned
**Verification:** Security tests passing, OWASP ZAP scan clean

#### TECH-002: No logging/monitoring strategy (Score: 6) - CRITICAL

**Mitigation Strategy:**

1. Add Angular ErrorHandler for global error catching
2. Implement structured logging with console methods
3. Add Sentry for error tracking
4. Create logging service for consistent log formatting

**Owner:** Development team
**Timeline:** Before MVP launch
**Status:** Planned
**Verification:** Error tracking working, logs visible in production

#### OPS-001: No alerting for production issues (Score: 6) - CRITICAL

**Mitigation Strategy:**

1. Configure Sentry alerts for critical errors
2. Set up Firebase Monitoring alerts
3. Define alert thresholds and notification channels
4. Test alerting with simulated errors

**Owner:** Development team
**Timeline:** Before MVP launch
**Status:** Planned
**Verification:** Alerts firing correctly, team notified of issues

---

### Assumptions and Dependencies

#### Assumptions

1. Firebase Emulator is sufficient for local testing
2. Angular 22+ provides adequate testing utilities
3. Web Components Shadow DOM provides adequate isolation
4. Low traffic volume initially (no performance testing needed)

#### Dependencies

1. Firebase project setup - Required before development
2. Firebase Emulator installed - Required before testing
3. Playwright installed - Required before E2E testing

#### Risks to Plan

- **Risk**: Firebase Emulator behaves differently than production
  - **Impact**: Tests may pass locally but fail in production
  - **Contingency**: Add integration tests against staging environment

---

**End of Architecture Document**

**Next Steps for Architecture Team:**

1. Review Quick Guide (🚨/⚠️/📋) and prioritize blockers
2. Assign owners and timelines for high-priority risks (≥6)
3. Validate assumptions and dependencies
4. Provide feedback to QA on testability gaps

**Next Steps for QA Team:**

1. Wait for pre-implementation blockers to be resolved
2. Refer to companion QA doc (test-design-qa.md) for test scenarios
3. Begin test infrastructure setup (factories, fixtures, environments)