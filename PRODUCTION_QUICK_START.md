# Production Quick Start Guide

**🚀 Deploy in 4 Steps • Estimated Time: 30 minutes**

---

## Prerequisites

- Server with Docker installed (Ubuntu 22.04 LTS recommended)
- Domain name pointing to server IP
- Email address for SSL certificates

---

## Step 1: Environment Setup (5 min)

```bash
# SSH into your server
ssh user@your-server-ip

# Clone repository
cd /opt
git clone https://github.com/your-org/bom-study-tools.git
cd bom-study-tools

# Create environment file
cp services/api/.env.production.template services/api/.env.production
nano services/api/.env.production
```

**Required Changes:**
```env
DATABASE_URL=postgresql://bom_user:GENERATE_STRONG_PASSWORD@postgres:5432/bom_production
JWT_SECRET=$(openssl rand -base64 64)  # Generate this
CORS_ORIGIN=https://yourdomain.com
OPENAI_API_KEY=sk-your-key-here  # From OpenAI
```

---

## Step 2: Build Production Image (10 min)

```bash
# Build Docker image
docker build -f services/api/Dockerfile.production -t bom-api:latest .

# Verify
docker images | grep bom-api
```

---

## Step 3: Deploy Services (10 min)

```bash
# Start all services
docker compose -f docker-compose.prod.yml up -d

# Wait for services to start
sleep 30

# Run database migrations
docker compose -f docker-compose.prod.yml run --rm api \
  npx prisma migrate deploy

# Check health
curl http://localhost:4000/health
```

---

## Step 4: Verify Deployment (5 min)

```bash
# Check all services are running
docker compose -f docker-compose.prod.yml ps

# Test API health
curl https://api.yourdomain.com/health

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

---

## ✅ Success Checklist

- [ ] All containers running (`docker ps`)
- [ ] Health check returns `{"status":"healthy"}`
- [ ] SSL certificate obtained (HTTPS works)
- [ ] Database accessible (health/detailed shows database: up)
- [ ] Redis accessible (health/detailed shows redis: up)

---

## 🔧 Common Issues

### Issue: "Cannot connect to database"
```bash
# Check database logs
docker compose -f docker-compose.prod.yml logs postgres

# Restart database
docker compose -f docker-compose.prod.yml restart postgres
```

### Issue: "SSL certificate not obtained"
```bash
# Check Traefik logs
docker compose -f docker-compose.prod.yml logs traefik

# Verify DNS
dig api.yourdomain.com
```

### Issue: "API not starting"
```bash
# Check API logs
docker compose -f docker-compose.prod.yml logs api

# Common cause: Missing environment variables
docker compose -f docker-compose.prod.yml exec api env | grep JWT_SECRET
```

---

## 📚 Full Documentation

- **Complete Guide:** `PRODUCTION_DEPLOYMENT_GUIDE.md`
- **Security Checklist:** `PRODUCTION_SECURITY_CHECKLIST.md`
- **Ready Summary:** `PRODUCTION_READY_SUMMARY.md`

---

## 🆘 Emergency Commands

```bash
# Stop all services
docker compose -f docker-compose.prod.yml down

# Restart specific service
docker compose -f docker-compose.prod.yml restart api

# View real-time logs
docker compose -f docker-compose.prod.yml logs -f api

# Backup database NOW
./scripts/backup-database.sh

# Rollback (restore from backup)
docker exec -i bom-postgres-prod psql -U bom_user -d bom_production \
  < /backups/postgres/YYYYMMDD_HHMMSS/database.sql
```

---

## 📞 Support

- **Documentation:** `docs/` directory
- **Health Check:** `https://api.yourdomain.com/health`
- **Logs:** `docker compose -f docker-compose.prod.yml logs`

---

**Status:** ✅ Ready for Production
**Last Updated:** November 29, 2025
