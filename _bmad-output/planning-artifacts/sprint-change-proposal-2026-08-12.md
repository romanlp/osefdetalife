# Sprint Change Proposal

**Date:** 2026-08-12  
**Project:** osefdetalife  
**Trigger:** Strategic pivot — replace embeddable widget with first-party public booking page  
**Mode:** Incremental refinement  
**Proposed by:** Roman (Project Lead)  
**Analyzed by:** Developer agent (bmad-correct-course)

---

## 1. Issue Summary

### Problem Statement
The current product design centers on an **embeddable `<booking-widget>` Web Component** that restaurant owners paste onto their own websites via a script tag + custom element. Diners book through the widget on the restaurant's site.

### Proposed Change
Replace the widget/embed model entirely with a **first-party public booking page** on Bookable at `/book/{slug}`. Restaurant owners share a booking link (and QR code) instead of embedding code. Diners click the link and book on Bookable directly.

### Why Now
- Strategic positioning: "Booking happens on Bookable" removes friction of per-restaurant site integration
- Technical: eliminates Web Component / Shadow DOM / separate Vite build / `lit` dependency / `dist/widget` build ordering
- Integration risk discovered in Epic 1 retro: widget needed to read bookings for availability (AD-5) but rules only allowed owner reads — this pivot resolves that tension naturally
- Epic 1 already shipped the Deploy page with embed code (Story 1.7) — this change reworks that deliverable

### Evidence
- User direction (Project Lead strategic decision)
- Epic 1 retrospective surfaced AD-5/booking-rules gap that made widget viability harder
- 12+ deferred items from Story 1.1 widget scaffold are dead code under this pivot

---

## 2. Impact Analysis

### Epic Impact

| Epic | Status | Impact |
|------|--------|--------|
| **Epic 1: Restaurant Setup & Onboarding** | Done (7/7 stories) | Story 1.7 Deploy page + embed snippet + `demo.html` + `widgetBundleUrl` → rework to "share booking link + QR" page. Story 1.1 widget scaffold (Vite, `booking-widget.ts`, `lit`) = dead code to remove. CI build ordering (`build:widget` → `ng build`) eliminated. |
| **Epic 2: Public Booking Journey** (was Diner Booking Widget) | Backlog | Complete restructure: 6 stories → 5 stories. "Widget Foundation" → "Public Booking Page Foundation". Story 2.6 Demo Page removed (replaced by in-app preview). Stories 2.2–2.5 ACs mostly preserved (same flow, different hosting). |
| **Epic 3: Restaurant Dashboard & Management** | Backlog | Mostly intact. Story 3.1 dashboard shell/sidebar already built in 1.7. Deploy sidebar item → booking-link page. Bookings list (3.2) unchanged. |

**No new epics needed. Epic order unchanged.**

### Artifact Conflicts & Required Updates

| Artifact | Sections to Update |
|----------|-------------------|
| **PRD** | 4.1 Booking Widget → Public Booking Page (FR-1–11); 4.2 FR-41–43 Embed Code Page → Booking Link Page; Glossary (Slug, White-Label, Embed Code); NFR metrics (widget load time → booking page load time; embed count → link shares) |
| **Architecture** | AD-1 Widget Deployment → Public Booking Route; AD-4 Web Components/Shadow DOM → **remove**; AD-10 Widget Flow → Booking Flow; Stack table: remove Web Components, Vite, widget build; **Add AD-14** Public Booking Availability Read (resolves rules gap) |
| **UX DESIGN.md** | Widget container → Booking page container; fixed 375px → full viewport; Shadow DOM removal; Do's/Don'ts terminology |
| **UX EXPERIENCE.md** | Two-surface → single-surface narrative; Flow 1 entry from restaurant website → shared link; Flow 2 Deploy outcome embed code → booking link + QR; Component patterns update |
| **Epics.md** | Epic 2 header rename; 6 stories → 5 rewritten stories; Story 2.6 removed |
| **sprint-status.yaml** | Epic 2 story keys renamed; 2-6 removed |
| **angular.json / package.json** | Remove `build:widget` chain; remove `dist/widget` asset entry; remove `vite.config.ts`, `src/widget/`, `lit` dep |
| **CI / e2e** | Remove `widget-embed.spec.ts`, `deploy-flow.spec.ts` (widget); add booking page e2e |

### Technical Impact
- **Simplification:** Single Angular app, one Firebase Hosting deploy, no Vite widget build, no `lit`, no Shadow DOM, no build ordering dependency
- **Rules gap fix required:** AD-14 needed — unauthenticated read of bookings for availability calculation (date + partySize filter)
- **Dead code removal:** `src/widget/`, `vite.config.ts`, `booking-widget.ts`, `lit` dependency, `demo.html`
- **Environments:** Remove `widgetBundleUrl` from environment files

---

## 3. Recommended Approach

**Option 1: Direct Adjustment** ✅ **SELECTED**

### Rationale
- Not a rollback — Story 1.7 rework is a deliverable swap (embed → link); Story 1.1 dead code is cleanup
- MVP strengthened: single app, no embed friction, no web component maintenance
- All changes are rewrites within existing epic/story structure — no fundamental replan
- Epic 2 stays next; story count reduces from 6 to 5

