# Improvement Roadmap - Community of Christ Study Platform

**Created:** January 26, 2026
**Status:** Analysis of current state and recommended improvements

---

## 🎯 Current State Analysis

### ✅ What's Working Well

**Content:**
- 6 complete CoC course lessons (140 minutes)
- 2 informational modals (About CoC, CoC Resources)
- 31 D&C sections scraped and ready (114-144)
- Authentic RLDS historical materials linked

**Technical:**
- React components with TypeScript
- Lazy loading for performance
- Responsive design
- Dark mode support
- Local storage for user data

**User Features:**
- Scripture reading (BoM, D&C, Bible)
- Bookmarks, highlights, notes
- Reading progress tracking
- Study plans
- Search functionality

### ❌ What's Missing

**Critical Gaps:**
1. **No Course UI** - Courses exist in code but users can't access them
2. **No Lesson Viewer** - Can't read the 6 lessons we created
3. **No Progress Tracking for Courses** - Can't save lesson completion
4. **Missing 23 D&C Sections** - Sections 145-167 not scraped
5. **Database Not Applied** - Migration and data import pending

**Feature Gaps:**
6. No course selector/catalog
7. No quiz system (lessons mention quizzes)
8. No course certificates or completion tracking
9. Mobile app doesn't have CoC content yet
10. No admin interface for content management

---

## 🚀 Priority 1: Critical (Make It Usable)

### 1. Build Course Viewer UI ⭐⭐⭐⭐⭐

**Problem:** Users can't access the 6 lessons we created.

**Solution:** Create course viewing components

**Components Needed:**
- `CourseCatalog.tsx` - List all available courses
- `CourseDetail.tsx` - Show course overview and lesson list
- `LessonViewer.tsx` - Display lesson content with markdown rendering
- `LessonNavigation.tsx` - Previous/Next lesson buttons
- Add to main navigation (Sidebar or Header)

**Estimated Time:** 3-4 hours

**Impact:** HIGH - Without this, all the course content is invisible to users

---

### 2. Apply Database Migration ⭐⭐⭐⭐⭐

**Problem:** Database doesn't have CoC support columns and tables.

**Solution:** Run the migration and import scripts

**Commands:**
```bash
# 1. Apply migration
psql -d bom_study_tools_dev \
  -f services/api/prisma/migrations/004_coc_support/migration.sql

# 2. Import sections
psql -d bom_study_tools_dev \
  -f services/api/prisma/seeds/import-coc-dc-sections.sql

# 3. Verify
psql -d bom_study_tools_dev \
  -c "SELECT COUNT(*) FROM doctrine_covenants_verses WHERE tradition = 'coc';"
```

**Estimated Time:** 30 minutes (if PostgreSQL is running)

**Impact:** HIGH - Enables D&C 114-144 in the app

---

### 3. Test the UI ⭐⭐⭐⭐

**Problem:** Haven't verified the modals work in browser.

**Solution:** Run dev server and test all new features

**Test Checklist:**
- [ ] Start dev server: `npm run dev`
- [ ] Click "About CoC" button - modal opens correctly
- [ ] Click "CoC Resources" button - modal opens correctly
- [ ] External links open in new tabs
- [ ] Modals are responsive on mobile
- [ ] Close buttons work
- [ ] Keyboard navigation (ESC key, Tab)
- [ ] Dark mode displays correctly

**Estimated Time:** 1 hour

**Impact:** HIGH - Ensures quality before users see it

---

## 🎯 Priority 2: High Value (Complete the Experience)

### 4. Add Course Progress Tracking ⭐⭐⭐⭐

**Problem:** Users can't save their progress through lessons.

**Solution:** Track completed lessons and courses

**Implementation:**
- Add to `UserDataContext` or create `CourseProgressContext`
- Store in local storage: `coc-course-progress`
- Track: course started, lessons completed, completion date
- Show progress indicators (checkmarks, progress bar)

**Data Structure:**
```typescript
{
  courseProgress: {
    'intro-coc': {
      started: '2026-01-26',
      lessonsCompleted: ['intro-coc-1', 'intro-coc-2'],
      completed: false,
      completedDate: null
    }
  }
}
```

**Estimated Time:** 2-3 hours

**Impact:** HIGH - Users want to track learning progress

---

