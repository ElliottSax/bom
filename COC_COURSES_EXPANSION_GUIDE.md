# Community of Christ Courses - Expansion Guide

## Adding More Lesson Content

The mobile implementation currently includes the structure for all 6 lessons of the "Introduction to Community of Christ" course, but only the first lesson has complete content. This guide explains how to add the remaining lesson content.

## Step 1: Update useCoCCourses.ts

Location: `apps/mobile/src/hooks/useCoCCourses.ts`

### Current Structure

The hook currently has:

```typescript
const COC_COURSES: Course[] = [
  {
    id: 'intro-coc',
    title: 'Introduction to Community of Christ',
    // ...
    lessons: [
      {
        id: 'intro-coc-1',
        title: 'Origins and History (1860-2001)',
        // ... COMPLETE CONTENT ...
      },
      // Lessons 2-6 need to be added here
    ],
  },
];
```

### Adding Remaining Lessons

Copy the complete lesson content from the web version at:
`apps/web/app/hooks/useCoCCourses.ts`

Each lesson (lines 264-1857 in the web version) includes:

1. **Lesson 2**: Eight Sacraments (Not Temple Ordinances)
2. **Lesson 3**: Enduring Principles: CoC Core Values
3. **Lesson 4**: Section 156: Women's Ordination (1984)
4. **Lesson 5**: Temple Theology: Kirtland & Independence
5. **Lesson 6**: Book of Mormon in CoC Perspective

### Example: Adding Lesson 2

```typescript
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
    { book: 'D&C', chapter: 17, verseStart: 8 },
    { book: 'D&C', chapter: 20, verseStart: 68 },
  ],
  content: `# Eight Sacraments of Community of Christ

Community of Christ practices **eight sacraments** - sacred acts that mark moments of God's grace in our lives...

[Full markdown content from web version]
`,
  keyTerms: [
    { term: 'Sacrament', definition: 'Sacred act that mediates God\'s grace...' },
    // ... more terms
  ],
  discussionQuestions: [
    'How does "means of grace" differ from "required for salvation"?',
    // ... more questions
  ],
  cocPerspective: `Community of Christ sees sacraments as **participatory** rather than **performative**...`,
  applicationChallenge: 'Reflect on a time when you experienced God\'s presence in community worship...',
},
```

## Step 2: Adding New Courses

### Course Template

```typescript
{
  id: 'unique-course-id',
  title: 'Course Title',
  subtitle: 'Descriptive Subtitle',
  description: 'Full course description explaining what students will learn...',
  level: 'beginner', // or 'intermediate' or 'advanced'
  duration: '3 weeks', // or '2 weeks', '1 month', etc.
  lessonsCount: 8, // number of lessons
  icon: '📚', // emoji icon for the course
  color: '#9C27B0', // hex color for course theme
  prerequisites: ['intro-coc'], // optional array of prerequisite course IDs
  outcomes: [
    'Outcome 1: What students will be able to do',
    'Outcome 2: Understanding they will gain',
    'Outcome 3: Skills they will develop',
  ],
  lessons: [
    // Array of lesson objects (see lesson template below)
  ],
}
```

### Lesson Template

```typescript
{
  id: 'unique-lesson-id',
  title: 'Lesson Title',
  type: 'study', // or 'reading', 'quiz', 'reflection'
  description: 'Brief description of what this lesson covers',
  duration: 25, // minutes
  objectives: [
    'Objective 1',
    'Objective 2',
    'Objective 3',
  ],
  scriptures: [
    { book: 'D&C', chapter: 163, verseStart: 1 },
    { book: 'Mosiah', chapter: 4, verseStart: 16, verseEnd: 19 },
  ],
  content: `# Lesson Title

## Section 1

Content in markdown format...

### Subsection

More content...

## Section 2

Continue with structured markdown content...`,
  keyTerms: [
    { term: 'Term 1', definition: 'Definition of term 1' },
    { term: 'Term 2', definition: 'Definition of term 2' },
  ],
  discussionQuestions: [
    'Question 1 to ponder?',
    'Question 2 for discussion?',
  ],
  historicalContext: 'Background information about the historical setting...',
  cocPerspective: 'CoC\'s unique theological perspective on this topic...',
  historicalMaterials: [
    {
      title: 'Historical Document Title',
      url: 'https://archive.org/details/...',
      type: 'archive_org', // or 'saints_herald', 'joseph_smith_iii', 'centerplace', 'modern'
    },
  ],
  applicationChallenge: 'Practical challenge for applying lesson principles...',
}
```

## Suggested New Courses

### 1. D&C Sections 114-167: CoC Revelations

```typescript
{
  id: 'doc-coc-revelations',
  title: 'D&C Sections 114-167',
  subtitle: 'CoC-Specific Revelations and Their Impact',
  description: 'Study the revelations received by CoC prophet-presidents from 1860-2023, including major developments like Section 156 (women\'s ordination) and Section 164 (people of the Temple).',
  level: 'intermediate',
  duration: '6 weeks',
  lessonsCount: 12,
  icon: '📜',
  color: '#673AB7',
  prerequisites: ['intro-coc'],
  outcomes: [
    'Understand key CoC revelations from 1860-2023',
    'Recognize patterns of continuing revelation',
    'Learn about prophetic ministry in CoC',
    'Apply revelatory insights to modern life',
  ],
  lessons: [
    // Lessons covering key sections
  ],
}
```

