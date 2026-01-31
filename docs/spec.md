# Allotment Planner (Web) — spec.md

## 1) Summary
A web app that lets a user:
1) Draw a **static** allotment plot boundary (blank canvas → set outer boundary).
2) Place **static** beds (size + orientation), optionally lock them for the season/year.
3) Define **seasonal sections** inside beds (splits/grids) that can change each season.
4) Plan plantings in sections using crop/seed data.
5) Use a **Plant Placement Module** to visualize mature plant footprint and recommended spacing, auto-place plants, and detect overcrowding.
6) Log events (fertilize, mulch, weed, harvest).
7) (Later phase) Forecast growth stages / nutrient demand / weed pressure / harvest windows.

This spec is written for multiple agents (Architect / Coder / QA) to execute in sprints with scope lock.

---

## 2) Goals
### Must-have (Initial Milestone / MVP)
- Blank canvas → create plot boundary with real-world dimensions.
- Add/rotate/resize beds and **lock geometry**.
- Seasonal plan creation (e.g., “2026 Spring/Summer”) referencing the same static geometry.
- Define bed sections per season (lengthwise splits at minimum).
- Crop catalog entries (manual entry is fine).
- Assign a crop/variety to a section with sow date + method.
- Plant Placement Module:
  - show recommended spacing
  - show “mature footprint” overlay
  - auto-fill a section with plant markers using spacing
  - flag overlaps/crowding
- Event logging per bed/section/planting.

### Should-have (Post-MVP)
- Clone previous season plan.
- Harvest window estimate (simple days-to-maturity, no weather integration).
- Basic timeline per planting.

### Not in scope (until after Initial Milestone is complete)
- Weather integration / GDD modeling
- Pest/disease prediction
- Companion planting optimization
- Multi-user collaboration / sharing
- Mobile native app (PWA later is fine)

---

## 3) Scope control (Hard rule)
**No new features during MVP sprints.**  
If anything feels missing or there’s a better idea:
- capture it as a short ticket in `docs/BACKLOG.md`
- do not implement until the Initial Milestone is complete and signed off (Definition of Done met)

Bug fixes and small UI corrections are allowed if they directly support MVP acceptance criteria.

---

## 4) Core concepts and data boundaries
### Static geometry (rarely changes)
- Plot boundary (rectangle first; polygon optional later)
- Beds (rectangles with rotation)

### Seasonal overlay (changes each season)
- Sections inside each bed (splits/grids)
- Plantings assigned to sections
- Events and harvest logs

### Coordinate system
- World coordinates in **meters** (or cm internally, but consistent everywhere)
- Each bed has **local coordinates**:
  - origin at one corner
  - local X = length direction
  - local Y = width direction
- Sections are stored in bed-local coordinates (stable and easy to edit seasonally)

---

## 5) Recommended tech stack (Option A)
### Frontend
- React + TypeScript
- Canvas layer: **Konva** (drag/rotate/select) or Fabric.js (Konva preferred)
- State: Zustand (or Redux Toolkit)
- Forms: React Hook Form + Zod validation
- E2E tests: Playwright

### Backend
- Node (Fastify/Nest) **or** Python (FastAPI)
- REST API (GraphQL optional later)
- DB: Postgres
- ORM: Prisma (TS) or SQLAlchemy (Python)

### Deployment (later)
- Single-container deploy (Railway/Fly/Render)
- Postgres managed

---

## 6) User flows
### 6.1 First-time setup
1) User opens app → sees blank canvas.
2) User sets units (m/ft), chooses “Draw plot boundary”.
3) User draws boundary; app shows dimensions + total area.
4) User places beds (add bed → set W/L → rotate → position).
5) User locks geometry.

### 6.2 Start a new season
1) User creates “Season”.
2) App loads static geometry.
3) User creates or edits bed sections for that season.
4) User assigns plantings to sections using crop catalog.
5) Plant placement UI helps spacing decisions.

### 6.3 During the season
- User logs events (fertilize/mulch/weed/harvest), optionally attaching photos.
- User checks bed view overlays: plant footprint, spacing, overcrowding warnings.

---

## 7) Data model (MVP-level)
> Exact naming can change; relationships and boundaries should not.

