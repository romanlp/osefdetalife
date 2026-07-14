---
project_name: 'osefdetalife'
user_name: 'Roman'
date: '2026-07-14'
sections_completed: ['discovery', 'technology_stack', 'language_rules', 'framework_rules', 'testing_rules']
existing_patterns_found: 6
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

- Angular 22.0.6; Angular CDK/Material 22.x
- TypeScript ~6.0.3 with strict Angular template and DI checks
- Firebase ^12.15.0: Auth, Firestore, Storage, App Check, Analytics, Performance
- RxJS ~7.8.2
- Angular build/CLI 22.0.6; Vitest ^4.1.9
- SCSS with Tailwind CSS ^4.3.2
- npm package manager; production uses the Angular application builder

## Critical Implementation Rules

### Language-Specific Rules

- Preserve strict compiler behavior: `noImplicitReturns`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `isolatedModules`, and strict Angular templates.
- Avoid `any`; model Firebase/Firestore data explicitly rather than indexing untyped document data.
- Use `inject()` for Angular dependencies; prefer signals, `computed()`, and `resource()` for local async state.
- Use `async`/`await` with explicit failure handling at UI boundaries; never leave Firebase promise rejections unhandled.
- Keep source in TypeScript and colocate tests as `*.spec.ts` files next to the code.

### Framework-Specific Rules

- Use standalone components with the `osef` selector prefix; register dependencies via `imports`, not NgModules, for new code. The existing gallery and admin NgModules are legacy.
- Do not set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly in new components; Angular 22 makes it the default. Existing explicit declarations are legacy.
- Lazy-load features with `loadComponent` or `loadChildren`; protect login and admin routes with the functional guards in `routing/guard`.
- Access Firebase via `inject(Firebase)` and the providers in `common/firebase.ts`; do not initialize Firebase or construct Firestore/Storage instances inside components.
- Wrap `onSnapshot` subscriptions in an `effect()` and unregister them through `onCleanup`; use `resource()` for one-shot reads.
- Bridge RxJS to signals using `toSignal`; use native template control flow (`@if`, `@for`).
- Use `NgOptimizedImage` for static images. For new host bindings, use the component `host` object instead of `@HostBinding`.

### Testing Rules

- Run unit tests with `npm test`; tests use Vitest globals and Angular’s unit-test builder.
- Place component tests beside their source as `*.component.spec.ts`.
- Use `ng-mocks` (`MockBuilder`, `MockRender`) to isolate Angular components and feature modules.
- Test observable user behavior and state transitions; mock Firebase APIs and services rather than using live Auth, Firestore, or Storage.
- Never commit focused tests (`describe.only`, `it.only`, `test.only`). An existing `describe.only` is legacy debt, not a pattern to copy.
- Add regression coverage for Firestore subscription cleanup and Firebase failure paths when changing them.
