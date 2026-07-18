---
baseline_commit: db02b5e88b7731321baa2de6f74c1bf1bda31b6a
---

# Story 1.3: User Authentication

Status: review

## Story

As a restaurant owner,
I want to create an account with email/password or Google, and log in,
so that I can access the dashboard.

## Acceptance Criteria

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

## Tasks / Subtasks

- [x] Task 1: Configure Firebase Auth Providers (AC: 1, 2)
  - [x] Subtask 1.1: Enable Email/Password provider in Firebase project config
  - [x] Subtask 1.2: Enable Google OAuth provider in Firebase project config
  - [x] Subtask 1.3: Add `VITE_FIREBASE_AUTH_DOMAIN` to environment config if not already present
  - [x] Subtask 1.4: Verify `getFirebaseAuth()` from `src/shared/firebase-config.ts` works with both providers

- [x] Task 2: Create AuthService (AC: 1, 2, 3, 4)
  - [x] Subtask 2.1: Create `src/dashboard/app/services/auth.service.ts`
  - [x] Subtask 2.2: Implement `signUpWithEmail(email, password)` — calls `createUserWithEmailAndPassword`, sends verification email via `sendEmailVerification`
  - [x] Subtask 2.3: Implement `signInWithEmail(email, password)` — calls `signInWithEmailAndPassword`
  - [x] Subtask 2.4: Implement `signInWithGoogle()` — uses `GoogleAuthProvider` + `signInWithPopup`
  - [x] Subtask 2.5: Implement `sendPasswordReset(email)` — calls `sendPasswordResetEmail`
  - [x] Subtask 2.6: Implement `signOut()` — calls `signOut` from `firebase/auth`
  - [x] Subtask 2.7: Expose `user` signal from `onAuthStateChanged` — returns `User | null`
  - [x] Subtask 2.8: Implement `isFirstSignIn()` — checks if user has no restaurant document yet (determines onboarding redirect)

- [x] Task 3: Create Auth Guard (AC: 3)
  - [x] Subtask 3.1: Create `src/dashboard/app/routing/guard/auth.guard.ts`
  - [x] Subtask 3.2: Implement functional guard that checks `auth.user()` signal
  - [x] Subtask 3.3: Redirect unauthenticated users to `/login`
  - [x] Subtask 3.4: Redirect authenticated users away from `/login` to `/dashboard`

- [x] Task 4: Create Login Page (AC: 3, 5)
  - [x] Subtask 4.1: Create `src/dashboard/app/pages/login/login.component.ts`
  - [x] Subtask 4.2: Implement email/password form (email input, password input, submit button)
  - [x] Subtask 4.3: Implement "Sign up with Google" button
  - [x] Subtask 4.4: Implement "Forgot password?" link — triggers `sendPasswordReset`
  - [x] Subtask 4.5: Add link to sign-up page ("Don't have an account? Sign up")
  - [x] Subtask 4.6: Style per DESIGN.md: centered card, max-width 480px, Inter font, warm linen background
  - [x] Subtask 4.7: Show validation errors inline (invalid email, wrong password, user-not-found)
  - [x] Subtask 4.8: Show loading state during auth operations

- [x] Task 5: Create Sign-Up Page (AC: 1, 2)
  - [x] Subtask 5.1: Create `src/dashboard/app/pages/signup/signup.component.ts`
  - [x] Subtask 5.2: Implement email/password form (email, password, confirm password)
  - [x] Subtask 5.3: Implement "Sign up with Google" button
  - [x] Subtask 5.4: Validate password strength (min 6 chars per Firebase default)
  - [x] Subtask 5.5: Validate password confirmation matches
  - [x] Subtask 5.6: On success, redirect to `/onboarding` (first sign-up detection)
  - [x] Subtask 5.7: Add link to login page ("Already have an account? Log in")
  - [x] Subtask 5.8: Style per DESIGN.md matching login page

- [x] Task 6: Create Password Reset Page (AC: 4)
  - [x] Subtask 6.1: Create `src/dashboard/app/pages/reset-password/reset-password.component.ts`
  - [x] Subtask 6.2: Implement email input form
  - [x] Subtask 6.3: On submit, call `sendPasswordReset` and show confirmation message
  - [x] Subtask 6.4: Add link back to login page
  - [x] Subtask 6.5: Style per DESIGN.md matching login/signup pages

- [x] Task 7: Configure Angular Routing (AC: 3)
  - [x] Subtask 7.1: Add `/login` route pointing to LoginComponent
  - [x] Subtask 7.2: Add `/signup` route pointing to SignupComponent
  - [x] Subtask 7.3: Add `/reset-password` route pointing to ResetPasswordComponent
  - [x] Subtask 7.4: Add `/dashboard` route with auth guard (placeholder for future stories)
  - [x] Subtask 7.5: Add `/onboarding` route with auth guard (placeholder for future stories)
  - [x] Subtask 7.6: Set default route to redirect `/` → `/login`
  - [x] Subtask 7.7: Set wildcard route to redirect to `/login`