### Static
- `PlotBase`
  - `id`, `name`, `units`
  - `boundary_type`: `rect | poly`
  - `boundary`: JSON (rect: w/h; poly: points)
- `BedBase`
  - `id`, `plot_id`, `name`
  - `x`, `y`, `width`, `height` (world units)
  - `rotation_deg`

### Seasonal
- `Season`
  - `id`, `plot_id`, `label`
  - `start_date`, `end_date`
- `BedSectionPlan`
  - `id`, `season_id`, `bed_id`
  - `mode`: `length_splits | grid`
  - `definition`: JSON
    - length_splits: `{ cuts_m: number[] }` (monotonic)
    - grid: `{ rows: number, cols: number }`
- `Section`
  - derived at runtime from `BedSectionPlan`, or persisted for referencing:
  - `id`, `bed_section_plan_id`, `name`, `bounds_local` (x0,x1,y0,y1)
- `Crop`
  - `id`, `name`, `family`
- `Variety`
  - `id`, `crop_id`, `name`
  - spacing + timing fields (see below)
- `Planting`
  - `id`, `season_id`, `bed_id`, `section_id`
  - `variety_id`
  - `method`: `direct_sow | transplant | set`
  - `start_date`
  - optional overrides: spacing, notes
- `Event`
  - `id`, `season_id`, `bed_id`, optional `section_id`, optional `planting_id`
  - `type`: `sow | transplant | fertilize | mulch | weed | water | harvest | note`
  - `date`, `quantity`, `unit`, `notes`, `photos[]`

---

## 8) Crop/seed data (MVP fields)
For `Variety`:
- `row_spacing_cm`
- `plant_spacing_cm`
- `mature_spread_cm` (optional; can be derived if missing)
- `days_to_germ_min`, `days_to_germ_max` (optional MVP)
- `days_to_maturity_min`, `days_to_maturity_max` (optional MVP)
- `sow_window_months` (optional MVP)
- `growth_habit`: `upright | bush | vine`
- `trellis_required`: boolean (optional MVP)

Derivation rule (MVP):
- if `mature_spread_cm` missing → approximate: `plant_spacing_cm * 1.1` (configurable per crop later)

---

## 9) Plant Placement Module (MVP)
### 9.1 Purpose
Help the user plant with correct distances by visualizing:
- recommended spacing
- mature footprint
- number of plants that fit
- overcrowding/overlap warnings

### 9.2 Inputs
- Section bounds (bed-local rectangle)
- Spacing parameters:
  - `row_spacing_cm`
  - `plant_spacing_cm`
- Optional:
  - `mature_spread_cm`
  - margin padding (default 2–5 cm) to avoid edge planting

### 9.3 Outputs
- Set of plant markers in bed-local coords: `[{x_m, y_m}]`
- Footprint overlays per marker (circle radius = mature_spread/2)
- Metrics:
  - `count`
  - `utilization_pct` (area covered / section area; approximate)
  - `overlap_count` (pairs or clusters)

### 9.4 Placement modes
**Mode A — Auto-fill (Grid)**
- Fill section with rows spaced by `row_spacing`
- Each row has plants spaced by `plant_spacing`
- Start at `padding` and stop before boundary - `padding`

**Mode B — Manual with snap (MVP-lite)**
- User click places a plant marker
- Marker snaps to nearest valid spacing lattice point based on an origin for that planting group

**Mode C — Row tool (Post-MVP)**
- User draws a line; system places plants along it

MVP requires Mode A + overlap detection + mature footprint overlay.

### 9.5 Overlap detection (MVP)
- If two footprint circles intersect (distance < r1 + r2), flag as overlap.
- Highlight overlaps in red; show “crowding risk” banner.

### 9.6 UI requirements
When a user assigns a planting to a section:
- show spacing values in a small panel
- show “Fill section” button
- render plant markers + footprint circles
- show “Plants that fit: N” and “Crowding: OK / Risk”

---

## 10) Canvas editor requirements (MVP)
### Tools
- Select / Move / Pan / Zoom
- Draw plot boundary (rectangle)
- Add bed rectangle
- Rotate bed (handle) + angle snapping (0/15/30/45/90)
- Lock geometry toggle

### Visual measurement aids
- Dimension readouts while drawing/resizing
- Total plot area label
- Bed size label

---

