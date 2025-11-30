# Dependency Installation Workaround for WSL2

## Problem

Both `npm install` and `pnpm install` timeout on WSL2 due to:
1. Large number of dependencies (~500 packages across workspaces)
2. WSL2 file system performance with `node_modules`
3. Network latency in package resolution

## Solutions

### Option 1: Install from Windows PowerShell (Recommended)

```powershell
# Open Windows PowerShell (NOT WSL)
cd E:\projects\bom

# Install using npm
npm install --legacy-peer-deps

# Or use pnpm (faster)
npm install -g pnpm
pnpm install
```

**Why this works:** Windows native file system is faster than WSL2's 9p protocol for node_modules.

---

### Option 2: Use Docker for Installation

```bash
# From WSL2, use Docker to install
docker run --rm -v $(pwd):/app -w /app node:18 npm install --legacy-peer-deps

# Or for API service only
cd services/api
docker run --rm -v $(pwd):/app -w /app node:18 npm install --legacy-peer-deps
```

**Why this works:** Docker bypasses WSL2 file system issues.

---

### Option 3: Install Each Workspace Separately

```bash
# Install root dependencies first
npm install --workspace-root --legacy-peer-deps

# Then install each workspace individually with timeouts
cd services/api
npm install --legacy-peer-deps --fetch-timeout=600000

cd ../../apps/web
npm install --legacy-peer-deps --fetch-timeout=600000

cd ../mobile
npm install --legacy-peer-deps --fetch-timeout=600000

cd ../../packages/shared
npm install --legacy-peer-deps --fetch-timeout=600000

cd ../graphql
npm install --legacy-peer-deps --fetch-timeout=600000
```

**Why this works:** Smaller dependency trees per workspace reduce timeout risk.

---

### Option 4: Improve WSL2 Performance (Long-term)

```bash
# Create/edit ~/.wslconfig on Windows
# Location: C:\Users\<YourUsername>\.wslconfig

[wsl2]
memory=8GB
processors=4
swap=2GB
localhostForwarding=true

# Experimental: faster file system access
[experimental]
autoMemoryReclaim=gradual
sparseVhd=true
```

Then restart WSL:
```powershell
# In Windows PowerShell
wsl --shutdown
```

**Why this works:** Allocates more resources to WSL2 for faster file operations.

---

### Option 5: Move Project to WSL2 Native File System

```bash
# Copy project to WSL2 home directory (faster)
cp -r /mnt/e/projects/bom ~/projects/bom
cd ~/projects/bom

# Now install
npm install --legacy-peer-deps
```

**Why this works:** WSL2 native ext4 filesystem is much faster than /mnt/e (9p protocol).

**Tradeoff:** Files not accessible from Windows File Explorer as easily.

---

## Recommended Approach

1. **Quick:** Use Docker (Option 2)
2. **Best Performance:** Move to WSL2 home directory (Option 5)
3. **Keep on E: drive:** Install from Windows PowerShell (Option 1)

---

## After Successful Installation

```bash
# Verify installation
cd /mnt/e/projects/bom/services/api
npm run build

# Should compile TypeScript without errors
```

## Current Status

- ✅ Docker services running (PostgreSQL, Redis, Qdrant, MailHog)
- ❌ Node dependencies not installed (timeout issue)
- ✅ Database schema ready for migration
- ✅ Seed data prepared

---

**Next Steps After Installation:**
1. Run Prisma migrations: `npm run db:migrate`
2. Seed database: `npm run db:seed`
3. Start development server: `npm run dev`
4. Run tests: `npm test`
