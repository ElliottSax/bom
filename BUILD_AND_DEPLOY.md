# 🚀 Build & Deploy Guide - Ready to Launch!

## Current Status ✅
- **API Server:** Running on port 4000
- **Database:** 11,787 verses loaded
- **Mobile App:** Advanced features implemented
- **Deployment:** Scripts and configs ready

---

## Option 1: Quick Local Test (15 minutes)

### Step 1: Configure Mobile App for Local API
```bash
cd apps/mobile/src/config

# Create apollo.ts if not exists
cat > apollo.ts << 'EOF'
import { ApolloClient, InMemoryCache } from '@apollo/client';

// For local testing, use your computer's IP address
const API_URL = 'http://192.168.1.XXX:4000/graphql'; // Replace XXX with your IP

export const apolloClient = new ApolloClient({
  uri: API_URL,
  cache: new InMemoryCache(),
});
EOF
```

### Step 2: Find Your Local IP
```bash
# On Windows (in PowerShell)
ipconfig | findstr IPv4

# On WSL2/Linux
hostname -I | awk '{print $1}'

# On Mac
ipconfig getifaddr en0
```

### Step 3: Build Debug APK
```powershell
# In PowerShell (Windows)
cd E:\projects\bom\apps\mobile

# Install dependencies (if not done)
npm install

# Build APK
cd android
./gradlew assembleDebug

# APK location
Write-Host "APK ready at: android\app\build\outputs\apk\debug\app-debug.apk"
```

### Step 4: Install on Phone
1. **Transfer APK to phone:**
   - Email to yourself
   - Use Google Drive
   - USB cable transfer

2. **Enable installation:**
   - Settings → Security → Unknown Sources → Enable

3. **Install and run!**

---

## Option 2: Production Deploy (45 minutes)

### A. Deploy API to Render.com (FREE)

#### 1. Prepare for Deployment
```bash
cd services/api

# Create requirements.txt for Python
cat > requirements.txt << 'EOF'
flask==2.3.0
flask-cors==4.0.0
flask-graphql==2.0.1
graphene==3.3
psycopg2-binary==2.9.9
python-dotenv==1.0.0
redis==5.0.1
gunicorn==21.2.0
EOF

# Create production server
cp server-with-mutations.py server-production.py
```

#### 2. Push to GitHub
```bash
cd /mnt/e/projects/bom

# Initialize git if needed
git init
git add .
git commit -m "feat: Production-ready BOM study tools with advanced features"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/bom-study-tools.git
git push -u origin main
```

#### 3. Deploy on Render.com

