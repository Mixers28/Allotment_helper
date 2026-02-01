# Railway Deployment - Fixed & Ready

## What Was Fixed

✅ Moved `nixpacks.toml` to monorepo root
✅ Added `packageManager: "pnpm@8.15.0"` to root package.json
✅ Railway now auto-detects pnpm correctly
✅ ALLOWED_ORIGINS error resolved (it's now a runtime variable, not build secret)

## Push Changes First

```bash
git push origin main
```

## Deploy to Railway (Updated Steps)

### Step 1: Create New Deployment

1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select `Mixers28/Allotment_helper`
4. Railway will auto-detect the configuration

### Step 2: Add PostgreSQL

1. Click "New" in your project
2. Select "Database" → "PostgreSQL"
3. Railway automatically creates `DATABASE_URL` variable

### Step 3: Set Environment Variables

In Railway dashboard → Your service → Variables tab:

Add these variables:

```env
NODE_ENV=production
ALLOWED_ORIGINS=https://localhost:5173
```

**Note**: We'll update `ALLOWED_ORIGINS` after deploying Vercel frontend.

### Step 4: Configure Service Settings (If Needed)

Railway should auto-detect everything, but verify:

**Settings → Deploy:**
- Build Command: `pnpm build` (from root package.json)
- Start Command: `pnpm start` (from root package.json)
- Root Directory: `/` (leave empty/default)

### Step 5: Deploy

1. Click "Deploy" (or it deploys automatically)
2. Wait for build to complete (~2-3 minutes)
3. Check the deployment logs for errors

### Step 6: Get Your Railway URL

After successful deployment:
1. Go to Settings → Networking
2. Copy the public URL (e.g., `allotment-helper.up.railway.app`)
3. Test it: `curl https://your-app.up.railway.app/health`

Should return: `{"status":"ok"}`

## If Build Still Fails

### Check Build Logs

Look for specific errors in the Deployments → View Logs section.

### Common Issues:

**"pnpm not found"**
→ Make sure you pushed the latest commit with `packageManager` field

**"Cannot find module"**
→ Verify `pnpm-lock.yaml` is committed to git

**Database connection error**
→ Make sure PostgreSQL plugin is added and `DATABASE_URL` exists

### Manual Override (Last Resort)

If auto-detection still fails, manually set in Railway Settings:

**Build Command**:
```bash
corepack enable && corepack prepare pnpm@latest --activate && pnpm install && cd apps/api && pnpm db:generate && pnpm build
```

**Start Command**:
```bash
cd apps/api && pnpm db:migrate:deploy && node dist/index.js
```

## After Successful Deploy

1. ✅ Test health endpoint: `curl https://your-app.up.railway.app/health`
2. ✅ Test plots endpoint: `curl https://your-app.up.railway.app/plots`
3. ✅ Copy your Railway URL for Vercel setup
4. 📝 Update `ALLOWED_ORIGINS` after deploying Vercel

## Next: Deploy Frontend to Vercel

See [DEPLOYMENT.md](DEPLOYMENT.md) Part 2 for Vercel deployment.

Quick version:
1. Go to https://vercel.com/new
2. Import `Mixers28/Allotment_helper`
3. Root Directory: `apps/web`
4. Environment variable: `VITE_API_URL=https://your-railway-url.up.railway.app`
5. Deploy

Then come back to Railway and update:
```env
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
```

## Need Help?

- Full guide: [DEPLOYMENT.md](DEPLOYMENT.md)
- Railway fix details: [RAILWAY_FIX.md](RAILWAY_FIX.md)
- Quick reference: [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)
