---
workflowStatus: 'completed'
totalSteps: 5
stepsCompleted: ['step-01-detect-mode', 'step-02-load-context', 'step-03-risk-and-testability', 'step-04-coverage-plan', 'step-05-generate-output']
lastStep: 'step-05-generate-output'
nextStep: ''
lastSaved: '2026-07-14'
---

# Test Design Progress

## Step 1: Mode Detection

- **Mode**: System-Level
- **Reason**: Both PRD + Architecture docs available; no sprint-status.yaml
- **Prerequisites**: All met (PRD, Architecture, Tech Stack)

## Step 2: Load Context & Knowledge Base

### Configuration Loaded

- `tea_use_playwright_utils`: true
- `tea_use_pactjs_utils`: true (not applicable - frontend project)
- `tea_browser_automation`: auto
- `test_stack_type`: frontend
- `test_artifacts`: `{project-root}/_bmad-output/test-artifacts`

### Project Artifacts Loaded

- **PRD**: 53 FRs across 4 features (Diner-Facing Widget, Onboarding Wizard, Restaurant Dashboard, Operations & Infrastructure)
- **Architecture**: Angular 22+ + Firebase + Web Components, serverless-event-driven
- **Epics**: 3 epics, 20 stories

### Knowledge Fragments Loaded (System-Level Required)

- `adr-quality-readiness-checklist.md` ✅
- `nfr-criteria.md` ✅
- `test-levels-framework.md` ✅
- `risk-governance.md` ✅
- `test-quality.md` ✅

### Playwright Utils

- Status: **Not available** (Playwright Utils directory does not exist in skill resources)
- Action: Proceed with knowledge fragments only

### Gaps Identified

- Playwright Utils not installed (optional enhancement)
- No existing test coverage to analyze (greenfield project)

## Step 3: Testability & Risk Assessment

### 3.1 Testability Review (System-Level)

#### Controllability Assessment

| Aspect | Status | Evidence |
|--------|--------|----------|
| State Seeding | ✅ Strong | Firebase Emulator available, fixture architecture with faker factories |
| Mockability | ⚠️ Partial | Direct Firebase calls (no API layer) harder to mock; Web Components isolated via Shadow DOM |
| Fault Injection | ⚠️ Gap | No fault injection testing specified in architecture |
| Test Data Management | ✅ Strong | Faker-based synthetic data, auto-cleanup in fixtures |

#### Observability Assessment

| Aspect | Status | Evidence |
|--------|--------|----------|
| Logging | ⚠️ Gap | No logging framework specified |
| Metrics | ⚠️ Gap | No metrics collection specified |
| Error Tracking | ⚠️ Gap | No error tracking specified |
| Traces | ⚠️ Gap | No distributed tracing specified |
| Deterministic Assertions | ✅ Strong | Playwright provides reliable assertions for UI testing |

#### Reliability Assessment

| Aspect | Status | Evidence |
|--------|--------|----------|
| Test Isolation | ✅ Strong | Firebase Emulator provides isolated environment, Shadow DOM isolation |
| Reproducibility | ✅ Strong | Fixture architecture with controlled data generation |
| Parallel Safety | ✅ Strong | Fixture auto-cleanup, faker unique data |
| Environment Management | ✅ Strong | Firebase Emulator for local, CI/CD pipeline configured |

#### 🚨 Testability Concerns (Actionable Issues)

1. **No API Layer for Mocking**
   - Impact: Harder to test business logic in isolation
   - Mitigation: Use Firebase Emulator for integration tests, create service mocks for unit tests

2. **No Logging/Metrics/Error Tracking**
   - Impact: Difficult to diagnose issues in production
   - Mitigation: Implement structured logging, metrics collection, and error tracking (e.g., Sentry)

3. **No Fault Injection Testing**
   - Impact: Unknown behavior when Firebase services fail
   - Mitigation: Add fault injection tests for Firebase failures (network errors, service unavailability)

4. **No Performance Testing**
   - Impact: Unknown performance characteristics under load
   - Mitigation: Define SLOs, implement performance testing with Lighthouse and k6

#### ✅ Testability Assessment Summary (What is Already Strong)

