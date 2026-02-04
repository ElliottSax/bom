# 🌐 Deploy to Railway via Web Dashboard

**No CLI needed!** This is actually easier than the command line.

**Time**: 10-15 minutes
**Cost**: FREE first month ($5 credit)

---

## 📋 Step-by-Step Web Deployment

### Step 1: Sign Up for Railway (2 minutes)

1. Go to **https://railway.app**
2. Click **"Start a New Project"** or **"Login"**
3. Sign up with **GitHub** (recommended) or **Google**
4. Verify your email if prompted

✅ **You're now logged into Railway!**

---

### Step 2: Create New Project (1 minute)

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Click **"Configure GitHub App"**
4. Authorize Railway to access your repositories

**Don't have a GitHub repo yet?** See "Option B" below.

---

### Step 3A: Deploy from GitHub (Recommended)

If your code is on GitHub:

1. Select your **`bom`** repository
2. Railway will detect it's a Python project
3. Click **"Add Variables"** and add these:

```
PORT=4000
NODE_ENV=production
ENABLE_AI_CHAT=false
ENABLE_SEMANTIC_SEARCH=false
LOG_LEVEL=warn
CORS_ORIGIN=*
```

4. Click **"Deploy"**

---

### Step 3B: Deploy from Local Files (No GitHub)

If your code is NOT on GitHub yet:

1. Click **"New Project"**
2. Select **"Empty Project"**
3. We'll push code directly (instructions below)

---

### Step 4: Add PostgreSQL Database (2 minutes)

1. In your project dashboard, click **"New"**
2. Select **"Database"**
3. Choose **"Add PostgreSQL"**
4. Wait 30 seconds for provisioning
5. Railway automatically sets `DATABASE_URL` environment variable

✅ **Database is ready!**

---

### Step 5: Configure Build Settings (2 minutes)

In your Railway service settings:

**Build Settings:**

- Build Command: `pip install -r services/api/requirements-minimal.txt`
- Start Command: `cd services/api && python3 server-minimal-cost.py`

**Root Directory:**

- Leave blank (we use `cd services/api` in start command)

**Environment:**
Add these variables if not already added:

```
PORT=4000
NODE_ENV=production
ENABLE_AI_CHAT=false
ENABLE_SEMANTIC_SEARCH=false
JWT_SECRET=<generate-random-32-char-string>
SESSION_SECRET=<generate-random-32-char-string>
CORS_ORIGIN=*
LOG_LEVEL=warn
```

---

### Step 6: Generate Domain (30 seconds)

1. Go to your service **"Settings"**
2. Scroll to **"Networking"**
3. Click **"Generate Domain"**
4. Copy the URL (e.g., `your-project.up.railway.app`)

✅ **Your API is now live!**

---

### Step 7: Test Your API (1 minute)

Open your browser and go to:

```
https://your-project.up.railway.app/health
```

You should see:

```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

---

### Step 8: Import Scripture Data (5 minutes)

**Option A: Railway Database Tab**

1. In Railway dashboard, click on your **PostgreSQL** database
2. Click **"Connect"** tab
3. Copy the **Database URL**
4. Use a PostgreSQL client (pgAdmin, DBeaver, or psql) to connect
5. Run your migration files

**Option B: Railway CLI (if it works later)**

```bash
railway login
railway link
railway connect postgres
\i services/api/prisma/migrations/001_init_complete/migration.sql
\i services/api/prisma/migrations/002_seed_data/seed.sql
```

---

## 🚫 Don't Have GitHub? Push Code Directly

### Option 1: Create GitHub Repo (5 minutes)

```bash
cd /mnt/e/projects/bom

# Initialize git if not already
git init
git add .
git commit -m "Initial commit for Railway deployment"

# Create repo on GitHub.com, then:
git remote add origin https://github.com/YOUR-USERNAME/bom-study-tools.git
git push -u origin master
```

Then follow **Step 3A** above.

### Option 2: Use Railway CLI (Alternative)

If you can't use browser login, try:

```bash
# Set Railway token manually
export RAILWAY_TOKEN="your-token-here"
```

Get token from: https://railway.app/account/tokens

---

## 📊 View Your Deployment

**Dashboard**: https://railway.app/dashboard

Here you can:

- 📈 View real-time logs
- 🔧 Manage environment variables
- 💰 Check usage and billing
- 🚀 Redeploy or rollback
- 📊 Monitor performance

---

## 🐛 Troubleshooting

### Build fails

Check the logs in Railway dashboard:

- Click your service
- Click "Deployments"
- Click latest deployment
- View build logs

Common issues:

- Missing `requirements-minimal.txt` → Check file exists
- Python version → Railway uses Python 3.11 by default
- Path issues → Make sure start command has `cd services/api`

### Database connection fails

- Verify PostgreSQL is running (green dot in dashboard)
- Check `DATABASE_URL` is set in environment variables
- Railway sets this automatically when you add PostgreSQL

### Can't generate domain

- Must deploy successfully first
- Check deployment status is "Active"
- Try refreshing the page

---

## 💰 Costs

**Free Tier:**

- $5 starter credit
- Good for ~1 month of usage
- No credit card required

**After Free Credit:**

- ~$5-8/month for this project
- Hobby Plan: $5/month
- Pay as you go

---

## ✅ Success Checklist

- [ ] Signed up for Railway
- [ ] Created new project
- [ ] Added PostgreSQL database
- [ ] Configured environment variables
- [ ] Deployed successfully
- [ ] Generated public domain
- [ ] Tested `/health` endpoint
- [ ] Imported scripture data

---

## 🎉 You're Done!

Your API is now live at:

```
https://your-project.up.railway.app
```

**Next Steps:**

1. Update mobile app `.env.production` with your Railway URL
2. Test mobile app with live API
3. Prepare for app store submission

---

## 🆘 Still Having Issues?

**Railway Support:**

- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway
- Twitter: @Railway

**Project Help:**

- Check `DEPLOY_NOW.md`
- Check `RAILWAY_DEPLOYMENT_GUIDE.md`
- Review Railway dashboard logs

---

**Good luck!** 🚀 The web dashboard is often easier than CLI, especially in WSL environments.
