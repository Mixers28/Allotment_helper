# Railway Final Fix - Disable Auto-Detection

## The Problem

Railway's auto-detection (via Nixpacks) is generating a `railpack-plan.json` that incorrectly treats `ALLOWED_ORIGINS` as a build-time secret, causing:

```
ERROR: failed to solve: secret ALLOWED_ORIGINS: not found
```

## The Solution

**Completely disable auto-detection by removing `nixpacks.toml`**

The file has been renamed to `nixpacks.toml.backup`. Railway will now require 100% manual configuration.

---

## Deploy Steps (Updated)

### 1. Push This Fix

```bash
git commit -m "Disable Railway auto-detection to fix build error"
git push origin main
```

### 2. In Railway Dashboard

**IMPORTANT**: You MUST configure these settings manually **BEFORE** Railway attempts to build.

Go to: Your Service → **Settings** → **Deploy**

#### Build Command:
```bash
npm install -g pnpm@8 && pnpm install --frozen-lockfile && cd apps/api && pnpm db:generate && pnpm build
```

#### Start Command:
```bash
cd apps/api && npx prisma migrate deploy && node dist/index.js
```

#### Install Command (leave empty):
```
(leave blank)
```

#### Root Directory (leave empty or `/`):
```
(leave blank)
```

### 3. Environment Variables

Go to: **Variables** tab

Add:
```
NODE_ENV=production
ALLOWED_ORIGINS=http://localhost:5173
```

### 4. Add PostgreSQL

1. Click "+ New" in project
2. Select "Database" → "PostgreSQL"
3. `DATABASE_URL` is auto-created

### 5. Deploy

1. Go to **Deployments** tab
2. Click "Deploy" or "Redeploy"
3. **Watch the logs** - should now build successfully

---

## Why This Works

Without `nixpacks.toml`, Railway:
- ❌ Won't auto-generate a faulty `railpack-plan.json`
- ✅ Will use your manual build/start commands exactly as specified
- ✅ Won't try to parse environment variables during build
- ✅ Treats all env vars as runtime-only (correct behavior)

---

## After Successful Build

Test:
```bash
curl https://your-app.up.railway.app/health
```

Should return:
```json
{"status":"ok"}
```

---

## If You Want Auto-Detection Later

After verifying manual config works, you can restore `nixpacks.toml`:

```bash
git mv nixpacks.toml.backup nixpacks.toml
git commit -m "Restore nixpacks.toml"
git push
```

But for now, **manual configuration is the reliable solution**.

---

## Complete Deployment Checklist

- [ ] Code pushed with `nixpacks.toml` removed/disabled
- [ ] Railway service settings configured manually:
  - [ ] Build command set
  - [ ] Start command set
  - [ ] Install command empty
  - [ ] Root directory empty
- [ ] Environment variables set (NODE_ENV, ALLOWED_ORIGINS)
- [ ] PostgreSQL database added
- [ ] Service deployed successfully
- [ ] Health check returns `{"status":"ok"}`

**Then proceed to Vercel deployment!** 🚀
