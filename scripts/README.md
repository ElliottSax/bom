# Development Scripts

Helper scripts for working around WSL2 filesystem limitations and managing the Book of Mormon Study Tools project.

---

## WSL2 Filesystem Solutions

### Copy to Native Linux Filesystem

**Script:** `copy-to-native-linux.sh`

**Purpose:** One-time copy of entire project from Windows mount (`/mnt/e`) to native Linux filesystem (`/home/elliott`) for full performance.

**Usage:**
```bash
./scripts/copy-to-native-linux.sh
```

**What it does:**
- Creates `/home/elliott/projects/bom/`
- Copies all source code, configs, migrations
- Excludes `node_modules/`, `dist/`, `venv/`, `.git/`
- Shows progress and size comparison
- Prompts for confirmation

**Time:** ~10-15 minutes

**After running:**
```bash
cd /home/elliott/projects/bom/services/api
npm install  # Fast on native Linux!
npm run dev  # Works perfectly
```

---

### Sync to Native Linux

**Script:** `sync-to-native-linux.sh`

**Purpose:** Quick sync of changes from Windows to Linux (after initial copy).

**Usage:**
```bash
./scripts/sync-to-native-linux.sh
```

**What it does:**
- Updates changed files only
- Faster than full copy
- Same exclusions as copy script

**Use case:** You edited files in Windows and want to sync to Linux.

**Time:** ~1-2 minutes

---

### Sync from Native Linux

**Script:** `sync-from-native-linux.sh`

**Purpose:** Sync changes FROM Linux BACK to Windows.

**Usage:**
```bash
./scripts/sync-from-native-linux.sh
```

**What it does:**
- Reverse sync (Linux → Windows)
- Prompts for confirmation
- Preserves Windows backup copy

**Use case:** You developed in Linux and want changes in Windows.

**Time:** ~1-2 minutes

---

## API Server Management

### Start API in Docker

**Script:** `start-api-docker.sh`

**Purpose:** Build and run API server in Docker container (bypasses WSL2 issues).

**Usage:**
```bash
./scripts/start-api-docker.sh
```

**What it does:**
- Checks Docker and database are running
- Builds optimized Docker image
- Starts API container
- Shows logs and endpoints

**Access:** http://localhost:4000

**View logs:**
```bash
docker logs -f bom-api-dev
```

**Stop:**
```bash
docker stop bom-api-dev
```

**Time:**
- First build: ~10 minutes
- Cached build: ~30 seconds
- Startup: ~5-10 seconds

---

## Script Locations

```
scripts/
├── README.md (this file)
├── copy-to-native-linux.sh       # Initial copy to Linux
├── sync-to-native-linux.sh       # Sync Windows → Linux
├── sync-from-native-linux.sh     # Sync Linux → Windows
└── start-api-docker.sh           # Start API in Docker

services/api/
├── setup-python-server.sh        # Setup Python GraphQL server
└── start-python-server.sh        # Start Python server
```

---

## Common Workflows

### Workflow 1: Move Development to Native Linux

**Best for:** Full TypeScript/Node.js development with hot reload

```bash
# One-time setup
./scripts/copy-to-native-linux.sh
cd /home/elliott/projects/bom/services/api
npm install

# Daily development
cd /home/elliott/projects/bom/services/api
npm run dev

# When done, sync back to Windows (optional)
cd /home/elliott/projects/bom
./scripts/sync-from-native-linux.sh
```

---

### Workflow 2: Docker Development

**Best for:** Team consistency, production-like environment

```bash
# Start API server
./scripts/start-api-docker.sh

# View logs
docker logs -f bom-api-dev

# Stop when done
docker stop bom-api-dev

# Rebuild after code changes
./scripts/start-api-docker.sh  # Rebuilds automatically
```

---

### Workflow 3: Hybrid (Windows + Linux)

**Best for:** Using Windows editor with Linux runtime

