# Quick CoC Implementation Guide

**Want to start immediately?** Here's what to do first.

---

## Phase 1: Immediate (This Week)

### 1. Add CoC Resources Page (30 minutes)

**Create:** `apps/web/app/components/modals/CoCResourcesModal.tsx`

```typescript
export function CoCResourcesModal() {
  return (
    <div className="coc-resources">
      <h2>Community of Christ Study Resources</h2>

      <section>
        <h3>📚 Official CoC Resources (Free/Purchase)</h3>
        <ul>
          <li>
            <a href="https://gathering.cofchrist.org/" target="_blank">
              Gathering Resources
            </a> - FREE worship guides, lessons, study materials
          </li>
          <li>
            <a href="https://www.heraldhouse.org/" target="_blank">
              Herald House Publications
            </a> - D&C Commentary, study materials
          </li>
          <li>
            <a href="http://www.centerplace.org/" target="_blank">
              Centerplace.org
            </a> - FREE D&C sections 114-167 with notes
          </li>
        </ul>
      </section>

      <section>
        <h3>📖 Historical RLDS Materials (Free - Public Domain)</h3>
        <ul>
          <li>
            <a href="https://archiveviewer.org/collections/en/saints-herald-rlds" target="_blank">
              Saints' Herald Archive (1860-1928)
            </a>
          </li>
          <li>
            <a href="https://archive.org/details/historyofchurcho03smitrich" target="_blank">
              Joseph Smith III History (4 volumes)
            </a>
          </li>
          <li>
            <a href="https://archive.org/details/TheBookOfMormon1874" target="_blank">
              1874 RLDS Book of Mormon
            </a>
          </li>
          <li>
            <a href="https://archive.org/details/josephsmithsnewt00smit" target="_blank">
              Inspired Version Bible (1867)
            </a>
          </li>
        </ul>
      </section>

      <section>
        <h3>ℹ️ About Community of Christ</h3>
        <p>
          <a href="https://cofchrist.org/" target="_blank">
            Official Website
          </a> - Who We Are, Mission, Find a Congregation
        </p>
      </section>
    </div>
  );
}
```

**Add to:** Settings menu or About section

---

### 2. Add "About CoC" Content (15 minutes)

**Create:** `apps/web/app/lib/coc-about.ts`

```typescript
export const COC_ABOUT = {
  name: "Community of Christ",
  formerName: "Reorganized Church of Jesus Christ of Latter Day Saints (1860-2001)",
  founded: 1860,
  headquarters: "Independence, Missouri",
  currentPresident: "Stephen M. Veazey (2005-present)",

  identity: `
    Founded in 1860 under the leadership of Joseph Smith III (son of
    Joseph Smith Jr.), Community of Christ continues the prophetic
    ministry through continuing revelation.
  `,

  sacraments: [
    "Baptism",
    "Confirmation",
    "Lord's Supper (Communion)",
    "Laying on of Hands for the Sick",
    "Ordination to Priesthood",
    "Marriage",
    "Blessing of Children",
    "Counsel/Evangelist Blessing"
  ],

  enduringPrinciples: [
    "Grace and generosity",
    "Sacredness of creation",
    "Continuing revelation",
    "Worth of all persons",
    "All are called",
    "Responsible choices",
    "Pursuit of peace (Shalom)",
    "Unity in diversity",
    "Blessings of community"
  ],

  keyDistinctions: [
    "Women ordained to priesthood (since 1984)",
    "Eight sacraments (not temple ordinances)",
    "No baptism for the dead",
    "Progressive Christianity emphasis",
    "LGBTQ+ inclusive policies",
    "Environmental stewardship focus",
    "Peace and justice mission",
    "Continued prophetic ministry (Section 167, 2025)"
  ]
};
```

---

### 3. Update README (5 minutes)

**Add to top of README.md:**

```markdown
# Book of Mormon Study Tools - Community of Christ Edition

🌟 **Authentic Community of Christ study platform** featuring:
- 1908 CoC Book of Mormon (original 1830 chapter divisions)
- Doctrine & Covenants with all 167 sections (114-167 are CoC-specific)
- Inspired Version Bible (Joseph Smith Translation)
- Historical RLDS materials from archive.org
- Modern CoC study resources and curriculum

**Not affiliated with LDS Church.** This platform focuses exclusively
on Community of Christ scriptures and theology.
```

---

## Phase 2: D&C Sections 114-167 (Next Week)

### 1. Scrape Sections from Centerplace (2 hours)

**Create:** `services/api/src/scripts/scrape-coc-dc-114-167.ts`

```typescript
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

async function scrapeCoCSection(sectionNum: number) {
  const url = `http://www.centerplace.org/dc/dc${sectionNum}.htm`;
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);

  // Extract verses
  const verses = [];
  $('.verse').each((i, elem) => {
    verses.push({
      num: i + 1,
      text: $(elem).text().trim()
    });
  });

  return {
    section: sectionNum,
    tradition: 'coc',
    verses
  };
}

// Scrape sections 114-167
for (let i = 114; i <= 167; i++) {
  const section = await scrapeCoCSection(i);
  console.log(`Section ${i}: ${section.verses.length} verses`);
  // Save to database
}
```

### 2. Add to Database

```sql
-- Add tradition field
ALTER TABLE doctrine_covenants_verses
ADD COLUMN tradition VARCHAR(10) DEFAULT 'shared';

-- Insert sections 114-167
INSERT INTO doctrine_covenants_verses
  (section, verse, text, tradition)
