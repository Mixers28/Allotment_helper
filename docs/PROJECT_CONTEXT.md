# Project Context – Long-Term Memory (LTM)

> High-level design, tech decisions, constraints for this project.
> This is the **source of truth** for agents and humans.

<!-- SUMMARY_START -->
**Summary (auto-maintained by Agent):**
- Web app for allotment/garden planning with plot boundaries, beds, seasonal sections, and plant placement.
- Static geometry (plots/beds) + seasonal overlays (sections/plantings/events) architecture.
- Tech stack: React + TypeScript + Konva (frontend), Node/Fastify + Prisma (backend), PostgreSQL.
- Sprint 0 + 1 complete: Monorepo with CRUD API and canvas editor operational.
- Deployed to Railway (backend) + Vercel (frontend).
<!-- SUMMARY_END -->

---

## 1. Project Overview

- **Name:** Allotment Planner (Web)
- **Repository:** https://github.com/Mixers28/Allotment_helper.git
- **Purpose:** Web app that lets users draw allotment plot boundaries, place beds, define seasonal sections, plan plantings with spacing visualization, and log garden events.
- **Primary Stack:** React + TypeScript + Konva (frontend), Node/Fastify + Prisma (backend), PostgreSQL (database)
- **Target Platforms:** Web browser (desktop-first); PWA/mobile deferred to post-MVP.
- **Current Status:** Sprint 0 + 1 complete, deployed to production

---

## 2. Core Design Pillars

- **Static vs Seasonal separation:** Plot boundaries and beds are static geometry (rarely change); sections, plantings, and events are seasonal overlays (change each season).
- **Coordinate system:** World coordinates in meters; beds have local coordinates (origin at corner, X = length, Y = width).
- **Plant Placement Module:** Pure, testable module for spacing calculations, auto-fill, and overlap detection.
- **Scope lock:** No feature creep during MVP sprints. All ideas → BACKLOG.md.

---

## 3. Technical Decisions & Constraints

### Frontend Stack
- **Framework:** React 18 + TypeScript 5
- **Canvas Library:** Konva 9 (for drag/rotate/resize operations)
- **State Management:** Zustand 4 (lightweight, no boilerplate)
- **Forms:** React Hook Form + Zod validation
- **Build Tool:** Vite 5
- **Deployment:** Vercel (static hosting with environment variables)

### Backend Stack
- **Runtime:** Node.js 20
- **Framework:** Fastify 4 (fast, TypeScript-friendly)
- **ORM:** Prisma 5.22.0 (type-safe database access)
- **Database:** PostgreSQL (managed by Railway)
- **Validation:** Zod (shared schemas with frontend)
- **Deployment:** Railway (Docker-based, automatic migrations)

