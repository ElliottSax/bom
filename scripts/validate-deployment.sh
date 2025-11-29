#!/bin/bash

# Pre-deployment validation script
# Ensures all secrets and configuration are properly set before deployment

set -e

# Color codes for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Validation results
ERRORS=0
WARNINGS=0

echo "🔍 Starting pre-deployment validation..."
echo ""

# Function to check for placeholder patterns
check_placeholder() {
  local file=$1
  local pattern=$2
  local description=$3

  if [ -f "$file" ]; then
    if grep -q "$pattern" "$file"; then
      echo -e "${RED}✗ ERROR:${NC} $description"
      echo "  File: $file"
      echo "  Pattern found: $pattern"
      ERRORS=$((ERRORS + 1))
      return 1
    else
      echo -e "${GREEN}✓${NC} $description"
      return 0
    fi
  else
    echo -e "${YELLOW}⚠ WARNING:${NC} File not found: $file"
    WARNINGS=$((WARNINGS + 1))
    return 0
  fi
}

# Function to check environment variable
check_env_var() {
  local var_name=$1
  local description=$2

  if [ -z "${!var_name}" ]; then
    echo -e "${RED}✗ ERROR:${NC} $description"
    echo "  Missing environment variable: $var_name"
    ERRORS=$((ERRORS + 1))
    return 1
  else
    echo -e "${GREEN}✓${NC} $description"
    return 0
  fi
}

# Function to check file exists
check_file_exists() {
  local file=$1
  local description=$2
  local is_required=$3

  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $description"
    return 0
  else
    if [ "$is_required" = "true" ]; then
      echo -e "${RED}✗ ERROR:${NC} $description"
      echo "  Missing file: $file"
      ERRORS=$((ERRORS + 1))
    else
      echo -e "${YELLOW}⚠ WARNING:${NC} $description"
      echo "  Missing file: $file"
      WARNINGS=$((WARNINGS + 1))
    fi
    return 1
  fi
}

# Check environment type
if [ -z "$NODE_ENV" ]; then
  echo -e "${YELLOW}⚠ WARNING:${NC} NODE_ENV not set, defaulting to development"
  NODE_ENV="development"
fi

echo "Environment: $NODE_ENV"
echo ""

# ===== Environment Variables =====
echo "📋 Checking Environment Variables..."
echo ""

if [ "$NODE_ENV" = "production" ]; then
  # Production environment checks
  check_env_var "JWT_SECRET" "JWT secret is set"
  check_env_var "DATABASE_URL" "Database URL is configured"
  check_env_var "REDIS_URL" "Redis URL is configured"
  check_env_var "OPENAI_API_KEY" "OpenAI API key is set"
  check_env_var "CORS_ORIGIN" "CORS origins are configured"
else
  echo -e "${YELLOW}⚠ INFO:${NC} Skipping environment variable checks for non-production environment"
fi

echo ""

# ===== Configuration Files =====
echo "📄 Checking Configuration Files..."
echo ""

# Check for placeholder patterns in .env files
if [ "$NODE_ENV" = "production" ]; then
  check_placeholder "services/api/.env.production" "REPLACE_WITH" ".env.production has no placeholder secrets"
  check_placeholder "services/api/.env.production" "EXAMPLE_" ".env.production has no example values"
fi

# Check Redis configuration
check_placeholder "redis/redis.conf" "REPLACE_WITH_REDIS_PASSWORD" "Redis password is set"

# Check PostgreSQL initialization
check_placeholder "postgres/init/01-security.sql" "REPLACE_WITH_SECURE_PASSWORD" "PostgreSQL password is set"

echo ""

# ===== Required Files =====
echo "📦 Checking Required Files..."
echo ""

check_file_exists "services/api/package-lock.json" "API package-lock.json exists" "false"
check_file_exists "apps/web/package-lock.json" "Web package-lock.json exists" "false"
check_file_exists "docker-compose.prod.yml" "Production Docker Compose file exists" "true"
check_file_exists "services/api/Dockerfile" "API Dockerfile exists" "true"

echo ""

# ===== Docker Volume Paths =====
if [ "$NODE_ENV" = "production" ]; then
  echo "💾 Checking Docker Volume Mount Paths..."
  echo ""

  VOLUME_PATHS=("/data/postgres" "/data/redis" "/data/qdrant")

  for path in "${VOLUME_PATHS[@]}"; do
    if [ -d "$path" ]; then
      echo -e "${GREEN}✓${NC} Volume mount path exists: $path"

      # Check permissions
      if [ -w "$path" ]; then
        echo -e "${GREEN}✓${NC} Volume mount path is writable: $path"
      else
        echo -e "${RED}✗ ERROR:${NC} Volume mount path is not writable: $path"
        ERRORS=$((ERRORS + 1))
      fi
    else
      echo -e "${YELLOW}⚠ WARNING:${NC} Volume mount path does not exist: $path"
      echo "  Create with: sudo mkdir -p $path && sudo chown \$USER:\$USER $path"
      WARNINGS=$((WARNINGS + 1))
    fi
  done

  echo ""
fi

# ===== Security Checks =====
echo "🔒 Checking Security Configuration..."
echo ""

# Check JWT secret strength
if [ -n "$JWT_SECRET" ]; then
  JWT_LENGTH=${#JWT_SECRET}
  if [ $JWT_LENGTH -lt 32 ]; then
    echo -e "${RED}✗ ERROR:${NC} JWT secret is too short (minimum 32 characters)"
    echo "  Current length: $JWT_LENGTH"
    ERRORS=$((ERRORS + 1))
  else
    echo -e "${GREEN}✓${NC} JWT secret meets minimum length requirement"
  fi
fi

# Check CORS configuration
if [ "$NODE_ENV" = "production" ] && [ -n "$CORS_ORIGIN" ]; then
  if echo "$CORS_ORIGIN" | grep -q "localhost"; then
    echo -e "${YELLOW}⚠ WARNING:${NC} CORS origin includes localhost in production"
    WARNINGS=$((WARNINGS + 1))
  else
    echo -e "${GREEN}✓${NC} CORS origin does not include localhost"
  fi
fi

echo ""

# ===== Summary =====
echo "================================"
echo "Validation Summary"
echo "================================"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}✓ All checks passed!${NC}"
  echo "  Deployment validation successful."
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}⚠ Validation completed with warnings${NC}"
  echo "  Errors: $ERRORS"
  echo "  Warnings: $WARNINGS"
  echo ""
  echo "  You may proceed with deployment, but please review the warnings above."
  exit 0
else
  echo -e "${RED}✗ Validation failed${NC}"
  echo "  Errors: $ERRORS"
  echo "  Warnings: $WARNINGS"
  echo ""
  echo "  Please fix the errors above before deploying to production."
  exit 1
fi
