# GraphQL API Guide - Community of Christ Scripture Study Tools

**Status:** ✅ Schema and Resolvers Implemented
**Database:** ✅ Operational with 16 verses across 2 editions
**Ready for Testing:** Manual testing recommended (WSL2 limitations prevent automated testing)

---

## Quick Start

### Connection Information
```
Endpoint: http://localhost:4000/graphql
Database: postgresql://pod_user:pod_secure_password@localhost:5434/bom_study_tools
```

### Sample Query
```graphql
query {
  editions {
    id
    shortName
    name
    year
  }
}
```

---

## Multi-Edition Scripture Queries

### 1. Get All Scripture Works
```graphql
query GetScriptureWorks {
  scriptureWorks {
    id
    name
    abbreviation
    description
    editions {
      id
      shortName
      name
      year
      versificationSystem
    }
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "scriptureWorks": [
      {
        "id": "book-of-mormon",
        "name": "Book of Mormon",
        "abbreviation": "BoM",
        "editions": [
          {
            "id": "coc-bom-1908",
            "shortName": "CoC BoM",
            "name": "Community of Christ Book of Mormon (1908)",
            "year": 1908,
            "versificationSystem": "original-chapters-1830"
          },
          {
            "id": "lds-bom-1913",
            "shortName": "LDS BoM",
            "versificationSystem": "pratt-1879"
          }
        ]
      }
    ]
  }
}
```

---

### 2. Get Editions (All or by Work)
```graphql
# All editions
query GetAllEditions {
  editions {
    id
    shortName
    name
    publisher
    year
    isPrimary
    isDefault
    copyrightHolder
  }
}

# Book of Mormon editions only
query GetBomEditions {
  editions(workId: "book-of-mormon") {
    id
    shortName
    name
    year
    versificationSystem
  }
}
```

---

### 3. Get Chapter Verses (Edition-Specific)
```graphql
query GetChapter {
  verses(
    book: "I Nephi"
    chapter: 1
    editionId: "coc-bom-1908"
  ) {
    id
    verse
    text
    verseType
    edition {
      shortName
      versificationSystem
    }
  }
}
```

**Current Data:**
- **I Nephi Chapter 1 (CoC):** 10 verses
- **III Nephi Chapter 5 (CoC):** 2 verses
- **Moroni Chapter 10 (CoC):** 2 verses

---

### 4. Get Specific Verse
```graphql
query GetVerse {
  verseByReference(
    book: "I Nephi"
    chapter: 1
    verse: 1
    editionId: "coc-bom-1908"
  ) {
    id
    text
    edition {
      shortName
      name
      year
    }
  }
}
```

**Response:**
```json
{
  "data": {
    "verseByReference": {
      "id": "coc-bom-1908:i-nephi-1-1",
      "text": "I, Nephi, having been born of goodly parents...",
      "edition": {
        "shortName": "CoC BoM",
        "name": "Community of Christ Book of Mormon (1908)",
        "year": 1908
      }
    }
  }
}
```

---

### 5. Get Verse by ID
```graphql
query GetVerseById {
  verse(id: "coc-bom-1908:i-nephi-1-1") {
    id
    book
    chapter
    verse
    text
    edition {
      shortName
      versificationSystem
    }
    equivalentVerses {
      id
      mappingType
      confidence
      toVerse {
        id
        book
        chapter
        verse
        edition {
          shortName
        }
      }
    }
  }
}
```

---

### 6. Cross-Edition Verse Mappings
```graphql
query GetVerseEquivalents {
  verseEquivalents(verseId: "coc-bom-1908:iii-nephi-5-8") {
    id
    mappingType
    confidence
    verified
    fromVerse {
      id
      book
      chapter
      verse
      edition {
        shortName
      }
    }
    toVerse {
      id
      book
      chapter
      verse
      edition {
        shortName
      }
    }
  }
}
```

**Example Mapping:**
```
CoC III Nephi 5:8 ↔ LDS 3 Nephi 11:7
(Different chapter divisions, same content)
```

---

## Schema Types

### ScriptureWork
```graphql
type ScriptureWork {
  id: ID!
  name: String!
  abbreviation: String!
  description: String
  editions: [Edition!]!
}
```

**Available Works:**
- `book-of-mormon` - Book of Mormon
- `doctrine-and-covenants` - Doctrine and Covenants
- `bible` - Holy Scriptures (Bible)

---

### Edition
```graphql
type Edition {
  id: ID!
  work: ScriptureWork!
  name: String!
  shortName: String!
  publisher: String!
  year: Int!
  language: String!
  versificationSystem: String!
  description: String
  isPublicDomain: Boolean!
  copyrightHolder: String
  isPrimary: Boolean!
  isDefault: Boolean!
}
```

**Available Editions:**
- `coc-bom-1908` - CoC Book of Mormon (original 1830 chapters)
- `lds-bom-2013` - LDS Book of Mormon (Pratt 1879 versification)
- `coc-dc-2017` - CoC D&C (167 sections)
- `lds-dc-2013` - LDS D&C (138 sections)
- `iv-bible-1867` - Inspired Version / JST
- `nrsv-1989` - NRSV Bible

