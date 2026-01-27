# Database Migration Guide: CoC D&C Sections 114-167

## Overview
This guide covers importing Community of Christ Doctrine & Covenants sections 114-167 into the PostgreSQL database.

## What's Being Imported

### Summary
- **Sections**: 114-167 (54 sections total)
- **Tradition**: Community of Christ (CoC)
- **Source**: Centerplace.org
- **Scraped Date**: 2026-01-26
- **Format**: SQL INSERT statements

### Key Sections Included

#### Historical CoC Sections (114-120)
- **Section 114** (1861) - First revelation to Joseph Smith III, law of tithing
- **Section 115** (1863) - William Marks called to First Presidency
- **Section 116** (1865) - Ordination of men of every race to priesthood
- **Section 117** (1873) - First Presidency filled, W.W. Blair and David H. Smith called
- **Section 118** (1882) - Unity and organization instructions
- **Section 119** (1887) - Extensive instructions on conduct, sacrament, Sabbath
- **Section 120** (1890) - Branch/district organization, traveling vs standing ministry

#### Section 156 (1984) - Women's Ordination
The most significant modern revelation in CoC history:
- Authorized ordination of women to all priesthood offices
- Led to 1984 schism with Restoration Branches
- Major turning point in CoC theology

#### Sections 145-167 (Modern Revelations)
Recent guidance from CoC prophets on:
- Continuing revelation
- Social justice and peace
- Temple dedication and purpose
- Environmental stewardship
- LGBTQ+ inclusion
- Marriage equality

## Database Schema Changes

The migration adds the following columns to `doctrine_covenants_verses`:

```sql
ALTER TABLE doctrine_covenants_verses
  ADD COLUMN IF NOT EXISTS tradition VARCHAR(10) DEFAULT 'shared';

ALTER TABLE doctrine_covenants_verses
  ADD COLUMN IF NOT EXISTS prophet_received VARCHAR(100);

ALTER TABLE doctrine_covenants_verses
  ADD COLUMN IF NOT EXISTS date_received DATE;

ALTER TABLE doctrine_covenants_verses
  ADD COLUMN IF NOT EXISTS conference_date DATE;
```

### Column Descriptions

- **tradition**: Distinguishes between shared (LDS/CoC), CoC-only, or LDS-only sections
- **prophet_received**: Name of the prophet who received the revelation
- **date_received**: Date when revelation was received
- **conference_date**: Date when presented to/sustained by conference

## Prerequisites

### 1. Database Access
Ensure PostgreSQL is running:
```bash
# Start the database container
docker start bom-postgres-dev

# Or if container doesn't exist, create it
docker run -d \
  --name bom-postgres-dev \
  -e POSTGRES_DB=bom_study_tools_dev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5435:5432 \
  postgres:15-alpine
```

### 2. Database Connection
Test connection:
```bash
psql -h localhost -p 5435 -U postgres -d bom_study_tools_dev
```

### 3. Verify Existing Data
Check current D&C sections:
```sql
SELECT section, COUNT(*) as verses
FROM doctrine_covenants_verses
GROUP BY section
ORDER BY section;
```

Expected before migration:
- Sections 1-113 (shared LDS/CoC)
- Total ~2,500 verses

## Migration Steps

### Method 1: Direct SQL Import (Recommended)

1. Navigate to the seeds directory:
```bash
cd /mnt/e/projects/bom/services/api/prisma/seeds
```

2. Run the SQL import script:
```bash
psql -h localhost -p 5435 -U postgres -d bom_study_tools_dev \
  -f import-coc-dc-sections.sql
```

3. Verify the import:
```sql
-- Check total sections
SELECT COUNT(DISTINCT section) as total_sections
FROM doctrine_covenants_verses;
-- Should show 167

-- Check CoC-specific sections
SELECT section, COUNT(*) as verses, tradition
FROM doctrine_covenants_verses
WHERE section >= 114
GROUP BY section, tradition
ORDER BY section;

-- Verify metadata
SELECT section, verse, prophet_received, date_received
FROM doctrine_covenants_verses
WHERE section IN (114, 116, 156)
LIMIT 5;
```

### Method 2: Using Prisma Seed

1. Install dependencies:
```bash
cd /mnt/e/projects/bom/services/api
npm install
```

2. Run Prisma seed:
```bash
npx prisma db seed
```

3. Verify using the SQL queries from Method 1, step 3.

### Method 3: Using API Server Script

