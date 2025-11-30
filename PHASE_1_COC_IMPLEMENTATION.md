# Phase 1 Implementation Plan - Community of Christ Scripture Study Tools

## Overview

Phase 1 focuses on building the foundation for Community of Christ scripture study with proper versification support and multi-edition capabilities.

**Timeline:** 8-12 weeks
**Team:** 4-6 developers
**Goal:** Functional scripture reading app with CoC editions

---

## Sprint 1-2: Database & Scripture Import (Weeks 1-4)

### Priority 1: Database Setup
- [x] Multi-edition schema (ScriptureWork, Edition, Verse, VerseMapping)
- [x] Seed data for CoC and LDS editions
- [ ] Prisma migrations generated and tested
- [ ] Database seeded with metadata

### Priority 2: Book of Mormon Import
**CoC Edition (1908 - Original Chapters):**

| Book | Original Chapters | Notes |
|------|-------------------|-------|
| I Nephi | 6 chapters | vs. LDS 22 chapters |
| II Nephi | 11 chapters | vs. LDS 33 chapters |
| Jacob | 7 chapters | Same as LDS |
| Enos | 1 chapter | Same as LDS |
| Jarom | 1 chapter | Same as LDS |
| Omni | 1 chapter | Same as LDS |
| Words of Mormon | 1 chapter | Same as LDS |
| Mosiah | 13 chapters | vs. LDS 29 chapters |
| Alma | 29 chapters | vs. LDS 63 chapters |
| Helaman | 5 chapters | vs. LDS 16 chapters |
| III Nephi | 14 chapters | vs. LDS 30 chapters |
| IV Nephi | 1 chapter | Same as LDS |
| Mormon | 9 chapters | Same as LDS |
| Ether | 15 chapters | Same as LDS |
| Moroni | 10 chapters | Same as LDS |

**Data Sources:**
1. Community of Christ official texts (cofchrist.org)
2. Centerplace.org (CoC online scriptures)
3. Joseph Smith Papers (versification mapping)

**Import Tasks:**
- [ ] Scrape/obtain CoC Book of Mormon text (all 124 chapters)
- [ ] Parse and structure verses with proper formatting
- [ ] Import to `verses` table with `editionId: "coc-bom-1908"`
- [ ] Validate verse counts per chapter

### Priority 3: Doctrine & Covenants Import
**CoC Edition (2017 - 167 Sections):**

**Sections 1-113:** Shared with LDS (with some differences)
**Sections 114-167:** CoC-specific revelations

| Presidency | Sections | Priority |
|------------|----------|----------|
| Joseph Smith | 1-113, 108A | P0 (critical) |
| Joseph Smith III | 114-131 | P1 (important) |
| Frederick M. Smith | 132-138 | P1 |
| Israel A. Smith | 139-144 | P2 |
| W. Wallace Smith | 145-152, 149A | P2 |
| Wallace B. Smith | 153-160 | P2 |
| W. Grant McMurray | 161-162 | P2 |
| Stephen M. Veazey | 163-167 | P2 |

**Import Tasks:**
- [ ] Import sections 1-113 (P0)
- [ ] Import sections 114-131 (P1)
- [ ] Import remaining sections 132-167 (P2)
- [ ] Add section headers and context

**Data Sources:**
- Centerplace.org D&C
- Herald Publishing House editions
- Community of Christ official site

### Priority 4: Verse Mapping (CoC ↔ LDS)
**Critical Mappings for Book of Mormon:**

Example mappings needed:
```
CoC III Nephi 5:8 → LDS 3 Nephi 11:7
CoC I Nephi 3:7   → LDS 1 Nephi 3:7 (same)
CoC Alma 16:21    → LDS Alma 32:21 (different)
```

**Mapping Tasks:**
- [ ] Use Joseph Smith Papers mapping tables
- [ ] Import CoC → LDS verse mappings
- [ ] Test with 100 sample verses
- [ ] Validate bidirectional mapping

