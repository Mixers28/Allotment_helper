# docs/TEST_PLAN.md

## 0) Purpose
Define what to test, when to test it, and the minimum pass criteria for the **Initial Milestone** (end of Sprint 5). This plan is sprint-aligned and intentionally lightweight.

## 1) Test environments
### Local
- Web: `http://localhost:<port>`
- API: `http://localhost:<port>`
- DB: Postgres (local container)

### CI
- Runs on every PR and main branch merge:
  - lint
  - unit tests
  - integration tests (API + DB)
  - Playwright E2E (headless)

## 2) Quality gates (hard requirements)
- All unit tests pass
- All E2E tests pass
- No P0 bugs (crashes, data loss, cannot complete core flow)
- No schema-breaking migrations without a rollback note in `docs/DECISIONS.md`

## 3) Test layers
### 3.1 Unit tests (required)
**Placement engine** (`/packages/placement`)
- Grid fill count is correct for known section sizes + spacing
- Padding is respected (no markers outside bounds)
- Overlap detection flags correct pairs
- No overlaps for “happy path” spacing (baseline crop)
- Deterministic output for identical inputs

**Geometry + sectioning**
- Bed local ↔ world transforms:
  - rotation 0°, 90°, 45° cases
  - round-trip accuracy within epsilon
- Section splitting:
  - length splits produce contiguous non-overlapping sections
  - grid splits produce correct row/col bounds
  - cut validation rejects out-of-range or non-monotonic cuts

**Validation**
- Zod/schema validation rejects invalid payloads (negative dimensions, empty names where required, invalid dates)

### 3.2 Integration tests (recommended; required for milestone)
API + DB flows using a test database:
- Create plot → add beds → fetch plot state
- Create season → set bed section plan → fetch season state
- Create planting → create events → fetch season state
- Ensure deletes/updates do not orphan data (or are blocked correctly)

### 3.3 E2E tests (minimum set for milestone)
Playwright scenarios:
1) **First-time setup**
   - Create plot rectangle (enter dimensions or drag)
   - Add a bed (size + rotate)
   - Lock geometry
   - Refresh page → geometry persists and remains locked

2) **Season + sections**
   - Create season
   - Create lengthwise splits for a bed
   - Refresh → sections persist

3) **Planting + placement**
   - Add crop/variety (or use seeded)
   - Assign planting to a section
   - Click “Fill section”
   - Verify plant markers appear
   - Verify overlap status indicator displays “OK” for baseline spacing

4) **Event logging**
   - Add fertilize event and weed event
   - Verify they appear in event list and persist after refresh

## 4) Manual test checklist (per sprint)

### Sprint 0 — Foundations
- [ ] Project boots locally (web + api + db)
- [ ] DB migration applies cleanly
- [ ] CI runs and passes on a trivial PR

### Sprint 1 — Plot + Bed Editor
- [ ] Draw plot rectangle and confirm displayed width/height/area
- [ ] Add bed, resize, rotate, move; verify dimension labels update
- [ ] Lock geometry prevents edits (move/resize/rotate)
- [ ] Unlock allows edits again
- [ ] Refresh persists plot + beds exactly

### Sprint 2 — Seasons + Sections
- [ ] Create season referencing existing plot/beds
- [ ] Define bed splits (equal + custom measurements)
- [ ] Sections render and selection highlights correct bed/section
- [ ] Refresh persists season section plan

### Sprint 3 — Crop + Plantings + Events
- [ ] Create/edit a crop/variety with spacing values
- [ ] Assign a planting to a section
- [ ] Add event: fertilize, mulch, weed, harvest
- [ ] Filter events by bed/section (if present) behaves correctly
- [ ] No data loss on refresh

### Sprint 4 — Placement Module
- [ ] “Fill section” generates plant markers at expected spacing
- [ ] Footprint overlay shows mature spread circle
- [ ] Overlap highlights appear if mature spread is exaggerated
- [ ] “Plants that fit: N” updates if spacing changes

### Sprint 5 — Hardening
- [ ] Core flow can be completed by a new user in <10 minutes
- [ ] E2E tests green in CI
- [ ] No obvious performance issues on a plot with ~20 beds

## 5) Acceptance tests (Initial Milestone DoD)
A new user can:
- Create plot boundary and beds, lock geometry
- Create a season and define bed sections
- Add a planting to a section and auto-place plants with spacing visualization
- Log at least 2 event types and see them persisted
- Reload the app and see everything unchanged

## 6) Non-functional checks (lightweight)
- Performance: panning/zooming remains responsive with:
  - 1 plot, 20 beds, 200+ plant markers visible
- Accessibility (basic):
  - keyboard navigation for key dialogs/forms
  - visible focus ring
- Data integrity:
  - invalid dimensions or dates are rejected with clear errors