VALUES
  (114, 1, 'Unto the elders and members...', 'coc'),
  -- ... etc
```

### 3. Update UI to Show All 167 Sections

**Update:** `apps/web/app/lib/dc-sections.ts`

```typescript
export const DC_SECTIONS = {
  shared: Array.from({length: 113}, (_, i) => i + 1),
  coc: Array.from({length: 54}, (_, i) => i + 114), // 114-167
  total: 167
};

export function getSectionsByTradition(tradition: 'shared' | 'coc' | 'all') {
  if (tradition === 'shared') return DC_SECTIONS.shared;
  if (tradition === 'coc') return DC_SECTIONS.coc;
  return Array.from({length: 167}, (_, i) => i + 1);
}
```

---

## Phase 3: First CoC Course (Week 3)

### Create "Introduction to Community of Christ" Course

**File:** `apps/mobile/src/hooks/useCoCCourses.ts`

```typescript
const COC_INTRO_COURSE = {
  id: 'coc-intro',
  title: 'Introduction to Community of Christ',
  subtitle: 'Understanding Our Identity, Mission, and Beliefs',
  level: 'beginner',
  duration: '2 weeks',
  lessonsCount: 6,

  lessons: [
    {
      id: 'coc-1',
      title: 'Origins and History (1860-2001)',
      duration: 20,
      content: `
# Origins and History

## The 1844 Succession Crisis

After Joseph Smith Jr.'s death in 1844, multiple succession claims emerged:
- Brigham Young (Quorum of Twelve)
- Sidney Rigdon (First Presidency)
- James Strang (claimed angelic ordination)
- Lyman Wight (Texas colony)
- Joseph Smith III (lineal succession)

## Emma Smith's Role

Emma Smith, widow of Joseph Smith Jr.:
- Rejected Brigham Young's leadership
- Opposed polygamy teaching
- Preserved Joseph Smith Translation manuscript
- Encouraged Joseph Smith III to lead reorganization

## 1860 Reorganization

Joseph Smith III reluctantly accepted presidency:
- Conference at Amboy, Illinois (April 6, 1860)
- Age 27, had resisted for 16 years
- Emphasized lineal succession
- Rejected Utah church practices

## Key Differences from LDS Church

RLDS/CoC positions from beginning:
✅ Rejected polygamy explicitly
✅ Stayed in Midwest (Independence focus)
✅ Emphasized Christ over temple work
✅ Democratic church governance
✅ Continued prophetic ministry

Sources:
- Joseph Smith III History (archive.org)
- Saints' Herald, 1860-1880
`,
      scriptures: [
        { book: 'D&C', chapter: 114, verseStart: 1 }
      ],
      discussionQuestions: [
        'Why do you think Joseph Smith III waited 16 years to accept leadership?',
        'How did Emma Smith\'s role shape early RLDS Church?',
        'What were the key theological differences from the start?'
      ],
      historicalMaterials: [
        {
          title: 'Saints\' Herald Vol. 1 (1860)',
          url: 'https://archive.org/details/saintsheraldvol01unkngoog'
        },
        {
          title: 'Joseph Smith III History Vol. 3',
          url: 'https://archive.org/details/historyofchurcho03smitrich'
        }
      ]
    },

    // ... 5 more lessons
  ]
};
```

---

## Quick Wins (Do These First!)

### 1. Add D&C Section 156 (Women's Ordination) - **HIGHEST IMPACT**

```typescript
// Special spotlight section for Section 156
export const SECTION_156_CONTEXT = {
  section: 156,
  title: 'Women\'s Ordination Revelation',
  dateReceived: 'April 1, 1984',
  prophet: 'W. Wallace Smith',
  conferenceSustained: 'April 5, 1984',

  historicalContext: `
The 1984 revelation authorizing women's ordination was one of the most
significant and controversial in RLDS/CoC history.

Background:
- Debated since 1920s
- Increasing advocacy in 1960s-70s
- World Conference discussions 1978, 1980, 1982
- First presented April 1984

Impact:
- Sustained by conference vote (April 5, 1984)
- Led to schism: ~50,000 members left
- Formation of Restoration Branches
- First women ordained 1985
- Currently ~25% of CoC priesthood are women

Key Quote from Section 156:
"The time has come for you to respond to the need for a broader
participation of women in the life of the church, including their
ordination to priesthood."
  `,

  furtherReading: [
    {
      title: 'Women\'s Ordination Background Essay',
      url: 'https://sites.smith.edu/womens-rites/season-1/background-essay-womens-ordination-in-community-of-christ/'
    }
  ]
};
```

### 2. Create Simple CoC Resources Link - **EASIEST**

**Just add to Settings menu:**

```typescript
<button onClick={() => window.open('https://gathering.cofchrist.org', '_blank')}>
  📚 CoC Study Resources
</button>
```

### 3. Update App Tagline - **2 MINUTES**

```typescript
// Before:
"Book of Mormon Study Tools"

// After:
"Book of Mormon Study Tools - Community of Christ Edition"
```

---

## File to implement first:

```
apps/web/app/components/modals/CoCResourcesModal.tsx
```

This single file adds immediate value by linking users to:
- Free CoC curriculum (gathering.cofchrist.org)
- Historical RLDS materials (archive.org)
- Modern study resources (heraldhouse.org)
- D&C 114-167 online (centerplace.org)

Takes 30 minutes, provides massive value! 🚀

---

**Next:** See COC_INTEGRATION_PLAN.md for full roadmap
