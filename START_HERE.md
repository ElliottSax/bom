# 🚀 START HERE - Development Quick Start

**New to this project?** This is your starting point!

**Last Updated:** December 8, 2025
**Status:** Full stack operational and ready for development

---

## ⚡ 30-Second Overview

This is the **Book of Mormon Study Tools** project for Community of Christ scriptures:
- **Database:** 11,787 verses loaded ✅
- **API:** GraphQL server running ✅
- **Mobile:** React Native app ready ✅
- **Platform:** WSL2-compatible solutions ✅

---

## 🎯 What You Need

1. **WSL2 on Windows** (or native Linux/macOS)
2. **Docker** (for database)
3. **Node.js 18+** (for mobile app)
4. **Python 3.8+** (for API server)

---

## 🚀 Quick Start (5 minutes)

### Step 1: Start Services (2 min)

```bash
# Start database
docker start bom-postgres-dev bom-redis-dev

# Start API server (in new terminal)
cd services/api
python3 server-minimal.py
```

### Step 2: Test API (30 sec)

```bash
# In another terminal:
curl http://localhost:4000/health
# Expected: {"status": "healthy"}
```

### Step 3: Ready to Develop! ✅

API is running at: **http://localhost:4000/graphql**

---

## 📱 Mobile App (Next Step)

### ⚠️ Important: WSL2 Users

**If you're on WSL2:** Mobile development must be done on **Windows** (not WSL2) due to `npm install` issues on `/mnt/e`.

**See:** [MOBILE_DEV_WSL2.md](./MOBILE_DEV_WSL2.md) for complete WSL2 setup guide.

**Quick setup (Windows PowerShell):**
```powershell
# Run the automated setup script
.\setup-mobile-windows.ps1
```

### 📱 Standard Setup (macOS/Linux)

```bash
cd apps/mobile

# Install dependencies (first time only)
npm install

# Start Metro bundler
npm start

# In another terminal:
npm run ios     # macOS only
# OR
npm run android # Requires Android Studio
```

---

## 📚 Documentation Routes

