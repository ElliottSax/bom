# Production Deployment - Complete Guide

## 🎯 Overview

This guide will walk you through deploying the BOM Study Tools application to production with all security, monitoring, and backup systems in place.

## 📋 Prerequisites

### Server Requirements

- **OS**: Ubuntu 20.04+ / Debian 11+ / RHEL 8+
- **CPU**: 4+ cores recommended
- **RAM**: 8GB+ recommended
- **Disk**: 50GB+ available (20GB for data, rest for backups)
- **Network**: Public IP with ports 80, 443 open

### Required Software

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose V2
sudo apt install docker-compose-v2

# Log out and back in for docker group to take effect
```

### Domain Configuration

You need:
- A registered domain name
- DNS access to create A records
- Email address for SSL certificates

## 🚀 Quick Start (Production Deployment)

### Step 1: Clone Repository

```bash
git clone https://github.com/ElliottSax/bom.git
cd bom
```

### Step 2: Configure Environment

The production secrets have been pre-generated and configured:

```bash
# Review and customize production environment
vim .env.production

# Update these values:
# - OPENAI_API_KEY: Your actual OpenAI API key
# - CORS_ORIGIN: Your actual domain(s)
# - ACME_EMAIL: Your email for SSL certificates
# - DOMAIN: Your domain name
```

### Step 3: Update Domain Configuration

Edit `.env.production`:

```bash
# Replace with your actual domains
DOMAIN=yourdomain.com
API_DOMAIN=api.yourdomain.com
APP_DOMAIN=app.yourdomain.com
ACME_EMAIL=admin@yourdomain.com
```

### Step 4: Configure DNS

Create these DNS A records pointing to your server IP:

```
yourdomain.com         -> YOUR_SERVER_IP
api.yourdomain.com     -> YOUR_SERVER_IP
app.yourdomain.com     -> YOUR_SERVER_IP
grafana.yourdomain.com -> YOUR_SERVER_IP
```

Wait for DNS propagation (can take up to 48 hours, usually minutes):

```bash
# Check DNS propagation
nslookup yourdomain.com
```

### Step 5: Run Pre-Deployment Validation

```bash
./scripts/validate-deployment.sh
```

Fix any errors before proceeding.

### Step 6: Deploy to Production

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Run deployment
./scripts/deploy-production.sh
```

The script will:
1. Validate configuration
2. Create required directories
3. Start all services
4. Wait for health checks
5. Run database migrations
6. Verify deployment

### Step 7: Verify Deployment

Check service status:

```bash
# View running containers
docker-compose -f docker-compose.prod.yml ps

# Check API health
curl https://api.yourdomain.com/health

# View logs
docker-compose -f docker-compose.prod.yml logs -f api
```

### Step 8: Set Up Monitoring

```bash
# Start monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# Access Grafana
echo "Grafana: http://localhost:3001"
echo "Username: admin"
echo "Password: (from GRAFANA_PASSWORD in .env.production)"
```

### Step 9: Configure Automated Backups

```bash
# Set up daily backups at 2 AM
./scripts/setup-cron.sh

# Test backup manually
./scripts/backup-database.sh
```

### Step 10: Configure Monitoring Alerts

Edit `monitoring/alertmanager.yml` and configure:
- SMTP settings for email alerts
- Slack/PagerDuty webhooks (optional)
- On-call email addresses

Then restart alertmanager:

```bash
docker-compose -f docker-compose.monitoring.yml restart alertmanager
```

## 🔐 Security Checklist

### Pre-Generated Secrets ✅

The following secrets have been generated and configured:
- ✅ JWT Secret: 256-bit cryptographically secure
- ✅ Database Password: 256-bit secure random
- ✅ Redis Password: 256-bit secure random
- ✅ Session Secret: 128-bit secure random

### Required Manual Configuration

- [ ] Update `OPENAI_API_KEY` in `.env.production`
- [ ] Update `CORS_ORIGIN` with your domains
- [ ] Update `ACME_EMAIL` for SSL certificates
- [ ] Configure email settings in `alertmanager.yml`
- [ ] Set Grafana admin password
- [ ] Review firewall rules

### Firewall Configuration

```bash
# Using UFW (Ubuntu/Debian)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Or using firewalld (RHEL/CentOS)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### SSL/TLS Configuration

SSL certificates are automatically managed by Traefik using Let's Encrypt.

**No manual configuration required!**

See `SSL_SETUP.md` for advanced SSL configuration options.

## 📊 Monitoring & Observability

### Access Monitoring Services

Once monitoring stack is running:

- **Grafana**: http://localhost:3001
  - Username: `admin`
  - Password: Set in `GRAFANA_PASSWORD`

- **Prometheus**: http://localhost:9090
  - Direct access to metrics and queries

- **Alertmanager**: http://localhost:9093
  - View and manage alerts

### Pre-Configured Alerts

#### Critical Alerts
- API Down (> 1 minute)
- Database Down (> 1 minute)
- Redis Down (> 1 minute)
- Low Disk Space (< 10%)

#### Warning Alerts
- High Error Rate (> 5%)
- High Response Time (> 1 second)
- High Memory Usage (> 90%)
- High CPU Usage (> 80%)
- Database Connection Saturation
- Redis Memory Pressure

### Viewing Logs

```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker-compose -f docker-compose.prod.yml logs -f api
docker-compose -f docker-compose.prod.yml logs -f postgres
docker-compose -f docker-compose.prod.yml logs -f redis

