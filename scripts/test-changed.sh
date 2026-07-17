#!/bin/bash
set -euo pipefail

# Run tests for files changed since main branch
# Usage: ./scripts/test-changed.sh [base-branch]

BASE_BRANCH="${1:-main}"

echo "Detecting changed files against $BASE_BRANCH..."
CHANGED_FILES=$(git diff --name-only "$BASE_BRANCH"...HEAD)

if [ -z "$CHANGED_FILES" ]; then
  echo "No changed files detected."
  exit 0
fi

echo "Changed files:"
echo "$CHANGED_FILES"
echo ""

# Run unit tests if any src/ files changed
if echo "$CHANGED_FILES" | grep -q "^src/"; then
  echo "Running unit tests (src/ changes detected)..."
  npx ng test --no-watch
fi

# Run e2e tests if any e2e/ or src/ files changed
if echo "$CHANGED_FILES" | grep -qE "^(e2e/|src/)"; then
  echo "Running e2e tests (e2e/ or src/ changes detected)..."
  npx playwright test
fi

echo "Done."
