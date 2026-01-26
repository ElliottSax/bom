# Community of Christ Integration Plan

**Date:** January 26, 2026
**Purpose:** Integrate authentic CoC/RLDS study materials into the BOM Study Tools platform
**Approach:** Authentic CoC perspective with historical RLDS materials from Archive.org

---

## Executive Summary

Transform the BOM Study Tools from a generic platform into an **authentic Community of Christ study resource** that:
- Uses actual RLDS/CoC study materials from archive.org (public domain)
- Integrates CoC-specific D&C sections 114-167
- Provides CoC theological perspective throughout
- Links to modern CoC resources (Herald House, Gathering)
- Maintains historical RLDS context and materials

---

## Phase 1: Immediate Implementation (Week 1-2)

### 1.1 Add CoC Resources Section ✅

**Location:** New "CoC Resources" page/modal in web and mobile apps

**Content:**
```
📚 Community of Christ Study Resources

OFFICIAL CoC RESOURCES (Free/Purchase):
• Gathering Resources - https://gathering.cofchrist.org/
  → FREE worship guides, lessons, study materials

• Herald House Publications - https://www.heraldhouse.org/
  → Doctrine & Covenants Commentary Volumes 1-2
  → Sharing in Community of Christ ($6.95)
  → Scripture study materials

• Centerplace.org - http://www.centerplace.org/
  → FREE D&C sections 114-167 with notes
  → Inspired Version cross-references
  → RLDS historical documents

HISTORICAL RLDS MATERIALS (Free - Public Domain):
• Saints' Herald Archive (1860-1928)
  → https://archiveviewer.org/collections/en/saints-herald-rlds

• Joseph Smith III History (4 volumes)
  → https://archive.org/details/historyofchurcho03smitrich

• 1874 RLDS Book of Mormon
  → https://archive.org/details/TheBookOfMormon1874

• Inspired Version Bible (1867)
  → https://archive.org/details/josephsmithsnewt00smit

ABOUT COMMUNITY OF CHRIST:
• Official Website - https://cofchrist.org/
• Who We Are, Mission, Enduring Principles
• Find a Congregation
```

**Implementation:**
- Add `CoCResourcesModal.tsx` component
- Add menu item "CoC Resources" in Settings/About section
- Include brief intro to CoC identity and mission

---

### 1.2 Add "About Community of Christ" Section ✅

**Content:**

```markdown
# About Community of Christ

Community of Christ (formerly the Reorganized Church of Jesus Christ of Latter Day Saints, 1860-2001) is an international Christian denomination with headquarters in Independence, Missouri.

## Our Identity
Founded in 1860 under the leadership of Joseph Smith III (son of Joseph Smith Jr.), Community of Christ continues the prophetic ministry through continuing revelation.

## Eight Sacraments
1. Baptism
2. Confirmation
3. Lord's Supper (Communion)
4. Laying on of Hands for the Sick
5. Ordination to Priesthood
6. Marriage
7. Blessing of Children
8. Counsel/Evangelist Blessing

## Enduring Principles
- Grace and generosity
- Sacredness of creation
- Continuing revelation
- Worth of all persons
- All are called
- Responsible choices
- Pursuit of peace (Shalom)
- Unity in diversity
- Blessings of community

## Key Distinctions from LDS Church
✅ Women ordained to priesthood (since 1984)
✅ Eight sacraments (not temple ordinances)
✅ No baptism for the dead
✅ Progressive Christianity emphasis
✅ LGBTQ+ inclusive policies
✅ Environmental stewardship focus
✅ Peace and justice mission
✅ Continued prophetic ministry (Section 167, 2025)

## Current Leadership
President: Stephen M. Veazey (2005-present)
```

---

### 1.3 Update D&C to Include Sections 114-167 ✅

**Data Source:** Centerplace.org (public access)