---

### Verse
```graphql
type Verse {
  id: ID!
  edition: Edition!
  book: String!
  chapter: Int!
  verse: Int!
  text: String!
  verseType: String!
  highlights: [Highlight!]!
  notes: [Note!]!
  crossReferences: [CrossReference!]!
  equivalentVerses: [VerseMapping!]!
}
```

**Verse ID Format:**
```
{editionId}:{book-slug}-{chapter}-{verse}

Examples:
  coc-bom-1908:i-nephi-1-1
  lds-bom-2013:1-nephi-3-7
  coc-dc-2017:section-1-1
```

---

### VerseMapping
```graphql
type VerseMapping {
  id: ID!
  fromVerse: Verse!
  toVerse: Verse!
  mappingType: String!    # "exact", "partial", "merged", "split"
  confidence: Float!       # 0.0-1.0
  verified: Boolean!       # Manually verified by scholars
  notes: String
}
```

---

## Versification Systems

### Original Chapters (1830)
**Edition:** CoC Book of Mormon (1908)

Used by Community of Christ, matches Joseph Smith's original 1830 edition.

**Key Differences from LDS:**
- I Nephi: 6 chapters (vs. LDS 22 chapters)
- II Nephi: 11 chapters (vs. LDS 33 chapters)
- III Nephi: 14 chapters (vs. LDS 30 chapters)
- Alma: 29 chapters (vs. LDS 63 chapters)

### Pratt 1879 Versification
**Edition:** LDS Book of Mormon (2013)

Reorganized by Orson Pratt in 1879, now standard for LDS Church.

---

## Query Examples by Use Case

### 1. Scripture Reader App
```graphql
query ScriptureReader($editionId: ID!, $book: String!, $chapter: Int!) {
  edition(id: $editionId) {
    shortName
    versificationSystem
  }

  verses(book: $book, chapter: $chapter, editionId: $editionId) {
    verse
    text
    equivalentVerses {
      toVerse {
        id
        book
        chapter
        verse
        edition {
          shortName
        }
      }
    }
  }
}
```

**Variables:**
```json
{
  "editionId": "coc-bom-1908",
  "book": "I Nephi",
  "chapter": 1
}
```

---

### 2. Edition Switcher
```graphql
query EditionSwitcher($currentVerseId: ID!) {
  verse(id: $currentVerseId) {
    id
    book
    chapter
    verse
    edition {
      shortName
    }
    equivalentVerses {
      toVerse {
        id
        edition {
          shortName
          name
        }
      }
    }
  }
}
```

**Use Case:** User reading CoC III Nephi 5:8, wants to see LDS equivalent

---

### 3. Study Comparison
```graphql
query CompareEditions($book: String!, $chapter: Int!) {
  cocVerses: verses(
    book: $book
    chapter: $chapter
    editionId: "coc-bom-1908"
  ) {
    verse
    text
  }

  ldsVerses: verses(
    book: $book
    chapter: $chapter
    editionId: "lds-bom-2013"
  ) {
    verse
    text
  }
}
```

---

## Next Steps for Full Implementation

### Phase 1 (Current)
- [x] Multi-edition schema
- [x] GraphQL type definitions
- [x] Query resolvers
- [x] Field resolvers
- [ ] Import full scripture text (~7,600 verses)
- [ ] Complete verse mappings

### Phase 2
- [ ] User authentication queries
- [ ] Highlight and note mutations
- [ ] Search functionality
- [ ] Subscriptions (real-time)

### Phase 3
- [ ] AI/semantic search
- [ ] Group study features
- [ ] Memory card system

---

## Testing Recommendations

### Manual Testing via GraphQL Playground
1. Start API server: `npm run dev` (when WSL2 issues resolved)
2. Open http://localhost:4000/graphql
3. Try sample queries from this guide

### Direct Database Queries (Current Workaround)
```bash
# Test editions
docker exec pod_postgres psql -U pod_user -d bom_study_tools -c \
  "SELECT id, \"shortName\", name FROM editions;"

# Test verses
docker exec pod_postgres psql -U pod_user -d bom_study_tools -c \
  "SELECT book, chapter, verse, LEFT(text, 50) FROM verses LIMIT 10;"

# Test verse mappings
docker exec pod_postgres psql -U pod_user -d bom_study_tools -c \
  "SELECT * FROM verse_mappings;"
```

---

## Error Handling

### Common Errors

**VERSE_NOT_FOUND**
```json
{
  "errors": [{
    "message": "Verse not found",
    "extensions": { "code": "VERSE_NOT_FOUND" }
  }]
}
```

**EDITION_NOT_FOUND**
```json
{
  "errors": [{
    "message": "Edition not found",
    "extensions": { "code": "EDITION_NOT_FOUND" }
  }]
}
```

---

## Performance Notes

- **DataLoaders:** Not yet implemented - consider for N+1 query prevention
- **Caching:** Redis integration available but not configured
- **Pagination:** Not yet implemented for large verse lists

---

**Last Updated:** December 1, 2025
**API Version:** Phase 1 - Multi-Edition Support
**Documentation Status:** Complete for implemented features