```bash
# Initial copy
./scripts/copy-to-native-linux.sh

# Edit in Windows (VSCode, etc.)
# /mnt/e/projects/bom/services/api/src/...

# Sync to Linux
./scripts/sync-to-native-linux.sh

# Run in Linux
cd /home/elliott/projects/bom/services/api
npm run dev
```

---

## Troubleshooting

### Script Permission Denied

```bash
chmod +x scripts/*.sh
chmod +x services/api/*.sh
```

---

### Rsync Not Found

```bash
sudo apt-get update && sudo apt-get install rsync
```

---

### Docker Not Running

```bash
# Check Docker status
docker info

# Start Docker Desktop on Windows
# Then retry script
```

---

### PostgreSQL Not Running

```bash
docker start bom-postgres-dev bom-redis-dev
```

---

## Performance Comparison

| Operation | /mnt/e | Native Linux | Docker |
|-----------|--------|--------------|--------|
| npm install | 20+ min | 2-5 min | 30s (cached) |
| venv create | Hangs | <5 sec | N/A |
| Server start | Hangs | 2-4 sec | 5-10 sec |
| Hot reload | ❌ | ✅ | ✅ |
| File watch | ❌ | ✅ | ✅ |

---

## Related Documentation

- [WSL2_SOLUTIONS.md](../WSL2_SOLUTIONS.md) - Complete implementation guide
- [QUICK_START.md](../QUICK_START.md) - Get API running in 5 minutes
- [WSL2_VALIDATION.md](../WSL2_VALIDATION.md) - Problem confirmation and testing
- [CURRENT_STATUS.md](../CURRENT_STATUS.md) - Project status

---

## Script Maintenance

### Testing Scripts

Before committing script changes:

```bash
# Test syntax
bash -n scripts/copy-to-native-linux.sh

# Test with dry run (if supported)
# Add --dry-run to rsync commands for testing
```

### Adding New Scripts

1. Create script in `scripts/` directory
2. Add shebang: `#!/bin/bash`
3. Add `set -e` for error handling
4. Make executable: `chmod +x scripts/newscript.sh`
5. Document in this README
6. Test thoroughly

---

## Quick Reference

```bash
# Development workflow:
./scripts/dev-start.sh                     # Start all services
./scripts/test-api.sh                      # Test API server
./scripts/dev-stop.sh                      # Stop all services

# Initial setup (choose one):
./scripts/copy-to-native-linux.sh          # Copy to Linux
./scripts/start-api-docker.sh              # Use Docker

# Ongoing sync:
./scripts/sync-to-native-linux.sh          # Windows → Linux
./scripts/sync-from-native-linux.sh        # Linux → Windows

# Python alternative:
cd services/api
./setup-python-server.sh                   # One-time setup
./start-python-server.sh                   # Start server
```

---

## New Developer Scripts (Added Dec 8, 2025)

### `dev-start.sh` - One-Command Development Startup

**Purpose:** Start all development services with health checks

**Usage:**
```bash
./scripts/dev-start.sh
```

**What it does:**
- ✅ Checks Docker is running
- ✅ Starts PostgreSQL and Redis containers
- ✅ Waits for database to be ready
- ✅ Reports verse count and service status
- ✅ Provides next steps

**Output:**
- Service status (running/not running)
- Database metrics (verse count)
- Instructions for starting API and mobile app

---

### `test-api.sh` - API Health Check Suite

**Purpose:** Test all API endpoints and queries

**Usage:**
```bash
./scripts/test-api.sh
```

**Tests:**
1. `/health` endpoint
2. GraphQL health query
3. Editions query
4. Books query
5. Verses query

**Output:**
- Test results with pass/fail
- Summary statistics
- Troubleshooting tips if failures

---

### `dev-stop.sh` - Stop Development Services

**Purpose:** Cleanly stop all running services

**Usage:**
```bash
./scripts/dev-stop.sh
```

**What it does:**
- Stops API server (server-minimal.py)
- Stops Metro bundler (React Native)
- Optionally stops database containers
- Confirms what was stopped

---

---

**Maintained by:** BOM Study Tools Team
**Last Updated:** December 8, 2025
