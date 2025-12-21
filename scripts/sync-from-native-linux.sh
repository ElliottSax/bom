#!/bin/bash
# Reverse sync script - sync changes FROM native Linux BACK to Windows mount
# Use this when you've made changes in /home/elliott and want them in Windows

set -e

SOURCE_DIR="/home/elliott/projects/bom"
TARGET_DIR="/mnt/e/projects/bom"

echo "🔄 Syncing changes from native Linux to Windows mount..."
echo ""
echo "⚠️  This will overwrite files in: $TARGET_DIR"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled"
    exit 1
fi

# Sync back
rsync -av --update \
    --exclude='node_modules/' \
    --exclude='dist/' \
    --exclude='build/' \
    --exclude='.next/' \
    --exclude='venv/' \
    --exclude='.turbo/' \
    --exclude='.git/' \
    --exclude='*.log' \
    "$SOURCE_DIR/" "$TARGET_DIR/"

echo ""
echo "✅ Reverse sync complete!"
echo ""
