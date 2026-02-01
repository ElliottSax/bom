#!/bin/bash
# Run BOM Study Tools Database Migration
# Executes the CoC D&C sections migration and seed data import

set -e

echo "============================================"
echo "BOM Study Tools - Migration Runner"
echo "============================================"
echo ""

# Database connection parameters
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="bom_study_tools_dev"
DB_USER="postgres"

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "✗ psql command not found"
    echo "Please install PostgreSQL or run ./setup-postgres-wsl2.sh"
    exit 1
fi

# Test database connection
echo "Testing database connection..."
if PGPASSWORD=postgres psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" &> /dev/null; then
    echo "✓ Database connection successful"
else
    echo "✗ Cannot connect to database"
    echo "Make sure PostgreSQL is running: sudo service postgresql start"
    exit 1
fi

echo ""
echo "Running migration: 004_coc_support..."
PGPASSWORD=postgres psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
    -f /mnt/e/projects/bom/services/api/prisma/migrations/004_coc_support/migration.sql

if [ $? -eq 0 ]; then
    echo "✓ Migration completed successfully"
else
    echo "✗ Migration failed"
    exit 1
fi

echo ""
echo "Importing CoC D&C sections seed data..."
PGPASSWORD=postgres psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
    -f /mnt/e/projects/bom/services/api/prisma/seeds/import-coc-dc-sections.sql

if [ $? -eq 0 ]; then
    echo "✓ Seed data imported successfully"
else
    echo "✗ Seed import failed"
    exit 1
fi

echo ""
echo "Verifying import..."
COC_COUNT=$(PGPASSWORD=postgres psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
    -tAc "SELECT COUNT(*) FROM doctrine_covenants_verses WHERE tradition = 'coc';")

echo "CoC verses imported: $COC_COUNT"

if [ "$COC_COUNT" -gt 0 ]; then
    echo "✓ Verification successful"
else
    echo "⚠ Warning: No CoC verses found"
fi

echo ""
echo "Checking schema changes..."
PGPASSWORD=postgres psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
    -c "\d doctrine_covenants_verses" | grep -E "tradition|prophet_received|date_received|conference_date"

echo ""
echo "============================================"
echo "Migration Complete!"
echo "============================================"
echo ""
echo "Summary:"
echo "- Migration: 004_coc_support ✓"
echo "- Seed data: CoC D&C sections 114-167 ✓"
echo "- CoC verses: $COC_COUNT"
echo ""
echo "Database is ready for use!"
echo ""
