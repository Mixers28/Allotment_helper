# Allotment Garden Planner

A web application for planning and managing garden plots and beds with precise spatial layout capabilities.

## Project Status

**Sprint 0 + Sprint 1**: Complete ✅
- Monorepo scaffolding
- Plot and bed geometry editor
- API backend with Postgres
- React frontend with Konva canvas
- All features from SPRINT_0_1_SPEC.md implemented

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Konva, Zustand
- **Backend**: Node.js, Fastify, Prisma
- **Database**: PostgreSQL
- **Monorepo**: pnpm workspaces
- **Testing**: Vitest
- **CI**: GitHub Actions

## Project Structure

```
allotment/
├── apps/
│   ├── web/          # React frontend (Vite + Konva)
│   └── api/          # Fastify backend + Prisma
├── packages/
│   ├── domain/       # Shared types and Zod schemas
│   └── placement/    # Pure coordinate transform functions
├── docs/             # Specifications and documentation
└── .github/          # CI workflows
```

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **pnpm** 8+
- **PostgreSQL** 15+

## Setup Instructions

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up the database

Start PostgreSQL (via Docker or locally):

```bash
# Option 1: Docker
docker run --name allotment-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=allotment \
  -p 5432:5432 \
  -d postgres:15

# Option 2: Use existing local Postgres (ensure it's running)
```

### 3. Configure environment

Create `apps/api/.env`:

```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env` if needed (default connects to localhost:5432):

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/allotment?schema=public"
PORT=3001
```

### 4. Run database migrations

```bash
cd apps/api
pnpm db:generate    # Generate Prisma client
pnpm db:migrate     # Run migrations (creates tables)
pnpm db:seed        # Seed crop catalog
cd ../..
```

### 5. Start development servers

```bash
# Terminal 1: Start API server
cd apps/api
pnpm dev            # Runs on http://localhost:3001

# Terminal 2: Start web app
cd apps/web
pnpm dev            # Runs on http://localhost:5173
```

Open http://localhost:5173 in your browser.

## Usage

### Creating a Plot

1. Click **"Draw Plot"** button in toolbar
2. Click and drag on canvas to draw plot boundary
3. Release to create the plot (dimensions shown live)

Alternatively:
- Use **"Create Plot"** modal for precise dimensions

### Adding Beds

1. Ensure a plot exists
2. Click **"Add Bed"** button
3. Enter bed dimensions and position
4. Click "Add Bed"

### Editing Beds

- **Drag** to reposition
- **Drag corner handles** to resize
- **Drag top circle handle** to rotate (snaps to 0°/15°/30°/45°/90°)
- Click **Lock** icon to prevent edits
- Click **Delete** to remove

### Canvas Controls

- **Pan**: Click and drag background (when in Select mode)
- **Zoom**: Mouse wheel
- **Select bed**: Click on any bed

## Scripts

### Root
- `pnpm install` - Install all dependencies
- `pnpm dev` - Start all services in parallel
- `pnpm build` - Build all packages
- `pnpm lint` - Lint all packages
- `pnpm test` - Run all tests

### API (`apps/api`)
- `pnpm dev` - Start development server (watch mode)
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:migrate` - Run migrations
- `pnpm db:seed` - Seed database
- `pnpm db:push` - Push schema changes (dev only)

### Web (`apps/web`)
- `pnpm dev` - Start Vite dev server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build

### Packages
- `packages/domain` - Shared types and validation schemas
- `packages/placement` - Pure coordinate transform functions (with tests)

## Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
cd packages/placement
pnpm test

# Watch mode
pnpm test:watch
```

## Architecture

### Data Flow

1. **User interaction** → Konva canvas events
2. **Zustand store** → Optimistic UI updates
3. **Debounced API calls** → Persist to Postgres
4. **Reload** → Fetch from API, restore state

### Coordinate System

- **World coordinates**: Meters, origin at plot top-left
- **Bed local coordinates**: Origin at bed top-left, X=length, Y=width
- **Canvas pixels**: Converted via `PIXELS_PER_METER = 50`

### Key Features

- ✅ Draw rectangular plot boundaries
- ✅ Add/edit/delete beds
- ✅ Drag beds to reposition
- ✅ Resize beds with corner handles
- ✅ Rotate beds with angle snapping
- ✅ Lock beds to prevent editing
- ✅ Live dimension labels (meters)
- ✅ Persistent storage (auto-save on changes)
- ✅ Pan/zoom canvas

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/plots` | List all plots |
| `POST` | `/plots` | Create plot |
| `GET` | `/plots/:id` | Get plot with beds |
| `PUT` | `/plots/:id` | Update plot |
| `DELETE` | `/plots/:id` | Delete plot |
| `POST` | `/plots/:id/beds` | Add bed to plot |
| `GET` | `/beds/:id` | Get bed |
| `PUT` | `/beds/:id` | Update bed |
| `DELETE` | `/beds/:id` | Delete bed |

## Database Schema

See [apps/api/prisma/schema.prisma](apps/api/prisma/schema.prisma)

Key models:
- `PlotBase` - Plot boundaries (rectangular)
- `BedBase` - Bed geometry (x, y, width, height, rotation, locked)
- `Crop` / `Variety` - Crop catalog (for future features)

## Troubleshooting

### Database connection fails

```bash
# Check PostgreSQL is running
docker ps  # (if using Docker)

# Test connection
psql -U postgres -h localhost -p 5432 -d allotment
```

### Prisma client not found

```bash
cd apps/api
pnpm db:generate
```

### Port already in use

Edit `apps/api/.env` to change `PORT`, or `apps/web/vite.config.ts` for frontend port.

### TypeScript errors

```bash
# Rebuild all packages
pnpm build

# Check specific package
cd packages/domain
pnpm build
```

## Development Notes

- **No feature creep**: Follow SPRINT_0_1_SPEC.md exactly
- **Pure packages**: `domain` and `placement` have zero UI dependencies
- **Meters only**: Units conversion deferred to backlog
- **Single plot**: Multi-plot support is backlog
- **Desktop only**: Mobile/responsive design is backlog

## Next Steps (Backlog)

See [docs/BACKLOG.md](docs/BACKLOG.md) for planned features:
- Seasons and planting schedules
- Section management within beds
- Plant placement and spacing
- Polygon plot boundaries
- User authentication
- Mobile responsive design

## Documentation

- [SPRINT_0_1_SPEC.md](docs/SPRINT_0_1_SPEC.md) - Sprint 0+1 specification
- [HANDOFF_CODER.md](docs/HANDOFF_CODER.md) - Implementation guide
- [spec.md](docs/spec.md) - Full project specification

## License

Private/Internal Use
