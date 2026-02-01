# Database Migration Summary - BOM Study Tools

**Date:** 2026-01-28
**Location:** /mnt/e/projects/bom

## Executive Summary

The database is **NOT CURRENTLY RUNNING**. PostgreSQL needs to be installed and started before the Community of Christ (CoC) D&C migration can be executed.

## What Was Checked

1. PostgreSQL installation status - NOT INSTALLED
2. Database service status - NOT RUNNING
3. Port availability (5432, 5434, 5435) - ALL CLOSED
4. Docker availability - NOT FOUND
5. Migration files - VERIFIED AND READY
6. Seed data files - VERIFIED AND READY

## Migration Files Ready to Execute

### 1. Schema Migration

**File:** `/mnt/e/projects/bom/services/api/prisma/migrations/004_coc_support/migration.sql`

**Purpose:** Add Community of Christ support to the database

**Changes:**

- Adds `tradition VARCHAR(10)` column (shared/coc/lds)
- Adds `prophet_received VARCHAR(100)` column
- Adds `date_received DATE` column
- Adds `conference_date DATE` column
- Adds `controversy_notes TEXT` column
- Creates index on `tradition` for filtering
- Creates `coc_study_materials` table

### 2. Seed Data Import

**File:** `/mnt/e/projects/bom/services/api/prisma/seeds/import-coc-dc-sections.sql`

**Purpose:** Import CoC-specific D&C sections 114-167

**Data:**

- Scraped from Centerplace.org
- Date: 2026-01-26
- Sections: 114-167 (CoC-specific revelations)
- Includes historical metadata

## Setup Scripts Created

### 1. Database Setup Script

**File:** `/mnt/e/projects/bom/setup-postgres-wsl2.sh`

**Usage:** `./setup-postgres-wsl2.sh`

**Actions:**

- Installs PostgreSQL on WSL2
- Starts PostgreSQL service
- Creates database `bom_study_tools_dev`
- Sets up user credentials

### 2. Migration Runner Script

**File:** `/mnt/e/projects/bom/run-migration.sh`

**Usage:** `./run-migration.sh`

**Actions:**

- Tests database connection
- Runs schema migration
- Imports seed data
- Verifies import
- Shows verse count

### 3. Documentation Created

- **DATABASE_STATUS_REPORT.md** - Comprehensive analysis
- **DATABASE_SETUP_QUICKSTART.md** - Quick start guide
- **DATABASE_MIGRATION_SUMMARY.md** - This file

## Recommended Workflow

```bash
# Step 1: Set up PostgreSQL
cd /mnt/e/projects/bom
./setup-postgres-wsl2.sh

# Step 2: Run migration
./run-migration.sh

# Step 3: Start API server
cd services/api
python3 server-full.py

# Step 4: Test the migration
# Visit: http://localhost:4000/graphql
# Query: { editions { id name } }
```

## Alternative: Manual Setup

If you prefer manual control:

```bash
# Install PostgreSQL
sudo apt update && sudo apt install postgresql postgresql-contrib

# Start service
sudo service postgresql start

# Create database
sudo -u postgres createdb bom_study_tools_dev

# Run migration manually
psql -U postgres -d bom_study_tools_dev \
  -f services/api/prisma/migrations/004_coc_support/migration.sql

# Import seed data
psql -U postgres -d bom_study_tools_dev \
  -f services/api/prisma/seeds/import-coc-dc-sections.sql

# Verify
psql -U postgres -d bom_study_tools_dev \
  -c "SELECT COUNT(*) FROM doctrine_covenants_verses WHERE tradition = 'coc';"
```

## Configuration Files

### Current Database URLs

**Primary (.env):**

```
postgresql://pod_user:pod_secure_password@localhost:5434/bom_study_tools
```

**Development (.env.development):**

```
postgresql://postgres:postgres@localhost:5435/bom_study_tools_dev
```

**Note:** Default PostgreSQL uses port 5432. See DATABASE_SETUP_QUICKSTART.md for port configuration.

## Expected Outcomes

After successful migration:

- **New columns** in `doctrine_covenants_verses` table
- **CoC D&C sections** 114-167 imported
- **Tradition filter** available ('shared', 'coc', 'lds')
- **Historical metadata** preserved
- **API queries** can filter by tradition

## Verification Query

```sql
-- Check CoC verses imported
SELECT
    tradition,
    COUNT(*) as verse_count
FROM doctrine_covenants_verses
GROUP BY tradition;

-- View sample CoC verse
SELECT
    section,
    verse,
    prophet_received,
    date_received
FROM doctrine_covenants_verses
WHERE tradition = 'coc'
LIMIT 1;
```

## Database Statistics (After Migration)

Expected totals:

- **Total verses:** 11,787+ (adding CoC D&C sections)
- **CoC BoM 1908:** 8,701 verses
- **CoC D&C 2017:** 3,084 verses
- **CoC D&C 114-167:** ~500+ new verses

## Next Steps

1. Choose a setup method (automated or manual)
2. Install and start PostgreSQL
3. Run the migration
4. Verify the import
5. Update API server if needed
6. Test GraphQL queries with tradition filter

## Support Files

All files are located in `/mnt/e/projects/bom/`:

- `setup-postgres-wsl2.sh` - Automated setup
- `run-migration.sh` - Automated migration
- `DATABASE_STATUS_REPORT.md` - Detailed analysis
- `DATABASE_SETUP_QUICKSTART.md` - Quick reference
- `DATABASE_MIGRATION_SUMMARY.md` - This summary

## Docker Alternative

If Docker is available:

```bash
# Start PostgreSQL container
docker run -d \
  --name bom-postgres-dev \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=bom_study_tools_dev \
  -p 5435:5432 \
  postgres:14

# Wait a few seconds, then run migration
./run-migration.sh
```

## Troubleshooting

**PostgreSQL won't start:**

```bash
sudo service postgresql status
sudo service postgresql start
```

**Connection refused:**

```bash
# Check if service is listening
sudo netstat -tlnp | grep postgres

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*-main.log
```

**Permission denied:**

```bash
# Ensure postgres user has access
sudo -u postgres psql
```

## Contact & Resources

- Project location: `/mnt/e/projects/bom`
- Migration files: `services/api/prisma/migrations/004_coc_support/`
- Seed files: `services/api/prisma/seeds/`
- Documentation: `CLAUDE.md`

---

**Report Generated:** 2026-01-28  
**Status:** Ready for PostgreSQL installation and migration execution
