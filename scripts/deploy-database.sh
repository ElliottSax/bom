#!/bin/bash
#
# Deploy database to Render.com
# Usage:
#   export RENDER_DB_URL="postgresql://user:pass@host/database"
#   ./scripts/deploy-database.sh
#

set -e

if [ -z "$RENDER_DB_URL" ]; then
    echo "❌ Error: RENDER_DB_URL not set"
    echo ""
    echo "Usage:"
    echo "  1. Get your External Database URL from Render dashboard"
    echo "  2. Export it:"
    echo "     export RENDER_DB_URL='postgresql://user:pass@host/database'"
    echo "  3. Run this script:"
    echo "     ./scripts/deploy-database.sh"
    exit 1
fi

echo "🚀 Deploying database to Render.com"
echo ""

# Create temp directory for exports
mkdir -p /tmp/bom-deploy

echo "📤 Exporting schema from local database..."
docker exec bom-postgres-dev pg_dump \
  -U postgres \
  -d bom_study_tools_dev \
  --schema-only \
  > /tmp/bom-deploy/schema.sql

echo "📤 Exporting scripture data..."
docker exec bom-postgres-dev pg_dump \
  -U postgres \
  -d bom_study_tools_dev \
  --data-only \
  -t editions -t verses \
  > /tmp/bom-deploy/data.sql

echo "📥 Importing schema to Render..."
psql "$RENDER_DB_URL" < /tmp/bom-deploy/schema.sql

echo "📥 Importing scripture data to Render..."
psql "$RENDER_DB_URL" < /tmp/bom-deploy/data.sql

echo ""
echo "✅ Database deployed successfully!"
echo ""
echo "Verifying..."
VERSE_COUNT=$(psql "$RENDER_DB_URL" -t -c "SELECT COUNT(*) FROM verses;" | xargs)
EDITION_COUNT=$(psql "$RENDER_DB_URL" -t -c "SELECT COUNT(*) FROM editions;" | xargs)

echo "  📚 Editions: $EDITION_COUNT"
echo "  📖 Verses: $VERSE_COUNT"
echo ""
echo "🎉 Deployment complete!"

# Cleanup
rm -rf /tmp/bom-deploy