**Implementation Steps:**
1. Scrape sections 114-167 from http://www.centerplace.org/dc/
2. Add to database with CoC-specific metadata
3. Update UI to show all 167 sections (not just 113)
4. Add filter toggle: "Shared (1-113)" | "CoC-Specific (114-167)" | "All"

**Database Schema Update:**
```sql
ALTER TABLE doctrine_covenants_sections ADD COLUMN tradition VARCHAR(10) DEFAULT 'shared';
-- 'shared', 'coc', 'lds'

ALTER TABLE doctrine_covenants_sections ADD COLUMN prophet_received VARCHAR(100);
ALTER TABLE doctrine_covenants_sections ADD COLUMN date_received DATE;
ALTER TABLE doctrine_covenants_sections ADD COLUMN conference_date DATE;

-- Example data for Section 156 (Women's Ordination)
INSERT INTO doctrine_covenants_sections VALUES (
  156,
  'coc',
  'W. Wallace Smith',
  '1984-04-01',
  '1984-04-05',
  'The spirit of the church is to be one of peace and reconciliation...'
);
```

---

## Phase 2: CoC-Specific Course Content (Week 2-4)

### 2.1 Create "Introduction to Community of Christ" Course

**Source Materials:**
- "Sharing in Community of Christ" (Herald House, $6.95)
- Gathering Resources free curriculum
- Historical RLDS materials from archive.org

**Course Outline:**

#### Lesson 1: Origins and History (RLDS Heritage)
**Materials:**
- Joseph Smith III History (archive.org)
- Saints' Herald articles on 1860 reorganization
- Succession crisis of 1844-1860

**Content:**
```
• 1844 succession crisis after Joseph Smith Jr.'s death
• Emma Smith's role in preserving JST manuscript
• Joseph Smith III's reluctant acceptance (1860)
• Key differences from Brigham Young's leadership
• Development of RLDS Church (1860-2001)
• Transition to Community of Christ name (2001)
```

#### Lesson 2: Eight Sacraments
**Materials:**
- CoC official website explanations
- Comparison with LDS ordinances
- Theological basis from D&C sections

**Content:**
```
• Baptism by immersion (believers)
• Confirmation and gift of Holy Spirit
• Lord's Supper (open communion)
• Laying on of hands for sick
• Ordination to priesthood (all genders)
• Marriage covenant
• Blessing of children (not saving ordinance)
• Evangelist blessing (personal ministry)
```

#### Lesson 3: Enduring Principles and Mission
**Materials:**
- CoC official enduring principles
- Peace and justice emphasis
- Creation care theology

#### Lesson 4: Women in Ministry (1984 Revelation)
**Materials:**
- D&C Section 156
- Historical context from Smith College essay
- Dialogue Journal articles
- Current statistics on women in priesthood

**Content:**
```
• 1984 revelation to W. Wallace Smith
• Text of Section 156
• Controversy and church schism
• Current practice: ~25% of priesthood are women
• Restoration Branches split-off
• Theological basis for equality
```

#### Lesson 5: Temple Theology (Kirtland & Independence)
**Materials:**
- Kirtland Temple history (owned by CoC since 1880)
- Independence Temple dedication (1994)
- Comparison with LDS temple practices

**Content:**
```
• Kirtland Temple: Historic site, tours, community worship
• Independence Temple: Peace symbol, open to all, spiral design
• NO temple work for dead (different theology)
• Focus on peace, meditation, community gathering
• Contrast with LDS exclusivity and ordinances
```

#### Lesson 6: Book of Mormon in CoC Perspective
**Materials:**
- 1908 CoC Authorized Edition
- CoC interpretation vs LDS literal historicity
- Progressive Christianity lens

**Content:**
```
• 1830 original chapter divisions (not Pratt 1879)
• Open to various interpretations:
  - Literal history
  - Spiritual allegory
  - Inspired fiction with truth
• Focus on Christ's message over historicity debates
• Use for peace, justice, inclusion principles
```

---

### 2.2 Create "Book of Mormon: CoC Study Guide" Course

