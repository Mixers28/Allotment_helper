# Deployment Configuration Changes

Summary of changes made to support Railway (backend) and Vercel (frontend) deployment.

---

## Files Modified

### Backend (Railway)

1. **`apps/api/src/index.ts`**
   - Updated CORS configuration to support environment-based allowed origins
   - Added `ALLOWED_ORIGINS` environment variable support
   - More restrictive CORS in production vs development

2. **`apps/api/package.json`**
   - Added `start:migrate` script for production deployment with auto-migration
   - Added `db:migrate:deploy` script for production migrations

3. **`apps/api/.env.production.example`** (NEW)
   - Template for Railway environment variables
   - Documents required `ALLOWED_ORIGINS`, `DATABASE_URL`, etc.

### Frontend (Vercel)

4. **`apps/web/vite.config.ts`**
   - Added build configuration
   - Added environment variable handling for `VITE_API_URL`
   - Configured sourcemaps for production

5. **`apps/web/src/api/client.ts`**
   - Updated API_BASE to use `VITE_API_URL` from environment
   - Falls back to `/api` for local development with proxy

6. **`apps/web/.env.example`** (NEW)
   - Template for Vercel environment variables
   - Documents `VITE_API_URL` requirement

### Configuration Files (NEW)

7. **`railway.json`**
   - Railway build and deployment configuration
   - Defines build command, start command, restart policy

8. **`apps/api/nixpacks.toml`**
   - Nixpacks configuration for Railway
   - Specifies Node.js 20 and pnpm setup
   - Custom build phases for monorepo

9. **`vercel.json`**
   - Vercel project configuration
   - Monorepo build settings
   - Output directory configuration

### Database Migrations

10. **`apps/api/prisma/migrations/migration_lock.toml`** (NEW)
    - Prisma migration lock file for PostgreSQL

11. **`apps/api/prisma/migrations/20260131_initial_schema/migration.sql`** (NEW)
    - Initial database schema migration
    - Creates PlotBase, BedBase, Crop, Variety tables
    - Required for `prisma migrate deploy` in production

### Documentation

12. **`DEPLOYMENT.md`** (NEW)
    - Complete step-by-step deployment guide
    - Railway and Vercel configuration
    - Environment variables documentation
    - Troubleshooting section

13. **`README.md`**
    - Added deployment section with quick deploy buttons
    - Links to DEPLOYMENT.md

---

## Key Changes Explained

### CORS Configuration

**Before**:
```typescript
await server.register(cors, { origin: true }); // Allow all origins
```

**After**:
```typescript
await server.register(cors, {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
});
```

**Why**: Production security - only allow requests from specific frontend domains.

### API URL Configuration

**Before**:
```typescript
const API_BASE = '/api'; // Always uses Vite proxy
```

**After**:
```typescript
const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : '/api');
```

**Why**: In production (Vercel), frontend needs to call Railway backend directly. In development, uses Vite proxy to avoid CORS issues.

### Database Migrations

**Before**: Only `prisma migrate dev` (local development)

**After**: Added production migration support
- `prisma migrate deploy` - Runs migrations without prompts (CI/CD safe)
- Committed migration files to git (required for Railway)

**Why**: Railway needs reproducible migrations that don't require interactive input.

---

## Environment Variables

### Railway (Backend)

Required:
- `DATABASE_URL` - Auto-provided by Railway PostgreSQL plugin
- `ALLOWED_ORIGINS` - Your Vercel URL(s), e.g., `https://your-app.vercel.app`
- `NODE_ENV=production`

Optional:
- `PORT` - Auto-set by Railway (usually 3001)

### Vercel (Frontend)

Required:
- `VITE_API_URL` - Your Railway backend URL, e.g., `https://your-app.up.railway.app`

---

## Build Process

### Railway Build Steps

1. Install dependencies: `pnpm install`
2. Generate Prisma client: `cd apps/api && pnpm db:generate`
3. Build TypeScript: `pnpm build`
4. Start server: `pnpm db:migrate:deploy && node dist/index.js`

### Vercel Build Steps

1. Install dependencies: `pnpm install` (at monorepo root)
2. Build frontend: `cd apps/web && pnpm build`
3. Output to: `apps/web/dist`

---

## Development vs Production

### Local Development

- Frontend: `localhost:5173`
- Backend: `localhost:3001`
- API calls: `/api/*` → Vite proxy → `localhost:3001`
- CORS: Allowed for all origins (dev mode)
- Database: Local PostgreSQL

### Production

- Frontend: `your-app.vercel.app`
- Backend: `your-app.up.railway.app`
- API calls: Direct to Railway backend
- CORS: Restricted to Vercel domain only
- Database: Railway PostgreSQL

---

## Testing Deployment

After deploying, verify:

1. **Backend Health**: `curl https://your-app.up.railway.app/health`
2. **Frontend Loads**: Open `https://your-app.vercel.app`
3. **API Integration**: Draw a plot, refresh page, verify it persists
4. **CORS**: Check browser console for CORS errors (should be none)

---

## Rollback Instructions

### If deployment fails:

**Railway**:
1. Go to Deployments tab
2. Click previous working deployment
3. Select "Redeploy"

**Vercel**:
1. Go to Deployments tab
2. Click previous deployment
3. Select "Promote to Production"

---

## Next Steps After Deployment

1. Set up custom domains (optional)
2. Configure environment monitoring
3. Set up database backups (Railway provides automated backups)
4. Add error tracking (Sentry, LogRocket, etc.)
5. Implement rate limiting (future sprint)
6. Add authentication (future sprint)

---

## Cost Impact

**Railway**: ~$5/month (Hobby plan)
- Includes PostgreSQL
- 500 hours execution time
- 100GB bandwidth

**Vercel**: Free (Hobby plan) or $20/month (Pro)
- Unlimited deployments
- Bandwidth limits on free tier

**Total**: $5-25/month depending on usage

---

## Important Notes

⚠️ **Security**: The app currently has no authentication. Anyone with the URL can access and modify data. This is acceptable for MVP/testing but should be addressed before public production use.

⚠️ **Database**: Railway provides automated backups. Verify backup settings in Railway dashboard.

⚠️ **Migrations**: Always test migrations locally before deploying. Railway will run `prisma migrate deploy` automatically.

⚠️ **Environment Variables**: Never commit `.env` files. All secrets should be in Railway/Vercel dashboards only.

---

## Support Resources

- [Railway Documentation](https://docs.railway.app)
- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [DEPLOYMENT.md](DEPLOYMENT.md) - Full deployment guide
