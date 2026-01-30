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

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  explanation: string;
}

export interface LessonQuiz {
  questions: QuizQuestion[];
  passingScore: number; // percentage (e.g., 70)
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
  quiz?: LessonQuiz;
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
        quiz: {
          questions: [
            {
              id: 1,
              question: 'What year did Joseph Smith Jr. die, leading to the succession crisis?',
              options: ['1830', '1844', '1860', '1884'],
              correctAnswer: 1,
              explanation: 'Joseph Smith Jr. was martyred on June 27, 1844, creating a leadership crisis in the early Latter Day Saint movement.',
            },
            {
              id: 2,
              question: 'Who led the majority of Latter Day Saints to Utah?',
              options: ['Sidney Rigdon', 'James Strang', 'Brigham Young', 'Joseph Smith III'],
              correctAnswer: 2,
              explanation: 'Brigham Young, as president of the Quorum of the Twelve Apostles, led about 70% of members to Utah, forming what became the LDS Church.',
            },
            {
              id: 3,
              question: 'What role did Emma Smith play in RLDS formation?',
              options: [
                'She became the first prophet',
                'She opposed polygamy and preserved the Joseph Smith Translation',
                'She joined Brigham Young in Utah',
                'She had no involvement'
              ],
              correctAnswer: 1,
              explanation: 'Emma Smith firmly opposed polygamy, refused to go to Utah, and preserved the Joseph Smith Translation manuscript, which she gave to the RLDS Church in 1866.',
            },
            {
              id: 4,
              question: 'When was the RLDS Church formally organized?',
              options: ['1844', '1850', '1860', '1870'],
              correctAnswer: 2,
              explanation: 'The RLDS Church was formally reorganized at the Amboy Conference on April 6, 1860, with Joseph Smith III as president.',
            },
            {
              id: 5,
              question: 'When did RLDS change its name to Community of Christ?',
              options: ['1984', '1994', '2001', '2010'],
              correctAnswer: 2,
              explanation: 'The church officially changed its name from Reorganized Church of Jesus Christ of Latter Day Saints to Community of Christ in 2001.',
            },
          ],
          passingScore: 70,
        },
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
        quiz: {
          questions: [
            {
              id: 1,
              question: 'How many sacraments does Community of Christ practice?',
              options: ['Two', 'Five', 'Seven', 'Eight'],
              correctAnswer: 3,
              explanation: 'Community of Christ practices eight sacraments: Baptism, Confirmation, Lord\'s Supper, Laying on of Hands for the Sick, Ordination, Marriage, Child Blessing, and Evangelist Blessing.',
            },
            {
              id: 2,
              question: 'What is the key theological difference between CoC sacraments and LDS ordinances?',
              options: [
                'CoC has more sacraments',
                'CoC sees them as means of grace, not requirements for salvation',
                'CoC only allows adults to participate',
                'CoC performs them in temples only'
              ],
              correctAnswer: 1,
              explanation: 'CoC teaches that sacraments are means of grace that help us experience God\'s presence, not requirements for salvation. This reflects grace-based theology rather than ordinance-based salvation.',
            },
            {
              id: 3,
              question: 'What does "open communion" mean in Community of Christ?',
              options: [
                'Communion is held outdoors',
                'Anyone can administer communion',
                'All Christians are welcome to partake, regardless of membership',
                'Communion is optional'
              ],
              correctAnswer: 2,
              explanation: 'Open communion means the Lord\'s Supper is offered to all Christians, not just CoC members in good standing. No worthiness interview is required.',
            },
            {
              id: 4,
              question: 'Why doesn\'t Community of Christ practice temple ordinances for the dead?',
              options: [
                'They don\'t have temples',
                'They believe God\'s grace is sufficient for all beyond death',
                'It\'s against the law',
                'They haven\'t decided yet'
              ],
              correctAnswer: 1,
              explanation: 'CoC believes God\'s love and grace extend beyond death, and salvation is by grace rather than required rituals. They trust God\'s justice and mercy for all people.',
            },
            {
              id: 5,
              question: 'When were women first ordained to priesthood in Community of Christ?',
              options: ['1960', '1974', '1985', '2001'],
              correctAnswer: 2,
              explanation: 'Following the 1984 revelation in Section 156, the first women were ordained to priesthood in Community of Christ in 1985.',
            },
          ],
          passingScore: 70,
        },
      },

      {
        id: 'intro-coc-3',
        title: 'Enduring Principles: CoC Core Values',
        type: 'study',
        description: 'Explore the nine Enduring Principles that guide Community of Christ faith and practice.',
        duration: 20,
        objectives: [
          'Learn the nine Enduring Principles',
          'Understand how they guide CoC mission',
          'Connect principles to scripture and practice',
          'Apply principles to daily life',
        ],
        scriptures: [
          { book: 'D&C', chapter: 163, verseStart: 1 },
          { book: 'D&C', chapter: 164, verseStart: 9 },
        ],
        content: `# Enduring Principles of Community of Christ

In 2007, the Community of Christ World Conference identified **nine Enduring Principles** that express the church's essential beliefs and mission. These principles are drawn from scripture and the faith community's experience.

## The Nine Enduring Principles

### 1. Grace and Generosity

**"We proclaim Jesus Christ and promote communities of joy, hope, love, and peace."**

**Meaning:**
- God's grace is freely given to all
- We respond with generosity
- Focus on Christ's love, not fear or judgment
- Creating welcoming, inclusive communities

**Scripture Foundation:**
- Ephesians 2:8-9 - "By grace you have been saved through faith"
- 2 Corinthians 9:7 - "God loves a cheerful giver"
- D&C 163:2a - "The gospel of Jesus Christ calls all people"

**In Practice:**
- Open communion
- Welcoming LGBTQ+ persons
- Financial generosity for mission
- Sharing resources with community

### 2. Sacredness of Creation

**"All of creation has worth because of the nature of the Creator."**

**Meaning:**
- Creation reveals God's nature
- Environmental stewardship is spiritual practice
- Respect for Earth and all life
- Sustainability as discipleship

**Scripture Foundation:**
- Genesis 1:31 - "God saw everything that he had made, and indeed, it was very good"
- Psalm 24:1 - "The earth is the Lord's and all that is in it"
- D&C 163:4a - "Creation is God's good gift"

**In Practice:**
- Environmental sustainability policies
- Temple grounds as ecological sanctuary
- Responsible consumption
- Advocacy for climate action

### 3. Worth of All Persons

**"All people have worth as creations of God."**

**Meaning:**
- Every person is beloved by God
- Human dignity transcends differences
- Opposing racism, sexism, homophobia
- Women's equality in all aspects

**Scripture Foundation:**
- Genesis 1:27 - "God created humankind in his image"
- Galatians 3:28 - "There is no longer Jew or Greek, slave or free, male and female"
- D&C 156:9 - Women called to all priesthood offices

**In Practice:**
- Women's ordination (1985)
- Marriage equality for same-sex couples
- Anti-racism education and action
- Disability inclusion

### 4. All Are Called

**"Everyone can respond to God and is invited to do so."**

**Meaning:**
- God calls all people to ministry
- No "chosen people" exclusivity
- Each person's unique gifts valued
- Lay and ordained ministry

**Scripture Foundation:**
- 1 Peter 2:9 - "You are a chosen race, a royal priesthood"
- D&C 4 - "If ye have desires to serve God ye are called"
- Acts 2:17 - "Your sons and your daughters shall prophesy"

**In Practice:**
- Encouraging diverse voices
- Lay leadership in worship
- Youth in decision-making
- Voluntary priesthood (unpaid)

### 5. Responsible Choices

**"People are free to choose and are responsible for choices."**

**Meaning:**
- Human agency is God-given
- We're accountable for our choices
- Growth through learning from mistakes
- Community helps discern faithful choices

**Scripture Foundation:**
- Joshua 24:15 - "Choose this day whom you will serve"
- D&C 58:26-28 - Be anxiously engaged in good causes
- 2 Nephi 2:27 - "Free to choose liberty and eternal life"

**In Practice:**
- No coerced baptism or membership
- Open questioning encouraged
- Democratic church governance
- Personal revelation respected

### 6. Continuing Revelation

**"God's will continues to be revealed through the Holy Spirit."**

**Meaning:**
- Revelation didn't end with scripture
- Church grows in understanding
- Open to new insights
- Most recent revelation: Section 167 (2023)

**Scripture Foundation:**
- John 16:13 - "The Spirit will guide you into all truth"
- Amos 3:7 - "The Lord God does nothing without revealing"
- D&C 1:37-38 - God's word continues

**In Practice:**
- New sections added to D&C (167 in 2023)
- Policy changes based on revelation (Section 156, 164)
- Prophetic ministry continues
- Listening to Spirit in community

### 7. Blessings of Community

**"Life in community is God's intent for humanity."**

**Meaning:**
- We need each other
- Isolation contradicts God's design
- Faith grows in relationships
- Church as beloved community

**Scripture Foundation:**
- Acts 2:44-45 - "All who believed were together"
- 1 Corinthians 12:12-27 - Body of Christ
- D&C 38:27 - "Be one; and if ye are not one ye are not mine"

**In Practice:**
- Small group ministries
- Congregational care
- Camp and retreat communities
- Global church connections

### 8. Pursuit of Peace (Shalom)

**"Jesus Christ is the living Word of God who calls us to pursue peace."**

**Meaning:**
- Peace is active, not passive
- Shalom = wholeness, justice, right relationships
- Nonviolence as core value
- Peacemaking is discipleship

**Scripture Foundation:**
- Isaiah 2:4 - "Nation shall not lift up sword against nation"
- Matthew 5:9 - "Blessed are the peacemakers"
- D&C 164:9 - "Become a people of the Temple—those who see violence but proclaim peace"

**In Practice:**
- Peace Colloquy programs
- Conflict resolution training
- Advocacy against war
- Restorative justice

### 9. Experiencing the Resurrected Christ

**"We believe the resurrected Christ is present with us today."**

**Meaning:**
- Christ is not only historical figure
- Living relationship with Christ now
- Holy Spirit makes Christ present
- Sacraments as Christ encounters

**Scripture Foundation:**
- Matthew 28:20 - "I am with you always"
- John 14:18 - "I will not leave you orphaned"
- D&C 6:36 - "Look unto me in every thought"

**In Practice:**
- Expectation of Christ's presence in worship
- Prayer as conversation with living Christ
- Discernment through Christ's Spirit
- Mission flows from Christ's love

## Living the Principles

These nine principles are **interrelated and mutually reinforcing**. They guide:
- Personal discipleship
- Congregational life
- Church mission
- Global ministries

### How Principles Shape CoC

The Enduring Principles explain many CoC distinctives:
- **Worth of All Persons** → Women's ordination, LGBTQ+ inclusion
- **Continuing Revelation** → D&C Sections 156-167
- **Pursuit of Peace** → Peace & Justice Ministries
- **Sacredness of Creation** → Environmental stewardship
- **Grace and Generosity** → Open communion, welcoming all

### Comparison to Other Traditions

**LDS Articles of Faith:** Specific doctrinal statements
**CoC Enduring Principles:** Broad values allowing interpretation

**LDS Emphasis:** Obedience to authority, temple ordinances
**CoC Emphasis:** Discernment in community, social justice

## Personal Application

**Reflection Questions:**
- Which principle resonates most with you? Why?
- How do you see these principles lived in your congregation?
- Which principle challenges you most?
- How can you embody one principle this week?

**Practical Steps:**
1. **Grace and Generosity:** Donate to a cause or volunteer
2. **Sacredness of Creation:** Reduce waste, support environmental group
3. **Worth of All:** Learn about and stand with marginalized group
4. **Continuing Revelation:** Listen for God's voice in unexpected places
5. **Pursuit of Peace:** Practice conflict resolution, advocate for justice`,
        keyTerms: [
          { term: 'Enduring Principles', definition: 'Nine core values that guide Community of Christ faith and practice, adopted in 2007' },
          { term: 'Shalom', definition: 'Hebrew word for peace meaning wholeness, justice, right relationships - more than absence of conflict' },
          { term: 'Continuing Revelation', definition: 'Belief that God continues to reveal truth through the Holy Spirit, not limited to past scripture' },
          { term: 'Worth of All Persons', definition: 'Core CoC belief that every human being has inherent dignity and value as God\'s creation' },
        ],
        discussionQuestions: [
          'How do the Enduring Principles differ from creedal statements?',
          'Which principle do you think is most countercultural today?',
          'How does "continuing revelation" change how we read scripture?',
          'What tensions exist between different principles (e.g., responsible choices vs. community)?',
        ],
        historicalMaterials: [
          {
            title: 'D&C Section 163 (2007) - First mention of Enduring Principles',
            url: 'https://www.centerplace.org/hs/dc/section163.htm',
            type: 'centerplace',
          },
          {
            title: 'Sharing in Community of Christ (Official resource)',
            url: 'https://www.cofchrist.org/sharing',
            type: 'modern',
          },
        ],
        cocPerspective: `The Enduring Principles represent a shift from rigid doctrine to **guiding values**. Rather than saying "you must believe X, Y, Z," CoC says "we are called to embody these principles." This allows for diversity of belief while maintaining unity in mission. The principles are **descriptive** (this is who we are) and **prescriptive** (this is who we're called to become). They're rooted in scripture but open to ongoing interpretation through the Spirit.`,
        applicationChallenge: 'Choose one Enduring Principle to focus on this week. Each day, identify one way to embody that principle. Journal about what you discover.',
        quiz: {
          questions: [
            {
              id: 1,
              question: 'How many Enduring Principles guide Community of Christ?',
              options: ['Six', 'Eight', 'Nine', 'Twelve'],
              correctAnswer: 2,
              explanation: 'Community of Christ has nine Enduring Principles that were identified in 2007 at World Conference.',
            },
            {
              id: 2,
              question: 'Which Enduring Principle relates to environmental stewardship?',
              options: [
                'Grace and Generosity',
                'Sacredness of Creation',
                'Worth of All Persons',
                'Blessings of Community'
              ],
              correctAnswer: 1,
              explanation: 'The "Sacredness of Creation" principle teaches that all creation has worth because of God\'s nature, making environmental stewardship a spiritual practice.',
            },
            {
              id: 3,
              question: 'What does "Shalom" mean in the "Pursuit of Peace" principle?',
              options: [
                'Absence of conflict',
                'Wholeness, justice, and right relationships',
                'Military peace',
                'Silence'
              ],
              correctAnswer: 1,
              explanation: 'Shalom is a Hebrew word meaning wholeness, justice, and right relationships - much more than just the absence of conflict. It\'s active peacemaking.',
            },
            {
              id: 4,
              question: 'What does "Continuing Revelation" mean?',
              options: [
                'The Bible is still being written',
                'God continues to reveal truth through the Holy Spirit',
                'Only prophets receive revelation',
                'Revelation ended with Joseph Smith Jr.'
              ],
              correctAnswer: 1,
              explanation: 'Continuing Revelation means God didn\'t stop revealing truth after scripture was written. The Spirit continues to guide the church, as seen in D&C Section 167 (2023).',
            },
            {
              id: 5,
              question: 'In what year were the Enduring Principles first identified?',
              options: ['1984', '2001', '2007', '2015'],
              correctAnswer: 2,
              explanation: 'The nine Enduring Principles were identified at the 2007 World Conference and were mentioned in D&C Section 163.',
            },
          ],
          passingScore: 70,
        },
      },

      {
        id: 'intro-coc-4',
        title: 'Section 156: Women\'s Ordination (1984)',
        type: 'study',
        description: 'Study the controversial 1984 revelation that opened all priesthood offices to women, including historical context and impact.',
        duration: 30,
        objectives: [
          'Understand the context of Section 156',
          'Learn about W. Wallace Smith\'s prophetic ministry',
          'Examine the controversy and schism it caused',
          'Appreciate the significance for women\'s equality',
          'Connect to broader women\'s ordination movement',
        ],
        scriptures: [
          { book: 'D&C', chapter: 156, verseStart: 1, verseEnd: 10 },
          { book: 'Galatians', chapter: 3, verseStart: 28 },
        ],
        content: `# Section 156: Women's Ordination (1984)

## Historical Context

### The 1970s-80s Women's Movement

By the early 1980s, American society was experiencing major shifts:
- **Equal Rights Amendment debates** (1972-1982)
- **Women entering professions** previously closed to them
- **Ordination of women** in many mainline Protestant churches
- **Second-wave feminism** challenging traditional gender roles

### RLDS Church in the 1980s

**Within the RLDS Church:**
- Women serving in many roles but not priesthood
- Growing voices advocating for women's ordination
- Theological debates about priesthood nature
- Some women feeling called to ordained ministry

**President W. Wallace Smith:**
- Prophet-President from 1958-1978
- Son of Frederick M. Smith
- Progressive leader who guided church through changes
- Retired 1978, remained prophet until death (1989)

**The Question:**
Should women be eligible for all priesthood offices?

## Section 156: The Revelation

### Received: April 1, 1984
### Presented: April 5, 1984 (World Conference)
### Sustained: April 5, 1984 (by vote)

### The Text (Selected Verses)

**D&C 156:9**
> "The time has come for all to hear that men and women are of equal worth before God. The church is to move toward the time when all are called according to gifts and talents."

**Key Points:**
1. **Equal worth** of men and women affirmed
2. **Gifts and talents** should determine calling, not gender
3. **All priesthood offices** open to women
4. **Cultural change** needed in church

### The Full Context

The revelation addressed multiple topics:
- Temple dedication approaching (Independence Temple)
- Church organization and mission
- **Women's ordination** (verse 9)
- Call to become "people of the Temple"
- Peace and justice mission

Women's ordination was **one part** of a larger revelation about church identity and mission.

## The Response

### Support

**Arguments for women's ordination:**
- **Biblical:** Galatians 3:28 - "no male and female"
- **Theological:** Priesthood about service, not gender
- **Practical:** Women already serving effectively
- **Revelation:** God's will made clear
- **Justice:** Equality reflects gospel values

**Supporters included:**
- Progressive members
- Many women (and men) feeling Spirit's witness
- Younger generations
- Justice-minded Christians

### Opposition

**Arguments against women's ordination:**
- **Traditional:** "Always been this way"
- **Biblical:** 1 Timothy 2:12 ("I permit no woman to teach")
- **Priesthood nature:** Believed priesthood inherently male
- **Revelation concerns:** Questioned if truly from God
- **Slippery slope:** Feared further changes

**Opponents included:**
- Conservative members
- Those who valued tradition highly
- Some who felt change was too rapid
- Those uncomfortable with cultural shifts

### The Vote

**World Conference April 5, 1984:**
- Motion to sustain Section 156 as revelation
- Debate on conference floor
- **Vote passed** (exact count not recorded)
- Mixed emotions: celebration and grief

## The Schism

### Immediate Impact

**1984-1990:**
- Approximately **50,000 members** left (of ~250,000)
- Formation of **Restoration Branches** movement
- Congregations split or closed
- Families divided
- Emotional turmoil

### Restoration Branches

**Who they are:**
- Groups rejecting Section 156
- Maintain pre-1984 RLDS practices
- Do not ordain women
- Use RLDS name (not CoC)
- Independent congregations (not unified structure)

**Their position:**
- Section 156 not valid revelation
- Women's ordination violates God's order
- RLDS church "went apostate"
- Preserving "true" RLDS tradition

### Healing the Wounds

The schism caused deep pain:
- Friendships ended
- Congregations fractured
- Families stopped speaking
- Loss of community

**Ongoing challenges:**
- Restoration Branches and CoC largely separate
- Little dialogue between groups
- Some families still divided
- Historical wounds remain

## Implementation

### First Ordinations

**1985-1987:**
- First women ordained to priesthood
- Started with priest, elder offices
- Eventually all offices including apostle
- Women serving with distinction

### Women's Leadership Today

**In 2020s Community of Christ:**
- Women in all priesthood offices
- Female apostles and high priests
- Women pastors and mission center presidents
- Gifted women's voices shaping church
- Full equality (though cultural biases linger)

## Theological Significance

### What Section 156 Reveals

**About God:**
- God values equality
- Spirit speaks through women
- God challenges cultural norms
- Revelation addresses contemporary issues

**About Priesthood:**
- Service, not authority
- Based on gifts, not gender
- Open to all who are called
- Community discerns callings

**About Church:**
- Called to justice
- Willing to change
- Listens to Spirit over tradition
- Values prophetic witness

### Comparison to Other Traditions

**Traditions that ordain women:**
- Episcopal Church (1976)
- United Methodist Church (1956)
- Presbyterian Church (USA) (1956)
- Evangelical Lutheran Church (1970)
- Community of Christ (1985)

**Traditions that don't:**
- Roman Catholic Church
- LDS Church (Latter-day Saints)
- Orthodox Churches
- Southern Baptist Convention
- Many conservative evangelical churches

### CoC's Distinction

Community of Christ was **notable** for:
- **Receiving revelation** (not just policy change)
- **Clear scriptural authorization** (D&C 156)
- **Willingness to accept schism** for justice
- **Prophetic leadership** despite cost

## Women's Voices

### Impact on Women

**Women's testimonies:**
- "I finally felt fully valued"
- "My gifts could be used completely"
- "God affirmed my calling"
- "I can be fully myself in church"
- "This opened ministry I never dreamed possible"

**Women's ordination has led to:**
- Increased women's participation
- Diverse theological perspectives
- More holistic ministry
- Stronger families (modeling equality)
- Greater justice witness

## Personal Reflection

**Questions to ponder:**
- How does women's ordination reflect God's character?
- What does priesthood mean if it's about service, not authority?
- Why was this change so difficult for some?
- How do we honor those who disagreed?
- What other equality issues face the church today?

**Continuing Challenges:**
- Full implementation (cultural change is slow)
- Healing schism wounds
- Addressing ongoing bias
- Applying equality principle broadly (LGBTQ+ inclusion, etc.)

## Section 156 Today

**Legacy:**
- **Prophetic witness** to equality
- **Women's leadership** thriving
- **Continuing revelation** demonstrated
- **Justice orientation** strengthened
- **CoC identity** as progressive Christian church

**The revelation stands as:**
- Watershed moment in CoC history
- Clear statement on gender equality
- Example of costly faithfulness
- Invitation to ongoing justice work

## Conclusion

Section 156 was **controversial** but **transformative**. It cost the church members and unity, but it aligned CoC with justice and God's call to equality. Today, women's ordination is **taken for granted** by most members - a sign of how prophetic the revelation was.

The question Section 156 poses to every generation:
**"What is God calling us to do, even if it's costly?"**`,
        keyTerms: [
          { term: 'Section 156', definition: '1984 revelation from W. Wallace Smith opening all priesthood offices to women, causing schism' },
          { term: 'Restoration Branches', definition: 'Independent congregations that rejected Section 156 and maintain pre-1984 RLDS practices' },
          { term: 'Schism', definition: 'Split in religious community; ~50,000 members left RLDS Church over women\'s ordination' },
          { term: 'Prophetic Witness', definition: 'Church speaking/acting on God\'s truth even when unpopular or costly' },
        ],
        discussionQuestions: [
          'Why was women\'s ordination so controversial in 1984?',
          'How do we respect those who disagreed with Section 156?',
          'What does it cost to follow revelation that challenges tradition?',
          'How does women\'s ordination change understanding of priesthood?',
          'What contemporary justice issues parallel 1984 women\'s ordination?',
        ],
        historicalMaterials: [
          {
            title: 'Section 156: Text and Context (Smith College essay)',
            url: 'https://sophia.stkate.edu/cgi/viewcontent.cgi?article=1086&context=acb_fac',
            type: 'modern',
          },
          {
            title: 'Women\'s Ordination in Community of Christ',
            url: 'https://www.cofchrist.org/priesthood',
            type: 'modern',
          },
        ],
        cocPerspective: `Section 156 represents **continuing revelation** in action. God didn't reveal everything at once but continues to guide the church toward fuller understanding of justice and equality. The revelation wasn't about women's ordination alone - it was about the church becoming "people of the Temple" who embody God's shalom. Women's full participation is essential to that vision. The schism was painful, but the church chose faithfulness to revelation over institutional unity. This prophetic witness continues to shape CoC identity as a justice-oriented, progressive Christian community.`,
        applicationChallenge: 'Research women leaders in Community of Christ history and today. Choose one woman\'s story to learn about. How has women\'s ordination shaped the church\'s ministry?',
        quiz: {
          questions: [
            {
              id: 1,
              question: 'Who received the revelation in Section 156?',
              options: [
                'Joseph Smith III',
                'Frederick M. Smith',
                'W. Wallace Smith',
                'Wallace B. Smith'
              ],
              correctAnswer: 2,
              explanation: 'Section 156 was received by W. Wallace Smith, who served as Prophet-President from 1958-1978 and remained prophet until 1989.',
            },
            {
              id: 2,
              question: 'When was Section 156 presented to World Conference?',
              options: ['April 1, 1984', 'April 5, 1984', 'April 1, 1985', 'April 5, 1985'],
              correctAnswer: 1,
              explanation: 'Section 156 was received on April 1, 1984, and presented to World Conference on April 5, 1984, where it was sustained by vote.',
            },
            {
              id: 3,
              question: 'Approximately how many members left RLDS Church over women\'s ordination?',
              options: ['5,000', '15,000', '50,000', '100,000'],
              correctAnswer: 2,
              explanation: 'About 50,000 members (out of ~250,000) left the RLDS Church over Section 156, forming independent Restoration Branches.',
            },
            {
              id: 4,
              question: 'What are Restoration Branches?',
              options: [
                'A new CoC program',
                'Groups that rejected Section 156 and maintain pre-1984 practices',
                'International CoC congregations',
                'A type of priesthood office'
              ],
              correctAnswer: 1,
              explanation: 'Restoration Branches are independent congregations that rejected Section 156 and women\'s ordination, maintaining pre-1984 RLDS practices.',
            },
            {
              id: 5,
              question: 'What biblical passage is often cited in support of women\'s ordination?',
              options: [
                '1 Timothy 2:12',
                'Galatians 3:28',
                'Genesis 1:1',
                'John 3:16'
              ],
              correctAnswer: 1,
              explanation: 'Galatians 3:28 states "There is no longer Jew or Greek, slave or free, male and female; for all of you are one in Christ Jesus," supporting equality.',
            },
          ],
          passingScore: 70,
        },
      },

      {
        id: 'intro-coc-5',
        title: 'Temple Theology: Kirtland & Independence',
        type: 'study',
        description: 'Explore Community of Christ\'s understanding of temples as places of worship, peace, and community rather than exclusive ordinance work.',
        duration: 20,
        objectives: [
          'Learn about Kirtland Temple history',
          'Understand Independence Temple mission',
          'Contrast CoC and LDS temple theology',
          'Explore "people of the Temple" concept',
        ],
        scriptures: [
          { book: 'D&C', chapter: 94, verseStart: 1, verseEnd: 5 },
          { book: 'D&C', chapter: 156, verseStart: 5 },
          { book: 'D&C', chapter: 164, verseStart: 9 },
        ],
        content: `# Temple Theology in Community of Christ

## Two Temples, Two Purposes

Community of Christ owns and operates two temples:
1. **Kirtland Temple** (dedicated 1836) - Historic worship space
2. **Independence Temple** (dedicated 1994) - Peace, reconciliation, worship

Both temples serve **radically different** purposes than LDS temples.

## Kirtland Temple (1833-1836)

### Historical Background

**Built 1833-1836:**
- First temple in Restoration movement
- Built by early Saints in Kirtland, Ohio
- Dedicated March 27, 1836
- Spectacular spiritual experiences reported

**After 1838:**
- Saints left Kirtland (financial crisis, persecution)
- Temple remained behind
- **RLDS Church acquired ownership (1880)**
- Continuous RLDS/CoC stewardship since

### Kirtland Temple Today

**Use:**
- **Open for public tours** (thousands annually)
- **Community worship** (RLDS/CoC services)
- **Historic site** (National Historic Landmark)
- **Educational center** (Restoration history)
- **NOT for secret ordinances**

**What happens in Kirtland Temple:**
- Sunday worship services
- Weddings and baby blessings
- Music concerts and programs
- Historical tours and education
- Community gatherings

**What does NOT happen:**
- No temple recommend required
- No secret ordinances
- No proxy work for dead
- No washings/anointings (LDS-style)
- No exclusivity

### Original Purpose (1836)

**D&C 94:3-5:**
> "And ye shall build it [the temple] on the lot which is lying northward of my house, a temple; and ye shall build it after the pattern which I shall show unto you... The first shall be built as a house for the presidency... The second house shall be built...for the work of the ministry."

**What early Saints did:**
- Worship services
- Educational classes ("School of the Prophets")
- Community gatherings
- Spiritual experiences (visions, tongues, prophecy)

**What they did NOT do:**
- No ordinances for the dead
- No eternal marriage sealings
- No secret endowments
- No garments or tokens

**Key Point:** Kirtland Temple was **never** used for LDS-style temple ordinances. Those developed later in Nauvoo.

### The 1836 Dedication

**Pentecostal Experiences:**
- Speaking in tongues
- Visions of angels
- Appearance of Christ reported
- "Hosanna Shout"
- Overwhelming spiritual power

These experiences emphasized:
- God's presence with community
- Empowerment for mission
- Unity of believers
- Joy in worship

**Focus:** Community encountering God, not individual ritual performance.

## Independence Temple (1990-1994)

### The Vision

**Background:**
- Independence, Missouri = "Center Place" (D&C 57)
- Temples discussed in early revelations
- Plans proposed 1920s-1960s but not built
- Finally authorized 1980s

**D&C 156:5 (1984):**
> "The time has come for the Temple to be built... It will be an expression of the spiritual heart and ministry of Community of Christ."

### Design and Symbolism

**Architecture:**
- **Spiraling design** pointing to heaven
- **512-seat sanctuary** shaped like nautilus shell
- **Brilliant acoustics** for music and worship
- **Natural light** flooding sacred space
- **No dark, closed rooms**

**Symbolism:**
- Spiral = spiritual journey
- Open space = transparency, inclusion
- Light = Christ as light of world
- Acoustics = word and music lifting prayers
- Public access = all welcome

**Contrast to LDS temples:**
- CoC: Open spiral reaching up
- LDS: Enclosed, private spaces

### Temple Mission

**D&C 164:9 (2010):**
> "Become a people of the Temple—those who see violence but proclaim peace, who feel conflict yet extend the hand of reconciliation, who encounter broken spirits and find pathways for healing."

**The Independence Temple is for:**
1. **Worship** - Regular services, music, prayer
2. **Peace** - Peace Colloquy, peace education
3. **Reconciliation** - Healing, justice work
4. **Community** - Gathering, celebration
5. **Mission** - Sending forth for ministry

**NOT for:**
- Secret ordinances
- Proxy work for dead
- Exclusivity or worthiness interviews
- Temple recommends
- Ritual performances

### Temple Activities Today

**Anyone can enter and participate:**
- **Sunday worship** (weekly)
- **Daily Devotions** (prayer services)
- **Concerts and music** (world-class acoustics)
- **Educational programs**
- **Peace Colloquy** (annual gathering)
- **Weddings** (all couples welcome)
- **Community events**

**No barriers:**
- No recommend needed
- No membership required
- All faiths welcome
- LGBTQ+ persons fully included
- No worthiness interviews

## CoC vs. LDS Temple Theology

### Fundamental Differences

| Aspect | Community of Christ | LDS Church |
|--------|-------------------|------------|
| **Access** | Open to all | Restricted to worthy members |
| **Purpose** | Worship, peace, community | Saving ordinances |
| **Activities** | Services, concerts, education | Endowments, sealings, baptisms for dead |
| **Theology** | Presence of God, peace work | Required rituals for salvation |
| **Architecture** | Open, light-filled, transparent | Closed, private rooms |
| **Admission** | Free, no requirements | Temple recommend required |
| **Frequency** | Regular worship (weekly) | Periodic visits for ordinances |
| **Focus** | Community transformation | Individual salvation |

### Why the Difference?

**Theological Basis:**

**LDS:** Temples essential for salvation
- Ordinances required to enter celestial kingdom
- Proxy work saves ancestors
- Temple = gate to highest heaven
- Exclusive, sacred rituals

**CoC:** Temples for experiencing God's presence
- Grace, not ordinances, saves
- God's love sufficient for all
- Temple = place to encounter peace
- Public worship, not secret rituals

**Historical Development:**

- **Kirtland (1836):** No secret ordinances
- **Nauvoo (1846):** LDS developed temple rituals
- **RLDS/CoC:** Rejected Nauvoo innovations
- **Independence (1994):** Peace and justice mission

### What CoC Believes About Temples

**From D&C 156, 163, 164:**

1. **Temples are for worship** - Community encountering God
2. **Temples symbolize peace** - "People of the Temple" pursue shalom
3. **Temples are open** - All welcome, no exclusivity
4. **Temples send forth** - Equip for mission, not end in themselves
5. **Temples embody grace** - God's presence, not human worthiness

**"People of the Temple" means:**
- Living peace in violent world
- Extending reconciliation amid conflict
- Finding healing for broken spirits
- Being God's shalom presence

## No Temple Work for the Dead

### Why CoC Doesn't Do Proxy Ordinances

**Theological Reasons:**

1. **Grace sufficient** - God's love reaches beyond death
2. **No ordinances required** - Salvation by grace, not rituals
3. **God's justice** - All have opportunity to respond to God
4. **Focus on living** - Ministry to present world prioritized

**D&C 107:29 (RLDS):**
Does not include LDS verse about baptism for dead (added later in LDS D&C 128).

### What About Our Ancestors?

**CoC Teaching:**
- God's love and grace extend beyond death
- Ancestors in God's hands
- We honor them through remembering, not rituals
- Our focus: Living faithfully now

**Contrast to LDS:**
- LDS: Must perform ordinances for ancestors
- CoC: Trust God's justice and mercy for all

## The Temple as Symbol

### What Temples Mean

**For Community of Christ:**
- God's presence in community
- Peace work in violent world
- Reconciliation amid conflict
- Healing and wholeness
- Mission sending forth

**The Temple is:**
- Starting point, not destination
- Community space, not individual ritual
- Open door, not exclusive gate
- Peace beacon, not salvation requirement

### Living as "People of the Temple"

**D&C 164:9 calls us to:**
- **See violence** → **Proclaim peace**
- **Feel conflict** → **Extend reconciliation**
- **Encounter broken spirits** → **Find pathways for healing**

This is **active ministry**, not passive ritual.

## Personal Application

### What This Means for Daily Life

**Temple principles in daily practice:**
1. **Peace** - Practice nonviolence, resolve conflicts
2. **Reconciliation** - Heal relationships, forgive
3. **Healing** - Support those who are hurting
4. **Openness** - Welcome all, practice inclusion
5. **Worship** - Encounter God in community

### Reflection Questions

- How does CoC temple theology reflect grace over works?
- What does it mean to be "people of the Temple" in your community?
- How might open temples change relationship with God?
- What would it mean to "see violence but proclaim peace" today?

## Conclusion

**Community of Christ temples are:**
- Places of worship, not exclusive ordinance work
- Open to all, not restricted to worthy members
- Symbols of peace, not salvation requirements
- Starting points for mission, not destinations

**This reflects CoC theology:**
- Grace over ordinances
- Community over individualism
- Peace over power
- Transparency over secrecy
- Mission over maintenance

**The Temple calls us:**
Not to perform rituals for salvation, but to **be God's peace presence in a violent world**.`,
        keyTerms: [
          { term: 'Kirtland Temple', definition: 'First Restoration temple (1836), owned by CoC since 1880, open for worship and tours' },
          { term: 'Independence Temple', definition: 'CoC temple dedicated 1994 for worship, peace, and reconciliation, open to all' },
          { term: 'People of the Temple', definition: 'D&C 164 phrase: those who see violence but proclaim peace, extend reconciliation, find healing' },
          { term: 'Temple Recommend', definition: 'LDS requirement for temple entry based on worthiness; NOT used in CoC' },
        ],
        discussionQuestions: [
          'How does open temple access reflect CoC theology of grace?',
          'What does "people of the Temple" mean in your context?',
          'Why did RLDS/CoC reject proxy temple ordinances?',
          'How do temples "send forth" rather than "keep in"?',
          'What would it look like to "proclaim peace" in your community?',
        ],
        historicalMaterials: [
          {
            title: 'Kirtland Temple Virtual Tour',
            url: 'https://www.kirtlandtemple.org/',
            type: 'modern',
          },
          {
            title: 'Independence Temple Information',
            url: 'https://www.cofchrist.org/temple',
            type: 'modern',
          },
        ],
        cocPerspective: `CoC temple theology emphasizes **presence over performance**. Temples aren't about checking boxes for salvation, but encountering God's peace and being sent into the world. The open architecture of Independence Temple reflects this: transparent, light-filled, welcoming all. Contrast this with LDS temples' closed rooms and secret rituals. CoC says God's grace is sufficient; we don't need special ordinances to save our ancestors or ourselves. Instead, temples equip us to be "people of peace"—living shalom in a broken world. This reflects CoC's broader shift from ritual religion to justice-oriented faith.`,
        applicationChallenge: 'This week, practice being a "person of the Temple" in one specific way: Where you see violence, proclaim peace; where you feel conflict, extend reconciliation; where you encounter broken spirits, find pathways for healing. Journal about the experience.',
        quiz: {
          questions: [
            {
              id: 1,
              question: 'How many temples does Community of Christ own?',
              options: ['None', 'One', 'Two', 'Five'],
              correctAnswer: 2,
              explanation: 'Community of Christ owns two temples: the Kirtland Temple (acquired 1880) and the Independence Temple (dedicated 1994).',
            },
            {
              id: 2,
              question: 'When was the Kirtland Temple dedicated?',
              options: ['1830', '1836', '1844', '1860'],
              correctAnswer: 1,
              explanation: 'The Kirtland Temple was dedicated on March 27, 1836, and featured spectacular Pentecostal experiences including visions and speaking in tongues.',
            },
            {
              id: 3,
              question: 'What is the primary purpose of CoC temples?',
              options: [
                'Secret ordinances for salvation',
                'Proxy baptisms for the dead',
                'Worship, peace, reconciliation, and community gathering',
                'Only for priesthood meetings'
              ],
              correctAnswer: 2,
              explanation: 'CoC temples are for worship, peace work, reconciliation, and community gathering - not for exclusive saving ordinances.',
            },
            {
              id: 4,
              question: 'Who can enter Independence Temple?',
              options: [
                'Only CoC members with temple recommends',
                'Only priesthood holders',
                'Anyone - it\'s open to all',
                'Only those who have been through the endowment'
              ],
              correctAnswer: 2,
              explanation: 'Independence Temple is open to all people - no temple recommend, membership, or worthiness interview required. This reflects CoC\'s emphasis on grace and inclusion.',
            },
            {
              id: 5,
              question: 'What does "people of the Temple" mean (D&C 164:9)?',
              options: [
                'People who attend temple regularly',
                'Those who see violence but proclaim peace, extend reconciliation, find healing',
                'Temple workers only',
                'Those who live near temples'
              ],
              correctAnswer: 1,
              explanation: 'Being "people of the Temple" means actively pursuing peace in a violent world, reconciliation amid conflict, and healing for broken spirits.',
            },
          ],
          passingScore: 70,
        },
      },

      {
        id: 'intro-coc-6',
        title: 'Book of Mormon in CoC Perspective',
        type: 'study',
        description: 'Understand how Community of Christ approaches the Book of Mormon differently than the LDS tradition, including historicity questions and spiritual value.',
        duration: 25,
        objectives: [
          'Learn CoC\'s approach to Book of Mormon',
          'Understand historicity debates within CoC',
          'Recognize theological emphases CoC draws from BoM',
          'Compare CoC and LDS interpretations',
        ],
        scriptures: [
          { book: '2 Nephi', chapter: 2, verseStart: 27 },
          { book: 'Mosiah', chapter: 4, verseStart: 16 },
          { book: 'Alma', chapter: 32, verseStart: 21 },
          { book: 'Moroni', chapter: 10, verseStart: 32 },
        ],
        content: `# The Book of Mormon in Community of Christ

## A Different Relationship

Community of Christ and the LDS Church **both** use the Book of Mormon, but approach it very differently.

**LDS Church:**
- "Most correct book on earth"
- Literal historical record
- Keystone of faith
- Center of scripture study
- Required belief in historicity

**Community of Christ:**
- Inspired scripture
- Variety of views on historicity
- One of four standard works
- Valuable spiritual insights
- Focus on spiritual truths over historical claims

## Historical Background

### RLDS and the Book of Mormon

**1860-1960s:**
- RLDS Church affirmed Book of Mormon
- Generally assumed historicity
- Used in worship and teaching
- But less centrally than LDS Church

**1960s-1990s:**
- Archaeological challenges emerged
- Historicity questions raised
- Variety of views developed
- Church allowed diverse perspectives

**1990s-Present:**
- Open acknowledgment of historical questions
- Emphasis on spiritual value regardless of historicity
- Multiple approaches accepted
- Focus shifts to message over origins

### Official CoC Position (2024)

**From CoC website:**
> "Community of Christ affirms the Book of Mormon as scripture, but we do not require members to believe in its historicity. Some members view it as an ancient record, others as inspired fiction with profound spiritual truths. Both perspectives are welcome."

**Key point:** Unity in valuing the book, diversity in understanding its origins.

## Approaches to Book of Mormon in CoC

### 1. Traditional/Historicist View

**Belief:**
- Book of Mormon is ancient record
- Joseph Smith translated real plates
- Historical peoples and events
- Archaeological evidence will emerge

**Held by:**
- Older members
- Some conservative congregations
- Those from LDS background
- Restoration Branches

### 2. Inspired Fiction View

**Belief:**
- Book of Mormon is 19th century creation
- Joseph Smith was inspired author
- Fictional narrative with spiritual truths
- Product of his cultural context

**Reasoning:**
- Archaeological challenges
- 19th century themes and language
- KJV Bible quotations
- Anachronisms (horses, steel, etc.)

**Held by:**
- Many younger members
- Progressive congregations
- Seminary-trained leaders
- Those aware of historical scholarship

### 3. Complexity/Middle View

**Belief:**
- Origins may be complex
- Ancient core + modern expansion possible
- Spiritual value paramount
- Don't need to resolve questions

**Approach:**
- Hold questions lightly
- Focus on message
- Respect diverse views
- Emphasize present meaning

**Held by:**
- Many thoughtful members
- Those comfortable with ambiguity
- Ecumenically-minded Christians

## Why Historicity Matters Less in CoC

### Theological Reasons

**1. Grace-Based Salvation**
- Salvation by grace, not believing correct history
- Faith in Christ, not faith in Book of Mormon historicity
- Relationship with God, not historical accuracy

**2. Continuing Revelation**
- Truth comes through ongoing Spirit
- Not dependent on one historical event
- Multiple sources of revelation

**3. Christocentric Faith**
- Center is Jesus Christ
- Book of Mormon points to Christ
- Christ's reality doesn't depend on BoM historicity

**4. Inclusive Community**
- Don't require uniform belief
- Welcome diverse perspectives
- Unity in mission, not doctrine

### Practical Reasons

**1. Archaeological Challenges**
- No direct evidence for BoM civilizations
- Anachronisms (horses, steel, wheat, etc.)
- DNA studies complicate Native American origin claims
- Linguistic issues

**2. Scholarship**
- Historical-critical methods raise questions
- 19th century themes and concerns evident
- KJV Bible quoted (including translation errors)
- Parallels to other 19th century works

**3. Honesty**
- Church values intellectual honesty
- Can't ignore scholarship
- Better to acknowledge questions
- Trust members with complexity

## What CoC Emphasizes from Book of Mormon

### Core Theological Themes

**1. Jesus Christ**
- Pre-mortal Christ appearing to prophets
- Atonement central (2 Nephi 2, Alma 7)
- Christ visiting Americas (3 Nephi)
- Christ as foundation (Helaman 5:12)

**2. Grace and Faith**
- "After all we can do" (2 Nephi 25:23)
- Faith precedes miracles (Ether 12)
- Grace sufficient (Moroni 10:32)
- Saved by grace (2 Nephi 2:8)

**3. Social Justice**
- Care for poor (Mosiah 4:16-19)
- Pride condemned (Alma 4-5)
- Economic equality (4 Nephi 1:3)
- Oppression of workers wrong (Jacob 2:17-19)

**4. Peace**
- Anti-Nephi-Lehies bury weapons (Alma 24)
- Peace established in 4 Nephi
- Cycle of violence critiqued
- "No contention" when Christ present (4 Nephi 1:15)

**5. Agency and Choice**
- "Free to choose" (2 Nephi 2:27)
- Liberty or captivity
- Individual responsibility
- God doesn't force

**6. Inclusion**
- "All are alike unto God" (2 Nephi 26:33)
- Male/female, Jew/Gentile equal
- "Whosoever will come" (Alma 5:34)
- Universal invitation

### Contrast to LDS Emphases

**LDS often emphasizes:**
- Lamanites as Native American ancestors
- Priesthood authority and ordinances
- Temple work foreshadowed
- Pre-existence and plan of salvation
- Three degrees of glory (Alma 12-13)

**CoC often emphasizes:**
- Christ's teachings on peace and justice
- Social ethics (care for poor)
- Grace over works
- Inclusion and equality
- Spiritual principles over historical claims

## Book of Mormon in CoC Worship

### How It's Used

**Limited compared to LDS:**
- Not studied as extensively
- Bible more frequently used
- D&C for CoC-specific revelation
- BoM for special occasions

**When used:**
- Topical sermons (peace, justice, grace)
- Christ's ministry (3 Nephi)
- Individual devotion
- Youth education

**What's emphasized:**
- Ethical teachings
- Christ's character
- Social justice
- Personal transformation

## Addressing Difficult Parts

### Problematic Passages

**Violence:**
- Wars and destructions
- Nephite exceptionalism
- "Righteousness" of some killing

**Race:**
- "Skin of blackness" as curse (2 Nephi 5:21)
- "White and delightsome" (2 Nephi 30:6)
- Racial coding problematic

**Gender:**
- Few women characters
- Mostly patriarchal narrative

### CoC Response

**Acknowledge issues:**
- These passages reflect limitations
- 19th century prejudices may be present
- Not everything in scripture is prescriptive

**Interpret through Christ:**
- Use Jesus as hermeneutical key
- Reject what contradicts Christ's love
- Value spiritual insights, critique harmful parts

**Apply selectively:**
- Learn from positive teachings
- Critique negative passages
- Grow beyond limitations

## Personal Reading Approaches

### For CoC Members

**If you believe it's historical:**
- Read as ancient prophets' witness
- Appreciate cultural context
- Learn from their faith journey
- Apply principles to today

**If you see it as inspired fiction:**
- Read as parable or allegory
- Appreciate Joseph Smith's inspiration
- Extract spiritual truths
- Compare to other wisdom literature

**If you're uncertain:**
- Focus on message, not origins
- Let questions remain open
- Value spiritual impact
- Discuss openly with others

### Questions to Ask While Reading

- **Not:** "Did this really happen?"
- **But:** "What is this teaching about God?"
- **What does this reveal about Christ?"
- **How does this call me to justice?"
- **What spiritual insight is here?"

## Comparison: CoC vs. LDS Approach

| Aspect | Community of Christ | LDS Church |
|--------|-------------------|------------|
| **Historicity** | Not required belief | Required belief |
| **Use** | Occasional | Central, daily |
| **Interpretation** | Diverse views welcome | Literal, historical |
| **Authority** | One of four standard works | "Most correct book" |
| **Emphasis** | Ethical/spiritual teachings | Historical/doctrinal claims |
| **Lamanites** | Spiritual lessons | Native American ancestors |
| **Scholarship** | Acknowledged, integrated | Viewed with suspicion |
| **Questions** | Openly discussed | Often discouraged |

## CoC's Unique Contributions

### The 1908 Authorized Edition

**RLDS/CoC published own edition (1908):**
- **Verse numbering different** from LDS (more like Bible chapters/verses)
- **Footnotes and helps** added
- **Some textual differences** from LDS edition

**Still used by some CoC members**, though many now use LDS edition for compatibility.

### Scholarly Openness

**CoC has fostered:**
- Open scholarship on Book of Mormon
- Dialogue journal (Mormon/CoC exchange)
- Historical honesty about origins
- Space for questioning

## Living with the Book of Mormon

### For Uncertain Members

**It's okay to:**
- Have questions
- Not be sure of historicity
- Find value despite doubts
- Hold complexity

**Church affirms:**
- Your faith is valid
- Questions are welcome
- Spiritual value transcends origins
- Community holds diversity

### For Committed Believers

**It's okay to:**
- Believe in historicity
- Hold traditional view
- See it as ancient record
- Trust Joseph Smith's account

**Church also affirms:**
- Your faith is valued
- Traditional views welcomed
- Space for diverse perspectives
- Unity in mission despite differences

## Personal Application

### Engaging Book of Mormon

**Try these approaches:**

1. **Read favorite passages** - What resonates spiritually?
2. **Study a theme** - Peace, justice, grace, Christ
3. **Ask new questions** - What does this say about God's character?
4. **Discuss with others** - Share insights and questions
5. **Apply ethically** - How does this call to action today?

**Remember:**
- Don't let historicity questions block spiritual engagement
- Focus on transformation, not information
- Use Christ as interpretive lens
- Value community's diverse insights

## Conclusion

**For Community of Christ:**
- Book of Mormon is **scripture**
- Historicity is **open question**
- Spiritual value is **paramount**
- Diverse views are **welcomed**

**The important questions aren't:**
- "Did this really happen?"
- "Were there really Nephites?"
- "Is archaeology consistent?"

**The important questions are:**
- "What does this teach about God?"
- "How does this reveal Christ?"
- "What does this call me to do?"
- "How does this transform my life?"

**Book of Mormon's value:**
Not in historical accuracy, but in **pointing to Christ** and calling us to **peace, justice, and grace**.

That's something CoC members can affirm together, regardless of how they view its origins.`,
        keyTerms: [
          { term: 'Historicity', definition: 'Whether Book of Mormon is ancient historical record; CoC doesn\'t require belief either way' },
          { term: 'Inspired Fiction', definition: 'View that BoM is 19th century creation with spiritual value, held by many CoC members' },
          { term: '1908 Authorized Edition', definition: 'RLDS edition of Book of Mormon with different verse numbering and footnotes' },
          { term: 'Hermeneutical Key', definition: 'Interpretive principle; CoC uses Christ as lens to interpret all scripture' },
        ],
        discussionQuestions: [
          'Why does CoC allow diverse views on Book of Mormon historicity?',
          'How can scripture be valuable even if origins are uncertain?',
          'What themes from Book of Mormon resonate most with you?',
          'How does CoC\'s approach to BoM differ from fundamentalism?',
          'What\'s the difference between "true history" and "true spiritually"?',
        ],
        historicalMaterials: [
          {
            title: 'Book of Mormon (1908 RLDS Authorized Edition)',
            url: 'https://archive.org/details/bookofmormonacco00unse',
            type: 'archive_org',
          },
          {
            title: 'Community of Christ Statement on Book of Mormon',
            url: 'https://www.cofchrist.org/scripture',
            type: 'modern',
          },
        ],
        cocPerspective: `Community of Christ's approach to the Book of Mormon reflects **mature faith** that can hold complexity. Rather than requiring uniform belief about origins, CoC trusts members to engage scripture honestly. This parallels how mainstream Christians read Bible—not requiring literal six-day creation or Jonah's fish as history, but valuing spiritual truths. CoC says: **Focus on the message, not the messenger; on transformation, not information**. The book's value is in how it points to Christ and calls us to justice and peace. Whether ancient record or inspired parable, those truths remain. This approach honors intellectual integrity while maintaining spiritual depth.`,
        applicationChallenge: 'Read 3 Nephi 11 (Christ\'s appearance) and 4 Nephi 1 (peace after Christ). Without worrying about historicity, ask: What vision of peace and Christ\'s presence does this offer? How can I embody that vision today?',
        quiz: {
          questions: [
            {
              id: 1,
              question: 'Does Community of Christ require members to believe in Book of Mormon historicity?',
              options: [
                'Yes, it\'s required',
                'No, diverse views are welcomed',
                'Only new members must believe',
                'It\'s under discussion'
              ],
              correctAnswer: 1,
              explanation: 'CoC does not require belief in Book of Mormon historicity. Some view it as ancient record, others as inspired fiction with spiritual truths. Both perspectives are welcomed.',
            },
            {
              id: 2,
              question: 'How does CoC\'s use of the Book of Mormon compare to LDS Church?',
              options: [
                'CoC uses it more frequently',
                'CoC uses it occasionally; LDS uses it centrally',
                'Both use it equally',
                'CoC doesn\'t use it at all'
              ],
              correctAnswer: 1,
              explanation: 'CoC uses the Book of Mormon occasionally in worship and study, while the LDS Church studies it extensively and considers it the "most correct book on earth."',
            },
            {
              id: 3,
              question: 'What themes does CoC emphasize when reading the Book of Mormon?',
              options: [
                'Lamanite ancestry of Native Americans',
                'Temple ordinances foreshadowed',
                'Christ, grace, peace, justice, social ethics',
                'Pre-existence and plan of salvation'
              ],
              correctAnswer: 2,
              explanation: 'CoC emphasizes Christ\'s teachings, grace over works, peace (Anti-Nephi-Lehies), social justice (care for poor), and inclusion ("all are alike unto God").',
            },
            {
              id: 4,
              question: 'What does CoC use as a "hermeneutical key" to interpret scripture?',
              options: [
                'Joseph Smith\'s teachings',
                'Church tradition',
                'Jesus Christ',
                'Historical context only'
              ],
              correctAnswer: 2,
              explanation: 'CoC uses Christ as the interpretive lens (hermeneutical key) for all scripture, accepting what aligns with Christ\'s love and critiquing what doesn\'t.',
            },
            {
              id: 5,
              question: 'What is the "inspired fiction" view of the Book of Mormon?',
              options: [
                'It\'s completely made up without value',
                'It\'s a 19th century creation with profound spiritual truths',
                'It\'s fiction mixed with true history',
                'It\'s only for entertainment'
              ],
              correctAnswer: 1,
              explanation: 'The "inspired fiction" view held by many CoC members sees the Book of Mormon as Joseph Smith\'s inspired 19th century creation containing valuable spiritual truths.',
            },
          ],
          passingScore: 70,
        },
      },
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
