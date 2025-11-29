# Community of Christ Scripture Versification

## Overview

This document outlines the unique scripture versification systems used by Community of Christ and how they differ from other Latter Day Saint traditions (particularly the Church of Jesus Christ of Latter-day Saints).

---

## Scripture Canon

Community of Christ recognizes three standard works:

1. **Book of Mormon** (1830 original versification)
2. **Doctrine and Covenants** (167 sections as of 2025, growing)
3. **Holy Scriptures** (Bible)
   - Inspired Version (Joseph Smith Translation)
   - NRSV (New Revised Standard Version) - recommended

---

## Book of Mormon Versification

### Original Chapter System (Community of Christ)

Community of Christ uses the **1830 original chapter divisions** which are:
- **Longer chapters** based on narrative cohesiveness
- **Preserves original structure** as published by Joseph Smith
- **Fewer chapters** overall (e.g., III Nephi has 14 chapters vs. LDS 30 chapters)

### Pratt Chapter System (LDS Church)

The LDS Church uses Orson Pratt's **1879 versification** which:
- **Smaller chapters** based on thematic breaks
- **No chapter exceeds 100 verses**
- **More granular** navigation

### Cross-Reference Example

| Community of Christ | LDS Church |
|---------------------|------------|
| III Nephi 5:8 | 3 Nephi 11:7 |
| I Nephi 1:2-3 | 1 Nephi 1:2-3 (same) |
| Ether 1:1-5 | Ether 1:1-5 (same) |

**Mapping Resource:** Joseph Smith Papers provides corresponding versification tables between 1992 Community of Christ edition and 2013 LDS edition.

---

## Doctrine and Covenants Sections

### Community of Christ Edition

**Current Count:** 167 sections (as of 2025)

**Section Breakdown by Presidency:**

| Presidency | Sections | Years |
|------------|----------|-------|
| Joseph Smith | 1–113 (includes 108A) | 1828–1844 |
| Joseph Smith III | 114–131 | 1860–1914 |
| Frederick M. Smith | 132–138 | 1914–1946 |
| Israel A. Smith | 139–144 | 1946–1958 |
| W. Wallace Smith | 145–152 (includes 149A) | 1958–1978 |
| Wallace B. Smith | 153–160 | 1978–1996 |
| W. Grant McMurray | 161–162 | 1996–2004 |
| Stephen M. Veazey | 163–167 | 2005–2025 |

**Key Differences from LDS:**

1. **Numbering Divergence (1906)**
   - Sections 3–9 were renumbered in 1906
   - CoC and LDS section numbers don't align after section 2

2. **Growing Canon**
   - New sections added every few years by current prophet-president
   - LDS D&C is essentially closed (138 sections, last added 1978)

3. **Content Differences**
   - Sections 114+ are unique to Community of Christ
   - Focus on modern revelations for church governance and mission

### Section Mapping (Early Sections)

| Community of Christ | LDS Church | Notes |
|---------------------|------------|-------|
| Section 1 | Section 1 | Same |
| Section 2 | Section 2 | Same |
| Section 3 | Section 10 | Divergence begins |
| Section 4 | Section 3 | |
| Section 5 | Section 4 | |
| ... | ... | Requires full mapping table |

**Mapping Resource:** Joseph Smith Papers provides corresponding section numbers table.

---

## Bible Editions

### 1. Inspired Version (Joseph Smith Translation)

**History:**
- Revision of the King James Bible by Joseph Smith (1830s)
- First published by RLDS Church (now Community of Christ) in 1867
- Copyright held by Community of Christ until 2024
- Manuscripts sold to LDS Church for $192.5M in 2024

**Current Status:**
- Still published by Herald Publishing House
- Public domain (1867 edition)
- Continues to be official Bible of Community of Christ

**Abbreviation:** IV or JST

### 2. New Revised Standard Version (NRSV)

**Status:**
- Recommended by Community of Christ as "good, recent translation"
- Used alongside Inspired Version
- Copyright held by National Council of Churches (USA)

**Abbreviation:** NRSV

---

## Technical Implementation Requirements

### Database Schema Needs

1. **Multi-Edition Support**
   - Store multiple editions of same work (CoC BoM, LDS BoM, etc.)
   - Edition metadata (year, publisher, versification system)