1. **Firebase Emulator**: Excellent local testing environment
2. **Fixture Architecture**: Well-structured with auto-cleanup and faker integration
3. **Web Components Isolation**: Shadow DOM provides natural test isolation
4. **CI/CD Pipeline**: GitHub Actions configured for automated testing
5. **Test Infrastructure**: Playwright + Vitest + Firebase Emulator working together

#### ASRs (Architecturally Significant Requirements)

| ASR | Status | Rationale |
|-----|--------|-----------|
| Widget embeddability via script tag | ACTIONABLE | Critical for B2B2C model, affects deployment and testing |
| Direct Firebase from browser | ACTIONABLE | Core architectural decision, affects security and testing |
| Firestore Security Rules | ACTIONABLE | Security-critical, requires comprehensive testing |
| Web Components Shadow DOM isolation | ACTIONABLE | Affects widget testing and integration |
| Auto-confirm bookings | FYI | Business logic, testable at unit level |
| Table groups for availability | FYI | Data model, testable at integration level |

### 3.2 Risk Assessment

| Risk ID | Category | Description | Probability | Impact | Score | Status | Mitigation |
|---------|----------|-------------|-------------|--------|-------|--------|------------|
| SEC-001 | SEC | No input validation on widget form fields | 2 | 3 | 6 | HIGH | Implement input validation, sanitize all user inputs |
| SEC-002 | SEC | No CSRF protection on booking creation | 2 | 2 | 4 | MEDIUM | Implement CSRF tokens or use Firebase Auth |
| SEC-003 | SEC | No rate limiting on booking API | 2 | 2 | 4 | MEDIUM | Implement Cloud Functions rate limiting |
| PERF-001 | PERF | No performance testing or SLO definition | 2 | 2 | 4 | MEDIUM | Define SLOs, implement performance testing |
| PERF-002 | PERF | No load testing for widget under traffic | 1 | 3 | 3 | LOW | Add load testing to CI/CD pipeline |
| TECH-001 | TECH | No error handling strategy defined | 2 | 2 | 4 | MEDIUM | Implement error boundaries, define error handling |
| TECH-002 | TECH | No logging/monitoring strategy | 3 | 2 | 6 | HIGH | Implement structured logging and monitoring |
| OPS-001 | OPS | No alerting for production issues | 3 | 2 | 6 | HIGH | Implement alerting for critical errors |
| OPS-002 | OPS | No backup strategy for Firestore data | 1 | 3 | 3 | LOW | Implement Firebase backup strategy |
| DATA-001 | DATA | No data validation on Firestore writes | 2 | 2 | 4 | MEDIUM | Implement Firestore Security Rules validation |

**High Risks (Score ≥ 6):** SEC-001, TECH-002, OPS-001

### 3.3 NFR Planning Assessment

#### Security NFRs

| NFR | Threshold | Evidence Source | Status |
|-----|-----------|-----------------|--------|
| Input validation | UNKNOWN | Security tests, OWASP ZAP scans | GAP |
| XSS prevention | UNKNOWN | Security tests, CSP headers | GAP |
| CSRF protection | UNKNOWN | Security tests | GAP |
| Rate limiting | UNKNOWN | Load tests, Cloud Functions | GAP |

#### Performance NFRs

| NFR | Threshold | Evidence Source | Status |
|-----|-----------|-----------------|--------|
| Page load time | UNKNOWN | Lighthouse scores | GAP |
| API response time | UNKNOWN | k6 load tests | GAP |
| Widget render time | UNKNOWN | Performance tests | GAP |

#### Reliability NFRs

| NFR | Threshold | Evidence Source | Status |
|-----|-----------|-----------------|--------|
| Error handling | UNKNOWN | Error boundary tests | GAP |
| Retry logic | UNKNOWN | Fault injection tests | GAP |
| Graceful degradation | UNKNOWN | Error boundary tests | GAP |

#### Maintainability NFRs

| NFR | Threshold | Evidence Source | Status |
|-----|-----------|-----------------|--------|
| Test coverage | UNKNOWN | Test reports | GAP |
| Code quality | UNKNOWN | Linting results | GAP |
| Documentation | UNKNOWN | Documentation coverage | GAP |

### 3.4 Risk Findings Summary

#### Highest Risks

