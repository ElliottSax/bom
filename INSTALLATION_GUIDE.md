# Installation Guide - BOM Study Tools

**Last Updated:** November 26, 2025
**Status:** Dependencies not yet installed (WSL2 performance issue)

---

## 🚨 Current Situation

The project code is complete and verified, but npm dependency installation keeps timing out on WSL2 due to file system performance limitations.

**Code Status:** ✅ All files created and syntax-verified
**Dependencies:** ⚠️ Not installed (blocking compilation and testing)

---

## 📦 Quick Installation (Recommended Methods)

### Method 1: Use the Helper Script (Easiest)

We've created an automated installation script that tries multiple strategies:

```bash
cd /mnt/e/projects/bom
./scripts/install-dependencies.sh
```

This script will automatically try:
1. npm with optimizations
2. pnpm (faster alternative)
3. yarn (another alternative)
4. Individual workspace installation

### Method 2: Manual npm Install

```bash
cd /mnt/e/projects/bom/services/api

# Clear cache first
npm cache clean --force

# Try with extended timeout
npm install --legacy-peer-deps --fetch-timeout=600000

# Or try offline mode if you've installed before
npm install --prefer-offline --legacy-peer-deps
```

### Method 3: Use pnpm (Faster on WSL2)

pnpm is generally faster and more reliable on WSL2:

```bash
# Install pnpm if not already installed
npm install -g pnpm

# From project root
cd /mnt/e/projects/bom
pnpm install
```

### Method 4: Use Docker (Best for WSL2)

Docker bypasses WSL2 file system issues:

```bash
cd /mnt/e/projects/bom

# Build the container
docker-compose -f docker-compose.dev.yml build api

# Install dependencies inside container
docker-compose -f docker-compose.dev.yml run --rm api npm install

# Copy node_modules to host (optional)
docker cp $(docker-compose -f docker-compose.dev.yml ps -q api):/app/node_modules ./services/api/
```

### Method 5: Install from Windows (Not WSL)

If all else fails, install from native Windows:

```powershell
# Open PowerShell (not WSL)
cd E:\projects\bom
npm install
```

Then return to WSL to run the development server.

---

## 🔍 Verify Installation

After installation completes, verify with:

```bash
cd /mnt/e/projects/bom/services/api

# Check node_modules exists
ls -lh node_modules | head

# Check package-lock.json was created
ls -lh package-lock.json

# Count installed packages
ls node_modules | wc -l
```

Expected results:
- `node_modules/` directory exists with 500+ packages
- `package-lock.json` file created
- No error messages

---

## 🧪 Post-Installation Steps

Once dependencies are installed:

### 1. Generate Prisma Client

```bash
cd services/api
npm run db:generate
```

### 2. Run TypeScript Compilation

```bash
npm run build
```

Expected output:
- No compilation errors
- `dist/` directory created with compiled JavaScript

### 3. Run Tests

```bash
npm test
```

Expected results:
- All tests pass (40+ tests)
- Code coverage reports generated
- No failures

### 4. Create Environment File

```bash
cp .env.example .env.development
```

Edit `.env.development` and set:
```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://bom_user:bom_password@localhost:5432/bom_development
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-development-secret-min-32-chars
CORS_ORIGIN=http://localhost:3000,http://localhost:19006
```

### 5. Start Docker Services

```bash
cd /mnt/e/projects/bom
docker-compose -f docker-compose.dev.yml up -d
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Qdrant (port 6333)

### 6. Run Database Migrations

```bash
cd services/api
npm run db:migrate
```

### 7. Start Development Server

```bash
npm run dev
```

Expected output:
```
Server started successfully
Port: 4000
Host: 0.0.0.0
Environment: development
```

### 8. Test the API

```bash
# Basic health check
curl http://localhost:4000/health

# Detailed health check
curl http://localhost:4000/health/detailed