### 5. Source Missing D&C Sections (145-167) ⭐⭐⭐⭐

**Problem:** Only have sections 114-144, missing 23 sections.

**Solution:** Get sections from official CoC website or manual entry

**Options:**

**Option A: Official CoC Website**
- URL: https://www.cofchrist.org/doctrine-and-covenants
- May require different scraping approach
- Might have copyright restrictions

**Option B: Manual Entry**
- Most critical sections: 156 (women), 167 (latest)
- Could manually type from printed D&C
- 23 sections, might take 4-6 hours

**Option C: Community Request**
- Ask CoC if they have digital files
- Request permission to include
- Proper attribution

**Estimated Time:** 4-8 hours (depending on method)

**Impact:** MEDIUM-HIGH - Completes D&C coverage, especially Section 156

---

### 6. Build Quiz System ⭐⭐⭐

**Problem:** Lessons mention quizzes but no quiz functionality exists.

**Solution:** Create quiz components for lessons

**Components:**
- `Quiz.tsx` - Main quiz component
- `QuizQuestion.tsx` - Single question with options
- `QuizResults.tsx` - Show score and review

**Quiz Data Structure:**
```typescript
{
  quizzes: [{
    lessonId: 'intro-coc-3',
    questions: [
      {
        id: 1,
        question: 'How many Enduring Principles does CoC have?',
        options: ['6', '8', '9', '12'],
        correctAnswer: 2,
        explanation: 'CoC has nine Enduring Principles...'
      }
    ]
  }]
}
```

**Estimated Time:** 4-5 hours

**Impact:** MEDIUM - Enhances learning, tests understanding

---

### 7. Mobile App CoC Integration ⭐⭐⭐

**Problem:** Mobile app (React Native) doesn't have CoC content.

**Solution:** Port CoC courses and modals to mobile

**Tasks:**
- Copy `useCoCCourses.ts` to mobile hooks
- Create mobile `CoursesScreen` for CoC (already has template)
- Create mobile `LessonScreen` for reading lessons
- Add CoC info to existing About screen
- Add CoC resources to Resources screen

**Estimated Time:** 3-4 hours

**Impact:** MEDIUM - Provides mobile access to content

---

## 💡 Priority 3: Nice to Have (Enhanced Features)

### 8. Course Certificates ⭐⭐

**Problem:** No recognition for completing courses.

**Solution:** Generate completion certificates

**Features:**
- PDF certificate with name and date
- "Certificate of Completion" design
- Share on social media
- Print option

**Estimated Time:** 3-4 hours

**Impact:** LOW-MEDIUM - Motivates completion

---

### 9. Bookmark Integration with Courses ⭐⭐

**Problem:** Can bookmark verses but not course content.

**Solution:** Allow bookmarking specific lessons or sections

**Features:**
- "Bookmark this lesson" button
- Quick access to bookmarked lessons
- Notes on course content

**Estimated Time:** 2-3 hours

**Impact:** LOW-MEDIUM - Useful for review

---

### 10. Search Within Courses ⭐⭐

**Problem:** Can't search course content.

**Solution:** Add search functionality for lessons

**Features:**
- Search bar in course catalog
- Search lesson titles and content
- Highlight search terms in results
- Jump to specific lesson section

**Estimated Time:** 3-4 hours

**Impact:** MEDIUM - Helps find specific topics

---

### 11. Discussion Questions Feature ⭐⭐

**Problem:** Lessons have discussion questions but no way to use them.

**Solution:** Create discussion/reflection space

**Options:**

**Option A: Personal Reflection**
- Journal space for each question
- Save reflections locally
- Review past reflections

**Option B: Community Discussion**
- Forum-style discussions (requires backend)
- Share insights with other users
- Moderation needed

**Estimated Time:** 2-3 hours (Option A) or 10+ hours (Option B)

**Impact:** MEDIUM - Deepens learning

---

### 12. Print/Export Lessons ⭐⭐

**Problem:** Can't print or export lessons for offline use.

**Solution:** Add print and export functionality

**Features:**
- Print-friendly CSS (remove nav, optimize layout)
- Export as PDF
- Export all lessons in a course
- Include images and formatting

**Estimated Time:** 2-3 hours

**Impact:** LOW-MEDIUM - Useful for offline study

---