**Source Materials:**
- 1874 RLDS BoM edition (archive.org)
- Saints' Herald sermon series on BoM (1892-1894)
- Modern CoC study guides

**Course Structure:** 12 lessons covering:

#### Lesson 1: 1 Nephi - Justice and Compassion
**CoC Perspective:**
- Nephi's vision of Mary and Christ (I Nephi 3)
- Focus on Christ's love, not exclusivity
- Application to modern justice work

#### Lesson 2: 2 Nephi - Isaiah and Christ
**CoC Perspective:**
- Nephi's testimony of Christ (II Nephi 11)
- Peace prophecies from Isaiah
- Environmental stewardship themes

#### Lesson 3: Jacob - Grace and Inclusion
**CoC Perspective:**
- Jacob's temple sermon on wealth inequality (Jacob 2)
- Condemnation of pride and exclusion
- God's love for all people (not just covenant Israel)

#### Lesson 4: Alma - Restoration and Community
**CoC Perspective:**
- Alma's conversion and restoration (Alma 17-18)
- Church as community, not institution
- Shared ministry (not hierarchical authority)

#### Lesson 5: Christ's Visit - Sermon on the Mount
**CoC Perspective:**
- III Nephi 5 (Christ's sermon)
- Peacemaking emphasis
- Sacrament as community meal

**And so on...**

---

### 2.3 Create "D&C Sections 114-167: CoC Revelations" Course

**Source Materials:**
- Dale Luffman's Commentary Volume 2 (Herald House)
- Centerplace.org section notes
- Historical Saints' Herald articles

**Course Structure:** 10 lessons

#### Lesson 1: Joseph Smith III Era (114-121)
**Content:**
- 1860s revelations on church organization
- Polygamy rejection (explicit in early sections)
- Gathering to Independence vs. Utah

#### Lesson 2: Frederick M. Smith Era (122-133)
**Content:**
- Early 1900s revelations
- Zionic principles
- Social gospel emphasis

#### Lesson 3: Israel A. Smith / W. Wallace Smith (134-151)
**Content:**
- Mid-20th century revelations
- Church expansion
- Building toward Section 156

#### Lesson 4: Section 156 - Women's Ordination (1984)
**In-Depth Study:**
```
Full text of Section 156
Historical context (40+ year debate)
Theological arguments pro/con
Church schism and Restoration Branches
Current practice and statistics
Personal testimonies from women in ministry
```

#### Lesson 5: Grant McMurray Era (152-155)
**Content:**
- 1990s-2000s revelations
- Name change preparation
- Progressive Christianity emergence

#### Lesson 6: Stephen M. Veazey Era (156-167)
**Content:**
- 2000s-2020s revelations
- Temple completion (Section 156)
- LGBTQ+ inclusion (implicit in principles)
- Latest revelation (Section 167, 2025)

---

## Phase 3: Technical Implementation (Week 3-5)

### 3.1 Database Schema Updates

```sql
-- Add CoC-specific tables
CREATE TABLE coc_study_materials (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  author VARCHAR(255),
  publication_year INT,
  source_url TEXT,
  material_type VARCHAR(50), -- 'saints_herald', 'sermon', 'history', 'modern'
  copyright_status VARCHAR(50), -- 'public_domain', 'copyrighted', 'fair_use'
  full_text TEXT,
  summary TEXT,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add Inspired Version variations
CREATE TABLE inspired_version_changes (
  id SERIAL PRIMARY KEY,
  book VARCHAR(100),
  chapter INT,
  verse INT,
  kjv_text TEXT,
  iv_text TEXT,
  change_type VARCHAR(50), -- 'addition', 'deletion', 'modification', 'clarification'
  significance VARCHAR(20), -- 'minor', 'moderate', 'major'
  notes TEXT
);

-- Add CoC course materials
CREATE TABLE coc_courses (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255),
  subtitle VARCHAR(255),
  description TEXT,
  level VARCHAR(20), -- 'beginner', 'intermediate', 'advanced'
  duration VARCHAR(50),
  source_materials TEXT[], -- Array of source URLs/references
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE coc_lessons (
  id VARCHAR(50) PRIMARY KEY,
  course_id VARCHAR(50) REFERENCES coc_courses(id),
  lesson_number INT,
  title VARCHAR(255),
  objectives TEXT[],
  source_materials TEXT[],
  content TEXT, -- Markdown
  discussion_questions TEXT[],
  scripture_references JSONB, -- [{book, chapter, verseStart, verseEnd}]
  historical_context TEXT,
  coc_perspective TEXT,
  quiz_questions JSONB
);
```

### 3.2 UI Updates

**New Components:**
- `CoCResourcesModal.tsx` - Links to external CoC resources
- `AboutCoCModal.tsx` - CoC identity, mission, beliefs
- `DCFilterToggle.tsx` - Filter D&C by tradition
- `InspiredVersionToggle.tsx` - Switch between KJV and IV
- `CoCCourseCard.tsx` - Course cards with CoC branding
- `HistoricalMaterialViewer.tsx` - View archive.org PDFs

**Updated Components:**
- `VolumeHomeScreen.tsx` - Add D&C sections 114-167
- `SettingsPanel.tsx` - Add "Tradition" preference (CoC/LDS/Both)
- `SearchModal.tsx` - Add tradition filter
- `Sidebar.tsx` - Add "CoC Resources" menu item

---

## Phase 4: Historical Materials Integration (Week 5-8)

### 4.1 Saints' Herald Archive Integration

**Source:** https://archiveviewer.org/collections/en/saints-herald-rlds

**Implementation:**
```javascript
// Scrape and index Saints' Herald articles
const saintsHeraldSources = [
  {
    volume: 1,
    year: 1860,
    url: 'https://archive.org/details/saintsheraldvol01unkngoog',
    topics: ['church_organization', 'succession', 'joseph_smith_iii']
  },
  {
    volume: 26,
    year: 1879,
    url: 'https://archive.org/details/TheSaintsHerald_Volume_26_1879',
    topics: ['temple_lot', 'doctrine', 'prophecy']
  },
  // ... more volumes
];

// Feature: Search Saints' Herald by topic
// Feature: Show relevant Herald articles for each BoM chapter
// Feature: Historical context for each D&C section
```

### 4.2 Joseph Smith III Historical Materials

**Source:** https://archive.org/details/historyofchurcho03smitrich (4 volumes)

**Integration:**
```javascript
// Add historical notes to D&C sections 114+
// Example for Section 114:
{
  section: 114,
  context: `
    Received by Joseph Smith III on April 16, 1860, shortly after accepting
    the presidency of the Reorganized Church. This section addressed the
    organization of the church and clarified priesthood order after the
    confusion of the succession crisis (1844-1860).

    Historical Context:
    - 16 years after Joseph Smith Jr.'s death
    - Multiple succession claims (Brigham Young, Sidney Rigdon, James Strang)
    - Emma Smith's influence in RLDS formation
    - Rejection of polygamy and Utah church

    Source: History of the Church, Vol. 3, Joseph Smith III, 1908
  `,
  historical_document_url: 'https://archive.org/details/historyofchurcho03smitrich/page/n123'
}
```

### 4.3 1874 RLDS Book of Mormon Edition

**Source:** https://archive.org/details/TheBookOfMormon1874

**Integration:**
```javascript
// Show textual variations between 1830/1874/1908/modern editions
// Example:
{
  book: '1-nephi',
  chapter: 3,
  verse: 8,
  editions: {
    '1830': 'And it came to pass that we did...',
    '1874': 'And it came to pass that we did... [minor changes]',
    '1908_coc_authorized': 'Current CoC text',
    'kjv_comparison': 'Parallel biblical references'
  },
  notes: 'Changes reflect grammatical corrections authorized by RLDS Church'
}
```

---

## Phase 5: Advanced Features (Week 9-12)

### 5.1 Tradition Comparison Tool

**UI:**
```
┌─────────────────────────────────────────────┐
│ Compare Traditions: D&C Section 132         │
├─────────────────────────────────────────────┤
│ LDS Version:                                │
│ [Full text of LDS D&C 132 on polygamy]      │
│                                             │
│ CoC Version:                                │
│ [Does not exist - rejected by RLDS]        │
│                                             │
│ Historical Context:                         │
│ Section 132 was never accepted by RLDS/CoC │
│ church. Emma Smith and Joseph Smith III    │
│ explicitly rejected polygamy. See instead:  │
│ - D&C 111 (RLDS 1835 statement)            │
│ - D&C 42 on marriage                       │
│                                             │
│ Learn more: [Link to historical docs]      │
└─────────────────────────────────────────────┘
```

### 5.2 Inspired Version Bible Integration

**Source:** https://archive.org/details/josephsmithsnewt00smit (1867 parallel edition)

**Features:**
```
• Toggle between KJV and Inspired Version for all Bible verses
• Highlight significant JST changes
• Cross-reference BoM quotes to IV instead of KJV
• Show parallel view side-by-side
• Explain significance of each change
```

**Example:**
```
Genesis 50:24-38 (JST/IV only - not in KJV)
"Joseph's prophecy of Moses and latter-day seer"

This passage exists ONLY in Inspired Version, added by
Joseph Smith Jr. It prophecies of Moses and a latter-day
seer (understood by CoC/RLDS as Joseph Smith Jr.).

View full text: [Link to IV Genesis 50]
```

### 5.3 Women in Ministry Historical Timeline

**Interactive Timeline:**
```
1860 - RLDS founded, no women in priesthood
1873 - Women's Relief Society organized
1910 - Women serve as "deaconesses" (unofficial)
1920s - Debate begins on women's ordination
1960s - Increasing advocacy
1978 - World Conference debates ordination
1984 - Section 156 received, women ordained
1985 - First women ordained (Ginger Barfield, Linda L. Booth)
2005 - First woman in First Presidency considered
2024 - ~25% of CoC priesthood are women

[Interactive points with photos, documents, stories]
```

---

## Phase 6: Content from Archive.org (Ongoing)

### 6.1 Saints' Herald Sermon Series (1892-1894)

**Source:** http://www.latterdaytruth.org/periodicals.html

**Content Examples:**

#### "The Book of Mormon Witnesses" (1892)
- Three Witnesses testimony
- Eight Witnesses testimony
- RLDS preservation of witness testimonies
- Comparison with LDS presentation

#### "Christ in the Book of Mormon" (1893)
- Survey of Christ prophecies
- III Nephi ministry detailed analysis
- Christology from RLDS perspective

#### "Principles of the Gospel" (1894)
- Faith, repentance, baptism, Holy Ghost
- RLDS interpretation vs. LDS
- No temple endowment theology

### 6.2 General Conference Minutes

**Source:** http://www.latterdaytruth.org/tracts.html

**Integration:**
```javascript
// Add historical conference context to each D&C section
{
  section: 156,
  conference: {
    date: '1984-04-05',
    location: 'Independence, Missouri',
    attending: '~3000 delegates',
    vote: 'Sustained with opposition',
    controversy: 'Led to schism of ~50,000 members',
    documents: [
      {
        title: '1984 World Conference Minutes',
        url: 'http://www.latterdaytruth.org/...',
        type: 'PDF'
      }
    ]
  }
}
```

---

## Phase 7: Modern CoC Resources (Week 13+)

### 7.1 Partnership with Herald House

**Contact:** https://www.heraldhouse.org/

**Request Permissions for:**
1. Excerpts from "Sharing in Community of Christ"
2. Commentary samples from D&C Volumes 1-2
3. Curriculum materials from Gathering Resources
4. Book covers and promotional materials

**Proposal:**
```
Subject: Partnership Opportunity - CoC Study Platform

Dear Herald House,

I am developing a free, open-source scripture study platform
specifically for Community of Christ members and investigators.
The platform includes:

- Book of Mormon (1908 CoC edition)
- Doctrine & Covenants (all 167 sections)
- Inspired Version Bible
- Historical RLDS materials from archive.org
- Links to CoC resources

I would like to:
1. Include excerpts from your publications (with attribution)
2. Link prominently to Herald House for purchases
3. Promote CoC curriculum and study materials
4. Drive traffic to gathering.cofchrist.org

This would increase visibility of CoC materials and support
the church's mission. All content would be properly attributed
and copyrighted materials would be used under fair use or with
permission.

Would you be interested in discussing a partnership?
```

### 7.2 Integration with Gathering Resources

**Source:** https://gathering.cofchrist.org/

**Features:**
```
• Link to weekly worship guides
• Show current lectionary readings
• Recommend Gathering lessons for each BoM chapter
• Integrate worship resources (prayers, hymns, liturgies)
• Connect study to worship practice
```

---

## User Experience Flow

### New User Journey (CoC Perspective)

**Step 1: Welcome Screen**
```
Welcome to BOM Study Tools!

This platform is designed specifically for Community of Christ
scripture study, featuring:

✅ 1908 CoC Book of Mormon edition
✅ All 167 D&C sections (including CoC-specific 114-167)
✅ Inspired Version Bible
✅ Historical RLDS materials from archive.org
✅ Modern CoC study resources

[Start with "Introduction to Community of Christ" course]
[Explore Scriptures]
[View CoC Resources]
```

**Step 2: First Course - "Who is Community of Christ?"**
```
6 Lessons:
1. Origins and History (1860-2001)
2. Eight Sacraments (not LDS ordinances)
3. Enduring Principles and Mission
4. Women in Ministry (1984 revelation)
5. Temple Theology (peace, not exclusivity)
6. Book of Mormon in CoC Perspective

[Begin Course] (15 minutes per lesson)
```

**Step 3: Scripture Study with CoC Context**
```
Reading: 1 Nephi Chapter 3 (Christ's Birth Prophecy)

CoC Perspective:
This chapter contains one of the clearest prophecies of
Christ's birth, including Mary's name. Community of Christ
emphasizes the universal nature of Christ's love shown here,
rather than exclusivist salvation theology.

Historical Note:
RLDS scholar Alexander Hale Smith (son of Joseph Smith Jr.)
wrote extensively about this passage in the Saints' Herald
(1882). [View article]

Discussion Questions:
• How does Nephi's vision relate to CoC's "Worth of All Persons"?
• What does this teach about God's love beyond covenant Israel?

[Continue Reading] [View Saints' Herald Context]
```

---

## Content Guidelines

### CoC Theological Perspective

**Emphasize:**
- ✅ Christ's universal love (not exclusivist salvation)
- ✅ Peace and justice mission
- ✅ Continuing revelation (not closed canon)
- ✅ Progressive Christianity (open to diverse interpretations)
- ✅ Inclusion (LGBTQ+, all races, all genders in ministry)
- ✅ Environmental stewardship (sacredness of creation)
- ✅ Community focus (not institutional hierarchy)

**De-emphasize:**
- ❌ Literal Book of Mormon geography debates
- ❌ Temple work for the dead (not CoC theology)
- ❌ Exclusive authority claims
- ❌ Polygamy (firmly rejected)
- ❌ Word of Wisdom as commandment (personal choice in CoC)
- ❌ Tithing as strict 10% (generous giving, not legalistic)

### Historical Accuracy

**Be Clear About:**
- 1844 succession crisis and competing claims
- 1860 RLDS formation under Joseph Smith III
- Key differences between LDS and CoC development
- 1984 women's ordination and resulting schism
- 2001 name change from RLDS to Community of Christ
- Current CoC progressive positions

**Sources to Cite:**
- Saints' Herald articles (archive.org)
- Joseph Smith III historical works
- D&C section historical contexts
- CoC official statements
- Academic scholarship (Dialogue Journal, etc.)

---

## Success Metrics

### Phase 1 (Months 1-3)
- [ ] 500+ CoC-specific resources cataloged
- [ ] D&C sections 114-167 fully integrated
- [ ] 10+ courses with authentic CoC perspective
- [ ] Links to all major CoC resource sites
- [ ] 1000+ archive.org documents indexed

### Phase 2 (Months 4-6)
- [ ] Saints' Herald searchable database
- [ ] Inspired Version toggle fully functional
- [ ] Women in ministry timeline interactive
- [ ] Herald House partnership established
- [ ] 5000+ users engaged with CoC materials

### Phase 3 (Months 7-12)
- [ ] Complete historical commentary for all D&C sections
- [ ] LDS/CoC comparison tool for all doctrines
- [ ] Integration with Gathering Resources
- [ ] Mobile app with offline CoC content
- [ ] 10,000+ active CoC-focused users

---

## Copyright and Legal Considerations

### Public Domain Materials ✅
- Pre-1928 publications (Saints' Herald, etc.)
- 1867 Inspired Version
- 1874 Book of Mormon
- Joseph Smith III historical works
- **Usage:** Free to reproduce, adapt, integrate

### Fair Use Materials ⚠️
- Short excerpts from modern publications
- Commentary and criticism
- Educational purposes
- **Usage:** Brief quotes with attribution, link to purchase

### Copyrighted Materials ⚠️
- Modern Herald House publications
- Current D&C edition (text may be copyrighted)
- Recent curriculum materials
- **Usage:** Seek permission, link instead of reproduce

### Attribution Requirements
```
All historical materials from:
- Archive.org
- LatterDayTruth.org
- Community of Christ archives

Modern materials courtesy of:
- Herald House
- Gathering Resources
- Community of Christ International

This platform is independently developed and not
officially affiliated with Community of Christ,
though developed from a CoC perspective.
```

---

## Next Steps (Action Items)

### Week 1 (Immediate)
1. [x] Research completed - COC_RLDS_STUDY_MATERIALS_CATALOG.md
2. [ ] Create COC_INTEGRATION_PLAN.md (this document)
3. [ ] Add CoCResourcesModal.tsx component
4. [ ] Add AboutCoCModal.tsx component
5. [ ] Update README.md to clarify CoC focus
6. [ ] Add "CoC Resources" menu item

### Week 2
7. [ ] Scrape D&C sections 114-167 from Centerplace
8. [ ] Create database migration for CoC-specific fields
9. [ ] Update VolumeHomeScreen to show 167 sections
10. [ ] Create first CoC course: "Introduction to Community of Christ"

### Week 3
11. [ ] Build DCFilterToggle component
12. [ ] Integrate Saints' Herald archive links
13. [ ] Create historical context for each D&C section
14. [ ] Add textual notes for 1908 BoM edition

### Week 4
15. [ ] Create "D&C 114-167: CoC Revelations" course
16. [ ] Build Women in Ministry timeline
17. [ ] Create Temple Theology comparison page
18. [ ] Contact Herald House for partnership

---

## Conclusion

This plan transforms the BOM Study Tools into an **authentic Community of Christ study platform** by:

✅ Using actual RLDS/CoC historical materials
✅ Integrating CoC-specific scriptures (D&C 114-167)
✅ Providing genuine CoC theological perspective
✅ Linking to official CoC resources
✅ Maintaining historical accuracy and context

The result will be a comprehensive, respectful, and academically sound platform that serves the Community of Christ community with materials unavailable elsewhere in digital form.

---

**Created:** January 26, 2026
**For:** BOM Study Tools - Community of Christ Edition
**By:** Development Team
