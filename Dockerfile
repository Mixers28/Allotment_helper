# Multi-stage build for Allotment API
FROM node:20-slim AS base

# Enable corepack (will use packageManager field from package.json)
RUN corepack enable

# Stage 1: Dependencies
FROM base AS dependencies

WORKDIR /app

# Copy package files for workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/domain/package.json ./packages/domain/
COPY packages/placement/package.json ./packages/placement/

# Install dependencies
RUN pnpm install --frozen-lockfile --prod=false

# Stage 2: Build
FROM dependencies AS build

# Copy source code
COPY . .

# Generate Prisma client
WORKDIR /app/apps/api
RUN pnpm db:generate

# Build TypeScript
RUN pnpm build

# Stage 3: Production
FROM base AS production

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/domain/package.json ./packages/domain/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built files from build stage
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
COPY --from=build /app/node_modules/.pnpm ./node_modules/.pnpm
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"

# Start command (with migrations)
CMD ["sh", "-c", "cd apps/api && npx prisma migrate deploy && node dist/index.js"]
