# Production Deployment Guide

Complete guide for deploying the Allotment Garden Planner to production with Railway (backend) and Vercel (frontend).

---

## Overview

- **Backend**: Railway with PostgreSQL database
- **Frontend**: Vercel with static hosting
- **Architecture**: Monorepo with pnpm workspaces
- **Build**: Multi-stage Docker build for Railway, Vite build for Vercel

---

## Prerequisites

- GitHub account with repository access to `Mixers28/Allotment_helper`
- Railway account (https://railway.app)
- Vercel account (https://vercel.com)
- Latest code pushed to GitHub `main` branch

---

## Part 1: Deploy Backend to Railway

### Quick Start (Recommended)

Railway's auto-detection has issues with monorepos. **Use the Dockerfile for reliable builds.**

#### 1. Create Railway Project

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose `Mixers28/Allotment_helper`

#### 2. Add PostgreSQL Database

1. In your Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway automatically creates a `DATABASE_URL` environment variable

#### 3. Configure Service to Use Dockerfile

Go to: **Your Service** → **Settings** → **Deploy**

**Builder:** Select **DOCKERFILE**

**Important**: Clear these fields (Dockerfile handles everything):
- Custom Build Command: (leave empty)
- Custom Start Command: (leave empty)
- Custom Install Command: (leave empty)

#### 4. Set Environment Variables

Go to **Variables** tab and add:

```env
NODE_ENV=production
ALLOWED_ORIGINS=http://localhost:5173
```

> Note: `DATABASE_URL` is automatically provided by the PostgreSQL service.
> Update `ALLOWED_ORIGINS` after deploying the frontend.

#### 5. Deploy

Go to **Deployments** tab → Click **Deploy** (or **Redeploy**)

#### 6. Verify Deployment

After build completes, test the health endpoint:

```bash
curl https://your-app.up.railway.app/health
```

Should return:
```json
{"status":"ok"}
```

### What the Dockerfile Does

The multi-stage Dockerfile automatically:

1. Enables corepack for pnpm 9.15.0
2. Installs all monorepo dependencies
3. Generates Prisma client (v5.22.0)
4. Builds TypeScript to `dist/`
5. Creates production image with only necessary files
6. Runs `prisma migrate deploy` on startup
7. Starts the Fastify API server on port 3001

### Why Use Dockerfile?

✅ Zero auto-detection issues
✅ Explicit, predictable build process
✅ No railpack-plan.json generation errors
✅ `ALLOWED_ORIGINS` only used at runtime (not build time)
✅ Multi-stage build optimized for production
✅ Prisma version pinned to avoid v7 breaking changes

---

## Part 2: Deploy Frontend to Vercel

### Quick Start

#### 1. Create Vercel Project

1. Go to https://vercel.com
2. Click "New Project"
3. Import `Mixers28/Allotment_helper` from GitHub

#### 2. Configure Project Settings

**Framework Preset:** Vite

**Root Directory:** `apps/web` ⚠️ **CRITICAL - Must be set correctly**

**Build Command:**
```bash
cd ../.. && pnpm install && cd apps/web && pnpm build
```

**Output Directory:** `dist`

**Install Command:**
```bash
pnpm install
```

> The build command navigates to monorepo root to install all dependencies, then builds the web app.

#### 3. Set Environment Variables

In Vercel project settings → Environment Variables, add:

**Key:** `VITE_API_URL`
**Value:** `https://your-railway-app.up.railway.app`
**Environment:** All (Production, Preview, Development)

> Replace `your-railway-app.up.railway.app` with your actual Railway backend URL from Part 1.

#### 4. Deploy

Click "Deploy"

Build should succeed with the TypeScript configuration fixes in place.

#### 5. Verify Deployment

1. Open your Vercel URL (e.g., `https://your-app.vercel.app`)
2. You should see the canvas interface
3. Try drawing a plot - it should save to Railway backend

---

## Part 3: Connect Frontend and Backend

### Update Railway CORS

After Vercel deploys successfully:

1. Go to Railway → Your service → Variables
2. Update `ALLOWED_ORIGINS` to include your Vercel URL:
   ```env
   ALLOWED_ORIGINS=https://your-app.vercel.app
   ```
3. Go to Deployments tab → Click **Redeploy**

### Test Full Integration

1. Open Vercel app: `https://your-app.vercel.app`
2. Draw a plot boundary by clicking and dragging
3. Add a bed inside the plot
4. Refresh the page
5. Everything should persist ✅

---

## Configuration Files

### Dockerfile

Located at `/Dockerfile` in the repository root. Handles the complete Railway build process.

Key features:
- Uses Node 20 slim image
- Enables corepack for pnpm
- Multi-stage build (dependencies → build → production)
- Prisma pinned to ~5.22.0 (avoids v7 breaking changes)
- Health check endpoint configured
- Automatic migrations on startup

### vercel.json

Located at `/apps/web/vercel.json`. Configures Vercel deployment.

Key settings:
- Custom build command for monorepo
- Custom install command
- Framework detection disabled (using explicit config)

### TypeScript Configuration

Fixed configurations for both Railway and Vercel:

- `apps/api/tsconfig.json`: Added `"noEmit": false` to allow compilation
- `apps/web/tsconfig.json`: Added `"noEmit": false` for Vercel builds
- `apps/web/tsconfig.node.json`: Added `"noEmit": false` for project references
- `apps/web/src/vite-env.d.ts`: Added type declarations for `import.meta.env`

---

## Environment Variables Summary

### Railway (Backend)

| Variable | Value | Source | Notes |
|----------|-------|--------|-------|
| `DATABASE_URL` | Auto-generated | PostgreSQL service | Connection string |
| `PORT` | Auto-set | Railway | Usually 3001 |
| `NODE_ENV` | `production` | Manual | Required |
| `ALLOWED_ORIGINS` | Vercel URL(s) | Manual | Comma-separated list |

Example:
```env
NODE_ENV=production
ALLOWED_ORIGINS=https://your-app.vercel.app,https://custom-domain.com
DATABASE_URL=postgresql://user:pass@host:5432/db
PORT=3001
```

### Vercel (Frontend)

| Variable | Value | Notes |
|----------|-------|-------|
| `VITE_API_URL` | Railway backend URL | Must include https:// |

Example:
```env
VITE_API_URL=https://your-railway-app.up.railway.app
```

---

## Troubleshooting

### Railway Issues

**Build fails with "ALLOWED_ORIGINS: not found"**
- Cause: Railway auto-detection treating env var as build secret
- Fix: Use Dockerfile builder (Settings → Deploy → Builder: DOCKERFILE)

**Build fails with "pnpm version mismatch"**
- Cause: Lockfile created with different pnpm version
- Fix: Verify `package.json` has `"packageManager": "pnpm@9.15.0"`

**Build fails with "TypeScript not emitting files"**
- Cause: Base tsconfig has `noEmit: true`
- Fix: Verify `apps/api/tsconfig.json` has `"noEmit": false`

**Runtime error: "Prisma schema validation error"**
- Cause: Prisma 7.x installed (breaking change)
- Fix: Verify `apps/api/package.json` pins Prisma to `~5.22.0`

**Database connection fails**
- Verify PostgreSQL service is running
- Check `DATABASE_URL` is set in environment variables
- Review deployment logs for connection errors

### Vercel Issues

**Build fails with "Referenced project may not disable emit"**
- Cause: TypeScript project references with noEmit
- Fix: Verify `apps/web/tsconfig.json` and `tsconfig.node.json` have `"noEmit": false`

**Build fails with "Property 'env' does not exist on ImportMeta"**
- Cause: Missing Vite type declarations
- Fix: Verify `apps/web/src/vite-env.d.ts` exists with proper types

**API calls fail with CORS error**
- Check `ALLOWED_ORIGINS` in Railway includes your Vercel URL
- Redeploy Railway after updating environment variables
- Check browser console for specific CORS error message

**API calls return 404**
- Check `VITE_API_URL` in Vercel is set correctly
- Verify Railway backend is running and healthy
- Test Railway health endpoint directly

**Build succeeds but page is blank**
- Check browser console for JavaScript errors
- Verify Output Directory is set to `dist`
- Check build logs show Vite build completed successfully

---

## Database Management

### View Data (Railway Dashboard)

1. Click PostgreSQL service in Railway project
2. Go to "Data" tab
3. Browse tables: `Plot`, `Bed`

### Run Migrations

Migrations run automatically on Railway startup via the Dockerfile CMD.

To run manually:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and link to project
railway login
railway link

# Run migrations
railway run npx prisma migrate deploy
```

### Seed Database (Optional)

```bash
railway run cd apps/api && npx tsx prisma/seed.ts
```

Creates sample plots and beds for testing.

---

## Continuous Deployment

Both Railway and Vercel automatically deploy on git push to `main`:

1. Make changes locally
2. Commit and push to GitHub
3. Railway and Vercel automatically detect changes
4. Both services rebuild and deploy
5. Monitor deployment status in dashboards

**Note**: Environment variable changes require manual redeployment.

---

## Rollback Procedures

### Railway Rollback

1. Go to Railway project → "Deployments"
2. Find previous successful deployment
3. Click "⋮" menu → "Redeploy"

### Vercel Rollback

1. Go to Vercel project → "Deployments"
2. Find previous deployment
3. Click "⋮" menu → "Promote to Production"

---

## Monitoring and Logs

### Railway

- **Logs**: Dashboard → Deployments → Click deployment → View Logs
- **Metrics**: Dashboard → Metrics tab (CPU, memory, network)
- **Database**: PostgreSQL service → Data tab

### Vercel

- **Build Logs**: Dashboard → Deployments → Click deployment → Logs
- **Runtime Logs**: Dashboard → Logs tab
- **Analytics**: Dashboard → Analytics tab (traffic, performance)

---

## Custom Domains (Optional)

### Add Railway Custom Domain

1. Railway project → Settings → Domains
2. Click "Generate Domain" or add custom domain
3. If custom: Add DNS records as shown
4. Update Vercel `VITE_API_URL` if needed

### Add Vercel Custom Domain

1. Vercel project → Settings → Domains
2. Add your custom domain
3. Configure DNS as instructed
4. **Important**: Update Railway `ALLOWED_ORIGINS` to include new domain
5. Redeploy Railway

---

## Security Checklist

- ✅ `.env` files excluded via `.gitignore`
- ✅ CORS restricted to specific origins
- ✅ Database credentials use environment variables
- ✅ HTTPS enforced (Railway and Vercel provide this)
- ✅ Prisma version pinned (security updates)
- ⚠️ **No authentication implemented** (Sprint backlog item)
- ⚠️ **No rate limiting** (recommended for production)

### Recommended Next Steps

1. Implement user authentication
2. Add API rate limiting
3. Set up error tracking (Sentry, LogRocket)
4. Configure database backups
5. Add monitoring alerts
6. Review API security headers

---

## Cost Estimates

### Railway

- **Hobby Plan**: $5/month (500 hours execution)
- **PostgreSQL**: Included in Hobby plan
- **Bandwidth**: 100GB included

### Vercel

- **Hobby Plan**: Free (personal projects)
- **Pro Plan**: $20/month (commercial, more bandwidth/builds)

**Total**: ~$5-25/month depending on usage and plan

---

## Support Resources

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **Prisma Deployment**: https://www.prisma.io/docs/guides/deployment
- **Fastify Docs**: https://fastify.dev
- **Vite Docs**: https://vitejs.dev

For project-specific information:
- [README.md](../README.md) - Project overview
- [Repo_Structure.md](Repo_Structure.md) - Codebase organization
- [SPRINT_0_1_SPEC.md](SPRINT_0_1_SPEC.md) - Feature specifications

---

## Success Checklist

Use this checklist to verify deployment:

### Railway Backend

- [ ] PostgreSQL service created
- [ ] Service configured to use Dockerfile builder
- [ ] Environment variables set (NODE_ENV, ALLOWED_ORIGINS)
- [ ] Deployment successful (green status)
- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] Can fetch `/plots` endpoint (returns array)

### Vercel Frontend

- [ ] Root Directory set to `apps/web`
- [ ] Build command includes monorepo navigation
- [ ] Environment variable `VITE_API_URL` set
- [ ] Deployment successful
- [ ] Frontend loads in browser
- [ ] Canvas interface visible

### Integration

- [ ] Can create plot (click and drag on canvas)
- [ ] Plot saves to database (no CORS errors)
- [ ] Page refresh preserves data
- [ ] Can add beds to plots
- [ ] All CRUD operations work
- [ ] No console errors

**Deployment complete!** 🎉
