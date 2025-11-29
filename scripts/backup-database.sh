#!/bin/bash

# Database Backup Script
# Run this script via cron for automated backups

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
BACKUP_DIR="/backup/bom"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE_FOLDER=$(date +%Y/%m)

# Load environment variables
if [ -f "/mnt/e/projects/bom/.env.production" ]; then
    source "/mnt/e/projects/bom/.env.production"
else
    echo -e "${RED}✗${NC} .env.production not found"
    exit 1
fi

# Create backup directory structure
BACKUP_PATH="$BACKUP_DIR/$DATE_FOLDER"
mkdir -p "$BACKUP_PATH"

echo -e "${BLUE}ℹ${NC} Starting backup at $(date)"

# Backup PostgreSQL
echo -e "${BLUE}ℹ${NC} Backing up PostgreSQL database..."
docker exec bom-postgres-prod pg_dump -U $DB_USER -Fc $DB_NAME > "$BACKUP_PATH/database_$TIMESTAMP.dump"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} PostgreSQL backup completed"

    # Compress the backup
    gzip "$BACKUP_PATH/database_$TIMESTAMP.dump"
    echo -e "${GREEN}✓${NC} Backup compressed"

    # Calculate size
    BACKUP_SIZE=$(du -h "$BACKUP_PATH/database_$TIMESTAMP.dump.gz" | cut -f1)
    echo -e "${GREEN}✓${NC} Backup size: $BACKUP_SIZE"
else
    echo -e "${RED}✗${NC} PostgreSQL backup failed"
    exit 1
fi

# Backup Redis
echo -e "${BLUE}ℹ${NC} Backing up Redis..."
docker exec bom-redis-prod redis-cli --raw SAVE > /dev/null 2>&1

if [ $? -eq 0 ]; then
    cp /data/redis/dump.rdb "$BACKUP_PATH/redis_$TIMESTAMP.rdb"
    gzip "$BACKUP_PATH/redis_$TIMESTAMP.rdb"
    echo -e "${GREEN}✓${NC} Redis backup completed"
else
    echo -e "${RED}✗${NC} Redis backup failed"
fi

# Create metadata file
cat > "$BACKUP_PATH/backup_$TIMESTAMP.json" << EOF
{
  "timestamp": "$TIMESTAMP",
  "date": "$(date -Iseconds)",
  "database": "$DB_NAME",
  "files": {
    "postgres": "database_$TIMESTAMP.dump.gz",
    "redis": "redis_$TIMESTAMP.rdb.gz"
  }
}
EOF

# Clean up old backups
echo -e "${BLUE}ℹ${NC} Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -type f -name "*.dump.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -type f -name "*.rdb.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -type f -name "*.json" -mtime +$RETENTION_DAYS -delete
echo -e "${GREEN}✓${NC} Old backups cleaned up"

# Optional: Upload to cloud storage (S3, Google Cloud Storage, etc.)
if [ ! -z "$AWS_S3_BACKUP_BUCKET" ]; then
    echo -e "${BLUE}ℹ${NC} Uploading backup to S3..."
    aws s3 sync "$BACKUP_PATH" "s3://$AWS_S3_BACKUP_BUCKET/bom-backups/$DATE_FOLDER/" --storage-class STANDARD_IA
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} Backup uploaded to S3"
    else
        echo -e "${RED}✗${NC} S3 upload failed"
    fi
fi

# Summary
echo ""
echo "================================================"
echo "  Backup Summary"
echo "================================================"
echo "  Timestamp: $TIMESTAMP"
echo "  Location: $BACKUP_PATH"
echo "  PostgreSQL: database_$TIMESTAMP.dump.gz"
echo "  Redis: redis_$TIMESTAMP.rdb.gz"
echo "================================================"
echo ""

echo -e "${GREEN}✓${NC} Backup completed successfully at $(date)"
