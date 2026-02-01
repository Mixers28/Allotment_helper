# NOW - Working Memory (WM)

> This file captures the current focus / sprint.
> It should always describe what we're doing right now.

<!-- SUMMARY_START -->
**Current Focus (auto-maintained by Agent):**
- Sprint 0 + 1 implementation COMPLETE
- Backend deployed to Railway (Dockerfile-based)
- Frontend ready for Vercel deployment
- Acceptance: All CRUD works, canvas editor operational, data persists
<!-- SUMMARY_END -->

---

## Current Objective

**Deployment & Integration** — Sprint 0 + 1 code complete. Railway backend active, Vercel frontend pending deployment.

---

## Active Branch

- `main`

---

## Sprint Status

### Sprint 0 — Foundations ✅ COMPLETE
- [x] S0-1: Scaffold pnpm monorepo
- [x] S0-2: Configure TypeScript
- [x] S0-3: Configure ESLint + Prettier
- [x] S0-4: Set up Fastify server
- [x] S0-5: Set up Prisma + Postgres
- [x] S0-6: Plot CRUD endpoints
- [x] S0-7: Bed CRUD endpoints
- [x] S0-8: Seed crop catalog
- [x] S0-9: Set up Vite + React
- [x] S0-10: Configure CI (deferred)

### Sprint 1 — Plot + Bed Editor ✅ COMPLETE
- [x] S1-1: Blank Konva canvas with pan/zoom
- [x] S1-2: Draw plot boundary tool
- [x] S1-3: Plot dimension labels
- [x] S1-4: Add bed tool
- [x] S1-5: Drag bed to position
- [x] S1-6: Resize bed (handles)
- [x] S1-7: Rotate bed (handle + snapping)
- [x] S1-8: Bed dimension labels
- [x] S1-9: Lock geometry toggle
- [x] S1-10: Zustand store
- [x] S1-11: Persist on change (debounced)
- [x] S1-12: Load state on mount

### Deployment Configuration ✅ COMPLETE
- [x] Railway Dockerfile setup
- [x] Prisma version pinning (5.22.0)
- [x] OpenSSL installation
- [x] TypeScript build configuration
- [x] Production environment setup
- [x] Database migrations
- [x] CORS configuration
- [x] Vercel configuration files

---

## Current Tasks

### Immediate (Now)
- [ ] Verify Railway deployment health endpoint
- [ ] Deploy frontend to Vercel
- [ ] Update Railway CORS with Vercel URL
- [ ] Test full integration (frontend ↔ backend)

### Next Up
- [ ] Add seed data to production database (optional)
- [ ] Monitor deployment logs and metrics
- [ ] Begin Sprint 2 planning (if continuing)

---

## Deployment URLs

**Backend (Railway):**
- URL: `https://allotmenthelper.up.railway.app`
- Health: `https://allotmenthelper.up.railway.app/health`
- Status: Migrations successful, server starting

**Frontend (Vercel):**
- Status: Configuration ready, awaiting deployment
- Config: `apps/web/vercel.json`

---

## Key Technical Details

**Monorepo Structure:**
```
/apps/api    - Fastify + Prisma backend
/apps/web    - React + Vite + Konva frontend
/packages/domain    - Shared types + Zod schemas
/packages/placement - Plant placement module (stub)
```

**Tech Stack:**
- Backend: Node 20, Fastify 4, Prisma 5.22.0, PostgreSQL
- Frontend: React 18, Vite 5, Konva 9, Zustand 4
- Build: pnpm 9.15.0, TypeScript 5, Docker multi-stage

**Environment Variables:**
- Railway: `NODE_ENV`, `ALLOWED_ORIGINS`, `DATABASE_URL`
- Vercel: `VITE_API_URL`

---

## Documentation

- **Implementation Summary:** [IMPLEMENTATION_SUMMARY.md](../IMPLEMENTATION_SUMMARY.md)
- **Deployment Guide:** [docs/DEPLOYMENT.md](DEPLOYMENT.md)
- **Sprint Spec:** [docs/SPRINT_0_1_SPEC.md](SPRINT_0_1_SPEC.md)
- **Repository Structure:** [docs/Repo_Structure.md](Repo_Structure.md)

---

## Notes / Scratchpad

- Database migrations applied successfully on Railway
- Prisma 7.x breaking change avoided by pinning to 5.22.0
- TypeScript output path: `dist/src/index.js` (preserves src/ structure)
- OpenSSL required for Prisma engine on node:20-slim
- All deployment documentation consolidated into docs/DEPLOYMENT.md
