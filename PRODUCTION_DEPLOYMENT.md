# Production Deployment Guide

## Security Hardening Checklist

### 🔐 Pre-Deployment Security Setup

1. **Generate Strong Secrets**
   ```bash
   # JWT Secret (256-bit)
   openssl rand -hex 32
   
   # Database password (32 characters)
   openssl rand -base64 32
   
   # Redis password (32 characters)  
   openssl rand -base64 32
   ```

2. **Configure Environment Variables**
   ```bash
   # Copy and customize
   cp .env.production .env.prod
   
   # Replace all REPLACE_WITH_* placeholders with actual values
   # Never commit .env.prod to version control
   ```

3. **Set File Permissions**
   ```bash
   chmod 600 .env.prod
   chmod 600 redis/redis.conf
   chmod 600 postgres/init/*.sql
   ```

### 🐳 Docker Security Configuration

1. **Host System Preparation**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Docker with security updates
   sudo apt install docker.io docker-compose-v2

   # Configure Docker daemon security
   sudo mkdir -p /etc/docker
   ```

2. **Create Volume Mount Directories**

   Docker volumes require host directories with proper permissions:

   ```bash
   # Create data directories for persistent storage
   sudo mkdir -p /data/postgres
   sudo mkdir -p /data/redis
   sudo mkdir -p /data/qdrant

   # Set ownership to current user (or specific Docker user)
   sudo chown -R $USER:$USER /data/postgres
   sudo chown -R $USER:$USER /data/redis
   sudo chown -R $USER:$USER /data/qdrant

   # Set secure permissions
   chmod 700 /data/postgres  # Only owner can read/write
   chmod 700 /data/redis
   chmod 700 /data/qdrant

   # Verify setup
   ls -la /data/
   ```

   **Important Notes:**
   - These paths match the volume mounts in `docker-compose.prod.yml`
   - If you change these paths, update the Docker Compose file accordingly
   - Ensure adequate disk space (minimum 20GB recommended)
   - Consider setting up automated backups for `/data/postgres`

   **For SELinux systems (RHEL/CentOS/Fedora):**
   ```bash
   # Set SELinux context for container access
   sudo chcon -Rt svirt_sandbox_file_t /data/postgres
   sudo chcon -Rt svirt_sandbox_file_t /data/redis
   sudo chcon -Rt svirt_sandbox_file_t /data/qdrant
   ```

3. **Docker Daemon Configuration** (`/etc/docker/daemon.json`)
   ```json
   {
     "log-driver": "json-file",
     "log-opts": {
       "max-size": "10m",
       "max-file": "3"
     },
     "userland-proxy": false,
     "experimental": false,
     "live-restore": true,
     "no-new-privileges": true,
     "seccomp-profile": "/etc/docker/seccomp.json"
   }
   ```

3. **Data Directory Setup**
   ```bash
   # Create secure data directories
   sudo mkdir -p /data/{postgres,redis,qdrant}
   sudo chown -R 1001:1001 /data/postgres
   sudo chown -R 999:999 /data/redis  
   sudo chown -R 1000:1000 /data/qdrant
   sudo chmod 750 /data/*
   ```

### 🚀 Deployment Process

1. **Pre-flight Checks**
   ```bash
   # Verify all secrets are configured
   ./scripts/check-secrets.sh
   
   # Test Docker builds
   docker-compose -f docker-compose.prod.yml build
   
   # Run security scans
   docker scout quickview
   ```

2. **Database Migration**
   ```bash
   # Start only database services first
   docker-compose -f docker-compose.prod.yml up -d postgres redis
   
   # Wait for services to be healthy
   docker-compose -f docker-compose.prod.yml ps
   
   # Run migrations
   docker-compose -f docker-compose.prod.yml exec api npm run db:migrate
   ```

3. **Full Deployment**
   ```bash
   # Deploy all services
   docker-compose -f docker-compose.prod.yml up -d
   
   # Verify health
   docker-compose -f docker-compose.prod.yml ps
   ./scripts/health-check.sh
   ```

### 🔍 Security Monitoring

1. **Container Security Scanning**
   ```bash
   # Scan for vulnerabilities
   docker scout cves bom-api-prod
   docker scout cves bom-web-prod
   
   # Check for updates
   docker scout recommendations
   ```

2. **Log Monitoring**
   ```bash
   # Monitor application logs
   docker-compose -f docker-compose.prod.yml logs -f api web
   
   # Monitor security events
   docker-compose -f docker-compose.prod.yml logs -f traefik postgres
   ```

3. **Resource Monitoring**
   ```bash
   # Check resource usage
   docker stats
   
   # Monitor disk usage
   df -h /data
   ```

### 🛡️ Security Best Practices

#### Network Security
- All services use internal networks except public-facing ones
- Database and cache services are not exposed externally
- Traefik handles SSL termination and security headers
- Rate limiting implemented at application and proxy levels

#### Container Security
- All containers run as non-root users
- Read-only filesystems where possible
- Resource limits configured for all services
- Security profiles (seccomp, AppArmor) applied
- Minimal base images (Alpine Linux)

#### Data Security
- Database encryption at rest (configure externally)
- Redis password protection enabled
- Secrets managed through environment variables
- Regular backup procedures implemented

#### Application Security
- Input validation on all endpoints
- CORS properly configured for production domains
- Security headers via Helmet.js
- Rate limiting and DDoS protection
- JWT tokens with appropriate expiration

### 📋 Maintenance Tasks

#### Daily
- [ ] Check container health status
- [ ] Review security logs for anomalies  
- [ ] Monitor resource utilization
- [ ] Verify backup completion

#### Weekly  
- [ ] Update container images
- [ ] Review access logs
- [ ] Test backup restoration
- [ ] Security scan containers

#### Monthly
- [ ] Rotate API keys and secrets
- [ ] Review and update security policies
- [ ] Performance optimization review
- [ ] Disaster recovery testing

### 🚨 Incident Response

1. **Security Breach Detection**
   ```bash
   # Immediately isolate affected containers
   docker-compose -f docker-compose.prod.yml stop <service>
   
   # Preserve logs for analysis
   docker-compose -f docker-compose.prod.yml logs <service> > incident-$(date +%Y%m%d).log
   
   # Review access patterns
   grep "suspicious-pattern" /var/log/traefik/access.log
   ```

2. **Service Recovery**
   ```bash
   # Rebuild from clean images
   docker-compose -f docker-compose.prod.yml build --no-cache
   
   # Restore from backup if needed
   ./scripts/restore-backup.sh <backup-date>
   
   # Gradually bring services online
   docker-compose -f docker-compose.prod.yml up -d --scale api=1
   ```

### 🔧 Troubleshooting

#### Common Issues

1. **Container Won't Start**
   ```bash
   # Check logs
   docker logs <container-name>
   
   # Verify environment variables
   docker-compose -f docker-compose.prod.yml config
   
   # Check resource availability
   docker system df
   ```

2. **Database Connection Issues**
   ```bash
   # Test connectivity
   docker-compose -f docker-compose.prod.yml exec api nc -zv postgres 5432
   
   # Check database logs
   docker-compose -f docker-compose.prod.yml logs postgres
   
   # Verify credentials
   docker-compose -f docker-compose.prod.yml exec postgres psql -U $DB_USER -d $DB_NAME -c "SELECT 1;"
   ```

3. **SSL/TLS Certificate Issues**
   ```bash
   # Check Traefik logs
   docker-compose -f docker-compose.prod.yml logs traefik
   
   # Verify certificate status
   docker-compose -f docker-compose.prod.yml exec traefik traefik version
   
   # Manual certificate renewal
   docker-compose -f docker-compose.prod.yml restart traefik
   ```

### 📞 Emergency Contacts

- **Security Team**: security@yourdomain.com
- **DevOps Team**: devops@yourdomain.com  
- **On-call Engineer**: +1-XXX-XXX-XXXX

### 📚 Additional Resources

- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [OWASP Container Security](https://owasp.org/www-project-docker-top-10/)
- [CIS Docker Benchmark](https://www.cisecurity.org/benchmark/docker)
- [Traefik Security Documentation](https://doc.traefik.io/traefik/https/acme/)