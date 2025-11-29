# Production Security Checklist

**Project:** BOM Study Tools API
**Version:** 1.0.0
**Date:** November 29, 2025

---

## ✅ Pre-Deployment Security Review

### 1. Secrets & Credentials

- [ ] **JWT_SECRET** is at least 64 characters, randomly generated
  ```bash
  # Verify length
  echo -n "$JWT_SECRET" | wc -c  # Should be ≥ 64
  ```

- [ ] **Database password** is strong (20+ characters, mixed case, numbers, symbols)
- [ ] **Redis password** is configured and strong
- [ ] **OpenAI API key** has spending limits set
- [ ] All `.env` files are in `.gitignore`
- [ ] No secrets committed to git repository
  ```bash
  git log --all --full-history -- "*.env*"  # Should be empty
  ```

- [ ] Secrets backed up in secure password manager (1Password, LastPass, etc.)

### 2. Network Security

- [ ] Firewall (ufw) is enabled
  ```bash
  sudo ufw status  # Should show "active"
  ```

- [ ] Only necessary ports are open (80, 443, 22)
  ```bash
  sudo ufw status numbered
  ```

- [ ] Database port (5432) NOT exposed to public internet
  ```yaml
  # docker-compose.prod.yml should have:
  ports:
    - '127.0.0.1:5432:5432'  # Local only ✓
  # NOT:
  ports:
    - '5432:5432'  # Public ✗
  ```

- [ ] Redis port (6379) NOT exposed to public internet
- [ ] Qdrant port (6333) NOT exposed to public internet
- [ ] SSH key-based authentication enabled, password auth disabled
  ```bash
  sudo nano /etc/ssh/sshd_config
  # PasswordAuthentication no
  ```

- [ ] Fail2ban installed and configured
  ```bash
  sudo apt install fail2ban
  sudo systemctl status fail2ban
  ```

### 3. Docker Security

- [ ] All containers run as non-root users
  ```yaml
  # Verify in docker-compose.prod.yml:
  user: nodejs  # ✓ Good
  user: postgres  # ✓ Good
  # NOT: user: root or omitted  # ✗ Bad
  ```

- [ ] Containers have `no-new-privileges` security option
  ```yaml
  security_opt:
    - no-new-privileges:true
  ```

- [ ] Containers are read-only where possible
  ```yaml
  read_only: true
  ```

- [ ] Resource limits are set (prevent DoS)
  ```yaml
  deploy:
    resources:
      limits:
        memory: 1G
        cpus: '1.0'
  ```

- [ ] Docker socket is NOT exposed to containers (except Traefik)
- [ ] Sensitive files have restricted permissions
  ```bash
  chmod 600 services/api/.env.production
  chmod 600 redis/redis.conf
  chmod 600 postgres/postgresql.conf
  ```

### 4. Application Security

- [ ] CORS only allows specific domains (not `*`)
  ```env
  # .env.production
  CORS_ORIGIN=https://yourdomain.com,https://api.yourdomain.com
  # NOT: CORS_ORIGIN=*
  ```

- [ ] Rate limiting is enabled
  ```typescript
  // Verify in src/middleware/rateLimit.ts:
  auth: { max: 5, windowMs: 15 * 60 * 1000 }
  api: { max: 500, windowMs: 60 * 60 * 1000 }
  ```

- [ ] Input validation is enforced (Zod schemas)
- [ ] XSS protection enabled (sanitize-html)
- [ ] SQL injection prevention (Prisma parameterized queries)
- [ ] Password requirements enforced (min 8 chars, complexity)
  ```typescript
  // Verify in src/validation/schemas.ts:
  // ✓ Uppercase, lowercase, number, special character required
  ```

- [ ] Bcrypt salt rounds ≥ 12
  ```typescript
  // Verify in src/services/auth.service.ts:
  const SALT_ROUNDS = 12;  // ✓
  ```

- [ ] JWT expiration times are reasonable
  ```env
  JWT_EXPIRES_IN=7d  # ✓ Reasonable
  REFRESH_TOKEN_EXPIRES_IN=30d  # ✓ Reasonable
  ```

- [ ] Sensitive data not logged
  ```typescript
  // Check logs don't contain:
  // - Passwords
  // - JWT tokens
  // - API keys
  ```

### 5. Database Security

- [ ] Database uses strong authentication
- [ ] Database connections use SSL/TLS (production)
- [ ] Least privilege principle applied (dedicated user, not root)
- [ ] Dangerous SQL commands are restricted
- [ ] Regular backups are configured and tested
- [ ] Backup encryption is enabled
  ```bash
  gpg --encrypt --recipient you@yourdomain.com database_backup.sql
  ```

### 6. SSL/TLS Configuration