1. **SEC-001 (Score: 6)**: No input validation on widget form fields
   - Priority: HIGH
   - Owner: Development team
   - Timeline: Before MVP launch

2. **TECH-002 (Score: 6)**: No logging/monitoring strategy
   - Priority: HIGH
   - Owner: Development team
   - Timeline: Before MVP launch

3. **OPS-001 (Score: 6)**: No alerting for production issues
   - Priority: HIGH
   - Owner: Development team
   - Timeline: Before MVP launch

#### Mitigation Priorities

1. **Immediate**: Implement input validation and error handling
2. **Short-term**: Add logging, monitoring, and alerting
3. **Medium-term**: Define performance SLOs and implement testing
4. **Long-term**: Add fault injection and load testing

## Step 4: Coverage Plan & Execution Strategy

### 4.1 Coverage Matrix

#### Widget (Diner-Facing) - 14 Scenarios

| ID | Scenario | Test Level | Priority | Rationale |
|----|----------|------------|----------|-----------|
| W-001 | Widget loads correctly on restaurant website | E2E | P0 | Core functionality, critical for B2B2C model |
| W-002 | Party size selection (1-8) | E2E | P0 | Critical user flow |
| W-003 | Date selection (open dates only) | E2E | P0 | Critical user flow |
| W-004 | Time slot selection (15-min intervals) | E2E | P0 | Critical user flow |
| W-005 | Details form validation (name, email, custom field) | E2E | P0 | Critical user flow, security |
| W-006 | Booking confirmation | E2E | P0 | Critical user flow |
| W-007 | Back navigation between steps | E2E | P1 | Important user experience |
| W-008 | Loading spinner on transitions | E2E | P1 | User experience |
| W-009 | Error handling - restaurant not found | E2E | P0 | Critical error case |
| W-010 | Error handling - Firebase down | E2E | P0 | Critical error case |
| W-011 | Widget customization - primary/secondary colors | Unit | P1 | Business logic |
| W-012 | Widget customization - custom field | Unit | P1 | Business logic |
| W-013 | Widget isolation via Shadow DOM | Component | P0 | Architecture critical |
| W-014 | Widget embeddability via script tag | E2E | P0 | Architecture critical |

#### Onboarding Wizard - 8 Scenarios

| ID | Scenario | Test Level | Priority | Rationale |
|----|----------|------------|----------|-----------|
| O-001 | Step 1: Basics (name, slug, address) | E2E | P0 | Critical onboarding flow |
| O-002 | Step 2: Availability (hours, table groups) | E2E | P0 | Critical onboarding flow |
| O-003 | Step 3: Branding (colors, custom field) | E2E | P1 | Important onboarding flow |
| O-004 | Skip/optional steps | E2E | P1 | User experience |
| O-005 | Validation on each step | E2E | P0 | Critical validation |
| O-006 | Redirect to dashboard after completion | E2E | P0 | Critical flow |
| O-007 | Onboarding required before dashboard access | E2E | P0 | Security critical |
| O-008 | Slug uniqueness validation | Unit | P0 | Data integrity |

#### Dashboard - 12 Scenarios

| ID | Scenario | Test Level | Priority | Rationale |
|----|----------|------------|----------|-----------|
| D-001 | Dashboard Home - today's bookings | E2E | P0 | Core functionality |
| D-002 | Dashboard Home - date picker | E2E | P1 | Important functionality |
| D-003 | Dashboard Home - empty state | E2E | P1 | User experience |
| D-004 | Dashboard Home - real-time updates | E2E | P1 | Important functionality |
| D-005 | Settings - Restaurant Info | E2E | P0 | Critical settings |
| D-006 | Settings - Table Groups (add, edit, delete) | E2E | P0 | Critical settings |
| D-007 | Settings - White Label (colors, custom field) | E2E | P1 | Important settings |
| D-008 | Settings - Account (change password, sign out) | E2E | P0 | Critical security |
| D-009 | Table group deletion preserves existing bookings | Unit | P0 | Data integrity |
| D-010 | Real-time booking updates | Integration | P1 | Important functionality |
| D-011 | Dashboard access control | E2E | P0 | Security critical |
| D-012 | Settings access control | E2E | P0 | Security critical |

