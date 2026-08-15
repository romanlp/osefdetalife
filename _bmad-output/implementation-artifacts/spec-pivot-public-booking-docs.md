---
title: 'Public Booking Page pivot — update planning documentation'
type: 'refactor'
created: '2026-08-14'
status: 'done'
baseline_commit: '42253bf26a8a3fab8cfb3156314a407154624645'
review_loop_iteration: 2
context:
  - '_bmad-output/planning-artifacts/sprint-change-proposal-2026-08-12.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The approved strategic pivot replaces the embeddable `<booking-widget>` Web Component with a first-party public booking page at `/book/{slug}`. The planning artifacts (PRD, Architecture, UX DESIGN/EXPERIENCE, epics.md) still describe the widget/embed model, so they contradict the direction every future Epic 2/3 story will build toward.

**Approach:** Execute the documentation portion of the approved sprint-change-proposal (proposals 1–19) across the six planning artifacts. Rewrite the diner-facing surface as a public booking page, rework the Deploy deliverable to a shareable booking link + QR + preview, and add AD-14. Code changes (proposal 20) are explicitly deferred by the user.

## Boundaries & Constraints

**Always:** Update only documentation files under `_bmad-output/`. Match each file's existing structure, heading levels, and tone. Keep story ACs semantically equivalent when re-terminologizing (same flow, different hosting). Update `sprint-status.yaml` only if a key is inconsistent — it was already realigned to Epic 2 stories 2-1..2-5.

**Ask First:** If any planning doc cannot be made coherent without renaming FR/NFR/AD identifiers or adding requirements beyond the approved proposal, HALT and ask before proceeding.

**Never:** No code, build, or config changes — `angular.json`, `package.json`, `vite.config.ts`, `src/widget/`, `demo.html`, `lit`, firestore rules, CI, and e2e specs are out of scope. Do not rewrite story files in `_bmad-output/implementation-artifacts/` (1-1..1-7). Do not modify the sprint-change-proposal itself.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| TERMINOLOGY_SWEEP | All four planning docs + epics.md after edits | Zero residual legacy terms: "Web Component", "Shadow DOM", "embed code", "script tag", "Vite", "booking-widget", "widget" (as the diner surface) | Stop and fix each residual occurrence — a leftover term means the doc still contradicts the pivot |
| STORY_COUNT | epics.md Epic 2 section | Exactly 5 stories (2.1–2.5); Story 2.6 Demo Page absent | If 2.6 remains, remove it |
| KEY_SYNC | sprint-status.yaml vs epics.md story keys | Keys match epics.md (2-1..2-5); no 2-6 key | Only edit sprint-status.yaml if it diverges — otherwise leave untouched |

</frozen-after-approval>

## Code Map

- `_bmad-output/planning-artifacts/prds/prd-osefdetalife-2026-07-12/prd.md` -- PRD. Touch §1 Vision, §2.3 UJ-1/UJ-2, §3 Glossary (Slug, White-Label, Embed Code), §4.1 (FR-1..11), §4.2 FR-41..43, §6.1 MVP scope, §7 SM-1/SM-4, §9 Assumptions.
- `_bmad-output/planning-artifacts/architecture/architecture-osefdetalife-2026-07-12/ARCHITECTURE-SPINE.md` -- Spine. AD-1 → Public Booking Route; delete AD-4; AD-9, AD-10 rewrite; add AD-14; update Layers, Deployment, Stack table (drop Web Components/Vite/widget build), System Diagram, Structural Seed (drop `src/widget/`), Capability map.
- `_bmad-output/planning-artifacts/ux-designs/ux-osefdetalife-2026-07-14/DESIGN.md` -- Visual spec. Frontmatter description, "Widget" block in Layout & Spacing (fixed 375px → full viewport), Shapes, Components (widget container → booking page container), Do's/Don'ts terminology.
- `_bmad-output/planning-artifacts/ux-designs/ux-osefdetalife-2026-07-14/EXPERIENCE.md` -- Experience spine. Foundation (two-surface → single diner surface), IA widget table, Voice & Tone rows, Component Patterns, State Patterns, Interaction Primitives (drop Shadow DOM/embed rows), Accessibility floor, Flow 1 & Flow 2.
- `_bmad-output/planning-artifacts/epics.md` -- Epic breakdown. Epic 2 header + overview FRs; rewrite stories 2.1–2.5; delete Story 2.6; rework Story 1.7 Deploy ACs; update FR Coverage Map rows (FR-1, FR-11, FR-41–43).
- `_bmad-output/implementation-artifacts/sprint-status.yaml` -- Verify-only; already has Epic 2 keys 2-1..2-5 and no 2-6.

