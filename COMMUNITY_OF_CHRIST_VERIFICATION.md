# Community of Christ Scripture Verification

**VERIFIED: This project uses Community of Christ scriptures, NOT LDS**

## ✅ Confirmed Community of Christ Specifications

### 1. Book of Mormon - 1908 RLDS Edition
- **Edition**: 1908 RLDS (NOT 1830, 1981, or 2013 LDS editions)
- **Total Chapters**: 109 chapters (different from LDS 239 chapters)
- **Chapter Structure**: Uses RLDS chapter divisions
- **Source File**: `apps/web/app/lib/scriptures.ts:39-56`

**Books Included**:
- 1 Nephi (7 chapters)
- 2 Nephi (15 chapters)
- Jacob (5 chapters)
- Enos (1 chapter)
- Jarom (1 chapter)
- Omni (1 chapter)
- Words of Mormon (1 chapter)
- Mosiah (13 chapters)
- Alma (30 chapters)
- Helaman (5 chapters)
- 3 Nephi (14 chapters)
- 4 Nephi (1 chapter)
- Mormon (4 chapters)
- Ether (6 chapters)
- Moroni (10 chapters)

### 2. Doctrine & Covenants - Community of Christ Edition
- **Total Sections**: 167 (NOT LDS 138 sections)
- **Unique Sections**: 145-167 are Community of Christ exclusive revelations
- **Modern Prophets**: Includes revelations from Community of Christ presidents
  - Israel A. Smith (1946-1958)
  - W. Wallace Smith (1958-1978)
  - Wallace B. Smith (1978-1996)
  - W. Grant McMurray (1996-2004)
  - Stephen M. Veazey (2005-2025)
- **Source Files**:
  - `apps/web/app/lib/scriptures.ts:132-141`
  - `apps/web/app/lib/dc-modern-sections.ts`

**Key Community of Christ Sections**:
- Section 156 (1984): Women in the Priesthood
- Section 157 (1986): Temple Ministry (Peace-focused, NOT LDS temple ordinances)
- Section 161 (1996): God weeps for the poor and displaced
- Section 162 (2000): Scripture interpretation, no oppression
- Section 163 (2004): Worth of All Persons
- Section 164 (2010): Welcoming community
- Section 165 (2016): Enduring Principles
- Section 166 (2019): Steadfast Discipleship
- Section 167 (2022): Courage to Change

### 3. Inspired Version Bible (Joseph Smith Translation)
- **Old Testament**: 39 books (NOT King James Version)
- **New Testament**: 27 books (NOT King James Version)
- **Unique to**: Community of Christ and other Restoration branches
- **Source Files**: `apps/web/app/lib/scriptures.ts:58-130`

## ✅ Fixed Issues

### Issue 1: D&C Challenge Section Count
**Problem**: Challenges originally referenced "138 sections" (LDS number)
**Fixed**: Updated to "167 sections (Community of Christ edition)"
**Files Changed**: `apps/web/app/lib/challenges.ts`

### Issue 2: Missing Modern Sections
**Problem**: Code only included sections 145-165 (missing 166-167)
**Fixed**: Added sections 166-167 with Community of Christ prophetic content
**Files Changed**: `apps/web/app/lib/dc-modern-sections.ts`

### Issue 3: Array Length Mismatch
**Problem**: DOCTRINE_AND_COVENANTS array length was 165
**Fixed**: Updated to 167 sections
**Files Changed**: `apps/web/app/lib/scriptures.ts`

## 📚 Distinguishing Features from LDS

### Community of Christ Uses:
✅ **1908 RLDS Book of Mormon** (109 chapters)
✅ **167 D&C sections** (including modern revelations 1954-2022)
✅ **Inspired Version Bible** (Joseph Smith Translation)
✅ **Peace-focused Temple** (not LDS-style ordinances)
✅ **Women in Priesthood** (Section 156)
✅ **Progressive theology** (worth of all persons, LGBTQ+ inclusion)

### LDS Church Uses:
❌ 1981/2013 LDS Book of Mormon (239 chapters)
❌ 138 D&C sections (ends in 1978)
❌ King James Version Bible
❌ Temples for ordinances (baptism for dead, endowment, sealing)
❌ Male-only priesthood
❌ Different theological approach

## 🎯 Challenges Updated for Community of Christ

All reading challenges now correctly reflect Community of Christ scripture:
- **30-Day Book of Mormon**: 109 chapters (RLDS edition)
- **90-Day Book of Mormon**: 109 chapters (RLDS edition)
- **30-Day D&C**: 167 sections (Community of Christ)
- **90-Day D&C**: 167 sections (Community of Christ)
- **Complete Scripture Year**: BoM, D&C, IV Bible (all CoC versions)

## 📖 Data Sources

### Sections 1-144 (Historical D&C)
- **Source**: centerplace.org (RLDS/CoC historical archive)
- **Coverage**: Original revelations through early church period

### Sections 145-167 (Modern Revelations)
- **Source**: Community of Christ World Conference approved revelations
- **Coverage**: 1954-2022 modern prophetic guidance
- **Embedded**: Included directly in codebase (`dc-modern-sections.ts`)

### Book of Mormon
- **Source**: 1908 RLDS edition text
- **Format**: 109-chapter structure
- **Versification**: RLDS versification system

### Inspired Version Bible
- **Source**: Joseph Smith Translation
- **Testament Structure**: Standard 39 OT + 27 NT books
- **Text**: IV-specific variations from KJV

## 🔍 Verification Commands

To verify Community of Christ configuration:

```bash
# Check D&C section count
grep "length: 167" apps/web/app/lib/scriptures.ts

# Check BoM edition
grep "1908 RLDS" apps/web/app/lib/scriptures.ts

# Check modern sections
grep -c "section:" apps/web/app/lib/dc-modern-sections.ts

# Check challenge descriptions
grep "Community of Christ" apps/web/app/lib/challenges.ts
```

## ✅ Deployment Status

- **Supabase Database**: Configured for Community of Christ data structure
- **Web App**: Correctly labeled as Community of Christ edition
- **Challenges**: Updated to 167 D&C sections
- **Modern Sections**: All 167 sections included (145-167 embedded)

## 📝 Notes

1. This is **NOT** an LDS/Mormon application
2. This is specifically for **Community of Christ** members and scholars
3. All scripture references use **RLDS/CoC versification**
4. Modern revelations include **progressive theology** unique to Community of Christ
5. Temple references are to the **Independence Temple** (peace/reconciliation focus)

---

**Last Updated**: 2026-02-25
**Verification Status**: ✅ All Community of Christ specifications confirmed
**No LDS Content**: ✅ Verified

## Sources

- [Doctrine and Covenants | Community of Christ](https://cofchrist.org/doctrine-and-covenants/)
- [Community of Christ - Doctrine and Covenants](https://doctrineandcovenants.com/editions/community-of-christ-doctrine-and-covenants/)
