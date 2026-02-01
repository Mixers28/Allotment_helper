# Railway - Disable Auto-Detection (CRITICAL)

## The Problem

Railway keeps generating `railpack-plan.json` with the error:
```
ERROR: failed to build: failed to solve: secret ALLOWED_ORIGINS: not found
```

Even after removing `nixpacks.toml`, Railway is still auto-detecting and creating a faulty build plan.

## The Solution

**You MUST manually configure Railway to ignore auto-detection.**

---

## Step-by-Step Fix

### 1. In Railway Dashboard

Go to: **Your Service** → **Settings** → **Deploy**

### 2. Clear ALL Auto-Detection

**IMPORTANT**: Set these fields to OVERRIDE auto-detection:

#### Builder
Select: **DOCKERFILE** or **NIXPACKS** (either works with manual config)

#### Custom Build Command
```bash
npm install -g pnpm@8 && pnpm install --frozen-lockfile && cd apps/api && pnpm db:generate && pnpm build
```

#### Custom Start Command
```bash
cd apps/api && npx prisma migrate deploy && node dist/index.js
```

#### Custom Install Command
```bash
npm install -g pnpm@8 && pnpm install --frozen-lockfile
```

#### Root Directory
Leave **EMPTY** or set to `/`

#### Watch Paths
```
apps/api/**
```

### 3. Delete Old Deployments

In **Deployments** tab:
1. Click on the failed deployment
2. Click "⋮" menu
3. Select "Remove Deployment"
4. Do this for ALL failed deployments

This clears Railway's cache.

### 4. Environment Variables

Make sure these are set in **Variables** tab:

```
NODE_ENV=production
ALLOWED_ORIGINS=http://localhost:5173
```

**Verify** `DATABASE_URL` exists (auto-created by PostgreSQL plugin)

### 5. Trigger Fresh Deploy

**Settings** → **Danger** → **Restart Deployment**

Or make a small commit and push to trigger redeploy.

---

## Alternative: Use Dockerfile

If Railway STILL auto-detects incorrectly, create a Dockerfile:

### Create `Dockerfile` at repo root:

```dockerfile
# Use Node 20
FROM node:20-slim

# Install pnpm
RUN npm install -g pnpm@8

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/domain/package.json ./packages/domain/
COPY packages/placement/package.json ./packages/placement/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
WORKDIR /app/apps/api
RUN pnpm db:generate

# Build
RUN pnpm build

# Expose port
EXPOSE 3001

# Start command
CMD ["sh", "-c", "cd /app/apps/api && pnpm db:migrate:deploy && node dist/index.js"]
```

Then in Railway:
- Builder: **DOCKERFILE**
- Railway will use the Dockerfile instead of auto-detecting

---

## Why This Happens

Railway's Railpack/Nixpacks auto-detection is:
1. Reading `package.json` and detecting the monorepo
2. Trying to be "smart" about environment variables
3. Incorrectly treating runtime env vars as build secrets
4. Generating a faulty `railpack-plan.json`

**Manual configuration bypasses ALL of this.**

---

## Verification

After deploying with manual config:

```bash
curl https://your-app.up.railway.app/health
```

Should return:
```json
{"status":"ok"}
```

---

## If STILL Failing

1. **Delete the entire Railway service**
2. Create a NEW service
3. Configure manually BEFORE first deploy
4. Set all custom commands BEFORE Railway attempts to build

Railway caches build plans aggressively. Starting fresh ensures no cached faulty config.

---

## Nuclear Option: Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create new project
railway init

# Link to your repo
railway link

# Set variables
railway variables set NODE_ENV=production
railway variables set ALLOWED_ORIGINS=http://localhost:5173

# Deploy with explicit commands
railway up --detach
```

This gives you full control without relying on the dashboard.