# View last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100 api
```

## 💾 Backup & Recovery

### Automated Backups

Backups run daily at 2 AM and include:
- PostgreSQL database (compressed)
- Redis data (compressed)
- Backup metadata

Retention: 30 days

Location: `/backup/bom/`

### Manual Backup

```bash
./scripts/backup-database.sh
```

### Restore from Backup

```bash
# Stop services
docker-compose -f docker-compose.prod.yml down

# Restore PostgreSQL
gunzip -c /backup/bom/YYYY/MM/database_TIMESTAMP.dump.gz | \
  docker exec -i bom-postgres-prod pg_restore -U bom_user -d bom_production

# Restore Redis
gunzip -c /backup/bom/YYYY/MM/redis_TIMESTAMP.rdb.gz > /data/redis/dump.rdb

# Start services
docker-compose -f docker-compose.prod.yml up -d
```

### Off-Site Backups

Configure S3 backup in `.env.production`:

```bash
# Add to .env.production
AWS_S3_BACKUP_BUCKET=your-backup-bucket
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
```

Backups will automatically sync to S3 after each run.

## 🔄 Updates & Maintenance

### Updating the Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
./scripts/deploy-production.sh
```

### Database Migrations

Migrations run automatically during deployment.

Manual migration:

```bash
docker exec bom-api-prod npm run db:migrate
```

### Updating Dependencies

```bash
# Update npm packages
npm install
npm audit fix

# Rebuild Docker images
docker-compose -f docker-compose.prod.yml build --no-cache
```

### Health Checks

The deployment includes comprehensive health checks:

- **Basic Health**: `GET /health`
- **Detailed Health**: `GET /health/detailed`
- **Readiness**: `GET /health/ready`
- **Liveness**: `GET /health/live`

## 🐛 Troubleshooting

### Services Won't Start

```bash
# Check container status
docker-compose -f docker-compose.prod.yml ps

# Check logs for errors
docker-compose -f docker-compose.prod.yml logs

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

### Database Connection Errors

```bash
# Check database is running
docker exec bom-postgres-prod pg_isready -U bom_user

# Check connection from API
docker exec bom-api-prod env | grep DATABASE_URL

# View database logs
docker-compose -f docker-compose.prod.yml logs postgres
```

### SSL Certificate Issues

```bash
# Check Traefik logs
docker-compose -f docker-compose.prod.yml logs traefik | grep -i acme

# Verify DNS
nslookup yourdomain.com

# Test certificate
curl -vI https://yourdomain.com
```

See `SSL_SETUP.md` for detailed SSL troubleshooting.

### High Memory Usage

```bash
# Check container resource usage
docker stats

# Increase container limits in docker-compose.prod.yml
# Then restart services
```

### Slow Performance

1. Check monitoring dashboards in Grafana
2. Review slow query logs in PostgreSQL
3. Check Redis memory usage
4. Review API response time metrics

## 📚 Additional Documentation

- **Security Setup**: `SECURITY_SETUP.md`
- **Security Fixes**: `SECURITY_FIXES_SUMMARY.md`
- **SSL Configuration**: `SSL_SETUP.md`
- **Production Deployment**: `PRODUCTION_DEPLOYMENT.md`
- **Implementation Notes**: `IMPLEMENTATION_NOTES.md`

## 🚨 Emergency Procedures

### Complete System Failure

```bash
# 1. Stop all services
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.monitoring.yml down

# 2. Check logs
docker-compose -f docker-compose.prod.yml logs > emergency-logs.txt

# 3. Restore from last good backup
# (See Backup & Recovery section)

# 4. Start services
docker-compose -f docker-compose.prod.yml up -d

# 5. Verify health
curl http://localhost:4000/health
```

### Data Corruption

```bash
# 1. Stop services immediately
docker-compose -f docker-compose.prod.yml down

# 2. Backup current state (even if corrupted)
cp -r /data/postgres /data/postgres.corrupted.$(date +%s)

# 3. Restore from last known good backup
# (See Restore from Backup section)

# 4. Restart and verify
docker-compose -f docker-compose.prod.yml up -d
```

### Security Incident

1. **Immediately** rotate all secrets:
   ```bash
   # Generate new secrets
   openssl rand -hex 32  # JWT
   openssl rand -base64 32  # DB Password
   openssl rand -base64 32  # Redis Password

   # Update .env.production
   # Update redis/redis.conf
   # Update postgres/init/01-security.sql

   # Redeploy
   ./scripts/deploy-production.sh
   ```

2. Review logs for suspicious activity
3. Check database for unauthorized changes
4. Notify users if data was compromised

## 📞 Support & Contact

- **Repository**: https://github.com/ElliottSax/bom
- **Issues**: https://github.com/ElliottSax/bom/issues
- **Email**: admin@yourdomain.com

## ✅ Production Readiness Checklist

Before going live:

- [ ] All environment variables configured
- [ ] DNS records created and propagated
- [ ] SSL certificates obtained and working
- [ ] Monitoring and alerting configured
- [ ] Automated backups set up and tested
- [ ] Firewall rules configured
- [ ] Log aggregation working
- [ ] Health checks passing
- [ ] Performance testing completed
- [ ] Security audit passed
- [ ] Disaster recovery plan documented
- [ ] Team trained on deployment procedures

## 🎉 You're Ready for Production!

Your BOM Study Tools application is now production-ready with:

✅ Enterprise-grade security
✅ Automated SSL/TLS
✅ Comprehensive monitoring
✅ Automated backups
✅ Health checks
✅ Rate limiting
✅ Input validation
✅ Error handling
✅ Structured logging

**Welcome to production! 🚀**