### 13. Audio Narration ⭐⭐

**Problem:** Some users prefer audio learning.

**Solution:** Add text-to-speech or recorded narration

**Options:**

**Option A: Text-to-Speech**
- Browser's built-in TTS
- Free but robotic
- Quick to implement

**Option B: Recorded Audio**
- Professional narration
- Better quality
- Expensive and time-consuming

**Estimated Time:** 2-3 hours (Option A) or 20+ hours (Option B)

**Impact:** MEDIUM - Accessibility and convenience

---

### 14. Course Recommendations ⭐

**Problem:** Users don't know what to study next.

**Solution:** Recommend courses based on progress

**Features:**
- "Recommended for you" based on completed courses
- "Popular courses" based on completion rates
- "Related courses" on course detail page
- Personalized learning paths

**Estimated Time:** 3-4 hours

**Impact:** LOW-MEDIUM - Helps user discovery

---

### 15. Social Sharing ⭐

**Problem:** Users can't easily share courses with friends.

**Solution:** Add social sharing buttons

**Features:**
- Share course link on Facebook, Twitter, email
- "Invite a friend to study together"
- Share completion certificates
- WhatsApp/SMS sharing

**Estimated Time:** 2-3 hours

**Impact:** LOW - Word-of-mouth growth

---

## 🔧 Priority 4: Technical Improvements

### 16. Performance Optimization ⭐⭐⭐

**Areas to Optimize:**
- Bundle size analysis (Next.js bundle analyzer)
- Image optimization (next/image for all images)
- Code splitting (more lazy loading)
- Memoization for expensive computations
- Virtual scrolling for long lists

**Estimated Time:** 4-6 hours

**Impact:** MEDIUM - Faster load times

---

### 17. Accessibility Audit ⭐⭐⭐

**Improvements:**
- ARIA labels on all interactive elements
- Keyboard navigation for all features
- Screen reader testing
- Color contrast compliance (WCAG AA)
- Focus indicators
- Skip to main content link

**Estimated Time:** 3-5 hours

**Impact:** HIGH - Inclusive design

---

### 18. Error Handling ⭐⭐

**Improvements:**
- Better error messages
- Retry logic for failed requests
- Offline mode graceful degradation
- Loading states for all async operations
- Error boundary improvements

**Estimated Time:** 3-4 hours

**Impact:** MEDIUM - Better UX

---

### 19. Testing ⭐⭐

**Test Coverage:**
- Unit tests for hooks (useCoCCourses, etc.)
- Component tests (React Testing Library)
- Integration tests for key flows
- E2E tests (Playwright or Cypress)

**Estimated Time:** 8-10 hours

**Impact:** MEDIUM - Code quality and confidence

---

### 20. Analytics ⭐

**Track:**
- Course views and completions
- Lesson engagement time
- Most popular courses
- User journey through courses
- Drop-off points

**Privacy:**
- Anonymous analytics (no PII)
- GDPR compliant
- User opt-out option

**Estimated Time:** 3-4 hours

**Impact:** LOW-MEDIUM - Data-driven improvements

---

## 📊 Recommended Implementation Order

### Phase 1: Make It Work (Week 1)
**Goal:** Users can access and complete courses

1. ✅ Build Course Viewer UI (3-4 hours)
2. ✅ Apply Database Migration (30 min)
3. ✅ Test the UI (1 hour)
4. ✅ Add Course Progress Tracking (2-3 hours)

**Total:** ~8 hours
**Status:** Makes the platform functional

---

### Phase 2: Complete the Content (Week 2)
**Goal:** Full D&C coverage and enhanced learning

5. ✅ Source Missing D&C Sections 145-167 (4-8 hours)
6. ✅ Build Quiz System (4-5 hours)
7. ✅ Mobile App CoC Integration (3-4 hours)

**Total:** ~15 hours
**Status:** Complete content library

---

### Phase 3: Enhance Learning (Week 3-4)
**Goal:** Better learning experience

8. Discussion Questions Feature (2-3 hours)
9. Print/Export Lessons (2-3 hours)
10. Search Within Courses (3-4 hours)
11. Bookmark Integration (2-3 hours)

**Total:** ~12 hours
**Status:** Rich feature set

---

### Phase 4: Polish (Week 5)
**Goal:** Production-ready quality