## Tasks & Acceptance

**Execution:**
- [x] `_bmad-output/planning-artifacts/prds/prd-osefdetalife-2026-07-12/prd.md` -- Rework §4.1 heading + FR-1..FR-11 for the public booking page at `/book/{slug}` (full viewport, white-label via CSS custom properties, FR-11 → in-app preview); FR-41/42/43 → Booking Link Page / Copy Booking Link / Preview Booking Page (link + QR + preview); update Glossary (Slug, White-Label, Embed Code), §1 Vision, §2.3 UJ-1/UJ-2, §6.1, §7 SM-1/SM-4, §9 Assumptions -- align all diner-surface language with the page model
- [x] `_bmad-output/planning-artifacts/architecture/architecture-osefdetalife-2026-07-12/ARCHITECTURE-SPINE.md` -- AD-1 → Public Booking Route; remove AD-4; rewrite AD-9 (no embed) and AD-10 → Booking Flow; add AD-14 "Public Booking Availability Read" (unauthenticated read of bookings filtered by date + partySize for availability); drop Web Components/Vite/widget build from Stack, Layers, Deployment, Structural Seed; update System Diagram + Capability map -- single Angular app
- [x] `_bmad-output/planning-artifacts/ux-designs/ux-osefdetalife-2026-07-14/DESIGN.md` -- Widget container → booking page container; fixed min-width 375px → full viewport; remove Shadow DOM references; update Do's/Don'ts and frontmatter description -- page-based diner surface
- [x] `_bmad-output/planning-artifacts/ux-designs/ux-osefdetalife-2026-07-14/EXPERIENCE.md` -- Single-surface diner narrative (public booking page + dashboard); Flow 1 entry via shared link; Flow 2 Deploy outcome → booking link + QR + preview; update Component Patterns, State Patterns, Interaction Primitives, IA, Accessibility floor -- no embed/widget primitives
- [x] `_bmad-output/planning-artifacts/epics.md` -- Epic 2 rename to "Public Booking Journey"; rewrite stories 2.1–2.5 (widget → page, whiteLabel theming explicit in 2.1); delete Story 2.6; rework Story 1.7 ACs (booking link + QR + preview); update Epic 2 overview + FR Coverage Map -- 5 stories, page terminology
- [x] `_bmad-output/implementation-artifacts/sprint-status.yaml` -- Verify Epic 2 keys match epics.md (2-1..2-5, no 2-6) -- no edit unless diverged

**Acceptance Criteria:**
- Given the four planning docs and epics.md, when I grep for legacy terms ("Web Component", "Shadow DOM", "embed code", "script tag", "Vite", "booking-widget", "widget"), then zero matches remain.
- Given epics.md, when I read Epic 2, then it contains exactly stories 2.1–2.5 with page terminology and Story 2.6 is absent.
- Given epics.md Story 1.7, when I read the Deploy ACs, then they describe a booking link + QR + preview, not an embed snippet.
- Given ARCHITECTURE-SPINE.md, when I read it, then AD-4 is absent, AD-14 exists, and Stack/Structural Seed contain no Web Components/Vite/widget entries.
- Given prd.md §4.1, when I read FR-1, then it describes the public booking page at `/book/{slug}`, and FR-11 describes an in-app preview.
- Given prd.md §7, when I read SM-1 and SM-4, then metrics reference booking page load time and shared links (not widget load/embed count).
- Given sprint-status.yaml, when I check Epic 2 keys, then 2-1..2-5 exist with the new names and no 2-6 key remains.

## Spec Change Log

