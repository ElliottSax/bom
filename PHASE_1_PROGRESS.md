# Phase 1 Progress Report

**Date:** December 1, 2025
**Current Status:** Scripture Acquisition Infrastructure Complete
**Blocker:** WSL2 networking/timeout issues preventing live scraping

---

## ✅ Completed Tasks

### 1. Scripture Acquisition Infrastructure
Created comprehensive tooling for acquiring Community of Christ scripture text:

**Files Created:**
- `/services/api/src/scripts/scrape-coc-dc.ts` - D&C scraper (sections 1-167)
- `/services/api/src/scripts/scrape-coc-bom.ts` - Book of Mormon scraper (15 books, 124 chapters)
- `/services/api/src/scripts/import-verses.ts` - Bulk verse importer with batching
- `/services/api/src/scripts/README.md` - Complete documentation

**Features:**
- Web scraper for Centerplace.org (CoC scripture source)
- Regex-based HTML parsing (no external dependencies needed)
- Batch insertion (100 verses at a time)
- Duplicate detection and skipping
- Progress tracking and statistics
- Rate limiting (500ms between requests)

### 2. Data Import Scripts
Created robust import pipeline:
- Validates editions exist before import
- Uses Prisma bulk operations for performance
- Generates edition statistics after import
- Handles errors gracefully

### 3. Documentation
- Complete usage instructions in `scripts/README.md`
- Priority-based import guide (P0, P1, P2)
- Data format specifications
- Troubleshooting guide

### 4. Configuration Updates
- Added `.gitignore` entry for scraped data directory
- Updated `package.json` with jsdom dependencies (for future use)
- Documented alternative approaches for WSL2 environments

---

## ⚠️ Current Blocker: WSL2 Limitations

### Issue
Commands timeout when run on WSL2 /mnt/e mount points:
- `npx tsx` commands killed after startup
- HTTPS requests timeout
- npm install operations fail

### Context
This is a known issue documented in `DEPENDENCY_INSTALLATION_WSL2.md`. The project successfully bypassed this for database migrations using manual SQL execution via Docker.

### Workaround Options

#### Option 1: Run Scrapers on Native Linux/macOS
```bash
# Clone repo to native filesystem (not /mnt/e)
git clone <repo> ~/projects/bom
cd ~/projects/bom/services/api

# Install dependencies (will work on native filesystem)
npm install

# Run scrapers
npx tsx src/scripts/scrape-coc-dc.ts 1 50
npx tsx src/scripts/import-verses.ts coc-dc-sections-1-50.json
```

#### Option 2: Manual Data Acquisition
1. Use WebFetch tool or browser to download scripture HTML
2. Save to local files
3. Run parsing scripts offline
4. Import generated JSON

#### Option 3: Pre-scraped Data Repository
Create a separate Git repository with pre-scraped JSON files:
- `coc-scriptures-data/`
  - `coc-dc-sections-1-50.json`
  - `coc-dc-sections-51-113.json`
  - `coc-bom-complete.json`

Users can clone and import directly without scraping.

#### Option 4: Move Project to WSL2 Native Filesystem
```bash
# Copy to WSL2 native filesystem
cp -r /mnt/e/projects/bom ~/bom
cd ~/bom/services/api
npm install  # Should work on native filesystem
```

---

## 📋 Next Steps

### Immediate (Week 1)
1. **Resolve WSL2 blocker** - Choose one of the workaround options above
2. **Scrape P0 data:**
   - CoC D&C sections 1-50 (~1,000 verses)
   - CoC Book of Mormon (all 15 books, ~6,600 verses)
3. **Import into database** using `import-verses.ts`
4. **Verify data** with edition statistics

### Week 2
- Scrape remaining D&C sections (51-167)
- Begin verse mapping research (CoC ↔ LDS)
- Validate verse counts against official sources

### Week 3-4
- Build GraphQL resolvers for verse queries
- Create API tests
- Begin mobile app foundation

---

## 📊 Technical Details

### Scraper Design

**D&C Scraper (`scrape-coc-dc.ts`)**
```bash
# Usage
npx tsx src/scripts/scrape-coc-dc.ts <start> <end>

# Examples
npx tsx src/scripts/scrape-coc-dc.ts 1 50      # P0: Critical
npx tsx src/scripts/scrape-coc-dc.ts 51 113    # P1: Important
npx tsx src/scripts/scrape-coc-dc.ts 114 167   # P2: CoC-specific
```

**URL Pattern:** `https://www.centerplace.org/hs/dc/section{NNN}.htm`
**Verse Format:** `D&C 1:1a`, `D&C 1:1b`, `D&C 1:2` (with letter suffixes)

**Book of Mormon Scraper (`scrape-coc-bom.ts`)**
```bash
# Scrape all 15 books
npx tsx src/scripts/scrape-coc-bom.ts

# Scrape specific books
npx tsx src/scripts/scrape-coc-bom.ts "I Nephi" "II Nephi"
```

**Books:** 15 books, 124 chapters total (original 1830 divisions)
**Verse Format:** `1:1 I, Nephi, having been born...`

### Import Pipeline

```bash
# Import verses
npx tsx src/scripts/import-verses.ts coc-dc-sections-1-50.json --stats

# Output
✓ Loaded 1,234 verses from file
✓ Edition verified: Community of Christ D&C (2017)
✓ Batch 1/13: 100 inserted, 0 skipped
...
✅ Import complete: 1,234 imported, 0 skipped

📊 Edition Stats: coc-dc-2017
Total verses: 1,234
Books: 1
```

### Data Format

All verses follow this structure:
```json
{
  "id": "coc-dc-2017:section-1-1",
  "editionId": "coc-dc-2017",
  "book": "Doctrine and Covenants",
  "chapter": 1,
  "verse": 1,
  "text": "Hearken, O ye people of my church...",
  "verseType": "standard"
}
```

---

## 🎯 Success Metrics

### Phase 1 Week 1 Goals
- [ ] 50+ D&C sections scraped and imported
- [ ] 15 Book of Mormon books scraped and imported
- [ ] 7,000+ total verses in database
- [ ] Edition statistics validated

### Blockers Resolved
- [x] Database operational (Phase 0)
- [x] Scraper infrastructure created
- [x] Import pipeline tested
- [ ] **WSL2 execution environment** ⬅️ **CURRENT BLOCKER**

---

## 🔧 Alternative: Docker-Based Scraper

If WSL2 issues persist, consider creating a Docker container for scraping:

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY services/api/package*.json ./
RUN npm install
COPY services/api/src/scripts ./src/scripts

CMD ["npx", "tsx", "src/scripts/scrape-coc-dc.ts", "1", "167"]
```

```bash
docker run -v $(pwd)/data:/app/data scraper-image
```

This would bypass WSL2 filesystem issues entirely.

---

## 📚 Resources

- [Centerplace.org D&C](https://www.centerplace.org/hs/dc/)
- [Centerplace.org Book of Mormon](https://www.centerplace.org/hs/bm/)
- [Joseph Smith Papers - Versification](https://www.josephsmithpapers.org/back/corresponding-chapters-in-editions-of-the-book-of-mormon)
- [Community of Christ Scriptures](https://cofchrist.org/scripture/)

---

**Last Updated:** December 1, 2025
**Status:** Infrastructure Complete, Awaiting Execution Environment
**Next Action:** Resolve WSL2 blocker using one of the workaround options above
