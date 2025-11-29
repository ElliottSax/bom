# Production Deployment Guide

**Project:** Book of Mormon Study Tools API
**Version:** 1.0.0
**Last Updated:** November 29, 2025

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Server Setup](#server-setup)
3. [Environment Configuration](#environment-configuration)
4. [Building Production Images](#building-production-images)
5. [Initial Deployment](#initial-deployment)
6. [SSL Certificate Setup](#ssl-certificate-setup)
7. [Database Setup](#database-setup)
8. [Monitoring & Logging](#monitoring--logging)
9. [Backup Configuration](#backup-configuration)
10. [Maintenance](#maintenance)
11. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Server Requirements

**Minimum Specifications:**
- CPU: 2 cores
- RAM: 4GB
- Disk: 50GB SSD
- OS: Ubuntu 22.04 LTS or newer

**Recommended Specifications:**
- CPU: 4 cores
- RAM: 8GB
- Disk: 100GB SSD
- OS: Ubuntu 22.04 LTS

### Software Requirements

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin

# Verify installations
docker --version
docker compose version
```

### Domain & DNS Setup

1. Point your domain's A record to your server's IP:
   ```
   api.yourdomain.com  →  Your.Server.IP.Address
   yourdomain.com      →  Your.Server.IP.Address
   ```

2. Wait for DNS propagation (usually 5-15 minutes):
   ```bash
   dig api.yourdomain.com
   ```

---

## Server Setup

### 1. Clone Repository

```bash
# Create application directory
sudo mkdir -p /opt/bom-study-tools
sudo chown $USER:$USER /opt/bom-study-tools

# Clone repository
cd /opt/bom-study-tools
git clone https://github.com/your-org/bom-study-tools.git .
git checkout main
```

### 2. Create Data Directories

```bash
# Create directories for persistent data
sudo mkdir -p /data/{postgres,redis,qdrant}
sudo chown -R $USER:$USER /data

# Create backup directory
sudo mkdir -p /backups/{postgres,redis}
sudo chown -R $USER:$USER /backups
```

### 3. Firewall Configuration

```bash
# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow SSH (if not already allowed)
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable
```

---

## Environment Configuration

### 1. Create Production Environment File

```bash
cd /opt/bom-study-tools
cp services/api/.env.production.template services/api/.env.production
```

### 2. Generate Secure Secrets

```bash
# Generate JWT secret (64 characters minimum)
openssl rand -base64 64

# Generate database password
openssl rand -base64 32

# Generate Redis password (if needed)
openssl rand -base64 32
```

### 3. Edit Environment Variables

```bash
nano services/api/.env.production
```

**Required Variables:**
```env
# Server
NODE_ENV=production
PORT=4000
HOST=0.0.0.0
LOG_LEVEL=warn

# Database
DATABASE_URL=postgresql://bom_user:SECURE_DB_PASSWORD@postgres:5432/bom_production

# Redis
REDIS_URL=redis://redis:6379

# Security
JWT_SECRET=YOUR_64_CHAR_JWT_SECRET_HERE
CORS_ORIGIN=https://yourdomain.com,https://api.yourdomain.com

# OpenAI (for AI features)
OPENAI_API_KEY=sk-your-openai-api-key

# Application
APP_URL=https://yourdomain.com
API_URL=https://api.yourdomain.com
```

### 4. Create Docker Environment File

```bash
nano .env
```

```env
# Database Credentials
DB_USER=bom_user
DB_PASSWORD=your_secure_db_password
DB_NAME=bom_production

# Let's Encrypt
ACME_EMAIL=admin@yourdomain.com

# Traefik Dashboard (optional)
TRAEFIK_DASHBOARD_USERS=admin:$$apr1$$xyz$$... # Use htpasswd to generate
```

---

## Building Production Images

### Build Multi-Stage Docker Image

```bash
cd /opt/bom-study-tools

# Build production image
docker build \
  -f services/api/Dockerfile.production \
  -t bom-api:latest \
  --build-arg NODE_ENV=production \
  .

# Verify image was built
docker images | grep bom-api
```

**Expected Output:**
```
bom-api    latest    abc123def456    2 minutes ago    250MB
```

---

## Initial Deployment

### 1. Start Infrastructure Services

```bash
cd /opt/bom-study-tools

# Start database and cache first
docker compose -f docker-compose.prod.yml up -d postgres redis qdrant

# Wait for services to be ready
sleep 30

# Check health
docker compose -f docker-compose.prod.yml ps
```

### 2. Run Database Migrations

```bash
# Generate Prisma Client
docker compose -f docker-compose.prod.yml run --rm api npx prisma generate

# Run migrations
docker compose -f docker-compose.prod.yml run --rm api npx prisma migrate deploy

# Seed initial data (optional)
docker compose -f docker-compose.prod.yml run --rm api npx prisma db seed
```

### 3. Start All Services

```bash
# Start all services
docker compose -f docker-compose.prod.yml up -d

# Check status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

### 4. Verify Deployment

```bash
# Test health endpoint
curl http://localhost:4000/health

# Expected response:
# {"status":"healthy","timestamp":"..."}

# Test detailed health
curl http://localhost:4000/health/detailed
```

---

## SSL Certificate Setup

### Automatic SSL with Let's Encrypt

Traefik is configured to automatically obtain SSL certificates:

```bash
# SSL certificates are automatically managed by Traefik
# Check certificate status
docker compose -f docker-compose.prod.yml logs traefik | grep certificate

# Certificates are stored in Docker volume: certificates
docker volume inspect bom_certificates
```

### Manual SSL Certificate (Alternative)

If using custom certificates:

```bash
# Create certificates directory
mkdir -p /opt/bom-study-tools/certificates

# Copy your certificates
cp your-domain.crt /opt/bom-study-tools/certificates/
cp your-domain.key /opt/bom-study-tools/certificates/

# Update docker-compose.prod.yml to mount certificates
```

---

## Database Setup

### Initial Data Import

```bash
# Import Book of Mormon scripture data
docker compose -f docker-compose.prod.yml run --rm api \
  node scripts/import-scriptures.js

# Verify data was imported
docker exec -it bom-postgres-prod psql -U bom_user -d bom_production \
  -c "SELECT COUNT(*) FROM verses;"
```

### Database Backups

```bash
# Manual backup
./scripts/backup-database.sh

# Set up automated backups (daily at 2 AM)
./scripts/setup-cron.sh
```

**Backup Schedule:**
- Daily: 2:00 AM UTC
- Weekly: Sunday 3:00 AM UTC
- Monthly: 1st of month 4:00 AM UTC

---

## Monitoring & Logging

### Access Logs

```bash
# View API logs
docker compose -f docker-compose.prod.yml logs -f api

# View all logs
docker compose -f docker-compose.prod.yml logs -f

# View specific service
docker compose -f docker-compose.prod.yml logs -f postgres
```

### Health Monitoring

Access health endpoints:

```bash
# Basic health
curl https://api.yourdomain.com/health

# Detailed health (includes database, Redis)
curl https://api.yourdomain.com/health/detailed

# Kubernetes-style probes
curl https://api.yourdomain.com/health/ready
curl https://api.yourdomain.com/health/live
```

### Prometheus & Grafana (Optional)

```bash
# Start monitoring stack
docker compose -f docker-compose.monitoring.yml up -d

# Access Grafana
# http://your-server-ip:3000
# Default: admin/admin (change immediately)
```

---

## Backup Configuration

### Automated Backup Setup

```bash
# Configure automated backups
chmod +x scripts/backup-database.sh
chmod +x scripts/setup-cron.sh

# Install cron job
./scripts/setup-cron.sh
```

### Manual Backup

```bash
# Create backup
./scripts/backup-database.sh

# Backups stored in: /backups/postgres/YYYYMMDD_HHMMSS/
```

### Restore from Backup

```bash
# Stop API service
docker compose -f docker-compose.prod.yml stop api

# Restore database
docker exec -i bom-postgres-prod psql -U bom_user -d bom_production \
  < /backups/postgres/20250101_020000/database.sql

# Restart services
docker compose -f docker-compose.prod.yml start api
```

---

## Maintenance

### Updating the Application

```bash
cd /opt/bom-study-tools

# 1. Backup current state
./scripts/backup-database.sh

# 2. Pull latest code
git fetch origin
git checkout main
git pull origin main

# 3. Rebuild images
docker build -f services/api/Dockerfile.production -t bom-api:latest .

# 4. Run migrations
docker compose -f docker-compose.prod.yml run --rm api npx prisma migrate deploy

# 5. Restart services (rolling update)
docker compose -f docker-compose.prod.yml up -d --no-deps api

# 6. Verify health
curl https://api.yourdomain.com/health
```

### Database Maintenance

```bash
# Vacuum database (monthly)
docker exec bom-postgres-prod psql -U bom_user -d bom_production \
  -c "VACUUM ANALYZE;"

# Check database size
docker exec bom-postgres-prod psql -U bom_user -d bom_production \
  -c "SELECT pg_size_pretty(pg_database_size('bom_production'));"

# Reindex (if performance degrades)
docker exec bom-postgres-prod psql -U bom_user -d bom_production \
  -c "REINDEX DATABASE bom_production;"
```

### Log Rotation

```bash
# Configure Docker log rotation
sudo nano /etc/docker/daemon.json
```

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

```bash
# Restart Docker
sudo systemctl restart docker
```

---

## Troubleshooting

### API Not Starting

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs api

# Common issues:
# 1. Database connection failed
docker compose -f docker-compose.prod.yml ps postgres

# 2. Environment variables incorrect
docker compose -f docker-compose.prod.yml exec api env | grep DATABASE_URL

# 3. Port already in use
sudo lsof -i :4000
```

### Database Connection Issues

```bash
# Test database connection
docker exec bom-postgres-prod pg_isready -U bom_user

# Check database logs
docker compose -f docker-compose.prod.yml logs postgres

# Restart database
docker compose -f docker-compose.prod.yml restart postgres
```

### Redis Connection Issues

```bash
# Test Redis
docker exec bom-redis-prod redis-cli ping

# Check Redis logs
docker compose -f docker-compose.prod.yml logs redis

# Restart Redis
docker compose -f docker-compose.prod.yml restart redis
```

### SSL Certificate Issues

```bash
# Check Traefik logs
docker compose -f docker-compose.prod.yml logs traefik

# Verify DNS is pointing correctly
dig api.yourdomain.com

# Check certificate status
openssl s_client -connect api.yourdomain.com:443 -servername api.yourdomain.com
```

### Performance Issues

```bash
# Check resource usage
docker stats

# Check database queries
docker exec bom-postgres-prod psql -U bom_user -d bom_production \
  -c "SELECT query, calls, total_time, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# Check Redis memory
docker exec bom-redis-prod redis-cli INFO memory
```

---

## Security Checklist

- [ ] All `.env` files use strong, unique passwords (20+ characters)
- [ ] JWT_SECRET is at least 64 characters and randomly generated
- [ ] CORS_ORIGIN only includes your actual domains
- [ ] Database is not exposed to public internet (127.0.0.1 binding)
- [ ] Redis has password authentication enabled
- [ ] Firewall (ufw) is enabled and configured
- [ ] SSL certificates are valid and auto-renewing
- [ ] Automated backups are configured and tested
- [ ] Log rotation is configured
- [ ] Security updates are scheduled
- [ ] Monitoring and alerts are configured

---

## Performance Tuning

### Database Optimization

See `postgres/postgresql.conf` for production-optimized settings.

### Redis Optimization

See `redis/redis.conf` for production-optimized settings.

### API Scaling

```bash
# Scale API horizontally (behind load balancer)
docker compose -f docker-compose.prod.yml up -d --scale api=3

# Verify
docker compose -f docker-compose.prod.yml ps
```

---

## Support & Resources

- **Documentation:** `/docs` directory
- **Health Check:** `https://api.yourdomain.com/health`
- **GraphQL Playground:** `https://api.yourdomain.com/graphql` (dev only)
- **Logs:** `docker compose -f docker-compose.prod.yml logs -f`
- **Backups:** `/backups/postgres/`

---

**Deployment Checklist:**

1. [ ] Server provisioned and configured
2. [ ] Docker and Docker Compose installed
3. [ ] Domain DNS configured
4. [ ] Environment variables set (.env.production)
5. [ ] Secrets generated (JWT, passwords)
6. [ ] Production image built
7. [ ] Database migrations run
8. [ ] Initial data seeded
9. [ ] Services started
10. [ ] Health checks passing
11. [ ] SSL certificates obtained
12. [ ] Backups configured
13. [ ] Monitoring enabled
14. [ ] Performance tested
15. [ ] Security hardened

**Status:** Ready for Production ✅

---

**Last Updated:** November 29, 2025
**Maintained By:** DevOps Team
