# WSL2 API Server Solutions - Implementation Guide

**Last Updated:** December 8, 2025
**Issue:** Node.js/tsx cannot execute from `/mnt/e` Windows filesystem mount on WSL2
**Status:** ✅ Three working solutions implemented and ready to use

---

## Quick Start - Choose Your Solution

### 🐍 Solution 1: Python GraphQL Server (Fastest - 3 minutes)

**Best for:** Getting started quickly, testing GraphQL queries

```bash
cd services/api
./setup-python-server.sh
./start-python-server.sh
```

**Access:** http://localhost:4000/graphql

---

### 🪟 Solution 2: Windows-Native Node.js (Best for TypeScript dev)

**Best for:** Full TypeScript support, familiar Node.js workflow

**Steps:**
1. Open PowerShell on Windows (not WSL2)
2. Navigate to project:
   ```powershell
   cd E:\projects\bom\services\api
   ```
3. Install dependencies (first time only):
   ```powershell
   npm install
   ```
4. Run simple server:
   ```powershell
   node server-simple.js
   ```

**Access:** http://localhost:4000 (from WSL2, Windows, or browser)

---

### 🐧 Solution 3: Native Linux Filesystem (Best long-term)

**Best for:** Full WSL2 performance, proper Linux development

```bash
# One-time copy (10-15 minutes)
./scripts/copy-to-native-linux.sh

# Navigate to new location
cd /home/elliott/projects/bom

# Install dependencies
cd services/api
npm install

# Run development server
npm run dev
```

**Sync changes back to Windows:**
```bash
./scripts/sync-from-native-linux.sh
```

---

### 🐳 Solution 4: Docker (Optional - Production-like)

**Best for:** Team consistency, CI/CD testing

```bash
# Build and start API in Docker
./scripts/start-api-docker.sh

# View logs
docker logs -f bom-api-dev

# Stop
docker stop bom-api-dev
```

**Access:** http://localhost:4000

---

## Detailed Comparison

| Solution | Setup Time | Hot Reload | TypeScript | GraphQL Playground | Production-like |
|----------|-----------|------------|------------|-------------------|----------------|
| Python | 3 min | ❌ No | ❌ No | ✅ Yes | ⚠️ Partial |
| Windows Node.js | 5 min | ⚠️ Manual | ✅ Yes | ✅ Yes | ⚠️ Partial |
| Native Linux | 15 min | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| Docker | 10 min | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |

---

## Performance Benchmarks

### npm install
- **WSL2 /mnt/e:** 20+ minutes ⚠️ (or hangs)
- **Windows native:** 2-5 minutes
- **Linux native:** 2-5 minutes
- **Docker (cached):** 30 seconds

### Server startup
- **WSL2 /mnt/e:** Hangs indefinitely ❌
- **Python (WSL2):** 2-3 seconds ✅
- **Windows Node.js:** 3-5 seconds ✅
- **Linux native:** 2-4 seconds ✅
- **Docker:** 5-10 seconds (after build) ✅

### File watching (hot reload)
- **WSL2 /mnt/e:** Doesn't work ❌
- **Windows Node.js:** Works ✅
- **Linux native:** Works perfectly ✅
- **Docker:** Works with volume mounts ✅

---

## Solution Details

### Solution 1: Python GraphQL Server

**Files:**
- `services/api/server-python.py` - Main server
- `services/api/setup-python-server.sh` - Setup script
- `services/api/start-python-server.sh` - Start script

**How it works:**
- Uses Strawberry GraphQL (Python framework)
- Uvicorn ASGI server
- Direct asyncpg connection to PostgreSQL
- No Node.js execution issues on WSL2

**Pros:**
- Fastest to get running
- GraphQL Playground included
- No WSL2 issues
- Simple dependencies

**Cons:**
- Different language from main codebase
- No TypeScript type safety
- No hot reload
- Need to maintain two API implementations

**Sample queries:**
```graphql
# Health check
{ health }

# List editions
{ editions { id name year } }

# Get verses
{
  verses(
    editionId: "coc-bom-1908"
    book: "I Nephi"
    chapter: 1
    limit: 5
  ) {
    verse
    text
  }
}
```

---

### Solution 2: Windows-Native Node.js

**Files:**
- `services/api/server-simple.js` - Simplified Node.js server

**How it works:**
- Run Node.js on Windows (not WSL2)
- Uses same dependencies (Apollo Server, Prisma)
- Connects to PostgreSQL on localhost:5435
- WSL2 can access via localhost

**Pros:**
- Full Node.js/TypeScript support
- GraphQL Playground
- Normal npm workflow
- Can use full API codebase

**Cons:**
- Requires Node.js installation on Windows
- Context switching between WSL2/Windows
- Manual hot reload (need to restart)

**Prerequisites:**
- Node.js 18+ installed on Windows
- PostgreSQL running in Docker (accessible from Windows)

---

### Solution 3: Native Linux Filesystem

**Files:**
- `scripts/copy-to-native-linux.sh` - Initial copy
- `scripts/sync-to-native-linux.sh` - One-way sync (Windows → Linux)
- `scripts/sync-from-native-linux.sh` - Reverse sync (Linux → Windows)

**How it works:**
- Copy entire project to `/home/elliott/projects/bom`
- Run all development from native Linux filesystem
- Use rsync to keep Windows copy in sync