1. Start the API server:
```bash
cd /mnt/e/projects/bom/services/api
python3 server-full.py
```

2. In another terminal, run the import script:
```bash
./import-via-sql.sh services/api/prisma/seeds/import-coc-dc-sections.sql
```

## Verification Checklist

After running the migration, verify the following:

- [ ] Total sections increased from ~113 to 167
- [ ] Section 114 exists with text about tithing and Joseph Smith III
- [ ] Section 116 exists with text about ordaining all races
- [ ] Section 156 exists (women's ordination)
- [ ] All sections 114-167 have `tradition = 'coc'`
- [ ] Prophet names populated where available
- [ ] Dates formatted correctly (YYYY-MM-DD)
- [ ] No duplicate sections or verses
- [ ] Full-text search works on new sections
- [ ] GraphQL API returns new sections correctly

## Testing the Migration

### 1. Query via psql

```sql
-- Get Section 156 (women's ordination)
SELECT section, verse,
       LEFT(text, 100) as preview,
       prophet_received,
       date_received
FROM doctrine_covenants_verses
WHERE section = 156;

-- Count verses per section for 114-167
SELECT section, COUNT(*) as verses
FROM doctrine_covenants_verses
WHERE section BETWEEN 114 AND 167
GROUP BY section
ORDER BY section;

-- Check for any missing sections
WITH sections AS (
  SELECT generate_series(114, 167) as section_num
)
SELECT s.section_num
FROM sections s
LEFT JOIN doctrine_covenants_verses d ON s.section_num = d.section
WHERE d.section IS NULL;
```

### 2. Test via GraphQL API

Start the API server:
```bash
cd /mnt/e/projects/bom/services/api
python3 server-full.py
```

Query via GraphQL:
```graphql
query {
  verses(
    editionId: "coc-dc-2017"
    book: "Doctrine and Covenants"
    chapter: 156
  ) {
    verse
    text
  }
}
```

### 3. Test via Web App

1. Start the web app:
```bash
cd /mnt/e/projects/bom/apps/web
npm run dev
```

2. Navigate to `http://localhost:3000`

3. Select "Doctrine & Covenants" from the volume tabs

4. Select a CoC-specific section (e.g., 156)

5. Verify:
   - Section loads correctly
   - Text displays properly
   - Search finds content in these sections
   - Bookmarks/highlights work

## Rollback Procedure

If you need to rollback the migration:

```sql
BEGIN;

-- Remove CoC-specific sections
DELETE FROM doctrine_covenants_verses
WHERE section >= 114;

-- Remove added columns (optional)
ALTER TABLE doctrine_covenants_verses DROP COLUMN IF EXISTS tradition;
ALTER TABLE doctrine_covenants_verses DROP COLUMN IF EXISTS prophet_received;
ALTER TABLE doctrine_covenants_verses DROP COLUMN IF EXISTS date_received;
ALTER TABLE doctrine_covenants_verses DROP COLUMN IF EXISTS conference_date;

COMMIT;
```

**Note**: Only run the `DROP COLUMN` commands if you're certain no other data uses these columns.

## Data Files Reference

### Primary Files
- **SQL Import**: `services/api/prisma/seeds/import-coc-dc-sections.sql` (87 lines)
- **JSON Data**: `services/api/prisma/seeds/coc-dc-sections-114-167.json` (54 sections)

### Supporting Files
- **Scraped Sections**: `services/api/prisma/seeds/scraped/` directory
  - Individual section imports
  - Historical scraping data
  - Alternative import options

## Notable Sections to Review

### Section 114 (1861)
First revelation to Joseph Smith III, establishing the Reorganized Church's claim to succession.

### Section 116 (1865)
Revolutionary for its time: "ordain priests unto me of every race who receive the teachings of my law"

### Section 156 (1984)
The most significant modern CoC revelation:
- Verse 9: "The law of the priesthood constrains me to call women into the ordained ministry"
- Led to ordination of women beginning 1985
- Caused major schism; many left to form Restoration Branches

### Section 163 (2007)
Temple dedication and call to "become a people of the Temple"

### Section 164 (2010)
Environmental stewardship: "Creation itself is a lesson that speaks truthfully and plainly"

### Section 165 (2013)
Marriage equality support (though not explicitly stated)

### Sections 166-167 (Modern)
Recent revelations on continuing spiritual discernment

## Common Issues

### Issue 1: Duplicate Key Errors
**Symptom**: Error inserting sections that already exist

**Solution**:
```sql
-- Check for existing sections
SELECT section FROM doctrine_covenants_verses WHERE section >= 114;

-- If found, delete before importing
DELETE FROM doctrine_covenants_verses WHERE section >= 114;
```

### Issue 2: Column Does Not Exist
**Symptom**: Column "tradition" does not exist

**Solution**: Run the ALTER TABLE commands manually first:
```bash
psql -h localhost -p 5435 -U postgres -d bom_study_tools_dev -c \
  "ALTER TABLE doctrine_covenants_verses ADD COLUMN IF NOT EXISTS tradition VARCHAR(10) DEFAULT 'shared';"
```

### Issue 3: Permission Denied
**Symptom**: Cannot write to database

**Solution**: Ensure you're using the correct user with write permissions:
```bash
psql -h localhost -p 5435 -U postgres -d bom_study_tools_dev
```

### Issue 4: Encoding Errors
**Symptom**: Special characters don't display correctly

**Solution**: Ensure database encoding is UTF-8:
```sql
SHOW server_encoding;
-- Should return UTF8
```

## Performance Considerations

### Import Time
- Expected duration: 2-5 seconds
- 54 sections × 1-50 verses each ≈ 500-1000 rows
- Uses transaction (BEGIN/COMMIT) for atomicity

### Index Recommendations

After import, consider adding indexes:
```sql
-- Index on tradition for filtering
CREATE INDEX IF NOT EXISTS idx_dc_tradition
  ON doctrine_covenants_verses(tradition);

-- Index on prophet_received for querying by prophet
CREATE INDEX IF NOT EXISTS idx_dc_prophet
  ON doctrine_covenants_verses(prophet_received);

-- Index on date_received for chronological queries
CREATE INDEX IF NOT EXISTS idx_dc_date_received
  ON doctrine_covenants_verses(date_received);
```

### Full-Text Search

Update search vectors if you have full-text search:
```sql
-- Rebuild search index for new sections
UPDATE doctrine_covenants_verses
SET search_vector = to_tsvector('english', text)
WHERE section >= 114;
```

## Future Enhancements

### Missing Sections 145-167
**Status**: Data files exist but need verification

**Location**: `services/api/prisma/seeds/scraped/import-dc-sections-121-167.sql`

**Action Required**: Review and test before importing

### LDS-Specific Sections
Some LDS sections (Official Declarations 1 & 2) are not in CoC canon. Consider adding:
- Tradition filter to distinguish
- Separate edition: "lds-dc-2013"

### Metadata Enhancement
Consider adding:
- Historical context field (JSONB)
- Related sections cross-references
- Topic tags (priesthood, revelation, organization, etc.)
- Difficulty/reading level

## Support and Resources

### Documentation
- **Prisma Schema**: `services/api/prisma/schema.prisma`
- **API README**: `services/api/README.md`
- **Project Guide**: `/mnt/e/projects/bom/CLAUDE.md`

### External Resources
- **Source**: https://centerplace.org (CoC scripture resource)
- **CoC Official**: https://www.cofchrist.org/doctrine-and-covenants
- **Section 156 Discussion**: https://en.wikipedia.org/wiki/Revelation_on_Priesthood_(Community_of_Christ)

### Troubleshooting
For issues not covered here:
1. Check server logs: `services/api/logs/`
2. Review Prisma migrations: `services/api/prisma/migrations/`
3. Test with minimal query first
4. Check database permissions
5. Verify Docker container is running

## Success Criteria

Migration is successful when:
1. ✅ All 54 sections (114-167) are in database
2. ✅ No duplicate sections or verses
3. ✅ Tradition column populated correctly
4. ✅ Metadata (prophet, dates) present where available
5. ✅ GraphQL API returns new sections
6. ✅ Web app displays new sections
7. ✅ Search finds content in new sections
8. ✅ No errors in server logs
9. ✅ Performance remains acceptable
10. ✅ Data integrity checks pass

## Next Steps After Migration

1. **Update API documentation** to reflect new sections
2. **Add CoC-specific filtering** in web/mobile apps
3. **Create study materials** for Section 156 and other key sections
4. **Add comparison views** between LDS and CoC versions of shared sections
5. **Implement tradition toggle** in UI to switch between LDS/CoC perspectives
6. **Add historical context** annotations for major CoC sections
7. **Create courses** covering CoC-specific revelations
8. **Build quiz content** around CoC theology and history

---

**Last Updated**: 2026-01-27
**Migration File Date**: 2026-01-26
**Status**: Ready for execution when database is available
