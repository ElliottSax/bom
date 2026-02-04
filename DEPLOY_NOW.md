# 🚀 Deploy BOM Study Tools to Railway - RIGHT NOW

**Total Time**: 15-20 minutes
**Cost**: FREE for first month ($5 credit)
**Difficulty**: Easy ⭐⭐☆☆☆

---

## 📋 What You'll Deploy

- ✅ Python GraphQL API Server
- ✅ PostgreSQL Database (12,000+ scripture verses)
- ✅ Production-ready configuration
- ✅ Auto-scaling and monitoring
- ✅ HTTPS with SSL certificate

---

## 🎯 Step-by-Step Instructions

### Step 1: Login to Railway (2 minutes)

Open a **NEW terminal window** and run:

```bash
railway login
```

**What happens:**

- Opens your web browser
- Sign up or login with GitHub/Google
- Returns to terminal when done

✅ **Success**: You'll see "Logged in as [your-email]"

---

### Step 2: Deploy the API (5 minutes)

In your terminal, run:

```bash
cd /mnt/e/projects/bom
./railway-deploy.sh
```

**What this does:**

1. Creates a new Railway project called "bom-study-tools-api"
2. Provisions a PostgreSQL database
3. Sets up environment variables (JWT secrets, CORS, etc.)
4. Builds and deploys your Python API
5. Configures health checks

**Wait for this message:**

```
✅ DEPLOYMENT COMPLETE!
```

This takes 2-5 minutes. ☕ Grab a coffee!

---

### Step 3: Generate Public URL (30 seconds)

```bash
railway domain
```

**Output:**

```
Generated domain: bom-study-tools-api-production-xxxx.up.railway.app
```

🎉 **Your API is now live!**

Copy this URL - you'll need it later.

---

### Step 4: Test Your API (1 minute)

```bash
# Replace with YOUR Railway URL from Step 3
DEPLOY_URL="https://bom-study-tools-api-production-xxxx.up.railway.app"

# Test health check
curl $DEPLOY_URL/health
```

**Expected response:**

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "database": "connected"
}
```

✅ **If you see this** → API is working!
❌ **If you see errors** → Check the troubleshooting section below

---

### Step 5: Import Scripture Data (5-10 minutes)

#### Option A: Interactive Shell (Recommended)

```bash
railway connect postgres
```

This opens a PostgreSQL shell. Copy and paste these commands:

```sql
-- Create schema
\i services/api/prisma/migrations/001_init_complete/migration.sql

-- Import scripture data
\i services/api/prisma/migrations/002_seed_data/seed.sql

-- Verify import
SELECT COUNT(*) FROM verses;
-- Should return: 11787 (or similar)

-- Exit
\q
```

#### Option B: Automated Script

```bash
./import-to-railway.sh
```

Follow the prompts to import data.

---

### Step 6: Verify Everything Works (2 minutes)

Test the GraphQL API:

```bash
# Replace with YOUR Railway URL
DEPLOY_URL="https://bom-study-tools-api-production-xxxx.up.railway.app"

# Test GraphQL query
curl -X POST $DEPLOY_URL/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ editions { id name shortName } }"
  }'
```

**Expected response:**

```json
{
  "data": {
    "editions": [
      {
        "id": "coc-bom-1908",
        "name": "Book of Mormon (CoC 1908)",
        "shortName": "CoC BoM"
      },
      ...
    ]
  }
}
```

✅ **Success!** Your API is fully deployed and working!

---

## 🎨 Update Your Mobile App

Now update your mobile app to use the live API:

### File: `apps/mobile/.env.production`

```bash
# Replace with YOUR Railway URL
REACT_APP_API_URL=https://bom-study-tools-api-production-xxxx.up.railway.app/graphql
REACT_APP_API_VERSION=v1
```

### Test Mobile App

```bash
cd apps/mobile
npm run ios  # or npm run android
```

Your mobile app now connects to the live API! 📱

---

## 📊 Monitor Your Deployment

### View Logs

```bash
railway logs
```

### Open Dashboard

```bash
railway open
```

Or visit: https://railway.app/dashboard

Here you can:

- 📈 View real-time logs
- 💰 Check usage and billing
- 🔧 Manage environment variables
- 🚀 Redeploy or rollback

---

## 💰 Costs & Billing

**Free Tier:**

- $5 starter credit (covers ~1 month)
- No credit card required to start

**After Free Credit:**

- ~$5-8/month for this project
- Pay only for what you use
- Cancel anytime

**Your project uses:**

- 1 web service (API)
- 1 PostgreSQL database (~1GB)
- Minimal bandwidth

---

## 🐛 Troubleshooting

### "railway: command not found"

```bash
npm install -g @railway/cli
```

### "Not logged in"

```bash
railway login
```

### "Database connection failed"

```bash
# Check database status
railway status

# Verify DATABASE_URL is set
railway variables | grep DATABASE_URL

# Restart services
railway up --detach
```

### "API returns 500 errors"

```bash
# View detailed logs
railway logs --tail 50

# Common causes:
# 1. DATABASE_URL not set → should be automatic
# 2. Missing dependencies → check requirements-minimal.txt
# 3. Migration not run → run Step 5 again
```

### Port Issues

Railway automatically sets the `PORT` environment variable. Our code uses it:

```python
PORT = int(os.getenv('PORT', 4000))
```

No action needed - it just works! ✅

---

## ✅ Deployment Checklist

Use this to track your progress:

- [ ] Step 1: Login to Railway (`railway login`)
- [ ] Step 2: Run deployment script (`./railway-deploy.sh`)
- [ ] Step 3: Generate public URL (`railway domain`)
- [ ] Step 4: Test health endpoint
- [ ] Step 5: Import scripture data
- [ ] Step 6: Test GraphQL queries
- [ ] Update mobile app `.env.production`
- [ ] Test mobile app with live API
- [ ] Check Railway dashboard
- [ ] Celebrate! 🎉

---

## 🎯 What's Next?

After deploying:

1. **Test thoroughly** - Run all mobile app features
2. **Set up monitoring** - Check Railway dashboard daily
3. **Custom domain** (optional) - `railway domain add yourdomain.com`
4. **App store prep** - Create app icon, screenshots
5. **Beta testing** - TestFlight (iOS) or Play Console (Android)
6. **Public launch** - Submit to app stores! 🚀

---

## 📞 Need Help?

**Quick Help:**

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway

**Project Help:**

- See `RAILWAY_DEPLOYMENT_GUIDE.md` for detailed info
- See `DEPLOYMENT_STATUS.md` for project status
- See `PRE_DEPLOYMENT_CHECKLIST.md` for full checklist

---

## 🎉 Success!

If you've completed all steps, congratulations! You now have:

✅ Live API server running on Railway
✅ PostgreSQL database with 12,000+ verses
✅ Mobile app ready to test
✅ Production monitoring and logs

**Your BOM Study Tools app is now deployed and running!** 🚀📱

---

**Ready to deploy?** Open your terminal and start with Step 1!

```bash
railway login
```

Let's do this! 💪
