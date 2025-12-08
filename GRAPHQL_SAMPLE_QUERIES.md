# Sample GraphQL Queries for Testing

**Database:** 34 verses across 3 editions (CoC BoM, CoC D&C, LDS BoM)
**Ready to test:** Use GraphQL Playground at http://localhost:4000/graphql

---

## 1. Get All Scripture Works

```graphql
query GetAllWorks {
  scriptureWorks {
    id
    name
    abbreviation
    description
    editions {
      id
      shortName
      year
      versificationSystem
    }
  }
}
```

**Expected:** 3 works (Book of Mormon, Doctrine & Covenants, Bible)

---

## 2. Get All Editions

```graphql
query GetAllEditions {
  editions {
    id
    shortName
    name
    publisher
    year
    versificationSystem
    isPrimary
    isDefault
  }
}
```

**Expected:** 6 editions

---

## 3. Get Book of Mormon Editions Only

```graphql
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

**Expected:** 2 editions (CoC 1908, LDS 2013)

---

## 4. Get Complete I Nephi Chapter 1 (CoC)

```graphql
query GetINephiCh1 {
  verses(
    book: "I Nephi"
    chapter: 1
    editionId: "coc-bom-1908"
  ) {
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

**Expected:** 20 verses (complete chapter!)

---

## 5. Get D&C Section 1 (CoC)

```graphql
query GetDCSection1 {
  verses(
    book: "Doctrine and Covenants"
    chapter: 1
    editionId: "coc-dc-2017"
  ) {
    verse
    text
    edition {
      shortName
      name
    }
  }
}
```

**Expected:** 8 verses

---

## 6. Get Specific Verse with Full Details

```graphql
query GetVerseDetails {
  verse(id: "coc-bom-1908:i-nephi-1-1") {
    id
    book
    chapter
    verse
    text
    verseType
    edition {
      id
      shortName
      name
      year
      publisher
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

**Expected:** Full verse details including edition metadata

---

## 7. Get Verse by Reference

```graphql
query GetVerseByRef {
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
    }
  }
}
```

**Expected:** I Nephi 1:1 text

---

## 8. Get Cross-Edition Equivalents

```graphql
query GetEquivalents {
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
      text
      edition {
        shortName
      }
    }
    toVerse {
      id
      book
      chapter
      verse
      text
      edition {
        shortName
      }
    }
  }
}
```

**Expected:** 1 mapping (CoC III Nephi 5:8 → LDS 3 Nephi 11:7)

---

## 9. Get Edition with All Verses

```graphql
query GetEditionWithVerses {
  edition(id: "coc-bom-1908") {
    id
    name
    shortName
    year
    publisher
    work {
      name
      abbreviation
    }
  }
}
```

**Expected:** CoC BoM 1908 edition details with work reference

---

## 10. Get Specific Work with Editions

```graphql
query GetBomWork {
  scriptureWork(id: "book-of-mormon") {
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

**Expected:** Book of Mormon work with 2 editions

---

## 11. Test Nested Field Resolvers

```graphql
query TestNestedResolvers {
  verses(
    book: "I Nephi"
    chapter: 1
    editionId: "coc-bom-1908"
  ) {
    id
    verse
    text
    edition {
      shortName
      work {
        name
        abbreviation
      }
    }
  }
}
```

**Expected:** 20 verses with deeply nested edition → work data

---

## 12. Get Multiple Chapters

```graphql
query GetMultipleChapters {
  cocINephi: verses(
    book: "I Nephi"
    chapter: 1
    editionId: "coc-bom-1908"
  ) {
    verse
    text
  }

  cocDC: verses(
    book: "Doctrine and Covenants"
    chapter: 1
    editionId: "coc-dc-2017"
  ) {
    verse
    text
  }
}
```

**Expected:** Both I Nephi 1 and D&C 1 in single response

---

## 13. Compare Editions (CoC vs LDS)

```graphql
query CompareEditions {
  cocVerse: verse(id: "coc-bom-1908:iii-nephi-5-8") {
    id
    book
    chapter
    verse
    text
    edition {
      shortName
      versificationSystem
    }
  }

  ldsVerse: verse(id: "lds-bom-2013:3-nephi-11-7") {
    id
    book
    chapter
    verse
    text
    edition {
      shortName
      versificationSystem
    }
  }
}
```

**Expected:** Same content, different chapter/verse numbers

---

## 14. Test Error Handling (Non-existent Verse)

```graphql
query TestError {
  verse(id: "coc-bom-1908:alma-1-1") {
    id
    text
  }
}
```

**Expected Error:**
```json
{
  "errors": [{
    "message": "Verse not found",
    "extensions": {
      "code": "VERSE_NOT_FOUND"
    }
  }]
}
```

---

## 15. Test Error Handling (Non-existent Edition)

```graphql
query TestEditionError {
  verses(
    book: "I Nephi"
    chapter: 1
    editionId: "fake-edition"
  ) {
    verse
  }
}
```

**Expected:** Empty array (no error)

---

## Current Database Statistics

```sql
-- Run this in PostgreSQL to see current data:
SELECT
  e."shortName" as edition,
  v.book,
  v.chapter,
  COUNT(v.id) as verses,
  MIN(v.verse) as first,
  MAX(v.verse) as last
FROM editions e
LEFT JOIN verses v ON v."editionId" = e.id
WHERE v.id IS NOT NULL
GROUP BY e."shortName", v.book, v.chapter
ORDER BY e."shortName", v.book, v.chapter;
```

**Current Data:**
| Edition | Book | Chapter | Verses | Range |
|---------|------|---------|--------|-------|
| CoC D&C | Doctrine and Covenants | 1 | 8 | 1-8 |
| CoC BoM | I Nephi | 1 | 20 | 1-20 ✅ Complete! |
| CoC BoM | III Nephi | 5 | 2 | 8-9 |
| CoC BoM | Moroni | 10 | 2 | 4-5 |
| LDS BoM | 1 Nephi | 3 | 1 | 7 |
| LDS BoM | 3 Nephi | 11 | 1 | 7 |

**Total: 34 verses**

---

## Testing Checklist

When API server is running:

- [ ] Open http://localhost:4000/graphql
- [ ] Run query #1 (Get All Works)
- [ ] Run query #2 (Get All Editions)
- [ ] Run query #4 (Get I Nephi Ch 1 - should return 20 verses)
- [ ] Run query #5 (Get D&C Section 1 - should return 8 verses)
- [ ] Run query #8 (Get Cross-Edition Equivalents)
- [ ] Run query #14 (Test error handling)
- [ ] Verify all field resolvers work (query #11)

---

## Next Steps After Testing

1. **Add more verses:**
   - Complete I Nephi chapters 2-6
   - Complete D&C Section 1 (remaining verses)
   - Add more verse mappings

2. **Implement mutations:**
   - User authentication
   - Create/update highlights
   - Create/update notes

3. **Add search:**
   - Keyword search across verses
   - Filter by edition
   - Search within book

4. **Performance optimization:**
   - Add DataLoaders
   - Implement caching
   - Add pagination

---

**Last Updated:** December 1, 2025
**Database:** 34 verses ready for testing
**API Status:** Ready to start server
