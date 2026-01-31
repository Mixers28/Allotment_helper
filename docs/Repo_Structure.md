# Allotment Planner — Repository Structure

> Target structure per spec.md section 12.

```
allotment/
├── apps/
│   ├── web/                    # React + TypeScript frontend
│   │   ├── src/
│   │   │   ├── components/     # UI components
│   │   │   ├── canvas/         # Konva canvas editor
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── store/          # Zustand state management
│   │   │   ├── pages/          # Route pages
│   │   │   └── utils/          # Frontend utilities
│   │   ├── public/
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── api/                    # Backend (Node/Fastify or Python/FastAPI)
│       ├── src/
│       │   ├── routes/         # API route handlers
│       │   ├── services/       # Business logic
│       │   ├── db/             # Database client + migrations
│       │   └── utils/          # Backend utilities
│       ├── prisma/             # Prisma schema (if Node)
│       │   └── schema.prisma
│       └── package.json
│
├── packages/
│   ├── domain/                 # Shared types + Zod schemas
│   │   ├── src/
│   │   │   ├── models/         # Data model types
│   │   │   ├── schemas/        # Zod validation schemas
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── placement/              # Plant placement module (pure functions)
│       ├── src/
│       │   ├── grid-fill.ts    # Auto-fill algorithm
│       │   ├── overlap.ts      # Overlap detection
│       │   ├── transforms.ts   # Coordinate transforms
│       │   └── index.ts
│       ├── __tests__/          # Unit tests
│       └── package.json
│
├── docs/
│   ├── PROJECT_CONTEXT.md      # Long-term memory (LTM)
│   ├── NOW.md                  # Working memory (WM)
│   ├── SESSION_NOTES.md        # Session memory (SM)
│   ├── spec.md                 # Source of truth for implementation
│   ├── BACKLOG.md              # Post-MVP feature ideas
│   ├── TEST_PLAN.md            # Testing strategy + checklists
│   ├── AGENT_SESSION_PROTOCOL.md
│   ├── MCP_LOCAL_DESIGN.md
│   └── PERSISTENT_AGENT_WORKFLOW.md
│
├── .github/
│   ├── workflows/              # CI/CD pipelines
│   │   └── ci.yml
│   └── agents/                 # Agent role prompts
│       ├── architect.agent.md
│       ├── coder.agent.md
│       ├── qa.agent.md
│       └── reviewer.agent.md
│
├── .vscode/
│   └── tasks.json              # VS Code tasks for handoffkit
│
├── package.json                # Root monorepo config (pnpm workspaces)
├── pnpm-workspace.yaml
├── turbo.json                  # Turborepo config (optional)
├── tsconfig.base.json          # Shared TypeScript config
├── .gitignore
└── README.md
```

## Key Directories

| Path | Purpose |
|------|---------|
| `/apps/web` | React frontend with Konva canvas editor |
| `/apps/api` | REST API backend with Postgres |
| `/packages/domain` | Shared types and Zod schemas for frontend + backend |
| `/packages/placement` | Pure plant placement engine (must be testable without UI) |
| `/docs` | Project memory, spec, backlog, and test plan |

## Data Flow

1. **Canvas Editor** (`/apps/web/src/canvas/`) renders plots, beds, sections
2. **State** (`/apps/web/src/store/`) manages local UI state with Zustand
3. **API calls** sync state with backend (`/apps/api/`)
4. **Placement module** (`/packages/placement/`) calculates plant positions (called from web or api)
5. **Postgres** stores all persistent data via Prisma/SQLAlchemy