### 🆕 New Developer?
1. Read this file (you're here!)
2. [QUICK_START.md](./QUICK_START.md) - 5-minute API setup
3. [MOBILE_DEV_WSL2.md](./MOBILE_DEV_WSL2.md) - Mobile setup on WSL2 ⭐
4. [MOBILE_APP_API_INTEGRATION.md](./MOBILE_APP_API_INTEGRATION.md) - Mobile guide

### 🐛 Having Issues?
1. [WSL2_SOLUTIONS.md](./WSL2_SOLUTIONS.md) - API server on WSL2
2. [MOBILE_DEV_WSL2.md](./MOBILE_DEV_WSL2.md) - Mobile app on WSL2 ⭐
3. [TROUBLESHOOTING_DEC_8.md](./TROUBLESHOOTING_DEC_8.md) - Common issues
4. [API_SERVER_WORKAROUNDS.md](./API_SERVER_WORKAROUNDS.md) - Alternative approaches

### 📖 Understanding the Project?
1. [README.md](./README.md) - Project overview
2. [CURRENT_STATUS.md](./CURRENT_STATUS.md) - Current progress
3. [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Codebase layout

### 💻 Ready to Code?
1. [MOBILE_APP_API_INTEGRATION.md](./MOBILE_APP_API_INTEGRATION.md) - Integration guide
2. [NEXT_STEPS.md](./NEXT_STEPS.md) - Development roadmap
3. [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md) - All docs

---

## 🎓 Common Tasks

### Start Everything
```bash
# Terminal 1: Database
docker start bom-postgres-dev bom-redis-dev

# Terminal 2: API
cd services/api && python3 server-minimal.py

# Terminal 3: Mobile
cd apps/mobile && npm start

# Terminal 4: iOS/Android
cd apps/mobile && npm run ios  # or android
```

### Check Status
```bash
# Database
docker ps | grep bom

# API
curl http://localhost:4000/health

# Verses count
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ verses { id } }"}'
```

### Stop Everything
```bash
# Stop API: Ctrl+C in API terminal
# Stop Mobile: Ctrl+C in mobile terminal
# Stop Database (optional):
docker stop bom-postgres-dev bom-redis-dev
```

---

## 🗺️ Project Structure

```
/mnt/e/projects/bom/
├── services/api/          # GraphQL API server
│   ├── server-minimal.py  # ✅ Currently running
│   ├── src/               # Full TypeScript API (future)
│   └── prisma/            # Database schema & seeds
├── apps/mobile/           # React Native mobile app
│   ├── src/
│   │   ├── graphql/       # ✅ GraphQL queries
│   │   ├── hooks/         # ✅ Custom hooks
│   │   ├── screens/       # App screens
│   │   └── components/    # Reusable components
│   └── ios/ & android/    # Native code
├── scripts/               # Helper scripts
│   ├── copy-to-native-linux.sh
│   └── start-api-docker.sh
└── [docs]/                # Comprehensive documentation
```

---

## 💡 Quick Tips

### For WSL2 Users
- Don't run `npm install` from `/mnt/e` (takes 20+ min)
- Use Python server: `python3 server-minimal.py` (instant!)
- Or copy to native Linux: `./scripts/copy-to-native-linux.sh`

### For Mobile Development
- API must be running before starting mobile app
- Use `npm start -- --reset-cache` if metro bundler acts weird
- iOS requires macOS, Android works on any platform

### For API Development
- Python server: Quick, simple, read-only
- For mutations: Deploy full TypeScript API to cloud
- See [WSL2_SOLUTIONS.md](./WSL2_SOLUTIONS.md) for all options

---

## 🐛 Troubleshooting

### "curl: command not found"
```bash
sudo apt-get update && sudo apt-get install curl
```

### "docker: command not found"
Docker Desktop not running. Start it from Windows.

### "npm: command not found"
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### "python3: command not found"
```bash
sudo apt-get update && sudo apt-get install python3
```

### API not responding
```bash
# Check if running
ps aux | grep server-minimal

# Check if port is in use
lsof -i :4000

# Restart
cd services/api && python3 server-minimal.py
```

### Database not running
```bash
docker start bom-postgres-dev bom-redis-dev
docker ps | grep bom  # Verify
```

---

## 🎯 Development Workflow

### Daily Routine
1. **Start services** (1 min)
   ```bash
   docker start bom-postgres-dev bom-redis-dev
   cd services/api && python3 server-minimal.py
   ```

2. **Develop** (your time!)
   ```bash
   cd apps/mobile
   npm start
   # Code, test, iterate
   ```

3. **Stop when done** (10 sec)
   ```bash
   # Ctrl+C in terminals
   # Optional: docker stop bom-postgres-dev bom-redis-dev
   ```

### Testing Flow
1. Test API: `curl http://localhost:4000/health`
2. Test query: `curl -X POST http://localhost:4000/graphql -H "Content-Type: application/json" -d '{"query": "{ health }"}'`
3. Test mobile: Launch app, check editions/books/verses

---

## 📊 Current Capabilities

### Database ✅
- 11,787 verses (CoC Book of Mormon + D&C)
- 15 books complete
- 6 editions configured
- Cross-edition mapping ready

### API ✅
- Health check
- List editions
- Get books with statistics
- Fetch verses by edition/book/chapter
- CORS enabled for mobile

### Mobile ✅
- Apollo Client configured
- 5 GraphQL queries defined
- 3 custom hooks (useEditions, useBooks, useChapter)
- Offline support with cache
- TypeScript fully typed

---

## 🚧 Not Yet Implemented

- [ ] Authentication/Authorization
- [ ] Mutations (notes, highlights, bookmarks)
- [ ] Search functionality
- [ ] Cross-references
- [ ] User accounts
- [ ] Cloud sync

See [NEXT_STEPS.md](./NEXT_STEPS.md) for roadmap.

---

## 🆘 Need Help?

1. **Check docs:** [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)
2. **Common issues:** [TROUBLESHOOTING_DEC_8.md](./TROUBLESHOOTING_DEC_8.md)
3. **WSL2 specific:** [WSL2_SOLUTIONS.md](./WSL2_SOLUTIONS.md)
4. **API issues:** [API_SERVER_RUNNING.md](./API_SERVER_RUNNING.md)

---

## 🎉 Success Criteria

You're ready when:
- ✅ Docker containers running
- ✅ API responds to `curl http://localhost:4000/health`
- ✅ Mobile app launches on simulator
- ✅ Can view scripture editions/books/chapters

---

## 🔗 Useful URLs

- **API GraphQL:** http://localhost:4000/graphql
- **API Docs:** http://localhost:4000
- **Database:** localhost:5435 (PostgreSQL)
- **Redis:** localhost:6382

---

## 📦 Quick Commands Reference

```bash
# Database
docker start bom-postgres-dev bom-redis-dev
docker ps | grep bom
docker exec bom-postgres-dev psql -U postgres -d bom_study_tools_dev -c "SELECT COUNT(*) FROM verses;"

# API
cd services/api && python3 server-minimal.py
curl http://localhost:4000/health
curl -X POST http://localhost:4000/graphql -H "Content-Type: application/json" -d '{"query": "{ health }"}'

# Mobile
cd apps/mobile
npm install          # First time only
npm start            # Start Metro
npm run ios          # iOS simulator (macOS)
npm run android      # Android emulator
```

---

## ✅ Checklist for New Developers

- [ ] Docker installed and running
- [ ] Containers started: `docker start bom-postgres-dev bom-redis-dev`
- [ ] API running: `python3 services/api/server-minimal.py`
- [ ] API responding: `curl http://localhost:4000/health`
- [ ] Read [MOBILE_APP_API_INTEGRATION.md](./MOBILE_APP_API_INTEGRATION.md)
- [ ] Mobile dependencies installed: `cd apps/mobile && npm install`
- [ ] Mobile app launched: `npm start && npm run ios`
- [ ] Viewed sample data in app

---

**You're all set!** 🚀

Time to build: [NEXT_STEPS.md](./NEXT_STEPS.md)

---

**Last Updated:** December 8, 2025
**Status:** Production-ready for mobile development
**Blockers:** None ✅
