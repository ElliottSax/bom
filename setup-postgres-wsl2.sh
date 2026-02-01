#!/bin/bash
# PostgreSQL Setup Script for WSL2
# BOM Study Tools - Database Setup

set -e

echo "============================================"
echo "BOM Study Tools - PostgreSQL Setup (WSL2)"
echo "============================================"
echo ""

# Check if PostgreSQL is already installed
if command -v psql &> /dev/null; then
    echo "✓ PostgreSQL is already installed"
    psql --version
    echo ""
else
    echo "Installing PostgreSQL..."
    sudo apt update
    sudo apt install -y postgresql postgresql-contrib
    echo "✓ PostgreSQL installed"
    echo ""
fi

# Start PostgreSQL service
echo "Starting PostgreSQL service..."
sudo service postgresql start
echo "✓ PostgreSQL service started"
echo ""

# Check if database already exists
DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='bom_study_tools_dev'" 2>/dev/null || echo "0")

if [ "$DB_EXISTS" = "1" ]; then
    echo "✓ Database 'bom_study_tools_dev' already exists"
else
    echo "Creating database and user..."
    
    # Create user if not exists
    sudo -u postgres psql -c "DO \$\$ BEGIN IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'postgres') THEN CREATE USER postgres WITH PASSWORD 'postgres'; END IF; END \$\$;" 2>/dev/null || true
    
    # Alter user password (in case it exists)
    sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';" 2>/dev/null || true
    
    # Create database
    sudo -u postgres psql -c "CREATE DATABASE bom_study_tools_dev OWNER postgres;" 2>/dev/null || echo "Database might already exist"
    
    echo "✓ Database created"
fi

echo ""
echo "Testing connection..."
if sudo -u postgres psql -d bom_study_tools_dev -c "SELECT version();" &> /dev/null; then
    echo "✓ Connection successful"
    sudo -u postgres psql -d bom_study_tools_dev -c "SELECT version();" | head -3
else
    echo "✗ Connection failed"
    exit 1
fi

echo ""
echo "============================================"
echo "PostgreSQL Setup Complete!"
echo "============================================"
echo ""
echo "Database: bom_study_tools_dev"
echo "User: postgres"
echo "Password: postgres"
echo "Port: 5432 (default)"
echo ""
echo "Next steps:"
echo "1. Run migration: psql -U postgres -d bom_study_tools_dev -f services/api/prisma/migrations/004_coc_support/migration.sql"
echo "2. Import seed data: psql -U postgres -d bom_study_tools_dev -f services/api/prisma/seeds/import-coc-dc-sections.sql"
echo "3. Start API server: cd services/api && python3 server-full.py"
echo ""
