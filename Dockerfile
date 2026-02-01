# Multi-stage build for Allotment API
FROM node:20-slim AS base

# Install OpenSSL (required by Prisma)
RUN apt-get update -y && apt-get install -y openssl

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

# Build domain package first (dependency of API)
WORKDIR /app/packages/domain
RUN pnpm build

# Generate Prisma client and build API
WORKDIR /app/apps/api
RUN pnpm db:generate
RUN pnpm build

# Stage 3: Production
FROM base AS production

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/domain/package.json ./packages/domain/

# Copy built files from build stage
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
COPY --from=build /app/packages/domain/dist ./packages/domain/dist

# Install production dependencies (includes Prisma)
RUN pnpm install --frozen-lockfile --prod

# Generate Prisma client with production dependencies
WORKDIR /app/apps/api
RUN pnpm exec prisma generate
WORKDIR /app

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"

# Start command (with migrations)
CMD ["sh", "-c", "cd apps/api && pnpm exec prisma migrate deploy && node dist/src/index.js"]
