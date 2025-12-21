# Quick Start - Get API Running Now

**Goal:** Get the GraphQL API server running in under 5 minutes

---

## Step 1: Verify Database is Running

```bash
docker ps | grep bom-postgres-dev
```

If not running:
```bash
docker start bom-postgres-dev bom-redis-dev
```

---

## Step 2: Choose Your Approach

### Option A: Python Server (⚡ Fastest - 3 minutes)

```bash
cd services/api
./setup-python-server.sh
./start-python-server.sh
```

✅ **Done!** Access GraphQL Playground at: http://localhost:4000/graphql

---

### Option B: Windows Node.js (💻 Best for TypeScript)

**In Windows PowerShell:**
```powershell
cd E:\projects\bom\services\api
npm install    # First time only
node server-simple.js
```

✅ **Done!** Access at: http://localhost:4000

---

### Option C: Native Linux (🐧 Best long-term)

```bash
./scripts/copy-to-native-linux.sh
cd /home/elliott/projects/bom/services/api
npm install
npm run dev
```

✅ **Done!** Full TypeScript server with hot reload

---

## Step 3: Test It Works

Open browser to: http://localhost:4000/graphql

Run this query:
```graphql
{
  health
}
```

Expected response:
```json
{
  "data": {
    "health": "OK"
  }
}
```

---

## Step 4: Query Real Data

```graphql
{
  editions {
    id
    name
    year
  }

  verses(
    editionId: "coc-bom-1908"
    book: "I Nephi"
    chapter: 1
    limit: 3
  ) {
    verse
    text
  }
}
```

---

## Next Steps

- **Mobile development:** See `apps/mobile/SETUP.md`
- **More queries:** See `GRAPHQL_QUERIES_FULL_DATASET.md`
- **All solutions:** See `WSL2_SOLUTIONS.md`

---

**Having issues?** See [WSL2_SOLUTIONS.md](./WSL2_SOLUTIONS.md) for troubleshooting.
