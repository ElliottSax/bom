# Critical Security Fixes - Immediate Action Required

## ⚠️ Issue: Hardcoded Credentials in .env.production

**Status:** ✅ NOT in git history (good!)
**Risk:** Credentials exposed on local filesystem
**Action:** Rotate ALL credentials immediately

---

## 🔧 Step 1: Rotate Exposed Credentials (URGENT)

### Database Password

```bash
# Generate new password
openssl rand -base64 32

# Update PostgreSQL
docker exec -it bom-postgres-prod psql -U postgres
ALTER USER bom_user WITH PASSWORD 'NEW_SECURE_PASSWORD_HERE';
\q
```

### Redis Password

```bash
# Generate new password
openssl rand -base64 32

# Update Redis configuration
# Edit redis.conf and restart Redis
```

### JWT Secret

```bash
# Generate new JWT secret (64 characters minimum)
openssl rand -hex 32
# Result: Use this as JWT_SECRET
```

### Session Secret

```bash
# Generate new session secret
openssl rand -hex 16
# Result: Use this as SESSION_SECRET
```

---

## 🔒 Step 2: Secure Environment Variables

### Option A: Use .env.production.secure (Recommended for now)

```bash
cd /mnt/e/projects/bom/services/api

# Backup old file
mv .env.production .env.production.OLD.DONOTUSE

# Use the secure template
cp .env.production.secure .env.production

# Set secrets via environment variables before running
export DATABASE_URL="postgresql://bom_user:NEW_PASSWORD@postgres:5432/bom_production"
export REDIS_URL="redis://:NEW_PASSWORD@redis:6379"
export JWT_SECRET="YOUR_NEW_64_CHAR_SECRET"
export SESSION_SECRET="YOUR_NEW_32_CHAR_SECRET"

# Start the API
npm start
```

### Option B: Use Secrets Manager (Production Recommended)

**AWS Secrets Manager:**

```bash
# Store secrets
aws secretsmanager create-secret \
  --name bom/production/database \
  --secret-string '{"url":"postgresql://..."}'

aws secretsmanager create-secret \
  --name bom/production/jwt \
  --secret-string '{"secret":"..."}'

# Update API to fetch from Secrets Manager
# See: https://docs.aws.amazon.com/secretsmanager/latest/userguide/retrieving-secrets.html
```

**HashiCorp Vault:**

```bash
# Store secrets
vault kv put secret/bom/production \
  database_url="postgresql://..." \
  jwt_secret="..."

# Update API to fetch from Vault
# See: https://www.vaultproject.io/docs
```

---

## 📋 Step 3: Verify Security

```bash
# Check no secrets in code
cd /mnt/e/projects/bom
grep -r "AUg70iapRWTq3DGq" . --exclude-dir=node_modules 2>/dev/null
# Should return NO results

# Check .gitignore
grep ".env.production" .gitignore
# Should show: services/api/.env.production

# Verify file not staged
git status services/api/.env.production
# Should show: not tracked or ignored
```

---

## 🛡️ Step 4: Prevent Future Issues

### Add Pre-commit Hook

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash
# Prevent committing secrets

if git diff --cached --name-only | grep -q ".env.production"; then
  echo "ERROR: Attempting to commit .env.production file!"
  echo "This file contains secrets and should NEVER be committed."
  exit 1
fi

# Check for potential secrets in code
if git diff --cached | grep -E "(password|secret|api_key|token).*=.*['\"][^'\"]{20,}['\"]"; then
  echo "WARNING: Potential secret detected in commit!"
  echo "Please review your changes carefully."
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi
```

Make it executable:

```bash
chmod +x .git/hooks/pre-commit
```

---

## ✅ Verification Checklist

- [ ] Database password rotated
- [ ] Redis password rotated
- [ ] JWT secret regenerated (64+ chars)
- [ ] Session secret regenerated
- [ ] All secrets set via environment variables
- [ ] .env.production.OLD.DONOTUSE backed up
- [ ] Verified no secrets in git history
- [ ] Pre-commit hook installed
- [ ] Tested API starts with new credentials
- [ ] Tested authentication works
- [ ] Documented where production secrets are stored

---

## 📞 Questions?

If any service fails after rotation:

1. Check environment variables are set
2. Check service can connect with new credentials
3. Restart all services: `docker-compose restart`
4. Check logs: `docker-compose logs -f api`

---

**Created:** $(date)
**Status:** 🔴 URGENT - Complete within 1 hour