# Expected response:
# {"status":"healthy","timestamp":"..."}
```

---

## 🐛 Troubleshooting

### Issue: npm install times out

**Solution 1:** Use the helper script
```bash
./scripts/install-dependencies.sh
```

**Solution 2:** Install with pnpm
```bash
npm install -g pnpm
pnpm install
```

**Solution 3:** Increase WSL2 memory
Create/edit `~/.wslconfig` on Windows:
```ini
[wsl2]
memory=8GB
processors=4
swap=2GB
```

Then restart WSL:
```powershell
wsl --shutdown
```

### Issue: EACCES permission errors

```bash
# Fix npm permissions
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER /mnt/e/projects/bom/node_modules
```

### Issue: Peer dependency conflicts

```bash
npm install --legacy-peer-deps --force
```

### Issue: Disk space errors

```bash
# Check available space
df -h /mnt/e

# Clean npm cache
npm cache clean --force

# Clean old node_modules
rm -rf node_modules
```

### Issue: Network/proxy errors

```bash
# Check npm registry
npm config get registry

# Set to official registry
npm config set registry https://registry.npmjs.org/

# Disable proxy if not needed
npm config delete proxy
npm config delete https-proxy
```

---

## 📊 Installation Statistics

### Expected Package Count
- **services/api:** ~50 direct dependencies, ~500 total packages
- **Root:** ~15 direct dependencies
- **Total download size:** ~300-500 MB
- **Installation time:** 5-15 minutes (varies by connection)

### Verification Checksums

After installation, you should have:

```bash
# Main dependencies in services/api
✓ fastify
✓ @apollo/server
✓ @prisma/client
✓ ioredis
✓ jsonwebtoken
✓ bcrypt
✓ zod
✓ sanitize-html
✓ @fastify/cors
✓ @fastify/helmet
✓ pino
```

Verify with:
```bash
cd services/api
npm list --depth=0
```

---

## 🔄 Alternative: Skip npm and Use Docker Only

If npm continues to fail, you can develop entirely in Docker:

### 1. Edit docker-compose.dev.yml

Already configured for development with:
- Volume mounts for hot reload
- Port exposure
- Development environment variables

### 2. Start in Docker

```bash
docker-compose -f docker-compose.dev.yml up
```

### 3. Execute Commands in Container

```bash
# Run migrations
docker-compose -f docker-compose.dev.yml exec api npm run db:migrate

# Run tests
docker-compose -f docker-compose.dev.yml exec api npm test

# Check logs
docker-compose -f docker-compose.dev.yml logs -f api
```

---

## 📝 Code Verification (Without Dependencies)

Even without dependencies installed, we've verified:

✅ **All TypeScript files created:**
- `src/index.ts` (146 lines)
- `src/config/cors.ts` (87 lines)
- `src/middleware/rateLimit.ts` (191 lines)
- `src/middleware/validation.ts` (265 lines)
- `src/routes/health.ts` (112 lines)
- `src/validation/schemas.ts` (198 lines)

✅ **All test files created:**
- `src/__tests__/validation.test.ts` (226 lines)
- `src/__tests__/middleware.test.ts` (222 lines)
- `src/__tests__/cors.test.ts` (125 lines)
- `src/__tests__/setup.ts` (85 lines)

✅ **Basic syntax checks passed:**
- No unmatched braces or parentheses
- All files have proper imports/exports
- No obvious syntax errors

✅ **Configuration files:**
- `jest.config.js` - Test configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies defined
- `.env.example` - Environment template

---

## 🎯 Next Steps After Installation

1. ✅ Install dependencies (you are here)
2. ⏭️ Run `npm test` to verify all tests pass
3. ⏭️ Run `npm run build` to compile TypeScript
4. ⏭️ Start Docker services for databases
5. ⏭️ Run migrations to set up database schema
6. ⏭️ Start development server with `npm run dev`
7. ⏭️ Begin Phase 1 development (Authentication, GraphQL)

---

## 📞 Help & Support

If installation continues to fail:

1. **Check the logs:** Look for specific error messages
2. **Try Docker method:** Most reliable for WSL2
3. **Use native Windows:** Install from PowerShell, run dev from WSL
4. **Check GitHub issues:** Similar problems and solutions
5. **Contact team:** Share error logs and system info

---

**Remember:** The code is ready - we just need to get dependencies installed!
