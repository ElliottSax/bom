# Quick Start Guide - Next Session

## 🚀 Get Everything Running in 2 Minutes

### Step 1: Start Infrastructure (30 seconds)
```bash
# Start database and cache
docker start bom-postgres-dev bom-redis-dev

# Verify they're running
docker ps | grep bom
```

### Step 2: Start API Server (30 seconds)
```bash
# Navigate to API directory
cd /mnt/e/projects/bom/services/api

# Start the full-featured server
python3 server-with-mutations.py
```

**Server will be available at:** http://localhost:4002/graphql

### Step 3: Verify Everything Works (1 minute)
```bash
# Test health endpoint
curl http://localhost:4002/health

# Test a GraphQL query
curl -X POST http://localhost:4002/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ editions { id name }}"}'
```

## 📱 Mobile App Development

### WSL2 Users (Windows)
Open Windows PowerShell (not WSL2):
```powershell
# Navigate to mobile app
cd E:\projects\bom\apps\mobile

# Install dependencies
npm install

# Start Metro bundler
npm start

# In another terminal, run the app
npm run android  # or ios on Mac
```

### Direct Linux/Mac Users
```bash
cd apps/mobile
npm install
npm start
# In another terminal
npm run ios  # or android
```

## 🔧 Available Features

### GraphQL Playground
Open browser to: http://localhost:4002/graphql

### Test Queries

**Search for verses:**
```graphql
{
  search(query: "faith", editionId: "coc-bom-1908", limit: 5) {
    results {
      book chapter verse text highlight
    }
    totalCount
  }
}
```

**Get user highlights:**
```graphql
{
  highlights(userId: "demo-user") {
    id verseId color book chapter verse text
  }
}
```

**Add a highlight:**
```graphql
mutation {
  addHighlight(
    userId: "demo-user",
    verseId: "coc-bom-1908:alma-1-1",
    color: "yellow"
  ) {
    id verseId color
  }
}
```

**Add a note:**
```graphql
mutation {
  addNote(
    userId: "demo-user",
    verseId: "coc-bom-1908:alma-1-1",
    content: "Important verse",
    tags: ["faith", "testimony"]
  ) {
    id content tags createdAt
  }
}
```

## 📊 Current Data

- **Database:** 11,787 verses loaded
- **Editions:** 6 (CoC BoM, LDS BoM, CoC D&C, LDS D&C, IV Bible, NRSV)
- **Demo User:** demo-user (with sample data)
- **API Server:** Full-featured with search, highlights, notes, mutations

## 🛑 Stop Everything

```bash
# Stop API server
Ctrl+C in the terminal running the server

# Stop Docker containers
docker stop bom-postgres-dev bom-redis-dev
```

## 📝 Development Tasks

### Priority 1: Mobile App
- [ ] Install dependencies (use Windows PowerShell for WSL2)
- [ ] Configure Apollo Client to use localhost:4002
- [ ] Test basic queries
- [ ] Implement UI screens

### Priority 2: Feature Enhancement
- [ ] Add bookmark functionality
- [ ] Implement reading plans
- [ ] Create study groups
- [ ] Add authentication

### Priority 3: Production Prep
- [ ] Set up proper authentication
- [ ] Add rate limiting
- [ ] Create deployment scripts
- [ ] Write API documentation

## 🔗 Useful Files

- **Main Status:** `/mnt/e/projects/bom/CURRENT_STATUS.md`
- **Development Summary:** `/mnt/e/projects/bom/DEVELOPMENT_SESSION_COMPLETE.md`
- **API Servers:** `/mnt/e/projects/bom/services/api/server-*.py`
- **Mobile App:** `/mnt/e/projects/bom/apps/mobile/`

## 💡 Tips

1. **If npm hangs on WSL2:** Use Windows PowerShell instead
2. **If API doesn't respond:** Check Docker containers are running
3. **If database is empty:** Run import scripts in `/services/api/`
4. **For API testing:** Use the GraphQL Playground at http://localhost:4002/graphql

---

**Ready to continue development!** The infrastructure is stable, API is feature-complete, and everything is documented.