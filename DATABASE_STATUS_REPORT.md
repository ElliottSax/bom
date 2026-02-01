# Database Status Report - BOM Study Tools

**Date:** 2026-01-28
**Project:** /mnt/e/projects/bom
**System:** WSL2 (Ubuntu on Windows)

## Current Status: DATABASE NOT RUNNING

### Summary

PostgreSQL is not currently running on this system. The database needs to be started before migrations can be executed.

## Environment Analysis

### 1. PostgreSQL Installation Status

- **psql command:** NOT FOUND
- **pg_isready command:** NOT FOUND
- **systemd service:** NOT FOUND
- **Running processes:** NONE
- **APT packages:** NOT INSTALLED

### 2. Database Configuration Found

#### Primary Connection (.env)

```
DATABASE_URL=postgresql://pod_user:pod_secure_password@localhost:5434/bom_study_tools
NODE_ENV=development
```

#### Development Connection (.env.development)

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5435/bom_study_tools_dev
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
```

### 3. Port Status

- **Port 5434:** Connection refused (not listening)
- **Port 5435:** Connection refused (not listening)
- **Port 5432:** Connection refused (not listening)

### 4. Docker Status

- **Docker command:** NOT FOUND
- **Expected container:** bom-postgres-dev (per CLAUDE.md)
- **Docker config files:** Searching...

## Migration Files Ready

### Migration: 004_coc_support

**Location:** `/mnt/e/projects/bom/services/api/prisma/migrations/004_coc_support/migration.sql`
**Status:** EXISTS
**Purpose:** Add Community of Christ support for D&C sections 114-167

**Key Changes:**

- Add `tradition` field to `doctrine_covenants_verses` table
- Add `prophet_received`, `date_received`, `conference_date` fields
- Add `controversy_notes` field
- Create `coc_study_materials` table
- Add indexes for filtering by tradition

### Seed Data: import-coc-dc-sections.sql

**Location:** `/mnt/e/projects/bom/services/api/prisma/seeds/import-coc-dc-sections.sql`
**Status:** EXISTS
**Purpose:** Import CoC-specific D&C sections 114-167
**Source:** Scraped from Centerplace.org on 2026-01-26

**Data Overview:**

- CoC-specific D&C sections (114-167)
- Contains prophet information and historical dates
- Tradition marked as 'coc' for filtering

## Database Setup Options

### Option 1: Docker Setup (Recommended per CLAUDE.md)

```bash
# Install Docker Desktop for Windows or Docker in WSL2
# Then start the container:
docker start bom-postgres-dev

# Or create new container if it doesn't exist:
docker run -d \
  --name bom-postgres-dev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=bom_study_tools_dev \
  -p 5435:5432 \
  postgres:14
```

### Option 2: Native PostgreSQL Installation (WSL2)

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo service postgresql start

# Create user and database
sudo -u postgres psql -c "CREATE USER postgres WITH PASSWORD 'postgres';"
sudo -u postgres psql -c "CREATE DATABASE bom_study_tools_dev OWNER postgres;"

# Configure to listen on port 5435
# Edit /etc/postgresql/*/main/postgresql.conf
# Change: port = 5435
sudo service postgresql restart
```

### Option 3: Windows PostgreSQL Installation

```bash
# Install PostgreSQL on Windows
# Download from: https://www.postgresql.org/download/windows/
# Configure to run on port 5435
# Connect from WSL using localhost:5435
```

## Migration Execution Plan

Once PostgreSQL is running, execute these steps:

### Step 1: Verify Connection

```bash
# Test connection (adjust port/credentials as needed)
psql -h localhost -p 5435 -U postgres -d bom_study_tools_dev -c "SELECT version();"
```

### Step 2: Run Migration

```bash
cd /mnt/e/projects/bom/services/api
psql -h localhost -p 5435 -U postgres -d bom_study_tools_dev \
  -f prisma/migrations/004_coc_support/migration.sql
```

### Step 3: Import Seed Data

```bash
psql -h localhost -p 5435 -U postgres -d bom_study_tools_dev \
  -f prisma/seeds/import-coc-dc-sections.sql
```

### Step 4: Verify Import

```bash
psql -h localhost -p 5435 -U postgres -d bom_study_tools_dev \
  -c "SELECT COUNT(*) FROM doctrine_covenants_verses WHERE tradition = 'coc';"
```

Expected result: Should return count of CoC-specific verses (sections 114-167)

### Step 5: Check Schema

```bash
psql -h localhost -p 5435 -U postgres -d bom_study_tools_dev \
  -c "\d doctrine_covenants_verses"
```

Verify new columns exist:

- tradition VARCHAR(10)
- prophet_received VARCHAR(100)
- date_received DATE
- conference_date DATE
- controversy_notes TEXT

## Project Documentation References

### From CLAUDE.md

- Default database: `bom_study_tools_dev` on port 5435
- Expected container: `bom-postgres-dev`
- Total verses: 11,787
- Editions: CoC BoM 1908 (8,701), CoC D&C 2017 (3,084)

### API Server

```bash
# Once database is running, start API:
cd /mnt/e/projects/bom/services/api
python3 server-full.py
```

## Recommended Next Steps

1. **Install Docker Desktop for Windows** OR **Install PostgreSQL in WSL2**
2. **Start PostgreSQL service** (docker or native)
3. **Verify connection** using psql
4. **Run migration** (004_coc_support/migration.sql)
5. **Import seed data** (import-coc-dc-sections.sql)
6. **Verify import** with count query
7. **Test API server** connectivity to database

## Files Checked

- `/mnt/e/projects/bom/.env.production`
- `/mnt/e/projects/bom/services/api/.env`
- `/mnt/e/projects/bom/services/api/.env.development`
- `/mnt/e/projects/bom/CLAUDE.md`
- `/mnt/e/projects/bom/services/api/prisma/migrations/004_coc_support/migration.sql`
- `/mnt/e/projects/bom/services/api/prisma/seeds/import-coc-dc-sections.sql`

## WSL2 Specific Notes

Since this is running on WSL2:

- Docker Desktop for Windows with WSL2 backend is the easiest option
- PostgreSQL can be installed natively in WSL2
- Windows PostgreSQL installation can be accessed from WSL2 via localhost
- Port forwarding should work automatically between WSL2 and Windows

## Current Blockers

1. **PostgreSQL not installed** - No psql command available
2. **Docker not available** - No docker command found
3. **No database service running** - Ports 5432, 5434, 5435 all refused

## Resolution Required

Choose ONE of the installation options above and proceed with setup before running migrations.

---

**Report Generated:** 2026-01-28
**Next Action:** Install PostgreSQL or Docker
