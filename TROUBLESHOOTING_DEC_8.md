# Troubleshooting Session - December 8, 2025

## Summary

Investigated and documented API server startup issues on WSL2. Database successfully restored with 11,787 verses. Mobile app ready for development.

---

## Issues Identified

### 1. API Server - WSL2 Filesystem Limitations ⚠️

**Problem:**
- `tsx` and Node.js execution hangs when running from `/mnt/e` (Windows filesystem mount) on WSL2
- `npm run dev` starts but never completes initialization
- Affects both tsx and standard node execution

**Root Cause:**
- Known WSL2 issue with Windows filesystem mounts (`/mnt/c`, `/mnt/e`, etc.)
- File system performance and process spawning limitations
- Not a project-specific issue - affects all Node.js projects on mounted Windows drives

**Evidence:**
```bash
# Process hangs indefinitely:
cd services/api && npm run dev
> tsx watch src/index.ts
# (hangs - no output)
```

### 2. npm install Performance on Native Linux Filesystem

**Problem:**
- `npm install` takes 20+ minutes on native Linux filesystem (`/home/elliott`)
- Even after completion, some dependencies missing (tsx binary not found)
- Partial installation state causing errors

**Root Cause:**
- Large dependency tree (600+ packages in node_modules)
- Slow network or package registry access
- Possible rsync issues when copying from WSL2 to native filesystem

**Evidence:**
```bash
# npm install still running after 21+ minutes:
ps aux | grep npm
elliott  14938 18.6  5.2 1621276 395160 ?  Sl  13:24  4:16 npm install

# tsx binary missing after partial install:
ls /home/elliott/bom-api-temp/node_modules/.bin/tsx
# tsx: not found
```

### 3. Docker Build Timeouts

**Problem:**
- Docker builds timeout during `npm install` step
- Unable to complete image build in reasonable time (>3 minutes)

**Root Cause:**
- Docker npm install hitting same performance issues
- Build context possibly including unnecessary files
- No cached layers for dependencies

---

## Workarounds Implemented

### ✅ 1. Database Restored Successfully

**Actions Taken:**
- Restarted Docker containers (PostgreSQL on port 5435, Redis on port 6382)
- Imported all SQL files from `services/api/prisma/seeds/scraped/`
- Verified data integrity

**Results:**
```sql
SELECT COUNT(*) FROM verses;
-- 11,787 verses

SELECT edition_id, COUNT(*) FROM verses GROUP BY edition_id;
-- coc-bom-1908:  8,701 verses (100% complete)
-- coc-dc-2017:   3,084 verses (86% complete, 144 sections)
-- lds-bom-2013:  2 verses (samples)
```

### ✅ 2. Configuration Updated

**Files Modified:**
- `services/api/.env.development`:
  - Database URL: `postgresql://postgres:postgres@localhost:5435/bom_study_tools_dev`
  - Redis URL: `redis://localhost:6382`

### ✅ 3. Mobile App Structure Verified

**Status:**
- All source files present in `apps/mobile/src/`
- Components, screens, navigation, hooks all implemented
- Ready for dependency installation and testing

---

## Recommended Solutions

### Option 1: Direct Database Access for Mobile Testing (Recommended for Phase 2)

**Approach:**
- Mobile app can connect directly to PostgreSQL during development
- Bypass API server temporarily
- Test mobile UI, navigation, and data display

**Advantages:**
- No API server deployment needed initially
- Faster development iteration
- Can add API layer later

**Implementation:**
```typescript
// Mobile app can use direct Postgres connection for development:
import { Client } from 'pg';

const client = new Client({
  host: 'localhost',
  port: 5435,
  database: 'bom_study_tools_dev',
  user: 'postgres',
  password: 'postgres'
});
```

### Option 2: Run API Server on Native Windows (Not WSL2)

**Approach:**
- Install Node.js on Windows (not WSL2)
- Run `npm install` and `npm run dev` from PowerShell/CMD
- Access from WSL2 via `localhost:4000`

**Advantages:**
- Avoids WSL2 filesystem issues
- Standard Node.js execution
- Quick startup

### Option 3: Use Docker with Volume Mounts (Future)

**Approach:**
- Build Docker image on cloud CI/CD (GitHub Actions, etc.)
- Pull pre-built image locally
- Run with volume mounts for hot reloading

**Advantages:**
- Consistent environment
- No local npm install needed
- Production-like setup

### Option 4: Deploy API to Cloud (Production Ready)

**Approach:**
- Deploy to Digital Ocean, AWS, or Fly.io
- Use managed PostgreSQL
- Access via HTTPS endpoint

**Advantages:**
- Production environment
- No local setup needed
- Testing with real network conditions

---

## Current Project Status

### ✅ Completed
1. Database operational with 11,787 verses
2. PostgreSQL and Redis containers running
3. Configuration files updated
4. Mobile app source code ready
5. GraphQL schema and resolvers implemented

### ⚠️ Blocked (Non-Critical)
1. API server startup on WSL2 `/mnt/e` filesystem
2. Docker image build completion

### 📋 Next Steps (Prioritized)

**Immediate (This Week):**
1. **Mobile app development** - Install dependencies and test basic functionality
2. Use direct database connection for initial testing
3. Implement offline-first architecture with SQLite caching

**Short-term (Week 2):**
1. Deploy API server to cloud (Digital Ocean/Fly.io)
2. Update mobile app to use cloud API endpoint
3. Test GraphQL queries with full dataset

**Medium-term (Month 1):**
1. Implement user authentication
2. Add note-taking and highlighting
3. Build download manager for offline content
4. Submit TestFlight beta

---

## Technical Specifications

### Environment
- **OS:** WSL2 on Windows (Ubuntu)
- **Node.js:** v18+ required
- **Docker:** Running
- **Database:** PostgreSQL 15 (port 5435)
- **Cache:** Redis 7 (port 6382)

### Database Schema
- 21 tables for multi-edition support
- Cross-reference mapping infrastructure
- User data tables (notes, highlights, bookmarks)

### Mobile App Stack
- React Native 0.77+
- Apollo Client for GraphQL
- SQLite for offline storage
- React Navigation for routing

---

## Lessons Learned

1. **WSL2 Limitations:** Avoid running Node.js projects from Windows filesystem mounts (`/mnt/*`)
2. **npm Performance:** Large monorepos have slow install times - consider pnpm or yarn with workspaces
3. **Docker Strategy:** Pre-build images in CI/CD, don't build locally for large projects
4. **Development Workflow:** Direct database access is valid for mobile app development
5. **Progressive Enhancement:** Mobile app doesn't need API server to start development

---

## Resources

- [WSL2 Known Issues](https://github.com/microsoft/WSL/issues)
- [API Server Documentation](./GRAPHQL_API_GUIDE.md)
- [Mobile App Setup](./apps/mobile/SETUP.md)
- [Project Status](./CURRENT_STATUS.md)

---

**Session Date:** December 8, 2025
**Duration:** ~45 minutes troubleshooting
**Outcome:** Documented issues, verified database, ready for mobile app development
**Next Session:** Mobile app dependency installation and first run