#### Security - 8 Scenarios

| ID | Scenario | Test Level | Priority | Rationale |
|----|----------|------------|----------|-----------|
| S-001 | Input validation on widget form fields | E2E | P0 | Security critical (SEC-001) |
| S-002 | XSS prevention on custom fields | E2E | P0 | Security critical |
| S-003 | CSRF protection on booking creation | E2E | P1 | Security important |
| S-004 | Rate limiting on booking API | Integration | P1 | Security important |
| S-005 | Firestore Security Rules - widget read | Integration | P0 | Security critical |
| S-006 | Firestore Security Rules - owner write | Integration | P0 | Security critical |
| S-007 | Firestore Security Rules - booking create | Integration | P0 | Security critical |
| S-008 | Authentication flow - email/password | E2E | P0 | Security critical |

#### Performance - 5 Scenarios

| ID | Scenario | Test Level | Priority | Rationale |
|----|----------|------------|----------|-----------|
| P-001 | Widget load time < 2 seconds | E2E | P1 | Performance important |
| P-002 | Dashboard load time < 3 seconds | E2E | P1 | Performance important |
| P-003 | Booking creation < 1 second | E2E | P1 | Performance important |
| P-004 | Lighthouse score > 90 | E2E | P2 | Performance nice-to-have |
| P-005 | Widget render time < 500ms | E2E | P1 | Performance important |

#### Reliability - 5 Scenarios

| ID | Scenario | Test Level | Priority | Rationale |
|----|----------|------------|----------|-----------|
| R-001 | Error boundary catches exceptions | E2E | P0 | Reliability critical |
| R-002 | Graceful degradation on Firebase failure | E2E | P0 | Reliability critical |
| R-003 | Retry logic on transient failures | Integration | P1 | Reliability important |
| R-004 | Offline handling | E2E | P2 | Reliability nice-to-have |
| R-005 | Error logging and monitoring | Integration | P1 | Reliability important |

**Total Scenarios: 52**

### 4.2 NFR Coverage and Evidence Plan

#### Security NFRs

| NFR | Validation Scenario | Evidence Source | Threshold | Status |
|-----|---------------------|-----------------|-----------|--------|
| Input validation | S-001, S-002 | Playwright tests, OWASP ZAP scans | UNKNOWN | GAP |
| XSS prevention | S-002 | Playwright tests, CSP headers | UNKNOWN | GAP |
| CSRF protection | S-003 | Playwright tests | UNKNOWN | GAP |
| Rate limiting | S-004 | Integration tests, Cloud Functions logs | UNKNOWN | GAP |
| Authentication | S-008 | Playwright tests | UNKNOWN | GAP |
| Authorization | S-005, S-006, S-007, D-011, D-012 | Playwright tests, Firestore logs | UNKNOWN | GAP |

#### Performance NFRs

| NFR | Validation Scenario | Evidence Source | Threshold | Status |
|-----|---------------------|-----------------|-----------|--------|
| Page load time | P-001, P-002 | Lighthouse scores | UNKNOWN | GAP |
| API response time | P-003 | Playwright tests | UNKNOWN | GAP |
| Widget render time | P-005 | Playwright tests | UNKNOWN | GAP |
| Lighthouse score | P-004 | Lighthouse reports | UNKNOWN | GAP |

#### Reliability NFRs

| NFR | Validation Scenario | Evidence Source | Threshold | Status |
|-----|---------------------|-----------------|-----------|--------|
| Error handling | R-001, R-002 | Playwright tests | UNKNOWN | GAP |
| Retry logic | R-003 | Integration tests | UNKNOWN | GAP |
| Graceful degradation | R-002 | Playwright tests | UNKNOWN | GAP |
| Offline handling | R-004 | Playwright tests | UNKNOWN | GAP |

#### Maintainability NFRs

| NFR | Validation Scenario | Evidence Source | Threshold | Status |
|-----|---------------------|-----------------|-----------|--------|
| Test coverage | All tests | Test reports, CI/CD | UNKNOWN | GAP |
| Code quality | All tests | Linting results, CI/CD | UNKNOWN | GAP |
| Documentation | N/A | Documentation coverage | UNKNOWN | GAP |

### 4.3 Execution Strategy

