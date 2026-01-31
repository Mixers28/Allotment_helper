# HANDOFF — To Coder

> Implementation-ready handoff for Sprint 0 + Sprint 1.

---

## Invariants (non-negotiables)

1. **Follow SPRINT_0_1_SPEC.md exactly** — no extra features, no "improvements"
2. **Coordinates in meters** — all geometry stored and displayed in meters
3. **Pure packages** — `/packages/domain` and `/packages/placement` have zero UI dependencies
4. **Unit tests for transforms** — coordinate math must be tested
5. **No secrets in repo** — use `.env` for DATABASE_URL, add `.env` to `.gitignore`
6. **Scope lock** — ideas not in spec → add to `docs/BACKLOG.md`, do not implement

---

## Required Reading

- [docs/SPRINT_0_1_SPEC.md](SPRINT_0_1_SPEC.md) — canonical spec (you are bound to this)
- [docs/spec.md](spec.md) — full project spec (context only)
- [docs/TEST_PLAN.md](TEST_PLAN.md) — testing requirements

---

## Sprint 0 Implementation Order

Execute tickets in this order (dependencies flow downward):

```
S0-1: Scaffold monorepo
  └─> S0-2: Configure TypeScript
        └─> S0-3: Configure ESLint + Prettier
              └─> S0-4: Set up Fastify server
                    └─> S0-5: Set up Prisma + Postgres
                          ├─> S0-6: Plot CRUD endpoints
                          ├─> S0-7: Bed CRUD endpoints
                          └─> S0-8: Seed crop catalog
S0-9: Set up Vite + React (parallel with S0-4+)
S0-10: Configure CI (after all above)
```

### S0-1: Scaffold monorepo

```bash
mkdir allotment && cd allotment
pnpm init
```

Create `pnpm-workspace.yaml`:
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

Create directories:
```bash
mkdir -p apps/web apps/api packages/domain packages/placement
```

### S0-2: TypeScript config

Create `tsconfig.base.json` at root:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "resolveJsonModule": true
  }
}
```

Each package extends this with its own `tsconfig.json`.

### S0-4: Fastify server setup

```bash
cd apps/api
pnpm add fastify @fastify/cors
pnpm add -D typescript @types/node tsx
```

Entry point `src/index.ts`:
```typescript
import Fastify from 'fastify';
import cors from '@fastify/cors';

const server = Fastify({ logger: true });

server.register(cors, { origin: true });

server.get('/health', async () => ({ status: 'ok' }));

server.listen({ port: 3001, host: '0.0.0.0' }, (err) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
});
```

### S0-5: Prisma setup

```bash
cd apps/api
pnpm add @prisma/client
pnpm add -D prisma
npx prisma init
```

Use schema from SPRINT_0_1_SPEC.md section "Prisma Schema".

### S0-6 & S0-7: API routes

Implement routes per spec. Use Zod schemas from `/packages/domain` for validation:

```typescript
// apps/api/src/routes/plots.ts
import { CreatePlotSchema } from '@allotment/domain';

server.post('/plots', async (request, reply) => {
  const parsed = CreatePlotSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error });
  }
  // ... prisma create
});
```

### S0-9: Vite + React setup

```bash
cd apps/web
pnpm create vite . --template react-ts
pnpm add konva react-konva zustand zod react-hook-form @hookform/resolvers
```

---

## Sprint 1 Implementation Order

```
S1-10: Zustand store (foundation)
  └─> S1-12: Load state on mount
        └─> S1-1: Blank Konva canvas
              └─> S1-2: Draw plot boundary tool
                    └─> S1-3: Plot dimension labels
                          └─> S1-4: Add bed tool
                                ├─> S1-5: Drag bed
                                ├─> S1-6: Resize bed
                                ├─> S1-7: Rotate bed
                                └─> S1-8: Bed dimension labels
S1-9: Lock geometry toggle (after S1-5/6/7)
S1-11: Persist on change (after store + API working)
```

### S1-1: Konva canvas basics

```tsx
// apps/web/src/components/Canvas/PlotCanvas.tsx
import { Stage, Layer } from 'react-konva';
import { useRef, useState } from 'react';

export function PlotCanvas() {
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    setStageScale(Math.max(0.1, Math.min(10, newScale)));
  };

  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      scaleX={stageScale}
      scaleY={stageScale}
      x={stagePos.x}
      y={stagePos.y}
      draggable
      onWheel={handleWheel}
      onDragEnd={(e) => setStagePos({ x: e.target.x(), y: e.target.y() })}
    >
      <Layer>
        {/* PlotBoundary, BedShapes render here */}
      </Layer>
    </Stage>
  );
}
```

### S1-7: Rotation with snapping

```typescript
// apps/web/src/utils/geometry.ts
const SNAP_ANGLES = [0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180,
                     195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345, 360];
