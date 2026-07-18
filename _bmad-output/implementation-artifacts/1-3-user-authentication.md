# Story 1.3: User Authentication

Status: ready-for-dev

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

- [ ] Task 1: Configure Firebase Auth Providers (AC: 1, 2)
  - [ ] Subtask 1.1: Enable Email/Password provider in Firebase project config
  - [ ] Subtask 1.2: Enable Google OAuth provider in Firebase project config
  - [ ] Subtask 1.3: Add `VITE_FIREBASE_AUTH_DOMAIN` to environment config if not already present
  - [ ] Subtask 1.4: Verify `getFirebaseAuth()` from `src/shared/firebase-config.ts` works with both providers

- [ ] Task 2: Create AuthService (AC: 1, 2, 3, 4)
  - [ ] Subtask 2.1: Create `src/dashboard/app/services/auth.service.ts`
  - [ ] Subtask 2.2: Implement `signUpWithEmail(email, password)` — calls `createUserWithEmailAndPassword`, sends verification email via `sendEmailVerification`
  - [ ] Subtask 2.3: Implement `signInWithEmail(email, password)` — calls `signInWithEmailAndPassword`
  - [ ] Subtask 2.4: Implement `signInWithGoogle()` — uses `GoogleAuthProvider` + `signInWithPopup`
  - [ ] Subtask 2.5: Implement `sendPasswordReset(email)` — calls `sendPasswordResetEmail`
  - [ ] Subtask 2.6: Implement `signOut()` — calls `signOut` from `firebase/auth`
  - [ ] Subtask 2.7: Expose `user` signal from `onAuthStateChanged` — returns `User | null`
  - [ ] Subtask 2.8: Implement `isFirstSignIn()` — checks if user has no restaurant document yet (determines onboarding redirect)

- [ ] Task 3: Create Auth Guard (AC: 3)
  - [ ] Subtask 3.1: Create `src/dashboard/app/routing/guard/auth.guard.ts`
  - [ ] Subtask 3.2: Implement functional guard that checks `auth.user()` signal
  - [ ] Subtask 3.3: Redirect unauthenticated users to `/login`
  - [ ] Subtask 3.4: Redirect authenticated users away from `/login` to `/dashboard`

- [ ] Task 4: Create Login Page (AC: 3, 5)
  - [ ] Subtask 4.1: Create `src/dashboard/app/pages/login/login.component.ts`
  - [ ] Subtask 4.2: Implement email/password form (email input, password input, submit button)
  - [ ] Subtask 4.3: Implement "Sign up with Google" button
  - [ ] Subtask 4.4: Implement "Forgot password?" link — triggers `sendPasswordReset`
  - [ ] Subtask 4.5: Add link to sign-up page ("Don't have an account? Sign up")
  - [ ] Subtask 4.6: Style per DESIGN.md: centered card, max-width 480px, Inter font, warm linen background
  - [ ] Subtask 4.7: Show validation errors inline (invalid email, wrong password, user-not-found)
  - [ ] Subtask 4.8: Show loading state during auth operations

- [ ] Task 5: Create Sign-Up Page (AC: 1, 2)
  - [ ] Subtask 5.1: Create `src/dashboard/app/pages/signup/signup.component.ts`
  - [ ] Subtask 5.2: Implement email/password form (email, password, confirm password)
  - [ ] Subtask 5.3: Implement "Sign up with Google" button
  - [ ] Subtask 5.4: Validate password strength (min 6 chars per Firebase default)
  - [ ] Subtask 5.5: Validate password confirmation matches
  - [ ] Subtask 5.6: On success, redirect to `/onboarding` (first sign-up detection)
  - [ ] Subtask 5.7: Add link to login page ("Already have an account? Log in")
  - [ ] Subtask 5.8: Style per DESIGN.md matching login page

- [ ] Task 6: Create Password Reset Page (AC: 4)
  - [ ] Subtask 6.1: Create `src/dashboard/app/pages/reset-password/reset-password.component.ts`
  - [ ] Subtask 6.2: Implement email input form
  - [ ] Subtask 6.3: On submit, call `sendPasswordReset` and show confirmation message
  - [ ] Subtask 6.4: Add link back to login page
  - [ ] Subtask 6.5: Style per DESIGN.md matching login/signup pages

- [ ] Task 7: Configure Angular Routing (AC: 3)
  - [ ] Subtask 7.1: Add `/login` route pointing to LoginComponent
  - [ ] Subtask 7.2: Add `/signup` route pointing to SignupComponent
  - [ ] Subtask 7.3: Add `/reset-password` route pointing to ResetPasswordComponent
  - [ ] Subtask 7.4: Add `/dashboard` route with auth guard (placeholder for future stories)
  - [ ] Subtask 7.5: Add `/onboarding` route with auth guard (placeholder for future stories)
  - [ ] Subtask 7.6: Set default route to redirect `/` → `/login`
  - [ ] Subtask 7.7: Set wildcard route to redirect to `/login`

- [ ] Task 8: Write Unit Tests (AC: 1, 2, 3, 4)
  - [ ] Subtask 8.1: Test AuthService — sign up creates user, sends verification email
  - [ ] Subtask 8.2: Test AuthService — sign in with valid credentials succeeds
  - [ ] Subtask 8.3: Test AuthService — sign in with invalid credentials throws
  - [ ] Subtask 8.4: Test AuthService — Google sign-in opens popup
  - [ ] Subtask 8.5: Test AuthService — password reset sends email
  - [ ] Subtask 8.6: Test Auth Guard — unauthenticated redirects to /login
  - [ ] Subtask 8.7: Test Auth Guard — authenticated redirects to /dashboard
  - [ ] Subtask 8.8: Test LoginComponent — form submission calls AuthService
  - [ ] Subtask 8.9: Test SignupComponent — form validation and submission

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

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
