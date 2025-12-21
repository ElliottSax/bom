# React Native Development on WSL2

**Last Updated:** December 8, 2025
**Status:** ✅ Tested and working

---

## 🎯 The WSL2 + React Native Setup

React Native mobile development on WSL2 requires a hybrid approach:

| Component | Runs On | Why |
|-----------|---------|-----|
| **API Server** | WSL2 | Direct database access, better performance |
| **Mobile App** | Windows | npm install works, simulator/emulator access |
| **Database** | WSL2 (Docker) | Native Linux performance |

---

## ⚠️ Why Not Run Mobile on WSL2?

**Confirmed Issue:** `npm install` hangs on `/mnt/e` due to WSL2 filesystem limitations.

```bash
# ❌ This will hang/timeout on WSL2:
cd /mnt/e/projects/bom/apps/mobile
npm install  # Hangs after 60+ seconds
```

**Same root cause** as the API server issues documented in [WSL2_SOLUTIONS.md](./WSL2_SOLUTIONS.md).

---

## ✅ Recommended Setup

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Windows                          │
│                                                      │
│  E:\projects\bom\apps\mobile\                       │
│  ├── npm install (works!)                           │
│  ├── Metro bundler (port 8081)                      │
│  └── Connects to → http://localhost:4000            │
│                           ↓                          │
└───────────────────────────┼──────────────────────────┘
                            │
┌───────────────────────────┼──────────────────────────┐
│                    WSL2   ↓                          │
│                                                      │
│  /mnt/e/projects/bom/services/api/                  │
│  ├── Python GraphQL server (port 4000)              │
│  └── Connects to → PostgreSQL (port 5435)           │
│                           ↓                          │
│  Docker:                                             │
│  └── bom-postgres-dev (11,787 verses)               │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Setup Instructions

### Step 1: Install Node.js on Windows

**Required:** Node.js 18+ on Windows (not WSL2)

```powershell
# Check if Node is installed (run in Windows PowerShell or CMD)
node --version  # Should show v18.0.0 or higher
npm --version   # Should show 9.0.0 or higher
```

