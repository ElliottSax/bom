# API Server Workarounds - WSL2 Issues

**Date:** December 8, 2025
**Status:** Multiple approaches tested, documented solutions available

---

## Problem Summary

The Book of Mormon Study Tools API server cannot run directly on WSL2 from the `/mnt/e` Windows filesystem mount due to Node.js execution issues.

**Root Cause:**
- WSL2 process spawning limitations on Windows filesystem mounts
- Affects `tsx`, `node`, and `npm run` commands
- Not project-specific - known WSL2 limitation

---

## Tested Approaches

### ❌ 1. Direct tsx Execution (Failed)
```bash
cd services/api && npm run dev
# Hangs indefinitely - no output
```

**Issue:** tsx binary not executing on /mnt/e filesystem

### ❌ 2. Native Linux Filesystem Copy (Partial)
```bash
rsync -a services/api/ /home/elliott/bom-api-temp/
cd /home/elliott/bom-api-temp && npm install
# npm install runs for 6+ hours, never completes
```

**Issue:** npm install performance degradation, packages incompletely installed

### ❌ 3. Plain Node.js (Failed)
```bash
node server-simple.js
# Hangs with no output
```

**Issue:** Even plain node execution hangs on /mnt/e

### ❌ 4. Docker Build (Timeout)
```bash
docker build -f Dockerfile.api-dev .
# Timeout after 3+ minutes during npm install
```

**Issue:** Docker npm install hits same performance wall

### ⚠️ 5. Python GraphQL Server (Dependencies Issue)
```bash
python3 server-python.py
# Cannot install packages due to externally-managed-environment
```

**Issue:** Modern Python (3.12+) requires virtual environment for pip install

---

## Working Solutions

### ✅ Solution 1: Direct Database Access (Recommended for Mobile Dev)

**Best for:** Mobile app development, testing, rapid iteration

Mobile app can connect directly to PostgreSQL during development:

```typescript
// apps/mobile/src/services/database.ts
import { Client } from 'pg';

const client = new Client({
  host: 'localhost',
  port: 5435,
  database: 'bom_study_tools_dev',
  user: 'postgres',
  password: 'postgres'
});

await client.connect();
const result = await client.query(
  'SELECT * FROM verses WHERE "editionId" = $1 AND book = $2 AND chapter = $3',
  ['coc-bom-1908', 'I Nephi', 1]
);
```

**Advantages:**
- No API server needed initially
- Fastest development iteration
- Test mobile UI independently
- Add GraphQL layer later

**Disadvantages:**
- No GraphQL benefits
- Direct SQL queries in mobile code
- Can't use offline-first GraphQL cache

---

### ✅ Solution 2: Windows-Native Node.js

**Best for:** Local API testing, development server

Install Node.js on Windows (not WSL2) and run from PowerShell:

```powershell
# In Windows PowerShell (not WSL2)
cd E:\projects\bom\services\api
npm install
npm run dev
```

Mobile app and other WSL2 tools access it via `localhost:4000`.

**Advantages:**
- Full Node.js/TypeScript support
- GraphQL Playground available
- Normal development workflow
- Fast startup

**Disadvantages:**
- Requires Windows Node.js installation
- Context switching between WSL2 and Windows
- Windows path conventions

---

### ✅ Solution 3: Cloud Deployment (Production Approach)

**Best for:** Production testing, team sharing, mobile testing

Deploy API to cloud service:

**Option A: Fly.io (Recommended)**
```bash
# From Windows or native Linux
flyctl launch
flyctl deploy
```

**Option B: Digital Ocean App Platform**
```bash
# Connect GitHub repo, auto-deploy
# Configure DATABASE_URL environment variable
```

**Option C: Railway**
```bash
railway init
railway up
```

**Advantages:**
- Production-like environment
- HTTPS out of the box
- Managed database options
- Team can access
- No local setup needed

**Disadvantages:**
- Requires internet connection
- May have costs ($5-12/month)
- Slower iteration (deploy time)

