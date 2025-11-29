#!/bin/bash

# Setup automated backups via cron

echo "Setting up automated database backups..."
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if backup script exists
if [ ! -f "$SCRIPT_DIR/backup-database.sh" ]; then
    echo "Error: backup-database.sh not found"
    exit 1
fi

# Create cron job entry
CRON_JOB="0 2 * * * $SCRIPT_DIR/backup-database.sh >> /var/log/bom-backup.log 2>&1"

echo "The following cron job will be added:"
echo "$CRON_JOB"
echo ""
echo "This will run daily at 2:00 AM"
echo ""

read -p "Continue? (y/N) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Add to crontab
    (crontab -l 2>/dev/null | grep -v "backup-database.sh"; echo "$CRON_JOB") | crontab -

    echo "✓ Cron job added successfully"
    echo ""
    echo "Current crontab:"
    crontab -l
    echo ""
    echo "Logs will be written to: /var/log/bom-backup.log"
    echo ""
    echo "To view backup logs: tail -f /var/log/bom-backup.log"
    echo "To remove this cron job: crontab -e"
else
    echo "Setup cancelled"
fi