## 11) API (MVP shape)
- `POST /plots` create plot
- `PUT /plots/:id` update plot boundary/units
- `POST /plots/:id/beds` add bed
- `PUT /beds/:id` update bed geometry/name
- `POST /plots/:id/seasons` create season
- `POST /seasons/:id/bed-plans` set section plan for bed
- `POST /seasons/:id/plantings` create planting
- `POST /seasons/:id/events` log event
- `GET /seasons/:id` fetch full season state (plot + beds + section plans + plantings + events)

---

## 12) Repo layout (suggested)

/apps
/web # React app
/api # Backend (Node or FastAPI)
/packages
/domain # shared types + zod schemas
/placement # plant placement module (pure functions)
/docs
BACKLOG.md
DECISIONS.md
TEST_PLAN.md
spec.md


Key rule: Plant placement must live in a **pure module** (`/packages/placement`) so it can be unit tested without UI.

---

## 13) Testing strategy (MVP)
### Unit tests (required)
- Placement module:
  - grid fill count correctness
  - padding respected
  - overlap detection
- Section splitting math:
  - correct bounds for cuts/grid
- Coordinate transforms:
  - bed-local ↔ world transform accuracy

### Integration tests (recommended)
- Create plot → add bed → lock → create season → add plan → add planting → fill section.

### E2E (minimum)
- Setup plot and a bed
- Create season
- Add a planting to a section
- Click “Fill section” and see markers rendered

---

## 14) Sprints / Phases (execution plan)

### Sprint 0 — Foundations (1–2 days)
**Deliverables**
- Monorepo scaffolding
- CI running unit tests
- Basic DB schema + migrations
- Seed minimal crop catalog (2–3 crops)

**Acceptance**
- `pnpm test` (or equivalent) runs in CI
- API can create/fetch a plot

---

### Sprint 1 — Plot + Bed Editor (Static Geometry) (3–5 days)
**Deliverables**
- Blank canvas
- Draw rectangular plot boundary with dimension labels
- Add/resize/rotate beds with snapping
- Lock geometry toggle

**Acceptance**
- User can create a plot + beds and reload with geometry intact
- Locked geometry prevents accidental dragging/resizing

---

### Sprint 2 — Seasons + Sections (3–5 days)
**Deliverables**
- Create a season referencing the static plot/beds
- Bed section plans: lengthwise splits (MVP)
- Render sections overlays

**Acceptance**
- Season can be created and edited without modifying base geometry
- Sections persist and render correctly after refresh

---

### Sprint 3 — Crop Catalog + Plantings + Event Log (3–5 days)
**Deliverables**
- Basic crop/variety CRUD (or seeded + editable)
- Assign planting to a section
- Event logging screen (fertilize/mulch/weed/harvest/note)

**Acceptance**
- Plantings and events persist, filter by season/bed/section

---

### Sprint 4 — Plant Placement Module + UI Integration (3–6 days)
**Deliverables**
- Pure placement engine in `/packages/placement`
- “Fill section” auto-placement
- Mature footprint overlay and overlap warnings

**Acceptance**
- Unit tests for placement and overlap pass
- User can visually see spacing and crowding in the section

---

### Sprint 5 — Milestone hardening + E2E (2–4 days)
**Deliverables**
- Playwright E2E for the main flow
- UX polish: labels, minimal tooltips, error handling
- `docs/TEST_PLAN.md` updated with manual checks

**Acceptance (Initial Milestone Definition of Done)**
- New user can:
  - create plot + beds (lock them)
  - create season + sections
  - add planting + fill section with spaced plants
  - log fertilize/weeding/harvest events
- All unit tests + E2E pass in CI
- No open “P0” bugs

---

## 15) Post-Milestone work (only after Sprint 5 DoD)
Move all enhancements to `docs/BACKLOG.md` first, then plan Sprint 6+:
- Harvest window estimates
- Timeline view
- Weed/nutrient overlays (rules-based)
- Clone season
- Polygon plot boundaries
- Grid sectioning mode

---

## 16) Agent operating rules
- Build only what the current sprint requires.
- Any feature idea → `docs/BACKLOG.md` ticket, do not implement.
- Keep placement engine pure + tested before UI polish.
- Update `docs/DECISIONS.md` for any meaningful trade-off (e.g., Konva vs SVG).