12. Accessibility Audit (3-5 hours)
13. Performance Optimization (4-6 hours)
14. Error Handling (3-4 hours)
15. Course Certificates (3-4 hours)

**Total:** ~16 hours
**Status:** Professional quality

---

### Phase 5: Growth (Week 6+)
**Goal:** Expand reach and engagement

16. Audio Narration (Option A: 2-3 hours)
17. Social Sharing (2-3 hours)
18. Course Recommendations (3-4 hours)
19. Analytics (3-4 hours)
20. Testing (8-10 hours)

**Total:** ~20 hours
**Status:** Sustainable platform

---

## 🎯 Quick Wins (Do First!)

If you only have 4-8 hours, focus on these:

### Must-Do (4 hours)
1. **Build Course Viewer UI** (3 hours) - Lets users see the content
2. **Test the UI** (1 hour) - Ensure modals work

### Should-Do (4 more hours)
3. **Add Course Progress Tracking** (2 hours) - Track learning
4. **Apply Database Migration** (30 min) - Get D&C sections
5. **Accessibility fixes** (1.5 hours) - ARIA labels, keyboard nav

---

## 💬 Additional Course Ideas

If you want to create more courses:

### Course 2: "D&C Sections 114-167: CoC Revelations"
- 10-12 lessons covering significant CoC sections
- Focus on sections 114, 125, 128, 144, 156, 163, 164, 165, 167
- Historical context for each
- **Estimated Time:** 15-20 hours to create content

### Course 3: "Joseph Smith III: Leadership in Crisis"
- 6-8 lessons on JST III's 54-year presidency
- Using archive.org historical sources
- **Estimated Time:** 10-12 hours

### Course 4: "Peace and Justice in CoC Tradition"
- 6 lessons on CoC peace theology
- Practical peacemaking skills
- **Estimated Time:** 8-10 hours

### Course 5: "Exploring the Inspired Version"
- Comparing IV to KJV
- Joseph Smith Translation insights
- **Estimated Time:** 10-12 hours

---

## 📝 Notes

### What Would Have Biggest Impact?

**For Users:**
1. Course Viewer UI (can't use content without it)
2. Progress Tracking (motivation to complete)
3. Missing D&C sections (especially 156, 167)

**For Growth:**
1. Mobile app integration (mobile users)
2. Social sharing (word of mouth)
3. Course certificates (sense of achievement)

**For Quality:**
1. Testing (confidence in code)
2. Accessibility (inclusive design)
3. Performance (user retention)

### Technical Debt to Address

1. **No automated tests** - Should add Jest/RTL tests
2. **No CI/CD** - Should set up GitHub Actions
3. **No staging environment** - Should have test deployment
4. **Hardcoded content** - Courses in code, should be in DB eventually

---

## 🤔 Questions to Consider

1. **Who is the primary user?**
   - CoC members learning their tradition?
   - Former LDS exploring alternatives?
   - Restoration history scholars?
   - General curious people?

2. **What's the core value proposition?**
   - Authentic CoC content (differentiation)
   - Free and accessible (vs paid alternatives)
   - Comprehensive coverage (breadth)
   - Mobile-friendly (convenience)

3. **How will this be maintained long-term?**
   - Who creates new content?
   - Who moderates discussions?
   - Who handles support?
   - Sustainability model?

4. **Should this be open source?**
   - Could invite contributions
   - Transparency builds trust
   - Community maintenance
   - Licensing considerations

---

## ✅ Immediate Next Steps (Today/This Week)

Based on this analysis, I recommend:

**Today (2-3 hours):**
1. ✅ Build basic `CourseCatalog.tsx` component
2. ✅ Build basic `LessonViewer.tsx` component
3. ✅ Wire them into main navigation
4. ✅ Test in browser

**This Week (4-6 hours):**
5. ✅ Add course progress tracking
6. ✅ Improve accessibility (ARIA labels)
7. ✅ Apply database migration (if DB available)
8. ✅ Test all features thoroughly

**Next Week (6-8 hours):**
9. Build quiz system for lessons
10. Source missing D&C sections 145-167
11. Create 1-2 more courses

---

**Ready to start? Which area would you like to tackle first?**

1. Course Viewer UI (most important)
2. Testing current features
3. Additional course content
4. Technical improvements
5. Something else?