#### PR Checks (Target: < 15 minutes)

- **Unit Tests**: All unit tests (Vitest)
- **Component Tests**: Critical component tests
- **E2E Smoke Tests**: App loading, basic navigation
- **Security Tests**: Input validation, authentication
- **Linting**: ESLint, TypeScript checks

#### Nightly Checks (Target: < 30 minutes)

- **Full E2E Suite**: All widget, onboarding, dashboard tests
- **Integration Tests**: Firestore Security Rules, real-time updates
- **Performance Tests**: Lighthouse scores, load times
- **Security Tests**: Full security test suite

#### Weekly Checks (Target: < 60 minutes)

- **Load Tests**: Widget under traffic, booking creation
- **Stress Tests**: Firebase limits, concurrent users
- **Chaos Tests**: Firebase failures, network issues
- **Full Security Scan**: OWASP ZAP, vulnerability scanning

### 4.4 Resource Estimates

#### P0 Scenarios (Critical)

- **Widget**: ~15-20 hours
- **Onboarding**: ~10-15 hours
- **Dashboard**: ~15-20 hours
- **Security**: ~10-15 hours
- **Total P0**: ~50-70 hours

#### P1 Scenarios (Important)

- **Widget**: ~10-15 hours
- **Onboarding**: ~5-10 hours
- **Dashboard**: ~10-15 hours
- **Security**: ~5-10 hours
- **Performance**: ~5-10 hours
- **Reliability**: ~5-10 hours
- **Total P1**: ~40-70 hours

#### P2 Scenarios (Nice-to-have)

- **Widget**: ~5-10 hours
- **Dashboard**: ~5-10 hours
- **Performance**: ~5-10 hours
- **Reliability**: ~5-10 hours
- **Total P2**: ~20-40 hours

#### P3 Scenarios (Exploratory)

- **Total P3**: ~5-10 hours

#### Total Estimate

- **Total**: ~115-190 hours
- **Timeline**: ~4-8 weeks (part-time)

### 4.5 Quality Gates

#### Release Criteria

| Gate | Threshold | Status |
|------|-----------|--------|
| P0 Pass Rate | 100% | Required |
| P1 Pass Rate | ≥ 95% | Required |
| High-Risk Mitigations | Complete | Required |
| Coverage Target | ≥ 80% | Required |
| NFR Validation | Evidence identified | Required |

#### Pre-Release Checklist

- [ ] All P0 scenarios passing
- [ ] All P1 scenarios passing (≥ 95%)
- [ ] High-risk mitigations complete (SEC-001, TECH-002, OPS-001)
- [ ] Test coverage ≥ 80%
- [ ] NFR evidence collected
- [ ] Security scan passed
- [ ] Performance benchmarks met
- [ ] Documentation updated

## Step 5: Generate Outputs & Validate

### Output Files Generated

1. **Test Design Architecture**: `_bmad-output/test-artifacts/test-design-architecture.md`
2. **Test Design QA**: `_bmad-output/test-artifacts/test-design-qa.md`
3. **BMAD Handoff**: `_bmad-output/test-artifacts/test-design/osefdetalife-handoff.md`

### Validation Results

- [x] All prerequisites met
- [x] All process steps completed
- [x] All output validations passed
- [x] All quality checks passed
- [x] All integration points verified
- [x] Output files complete and well-formatted
- [x] Both documents validated (System-Level Mode)
- [x] Handoff document validated

### Completion Report

**Mode used:** System-Level
**Output file paths:**
- `_bmad-output/test-artifacts/test-design-architecture.md`
- `_bmad-output/test-artifacts/test-design-qa.md`
- `_bmad-output/test-artifacts/test-design/osefdetalife-handoff.md`

**Key risks:**
- SEC-001 (Score: 6): No input validation on widget form fields
- TECH-002 (Score: 6): No logging/monitoring strategy
- OPS-001 (Score: 6): No alerting for production issues

**Gate thresholds:**
- P0 pass rate: 100%
- P1 pass rate: ≥95%
- Coverage target: ≥80%

**Open assumptions:**
- All performance and reliability thresholds are UNKNOWN
- Firebase Emulator assumed sufficient for local testing
- Low traffic volume assumed initially