# Railway Manual Setup - Bypass Auto-Detection

If Railway's auto-detection keeps failing with "secret ALLOWED_ORIGINS: not found", use this manual setup instead.

## Option 1: Manual Service Configuration (Recommended)

### Step 1: Delete Auto-Detection Files

In Railway dashboard, we need to configure manually instead of using auto-detection.

### Step 2: Set Build & Start Commands Manually

In Railway dashboard → Your service → Settings → Deploy:

**Build Command:**
```bash
npm install -g pnpm@8 && pnpm install --frozen-lockfile && cd apps/api && pnpm db:generate && pnpm build
```

**Start Command:**
```bash
cd apps/api && npx prisma migrate deploy && node dist/index.js
```

**Watch Paths:** (leave default or set to `apps/api/**`)

### Step 3: Set Environment Variables

In Variables tab, add:

```env
NODE_ENV=production
ALLOWED_ORIGINS=http://localhost:5173
PORT=3001
```

**Important**: `DATABASE_URL` is auto-provided by Railway's PostgreSQL plugin. Don't add it manually.

### Step 4: Deploy

Click "Deploy" or trigger redeploy.

## Option 2: Use Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Set variables
railway variables set NODE_ENV=production
railway variables set ALLOWED_ORIGINS=http://localhost:5173

# Deploy
railway up
```

## Option 3: Delete nixpacks.toml Entirely

Railway might be reading the nixpacks.toml file incorrectly. Try:

1. Temporarily rename or delete `nixpacks.toml`
2. Configure build commands manually in Railway dashboard (Option 1 above)
3. Redeploy

## Why This Error Happens

Railway's Nixpacks builder sometimes treats environment variable references in config files as build-time secrets. The error "secret ALLOWED_ORIGINS: not found" means Railway thinks ALLOWED_ORIGINS should be available during build, but it's actually a runtime-only variable.

## Verification

After successful deploy:

```bash
# Check health
curl https://your-app.up.railway.app/health

# Should return
{"status":"ok"}
```

## Update ALLOWED_ORIGINS After Vercel Deploy

Once your Vercel frontend is deployed:

```bash
railway variables set ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
```

Or in Railway dashboard → Variables → Update `ALLOWED_ORIGINS`

Then redeploy the service.

## If Still Failing

Share the full build log from Railway. The error might be coming from:
1. A dependency trying to access env vars during install
2. Prisma trying to connect to database during `pnpm db:generate`
3. TypeScript compilation accessing env vars

For Prisma specifically, make sure build command includes:
```bash
DATABASE_URL="postgresql://localhost:5432/temp" pnpm db:generate
```

This gives Prisma a dummy URL during build (it doesn't actually connect).
