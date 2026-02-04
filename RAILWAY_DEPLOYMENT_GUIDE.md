# 🚂 Railway Deployment Guide - BOM Study Tools

**Estimated Time**: 15 minutes
**Cost**: ~$5-10/month (includes $5 starter credit)

---

## ✅ Prerequisites

You already have:

- ✅ Railway CLI installed
- ✅ Project code ready
- ✅ Deployment files configured

---

## 🚀 Deployment Steps

### Step 1: Login to Railway (1 minute)

Open your terminal and run:

```bash
railway login
```

This will open your browser. Sign up or login to Railway.

### Step 2: Run the Deployment Script (5 minutes)

```bash
cd /mnt/e/projects/bom
./railway-deploy.sh
```

This automated script will:

- ✅ Create a new Railway project
- ✅ Add PostgreSQL database
- ✅ Set environment variables
- ✅ Deploy your API
- ✅ Configure health checks

**Wait for deployment to complete** (2-5 minutes)

### Step 3: Generate Public URL (30 seconds)

```bash
railway domain
```

This creates a public URL like: `bom-study-tools-api-production.up.railway.app`

### Step 4: Import Scripture Data (5 minutes)

#### Option A: Connect to Database Directly

```bash
# Connect to your Railway PostgreSQL
railway connect postgres
```

Then run your SQL import commands in the PostgreSQL shell.

#### Option B: Use Database URL

```bash
# Get your database URL
railway variables

# Look for DATABASE_URL and use it with psql or your import script
```

### Step 5: Test Your Deployment (1 minute)

```bash
# Get your deployment URL
DEPLOY_URL=$(railway domain)

# Test health endpoint
curl $DEPLOY_URL/health

# Test GraphQL endpoint
curl -X POST $DEPLOY_URL/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __typename }"}'
```

Expected response:

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "database": "connected"
}
```

---

## 📊 Railway Dashboard

View your deployment at: https://railway.app/dashboard

Here you can:

- 📈 Monitor logs
- 🔧 Manage environment variables
- 💰 Check usage and billing
- 🔄 Redeploy or rollback
- 📊 View metrics

---

## 🛠️ Common Commands

```bash
# View logs in real-time
railway logs

# Open dashboard in browser
railway open

# Check project status
railway status

# Add custom domain (optional)
railway domain add yourdomain.com

# View environment variables
railway variables

# Redeploy
railway up

# Connect to database
railway connect postgres
```

---

## 🔧 Update Your Mobile App

After deployment, update your mobile app's API endpoint:

**File**: `apps/mobile/.env.production`

```bash
REACT_APP_API_URL=https://your-railway-url.up.railway.app/graphql
```

Replace `your-railway-url` with your actual Railway domain.

---

## 💰 Cost Breakdown

Railway pricing:

- **Free**: $5 starter credit (enough for ~1 month)
- **Hobby**: $5/month (recommended for small projects)
- **Pro**: $20/month (for production apps)

**Estimated costs for BOM Study Tools**:

- API Server: ~$3-5/month
- PostgreSQL: ~$2-3/month
- **Total**: ~$5-8/month

**First month is FREE** with starter credit! 🎉

---

## 🐛 Troubleshooting

### Deployment fails

```bash
# Check logs
railway logs

# Common issues:
# 1. DATABASE_URL not set → Railway should auto-set this
# 2. Build errors → Check requirements-minimal.txt
# 3. Port issues → We use PORT env var (Railway sets this automatically)
```

### Database connection fails

```bash
# Verify database is running
railway status

# Check DATABASE_URL is set
railway variables | grep DATABASE_URL

# Test connection
railway connect postgres
```

### API returns 500 errors

```bash
# View detailed logs
railway logs --tail 100

# Check environment variables
railway variables

# Restart the service
railway up --detach
```

---

## 🔒 Security Checklist

After deployment:

- [ ] Verify JWT_SECRET is set (deployment script does this)
- [ ] Update CORS_ORIGIN to your actual domain
- [ ] Review environment variables for sensitive data
- [ ] Enable Railway's built-in DDoS protection
- [ ] Set up custom domain with SSL (optional)

---

## 📈 Next Steps

1. ✅ Deploy API to Railway (you're doing this now!)
2. 🗄️ Import scripture data (~12,000 verses)
3. 🧪 Test all GraphQL queries
4. 📱 Update mobile app API endpoint
5. 🏪 Prepare app store submission

---

## 🆘 Need Help?

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Project Docs**: See `DEPLOYMENT_STATUS.md` and `PRE_DEPLOYMENT_CHECKLIST.md`

---

## 🎯 Quick Deploy Summary

**TL;DR** - Run these 4 commands:

```bash
railway login                # Login (opens browser)
./railway-deploy.sh          # Deploy everything
railway domain               # Generate public URL
railway connect postgres     # Import data
```

**Done!** Your API is live! 🚀

---

**Deployed Successfully?** Next, update your mobile app's `.env.production` with your new Railway URL and you're ready to test!
