#!/bin/bash
# Copy project from Windows mount to native Linux filesystem
# Solves WSL2 performance and execution issues

set -e

SOURCE_DIR="/mnt/e/projects/bom"
TARGET_DIR="/home/elliott/projects/bom"

echo "=============================================="
echo "Copy BOM Project to Native Linux Filesystem"
echo "=============================================="
echo ""
echo "Source: $SOURCE_DIR"
echo "Target: $TARGET_DIR"
echo ""

# Create target directory if it doesn't exist
if [ ! -d "$TARGET_DIR" ]; then
    echo "📁 Creating target directory..."
    mkdir -p "$TARGET_DIR"
    echo "✅ Directory created"
else
    echo "✅ Target directory exists"
fi
echo ""

# Confirm with user
echo "⚠️  This will sync the following:"
echo "   - All source code files"
echo "   - Configuration files"
echo "   - Database migrations"
echo ""
echo "⚠️  This will EXCLUDE:"
echo "   - node_modules/ (will reinstall)"
echo "   - dist/ build artifacts"
echo "   - .git/ (optional - can be synced)"
echo "   - venv/ Python virtual environments"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled"
    exit 1
fi

echo ""
echo "🔄 Starting rsync..."
echo ""

# Rsync with optimizations
rsync -av --progress \
    --exclude='node_modules/' \
    --exclude='dist/' \
    --exclude='build/' \
    --exclude='.next/' \
    --exclude='venv/' \
    --exclude='.turbo/' \
    --exclude='.git/' \
    --exclude='*.log' \
    --exclude='.env.local' \
    --exclude='.env.production' \
    "$SOURCE_DIR/" "$TARGET_DIR/"

echo ""
echo "✅ Rsync complete!"
echo ""

# Calculate size
SOURCE_SIZE=$(du -sh "$SOURCE_DIR" | awk '{print $1}')
TARGET_SIZE=$(du -sh "$TARGET_DIR" | awk '{print $1}')

echo "📊 Size comparison:"
echo "   Source: $SOURCE_SIZE"
echo "   Target: $TARGET_SIZE"
echo ""

# Post-sync instructions
echo "=============================================="
echo "✅ Copy Complete!"
echo "=============================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Navigate to the new directory:"
echo "   cd $TARGET_DIR"
echo ""
echo "2. Install dependencies:"
echo "   cd services/api && npm install"
echo ""
echo "3. Run the development server:"
echo "   npm run dev"
echo ""
echo "4. (Optional) Initialize Git:"
echo "   git init"
echo "   git remote add origin <your-repo-url>"
echo ""
echo "Performance improvements expected:"
echo "   - npm install: ~2-5 min (vs 20+ min on /mnt/e)"
echo "   - tsx/node: Instant startup (vs hanging on /mnt/e)"
echo "   - File watching: Works correctly"
echo "   - Build times: 2-3x faster"
echo ""
