# E2E Testing

## Prerequisites

- Node.js 22+ (see `.nvmrc`)
- Firebase CLI (`npm i -g firebase-tools`)
- Dependencies installed (`npm install`)

## Setup

1. Copy `.env.example` to `.env` and fill in values
2. Start Firebase emulators: `npm run emulators`
3. Run tests: `npm run e2e`

## Running Tests

```bash
# Run all e2e tests
npm run e2e

# Run with browser visible
npm run e2e:headed

# Run with Playwright UI
npm run e2e:ui

# Debug mode (step through)
npm run e2e:debug
```

## Architecture

```
e2e/
├── fixtures/          # Playwright fixtures (setup + teardown)
│   ├── index.ts       # mergeTests entry point
│   ├── firebase.fixture.ts   # Firebase app + emulator cleanup
│   ├── auth.fixture.ts       # User creation + authentication
│   ├── restaurant.fixture.ts # Restaurant data seeding
│   ├── booking.fixture.ts    # Booking data seeding
│   ├── factories.ts          # Faker-based data factories
│   └── types.ts              # Shared type definitions
├── utils/
│   ├── firebase.ts    # Firebase app/emulator initialization
│   └── test-helpers.ts # Page helpers, formatters, cleanup
└── tests/             # Spec files
```

### Fixtures

Fixtures use Playwright's `test.extend` pattern with `mergeTests`:

- **firebase.fixture** — provides `db` and `auth` instances, auto-clears Firestore/Auth after each test
- **auth.fixture** — creates a test user and provides `authenticatedPage`
- **restaurant.fixture** — seeds a restaurant with hours and table groups
- **booking.fixture** — seeds bookings linked to a restaurant

All fixtures auto-cleanup via `use()` teardown.

### Factories

`factories.ts` uses `@faker-js/faker` to generate realistic test data:

- `createRestaurantData()` — random name, slug, hours
- `createTableGroupData()` — random capacity (2-8), count (1-5)
- `createBookingData()` — future date, random time, party size
- `createUserData()` — random email/password

All accept `overrides` partial for targeted test data.

## Best Practices

- Use `data-testid` selectors in app code for resilient tests
- Use fixture-provided data instead of hardcoding
- Keep tests independent — no shared state between specs
- Use `@if` / `@for` in Angular templates for deterministic rendering

## CI Integration

- Unit tests (`ng test`) run first
- E2E tests (`ng e2e`) run after unit tests pass
- JUnit XML output at `e2e/results/junit.xml` for CI ingestion
- HTML report at `playwright-report/` for debugging

```bash
# CI command
npm run test:ci
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Emulator already in use | Kill existing: `lsof -ti:8080 \| xargs kill -9` |
| Tests timeout | Ensure emulators running and app building |
| Flaky selectors | Use `data-testid` instead of CSS/text selectors |
| Auth emulator errors | Check `e2e/utils/firebase.ts` config matches `firebase.json` |
