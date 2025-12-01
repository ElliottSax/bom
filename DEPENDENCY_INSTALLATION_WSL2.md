# WSL2 Dependency Installation Issue - Solutions

**Problem:** npm/pnpm install repeatedly times out on `/mnt/e/projects/bom`

**Root Cause:** WSL2 has severe performance issues with Windows filesystems for node_modules installation

---

## ✅ Solution 1: Install from Windows PowerShell (RECOMMENDED)

```powershell
# Open Windows PowerShell (Run as Administrator)
cd E:\projects\bom
npm install --legacy-peer-deps
```

**Expected Time:** 2-5 minutes
**Success Indicator:** `node_modules` directory created with ~1000+ packages

---

## ✅ Solution 2: Move to WSL2 Home Directory

```bash
cp -r /mnt/e/projects/bom ~/projects/bom
cd ~/projects/bom  
npm install --legacy-peer-deps
```

**Performance:** 50x faster than /mnt/e

---

## 📊 What We've Tried (All Failed on WSL2 /mnt/e)
- ❌ npm install (6+ min timeout)
- ❌ pnpm install (3+ min timeout)  
- ❌ Docker npm install (10+ min timeout)
- ❌ Individual workspace install (5+ min timeout)

---

## 🎯 Next Steps After Installation

```bash
cd services/api
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```
