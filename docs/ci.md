# CI/CD Pipeline Guide

## Overview

The test pipeline runs on GitHub Actions with 4 stages:

1. **Lint** — ESLint + TypeScript checks
2. **Unit Tests** — Vitest via Angular CLI
3. **E2E Tests** — Playwright with Firebase emulators (2 parallel shards)
4. **Burn-In** — Flaky test detection (5 iterations, PRs + weekly cron)

## Pipeline Triggers

- Push to `main` or `develop`
- Pull requests to `main` or `develop`
- Weekly schedule (Sunday 2 AM UTC)

## Local Development

```bash
# Mirror CI locally
./scripts/ci-local.sh

# Run only tests for changed files
./scripts/test-changed.sh
```

## Required Secrets

No secrets required for basic testing. Firebase emulators run locally in CI.

If deploying to Firebase Hosting, add:
- `FIREBASE_TOKEN` — from `firebase login:ci`

## Artifacts

On failure, the pipeline uploads:
- `e2e/results/` — Playwright trace files
- `playwright-report/` — HTML test report
- JUnit XML at `e2e/results/junit.xml` for CI ingestion

## Performance Targets

| Stage | Target |
|-------|--------|
| Lint | < 2 min |
| Unit Tests | < 5 min |
| E2E (per shard) | < 10 min |
| Burn-In | < 20 min |
| Total | < 30 min |

## Troubleshooting

**Emulators fail to start in CI:**
- Check `firebase.json` configuration
- Ensure port 8080/9099 are not in use
- Increase wait time if needed

**Flaky tests in burn-in:**
- Check Playwright trace artifacts
- Review timing-sensitive assertions
- Use `data-testid` selectors for stability

**Cache misses:**
- Verify `package-lock.json` exists
- Check Playwright browser version hasn't changed