---

## Sprint 3-4: GraphQL API (Weeks 5-8)

### Priority 1: Core Queries

```graphql
# Get verse with edition support
query getVerse($reference: String!, $editionId: String!) {
  verse(reference: $reference, editionId: $editionId) {
    id
    book
    chapter
    verse
    text
    edition {
      id
      name
      versificationSystem
    }

    # Cross-edition equivalents
    equivalents {
      edition { name }
      book
      chapter
      verse
      text
    }
  }
}

# Get chapter (respects edition chapter lengths)
query getChapter($book: String!, $chapter: Int!, $editionId: String!) {
  chapter(book: $book, chapter: $chapter, editionId: $editionId) {
    verses {
      verse
      text
    }

    # Show which LDS chapters this maps to
    ldsEquivalents {
      chapters # e.g., [11, 12] for CoC III Nephi 5
    }
  }
}

# List editions
query getEditions($workId: String!) {
  editions(workId: $workId) {
    id
    name
    shortName
    versificationSystem
    isPrimary  # CoC users see CoC edition by default
  }
}
```

**API Tasks:**
- [ ] Implement verse resolver with edition support
- [ ] Implement chapter resolver (handles variable chapter lengths)
- [ ] Implement book list resolver (I Nephi vs. 1 Nephi naming)
- [ ] Implement cross-reference resolver
- [ ] Add DataLoader for N+1 prevention

### Priority 2: User Preferences

```graphql
type UserPreferences {
  # Scripture edition preferences
  preferredBomEdition: Edition
  preferredDcEdition: Edition
  preferredBibleEdition: Edition

  # Display preferences
  showCrossEditionReferences: Boolean  # Show LDS equivalents
  fontSize: String
  theme: String
}
```

**Tasks:**
- [ ] Save user's preferred editions
- [ ] Default CoC users to CoC editions
- [ ] Allow switching between CoC and LDS editions
- [ ] Remember edition preference per scripture work

---

## Sprint 5-6: Mobile App (Weeks 9-12)

### Priority 1: Scripture Reader

**Features:**
- [ ] Book/Chapter selector (respects edition chapter counts)
- [ ] Verse rendering with proper formatting
- [ ] Edition switcher in settings
- [ ] Cross-reference indicator (CoC ↔ LDS)

**Example UI:**
```
┌─────────────────────────────────┐
│ ◀  III Nephi 5        [ CoC ] ▼│
├─────────────────────────────────┤
│                                  │
│ 8 And it came to pass that when │
│ they heard this voice, and...   │
│                                  │
│ 9 And notwithstanding the mild- │
│ ness of the voice, behold...    │
│                                  │
│ [ LDS 3 Nephi 11:7-8 ]          │
└─────────────────────────────────┘
```

### Priority 2: Edition Settings

```
Settings > Scripture Editions
┌─────────────────────────────────┐
│ Book of Mormon:                  │
│ ● Community of Christ (1908)     │
│ ○ LDS Edition (2013)             │
│                                  │
│ Doctrine & Covenants:            │
│ ● Community of Christ (167 sec.) │
│ ○ LDS Edition (138 sections)     │
│                                  │
│ Bible:                           │
│ ● Inspired Version (JST)         │
│ ○ NRSV                           │
│                                  │
│ [ ] Show cross-edition refs      │
└─────────────────────────────────┘
```

### Priority 3: Offline Support
- [ ] Download CoC Book of Mormon (SQLite)
- [ ] Download CoC D&C sections 1-113
- [ ] Cache verse mappings
- [ ] Offline-first architecture

---

## Sprint 7-8: Search & Highlights (Weeks 13-16)

### Priority 1: Search

**Keyword Search:**
- [ ] Search within CoC edition
- [ ] Search across all editions
- [ ] Filter by book, chapter range

**Example:**
```
Search: "faith as a seed"
Results (CoC BoM):
  - Alma 16:21-28 (CoC)
    = Alma 32:21-28 (LDS)
```

