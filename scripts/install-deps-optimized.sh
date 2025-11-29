#!/bin/bash

#############################################################
# Optimized Dependency Installation Script
# Tries multiple methods to overcome WSL2 npm timeout issues
#############################################################

set -e

PROJECT_ROOT="/mnt/e/projects/bom"
LOG_FILE="$PROJECT_ROOT/install.log"

echo "========================================="
echo "Optimized Dependency Installation"
echo "========================================="
echo ""
echo "Project: BOM Study Tools"
echo "Root: $PROJECT_ROOT"
echo "Log: $LOG_FILE"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

error() {
  echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Check if we're in WSL
check_wsl() {
  if grep -qi microsoft /proc/version; then
    warning "Running in WSL2 - npm may be slow"
    return 0
  fi
  return 1
}

# Method 1: Try pnpm (fastest)
try_pnpm() {
  log "Method 1: Trying pnpm..."

  if ! command -v pnpm &> /dev/null; then
    log "Installing pnpm globally..."
    npm install -g pnpm 2>&1 | tee -a "$LOG_FILE"
  fi

  log "Installing with pnpm..."
  cd "$PROJECT_ROOT"
  timeout 600 pnpm install 2>&1 | tee -a "$LOG_FILE"

  if [ $? -eq 0 ]; then
    success "pnpm install completed successfully!"
    return 0
  else
    error "pnpm install failed or timed out"
    return 1
  fi
}

# Method 2: Try yarn
try_yarn() {
  log "Method 2: Trying yarn..."

  if ! command -v yarn &> /dev/null; then
    log "Installing yarn globally..."
    npm install -g yarn 2>&1 | tee -a "$LOG_FILE"
  fi

  log "Installing with yarn..."
  cd "$PROJECT_ROOT"
  timeout 600 yarn install 2>&1 | tee -a "$LOG_FILE"

  if [ $? -eq 0 ]; then
    success "yarn install completed successfully!"
    return 0
  else
    error "yarn install failed or timed out"
    return 1
  fi
}

# Method 3: npm with optimizations
try_npm_optimized() {
  log "Method 3: Trying npm with optimizations..."

  cd "$PROJECT_ROOT"

  log "Configuring npm for better performance..."
  npm config set fetch-timeout 600000
  npm config set fetch-retries 3
  npm config set fetch-retry-mintimeout 10000
  npm config set fetch-retry-maxtimeout 60000
  npm config set prefer-offline true
  npm config set progress false

  log "Installing with npm..."
  timeout 600 npm install --legacy-peer-deps 2>&1 | tee -a "$LOG_FILE"

  if [ $? -eq 0 ]; then
    success "npm install completed successfully!"
    return 0
  else
    error "npm install failed or timed out"
    return 1
  fi
}

# Method 4: Install workspaces individually
try_individual_workspaces() {
  log "Method 4: Installing workspaces individually..."

  WORKSPACES=(
    "services/api"
    "apps/mobile"
    "apps/web"
    "packages/shared"
    "packages/graphql"
  )

  for workspace in "${WORKSPACES[@]}"; do
    log "Installing $workspace..."
    cd "$PROJECT_ROOT/$workspace"

    timeout 300 npm install --legacy-peer-deps 2>&1 | tee -a "$LOG_FILE"

    if [ $? -ne 0 ]; then
      error "Failed to install $workspace"
      return 1
    fi

    success "Installed $workspace"
  done

  success "All workspaces installed successfully!"
  return 0
}

# Method 5: Docker installation
try_docker() {
  log "Method 5: Trying Docker installation..."

  if ! command -v docker &> /dev/null; then
    error "Docker not installed. Skipping..."
    return 1
  fi

  cd "$PROJECT_ROOT"

  log "Building Docker image..."
  docker-compose -f docker-compose.dev.yml build api 2>&1 | tee -a "$LOG_FILE"

  if [ $? -ne 0 ]; then
    error "Docker build failed"
    return 1
  fi

  log "Installing dependencies in Docker container..."
  docker-compose -f docker-compose.dev.yml run --rm api npm install 2>&1 | tee -a "$LOG_FILE"

  if [ $? -eq 0 ]; then
    success "Docker install completed successfully!"
    return 0
  else
    error "Docker install failed"
    return 1
  fi
}

# Main execution
main() {
  log "Starting optimized dependency installation..."
  log "This may take 10-30 minutes depending on your connection..."
  echo ""

  check_wsl

  # Try each method in order
  if try_pnpm; then
    success "Installation complete via pnpm!"
    exit 0
  fi

  warning "pnpm failed, trying yarn..."
  if try_yarn; then
    success "Installation complete via yarn!"
    exit 0
  fi

  warning "yarn failed, trying optimized npm..."
  if try_npm_optimized; then
    success "Installation complete via npm!"
    exit 0
  fi

  warning "npm failed, trying individual workspace installation..."
  if try_individual_workspaces; then
    success "Installation complete via individual workspaces!"
    exit 0
  fi

  warning "Individual installation failed, trying Docker..."
  if try_docker; then
    success "Installation complete via Docker!"
    exit 0
  fi

  # All methods failed
  error "All installation methods failed!"
  echo ""
  echo "========================================="
  echo "Manual Installation Required"
  echo "========================================="
  echo ""
  echo "Please try one of these manual methods:"
  echo ""
  echo "1. Install from Windows PowerShell (not WSL):"
  echo "   cd E:\\projects\\bom"
  echo "   npm install"
  echo ""
  echo "2. Use Node Version Manager (nvm) with older Node.js:"
  echo "   nvm install 18"
  echo "   nvm use 18"
  echo "   npm install"
  echo ""
  echo "3. Clear npm cache and retry:"
  echo "   npm cache clean --force"
  echo "   npm install"
  echo ""
  echo "4. Check WSL2 configuration (~/.wslconfig):"
  echo "   [wsl2]"
  echo "   memory=8GB"
  echo "   processors=4"
  echo "   Then restart WSL: wsl --shutdown"
  echo ""

  exit 1
}

# Run main function
main