1. **Sign up at [render.com](https://render.com)**

2. **Create PostgreSQL Database:**
   - New → PostgreSQL
   - Name: `bom-database`
   - Free tier
   - Create Database
   - Copy connection string

3. **Create Web Service:**
   - New → Web Service
   - Connect GitHub repo
   - Settings:
     ```
     Name: bom-api
     Environment: Python
     Build Command: cd services/api && pip install -r requirements.txt
     Start Command: cd services/api && gunicorn server-production:app
     ```
   - Environment Variables:
     ```
     DATABASE_URL=postgresql://... (from step 2)
     REDIS_URL=redis://red-xxxxx.render.com:6379
     PORT=10000
     ```
   - Create Web Service

4. **Import Database:**
```bash
# After service is running, get the database URL
# Then import your data
cd services/api/prisma/migrations

# Connect and import
psql YOUR_RENDER_DATABASE_URL < 001_init_complete/migration.sql
psql YOUR_RENDER_DATABASE_URL < 002_seed_data/seed.sql
```

### B. Configure Mobile for Production

```javascript
// apps/mobile/src/config/apollo.ts
const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://bom-api.onrender.com/graphql'  // Your Render URL
  : 'http://localhost:4000/graphql';
```

### C. Build Production APK

```powershell
cd E:\projects\bom\apps\mobile

# Set production environment
$env:NODE_ENV="production"

# Clean build
cd android
./gradlew clean

# Build release APK (unsigned)
./gradlew assembleRelease

# Location
Write-Host "Release APK: android\app\build\outputs\apk\release\app-release-unsigned.apk"
```

### D. Sign APK (Optional but Recommended)

```bash
# Generate keystore (one time)
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# Sign the APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore app-release-unsigned.apk my-key-alias

# Optimize
zipalign -v 4 app-release-unsigned.apk app-release-signed.apk
```

---

## Option 3: Super Quick Deploy (10 minutes)

### Use Expo + EAS (Easiest Mobile Deploy)

```bash
cd apps/mobile

# Install Expo CLI
npm install -g expo-cli eas-cli

# Initialize Expo
expo init . --template blank-typescript

# Configure EAS
eas build:configure

# Build APK
eas build -p android --profile preview

# Download APK from Expo dashboard
```

---

## 🎯 Quick Test Checklist

### Before Launch
- [ ] API responding: `curl http://localhost:4000/health`
- [ ] Database connected: Check verses count
- [ ] Mobile configured: API URL set correctly
- [ ] Dependencies installed: `npm install` successful
- [ ] Build successful: APK generated

### After Install
- [ ] App launches without crash
- [ ] Can view scripture editions
- [ ] Can read verses
- [ ] Dark mode toggles
- [ ] Study plans create
- [ ] Notes save locally

---

## 🚨 Common Issues & Fixes

### Issue: npm install takes forever on WSL2
```bash
# Solution: Use native Windows PowerShell
# Or copy to Linux filesystem:
./scripts/copy-to-native-linux.sh
cd ~/projects/bom/apps/mobile
npm install  # Much faster!
```

### Issue: APK won't install
```text
Solution:
1. Enable Developer Mode on phone
2. Enable "Install from Unknown Sources"
3. If still fails, uninstall previous version first
```

### Issue: App can't connect to API
```javascript
// Check and update API URL in apollo.ts
// Use your actual IP address, not localhost
const API_URL = 'http://192.168.1.100:4000/graphql';
```

### Issue: Build fails with Java error
```powershell
# Install Java 11 or 17
# Set JAVA_HOME environment variable
$env:JAVA_HOME="C:\Program Files\Java\jdk-17"
```

---

## 🎉 Success Metrics

### You're ready when:
- ✅ APK builds without errors
- ✅ App installs on phone
- ✅ Can read scriptures
- ✅ Study plans work
- ✅ Dark mode functions
- ✅ Notes save

### Performance targets:
- App launch: <3 seconds
- Scripture load: <1 second
- Theme switch: Instant
- Tab creation: <500ms

---

## 📱 Distribution Options

### Beta Testing
1. **TestFlight (iOS):** Upload to App Store Connect
2. **Google Play Beta:** Upload to Play Console
3. **Firebase App Distribution:** Easiest for both platforms
4. **Direct APK:** Email or download link

### Production Release
1. **Google Play Store:** $25 one-time fee
2. **Apple App Store:** $99/year
3. **F-Droid:** Free, open source
4. **Direct Download:** Host APK on website

---

## 🔗 One-Line Deploy Commands

### Quick Local Test
```powershell
cd E:\projects\bom\apps\mobile; npm install; cd android; ./gradlew assembleDebug; echo "APK ready!"
```

### Production Build
```powershell
cd E:\projects\bom\apps\mobile; npm install; cd android; ./gradlew assembleRelease
```

### Start Everything
```bash
docker start bom-postgres-dev bom-redis-dev && cd services/api && python3 server-minimal.py
```

---

## 🏆 You're Almost There!

**Current Status:**
- ✅ 11,787 verses ready
- ✅ Advanced features implemented
- ✅ API running and tested
- ✅ Build scripts ready

**Next 30 minutes:**
1. Build APK (5 min)
2. Install on phone (5 min)
3. Test core features (10 min)
4. Deploy to cloud (10 min)

**Then you have a production app!** 🎉

---

*Need help? The code is production-ready. Just follow the steps above!*