### Build & Deployment
- **Package Manager:** pnpm 9.15.0 (workspace support)
- **Monorepo:** pnpm workspaces (apps/api, apps/web, packages/*)
- **Docker:** Multi-stage build optimized for production
- **CI/CD:** Automatic deployment via GitHub push (Railway + Vercel)

### Non-negotiable Constraints
- Plant placement engine must be a pure module (`/packages/placement`) for testability
- Seasonal data must not modify base geometry
- All unit + E2E tests must pass for milestone acceptance (deferred to Sprint 2+)
- Production dependencies must be pinned to avoid breaking changes

---

## 4. Memory Hygiene (Drift Guards)

- Keep this summary block current and <= 300 tokens
- Move stable decisions into the Change Log so they persist across sessions
- Keep NOW to 5–12 active tasks; archive or remove completed items
- Roll up SESSION_NOTES into summaries weekly (or every few sessions)

---

## 5. Architecture Snapshot

```
/apps
  /web          # React app (canvas editor, forms, UI)
  /api          # Fastify backend (REST API, Prisma)
/packages
  /domain       # Shared types + Zod schemas
  /placement    # Plant placement module (pure functions) [stub]
/docs
  PROJECT_CONTEXT.md, NOW.md, SESSION_NOTES.md
  spec.md, BACKLOG.md, TEST_PLAN.md
  SPRINT_0_1_SPEC.md, HANDOFF_CODER.md
  DEPLOYMENT.md
```

### Key Data Models

**Static Geometry:**
- `Plot` - Boundary polygon with width/height
- `Bed` - Position (x, y), rotation, dimensions (width, length)

**Seasonal Data (Sprint 2+):**
- `Season` - Growing season definition
- `BedSectionPlan` - Links bed to seasonal sections
- `Section` - Area within bed for specific plantings
- `Planting` - Crop instance with spacing
- `Event` - Garden log entry

**Reference Data:**
- `Crop` - Plant species (name, family, spacing defaults)
- `Variety` - Specific cultivar with timing/spacing

---

## 6. Links & Related Docs

- **Spec (source of truth):** [docs/spec.md](spec.md)
- **Backlog:** [docs/BACKLOG.md](BACKLOG.md)
- **Test Plan:** [docs/TEST_PLAN.md](TEST_PLAN.md)
- **Sprint 0+1 Spec:** [docs/SPRINT_0_1_SPEC.md](SPRINT_0_1_SPEC.md)
- **Coder Handoff:** [docs/HANDOFF_CODER.md](HANDOFF_CODER.md)
- **Deployment Guide:** [docs/DEPLOYMENT.md](DEPLOYMENT.md)
- **Working Memory:** [docs/NOW.md](NOW.md)
- **Session Notes:** [docs/SESSION_NOTES.md](SESSION_NOTES.md)

---

## 7. Change Log (High-Level Decisions)

Use this section for **big decisions** only:

- `2026-02-01` – **Sprint 0 + 1 implementation complete.** Full monorepo with Fastify API, Prisma ORM, React/Konva canvas editor. Deployed to Railway (backend) and configured for Vercel (frontend). All CRUD operations functional, canvas supports plot/bed drawing with drag/rotate/resize/lock.

- `2026-02-01` – **Deployment architecture finalized.** Railway uses Dockerfile (multi-stage build), Prisma pinned to 5.22.0 (avoiding v7 breaking changes), OpenSSL installed for Prisma engine. Vercel configured with monorepo build commands. CORS configured for production origins.

- `2026-01-31` – **Tech stack locked to Node/Fastify + Prisma** (not Python/FastAPI). Konva chosen over Fabric.js per spec recommendation. Sprint 0 + 1 spec created with detailed implementation plan.

- `2026-01-31` – Initialized project context from spec.md for Allotment Planner MVP.

---

## 8. Production Environment

### Railway (Backend)
- **Service:** allotmenthelper.up.railway.app
- **Region:** europe-west4
- **Database:** PostgreSQL (managed, automatic DATABASE_URL)
- **Build:** Dockerfile (multi-stage, pnpm workspaces)
- **Migrations:** Automatic on startup via `prisma migrate deploy`
- **Environment Variables:**
  - `NODE_ENV=production`
  - `ALLOWED_ORIGINS` (comma-separated URLs)
  - `DATABASE_URL` (auto-provided)

### Vercel (Frontend)
- **Status:** Configuration ready, pending deployment
- **Root Directory:** `apps/web`
- **Build Command:** Monorepo-aware (installs from root)
- **Environment Variables:**
  - `VITE_API_URL` (Railway backend URL)

---

## 9. Known Technical Details

### TypeScript Build
- Output preserves directory structure: `src/index.ts` → `dist/src/index.js`
- Root tsconfig has `noEmit: true`, overridden in app configs
- Project references configured for monorepo

### Prisma Configuration
- Pinned to `~5.22.0` (dependencies, not devDependencies)
- Requires OpenSSL in Docker (not included in node:20-slim)
- Schema located at `apps/api/prisma/schema.prisma`
- Migrations in `apps/api/prisma/migrations/`

### CORS Setup
- Environment-based allowed origins
- Supports comma-separated list for multiple domains
- Must be updated after frontend deployment

### Docker Multi-Stage Build
1. **base:** Install OpenSSL, enable corepack
2. **dependencies:** Install all workspace dependencies
3. **build:** Generate Prisma client, compile TypeScript
4. **production:** Install prod deps only, copy built files, run migrations on startup
