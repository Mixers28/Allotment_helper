# Project Context – Long-Term Memory (LTM)

> High-level design, tech decisions, constraints for this project.
> This is the **source of truth** for agents and humans.

<!-- SUMMARY_START -->
**Summary (auto-maintained by Agent):**
- Web app for allotment/garden planning with plot boundaries, beds, seasonal sections, and plant placement.
- Static geometry (plots/beds) + seasonal overlays (sections/plantings/events) architecture.
- Tech stack: React + TypeScript + Konva (frontend), Node/Fastify or Python/FastAPI (backend), Postgres.
- MVP includes Plant Placement Module with auto-fill, spacing visualization, and overlap detection.
- Strict scope control: no new features during MVP sprints; ideas go to BACKLOG.md.
<!-- SUMMARY_END -->

---

## 1. Project Overview

- **Name:** Allotment Planner (Web)
- **Owner:** TBD
- **Purpose:** Web app that lets users draw allotment plot boundaries, place beds, define seasonal sections, plan plantings with spacing visualization, and log garden events.
- **Primary Stack:** React + TypeScript + Konva (frontend), Node/FastAPI (backend), Postgres (database)
- **Target Platforms:** Web browser (desktop-first); PWA/mobile deferred to post-MVP.

---

## 2. Core Design Pillars

- **Static vs Seasonal separation:** Plot boundaries and beds are static geometry (rarely change); sections, plantings, and events are seasonal overlays (change each season).
- **Coordinate system:** World coordinates in meters; beds have local coordinates (origin at corner, X = length, Y = width).
- **Plant Placement Module:** Pure, testable module for spacing calculations, auto-fill, and overlap detection.
- **Scope lock:** No feature creep during MVP sprints. All ideas → BACKLOG.md.

---

## 3. Technical Decisions & Constraints

- **Frontend:** React + TypeScript, Konva for canvas (drag/rotate/select), Zustand for state, React Hook Form + Zod for forms.
- **Backend:** Node (Fastify/Nest) or Python (FastAPI), REST API, Postgres with Prisma or SQLAlchemy.
- **Testing:** Playwright for E2E, unit tests for placement module and geometry transforms.
- **Deployment:** Single-container deploy (Railway/Fly/Render) with managed Postgres (post-MVP).
- **Non-negotiable constraints:**
  - Plant placement engine must be a pure module (`/packages/placement`) for testability.
  - Seasonal data must not modify base geometry.
  - All unit + E2E tests must pass for milestone acceptance.

---

## 4. Memory Hygiene (Drift Guards)

- Keep this summary block current and <= 300 tokens.
- Move stable decisions into the Change Log so they persist across sessions.
- Keep NOW to 5–12 active tasks; archive or remove completed items.
- Roll up SESSION_NOTES into summaries weekly (or every few sessions).

---

## 5. Architecture Snapshot

```
/apps
  /web          # React app (canvas editor, forms, UI)
  /api          # Backend (Node or FastAPI)
/packages
  /domain       # Shared types + Zod schemas
  /placement    # Plant placement module (pure functions)
/docs
  PROJECT_CONTEXT.md, NOW.md, SESSION_NOTES.md
  spec.md, BACKLOG.md, TEST_PLAN.md
```

Key data models:
- **Static:** PlotBase (boundary), BedBase (position, rotation, dimensions)
- **Seasonal:** Season, BedSectionPlan, Section, Planting, Event
- **Reference:** Crop, Variety (spacing/timing fields)

---

## 6. Links & Related Docs

- **Spec (source of truth):** [docs/spec.md](spec.md)
- **Backlog:** [docs/BACKLOG.md](BACKLOG.md)
- **Test Plan:** [docs/TEST_PLAN.md](TEST_PLAN.md)
- **Agent Protocol:** [docs/AGENT_SESSION_PROTOCOL.md](AGENT_SESSION_PROTOCOL.md)
- **Working Memory:** [docs/NOW.md](NOW.md)

---

## 7. Change Log (High-Level Decisions)

Use this section for **big decisions** only:

- `2026-01-31` – Initialized project context from spec.md for Allotment Planner MVP.
