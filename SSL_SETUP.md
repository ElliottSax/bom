# SSL/TLS Certificate Setup Guide

## Overview

This guide covers setting up SSL/TLS certificates for production deployment using Let's Encrypt with automatic renewal.

## Prerequisites

- Domain name configured and pointing to your server
- Ports 80 and 443 open on your firewall
- Docker and Docker Compose installed

## Option 1: Automatic SSL with Traefik (Recommended)

Traefik is already configured in `docker-compose.prod.yml` to automatically obtain and renew SSL certificates from Let's Encrypt.

### Step 1: Update Configuration

Edit `.env.production` and set your domains:

```bash
# Domain Configuration
DOMAIN=yourdomain.com
API_DOMAIN=api.yourdomain.com
APP_DOMAIN=app.yourdomain.com

# SSL/TLS Email for Let's Encrypt
ACME_EMAIL=admin@yourdomain.com
```

### Step 2: DNS Configuration

Ensure your DNS records point to your server:

```
A     yourdomain.com         -> YOUR_SERVER_IP
A     api.yourdomain.com     -> YOUR_SERVER_IP
A     app.yourdomain.com     -> YOUR_SERVER_IP
A     grafana.yourdomain.com -> YOUR_SERVER_IP
```

### Step 3: Deploy with SSL

Run the deployment script:

```bash
./scripts/deploy-production.sh
```

Traefik will automatically:
1. Request SSL certificates from Let's Encrypt
2. Store them in the `certificates` volume
3. Automatically renew them before expiration
4. Handle all HTTPS traffic

### Step 4: Verify SSL

Check that SSL is working:

```bash
curl -I https://api.yourdomain.com/health
curl -I https://yourdomain.com
```

You should see `200 OK` responses with valid SSL certificates.

### Certificate Storage

Certificates are stored in:
- **Docker Volume**: `certificates` volume (managed by Docker)
- **File Location**: `/var/lib/docker/volumes/bom_certificates/_data/acme.json`

**⚠️ IMPORTANT**: Backup this file regularly! It contains your SSL certificates and Let's Encrypt account information.

## Option 2: Manual SSL with certbot

If you prefer to manage certificates manually:

### Step 1: Install certbot

```bash
sudo apt update
sudo apt install certbot
```

### Step 2: Obtain Certificates

```bash
# Stop any services using ports 80/443
docker-compose -f docker-compose.prod.yml down

# Obtain certificate
sudo certbot certonly --standalone \
  -d yourdomain.com \
  -d api.yourdomain.com \
  -d app.yourdomain.com \
  --email admin@yourdomain.com \
  --agree-tos \
  --no-eff-email
```

### Step 3: Configure Nginx or Update Traefik

For Nginx, create a configuration file:

```nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Step 4: Setup Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Add to crontab for automatic renewal
sudo crontab -e

# Add this line:
0 0 * * 0 certbot renew --quiet && systemctl reload nginx
```

## Option 3: Wildcard SSL Certificate

For `*.yourdomain.com`:

### Using certbot with DNS validation:

```bash
sudo certbot certonly \
  --manual \
  --preferred-challenges dns \
  -d yourdomain.com \
  -d "*.yourdomain.com" \
  --email admin@yourdomain.com \
  --agree-tos
```

Follow the prompts to add DNS TXT records for verification.

## Option 4: Commercial SSL Certificate

If you have a commercial SSL certificate:

1. Place your certificate files in a secure location:
   ```bash
   mkdir -p /etc/ssl/bom
   chmod 700 /etc/ssl/bom

   # Copy your certificates
   cp yourdomain.com.crt /etc/ssl/bom/
   cp yourdomain.com.key /etc/ssl/bom/
   cp ca-bundle.crt /etc/ssl/bom/

   # Set proper permissions
   chmod 600 /etc/ssl/bom/*.key
   chmod 644 /etc/ssl/bom/*.crt
   ```

2. Update `docker-compose.prod.yml` to mount these certificates
3. Configure Traefik to use file-based certificates instead of ACME

## SSL Best Practices

### Security Headers

Already configured in `docker-compose.prod.yml`:

```yaml
- "traefik.http.middlewares.security-headers.headers.sslRedirect=true"
- "traefik.http.middlewares.security-headers.headers.stsSeconds=31536000"
- "traefik.http.middlewares.security-headers.headers.stsIncludeSubdomains=true"
- "traefik.http.middlewares.security-headers.headers.stsPreload=true"
```

### Certificate Monitoring

Monitor certificate expiration:

```bash
# Check expiration date
echo | openssl s_client -servername yourdomain.com -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates

# Or use a script
./scripts/check-ssl-expiry.sh
```

### Backup Certificates

Add to your backup script:

```bash
# Backup Let's Encrypt certificates
cp -r /var/lib/docker/volumes/bom_certificates/_data/acme.json /backup/bom/certificates/

# Or for manual certificates
cp -r /etc/letsencrypt /backup/bom/letsencrypt/
```

## Testing SSL Configuration

### SSL Labs Test

Visit: https://www.ssllabs.com/ssltest/analyze.html?d=yourdomain.com

Target grade: **A or A+**

### Command Line Testing

```bash
# Test SSL connection
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Check certificate details
curl -vI https://yourdomain.com

# Test with specific TLS version
openssl s_client -connect yourdomain.com:443 -tls1_2
openssl s_client -connect yourdomain.com:443 -tls1_3
```

## Troubleshooting

### Certificate Not Obtained

1. Check DNS is propagated:
   ```bash
   nslookup yourdomain.com
   ```

2. Check ports are open:
   ```bash
   sudo netstat -tulpn | grep :80
   sudo netstat -tulpn | grep :443
   ```

3. Check Traefik logs:
   ```bash
   docker-compose -f docker-compose.prod.yml logs traefik
   ```

### Certificate Renewal Failed

1. Check Traefik logs for ACME errors
2. Verify email in ACME_EMAIL is valid
3. Check Let's Encrypt rate limits: https://letsencrypt.org/docs/rate-limits/
4. Manually trigger renewal:
   ```bash
   docker exec bom-traefik-prod traefik healthcheck
   ```

### Mixed Content Warnings

Ensure all resources are loaded over HTTPS:
- Update `CORS_ORIGIN` in `.env.production`
- Check application code for hardcoded `http://` URLs
- Configure CSP headers to enforce HTTPS

## Monitoring SSL

Set up monitoring for certificate expiration:

1. Add Prometheus SSL exporter to `docker-compose.monitoring.yml`
2. Create alert rules for certificates expiring < 30 days
3. Configure email notifications

## Security Considerations

1. **Never commit certificates to version control**
2. **Backup acme.json file regularly**
3. **Use strong ciphers (TLS 1.2+)**
4. **Enable HSTS**
5. **Monitor certificate expiration**
6. **Use certificate pinning for mobile apps** (optional)

## Additional Resources

- Let's Encrypt: https://letsencrypt.org/
- SSL Labs: https://www.ssllabs.com/
- Traefik ACME: https://doc.traefik.io/traefik/https/acme/
- Mozilla SSL Config: https://ssl-config.mozilla.org/
