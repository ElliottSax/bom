# Database Setup Quick Start Guide

## Current Status

**PostgreSQL is NOT running.** You need to set it up before running migrations.

## Quick Setup (Choose ONE option)

### Option 1: Automated Setup (Recommended for WSL2)

```bash
cd /mnt/e/projects/bom
./setup-postgres-wsl2.sh
```

This script will:

- Install PostgreSQL if not present
- Start the PostgreSQL service
- Create the `bom_study_tools_dev` database
- Set up the `postgres` user with password

### Option 2: Manual Setup

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start service
sudo service postgresql start

# Create database
sudo -u postgres psql -c "CREATE DATABASE bom_study_tools_dev;"
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"
```

## Run Migration

After PostgreSQL is running:

```bash
cd /mnt/e/projects/bom
./run-migration.sh
```

This will:

1. Run the 004_coc_support migration (adds CoC D&C support)
2. Import CoC D&C sections 114-167
3. Verify the import

## Manual Migration (Alternative)

```bash
# Test connection
psql -U postgres -d bom_study_tools_dev -c "SELECT version();"

# Run migration
psql -U postgres -d bom_study_tools_dev \
  -f services/api/prisma/migrations/004_coc_support/migration.sql

# Import seed data
psql -U postgres -d bom_study_tools_dev \
  -f services/api/prisma/seeds/import-coc-dc-sections.sql

# Verify
psql -U postgres -d bom_study_tools_dev \
  -c "SELECT COUNT(*) FROM doctrine_covenants_verses WHERE tradition = 'coc';"
```

## Start API Server

After migration is complete:

```bash
cd services/api
python3 server-full.py
```

## Files Created

1. **DATABASE_STATUS_REPORT.md** - Comprehensive status report
2. **setup-postgres-wsl2.sh** - Automated PostgreSQL setup script
3. **run-migration.sh** - Automated migration runner
4. **DATABASE_SETUP_QUICKSTART.md** - This guide

## Troubleshooting

### Port 5435 vs 5432

The .env files reference port 5435, but default PostgreSQL uses 5432.

To change PostgreSQL to port 5435:

```bash
# Find config file
sudo find /etc/postgresql -name postgresql.conf

# Edit (replace version number as needed)
sudo nano /etc/postgresql/14/main/postgresql.conf

# Change line: port = 5432 to port = 5435
# Save and restart
sudo service postgresql restart
```

### Connection Issues

```bash
# Check if PostgreSQL is running
sudo service postgresql status

# Start if not running
sudo service postgresql start

# Check listening ports
sudo netstat -tlnp | grep postgres
```

### Docker Alternative

If you have Docker installed:

```bash
docker run -d \
  --name bom-postgres-dev \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=bom_study_tools_dev \
  -p 5435:5432 \
  postgres:14

# Then run migrations
./run-migration.sh
```

## What the Migration Does

### Schema Changes

- Adds `tradition` field (shared/coc/lds)
- Adds `prophet_received` field
- Adds `date_received` field
- Adds `conference_date` field
- Adds `controversy_notes` field
- Creates indexes for filtering

### Data Import

- Imports D&C sections 114-167 (Community of Christ)
- Marks them with `tradition = 'coc'`
- Includes historical metadata

## Expected Results

After successful migration:

- CoC D&C verses: ~500+ verses
- New columns visible in schema
- API can filter by tradition

## Need Help?

See **DATABASE_STATUS_REPORT.md** for detailed analysis and all available options.
