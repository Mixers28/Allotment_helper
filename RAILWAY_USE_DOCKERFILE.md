# Railway - Use Dockerfile (SIMPLEST SOLUTION)

## The Easiest Fix

Railway's auto-detection is broken. **Use the Dockerfile instead.**

---

## Steps (5 Minutes)

### 1. Push Latest Code

```bash
git push origin main
```

This includes the new `Dockerfile`.

### 2. In Railway Dashboard

Go to: **Your Service** → **Settings** → **Deploy**

### 3. Set Builder to Dockerfile

**Builder:** Select **DOCKERFILE**

That's it! Railway will now use the `Dockerfile` instead of auto-detecting.

### 4. Clear Other Fields (Optional but Recommended)

**Custom Build Command:** (leave empty)
**Custom Start Command:** (leave empty)
**Custom Install Command:** (leave empty)

The Dockerfile handles everything.

### 5. Set Environment Variables

**Variables** tab:

```
NODE_ENV=production
ALLOWED_ORIGINS=http://localhost:5173
```

PostgreSQL provides `DATABASE_URL` automatically.

### 6. Deploy

**Deployments** tab → **Deploy** or **Redeploy**

---

## Why This Works

✅ Dockerfile has ZERO auto-detection
✅ Explicit, predictable build process
✅ No railpack-plan.json generation
✅ ALLOWED_ORIGINS only used at runtime
✅ Multi-stage build optimized for production

---

## What the Dockerfile Does

1. Installs Node 20 and pnpm
2. Copies package files and installs dependencies
3. Generates Prisma client
4. Builds TypeScript
5. Runs `prisma migrate deploy` on startup
6. Starts the API server

All automated, all reliable.

---

## Verify Deployment

After build completes:

```bash
curl https://your-app.up.railway.app/health
```

Should return:
```json
{"status":"ok"}
```

---

## If You Prefer Manual Config

See: [RAILWAY_DISABLE_AUTODETECT.md](RAILWAY_DISABLE_AUTODETECT.md)

But the Dockerfile is **simpler and more reliable**.

---

## Next: Update CORS

After successful Railway deploy:

1. Get your Railway URL
2. Deploy Vercel frontend (with `VITE_API_URL` set to Railway URL)
3. Update Railway `ALLOWED_ORIGINS` to Vercel URL
4. Redeploy Railway

Done! 🎉
