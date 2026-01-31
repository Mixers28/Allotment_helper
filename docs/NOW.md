# NOW - Working Memory (WM)

> This file captures the current focus / sprint.
> It should always describe what we're doing right now.

<!-- SUMMARY_START -->
**Current Focus (auto-maintained by Agent):**
- Sprint 0 + 1 spec complete; ready for Coder handoff.
- Coder should follow SPRINT_0_1_SPEC.md and HANDOFF_CODER.md exactly.
- Acceptance: monorepo scaffolded, API CRUD works, canvas editor with plot/bed drawing.
<!-- SUMMARY_END -->

---

## Current Objective

**Hand off to Coder** — Sprint 0 + 1 spec is complete. Coder implements per SPRINT_0_1_SPEC.md.

---

## Active Branch

- `main`

---

## Handoff Documents

- **Spec:** [docs/SPRINT_0_1_SPEC.md](SPRINT_0_1_SPEC.md) — canonical artifact, Coder must follow
- **Instructions:** [docs/HANDOFF_CODER.md](HANDOFF_CODER.md) — implementation order + code snippets

## Sprint 0 + 1 Tickets (for Coder)

### Sprint 0 — Foundations
- [ ] S0-1: Scaffold pnpm monorepo
- [ ] S0-2: Configure TypeScript
- [ ] S0-3: Configure ESLint + Prettier
- [ ] S0-4: Set up Fastify server
- [ ] S0-5: Set up Prisma + Postgres
- [ ] S0-6: Plot CRUD endpoints
- [ ] S0-7: Bed CRUD endpoints
- [ ] S0-8: Seed crop catalog
- [ ] S0-9: Set up Vite + React
- [ ] S0-10: Configure CI

### Sprint 1 — Plot + Bed Editor
- [ ] S1-1: Blank Konva canvas with pan/zoom
- [ ] S1-2: Draw plot boundary tool
- [ ] S1-3: Plot dimension labels
- [ ] S1-4: Add bed tool
- [ ] S1-5: Drag bed to position
- [ ] S1-6: Resize bed (handles)
- [ ] S1-7: Rotate bed (handle + snapping)
- [ ] S1-8: Bed dimension labels
- [ ] S1-9: Lock geometry toggle
- [ ] S1-10: Zustand store
- [ ] S1-11: Persist on change (debounced)
- [ ] S1-12: Load state on mount

---

## Drift Guards (keep NOW fresh)

- Keep NOW to 5–12 active tasks; remove completed items.
- Refresh summary blocks every session.
- Move stable decisions into PROJECT_CONTEXT.

---

## Notes / Scratchpad

- **Tech stack locked:** Node/Fastify + Prisma (per SPRINT_0_1_SPEC.md decision)
- Konva chosen over Fabric.js per spec recommendation
- Context7 MCP unavailable; library versions are assumptions — Coder should verify
