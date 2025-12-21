#!/bin/bash
# Continuous sync script for development
# Use this to sync changes from /mnt/e to native Linux filesystem

set -e

SOURCE_DIR="/mnt/e/projects/bom"
TARGET_DIR="/home/elliott/projects/bom"

echo "🔄 Syncing changes to native Linux filesystem..."
echo ""

# Quick sync (only changed files)
rsync -av --update --delete \
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
echo "✅ Sync complete!"
echo ""
echo "Tip: To watch for changes and auto-sync, use:"
echo "  watch -n 5 $0"
echo ""