### Effort Estimate
- **Planning artifacts:** Medium (20 targeted edits across 7 documents)
- **Code cleanup:** Low-Medium (delete `src/widget/`, `vite.config.ts`, update `angular.json`, remove `lit`)
- **Story 1.7 rework:** Low (Deploy page content swap)
- **Epic 2 implementation:** Unchanged velocity — stories are same complexity, just hosted in Angular app instead of Web Component
- **AD-14 rules fix:** Low (single rules addition)

### Risk Assessment
| Risk | Level | Mitigation |
|------|-------|------------|
| AD-14 rules change introduces security exposure | Medium | Filter queries to `date` + `partySize` only; rules validate field presence |
| Story 1.7 rework breaks onboarding E2E | Low | Update E2E test to expect booking link + QR instead of embed snippet |
| Epic 2 story keys change breaks sprint tracking | Low | Update sprint-status.yaml atomically with proposal |

### Timeline Impact
- **Zero sprint delay** — planning updates can be done in parallel with Epic 2 story creation
- Epic 2 starts with cleaner architecture (no widget debt)

---

## 4. Detailed Change Proposals

### PRD Changes (3)

**Proposal 1:** Section 4.1 "Booking Widget" → "Public Booking Page" — FR-1..11 rewritten for page route `/book/{slug}`, full viewport, whiteLabel via CSS custom properties, FR-11 becomes in-app preview.

**Proposal 2:** Section 4.2 FR-41, FR-42, FR-43 — Embed Code Page / Copy Embed Code / Demo Page Link → Booking Link Page / Copy Booking Link / Preview Booking Page (link + QR + preview).

**Proposal 3:** Glossary & NFR — Slug/White-Label/Embed Code definitions updated; "Widget load time" → "Booking page load time"; "5 restaurants embed widget" → "5 restaurants share booking link".

### Architecture Changes (4)

**Proposal 4:** AD-1 — Widget Deployment via Script Tag → Public Booking Route (booking link + QR, no embed).

**Proposal 5:** AD-4 — Web Components with Shadow DOM → **Removed entirely**.

**Proposal 6:** AD-10 — Widget Flow → Booking Flow (party size → date → time; binding: booking page UX).

**Proposal 7:** Stack Table — Remove Web Components v1, Vite, widget build; single Angular app.

**Proposal 18 (New):** AD-14 — Public Booking Availability Read (allows unauthenticated read of bookings filtered by date+partySize for availability calc).

### UX Changes (2)

**Proposal 8:** DESIGN.md — Widget container → Booking page container; fixed min-width → full viewport; Shadow DOM removal; Do's/Don'ts terminology.

**Proposal 9:** EXPERIENCE.md — Two-surface → single-surface; Flow 1 entry point changed; Flow 2 Deploy outcome changed; Component patterns updated; Widget interaction primitives removed.

### Epics Changes (6)

**Proposal 10:** Epic 2 header rename + FR list preserved.

**Proposals 11–15:** Stories 2.1–2.5 rewritten (widget → page terminology; ACs preserved; whiteLabel theming explicit in 2.1).

**Proposal 16:** Story 2.6 Demo Page removed.

**Proposal 17:** Epic 1 Story 1.7 — Deploy page content swap (embed snippet → booking link + QR + preview).

### Sprint Tracking & Build (2)

**Proposal 19:** sprint-status.yaml — Epic 2 story keys renamed; 2-6 removed.

**Proposal 20:** angular.json / package.json — Remove widget build chain, `dist/widget` asset, `vite.config.ts`, `src/widget/`, `lit`.

---

## 5. Implementation Handoff

### Change Scope Classification: **MINOR**

**Reasoning:** All changes are rewrites within existing artifacts. No fundamental replan. Epic 2 remains next with same story complexity. Code cleanup is deletion of dead paths. Single developer agent can execute.

### Handoff Recipients & Responsibilities

| Role | Responsibility |
|------|----------------|
| **Developer Agent** (Amelia) | Execute all 20 changes: update PRD, Architecture, UX DESIGN/EXPERIENCE, epics.md, sprint-status.yaml, angular.json, package.json; delete `src/widget/`, `vite.config.ts`, `demo.html`, remove `lit`; add AD-14 to Architecture |
| **Product Owner** (John) | Validate PRD FR rewrites match intent; confirm Epic 2 story ACs |
| **Architect** (Winston) | Review AD-14 rules change; confirm single-app architecture |

### Deliverables for Developer Agent
1. Updated planning artifacts (7 files)
2. Cleaned codebase (deleted widget stack)
3. Updated sprint-status.yaml
4. Architecture with AD-14 added

### Success Criteria
- All 20 proposals reflected in source artifacts
- `npm run build` works without `build:widget`
- No `lit` in package.json
- No `src/widget/` directory
- Epic 2 stories 2-1..2-5 in sprint-status.yaml with new keys
- AD-14 present in ARCHITECTURE-SPINE.md

---

## Approval

**Status:** Ready for implementation  
**Approved by:** Roman (Project Lead)  
**Date:** 2026-08-12