**Pros:**
- Full WSL2 performance
- Hot reload works perfectly
- File watching works
- Native Linux development experience
- 10x faster npm install
- No execution issues

**Cons:**
- Separate copy from Windows filesystem
- Need to sync changes manually
- 15-minute initial copy
- Requires ~2GB disk space in WSL2

**Directory structure:**
```
/mnt/e/projects/bom/          ← Windows mount (for backup/sharing)
/home/elliott/projects/bom/   ← Active development (native Linux)
```

**Sync workflow:**
```bash
# Make changes in /home/elliott/projects/bom
cd /home/elliott/projects/bom
npm run dev

# Sync back to Windows when done
./scripts/sync-from-native-linux.sh
```

---

### Solution 4: Docker API Service

**Files:**
- `Dockerfile.api-dev` - Development Docker image
- `docker-compose.dev.yml` - Docker Compose configuration
- `scripts/start-api-docker.sh` - Helper script

**How it works:**
- Build Docker image with all dependencies
- Mount source code for hot reload
- Connect to existing PostgreSQL/Redis containers
- Run Node.js inside container (avoids WSL2 issues)

**Pros:**
- Consistent environment across team
- Production-like setup
- Hot reload works
- No local npm install needed
- CI/CD friendly

**Cons:**
- 10-minute initial build
- Requires Docker knowledge
- Slower iteration than native
- More complex debugging

**Docker Compose service:**
```yaml
api:
  build:
    context: .
    dockerfile: Dockerfile.api-dev
  ports:
    - '4000:4000'
  volumes:
    - ./services/api/src:/app/services/api/src:ro
  depends_on:
    - postgres
    - redis
```

---

## Recommended Workflow

### Week 1: Quick Start
**Use:** Python server (Solution 1)
- Get GraphQL running in 3 minutes
- Test queries with real database
- Develop mobile app UI

### Week 2: Full Development
**Use:** Native Linux filesystem (Solution 3)
- Copy project to `/home/elliott/projects/bom`
- Full TypeScript/Node.js development
- Hot reload, file watching, etc.

### Week 3+: Team/Production
**Use:** Docker (Solution 4)
- Consistent environment
- Deploy to cloud (Fly.io, Railway)
- CI/CD pipeline

---

## Troubleshooting

### Python server won't start
```bash
# Check Python version (need 3.8+)
python3 --version

# Recreate virtual environment
rm -rf venv
./setup-python-server.sh
```

### Windows Node.js can't connect to database
```powershell
# Check PostgreSQL from Windows
Test-NetConnection localhost -Port 5435

# Ensure WSL2 Docker is running
wsl docker ps | grep postgres
```

### Native Linux sync issues
```bash
# Verify rsync installed
which rsync

# Manual sync with verbose output
rsync -av /mnt/e/projects/bom/ /home/elliott/projects/bom/
```

### Docker build fails
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose -f docker-compose.dev.yml build --no-cache api
```

---

## Environment Variables

All solutions use these database connections:

```bash
# PostgreSQL
DATABASE_URL=postgresql://postgres:postgres@localhost:5435/bom_study_tools_dev

# Redis
REDIS_URL=redis://localhost:6382
```

**Note:** Docker uses internal network names:
```bash
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/bom_study_tools_dev
REDIS_URL=redis://redis:6379
```

---

## File Locations

### Scripts
- `services/api/setup-python-server.sh` - Python setup
- `services/api/start-python-server.sh` - Python start
- `scripts/copy-to-native-linux.sh` - Initial copy to Linux
- `scripts/sync-to-native-linux.sh` - Sync Windows → Linux
- `scripts/sync-from-native-linux.sh` - Sync Linux → Windows
- `scripts/start-api-docker.sh` - Docker API starter

### Servers
- `services/api/server-python.py` - Python GraphQL server
- `services/api/server-simple.js` - Simplified Node.js server
- `services/api/src/index.ts` - Full TypeScript server

### Configuration
- `Dockerfile.api-dev` - API development image
- `docker-compose.dev.yml` - Development services
- `services/api/.env.development` - Environment variables

---

## Success Metrics

After implementing, you should achieve:

- ✅ API server running (any solution)
- ✅ GraphQL Playground accessible at http://localhost:4000
- ✅ Health check responds: `{ health }` → `"OK"`
- ✅ Can query verses from database
- ✅ Mobile app can connect to API
- ✅ (Solutions 3-4) Hot reload works

---

## Next Steps

1. **Choose a solution** based on your immediate needs
2. **Test GraphQL queries** using Playground
3. **Connect mobile app** to API endpoint
4. **Migrate to better solution** if needed (e.g., Python → Native Linux)

---

## Resources

- [TROUBLESHOOTING_DEC_8.md](./TROUBLESHOOTING_DEC_8.md) - Detailed problem analysis
- [API_SERVER_WORKAROUNDS.md](./API_SERVER_WORKAROUNDS.md) - Alternative approaches
- [NEXT_SESSION_GUIDE.md](./NEXT_SESSION_GUIDE.md) - Quick reference
- [WSL2 Known Issues](https://github.com/microsoft/WSL/issues) - Microsoft WSL issue tracker

---

**Need help?** All scripts include `--help` or will prompt for confirmation before making changes.
