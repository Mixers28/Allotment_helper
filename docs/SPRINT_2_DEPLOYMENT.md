# Sprint 2 Deployment Guide

## Changes Summary

Sprint 2 adds Season and Section management to the Allotment Planner. This includes:

- New database tables: `Season` and `BedSectionPlan`
- New API endpoints for season/section CRUD operations
- UI components for creating seasons and editing bed sections
- Section visualization overlays on the canvas

## Database Migration

A new migration file has been created:
```
apps/api/prisma/migrations/20260202_add_seasons_sections/migration.sql
```

### Railway (Backend) Deployment

The migration will run automatically on Railway deployment because the `start:migrate` script is configured:

```json
"start:migrate": "prisma migrate deploy && node dist/index.js"
```

**Ensure your Railway service uses this start command:**
```
pnpm --filter api start:migrate
```

This will:
1. Run `prisma migrate deploy` (applies pending migrations)
2. Start the API server

### Manual Migration (if needed)

If you need to run migrations manually on Railway:

```bash
# SSH into Railway or run via Railway CLI
cd apps/api
pnpm db:migrate:deploy
```

## API Changes

### New Routes

The following routes have been added to the API:

**Season Management:**
- `POST /plots/:plotId/seasons` - Create season
- `GET /plots/:plotId/seasons` - List seasons for plot
- `GET /seasons/:id` - Get season with bed plans
- `PUT /seasons/:id` - Update season
- `DELETE /seasons/:id` - Delete season (cascades to bed plans)

**Bed Section Plans:**
- `POST /seasons/:seasonId/bed-plans` - Create bed section plan
- `GET /seasons/:seasonId/bed-plans` - List bed plans for season
- `PUT /bed-plans/:id` - Update bed plan
- `DELETE /bed-plans/:id` - Delete bed plan

### Database Schema Changes

**New Tables:**
```sql
Season (
  id, plotId, label, startDate, endDate,
  createdAt, updatedAt
)

BedSectionPlan (
  id, seasonId, bedId, mode, definitionJson,
  createdAt, updatedAt
  UNIQUE(seasonId, bedId)
)
```

**Cascade Deletes:**
- Deleting a Season → removes all BedSectionPlans
- Deleting a BedBase → removes all BedSectionPlans across all seasons
- Deleting a PlotBase → removes all Seasons (and cascades to plans)

## Frontend Changes

### New Dependencies

The web app now depends on `@allotment/placement`:

```json
"dependencies": {
  "@allotment/placement": "workspace:*"
}
```

This is already included in the monorepo workspace.

### Environment Variables

No new environment variables are required. Existing `VITE_API_URL` continues to work.

### Vercel Deployment

The frontend build includes the new components automatically. No additional configuration needed.

**Build command remains:**
```
pnpm install && pnpm --filter web build
```

**Output directory:**
```
apps/web/dist
```

## Testing the Deployment

### Backend Health Check

```bash
curl https://your-railway-app.up.railway.app/health
# Should return: {"status":"ok"}
```

### Database Verification

Connect to your Railway Postgres and verify tables exist:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('Season', 'BedSectionPlan');
```

### API Endpoint Test

```bash
# List seasons for a plot
curl https://your-railway-app.up.railway.app/plots/{PLOT_ID}/seasons

# Should return: []  (empty array if no seasons yet)
```

### Frontend Verification

1. Open your Vercel deployment
2. Look for the "Season:" dropdown in the top toolbar (appears after plot is loaded)
3. Select "New Season..." from dropdown
4. Create a season
5. Select a bed → Section Editor panel should appear on the right
6. Click "Create Section Plan" to add sections to the bed

## Rollback Plan

If issues occur, you can rollback the migration:

```bash
# On Railway, SSH to the instance
cd apps/api
pnpm exec prisma migrate resolve --rolled-back 20260202_add_seasons_sections
```

Then redeploy the previous version of the code.

## Known Limitations

1. **No existing data migration:** This is a new feature, so existing plots/beds are unaffected
2. **Section limit:** UI enforces max 10 sections per bed
3. **Lengthwise splits only:** Grid sectioning mode is in backlog (Sprint 2 supports only lengthwise splits)

## Post-Deployment Verification Checklist

- [ ] Backend deployed successfully on Railway
- [ ] Migration ran without errors (check Railway logs)
- [ ] `Season` and `BedSectionPlan` tables exist in database
- [ ] Frontend deployed successfully on Vercel
- [ ] Season selector appears in UI
- [ ] Can create a new season
- [ ] Can select a bed and see section editor
- [ ] Can create/edit bed section plans
- [ ] Section overlays render on canvas
- [ ] All CRUD operations work (create, update, delete seasons/plans)

## Support

If deployment fails, check:

1. **Railway Logs:** Look for Prisma migration errors
2. **Vercel Build Logs:** Ensure TypeScript compilation succeeded
3. **Browser Console:** Check for API connection errors
4. **Network Tab:** Verify API requests are reaching Railway backend

---

**Deployment Date:** 2026-02-02
**Migration:** `20260202_add_seasons_sections`
**Sprint:** Sprint 2 - Seasons + Sections
