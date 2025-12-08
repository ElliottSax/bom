# Scripture Data Acquisition Scripts

This directory contains scripts for acquiring and importing Community of Christ scripture text into the database.

## Prerequisites

```bash
# Install dependencies (if not already installed)
cd /mnt/e/projects/bom/services/api
npm install

# Install jsdom for HTML parsing
npm install --save-dev jsdom @types/jsdom

# Install tsx for running TypeScript scripts
npm install --save-dev tsx
```

## Workflow

### 1. Scrape Scripture Text

#### Doctrine & Covenants (Sections 1-167)

```bash
# Scrape sections 1-50 (P0 - Critical)
npx tsx src/scripts/scrape-coc-dc.ts 1 50

# Scrape sections 51-113 (P1 - Important)
npx tsx src/scripts/scrape-coc-dc.ts 51 113

# Scrape sections 114-167 (P2 - CoC-specific)
npx tsx src/scripts/scrape-coc-dc.ts 114 167
```

**Output:** Creates JSON file in `prisma/seeds/scraped/coc-dc-sections-X-Y.json`

#### Book of Mormon (15 books, 124 chapters)

```bash
# Scrape all books
npx tsx src/scripts/scrape-coc-bom.ts

# Scrape specific books
npx tsx src/scripts/scrape-coc-bom.ts "I Nephi" "II Nephi"
npx tsx src/scripts/scrape-coc-bom.ts "III Nephi"
```

**Output:** Creates JSON file in `prisma/seeds/scraped/coc-bom-*.json`

### 2. Import Verses into Database

```bash
# Import D&C sections
npx tsx src/scripts/import-verses.ts coc-dc-sections-1-50.json --stats

# Import Book of Mormon
npx tsx src/scripts/import-verses.ts coc-bom-complete.json --stats
```

**Features:**
- Batch insertion (100 verses at a time)
- Automatically skips duplicates
- Shows import progress
- Optional `--stats` flag to display edition statistics

## Data Sources

### Community of Christ Scriptures
- **Book of Mormon (1908):** https://www.centerplace.org/hs/bm/
  - Original 1830 chapter divisions (124 chapters)
  - Roman numeral book names (I Nephi, II Nephi, III Nephi, IV Nephi)

- **Doctrine & Covenants (2017):** https://www.centerplace.org/hs/dc/
  - 167 sections (vs. LDS 138 sections)
  - Includes revelations through President Stephen M. Veazey
  - Uses letter suffixes for verse subdivisions (e.g., 1:1a, 1:1b)

## File Structure

```
services/api/
├── src/scripts/
│   ├── scrape-coc-dc.ts      # D&C scraper
│   ├── scrape-coc-bom.ts     # Book of Mormon scraper
│   ├── import-verses.ts      # Bulk verse importer
│   └── README.md             # This file
│
└── prisma/seeds/
    └── scraped/              # Scraped JSON files (gitignored)
        ├── coc-dc-sections-1-50.json
        ├── coc-dc-sections-51-113.json
        ├── coc-bom-complete.json
        └── ...
```

## Verse Data Format

All scraped data follows this JSON structure:

```json
{
  "id": "coc-bom-1908:i-nephi-1-1",
  "editionId": "coc-bom-1908",
  "book": "I Nephi",
  "chapter": 1,
  "verse": 1,
  "text": "I, Nephi, having been born of goodly parents...",
  "verseType": "standard"
}
```

## Phase 1 Priorities

### Week 1 (Current)
- [x] Create scraper infrastructure
- [ ] Scrape CoC D&C sections 1-50
- [ ] Scrape CoC Book of Mormon (all 15 books)
- [ ] Import P0 data into database

### Week 2
- [ ] Scrape remaining D&C sections (51-167)
- [ ] Begin verse mapping (CoC ↔ LDS)
- [ ] Validate verse counts per book/section

### Week 3-4
- [ ] Import LDS editions for comparison
- [ ] Complete verse mapping tables
- [ ] Begin API development

## Troubleshooting

### Missing dependencies
```bash
npm install jsdom @types/jsdom tsx --save-dev
```

### Edition not found error
```bash
# Ensure editions are seeded first
npx prisma db seed
```

### Connection errors
```bash
# Verify database is running
docker-compose ps
# Should show PostgreSQL on port 5435
```

### Rate limiting
The scrapers include 500ms delays between requests to be respectful to Centerplace.org servers. Do not reduce this delay.

## Next Steps

After importing scripture text:
1. Generate verse mappings (CoC ↔ LDS)
2. Build GraphQL resolvers for verse queries
3. Create API tests
4. Begin mobile app development

See [PHASE_1_COC_IMPLEMENTATION.md](../../../../PHASE_1_COC_IMPLEMENTATION.md) for full roadmap.
