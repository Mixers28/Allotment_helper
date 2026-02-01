# 🚀 Railway Deployment - START HERE

Railway's auto-detection has an issue with ALLOWED_ORIGINS. **Use manual configuration instead.**

---

## Quick Deploy (5 Minutes)

### 1. Push Latest Code

```bash
git push origin main
```

### 2. Create Railway Service

1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select `Mixers28/Allotment_helper`
4. Wait for service to be created

### 3. **IMMEDIATELY Configure Manually** (Before it tries to build)

Click on your service → **Settings tab** → **Deploy section**

Set these values:

**Build Command:**
```
npm install -g pnpm@8 && pnpm install --frozen-lockfile && cd apps/api && pnpm db:generate && pnpm build
```

**Start Command:**
```
cd apps/api && npx prisma migrate deploy && node dist/index.js
```

**Root Directory:** (leave empty)

**Watch Paths:** `apps/api/**`

### 4. Add PostgreSQL Database

1. In your Railway project, click "+ New"
2. Select "Database" → "PostgreSQL"
3. Railway automatically sets `DATABASE_URL`

### 5. Set Environment Variables

Click **Variables tab**, add these:

```
NODE_ENV=production
ALLOWED_ORIGINS=http://localhost:5173
```

### 6. Deploy

1. Go to **Deployments tab**
2. Click "Deploy" or trigger redeploy
3. Watch the logs - build should now succeed!

### 7. Test Deployment

After deployment completes, go to **Settings → Networking** and copy your URL.

Test it:
```bash
curl https://your-app.up.railway.app/health
```

Should return: `{"status":"ok"}`

---

## Why Manual Setup?

Railway's Nixpacks auto-detection is treating `ALLOWED_ORIGINS` as a build-time secret, causing:
```
ERROR: failed to solve: secret ALLOWED_ORIGINS: not found
```

By configuring build/start commands manually, we bypass the auto-detection and directly control the build process.

---

## After Railway Works

1. ✅ Copy your Railway URL
2. 📝 Update ALLOWED_ORIGINS later (after Vercel deploy)
3. 🌐 Continue to Vercel frontend deployment

---

## Next: Deploy Frontend to Vercel

See [DEPLOYMENT.md](DEPLOYMENT.md) Part 2, or quick version:

1. https://vercel.com/new
2. Import `Mixers28/Allotment_helper`
3. Root Directory: `apps/web`
4. Build Command: `cd ../.. && pnpm install && cd apps/web && pnpm build`
5. Environment: `VITE_API_URL=https://your-railway-url.up.railway.app`
6. Deploy

Then update Railway's `ALLOWED_ORIGINS`:
```
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
```

---

## Troubleshooting

**Build still fails?**
- Check Railway build logs for exact error
- Verify `pnpm-lock.yaml` is in git
- Try Railway CLI: [RAILWAY_MANUAL_SETUP.md](RAILWAY_MANUAL_SETUP.md)

**Database connection error?**
- Verify PostgreSQL service is added
- Check `DATABASE_URL` exists in Variables tab

**Need more help?**
- [RAILWAY_MANUAL_SETUP.md](RAILWAY_MANUAL_SETUP.md) - Detailed troubleshooting
- [DEPLOYMENT.md](DEPLOYMENT.md) - Full deployment guide

---

## Summary Checklist

- [ ] Code pushed to GitHub
- [ ] Railway service created
- [ ] Build/Start commands set manually
- [ ] PostgreSQL database added
- [ ] Environment variables set
- [ ] Deployment successful
- [ ] Health check returns `{"status":"ok"}`
- [ ] Railway URL copied

**Ready to deploy Vercel frontend!** 🎉
