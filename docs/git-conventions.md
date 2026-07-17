# Git Conventions

## Branch Naming

- `story/{key}-{slug}` — feature branches for stories (e.g. `story/1-2-restaurant-data-model`)
- `fix/{issue-slug}` — bug fixes
- `chore/{description}` — maintenance tasks

Branch names must be lowercase, use hyphens as separators, and include the story key when applicable.

## Commit Messages

Format: `type(scope): description`

**Types:**
- `feat` — new feature or capability
- `fix` — bug fix
- `refactor` — code restructuring without behavior change
- `test` — adding or updating tests
- `chore` — maintenance, config, dependencies
- `docs` — documentation only

**Scope:** Story key in parentheses (e.g. `1-2`, `3-1`). Use `shared`, `widget`, `dashboard`, or `infra` for cross-cutting changes.

**Description:** Imperative mood, lowercase, no period. Max 72 characters.

**Examples:**
```
feat(1-2): add restaurant data model
fix(widget): correct booking time display
test(1-1): add e2e tests for dashboard boot
refactor(shared): consolidate firebase config
chore: update dependencies
```

## Pull Requests

- Title matches story title: `Story 1.2: Restaurant Data Model & Security Rules`
- Body includes: summary of changes, review findings status, linked story file
- PR is created automatically by the code-review workflow when all patches are resolved
