#!/bin/bash
set -euo pipefail

# Mirror CI environment locally for debugging
# Usage: ./scripts/ci-local.sh

echo "=== CI Local Mirror ==="
echo ""

# Step 1: Clean install
echo "Step 1: Clean install..."
rm -rf node_modules
npm ci

# Step 2: Lint
echo ""
echo "Step 2: Lint..."
npm run lint

# Step 3: Unit tests
echo ""
echo "Step 3: Unit tests..."
npx ng test --no-watch

# Step 4: E2E tests (requires emulators)
echo ""
echo "Step 4: E2E tests..."
echo "Ensure Firebase emulators are running: npm run emulators"
npx playwright test

echo ""
echo "=== CI Local Complete ==="