const SNAP_THRESHOLD = 5; // degrees

export function snapAngle(angle: number): number {
  const normalized = ((angle % 360) + 360) % 360;
  for (const snap of SNAP_ANGLES) {
    if (Math.abs(normalized - snap) <= SNAP_THRESHOLD) {
      return snap === 360 ? 0 : snap;
    }
  }
  return normalized;
}
```

### S1-9: Lock toggle behavior

When `bed.isLocked === true`:
- Disable `draggable` prop on Konva shape
- Hide resize/rotate handles
- Show lock icon overlay
- Ignore all transform events

```tsx
<Rect
  draggable={!bed.isLocked}
  onDragEnd={bed.isLocked ? undefined : handleDragEnd}
  // ...
/>
```

### S1-10: Zustand store

```typescript
// apps/web/src/store/plotStore.ts
import { create } from 'zustand';
import type { PlotBase, BedBase } from '@allotment/domain';

interface PlotState {
  plot: PlotBase | null;
  beds: BedBase[];
  isLoading: boolean;

  setPlot: (plot: PlotBase) => void;
  setBeds: (beds: BedBase[]) => void;
  updateBed: (id: string, updates: Partial<BedBase>) => void;
  addBed: (bed: BedBase) => void;
  removeBed: (id: string) => void;
}

export const usePlotStore = create<PlotState>((set) => ({
  plot: null,
  beds: [],
  isLoading: true,

  setPlot: (plot) => set({ plot }),
  setBeds: (beds) => set({ beds }),
  updateBed: (id, updates) => set((state) => ({
    beds: state.beds.map((b) => b.id === id ? { ...b, ...updates } : b),
  })),
  addBed: (bed) => set((state) => ({ beds: [...state.beds, bed] })),
  removeBed: (id) => set((state) => ({ beds: state.beds.filter((b) => b.id !== id) })),
}));
```

### S1-11: Debounced persistence

```typescript
// apps/web/src/hooks/usePersist.ts
import { usePlotStore } from '../store/plotStore';
import { useEffect, useRef } from 'react';
import { updateBed } from '../api/client';

export function usePersistBed(bedId: string) {
  const bed = usePlotStore((s) => s.beds.find((b) => b.id === bedId));
  const timeoutRef = useRef<number>();

  useEffect(() => {
    if (!bed) return;

    clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      updateBed(bedId, bed);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutRef.current);
  }, [bed?.x, bed?.y, bed?.width, bed?.height, bed?.rotationDeg]);
}
```

---

## Commands to Run

```bash
# Root
pnpm install
pnpm lint
pnpm test

# API
cd apps/api
pnpm db:migrate    # npx prisma migrate dev
pnpm db:seed       # npx prisma db seed
pnpm dev           # tsx watch src/index.ts

# Web
cd apps/web
pnpm dev           # vite
```

---

## Definition of Done

### Sprint 0 Complete When:
- [ ] `pnpm install` from root works
- [ ] `pnpm lint` passes all packages
- [ ] `pnpm test` runs (even if minimal tests)
- [ ] API server starts on port 3001
- [ ] `POST /plots` creates a plot in DB
- [ ] `GET /plots/:id` returns plot + beds
- [ ] Crop seed data exists in DB
- [ ] CI workflow runs on push

### Sprint 1 Complete When:
- [ ] Canvas renders with pan/zoom
- [ ] Can draw a plot rectangle
- [ ] Dimension labels show width/height/area
- [ ] Can add beds via modal
- [ ] Can drag beds to reposition
- [ ] Can resize beds via handles
- [ ] Can rotate beds with snapping
- [ ] Lock toggle prevents edits
- [ ] Page reload preserves all geometry
- [ ] Manual test checklist from TEST_PLAN.md passes

---

## Notes / Assumptions

- **Context7 unavailable:** Library versions are best-effort assumptions. Verify Konva/React-Konva compatibility.
- **Single plot assumed:** No multi-plot support needed; hardcode plot ID or use first plot.
- **No auth:** All endpoints are open; auth is backlog.
- **Local Postgres:** Use Docker or local install; connection string in `.env`.

---

## Blocked? Ask narrowly:

If blocked, provide:
1. Exact error message
2. Minimal code snippet
3. What you've tried

Do not redesign or add scope. Follow the spec.