## Design Notes

Terminology substitution map (apply consistently across all files):

| Legacy | Replacement |
|---|---|
| Booking Widget / embeddable widget | Public Booking Page |
| `<booking-widget>` custom element | `/book/{slug}` route |
| Embed code / script tag / custom element | Booking link + QR code |
| Deploy page (embed snippet) | Deploy page (booking link, QR, preview) |
| Demo page | In-app preview of the booking page |
| Shadow DOM / Web Components / Vite | Remove (no longer applicable) |
| Widget load time | Booking page load time |
| "restaurants embed the widget" | "restaurants share the booking link" |

Keep the dashboard, onboarding, data model, and security-rule content intact except where a diner-surface reference forces a change. AD-14 is the one new architecture decision: bookings become unauthenticated-readable for the page's availability calc, but only when filtered by `date` + `partySize` — rules must validate those field presences (medium security risk, mitigated by filter-only reads).

## Verification

**Commands:**
- `rg -n -i "web component|shadow dom|embed|script tag|custom element|vite|booking-widget|widget" _bmad-output/planning-artifacts/prds/prd-osefdetalife-2026-07-12/prd.md _bmad-output/planning-artifacts/architecture/architecture-osefdetalife-2026-07-12/ARCHITECTURE-SPINE.md _bmad-output/planning-artifacts/ux-designs/ux-osefdetalife-2026-07-14/DESIGN.md _bmad-output/planning-artifacts/ux-designs/ux-osefdetalife-2026-07-14/EXPERIENCE.md _bmad-output/planning-artifacts/epics.md` -- **expected: no matches, or only the ALLOWLIST below. Do not narrow the regex and do not reword the allowlisted lines.**
  - **ALLOWLIST (documented exceptions — do not remove or reword):**
    - `ARCHITECTURE-SPINE.md:35` — AD-1 clarifying negation: "no embedding of code is required." (matches `embed`; the negation is intentional)
    - `ARCHITECTURE-SPINE.md:50` — AD-4 removal tombstone: "AD-4 (Web Components with Shadow DOM for Widget) — removed by the 2026-08-14 public-booking-page pivot" (matches `web component|shadow dom|widget`; mandated by the pivot to record the removal).
- `rg -n "2-6|2-1-|2-2-|2-3-|2-4-|2-5-" _bmad-output/implementation-artifacts/sprint-status.yaml _bmad-output/planning-artifacts/epics.md` -- expected: keys 2-1..2-5 present in sprint-status.yaml, no 2-6
- `rg -n "^### Story 2\." _bmad-output/planning-artifacts/epics.md` -- expected: exactly 5 matches (Story 2.1–2.5); a re-added Story 2.6 heading would surface as a 6th match
- `rg -n "^\s*2-[1-5]-" _bmad-output/implementation-artifacts/sprint-status.yaml` -- expected: all five keys 2-1..2-5 present (KEY_SYNC)

**Manual checks:**
- Read §4.1 and §4.2 of prd.md — coherent page-based flow, no orphaned widget references.
- Read AD-1, AD-9, AD-10, AD-14 in ARCHITECTURE-SPINE.md — AD numbering sequential, no duplicate IDs, rules-gap resolution is explicit.
- Read AD-10 in ARCHITECTURE-SPINE.md — titled "Party Size → Date → Times → Details → Confirmation"; no "Times → Date" order text remains in the spine, prd.md, or epics.md.
- Read Story 1.7 in epics.md — booking link `{baseUrl}/book/{slug}` + QR code + in-app preview present, and the "Booking Link" sidebar label present.
- Read Flow 1 and Flow 2 in EXPERIENCE.md — entry points and Deploy outcome match the page model.
- Cross-file key↔heading correspondence: every sprint-status.yaml key `2-N-*` (2-1..2-5) has a matching `### Story 2.N` heading in epics.md.
- Run `rg -n -w "Deploy"` across the five planning docs (prd.md, ARCHITECTURE-SPINE.md, DESIGN.md, EXPERIENCE.md, epics.md) — expected: zero matches; the "Booking Link" page/sidebar name is uniform and "Deploy" is banned as a page/sidebar name post-pivot (`-w` word boundary so the "Deployment" hosting-layer rows in ARCHITECTURE-SPINE.md are not flagged).

