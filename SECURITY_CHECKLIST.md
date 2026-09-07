# Security Deployment Checklist

Quick reference checklist for security verification before deployment.

## Pre-Deployment Checklist

### Environment Variables

- [ ] `.env` files are NOT committed to git
- [ ] `.env.production` created with actual values
- [ ] `JWT_SECRET` is strong random value (min 32 chars)
  ```bash
  openssl rand -base64 32
  ```
- [ ] Different secrets for dev/staging/production
- [ ] `DATABASE_URL` uses strong password
- [ ] `REDIS_URL` configured (for production)
- [ ] `CORS_ORIGIN` set to actual production domains
  ```bash
  CORS_ORIGIN=https://bomstudytools.org,https://app.bomstudytools.org
  ```

### Dependencies

- [ ] Run `npm audit` and fix critical/high vulnerabilities
  ```bash
  npm audit
  npm audit fix
  ```
- [ ] All dependencies up to date
  ```bash
  npm outdated
  ```
- [ ] No known security vulnerabilities

### SSL/TLS

- [ ] SSL certificates installed
- [ ] HTTPS enforced
- [ ] Certificate auto-renewal configured
- [ ] Test SSL configuration: https://www.ssllabs.com/ssltest/

### Database

- [ ] Database password changed from default
- [ ] Database accessible only from application server
- [ ] SSL/TLS enabled for database connections
- [ ] Regular backups configured
- [ ] Backup restoration tested

### Firewall

- [ ] Database port (5432) not publicly accessible
- [ ] Redis port (6379) not publicly accessible
- [ ] Only necessary ports open (80, 443)
- [ ] SSH access restricted to specific IPs (if applicable)

### API Configuration

- [ ] `NODE_ENV=production` set
- [ ] Rate limiting enabled and tested
- [ ] CORS tested with actual domains
- [ ] GraphQL introspection disabled
  ```typescript
  // In production GraphQL config
  introspection: process.env.NODE_ENV !== 'production';
  ```

## Post-Deployment Verification

### Functionality Tests

- [ ] User registration works
- [ ] User login works
- [ ] JWT token authentication works
- [ ] Rate limiting blocks excessive requests
- [ ] CORS blocks unauthorized origins
- [ ] Account deletion works (GDPR)

### Security Tests

- [ ] Try SQL injection attack (should be blocked)
  ```
  Test: ' OR '1'='1
  Expected: Rejected by validation
  ```
- [ ] Try XSS attack (should be sanitized)
  ```
  Test: <script>alert('xss')</script>
  Expected: HTML escaped or sanitized
  ```
- [ ] Try accessing API without token (should return 401)
- [ ] Try CORS from unauthorized origin (should be blocked)
- [ ] Try exceeding rate limit (should return 429)
- [ ] Try weak password (should be rejected)
- [ ] Verify error messages don't leak information

### Monitoring Setup

- [ ] Error monitoring configured (Sentry)
- [ ] Logging working correctly
- [ ] Alerts configured for critical errors
- [ ] Performance monitoring setup
- [ ] Uptime monitoring enabled

### Documentation

- [ ] Security contacts updated in SECURITY.md
- [ ] Incident response plan documented
- [ ] Team trained on security procedures
- [ ] Runbook for security incidents created

## Ongoing Security Maintenance

### Weekly

- [ ] Review error logs
- [ ] Check for failed login attempts
- [ ] Monitor rate limit violations

### Monthly

- [ ] Run `npm audit`
- [ ] Update dependencies
- [ ] Review access logs
- [ ] Check for unusual activity

### Quarterly

- [ ] Rotate JWT secrets
- [ ] Rotate database credentials
- [ ] Security audit review
- [ ] Penetration testing
- [ ] Update security documentation

### Annually

- [ ] Comprehensive security audit
- [ ] Disaster recovery test
- [ ] Security training for team
- [ ] Review and update security policies

## Emergency Procedures

### In Case of Security Breach

1. **Immediate Actions**
   - [ ] Identify and isolate affected systems
   - [ ] Preserve logs and evidence
   - [ ] Notify security team
   - [ ] Change all credentials

2. **Investigation**
   - [ ] Determine scope of breach
   - [ ] Identify compromised data
   - [ ] Document timeline of events
   - [ ] Identify vulnerability exploited

3. **Remediation**
   - [ ] Patch vulnerability
   - [ ] Reset all user passwords (if needed)
   - [ ] Revoke all tokens
   - [ ] Deploy security fixes

4. **Communication**
   - [ ] Notify affected users
   - [ ] Report to authorities (if required)
   - [ ] Update stakeholders
   - [ ] Public disclosure (if required)

5. **Post-Mortem**
   - [ ] Document lessons learned
   - [ ] Update security procedures
   - [ ] Implement additional safeguards
   - [ ] Schedule follow-up review

## Quick Security Commands

```bash
# Check for secrets in git history
git log --all --full-history -- "*.env" "*.env.production"

# Audit npm dependencies
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Check outdated packages
npm outdated

# Generate strong secret
openssl rand -base64 32

# Test CORS
curl -H "Origin: https://evil.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS https://api.bomstudytools.org/graphql

# Test rate limiting
for i in {1..10}; do curl https://api.bomstudytools.org/graphql; done

# Check SSL certificate
openssl s_client -connect bomstudytools.org:443 -servername bomstudytools.org

# Test authentication
curl -X POST https://api.bomstudytools.org/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { me { id } }"}'
# Should return 401 without Authorization header
```

## Security Contacts

- **Security Issues:** [Your email]
- **Emergency Contact:** [On-call phone]
- **Team Lead:** [Lead developer]

## Resources

- **SECURITY.md** - Comprehensive security documentation
- **SECURITY_IMPROVEMENTS.md** - Audit report and recommendations
- **.env.example** - Environment variable template
- **Incident Response Plan** - [Link to plan]

---

**Last Updated:** 2026-02-24
**Owner:** Development Team
**Review Frequency:** Quarterly