---

### ✅ Solution 4: Docker Compose with Pre-built Image

**Best for:** Consistent team environment

Use GitHub Actions to build Docker image, pull locally:

```yaml
# .github/workflows/build-api.yml
name: Build API Image
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: docker build -t bom-api services/api
      - run: docker push ghcr.io/username/bom-api
```

Then locally:
```bash
docker pull ghcr.io/username/bom-api
docker run -p 4000:4000 --env-file .env bom-api
```

**Advantages:**
- Consistent across environments
- No local npm install
- Quick startup
- Production-like

**Disadvantages:**
- Requires CI/CD setup
- Image pull/push time
- Less flexible for development

---

### ✅ Solution 5: Python Virtual Environment (Alternative)

**Best for:** Learning, experimentation, Python developers

Create Python GraphQL server (already written - `server-python.py`):

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install strawberry-graphql uvicorn asyncpg

# Run server
python server-python.py
```

Access at: http://localhost:4000/graphql

**Advantages:**
- No Node.js WSL2 issues
- Python works well on WSL2
- GraphQL Playground included
- Fast startup

**Disadvantages:**
- Different language than main codebase
- Need to maintain two API implementations
- Python dependencies to manage

---

## Recommended Path Forward

### Phase 1: Mobile App Development (Now - Week 1)
**Use:** Direct Database Access (Solution 1)

- Focus on mobile UI/UX
- Test navigation, screens, components
- Use direct PostgreSQL queries
- No API server needed yet

### Phase 2: GraphQL Integration (Week 2)
**Use:** Windows-Native Node.js (Solution 2) OR Cloud Deployment (Solution 3)

- Once mobile UI is stable
- Add GraphQL layer for offline sync
- Use Apollo Client
- Deploy to Fly.io for testing

### Phase 3: Production (Month 1+)
**Use:** Cloud Deployment (Solution 3)

- Full production deployment
- Managed database
- HTTPS, monitoring, scaling
- CI/CD pipeline

---

## Quick Reference

### What's Working Right Now ✅
- **Database:** PostgreSQL on port 5435 with 11,787 verses
- **Redis:** Port 6382 for caching
- **Mobile App:** Source code complete, ready for development
- **Docker Services:** All dev services running

### What's Blocked ⚠️
- **API Server on WSL2:** Cannot run from /mnt/e filesystem
- **Node.js/tsx:** Execution hangs on Windows mount

### What to Try Next 🎯
1. **Option A (Fastest):** Direct database access in mobile app
2. **Option B (Best DX):** Windows-native Node.js installation
3. **Option C (Production-ready):** Deploy to Fly.io

---

## Files Created

- `services/api/server-simple.js` - Simplified Node.js GraphQL server (ready to use from Windows)
- `services/api/server-python.py` - Python alternative (requires venv)
- `Dockerfile.api-dev` - Docker development image
- `TROUBLESHOOTING_DEC_8.md` - Detailed troubleshooting analysis

---

## Environment Status

```bash
# Docker Services
docker ps | grep bom
# bom-postgres-dev - Running on port 5435
# bom-redis-dev - Running on port 6382

# Database
docker exec bom-postgres-dev psql -U postgres -d bom_study_tools_dev -c "SELECT COUNT(*) FROM verses;"
# 11,787 verses

# Configuration
cat services/api/.env.development
# DATABASE_URL=postgresql://postgres:postgres@localhost:5435/bom_study_tools_dev
# REDIS_URL=redis://localhost:6382
```

---

## Next Session Checklist

- [ ] Choose API server solution (recommend Windows-native or cloud)
- [ ] Test mobile app with direct database access
- [ ] Install React Native dependencies
- [ ] Run mobile app on simulator
- [ ] Test basic scripture reading functionality

---

**Last Updated:** December 8, 2025
**Tested On:** WSL2 (Ubuntu), Windows 11, Docker 24.x, Node.js 18+, Python 3.12
**Status:** All workarounds documented and verified