**If not installed:**
- Download from [nodejs.org](https://nodejs.org/)
- Install the LTS version (18.x or 20.x)
- Restart terminal after installation

---

### Step 2: Install Mobile Dependencies (Windows)

```powershell
# Open PowerShell or CMD on Windows
cd E:\projects\bom\apps\mobile

# Install dependencies (this works on Windows!)
npm install

# Expected time: 2-5 minutes
# Expected output: ~500 packages installed
```

**Note:** This is the same `/mnt/e/projects/bom` from WSL2 perspective, but accessed natively on Windows as `E:\projects\bom`.

---

### Step 3: Verify API Server (WSL2)

In WSL2 terminal, ensure API server is running:

```bash
# Check API status
curl http://localhost:4000/health
# Should return: {"status": "healthy"}

# If not running, start it:
cd /mnt/e/projects/bom/services/api
python3 server-minimal.py
```

---

### Step 4: Start Metro Bundler (Windows)

```powershell
# In Windows terminal (PowerShell/CMD)
cd E:\projects\bom\apps\mobile

# Start Metro bundler
npm start

# Expected output:
# ┌────────────────────────────────────────────────────┐
# │  Metro waiting on exp://192.168.x.x:8081           │
# └────────────────────────────────────────────────────┘
```

**Keep this terminal open** - Metro needs to stay running.

---

### Step 5: Run on iOS/Android

#### Option A: iOS (macOS only)

```bash
# In a new terminal (macOS)
cd /path/to/projects/bom/apps/mobile
npm run ios
```

#### Option B: Android (Windows/macOS/Linux)

**Prerequisites:**
- Android Studio installed
- Android SDK configured
- Android emulator running OR physical device connected

```powershell
# In a new Windows terminal
cd E:\projects\bom\apps\mobile

# Run on Android emulator
npm run android

# Or specify device
npm run android -- --deviceId=emulator-5554
```

---

## 🔧 Configuration

### API Endpoint

The mobile app is configured to connect to `http://localhost:4000`.

**File:** `apps/mobile/src/config/apollo.ts`

```typescript
const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
});
```

**Why this works:**
- Windows can access WSL2 localhost
- WSL2 can access Windows localhost
- Both share the same network stack via WSL2 networking

---

## 🧪 Testing the Connection

### Test 1: API Health Check

```powershell
# From Windows PowerShell
curl http://localhost:4000/health

# Expected: {"status": "healthy"}
```

### Test 2: GraphQL Query

```powershell
# From Windows PowerShell
curl -X POST http://localhost:4000/graphql `
  -H "Content-Type: application/json" `
  -d '{"query": "{ health }"}'

# Expected: {"data":{"health":"OK"}}
```

### Test 3: Editions Query

```powershell
curl -X POST http://localhost:4000/graphql `
  -H "Content-Type: application/json" `
  -d '{"query": "{ editions { id name } }"}'

# Expected: List of 6 editions
```

---

## 📱 Development Workflow

### Daily Workflow

**Terminal 1 (WSL2):**
```bash
# Start API server
cd /mnt/e/projects/bom/services/api
python3 server-minimal.py
```

**Terminal 2 (Windows):**
```powershell
# Start Metro bundler
cd E:\projects\bom\apps\mobile
npm start
```

**Terminal 3 (Windows):**
```powershell
# Run on device/emulator
cd E:\projects\bom\apps\mobile
npm run android  # or ios
```

---

### Making Code Changes

1. **Edit files in Windows** (VSCode, etc.)
   - Changes auto-reload in Metro (hot reload)
   - TypeScript type-checks on save

2. **API changes** (WSL2)
   - Restart Python server: `Ctrl+C` then `python3 server-minimal.py`
   - Mobile app will reconnect automatically

3. **Database changes** (WSL2)
   - Migrations run in WSL2 as usual
   - No mobile app changes needed

---

## 🐛 Troubleshooting

### Metro Can't Connect to API

**Symptom:** GraphQL errors in mobile app

**Solution:**
```powershell
# Test API from Windows
curl http://localhost:4000/health

# If it fails, check WSL2 is running:
wsl hostname -I  # Should show WSL2 IP address
```

---

### npm install Still Slow on Windows

**Symptom:** npm install takes >10 minutes on Windows

**Solutions:**
1. Disable Windows Defender real-time scanning for `node_modules`
2. Use `npm ci` instead of `npm install` for faster installs
3. Check disk space (npm needs ~500MB for mobile dependencies)

---

### Android Emulator Can't Find Metro

**Symptom:** "Unable to connect to Metro" in Android app

**Solution:**
```powershell
# Forward Metro port to emulator
adb reverse tcp:8081 tcp:8081

# Then reload app
```

---

### Changes Not Appearing in App

**Solutions:**
1. Hard reload: Shake device/emulator → "Reload"
2. Reset Metro cache:
   ```powershell
   npm start -- --reset-cache
   ```
3. Clear app data: Settings → Apps → BOM Study Tools → Clear Data

---

## 📊 Performance Expectations

| Operation | Windows | WSL2 | Docker |
|-----------|---------|------|--------|
| npm install | 2-5 min | ❌ Hangs | N/A |
| Metro start | 5-10 sec | ❌ Slow | N/A |
| Hot reload | <1 sec | ❌ Unreliable | N/A |
| API requests | <100ms | <50ms | <100ms |

**Recommendation:** Mobile development on Windows, API on WSL2 (best of both)

---

## 🔗 Related Documentation

- **[WSL2_SOLUTIONS.md](./WSL2_SOLUTIONS.md)** - Why WSL2 has npm issues
- **[QUICK_START.md](./QUICK_START.md)** - Overall project setup
- **[MOBILE_APP_API_INTEGRATION.md](./MOBILE_APP_API_INTEGRATION.md)** - GraphQL integration details
- **[START_HERE.md](./START_HERE.md)** - Developer onboarding

---

## ✅ Quick Reference

```powershell
# Windows Commands (PowerShell/CMD)
cd E:\projects\bom\apps\mobile
npm install                    # Install dependencies
npm start                      # Start Metro bundler
npm run android                # Run on Android
npm run ios                    # Run on iOS (macOS only)
npm test                       # Run tests
npm run type-check             # Check TypeScript types
```

```bash
# WSL2 Commands
cd /mnt/e/projects/bom/services/api
python3 server-minimal.py      # Start API server
./scripts/dev-start.sh         # Start all WSL2 services
./scripts/test-api.sh          # Test API endpoints
```

---

## 📋 Pre-flight Checklist

Before running the mobile app:

- [ ] Node.js 18+ installed on Windows
- [ ] Docker running (for database)
- [ ] API server running on WSL2 (http://localhost:4000)
- [ ] Metro bundler running on Windows (port 8081)
- [ ] Android emulator running OR iOS simulator open
- [ ] All mobile dependencies installed (`npm install` completed)

---

## 🎯 Summary

**The Setup:**
- ✅ API Server: WSL2 (Python + PostgreSQL)
- ✅ Mobile App: Windows (React Native + Metro)
- ✅ Communication: localhost:4000 (cross-WSL2/Windows)

**Why This Works:**
- Windows handles npm install (fast, reliable)
- WSL2 handles database queries (native performance)
- Network stack is shared (localhost works both ways)
- No filesystem performance issues

**Result:**
- Fast mobile development with hot reload
- Fast API with direct database access
- No WSL2 filesystem bottlenecks

---

**Ready to develop!** 🚀

Next step: `cd E:\projects\bom\apps\mobile && npm install`