## Suggested Review Order

**Pivot decision (start here)**

- The public booking route replaces the embeddable widget — read this first.
  [`ARCHITECTURE-SPINE.md:31`](../planning-artifacts/architecture/architecture-osefdetalife-2026-07-12/ARCHITECTURE-SPINE.md#L31)

- Flow order locked: Party Size → Date → Times → Details → Confirmation.
  [`ARCHITECTURE-SPINE.md:85`](../planning-artifacts/architecture/architecture-osefdetalife-2026-07-12/ARCHITECTURE-SPINE.md#L85)

- The removed widget decision is recorded as a tombstone, not deleted silently.
  [`ARCHITECTURE-SPINE.md:50`](../planning-artifacts/architecture/architecture-osefdetalife-2026-07-12/ARCHITECTURE-SPINE.md#L50)

**Diner booking flow**

- UJ-1 path now includes the date step, matching AD-10.
  [`prd.md:40`](../planning-artifacts/prds/prd-osefdetalife-2026-07-12/prd.md#L40)

- FR-1..FR-10 describe the page-based flow at `/book/{slug}`.
  [`prd.md:75`](../planning-artifacts/prds/prd-osefdetalife-2026-07-12/prd.md#L75)

- FR-4 microcopy standardized ("No available times for this date").
  [`prd.md:106`](../planning-artifacts/prds/prd-osefdetalife-2026-07-12/prd.md#L106)

- FR-11 reframed as in-app preview of the booking page.
  [`prd.md:165`](../planning-artifacts/prds/prd-osefdetalife-2026-07-12/prd.md#L165)

**Security rules**

- AD-14 allows unauthenticated, filter-only availability reads on bookings.
  [`ARCHITECTURE-SPINE.md:109`](../planning-artifacts/architecture/architecture-osefdetalife-2026-07-12/ARCHITECTURE-SPINE.md#L109)

- FR-51 now names the AD-14 carve-out so owner-only and public reads stay consistent.
  [`epics.md:74`](../planning-artifacts/epics.md#L74)

**Booking Link surface**

- FR-41 renamed and scoped to link + QR (preview owned by FR-43).
  [`prd.md:437`](../planning-artifacts/prds/prd-osefdetalife-2026-07-12/prd.md#L437)

- Story 1.7 completion shows Booking Link page with link, QR, preview.
  [`epics.md:426`](../planning-artifacts/epics.md#L426)

- Slug preview uses the derived `{baseUrl}/book/{slug}`, no hardcoded domain.
  [`epics.md:327`](../planning-artifacts/epics.md#L327)

- Owner flow climax lands on the Booking Link page.
  [`EXPERIENCE.md:172`](../planning-artifacts/ux-designs/ux-osefdetalife-2026-07-14/EXPERIENCE.md#L172)

**White-label theming**

- Story 2.1 defines the white-label foundation for the public page.
  [`epics.md:465`](../planning-artifacts/epics.md#L465)

- DESIGN tokens pin selected states to `{accent}`, not platform sage.
  [`DESIGN.md:143`](../planning-artifacts/ux-designs/ux-osefdetalife-2026-07-14/DESIGN.md#L143)

- Story 2.2/2.3/2.4 ACs use `{accent}`; container radius wording aligned.
  [`epics.md:121`](../planning-artifacts/epics.md#L121)

**Structure and metrics**

- Structural seed adds `src/booking/`; capability map points there.
  [`ARCHITECTURE-SPINE.md:141`](../planning-artifacts/architecture/architecture-osefdetalife-2026-07-12/ARCHITECTURE-SPINE.md#L141)

- SM-1/SM-4 measure booking-page load and shared links, not widget metrics.
  [`prd.md:598`](../planning-artifacts/prds/prd-osefdetalife-2026-07-12/prd.md#L598)

- Deferred items (AD-14 risks, rendered HTML artifacts) logged for later.
  [`deferred-work.md`](deferred-work.md)
