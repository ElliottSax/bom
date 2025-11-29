# Security Setup Guide

## Environment Variables Security

### 1. JWT Secret Generation
Generate a secure JWT secret using one of these methods:

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32

# Python
python -c "import secrets; print(secrets.token_hex(32))"
```

### 2. Database Security
- Use strong, unique passwords for database users
- Enable SSL/TLS for database connections in production
- Restrict database access to specific IP addresses
- Use connection pooling with appropriate limits

### 3. API Keys Management
- Store API keys in secure vaults (AWS Parameter Store, HashiCorp Vault)
- Rotate API keys regularly
- Use different keys for different environments
- Never commit API keys to version control

### 4. CORS Configuration
Development:
```
CORS_ORIGIN=http://localhost:3000,http://localhost:19006
```

Production:
```
CORS_ORIGIN=https://yourdomain.com,https://app.yourdomain.com
```

### 5. Rate Limiting
- Development: 1000 requests/hour
- Production: 500 requests/hour (adjust based on usage patterns)
- Implement different limits for authenticated vs unauthenticated users

## Security Headers

### Helmet.js Configuration
Add these security headers in production:

```typescript
import helmet from '@fastify/helmet';

await fastify.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});
```

## Secrets Management

### Production Deployment
1. Use AWS Parameter Store or similar for secrets
2. Load secrets at runtime, not build time
3. Implement secret rotation strategies
4. Audit secret access

### Example: AWS Parameter Store Integration
```typescript
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const ssmClient = new SSMClient({ region: "us-east-1" });

async function getSecret(name: string): Promise<string> {
  const command = new GetParameterCommand({
    Name: name,
    WithDecryption: true,
  });
  
  const response = await ssmClient.send(command);
  return response.Parameter?.Value || "";
}

// Usage
const jwtSecret = await getSecret("/bom-study-tools/prod/jwt-secret");
```

## Input Validation

### Zod Schemas
All API inputs should be validated using Zod schemas:

```typescript
import { z } from 'zod';

const userRegistrationSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100),
});
```

### File Upload Security
- Validate file types and sizes
- Scan uploaded files for malware
- Store uploads in secure locations
- Implement virus scanning

## Authentication & Authorization

### JWT Best Practices
- Use RS256 for production (asymmetric keys)
- Implement token refresh mechanisms
- Include minimal data in JWT payload
- Set appropriate expiration times

### Password Security
- Use bcrypt with cost factor 12+
- Implement account lockout after failed attempts
- Require strong passwords
- Enable 2FA for admin accounts

## Monitoring & Logging

### Security Monitoring
- Log all authentication attempts
- Monitor for suspicious patterns
- Alert on security events
- Regular security audits

### Log Security
- Never log sensitive data (passwords, API keys)
- Use structured logging with correlation IDs
- Implement log rotation and retention policies
- Secure log storage and transmission

## Regular Security Tasks

### Weekly
- [ ] Review security alerts and logs
- [ ] Check for dependency vulnerabilities
- [ ] Monitor rate limiting effectiveness

### Monthly
- [ ] Rotate API keys and secrets
- [ ] Review access controls
- [ ] Security patches application
- [ ] Penetration testing (if applicable)

### Quarterly
- [ ] Full security audit
- [ ] Review and update security policies
- [ ] Disaster recovery testing
- [ ] Security training for team

## Compliance Considerations

### GDPR/Privacy
- Implement data minimization
- Provide data export/deletion APIs
- Document data processing activities
- Implement consent mechanisms

### Accessibility
- Follow WCAG 2.1 AA guidelines
- Test with screen readers
- Ensure keyboard navigation
- Provide alternative text for images