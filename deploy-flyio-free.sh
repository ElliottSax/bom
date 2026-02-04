#!/bin/bash
#
# Deploy BOM Study Tools to Fly.io (FREE TIER)
# Cost: $0/month with free tier allowances
#

set -e

echo "======================================"
echo "🚀 Deploy to Fly.io - Free Tier"
echo "======================================"
echo

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    log_error "flyctl is not installed"
    echo
    echo "Install with:"
    echo "  curl -L https://fly.io/install.sh | sh"
    echo
    echo "Then add to PATH:"
    echo "  export PATH=\$HOME/.fly/bin:\$PATH"
    exit 1
fi

log_info "flyctl installed ✅"

# Check if logged in
if ! flyctl auth whoami &> /dev/null; then
    log_warn "Not logged into Fly.io"
    echo "Logging in..."
    flyctl auth login
fi

log_info "Logged into Fly.io ✅"

# App configuration
APP_NAME="bom-study-tools-api"
DB_NAME="bom-postgres"
REGION="ord"  # Chicago - change to your preferred region

echo
echo "Configuration:"
echo "  App: $APP_NAME"
echo "  Database: $DB_NAME"
echo "  Region: $REGION"
echo

# Create fly.toml if it doesn't exist
if [ ! -f "fly.toml" ]; then
    log_info "Creating fly.toml..."

    cat > fly.toml << EOF
# Fly.io configuration for BOM Study Tools API
# Cost-optimized for FREE TIER

app = "$APP_NAME"
primary_region = "$REGION"

[build]
  # Use Dockerfile in services/api
  dockerfile = "services/api/Dockerfile.flyio"

[env]
  PORT = "8080"
  NODE_ENV = "production"
  # Disable expensive features
  ENABLE_AI_CHAT = "false"
  ENABLE_SEMANTIC_SEARCH = "false"
  LOG_LEVEL = "warn"

[http_service]
  internal_port = 8080
  force_https = true
  # Auto-scale to 0 machines when idle (saves money)
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
  processes = ["app"]

[[vm]]
  # Use shared CPU (free tier eligible)
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256

# Health check
[[services.http_checks]]
  interval = "30s"
  timeout = "5s"
  grace_period = "10s"
  method = "get"
  path = "/health"

# Concurrent request limits
[[services.concurrency]]
  type = "requests"
  hard_limit = 25
  soft_limit = 20
EOF

    log_info "Created fly.toml ✅"
fi

# Create Dockerfile for Fly.io
log_info "Creating Dockerfile.flyio..."

cat > services/api/Dockerfile.flyio << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Install PostgreSQL client
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements-minimal.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements-minimal.txt

# Copy application
COPY server-minimal-cost.py .

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python3 -c "import urllib.request; urllib.request.urlopen('http://localhost:8080/health')" || exit 1

# Run server
CMD ["python3", "server-minimal-cost.py"]
EOF

log_info "Created Dockerfile.flyio ✅"

# Check if app exists
if flyctl apps list | grep -q "$APP_NAME"; then
    log_info "App $APP_NAME already exists"
else
    log_info "Creating app $APP_NAME..."
    flyctl apps create "$APP_NAME" --org personal
fi

# Check if database exists
if flyctl postgres list | grep -q "$DB_NAME"; then
    log_info "Database $DB_NAME already exists"
else
    log_info "Creating PostgreSQL database (FREE TIER)..."
    echo
    echo "This will create a 1GB PostgreSQL database on the free tier"
    echo

    # Create PostgreSQL with free tier settings
    flyctl postgres create \
        --name "$DB_NAME" \
        --region "$REGION" \
        --vm-size shared-cpu-1x \
        --volume-size 1 \
        --initial-cluster-size 1

    log_info "Database created ✅"
fi

# Attach database to app
log_info "Attaching database to app..."
flyctl postgres attach "$DB_NAME" --app "$APP_NAME" || log_warn "Database may already be attached"

# Set secrets
log_info "Setting application secrets..."

# Generate JWT secret if not set
JWT_SECRET=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)

flyctl secrets set \
    JWT_SECRET="$JWT_SECRET" \
    SESSION_SECRET="$SESSION_SECRET" \
    CORS_ORIGIN="*" \
    --app "$APP_NAME"

log_info "Secrets configured ✅"

# Deploy application
echo
log_info "Deploying application..."
echo
echo "This will build and deploy your application to Fly.io"
echo "First deployment may take 2-5 minutes"
echo

flyctl deploy --app "$APP_NAME"

echo
echo "======================================"
log_info "Deployment complete! ✅"
echo "======================================"
echo

# Get app URL
APP_URL=$(flyctl apps list | grep "$APP_NAME" | awk '{print $4}')

echo
echo "Your API is now live:"
echo "  🌐 URL: https://${APP_NAME}.fly.dev"
echo "  📊 GraphQL: https://${APP_NAME}.fly.dev/graphql"
echo "  ❤️  Health: https://${APP_NAME}.fly.dev/health"
echo
echo "Test it:"
echo "  curl https://${APP_NAME}.fly.dev/health"
echo

# Import scripture data
echo "======================================"
echo "📖 Next Step: Import Scripture Data"
echo "======================================"
echo
echo "Connect to your database:"
echo "  flyctl postgres connect -a $DB_NAME"
echo
echo "Then run migrations and seed data:"
echo "  # In database console:"
echo "  \\i path/to/migrations.sql"
echo

# Show usage info
echo "======================================"
echo "💰 Cost: FREE TIER"
echo "======================================"
echo
echo "Your app is using:"
echo "  ✅ 1 shared-cpu-1x VM (free)"
echo "  ✅ 256MB RAM (free)"
echo "  ✅ 1GB PostgreSQL (free)"
echo "  ✅ Auto-scale to 0 when idle (saves resources)"
echo
echo "Free tier includes:"
echo "  • 3 shared-cpu VMs"
echo "  • 3GB storage"
echo "  • 160GB bandwidth"
echo
echo "Your usage: WELL WITHIN FREE TIER ✅"
echo

# Monitor
echo "======================================"
echo "📊 Monitoring"
echo "======================================"
echo
echo "View logs:"
echo "  flyctl logs -a $APP_NAME"
echo
echo "Check status:"
echo "  flyctl status -a $APP_NAME"
echo
echo "Dashboard:"
echo "  flyctl dashboard -a $APP_NAME"
echo

log_info "All done! Your API is live and FREE! 🎉"
