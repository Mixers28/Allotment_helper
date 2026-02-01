# Railway Deployment Fix

## Issue

Railway build fails with:
```
ERROR: failed to build: failed to solve: secret ALLOWED_ORIGINS: not found
```

## Root Cause

Railway auto-detected npm instead of pnpm, and tried to use environment variables during build phase (they're only needed at runtime).

## Solution Applied

1. **Moved `nixpacks.toml` to monorepo root** (from `apps/api/nixpacks.toml`)
2. **Updated to use corepack** to enable pnpm
3. **Removed `railway.json`** (nixpacks.toml is sufficient)

## Manual Configuration (If Needed)

If Railway still doesn't detect the configuration automatically:

### In Railway Dashboard:

**Settings → Deploy:**

1. **Build Command**:
   ```bash
   corepack enable && corepack prepare pnpm@latest --activate && pnpm install --frozen-lockfile && cd apps/api && pnpm db:generate && pnpm build
   ```

2. **Start Command**:
   ```bash
   cd apps/api && pnpm db:migrate:deploy && node dist/index.js
   ```

3. **Root Directory**: Leave as `/` (monorepo root)

### Environment Variables:

Set these in Railway dashboard (Variables tab):

```env
NODE_ENV=production
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
```

**Note**: `DATABASE_URL` is auto-provided by Railway's PostgreSQL plugin.

## Alternative: Simpler Approach

If the above still has issues, use this minimal setup:

### Option A: Use npm workspace (Railway prefers npm)

Create `.npmrc` at root:
```
enable-pre-post-scripts=false
```

Then Railway will use npm workspaces automatically.

### Option B: Explicit pnpm in package.json

Add to root `package.json`:
```json
{
  "packageManager": "pnpm@8.15.0",
  "scripts": {
    "build": "cd apps/api && pnpm db:generate && pnpm build",
    "start": "cd apps/api && pnpm db:migrate:deploy && node dist/index.js"
  }
}
```

Then in Railway settings:
- Build Command: `pnpm build`
- Start Command: `pnpm start`

## Verification

After deploying, test:

```bash
curl https://your-app.up.railway.app/health
```

Should return: `{"status":"ok"}`

## If Build Still Fails

1. Check Railway build logs for the exact error
2. Verify `pnpm-lock.yaml` is committed to git
3. Try deleting the service and recreating it
4. Contact Railway support with the build logs

## Current Configuration Files

- `nixpacks.toml` - At monorepo root (preferred)
- `package.json` - Has `packageManager` field
- `pnpm-workspace.yaml` - Monorepo configuration
- `pnpm-lock.yaml` - Lockfile (must be committed)