### Priority 2: Highlights & Notes
- [ ] Create highlight (color-coded)
- [ ] Add personal note to verse
- [ ] Sync across devices (PouchDB)
- [ ] Tag notes by theme

---

## Data Import Priority

### P0 (Critical - Week 1-2)
1. ✅ Scripture works metadata
2. ✅ Edition metadata (6 editions)
3. [ ] CoC Book of Mormon (all 124 chapters, ~6,600 verses)
4. [ ] CoC D&C sections 1-50

### P1 (Important - Week 3-6)
5. [ ] CoC D&C sections 51-113
6. [ ] CoC D&C sections 114-131 (CoC-specific)
7. [ ] Verse mappings for Book of Mormon (CoC ↔ LDS)
8. [ ] LDS Book of Mormon (for comparison/scholarship)

### P2 (Nice to Have - Week 7-12)
9. [ ] CoC D&C sections 132-167
10. [ ] D&C section mappings (CoC ↔ LDS)
11. [ ] Inspired Version Bible (Genesis, Psalms, Gospels)
12. [ ] NRSV Bible (requires license)

---

## Success Metrics

### Week 4 (End of Sprint 2)
- [ ] 50+ CoC Book of Mormon chapters imported
- [ ] 100+ CoC D&C sections imported
- [ ] Database seeded with 10,000+ verses
- [ ] Basic API endpoints working

### Week 8 (End of Sprint 4)
- [ ] GraphQL API complete
- [ ] 100+ verse mappings working
- [ ] Edition switching functional
- [ ] API tests passing (70%+ coverage)

### Week 12 (End of Sprint 6)
- [ ] Mobile app scripture reader working
- [ ] Offline support functional
- [ ] Edition preferences saved
- [ ] Cross-references displaying correctly

### Week 16 (End of Sprint 8)
- [ ] Search working across editions
- [ ] Highlights and notes syncing
- [ ] Internal alpha testing begins
- [ ] 10+ CoC members providing feedback

---

## Technical Risks

### Risk 1: CoC Scripture Text Availability
**Mitigation:**
- Use Centerplace.org (has full CoC D&C)
- Contact Herald Publishing House for official texts
- Community of Christ website has scripture search

### Risk 2: Verse Mapping Complexity
**Mitigation:**
- Start with Joseph Smith Papers mapping tables
- Build algorithmic mapping for unmapped verses
- Manual verification for critical passages

### Risk 3: Copyright on Recent D&C Sections
**Mitigation:**
- Sections 163-167 are © Community of Christ
- Request permission from Community of Christ
- Provide proper attribution
- Non-commercial use should be acceptable

### Risk 4: NRSV Bible Licensing
**Mitigation:**
- NRSV requires license for distribution
- Start with Inspired Version (public domain)
- Contact National Council of Churches for NRSV license
- Phase 2 priority, not critical for MVP

---

## Next Actions (This Week)

1. ✅ Docker services running
2. ⚠️ **Install dependencies** (see DEPENDENCY_INSTALLATION_WSL2.md)
3. [ ] Generate Prisma migrations
4. [ ] Run database migrations
5. [ ] Seed scripture works and editions
6. [ ] Begin CoC Book of Mormon text acquisition
7. [ ] Set up scraper for Centerplace.org
8. [ ] Create import scripts for verse data

---

## Resources

- [Community of Christ Scriptures](https://cofchrist.org/scripture/)
- [Centerplace.org D&C](https://www.centerplace.org/hs/dc/)
- [Joseph Smith Papers - Versification](https://www.josephsmithpapers.org/back/corresponding-chapters-in-editions-of-the-book-of-mormon)
- [Herald Publishing House](https://www.heraldhouse.org/)

---

**Last Updated:** November 29, 2025
**Status:** Planning Complete, Ready for Implementation
**Blocker:** Dependency installation (WSL2 issue)
