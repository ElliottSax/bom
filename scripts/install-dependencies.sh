#!/bin/bash

# Installation Helper Script for BOM Study Tools
# This script handles dependency installation with multiple fallback strategies

set -e  # Exit on error

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}BOM Study Tools - Dependency Installer${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if we're in the project root
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Must run from project root directory${NC}"
    exit 1
fi

# Function to check if a command succeeded
check_success() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Success${NC}"
        return 0
    else
        echo -e "${RED}✗ Failed${NC}"
        return 1
    fi
}

# Function to install with npm
install_with_npm() {
    echo -e "${YELLOW}Method 1: Installing with npm (legacy peer deps)...${NC}"
    npm install --legacy-peer-deps --fetch-timeout=600000 --loglevel=error
}

# Function to install with pnpm
install_with_pnpm() {
    echo -e "${YELLOW}Method 2: Installing with pnpm...${NC}"

    # Check if pnpm is installed
    if ! command -v pnpm &> /dev/null; then
        echo -e "${YELLOW}Installing pnpm globally...${NC}"
        npm install -g pnpm
    fi

    pnpm install --shamefully-hoist
}

# Function to install with yarn
install_with_yarn() {
    echo -e "${YELLOW}Method 3: Installing with yarn...${NC}"

    # Check if yarn is installed
    if ! command -v yarn &> /dev/null; then
        echo -e "${YELLOW}Installing yarn globally...${NC}"
        npm install -g yarn
    fi

    yarn install --network-timeout 600000
}

# Function to install workspaces individually
install_individually() {
    echo -e "${YELLOW}Method 4: Installing workspaces individually...${NC}"

    WORKSPACES=(
        "services/api"
        "apps/mobile"
        "apps/web"
        "packages/shared"
        "packages/graphql"
    )

    for workspace in "${WORKSPACES[@]}"; do
        if [ -d "$workspace" ]; then
            echo -e "${BLUE}Installing $workspace...${NC}"
            cd "$workspace"
            npm install --legacy-peer-deps --loglevel=error || true
            cd - > /dev/null
        fi
    done

    # Install root dependencies
    echo -e "${BLUE}Installing root dependencies...${NC}"
    npm install --legacy-peer-deps --loglevel=error
}

# Main installation logic
echo -e "${BLUE}Attempting installation...${NC}"
echo ""

# Try npm first
if install_with_npm; then
    echo ""
    echo -e "${GREEN}✓ Installation successful with npm!${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}npm failed, trying pnpm...${NC}"
echo ""

# Try pnpm
if install_with_pnpm; then
    echo ""
    echo -e "${GREEN}✓ Installation successful with pnpm!${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}pnpm failed, trying yarn...${NC}"
echo ""

# Try yarn
if install_with_yarn; then
    echo ""
    echo -e "${GREEN}✓ Installation successful with yarn!${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}yarn failed, trying individual workspace installation...${NC}"
echo ""

# Try individual installation
install_individually

# Check if node_modules exists
if [ -d "node_modules" ] && [ -d "services/api/node_modules" ]; then
    echo ""
    echo -e "${GREEN}✓ Installation completed with individual workspace method!${NC}"
    echo -e "${YELLOW}Note: Some packages may be missing. Run 'npm install' again if needed.${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}✗ All installation methods failed${NC}"
    echo ""
    echo -e "${YELLOW}Troubleshooting tips:${NC}"
    echo "1. Clear npm cache: npm cache clean --force"
    echo "2. Check network connection"
    echo "3. Try running from native Windows (not WSL)"
    echo "4. Try Docker: docker-compose -f docker-compose.dev.yml run api npm install"
    echo "5. Check .npmrc configuration"
    echo ""
    exit 1
fi
