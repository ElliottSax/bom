# Quick Start Guide - Next Development Session

**Last Updated:** December 8, 2025
**Status:** Database ready, Mobile app ready, 5 API workarounds documented

---

## What's Ready ✅

### Database (11,787 verses)
- PostgreSQL running on port 5435
- Redis running on port 6382
- All scripture data imported and verified

### Mobile App
- Complete source code in `apps/mobile/src/`
- All screens, components, navigation implemented
- Ready for dependency installation

### API Server Solutions
- 5 documented workarounds (see `API_SERVER_WORKAROUNDS.md`)
- Simplified JavaScript server ready (`services/api/server-simple.js`)
- Python alternative ready (`services/api/server-python.py`)

---

## Quick Commands

### Start Docker Services
```bash
docker start bom-postgres-dev bom-redis-dev

# Verify
docker ps | grep bom
```

### Verify Database
```bash
docker exec bom-postgres-dev psql -U postgres -d bom_study_tools_dev -c \
  "SELECT COUNT(*) as verses FROM verses;"
# Expected: 11,787 verses
```

### Check Mobile App Structure
```bash
ls apps/mobile/src/
# Should see: components/ screens/ navigation/ hooks/ services/ config/
```

---

## Recommended Next Steps

### Option A: Mobile App Development (Fastest Path)

**Goal:** Get mobile app running with direct database access

```bash
cd apps/mobile

# Install dependencies
npm install

# iOS (macOS only)
npm run ios

# Android
npm run android
```

**Use direct PostgreSQL connection for initial testing:**
- Add `pg` package: `npm install pg`
- Update `src/services/database.ts` to use direct connection
- Test scripture reader with real data

---

### Option B: API Server via Windows Node.js

**Goal:** Run GraphQL API server from Windows (not WSL2)

1. Open PowerShell on Windows
2. Navigate to project:
   ```powershell
   cd E:\projects\bom\services\api
   ```

3. Install dependencies (if not already):
   ```powershell
   npm install
   ```

4. Run simple JavaScript server:
   ```powershell
   node server-simple.js
   ```

5. Access from WSL2 or browser:
   - GraphQL Playground: http://localhost:4000
   - Health check: http://localhost:4000 (query: `{ health }`)

---

### Option C: API Server via Python (Alternative)

**Goal:** Use Python GraphQL server (no Node.js issues)

```bash
cd services/api

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install strawberry-graphql uvicorn asyncpg

# Run server
python server-python.py
```

Access GraphQL Playground at http://localhost:4000/graphql

---

### Option D: Cloud Deployment (Production Approach)

**Goal:** Deploy API to Fly.io for production testing

```bash
# Install Fly.io CLI
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# Deploy
cd services/api
flyctl launch
flyctl deploy
```

Update mobile app to use cloud endpoint.

---

## Troubleshooting

### If Database Connection Fails
```bash
# Check containers running
docker ps | grep bom

# Restart if needed
docker restart bom-postgres-dev bom-redis-dev

# Check logs
docker logs bom-postgres-dev
```

### If API Server Won't Start
- **From WSL2 /mnt/e:** Won't work - use Windows or cloud instead
- **From Windows:** Ensure port 4000 not in use: `netstat -an | findstr :4000`
- **Python venv:** Ensure venv activated: `source venv/bin/activate`

### If Mobile App Won't Build
```bash
# Clean and reinstall
cd apps/mobile
rm -rf node_modules
npm install

# Check React Native setup
npx react-native doctor
```

---

## Sample Queries

### Health Check
```graphql
{
  health
}
```

### List Editions
```graphql
{
  editions {
    id
    name
    year
  }
}
```

### Get Verses (I Nephi Chapter 1)
```graphql
{
  verses(
    editionId: "coc-bom-1908"
    book: "I Nephi"
    chapter: 1
    limit: 10
  ) {
    verse
    text
  }
}
```

### Get Book Statistics
```graphql
{
  books(editionId: "coc-bom-1908") {
    book
    verseCount
    chapters
  }
}
```

---

## Project Status Reference

| Component | Status | Port | Notes |
|-----------|--------|------|-------|
| PostgreSQL | ✅ Running | 5435 | 11,787 verses |
| Redis | ✅ Running | 6382 | Cache ready |
| Mobile App | ✅ Ready | N/A | Needs npm install |
| API Server (WSL2) | ⚠️ Blocked | - | Use workarounds |
| API Server (Windows) | ✅ Ready | 4000 | `server-simple.js` |
| API Server (Python) | ✅ Ready | 4000 | `server-python.py` |
| API Server (Cloud) | 📋 Planned | - | Fly.io recommended |

---

## Files to Review

### Documentation
- `CURRENT_STATUS.md` - Overall project status
- `API_SERVER_WORKAROUNDS.md` - API server solutions
- `TROUBLESHOOTING_DEC_8.md` - Detailed troubleshooting
- `PROJECT_STATUS_DEC_7_2025.md` - Phase 1 completion report

### Code
- `services/api/server-simple.js` - Simplified Node.js API
- `services/api/server-python.py` - Python GraphQL API
- `apps/mobile/src/App.tsx` - Mobile app entry point
- `services/api/.env.development` - Development configuration

### Database
- `services/api/prisma/schema.prisma` - Database schema
- `services/api/prisma/seeds/scraped/` - SQL import files

---

## Success Criteria for Next Session

- [ ] Mobile app dependencies installed successfully
- [ ] Mobile app runs on simulator (iOS or Android)
- [ ] Can view scripture list (at minimum)
- [ ] OR API server running (any workaround)
- [ ] GraphQL queries returning data

---

## Performance Notes

- **npm install** on native Linux: 20+ minutes (avoid if possible)
- **Docker build** on WSL2: 3+ minutes, may timeout (use pre-built images)
- **node/tsx** on /mnt/e: Hangs indefinitely (use Windows or cloud)
- **Python server**: Starts in < 3 seconds ✅
- **Direct database queries**: < 100ms ✅

---

## Contact & Resources

- **GraphQL Queries**: See `GRAPHQL_QUERIES_FULL_DATASET.md`
- **Mobile Setup**: See `apps/mobile/SETUP.md`
- **Database Schema**: See `services/api/prisma/schema.prisma`
- **API Documentation**: See `GRAPHQL_API_GUIDE.md`

---

**Ready to code?** Pick one of the options above and get started! 🚀

**Recommended:** Start with **Option A (Mobile App)** using direct database access, then add GraphQL layer in week 2.