2. **Cross-Reference Mapping**
   - Map verses between CoC and LDS editions
   - Support "exact", "partial", "merged", "split" mapping types
   - Example: III Nephi 5:8 (CoC) ↔ 3 Nephi 11:7 (LDS)

3. **Growing Canon Support**
   - D&C sections can be added over time
   - Versioning system for scripture updates
   - Migration scripts for new revelations

4. **Multiple Bible Versions**
   - Inspired Version text storage
   - NRSV text storage (requires licensing)
   - Version selector in UI

### API Considerations

```graphql
type Verse {
  id: ID!
  edition: Edition!
  book: String!
  chapter: Int!
  verse: Int!
  text: String!

  # Cross-edition equivalents
  equivalents: [Verse!]!
}

type Edition {
  id: ID!
  work: ScriptureWork!
  name: String!
  publisher: String!
  year: Int!
  versificationSystem: String!
}

enum ScriptureWork {
  BOOK_OF_MORMON
  DOCTRINE_AND_COVENANTS
  BIBLE
}

query getVerse($reference: String!, $edition: EditionId!) {
  verse(reference: $reference, edition: $edition) {
    id
    text
    equivalents {
      edition { name }
      reference
    }
  }
}
```

### UI/UX Considerations

1. **Edition Selector**
   - Let users choose preferred edition (CoC vs LDS)
   - Default to Community of Christ editions
   - Show cross-references to other editions

2. **Reference Display**
   - CoC format: "III Nephi 5:8"
   - LDS format: "3 Nephi 11:7"
   - Allow both input formats

3. **D&C Section Awareness**
   - Show which sections are CoC-specific (114+)
   - Indicate when section numbers diverge from LDS

---

## Data Sources

### Primary Sources

1. **Community of Christ Official Texts**
   - Herald Publishing House editions
   - [cofchrist.org/scripture](https://cofchrist.org/scripture/)

2. **Joseph Smith Papers**
   - Versification mapping tables
   - [josephsmithpapers.org](https://www.josephsmithpapers.org/)

3. **Centerplace.org**
   - Online CoC scriptures
   - D&C with section history

### Mapping Tables Needed

1. ✅ **Book of Mormon**: CoC ↔ LDS verse mapping
2. ✅ **Doctrine & Covenants**: CoC ↔ LDS section mapping
3. ⏳ **Bible**: IV/JST variant verses (vs. KJV)

---

## Copyright and Licensing

### Community of Christ Scriptures

**Book of Mormon:**
- Public domain (1830 original)
- CoC edition published by Herald Publishing House

**Doctrine and Covenants:**
- Public domain (early sections)
- Recent sections (163-167): © Community of Christ
- Need permission for commercial use of recent revelations

**Inspired Version (Bible):**
- 1867 edition: Public domain
- Recent editions: Herald Publishing House
- 2024: Manuscripts transferred to LDS Church (doesn't affect publishing rights)

### Third-Party Bible Versions

**NRSV:**
- © National Council of Churches
- Requires licensing for distribution
- Cannot include full text without permission
- See: [nrsvbibles.org](https://nrsvbibles.org/)

---

## Implementation Priority

### Phase 1: Foundation
1. ✅ Book of Mormon (CoC original chapters only)
2. ✅ Doctrine & Covenants (sections 1-167)
3. ⏳ Verse/section mapping tables

### Phase 2: Multi-Edition
4. ⏳ LDS Book of Mormon (Pratt versification)
5. ⏳ Cross-reference API
6. ⏳ Edition switcher in UI

### Phase 3: Bible Support
7. ⏳ Inspired Version (public domain verses)
8. ⏳ NRSV (if licensed)
9. ⏳ IV variant comparison

---

## References

- [Community of Christ Scripture](https://cofchrist.org/scripture/)
- [Joseph Smith Papers - BoM Versification](https://www.josephsmithpapers.org/back/corresponding-chapters-in-editions-of-the-book-of-mormon)
- [Joseph Smith Papers - D&C Sections](https://www.josephsmithpapers.org/back/corresponding-section-numbers-in-editions-of-the-doctrine-and-covenants)
- [Centerplace.org - CoC D&C](https://www.centerplace.org/hs/dc/)
- [Herald Publishing House](https://www.heraldhouse.org/)

---

**Last Updated:** November 29, 2025
**Maintained By:** Development Team
**Status:** Living Document (D&C sections will grow over time)
