# Deployment Guide

Deploy the Allotment Garden Planner with backend on Railway and frontend on Vercel.

---

## Prerequisites

- GitHub account with repository access
- Railway account (https://railway.app)
- Vercel account (https://vercel.com)

---

## Part 1: Deploy Backend to Railway

### Step 1: Create Railway Project

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose `Mixers28/Allotment_helper`
5. Railway will detect the monorepo

### Step 2: Add PostgreSQL Database

1. In your Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically create a `DATABASE_URL` environment variable

### Step 3: Configure Environment Variables

In Railway project settings, add these variables:

```env
# Node environment
NODE_ENV=production

# Allowed CORS origins (IMPORTANT - add your Vercel URL)
ALLOWED_ORIGINS=https://your-app.vercel.app

# Port (Railway sets this automatically, but you can override)
PORT=3001
```

**Important**: After deploying the frontend (Part 2), come back and update `ALLOWED_ORIGINS` with your actual Vercel URL.

### Step 4: Configure Build Settings

Railway should auto-detect the configuration from `railway.json` and `nixpacks.toml`.

If you need to manually configure:

**Root Directory**: `/` (monorepo root)

**Build Command**:
```bash
pnpm install && cd apps/api && pnpm db:generate && pnpm build
```

**Start Command**:
```bash
cd apps/api && pnpm db:migrate:deploy && node dist/index.js
```

### Step 5: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Railway will provide a public URL like: `https://your-app.up.railway.app`
4. Test the API: `https://your-app.up.railway.app/health`

### Step 6: Run Database Migrations

After first deployment, you need to run migrations:

**Option A - Via Railway CLI**:
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# Run migrations
railway run pnpm db:migrate:deploy

# Seed database (optional)
railway run pnpm db:seed
```

**Option B - Via Railway Dashboard**:
1. Go to your service settings
2. Click "Variables" tab
3. Add temporary variable: `RUN_MIGRATIONS=true`
4. Update start command to:
   ```bash
   cd apps/api && pnpm db:migrate:deploy && pnpm db:seed && node dist/index.js
   ```
5. Redeploy
6. After successful deploy, remove `RUN_MIGRATIONS` and revert start command

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Project

1. Go to https://vercel.com
2. Click "New Project"
3. Import `Mixers28/Allotment_helper` from GitHub
4. Vercel will detect the monorepo

### Step 2: Configure Project Settings

**Framework Preset**: Other (or Vite)

**Root Directory**: `apps/web` ⚠️ **IMPORTANT**

**Build Command**:
```bash
cd ../.. && pnpm install && cd apps/web && pnpm build
```

**Output Directory**: `dist`

**Install Command**:
```bash
pnpm install
```

### Step 3: Configure Environment Variables

In Vercel project settings → Environment Variables, add:

```env
VITE_API_URL=https://your-railway-app.up.railway.app
```

Replace `your-railway-app.up.railway.app` with your actual Railway backend URL from Part 1.

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Vercel will provide a URL like: `https://your-app.vercel.app`

### Step 5: Update Railway CORS

1. Go back to Railway project
2. Update `ALLOWED_ORIGINS` environment variable:
   ```env
   ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-custom-domain.com
   ```
3. Add your Vercel URL (and any custom domains)
4. Redeploy Railway backend

---

## Part 3: Verify Deployment

### Test Backend (Railway)

```bash
# Health check
curl https://your-railway-app.up.railway.app/health

# Should return: {"status":"ok"}

# List plots (should return empty array initially)
curl https://your-railway-app.up.railway.app/plots

# Should return: []
```

### Test Frontend (Vercel)

1. Open `https://your-app.vercel.app`
2. You should see the canvas
3. Try drawing a plot:
   - Click "Draw Plot"
   - Click and drag on canvas
   - Plot should save to Railway database
4. Refresh page - plot should persist

### Common Issues

**CORS Error in Browser Console**:
- Check `ALLOWED_ORIGINS` in Railway includes your Vercel URL
- Redeploy Railway after updating

**API Calls Failing (404)**:
- Check `VITE_API_URL` in Vercel is set correctly
- Redeploy Vercel after updating

**Database Connection Error**:
- Verify Railway PostgreSQL plugin is installed
- Check `DATABASE_URL` is set in Railway

**Build Fails on Railway**:
- Check build logs
- Verify `pnpm-lock.yaml` is committed to git
- Ensure monorepo structure is correct

**Build Fails on Vercel**:
- Verify Root Directory is set to `apps/web`
- Check build command includes `cd ../..` to install from monorepo root
- Ensure all dependencies are in `pnpm-lock.yaml`

---

## Environment Variables Summary

### Railway (Backend)

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | Auto-generated | From PostgreSQL plugin |
| `PORT` | Auto-set by Railway | Usually 3001 |
| `NODE_ENV` | `production` | Required |
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app` | Comma-separated list |

### Vercel (Frontend)

| Variable | Value | Notes |
|----------|-------|-------|
| `VITE_API_URL` | `https://your-railway-app.up.railway.app` | Railway backend URL |

---

## Custom Domains (Optional)

### Railway Custom Domain

1. In Railway project settings → "Settings" → "Domains"
2. Click "Generate Domain" or add custom domain
3. If custom domain: Add DNS records as shown

### Vercel Custom Domain

1. In Vercel project settings → "Domains"
2. Add your custom domain
3. Configure DNS as instructed
4. Update Railway `ALLOWED_ORIGINS` to include new domain

---

## Continuous Deployment

Both Railway and Vercel will auto-deploy on git push to `main` branch:

1. Make changes locally
2. Commit and push to GitHub
3. Railway and Vercel automatically rebuild and deploy
4. Check deployment status in respective dashboards

---

## Rollback

### Railway Rollback

1. Go to Railway project → "Deployments"
2. Find previous successful deployment
3. Click "⋮" menu → "Redeploy"

### Vercel Rollback

1. Go to Vercel project → "Deployments"
2. Find previous deployment
3. Click "⋮" menu → "Promote to Production"

---

## Monitoring

### Railway

- View logs: Railway dashboard → "Deployments" → Click deployment → "View Logs"
- Metrics: Railway dashboard → "Metrics" tab
- Database: Railway dashboard → PostgreSQL service → "Data" tab

### Vercel

- View logs: Vercel dashboard → "Deployments" → Click deployment → "Logs"
- Analytics: Vercel dashboard → "Analytics" tab
- Runtime logs: Vercel dashboard → "Logs" tab

---

## Database Management

### View Database (Railway)

**Option 1 - Railway Dashboard**:
1. Click PostgreSQL service
2. Go to "Data" tab
3. Browse tables

**Option 2 - Local Connection**:
1. Get `DATABASE_URL` from Railway
2. Use any PostgreSQL client (e.g., pgAdmin, TablePlus, DBeaver)

### Seed Production Database

```bash
railway run pnpm db:seed
```

### Run Migrations

```bash
railway run pnpm db:migrate:deploy
```

---

## Cost Estimates

### Railway
- Hobby Plan: $5/month (500 hours execution)
- PostgreSQL: Included in Hobby plan
- Bandwidth: 100GB included

### Vercel
- Hobby Plan: Free
- Pro Plan: $20/month (if needed for more bandwidth/builds)

**Total**: ~$5-25/month depending on usage

---

## Security Checklist

- [x] `.env` files excluded via `.gitignore`
- [x] CORS restricted to specific origins
- [x] Database credentials use environment variables
- [x] HTTPS enforced (Railway and Vercel provide this)
- [ ] Consider adding authentication (currently open)
- [ ] Consider rate limiting for production
- [ ] Monitor logs for suspicious activity

---

## Next Steps After Deployment

1. **Add Custom Domains** (optional)
2. **Set up monitoring/alerts** (Railway and Vercel provide this)
3. **Implement authentication** (Sprint backlog item)
4. **Add rate limiting** to API endpoints
5. **Set up backup strategy** for PostgreSQL database
6. **Configure error tracking** (Sentry, LogRocket, etc.)

---

## Support

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Prisma Deployment: https://www.prisma.io/docs/guides/deployment

For project-specific issues, see [README.md](README.md) and [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md).
