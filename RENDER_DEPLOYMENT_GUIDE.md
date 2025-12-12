# 🚀 Deploy to Render.com (FREE)

This guide will get your BOM Study Tools API live in 30 minutes.

## Prerequisites
- GitHub account
- Render.com account (free) - sign up at https://render.com

## Step 1: Push Code to GitHub ✅

Your code is already at: `https://github.com/elliottsax/bom`

Make sure latest changes are pushed:

```bash
cd /mnt/e/projects/bom
git add .
git commit -m "Add production server and deployment config"
git push origin feature/api-enhancements
```

## Step 2: Create PostgreSQL Database on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `bom-study-tools-db`
   - **Database**: `bom_study_tools`
   - **User**: (auto-generated, keep default)
   - **Region**: Choose closest to you
   - **Instance Type**: **Free** (0 GB RAM, 90 days)
4. Click **"Create Database"**
5. **Wait 2-3 minutes** for database to provision
6. Copy the **"Internal Database URL"** (you'll need this)

## Step 3: Import Scripture Data

Once database is created:

1. In Render dashboard, go to your database
2. Click **"Connect"** → Copy the **"External Database URL"**
3. On your local machine, export scripture data:

```bash
cd /mnt/e/projects/bom

# Export database schema
docker exec bom-postgres-dev pg_dump \
  -U postgres \
  -d bom_study_tools_dev \
  --schema-only \
  > schema.sql

# Export scripture data
docker exec bom-postgres-dev pg_dump \
  -U postgres \
  -d bom_study_tools_dev \
  --data-only \
  -t editions -t verses \
  > data.sql
```

4. Import to Render (replace with your External Database URL):

```bash
# Import schema
psql "YOUR_EXTERNAL_DATABASE_URL" < schema.sql

# Import data
psql "YOUR_EXTERNAL_DATABASE_URL" < data.sql
```

**Or use the quick script:**

```bash
# Set your Render database URL
export RENDER_DB_URL="postgresql://user:pass@host/database"

# Run import
./scripts/deploy-database.sh
```

## Step 4: Deploy API Web Service

1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub account
3. Select repository: `elliottsax/bom`
4. Configure:

   **Basic Info:**
   - **Name**: `bom-study-tools-api`
   - **Region**: Same as database
   - **Branch**: `feature/api-enhancements`
   - **Root Directory**: Leave blank

   **Build & Deploy:**
   - **Runtime**: `Python 3`
   - **Build Command**:
     ```bash
     cd services/api && pip install -r requirements.txt
     ```
   - **Start Command**:
     ```bash
     cd services/api && gunicorn -w 2 -b 0.0.0.0:$PORT server-production:app
     ```

   **Plan:**
   - **Instance Type**: **Free** (512 MB RAM, sleeps after 15 min inactivity)

5. Click **"Advanced"** and add **Environment Variables**:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | (Click "Add from Database" → select your database) |
   | `PORT` | `10000` (Render default) |

6. Click **"Create Web Service"**

## Step 5: Wait for Deployment (5-10 minutes)

Render will:
1. ✅ Clone your repo
2. ✅ Install Python dependencies
3. ✅ Start gunicorn server
4. ✅ Run health checks

Watch the logs in the dashboard.

## Step 6: Test Your API! 🎉

Once deployed, your API will be at:
```
https://bom-study-tools-api.onrender.com
```

Test it:

```bash
# Health check
curl https://bom-study-tools-api.onrender.com/health

# Get editions
curl -X POST https://bom-study-tools-api.onrender.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ editions { id name shortName } }"}'

# Search verses
curl -X POST https://bom-study-tools-api.onrender.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ search(query: \"faith\", editionId: \"coc-bom-1908\", limit: 3) { results { book chapter verse text } totalCount } }"}'
```

Or open in browser:
```
https://bom-study-tools-api.onrender.com/
```

## Step 7: Update Mobile App

Edit `apps/mobile/src/config/apollo.ts`:

```typescript
const API_URL = __DEV__
  ? 'http://localhost:4002/graphql'
  : 'https://bom-study-tools-api.onrender.com/graphql';
```

Rebuild your mobile app and test!

## 🎯 You're Live!

Your API is now:
- ✅ Running 24/7 (free tier sleeps after 15 min inactivity)
- ✅ Accessible from anywhere
- ✅ Connected to PostgreSQL database
- ✅ Ready for mobile app integration

## 📊 Monitor Your Deployment

- **Dashboard**: https://dashboard.render.com
- **Logs**: Click your service → "Logs" tab
- **Metrics**: Click your service → "Metrics" tab
- **Settings**: Update environment variables, scaling, etc.

## 🆓 Free Tier Limits

**Web Service (Free):**
- 512 MB RAM
- Shared CPU
- Sleeps after 15 min inactivity (wakes on request in ~30 seconds)
- 750 hours/month (enough for 24/7 operation)

**PostgreSQL (Free):**
- 256 MB RAM
- 1 GB storage
- Expires after 90 days (you'll need to migrate or upgrade)

**Upgrade when needed:**
- Web Service: $7/month (always on, more RAM)
- PostgreSQL: $7/month (no expiration, 1 GB storage)

## 🔧 Troubleshooting

### Database connection fails
- Check DATABASE_URL in environment variables
- Verify database is "Available" in dashboard
- Check logs for connection errors

### Import fails
- Use External Database URL (not Internal)
- Check PostgreSQL client is installed: `psql --version`
- Verify your local database has data: `docker exec bom-postgres-dev psql -U postgres -d bom_study_tools_dev -c "SELECT COUNT(*) FROM verses;"`

### Service won't start
- Check build logs for Python errors
- Verify requirements.txt exists
- Check start command syntax

### 502 Bad Gateway
- Service is starting (wait 30 seconds)
- Or check logs for crashes

## 🚀 Next Steps

1. **Custom Domain** (optional): Add your domain in Render dashboard
2. **SSL Certificate**: Automatic with Render (HTTPS enabled)
3. **CI/CD**: Auto-deploy on git push (already configured!)
4. **Monitoring**: Add health check alerts in Render

---

**Questions?** Check https://render.com/docs or the Render community forum.