### 2. Peace and Justice in CoC Theology

```typescript
{
  id: 'peace-justice',
  title: 'Peace and Justice in CoC',
  subtitle: 'Becoming People of the Temple',
  description: 'Explore Community of Christ\'s distinctive peace theology, including Section 164\'s call to "pursue peace" and practical peacemaking in daily life.',
  level: 'intermediate',
  duration: '4 weeks',
  lessonsCount: 8,
  icon: '☮️',
  color: '#4CAF50',
  outcomes: [
    'Understand CoC peace theology',
    'Learn practical peacemaking skills',
    'Study Section 164 and temple symbolism',
    'Apply shalom principles daily',
  ],
  lessons: [
    // Lessons on peace, justice, reconciliation
  ],
}
```

### 3. CoC Book of Mormon Study Guide

```typescript
{
  id: 'coc-bom-study',
  title: 'Book of Mormon: CoC Approach',
  subtitle: 'Reading with Openness and Insight',
  description: 'Study the Book of Mormon through a CoC lens, focusing on spiritual insights rather than historicity debates, and Christ\'s teachings on peace and justice.',
  level: 'beginner',
  duration: '8 weeks',
  lessonsCount: 16,
  icon: '📖',
  color: '#2196F3',
  outcomes: [
    'Read Book of Mormon with CoC hermeneutic',
    'Extract ethical and spiritual teachings',
    'Understand CoC\'s diverse views on historicity',
    'Apply Book of Mormon insights to modern life',
  ],
  lessons: [
    // Lessons covering key Book of Mormon passages
  ],
}
```

## Content Guidelines

### Writing Style

- **Academic but accessible**: Scholarly but not dry
- **Balanced**: Present multiple perspectives when appropriate
- **Respectful**: Honor both CoC and LDS traditions
- **Practical**: Include application challenges
- **Well-sourced**: Link to historical materials

### Markdown Best Practices

- Use clear heading hierarchy (# ## ###)
- Include blockquotes for emphasis
- Use bullet points and numbered lists
- Add tables when comparing concepts
- Bold important terms on first use
- Keep paragraphs concise (3-5 sentences)

### Scripture References

Always provide:

- Book name
- Chapter number
- Starting verse
- Ending verse (if range)

Example:

```typescript
{ book: 'D&C', chapter: 156, verseStart: 9 }
{ book: 'Mosiah', chapter: 4, verseStart: 16, verseEnd: 19 }
```

### Historical Materials

Link to primary sources when possible:

- Archive.org for historical documents
- CofChrist.org for official resources
- Centerplace.org for RLDS references
- Academic papers for scholarly analysis

## Testing New Content

After adding lessons or courses:

1. **Type Check**

```bash
cd apps/mobile
npm run type-check
```

2. **Visual Review**

- Navigate to the course in the app
- Check all tabs render correctly
- Verify markdown formatting
- Test external links
- Review on different screen sizes

3. **Content Review**

- Verify historical accuracy
- Check scripture references
- Test discussion questions relevance
- Ensure balanced perspective

## Version Control

When adding content:

1. Create feature branch:

```bash
git checkout -b feature/coc-course-expansion
```

2. Commit changes with clear messages:

```bash
git add apps/mobile/src/hooks/useCoCCourses.ts
git commit -m "feat(coc-courses): Add complete content for lessons 2-6"
```

3. Push and create PR:

```bash
git push origin feature/coc-course-expansion
```

## Maintenance

### Updating Existing Content

- Fix typos or errors immediately
- Major content changes should be reviewed
- Keep historical accuracy current with scholarship
- Update external links if they break

### Versioning Courses

Consider adding a version field:

```typescript
{
  id: 'intro-coc',
  version: '1.0',
  lastUpdated: '2026-01-28',
  // ... rest of course
}
```

## Resources for Content Creation

### Historical Sources

- [Archive.org RLDS Collection](https://archive.org)
- [Saints' Herald Archive](https://archive.org/details/saintsheraldvol01unkngoog)
- [Joseph Smith III Writings](https://archive.org/details/historyofchurcho03smitrich)

### CoC Official Resources

- [Community of Christ](https://www.cofchrist.org)
- [Kirtland Temple](https://www.kirtlandtemple.org)
- [Herald House Publishing](https://www.heraldhouse.org)

### Reference Sites

- [Centerplace.org](https://www.centerplace.org)
- [John Whitmer Historical Association](https://www.jwha.info)

## Questions?

For questions about expanding CoC course content:

1. Review existing lessons for patterns
2. Check the web version for complete content
3. Consult CoC official resources for accuracy
4. Test thoroughly before committing

## Summary

The CoC courses infrastructure is fully in place. Adding new content is straightforward:

1. Copy lesson content from web version or write new lessons
2. Follow the established TypeScript interfaces
3. Use markdown for rich formatting
4. Include all optional fields (terms, questions, materials, etc.)
5. Test in the mobile app
6. Commit and push changes

The framework supports unlimited courses and lessons - the only limit is creating quality educational content!
