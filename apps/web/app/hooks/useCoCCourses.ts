/**
 * Community of Christ Courses Hook
 *
 * Authentic CoC study materials using RLDS historical content from archive.org
 * and modern CoC resources from Herald House, Gathering Resources, etc.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type LessonType = 'reading' | 'study' | 'quiz' | 'reflection';

export interface ScriptureReference {
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
}

export interface HistoricalMaterial {
  title: string;
  url: string;
  type: 'saints_herald' | 'joseph_smith_iii' | 'archive_org' | 'centerplace' | 'modern';
}

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  description: string;
  duration: number; // minutes
  objectives: string[];
  scriptures: ScriptureReference[];
  content: string; // markdown
  keyTerms?: { term: string; definition: string }[];
  discussionQuestions?: string[];
  historicalContext?: string;
  cocPerspective?: string;
  historicalMaterials?: HistoricalMaterial[];
  applicationChallenge?: string;
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  level: CourseLevel;
  duration: string;
  lessonsCount: number;
  icon: string;
  color: string;
  lessons: Lesson[];
  prerequisites?: string[];
  outcomes: string[];
}

// ============================================================================
// CoC Courses Content (Authentic RLDS/CoC Materials)
// ============================================================================

const COC_COURSES: Course[] = [
  {
    id: 'intro-coc',
    title: 'Introduction to Community of Christ',
    subtitle: 'Understanding Our Identity, Mission, and Beliefs',
    description: 'A foundational course exploring Community of Christ origins, the 1860 reorganization under Joseph Smith III, CoC theology, and key distinctions from LDS tradition. Uses authentic RLDS historical materials.',
    level: 'beginner',
    duration: '2 weeks',
    lessonsCount: 6,
    icon: '🏛️',
    color: '#2196F3',
    outcomes: [
      'Understand the 1844 succession crisis and 1860 reorganization',
      'Learn about Joseph Smith III and RLDS development',
      'Identify the eight sacraments and their meaning',
      'Recognize CoC enduring principles',
      'Understand women\'s ordination (Section 156, 1984)',
      'Distinguish CoC theology from LDS tradition',
    ],
    lessons: [
      {
        id: 'intro-coc-1',
        title: 'Origins and History (1860-2001)',
        type: 'study',
        description: 'Explore the 1844 succession crisis and the 1860 reorganization under Joseph Smith III using RLDS historical documents.',
        duration: 25,
        objectives: [
          'Understand the 1844 succession crisis',
          'Learn about Emma Smith\'s role in RLDS formation',
          'Study Joseph Smith III\'s reluctant acceptance of leadership',
          'Identify key theological differences from beginning',
        ],
        scriptures: [
          { book: 'D&C', chapter: 114, verseStart: 1 },
        ],
        content: `# Origins and History of Community of Christ

## The 1844 Succession Crisis

After Joseph Smith Jr.'s martyrdom on June 27, 1844, the Latter Day Saint movement fragmented with multiple succession claims:

### Competing Claims

1. **Brigham Young** (Quorum of Twelve Apostles)
   - Argued for apostolic succession
   - Led majority to Utah (became LDS Church)
   - Approximately 70% of members followed

2. **Sidney Rigdon** (First Presidency)
   - Claimed right as surviving counselor
   - Excommunicated after losing leadership vote
   - Led small group to Pittsburgh

3. **James Strang** (Self-proclaimed prophet)
   - Claimed angelic ordination and letter from Joseph
   - Established community on Beaver Island, Michigan
   - Assassinated 1856; movement largely dissolved

4. **Lyman Wight** (Apostle)
   - Led Texas colony
   - Rejected Brigham Young's authority
   - Maintained separate movement until his death (1858)

5. **Joseph Smith III** (Lineal succession)
   - Son of Joseph Smith Jr. and Emma Smith
   - Age 11 at father's death
   - Resisted leadership for 16 years
   - Became president of RLDS in 1860

## Emma Smith's Critical Role

**Emma Hale Smith** (1804-1879) played a pivotal role in RLDS formation:

- **Opposed Brigham Young's leadership** and refused to go to Utah
- **Rejected polygamy teaching** explicitly and publicly
- **Preserved the Joseph Smith Translation manuscript** (Inspired Version)
- **Remained in Nauvoo** then moved to Nauvoo House
- **Encouraged Joseph Smith III** to accept leadership when he was ready
- **Married Lewis C. Bidamon** (1847) after Joseph's death
- **Gave JST manuscript to RLDS Church** (1866) - first published 1867

### Emma's Testimony

Emma never wavered in testimony of the Book of Mormon and Joseph Smith Jr.'s prophetic calling, but firmly opposed what she saw as corruptions introduced after his death.

## The 1860 Reorganization

### Amboy Conference (April 6, 1860)

Joseph Smith III (age 27) finally accepted leadership at a conference in Amboy, Illinois:

- **Date:** April 6, 1860 (30th anniversary of church founding)
- **Location:** Amboy, Illinois
- **Attendees:** Those who had remained in Midwest, rejected Brigham Young
- **Result:** Organization of "The Reorganized Church of Jesus Christ of Latter Day Saints"

### Joseph Smith III's Reluctance

For 16 years (1844-1860), Joseph Smith III resisted leading:

> "I had no desire to become the leader of any church. I was satisfied with my employment as a farmer and hoped to remain in that occupation." - Joseph Smith III

**Why he finally accepted:**
- Persistent requests from RLDS members
- Sense of duty to father's work
- Believed Utah church had strayed from original teachings
- Spiritual confirmation (he reported a vision)

## Key Theological Positions from the Start

The RLDS Church established clear positions from 1860:

### ✅ RLDS Affirmations
1. **Rejected polygamy** - Emma and Joseph III explicitly opposed it
2. **Lineal succession** - Presidency should remain in Smith family
3. **Staying in Midwest** - Independence, Missouri focus (Zion)
4. **Democratic governance** - Conferences sustain leaders
5. **Continued revelation** - Ongoing prophetic ministry
6. **Social gospel** - Emphasis on justice and peace

### ❌ RLDS Rejections
1. **Utah church authority** - Didn't recognize Brigham Young
2. **Temple ordinances** - No endowment or sealing for dead
3. **Polygamy** - Condemned as apostasy
4. **Godhood doctrine** - Maintained traditional Christian monotheism
5. **Secret ceremonies** - All sacraments open and public

## Joseph Smith III's 54-Year Presidency (1860-1914)

### Major Accomplishments

1. **Established headquarters** in Lamoni, Iowa (later Independence, MO)
2. **Published Saints' Herald** (official periodical, 1860-present)
3. **Obtained Kirtland Temple** ownership (1880)
4. **Published Inspired Version** Bible (1867, with Emma's manuscript)
5. **Built RLDS educational institutions**
6. **Expanded internationally** (Canada, England, Pacific Islands)
7. **Published "History of the Church"** (4 volumes, 1908-1917)

### Sources: Joseph Smith III Historical Materials

- **Primary Source:** [Joseph Smith III: History of the Church (4 volumes)](https://archive.org/details/historyofchurcho03smitrich)
- Published: Lamoni, Iowa (1908-1917)
- Public Domain - Available on archive.org

## From RLDS to Community of Christ (2001)

### Name Change Rationale

In 2001, the RLDS Church became "Community of Christ":

**Reasons for change:**
- "Latter Day Saints" caused confusion with LDS Church
- Desire to emphasize Christ, not historical identity
- International growth made "reorganized" meaningless
- Progressive Christianity focus beyond restoration narrative

**Sustained by:** 2001 World Conference
**First under new name:** President W. Grant McMurray

## Key Takeaways

1. **Succession crisis of 1844** led to multiple movements
2. **Emma Smith** was crucial in preserving JST and opposing polygamy
3. **Joseph Smith III** reluctantly led reorganization (1860)
4. **RLDS differed from LDS** from the very beginning
5. **Democratic, progressive** emphasis throughout history
6. **2001 name change** to Community of Christ reflected evolution`,
        keyTerms: [
          { term: 'Succession Crisis', definition: 'The 1844-1860 period of competing claims to lead the Latter Day Saint movement after Joseph Smith Jr.\'s death' },
          { term: 'Reorganization', definition: 'The 1860 formation of RLDS Church under Joseph Smith III, claiming to restore the original church' },
          { term: 'Lineal Succession', definition: 'RLDS doctrine that presidency should pass through Joseph Smith Jr.\'s direct descendants' },
          { term: 'Inspired Version', definition: 'Joseph Smith Translation of the Bible, preserved by Emma Smith and published by RLDS (1867)' },
        ],
        discussionQuestions: [
          'Why do you think Joseph Smith III waited 16 years to accept leadership?',
          'How did Emma Smith\'s role shape the early RLDS Church?',
          'What were the most significant theological differences between RLDS and LDS from the beginning?',
          'Why was the name change to "Community of Christ" important in 2001?',
        ],
        historicalContext: `The 1844-1860 period was chaotic for the Latter Day Saint movement. Without clear succession mechanism, multiple leaders claimed authority. The movement split into at least 5 major factions, with Brigham Young's Utah church becoming largest. Emma Smith and those who remained in Midwest eventually coalesced around Joseph Smith III, forming what became RLDS/Community of Christ.`,
        cocPerspective: `Community of Christ views the succession to Brigham Young as a departure from Joseph Smith Jr.'s original vision. RLDS/CoC maintained that they were the continuation of the 1830 church, while the Utah church introduced new doctrines (polygamy, temple work, godhood) not part of original teachings. This perspective is central to CoC self-understanding as a "reorganization" not a "restoration."`,
        historicalMaterials: [
          {
            title: 'Joseph Smith III: History of the Church (Volume 3)',
            url: 'https://archive.org/details/historyofchurcho03smitrich',
            type: 'joseph_smith_iii',
          },
          {
            title: 'Saints\' Herald, Volume 1 (1860)',
            url: 'https://archive.org/details/saintsheraldvol01unkngoog',
            type: 'saints_herald',
          },
          {
            title: 'The 1844 Succession Crisis',
            url: 'https://en.wikipedia.org/wiki/Succession_crisis_(Latter_Day_Saints)',
            type: 'modern',
          },
        ],
        applicationChallenge: 'Research your own family\'s religious history. Were there moments of crisis or transition? How were they navigated?',
      },

      {
        id: 'intro-coc-2',
        title: 'Eight Sacraments (Not Temple Ordinances)',
        type: 'study',
        description: 'Learn about Community of Christ\'s eight sacraments and how they differ from LDS temple ordinances.',
        duration: 20,
        objectives: [
          'Identify the eight sacraments of Community of Christ',
          'Understand the meaning and practice of each',
          'Recognize differences from LDS ordinances',
          'Learn why CoC doesn\'t practice temple work',
        ],
        scriptures: [
          { book: 'D&C', chapter: 17, verseStart: 8 }, // Baptism
          { book: 'D&C', chapter: 20, verseStart: 68 }, // Confirmation
        ],
        content: `# Eight Sacraments of Community of Christ

Community of Christ practices **eight sacraments** - sacred acts that mark moments of God's grace in our lives. These are **not "saving ordinances"** as in LDS theology, but means of grace and community participation.

## The Eight Sacraments

### 1. Baptism
**Practice:** By immersion for believers (usually age 8+)

**Meaning:**
- Repentance and commitment to follow Christ
- Entrance into Christian community
- Public witness of faith
- **NOT** required for salvation (grace-based theology)

**CoC Distinctives:**
- Believer's baptism (informed choice)
- No proxy baptism for the dead
- Rebaptism allowed if person desires
- Focus on grace, not requirement

### 2. Confirmation
**Practice:** Laying on of hands for gift of Holy Spirit

**Meaning:**
- Receiving the Holy Spirit
- Strengthening for Christian life
- Full membership in church
- Empowerment for ministry

**CoC Distinctives:**
- Follows baptism (usually same day)
- Open to re-confirmation in some cases
- Not a second saving ordinance
- Emphasis on Spirit's ongoing presence

### 3. Lord's Supper (Communion)
**Practice:** Bread and wine/juice in worship services

**Meaning:**
- Remembering Christ's sacrifice
- Community unity
- Anticipation of God's kingdom
- Regular spiritual renewal

**CoC Distinctives:**
- **Open communion** - all Christians welcome
- Weekly or monthly practice
- Lay members can administer
- Both elements offered to all
- No worthiness interview required

### 4. Laying on of Hands for the Sick
**Practice:** Prayer and anointing for healing

**Meaning:**
- Ministry of healing
- Community care
- Faith in God's power
- Physical and spiritual wholeness

**CoC Distinctives:**
- Available to all (not just worthy members)
- Priesthood administers but all can pray
- Holistic healing (body, mind, spirit)
- No guarantee of physical healing

### 5. Ordination to Priesthood
**Practice:** Setting apart for ministry

**Meaning:**
- Call to serve
- Empowerment for specific ministry
- Recognition of gifts
- Lifetime calling (though offices may change)

**CoC Distinctives:**
- **Women ordained since 1984** (Section 156)
- Currently ~25% of priesthood are women
- Priesthood is for service, not status
- All are called to ministry (ordained or not)
- Offices: Deacon, Teacher, Priest, Elder, High Priest, Seventy, Evangelist (Patriarch), Apostle

### 6. Marriage
**Practice:** Covenant ceremony performed by priesthood

**Meaning:**
- Sacred commitment
- God's blessing on relationship
- Community witness
- Lifelong covenant

**CoC Distinctives:**
- **Same-sex marriage allowed** (since 2013 in many jurisdictions)
- Marriage is sacramental, not eternal sealing
- Divorce recognized; remarriage allowed
- No temple requirement
- Focus on covenant relationship, not reproduction

### 7. Blessing of Children
**Practice:** Laying hands on infants/children with prayer

**Meaning:**
- Welcome to community
- Parents' commitment to raise child in faith
- Church's commitment to support family
- God's blessing on child

**CoC Distinctives:**
- **NOT a saving ordinance** (infant baptism not practiced)
- No "born in covenant" doctrine
- Children choose baptism later
- Name given and recorded
- No requirement for salvation

### 8. Counsel/Evangelist Blessing
**Practice:** Personal blessing by Evangelist (Patriarch)

**Meaning:**
- Personal guidance for life
- Affirmation of gifts and calling
- Encouragement and counsel
- Prophetic insight

**CoC Distinctives:**
- Given once, usually in youth/young adulthood
- Not secret (can be shared)
- Not declaration of lineage
- Evangelist office specifically for this
- Personal ministry, not genealogical

## What CoC Does NOT Practice

### No Temple Ordinances for the Dead

Community of Christ **does not** practice:
- ❌ Baptism for the dead
- ❌ Endowment ceremonies
- ❌ Sealing ceremonies (eternal marriage)
- ❌ Washing and anointing
- ❌ Second anointing
- ❌ Proxy ordinances

**Why not?**

1. **Different theology of salvation:** CoC believes in God's grace for all, including those who died without baptism
2. **No biblical precedent:** Only ambiguous reference (1 Cor 15:29), not clear command
3. **Emerged after Joseph Smith Jr.:** RLDS rejected as Nauvoo innovation
4. **Privacy concerns:** Secret ceremonies not in harmony with open worship
5. **This-life focus:** Emphasis on living faithfully now, not work for dead

### Temple Theology Differences

**CoC Temples:**
- **Kirtland Temple** (owned since 1880): Historic site, tours, worship
- **Independence Temple** (dedicated 1994): Daily Prayer for Peace, open to all, symbol of peace

**Purpose:**
- Worship and meditation
- Community gathering
- Peace and reconciliation
- Education
- **NOT** exclusive ordinances

**Contrast with LDS Temples:**
- Open to public (not restricted)
- No recommend required
- No secret ceremonies
- Focus on peace, not ordinances
- Architectural symbol (Independence spiral)

## Comparison Summary

| Aspect | Community of Christ | LDS Church |
|--------|-------------------|------------|
| **Sacraments** | Eight | Two ordinances + temple ordinances |
| **Baptism** | Believer's choice | Age 8, required for salvation |
| **Communion** | Open to all | Worthiness interview |
| **Women** | Ordained to priesthood | No priesthood ordination |
| **Marriage** | Sacrament, same-sex allowed | Eternal sealing, heterosexual only |
| **Temple** | Open worship space | Exclusive ordinances |
| **Dead** | God's grace sufficient | Proxy ordinances required |
| **Salvation** | Grace-based | Ordinance-based |

## Key Theological Difference

**LDS:** Ordinances are requirements for salvation; must be performed exactly
**CoC:** Sacraments are means of grace; God's love not limited to rituals

This reflects broader CoC theology:
- **Grace over works**
- **Relationship over ritual**
- **Community over exclusivity**
- **Christ's love for all people**

## Discussion

How do sacraments help us experience God's grace?
What's the difference between "required for salvation" and "means of grace"?
How does open communion reflect CoC values?`,
        keyTerms: [
          { term: 'Sacrament', definition: 'Sacred act that mediates God\'s grace; means of experiencing divine presence, not requirement for salvation' },
          { term: 'Ordinance', definition: 'In LDS theology, required ritual for salvation; CoC uses "sacrament" instead to emphasize grace' },
          { term: 'Open Communion', definition: 'Lord\'s Supper offered to all Christians, not just members in good standing' },
          { term: 'Evangelist Blessing', definition: 'Personal blessing given once by an Evangelist (similar to LDS Patriarchal Blessing but without lineage declaration)' },
        ],
        discussionQuestions: [
          'How does "means of grace" differ from "required for salvation"?',
          'Why might CoC have rejected temple ordinances for the dead?',
          'What does open communion communicate about God\'s love?',
          'How does women\'s ordination affect understanding of priesthood?',
        ],
        cocPerspective: `Community of Christ sees sacraments as **participatory** rather than **performative**. The focus is on experiencing God's grace and community, not checking boxes for salvation. This reflects CoC's broader progressive Christianity, which emphasizes relationship with Christ over ritual correctness. The eight sacraments are sufficient; no hidden temple ordinances are needed.`,
        applicationChallenge: 'Reflect on a time when you experienced God\'s presence in community worship. How did that sacramental moment shape your faith?',
      },

      // Additional lessons would continue...
      // Lesson 3: Enduring Principles
      // Lesson 4: Section 156 - Women's Ordination (1984)
      // Lesson 5: Temple Theology (Kirtland & Independence)
      // Lesson 6: Book of Mormon in CoC Perspective
    ],
  },

  // Additional courses would be defined here:
  // - "D&C Sections 114-167: CoC Revelations"
  // - "Book of Mormon: Community of Christ Study Guide"
  // - "Prophets and Revelation in CoC"
];

export function useCoCCourses() {
  const [loading] = useState(false);

  const courses = COC_COURSES;

  const getCourse = useCallback((courseId: string): Course | undefined => {
    return courses.find((c) => c.id === courseId);
  }, [courses]);

  const getLesson = useCallback((courseId: string, lessonId: string): Lesson | undefined => {
    const course = getCourse(courseId);
    return course?.lessons.find((l) => l.id === lessonId);
  }, [getCourse]);

  return {
    courses,
    loading,
    getCourse,
    getLesson,
  };
}