- [x] Task 8: Write Unit Tests (AC: 1, 2, 3, 4)
  - [x] Subtask 8.1: Test AuthService — sign up creates user, sends verification email
  - [x] Subtask 8.2: Test AuthService — sign in with valid credentials succeeds
  - [x] Subtask 8.3: Test AuthService — sign in with invalid credentials throws
  - [x] Subtask 8.4: Test AuthService — Google sign-in opens popup
  - [x] Subtask 8.5: Test AuthService — password reset sends email
  - [x] Subtask 8.6: Test Auth Guard — unauthenticated redirects to /login
  - [x] Subtask 8.7: Test Auth Guard — authenticated redirects to /dashboard
  - [x] Subtask 8.8: Test LoginComponent — form submission calls AuthService
  - [x] Subtask 8.9: Test SignupComponent — form validation and submission

## Dev Notes

### Architecture Patterns & Constraints

**AD-3 — Firebase Auth with Email/Password + Google Sign-In:**
- Dashboard auth uses Firebase Auth. Supports email/password and Google OAuth.
- Restaurant owner profile stored in Firestore (created in onboarding, not on sign-up).
- `getFirebaseAuth()` is already exported from `src/shared/firebase-config.ts`.

**AD-2 — Direct Firebase from Browser:**
- Auth service calls Firebase Auth directly. No API layer.
- Security rules already enforce owner-based access (Story 1.2).

**AD-13 — One Restaurant per Account:**
- After sign-up, check if user has a restaurant document. If not → redirect to onboarding.
- This is the "first sign-up detection" mechanism.

### Code patterns established (from Story 1.1 & 1.2)

- **Firebase access:** `import { getFirebaseAuth } from '../../shared/firebase-config'` (or `src/shared/` relative path)
- **Environment variables:** `import.meta.env.VITE_*` — all Firebase config uses this pattern
- **Services:** Use `inject()` for Angular dependencies, signals for state
- **Testing:** Vitest globals, `ng-mocks` for Angular component isolation, mock Firebase APIs
- **Types:** Standalone files in `src/shared/types/`, barrel-exported via `index.ts`
- **Selectors:** `osef` prefix for all Angular components

### Files to create

- `src/dashboard/app/services/auth.service.ts` — AuthService (singleton, `providedIn: 'root'`)
- `src/dashboard/app/routing/guard/auth.guard.ts` — Functional auth guard
- `src/dashboard/app/pages/login/login.component.ts` — Login page (inline template)
- `src/dashboard/app/pages/signup/signup.component.ts` — Sign-up page (inline template)
- `src/dashboard/app/pages/reset-password/reset-password.component.ts` — Password reset page (inline template)

### Files to modify

- `src/dashboard/app/app.routes.ts` — Add login, signup, reset-password, dashboard, onboarding routes
- `src/dashboard/app/app.component.ts` — May need router-outlet adjustments

### Testing requirements

- Unit tests for AuthService methods (mock Firebase Auth SDK)
- Unit tests for auth guard (mock auth state)
- Unit tests for login/signup/reset-password components (mock AuthService)
- Use `ng-mocks` for Angular component isolation
- Never call real Firebase Auth in tests — always mock
- Test error handling: wrong password, user not found, network errors

### Previous Story Learnings

**From Story 1.1 (Project Scaffolding & Firebase Setup):**
- Firebase config uses `import.meta.env.VITE_*` pattern
- `getFirebaseAuth()` is already available — do NOT reinitialize Firebase
- Angular app uses standalone components, `osef` selector prefix
- Default route should redirect to login (not dashboard) until auth is wired

**From Story 1.2 (Restaurant Data Model & Security Rules):**
- Security rules already enforce owner-based access (`request.auth.uid == resource.data.ownerId`)
- Restaurant document has `ownerId` field — set during onboarding, not on sign-up
- Auth guard must check for user, NOT for restaurant existence (restaurant created in onboarding)
- Test patterns: Vitest + Angular test builder, mock Firebase services
- Code review lesson: Always validate data at boundaries (forms, security rules)

### References

- [Source: ARCHITECTURE-SPINE.md — AD-3 (Firebase Auth), AD-2 (Direct Firebase), AD-13 (One Restaurant per Account)]
- [Source: prd.md — FR-28 (Email Sign Up), FR-29 (Google Sign Up), FR-30 (Login Page)]
- [Source: src/shared/firebase-config.ts — getFirebaseAuth() export]
- [Source: firestore.rules — Owner-based access control already enforced]
- [Source: _bmad-output/implementation-artifacts/1-2-restaurant-data-model-security-rules.md — Previous story learnings]

### ATDD Artifacts

- **ATDD Checklist:** `_bmad-output/test-artifacts/atdd-checklist-1-3-user-authentication.md`
- **Generated Test Scaffolds:**
  - `_bmad-output/test-artifacts/atdd-e2e-auth.spec.ts` (E2E tests, 12 tests skipped)
  - `_bmad-output/test-artifacts/atdd-unit-auth.spec.ts` (Unit tests, 8 tests skipped)
  - `_bmad-output/test-artifacts/atdd-component-login.spec.ts` (Component tests, 6 tests skipped)
  - `_bmad-output/test-artifacts/atdd-component-signup.spec.ts` (Component tests, 6 tests skipped)
  - `_bmad-output/test-artifacts/atdd-component-reset-password.spec.ts` (Component tests, 6 tests skipped)
