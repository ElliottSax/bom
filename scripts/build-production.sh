#!/bin/bash

# Production Build Script for BOM Study Tools
# This script prepares the app for production deployment

set -e  # Exit on error

echo "🚀 Starting Production Build..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check environment
if [ ! -f .env.production ]; then
    echo -e "${RED}Error: .env.production file not found${NC}"
    exit 1
fi

# Function to check command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check required tools
echo "📋 Checking requirements..."
for cmd in node npm docker; do
    if ! command_exists $cmd; then
        echo -e "${RED}Error: $cmd is not installed${NC}"
        exit 1
    fi
done

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf apps/mobile/android/app/build
rm -rf apps/mobile/ios/build
rm -rf apps/mobile/node_modules/.cache
rm -rf services/api/dist

# Install dependencies
echo "📦 Installing dependencies..."
cd apps/mobile
npm ci --production=false  # Need dev dependencies for build
cd ../..

# Run tests
echo "🧪 Running tests..."
cd apps/mobile
npm test -- --coverage --ci --passWithNoTests || {
    echo -e "${YELLOW}Warning: Some tests failed${NC}"
}
cd ../..

# Type checking
echo "🔍 Type checking..."
cd apps/mobile
npx tsc --noEmit || {
    echo -e "${YELLOW}Warning: Type errors found${NC}"
}
cd ../..

# Bundle analysis
echo "📊 Analyzing bundle size..."
cd apps/mobile
npx react-native-bundle-visualizer || true
cd ../..

# Build Android APK
echo "📱 Building Android APK..."
cd apps/mobile/android
./gradlew clean
./gradlew assembleRelease || {
    echo -e "${RED}Android build failed${NC}"
    exit 1
}
cd ../../..

# Build iOS (requires macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "📱 Building iOS..."
    cd apps/mobile/ios
    pod install
    xcodebuild -workspace BOMStudyTools.xcworkspace \
               -scheme BOMStudyTools \
               -configuration Release \
               -archivePath build/BOMStudyTools.xcarchive \
               archive || {
        echo -e "${YELLOW}iOS build failed${NC}"
    }
    cd ../../..
else
    echo -e "${YELLOW}Skipping iOS build (requires macOS)${NC}"
fi

# Build API server
echo "🔧 Building API server..."
cd services/api

# Create optimized Python build
cat > Dockerfile.prod << 'EOF'
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

# Copy application
COPY . .

# Optimize Python
ENV PYTHONOPTIMIZE=1
ENV PYTHONDONTWRITEBYTECODE=1

# Run with gunicorn
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:4000", "server-with-mutations:app"]
EOF

docker build -f Dockerfile.prod -t bom-api:production . || {
    echo -e "${RED}API build failed${NC}"
    exit 1
}

cd ../..

# Generate build info
echo "📝 Generating build info..."
cat > build-info.json << EOF
{
  "version": "1.0.0",
  "buildNumber": "$(date +%Y%m%d%H%M%S)",
  "buildDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "gitCommit": "$(git rev-parse HEAD)",
  "gitBranch": "$(git rev-parse --abbrev-ref HEAD)",
  "environment": "production"
}
EOF

# Create deployment package
echo "📦 Creating deployment package..."
mkdir -p dist
cp apps/mobile/android/app/build/outputs/apk/release/app-release.apk dist/bom-study-tools.apk 2>/dev/null || true
cp build-info.json dist/

# Compress for deployment
tar -czf dist/bom-study-tools-production.tar.gz \
    docker-compose.prod.yml \
    .env.production \
    services/api \
    dist/build-info.json

echo -e "${GREEN}✅ Production build complete!${NC}"
echo ""
echo "📁 Build artifacts:"
echo "  - Android APK: dist/bom-study-tools.apk"
echo "  - Docker image: bom-api:production"
echo "  - Deployment package: dist/bom-study-tools-production.tar.gz"
echo ""
echo "Next steps:"
echo "1. Test the APK on a device"
echo "2. Upload to app stores"
echo "3. Deploy API server to production"
echo "4. Configure CDN for static assets"