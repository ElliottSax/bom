# 🚀 Step-by-Step Deployment Guide

## Current Status ✅
- **PostgreSQL**: Running on port 5435 with 11,787 verses
- **Redis**: Running on port 6382
- **API Server**: Running on port 4002
- **Mobile App**: Ready to build

---

## Option 1: Local Testing (Recommended First)

### Step 1: Test the API Locally
```bash
# Your API is already running! Test it:
curl http://localhost:4002/graphql \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "{ editions { id name } }"}'
```

### Step 2: Build and Test Mobile App (Android)

#### On Windows (PowerShell):
```powershell
# Navigate to mobile app directory
cd E:\projects\bom\apps\mobile

# Install dependencies (if not done)
npm install

# For Android development build
npx react-native run-android

# OR for release APK
cd android
./gradlew assembleRelease
```

The APK will be at: `apps/mobile/android/app/build/outputs/apk/release/app-release.apk`

#### Install APK on your phone:
1. Enable "Developer Options" on your Android phone
2. Enable "Install from Unknown Sources"
3. Copy the APK to your phone
4. Install and test

### Step 3: Test Connection Between App and API

In the mobile app, make sure the API URL points to your computer's IP:

```javascript
// In apps/mobile/src/config/apollo.ts
const API_URL = 'http://YOUR_COMPUTER_IP:4002/graphql';
// Replace YOUR_COMPUTER_IP with your actual IP (run 'ipconfig' on Windows)
```

---

## Option 2: Deploy to Free Cloud Services (For Testing)

### A. Deploy API to Render.com (Free Tier)

1. **Create account at [render.com](https://render.com)**

2. **Create a new file** `/mnt/e/projects/bom/render.yaml`:
```yaml
services:
  - type: web
    name: bom-api
    env: python
    buildCommand: "cd services/api && pip install -r requirements.txt"
    startCommand: "cd services/api && gunicorn -w 2 -b 0.0.0.0:$PORT server-with-mutations:app"
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: bom-db
          property: connectionString
      - key: REDIS_URL
        value: redis://red-xxxxx:6379  # Will be provided by Render

databases:
  - name: bom-db
    databaseName: bom_production
    user: bom_user
```

3. **Push to GitHub and connect to Render**
```bash
cd /mnt/e/projects/bom
git add .
git commit -m "Add Render deployment config"
git push origin main
```

4. **In Render Dashboard**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Render will auto-deploy

### B. Deploy API to Railway.app (Alternative)

1. **Install Railway CLI**:
```bash
npm install -g @railway/cli
```

2. **Deploy**:
```bash
cd /mnt/e/projects/bom/services/api
railway login
railway init
railway up
```

### C. Deploy Database to Supabase (Free PostgreSQL)

1. **Create account at [supabase.com](https://supabase.com)**
2. **Create new project** (free tier includes 500MB database)
3. **Get connection string** from Settings → Database
4. **Import your data**:
```bash
# Export from local
pg_dump -h localhost -p 5435 -U postgres -d bomstudytools_dev > bom_data.sql

# Import to Supabase
psql "postgresql://[USER]:[PASSWORD]@[HOST]:5432/postgres" < bom_data.sql
```

---

## Option 3: Production Deployment (Paid Services)

### A. API Deployment to AWS EC2

```bash
# 1. Launch EC2 instance (t2.micro for testing)
# 2. SSH into instance
ssh -i your-key.pem ubuntu@your-instance.com

# 3. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 4. Clone your repository
git clone https://github.com/yourusername/bom.git
cd bom

# 5. Build and run
docker-compose -f docker-compose.prod.yml up -d
```

### B. Mobile App Deployment

#### Android (Google Play Store)
```bash
# 1. Generate signed APK
cd apps/mobile/android
./gradlew assembleRelease

# 2. Sign the APK (first time, create keystore)
keytool -genkey -v -keystore release.keystore \
  -alias bom-study-tools -keyalg RSA -keysize 2048 -validity 10000

# 3. Sign APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
  -keystore release.keystore \
  app/build/outputs/apk/release/app-release-unsigned.apk \
  bom-study-tools

# 4. Optimize APK
zipalign -v 4 \
  app/build/outputs/apk/release/app-release-unsigned.apk \
  bom-study-tools.apk
```

Upload to Google Play Console ($25 one-time fee)

#### iOS (App Store)
Requires Mac computer:
```bash
cd apps/mobile/ios
pod install
xcodebuild -workspace BOMStudyTools.xcworkspace \
  -scheme BOMStudyTools -configuration Release archive
```
Upload via Xcode to App Store Connect ($99/year)

---

## 🎯 Quick Start Commands (Run These Now!)

### 1. Check Everything is Running
```bash
# Check API
curl http://localhost:4002/graphql \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "{ editions { id } }"}'

# Check Database
docker exec -it bom-postgres-dev psql -U bomstudytools_dev -c "SELECT COUNT(*) FROM verses;"
```

### 2. Build Android APK (Easiest to Test)
```powershell
# In PowerShell on Windows
cd E:\projects\bom\apps\mobile
npm install
cd android
./gradlew assembleDebug

# APK will be at:
# android\app\build\outputs\apk\debug\app-debug.apk
```

### 3. Test on Your Phone
1. Email the APK to yourself
2. Download on your Android phone
3. Install and test

### 4. Update API URL in App
Edit `apps/mobile/src/config/apollo.ts`:
```javascript
// For local testing (find your IP with 'ipconfig')
const API_URL = 'http://192.168.1.XXX:4002/graphql';

// For production
const API_URL = 'https://your-api-domain.com/graphql';
```

---

## ⚠️ Common Issues & Solutions

### Issue: Can't connect to API from phone
**Solution**: Make sure your phone and computer are on the same WiFi network. Use your computer's IP address, not 'localhost'.

### Issue: Build fails on Windows
**Solution**: Use PowerShell as Administrator, not Git Bash or WSL.

### Issue: APK won't install
**Solution**: Enable "Install from Unknown Sources" in phone settings.

### Issue: Database connection fails
**Solution**: Check Docker is running: `docker ps`

---

## 📱 Testing Checklist

- [ ] API responds to GraphQL queries
- [ ] Database has all 11,787 verses
- [ ] APK builds successfully
- [ ] App installs on phone
- [ ] App connects to API
- [ ] Search works
- [ ] Offline mode works
- [ ] Notes can be saved

---

## 🆘 Need Help?

If you get stuck at any step:

1. **Check logs**:
```bash
# API logs
docker logs bom-postgres-dev
ps aux | grep python

# Build logs
cd apps/mobile/android
./gradlew assembleDebug --debug
```

2. **Test connectivity**:
```bash
# From your phone's browser, try:
http://YOUR_COMPUTER_IP:4002/graphql
```

3. **Simplest deployment**: Use Render.com or Railway.app for free API hosting, then just build the APK and test locally first.

---

## 🎉 Next Steps After Successful Local Test

1. Deploy API to cloud (Render/Railway/AWS)
2. Update app to use cloud API URL
3. Build release APK
4. Test thoroughly
5. Submit to app stores

**Start with local testing first - it's the fastest way to see your app working!**