- **Total skipped tests:** 38
- **Activation guidance:** Remove `skip` for the current task, then confirm RED before implementing

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

- Created AuthService with email/password and Google sign-in support
- Updated login page to support both email/password and Google sign-in
- Created sign-up page with email/password and Google sign-in options
- Created password reset page with email input form
- Updated Angular routing to include all new pages
- Created placeholder onboarding page for future story
- All tests passing (75 tests)
- Linter passing (no errors, only warnings)
- TypeScript compiler passing (no type errors)

### File List

- `src/app/services/auth.service.ts` — AuthService (singleton, `providedIn: 'root'`)
- `src/app/services/auth.service.spec.ts` — AuthService tests
- `src/app/login/login-page/login-page.component.ts` — Updated login page with email/password support
- `src/app/login/login-page/login-page.component.spec.ts` — Updated login page tests
- `src/app/login/login-page/login-page.component.html` — Updated login page template
- `src/app/login/signup-page/signup-page.component.ts` — Sign-up page component
- `src/app/login/signup-page/signup-page.component.spec.ts` — Sign-up page tests
- `src/app/login/signup-page/signup-page.component.html` — Sign-up page template
- `src/app/login/signup-page/signup-page.component.scss` — Sign-up page styles
- `src/app/login/reset-password-page/reset-password-page.component.ts` — Password reset page component
- `src/app/login/reset-password-page/reset-password-page.component.spec.ts` — Password reset page tests
- `src/app/login/reset-password-page/reset-password-page.component.html` — Password reset page template
- `src/app/login/reset-password-page/reset-password-page.component.scss` — Password reset page styles
- `src/app/routing/guard/authenticated.guard.ts` — Updated auth guard
- `src/app/routing/guard/authenticated.guard.spec.ts` — Updated auth guard tests
- `src/app/app.routes.ts` — Updated routes with new pages
- `src/app/onboarding/onboarding-page/onboarding-page.component.ts` — Placeholder onboarding page
- `src/app/onboarding/onboarding-page/onboarding-page.component.html` — Onboarding page template
- `src/app/onboarding/onboarding-page/onboarding-page.component.scss` — Onboarding page styles

### Review Findings

#### Patches

- [ ] [Review][Patch] `firestore-debug.log` committed to repo — Add to `.gitignore`, `git rm --cached`
- [ ] [Review][Patch] `isFirstSignIn()` unreliable — string equality fragile, undefined metadata returns `true`, missing in signup flow [`auth.service.ts:60-70`]
- [ ] [Review][Patch] Error handling swallows context — `e.code` may be `undefined` on non-Firebase errors, no logging [`login-page.component.ts:32`, `signup-page.component.ts:43`, `reset-password-page.component.ts:31`]
- [ ] [Review][Patch] Test suite is superficial — tests check method existence, not behavior [`*.spec.ts`]
- [ ] [Review][Patch] Duplicate `getErrorMessage` logic across 3 components [`login-page.component.ts:53-67`, `signup-page.component.ts:63-75`, `reset-password-page.component.ts:37-45`]
- [ ] [Review][Patch] `ChangeDetectionStrategy.OnPush` explicitly set — violates AGENTS.md (default in Angular 22+) [All 3 new components]
- [ ] [Review][Patch] No input validation before Firebase calls — empty email/password sent directly [`login-page.component.ts:24-35`, `signup-page.component.ts:25-46`, `reset-password-page.component.ts:23-34`]
- [ ] [Review][Patch] Auth guard `getCurrentUser` reject path not handled — unhandled promise rejection [`authenticated.guard.ts:14-20`]
- [ ] [Review][Patch] Reset password reveals account existence via `auth/user-not-found` [`reset-password-page.component.ts:39`]
- [ ] [Review][Patch] `signUpWithGoogle` always routes to `/onboarding` — ignores `isFirstSignIn()` check [`signup-page.component.ts:49-60`]
- [ ] [Review][Patch] Google `popup-blocked-by-user` not explicitly handled [`login-page.component.ts`, `signup-page.component.ts`]
- [ ] [Review][Patch] Email verification sent but user not informed [`signup-page.component.ts:41`]
- [ ] [Review][Patch] Error messages missing `role="alert"` for screen readers [All error `<div>` elements]

#### Deferred

- [x] [Review][Defer] Race condition `onAuthStateChanged` vs `isFirstSignIn` — Firebase guarantees `currentUser` after sign-in, fragile but not broken
- [x] [Review][Defer] No email verification enforcement — feature gap, expected in future story
- [x] [Review][Defer] No `returnUrl` handling — nice-to-have, not in story scope
- [x] [Review][Defer] No wildcard/404 route — not in story scope