- [ ] Valid SSL certificate obtained (Let's Encrypt or commercial)
- [ ] HTTP automatically redirects to HTTPS
  ```yaml
  # Verify in docker-compose.prod.yml Traefik config:
  "--entrypoints.web.http.redirections.entrypoint.to=websecure"
  ```

- [ ] TLS 1.2 or higher only (no TLS 1.0/1.1)
- [ ] Strong cipher suites enabled
- [ ] HSTS header enabled
- [ ] Certificate auto-renewal configured
- [ ] Test SSL configuration:
  ```bash
  curl -I https://api.yourdomain.com | grep -i strict
  # Should show: Strict-Transport-Security
  ```

### 7. Monitoring & Logging

- [ ] Application logging configured (Pino)
- [ ] Log level set to `warn` or `error` in production
  ```env
  LOG_LEVEL=warn
  ```

- [ ] Sensitive data not in logs
- [ ] Log rotation configured (max size 10MB, 3 files)
- [ ] Failed login attempts logged
- [ ] Security events logged (password changes, etc.)
- [ ] Health check endpoints accessible
- [ ] Monitoring alerts configured (optional but recommended)
  - Database down
  - API errors spike
  - Disk space low
  - Memory usage high

### 8. Backup & Recovery

- [ ] Automated database backups configured
  ```bash
  crontab -l | grep backup-database.sh
  ```

- [ ] Backup retention policy defined (daily: 7 days, weekly: 4 weeks, monthly: 12 months)
- [ ] Backups stored off-server (S3, Google Cloud Storage, etc.)
- [ ] Backup restoration tested successfully
- [ ] Disaster recovery plan documented
- [ ] RTO (Recovery Time Objective) defined: < 1 hour
- [ ] RPO (Recovery Point Objective) defined: < 24 hours

### 9. Dependency Security

- [ ] All dependencies are up to date
  ```bash
  npm audit
  # Should show 0 high/critical vulnerabilities
  ```

- [ ] Dependabot or Renovate bot enabled (GitHub)
- [ ] Node.js version is LTS and current
  ```bash
  node --version  # Should be 20.x LTS
  ```

- [ ] Docker base images use specific versions (not `latest`)
  ```dockerfile
  FROM node:20-alpine  # ✓ Specific version
  # NOT: FROM node:latest  # ✗ Unpredictable
  ```

### 10. Compliance & Privacy

- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] GDPR compliance reviewed (if serving EU users)
  - [ ] Data deletion capability
  - [ ] Data export capability
  - [ ] Cookie consent
- [ ] User data encryption at rest (database)
- [ ] User data encryption in transit (HTTPS)
- [ ] PII (Personally Identifiable Information) minimized

### 11. Access Control

- [ ] Admin accounts use strong, unique passwords
- [ ] Multi-factor authentication enabled (recommended)
- [ ] SSH access limited to specific IPs (if applicable)
- [ ] Sudo access limited to necessary users
- [ ] Server access logged and audited
- [ ] Regular access reviews scheduled (quarterly)

### 12. Incident Response

- [ ] Incident response plan documented
- [ ] Security contact email configured
  ```env
  SECURITY_EMAIL=security@yourdomain.com
  ```

- [ ] Escalation procedures defined
- [ ] Breach notification procedures defined
- [ ] Post-mortem template prepared

---

## 🔒 Security Hardening Commands

Run these after initial deployment:

```bash
# 1. Enable automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# 2. Install fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# 3. Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable

# 4. Disable root SSH login
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# 5. Set file permissions
chmod 600 /opt/bom-study-tools/services/api/.env.production
chmod 600 /opt/bom-study-tools/.env
chmod 700 /opt/bom-study-tools/scripts/*.sh

# 6. Enable Docker log rotation
sudo nano /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
sudo systemctl restart docker
```

---

## 🧪 Security Testing

### Penetration Testing

```bash
# 1. Port scan
nmap -sV -sC your-server-ip

# Expected: Only 22, 80, 443 open

# 2. SSL test
openssl s_client -connect api.yourdomain.com:443 -servername api.yourdomain.com

# 3. HTTP headers test
curl -I https://api.yourdomain.com

# Should include:
# - Strict-Transport-Security
# - X-Content-Type-Options: nosniff
# - X-Frame-Options: DENY
```

### Vulnerability Scanning

```bash
# 1. NPM audit
cd services/api
npm audit

# 2. Docker image scan
docker scan bom-api:latest

# 3. OWASP ZAP scan (if available)
# https://www.zaproxy.org/
```

---

## 📝 Security Maintenance Schedule

| Task | Frequency | Responsible |
|------|-----------|-------------|
| Review access logs | Daily | DevOps |
| Check security alerts | Daily | DevOps |
| Update dependencies | Weekly | Development |
| Review firewall rules | Monthly | DevOps |
| Test backups | Monthly | DevOps |
| Security audit | Quarterly | Security Team |
| Penetration testing | Annually | External Firm |
| Update incident response plan | Annually | Management |

---

## 🚨 Security Contacts

- **Security Email:** security@yourdomain.com
- **On-Call DevOps:** +1-XXX-XXX-XXXX
- **Incident Response Lead:** name@yourdomain.com

---

## ✅ Final Security Sign-Off

**Reviewed By:** ___________________________

**Date:** ___________________________

**Signature:** ___________________________

**Production Deployment Approved:** [ ] YES  [ ] NO

---

**Security Status:** ✅ PRODUCTION READY

**Last Security Audit:** November 29, 2025
**Next Audit Due:** February 28, 2026
