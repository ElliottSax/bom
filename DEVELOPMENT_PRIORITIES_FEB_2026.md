# Development Priorities - February 2026

**Date**: February 1, 2026
**Project**: Book of Mormon Study Tools - Community of Christ Edition

## 📊 Current State Summary

### ✅ Completed Work

1. **Code Refactoring** (Jan 30, 2026)
   - Logger utilities for mobile and web apps
   - Converted 115+ console.log calls
   - Email service implementation
   - API fixes and improvements

2. **CoC D&C Scraping** (Jan 28, 2026)
   - Sections 114-159 scraped (46 sections, 365 verses)
   - JSON and SQL import scripts generated
   - Historical context added for key sections

3. **CoC Courses Implementation**
   - Mobile app: 3 screens fully implemented (1,384 lines)
   - Web app: Course components and hooks
   - useCoCCourses hook with full course data
   - 6 complete course lessons

4. **Core Features**
   - Scripture reading (BoM, D&C, Bible)
   - Bookmarks, highlights, notes
   - Search functionality
   - Reading progress tracking
   - Study plans
   - Dark/light theme support

### ⏳ Pending Work

1. **CoC D&C Sections 160-165** - Need to obtain text
2. **Database Import** - CoC D&C sections not yet imported
3. **Uncommitted Changes** - Current work needs to be committed
4. **Testing** - Comprehensive tests need running environment

---

## 🎯 Priority 1: Critical (Next Session)

### 1. Commit Current Work ⭐⭐⭐⭐⭐

**Why**: Preserve 2 weeks of development work

**What to commit**:

- CoC D&C scraping work (sections 114-159)
- Documentation files (CoC courses, database setup)
- Migration scripts
- Code refactoring changes

**Commands**:

```bash
git add services/api/prisma/seeds/coc-dc-sections-114-167.json
git add services/api/prisma/seeds/import-coc-dc-sections.sql
git add services/api/src/scripts/scrape-coc-dc-114-167.ts
git add *.md
git add run-migration.sh setup-postgres-wsl2.sh
git commit -m "feat(coc): Add D&C sections 114-159 and CoC courses documentation"
```

**Estimated Time**: 15 minutes
**Impact**: CRITICAL - Prevents work loss

---

### 2. Import CoC D&C Sections into Database ⭐⭐⭐⭐

**Why**: Make sections 114-159 available in the app

**Requirements**:

- PostgreSQL running on port 5435
- Database: `bom_study_tools_dev`

**Commands**:

```bash
# Start PostgreSQL (method depends on environment)
docker start bom-postgres-dev  # OR
sudo service postgresql start

# Apply migration
psql -d bom_study_tools_dev \
  -f services/api/prisma/migrations/004_coc_support/migration.sql

# Import sections
psql -d bom_study_tools_dev \
  -f services/api/prisma/seeds/import-coc-dc-sections.sql

# Verify
psql -d bom_study_tools_dev \
  -c "SELECT section, COUNT(*) as verses FROM doctrine_covenants_verses WHERE tradition = 'coc' GROUP BY section ORDER BY section;"
```

**Expected Result**: 365 verses across 46 sections (114-159)

**Estimated Time**: 30 minutes
**Impact**: HIGH - Completes 76% of CoC D&C

---

### 3. Send CoC Permission Request ⭐⭐⭐⭐

**Why**: Obtain sections 160-165 legally and ethically

**Action Items**:

- Review draft: `COC_PERMISSION_REQUEST_DRAFT.md`
- Customize with your contact information
- Send to: herald@CofChrist.org and info@cofchrist.org
- Set reminder for 2-week follow-up

**Email Subject**: "Permission Request for Educational Scripture Study Platform"

**Estimated Time**: 15 minutes (to send)
**Wait Time**: 2-4 weeks for response
**Impact**: MEDIUM-HIGH - Completes final 11% of D&C

**Backup Plan**: If declined, purchase Herald House edition ($20-40) and transcribe

---

## 🎯 Priority 2: High Value Features

### 4. Test CoC Courses Functionality ⭐⭐⭐⭐

**Why**: Verify 1,384 lines of course code works correctly

**Mobile App Tests**:

```bash
# Start mobile app
cd apps/mobile
npm run start

# Test in Expo Go or simulator
# Navigate to: Home > Courses (CoC Courses)
# - Verify courses list loads
# - Open a course detail
# - Read a lesson
# - Check progress tracking
# - Test lesson navigation
```

**Web App Tests**:

```bash
# Start web app
cd apps/web
npm run dev

# Open http://localhost:3000
# - Navigate to courses section
# - Verify course catalog renders
# - Open course details
# - Test lesson viewer
# - Check markdown rendering
```

**Test Checklist**:

- [ ] Courses list displays all 6 courses
- [ ] Course levels show correct colors
- [ ] Lesson content renders markdown
- [ ] Scripture references are formatted
- [ ] Historical materials links work
- [ ] Navigation between lessons works
- [ ] Progress tracking saves correctly
- [ ] Dark mode displays properly
- [ ] Mobile responsive design works

**Estimated Time**: 2 hours
**Impact**: HIGH - Validates major feature

---

### 5. Add Quiz System for Courses ⭐⭐⭐

**Why**: Lessons mention quizzes but functionality doesn't exist

**Components to Create**:

**Mobile**: `apps/mobile/src/components/`

- `Quiz.tsx` - Main quiz container
- `QuizQuestion.tsx` - Individual question with multiple choice
- `QuizResults.tsx` - Score and review

**Web**: `apps/web/app/components/`

- Same components for web interface

**Data Structure**:

```typescript
interface Quiz {
  lessonId: string;
  questions: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[];
  passingScore: number; // percentage
}
```

**Implementation**:

1. Create quiz components
2. Add quiz data to lesson structure
3. Track quiz scores in progress
4. Show results with explanations
5. Allow retakes

**Estimated Time**: 4-6 hours
**Impact**: MEDIUM-HIGH - Completes course experience

---

### 6. Improve Error Handling & Logging ⭐⭐⭐

**Why**: Recent refactoring added logger, now integrate error reporting

**Tasks**:

1. **Wire up Sentry** (or alternative error reporting)

   ```bash
   npm install @sentry/react-native @sentry/nextjs
   ```

2. **Update logger.ts** to send errors to Sentry

   ```typescript
   export const logger = {
     error: (message: string, error?: Error) => {
       if (__DEV__) {
         console.error(message, error);
       }
       // TODO: Send to Sentry in production
       Sentry.captureException(error, { message });
     },
   };
   ```

3. **Add error boundaries** in key screens
4. **Track key events** for analytics

**Estimated Time**: 3-4 hours
**Impact**: MEDIUM - Better production monitoring

---

## 🎯 Priority 3: Nice to Have

### 7. Mobile App Improvements ⭐⭐⭐

**Features to Add**:

1. **Offline mode indicator** - Show when offline
2. **Sync status** - Show last sync time
3. **Performance optimizations** - Lazy loading, caching
4. **Accessibility** - Screen reader support, font scaling
5. **Onboarding** - First-time user tutorial

**Estimated Time**: 6-8 hours
**Impact**: MEDIUM - Better UX

---

### 8. Web App Feature Parity ⭐⭐

**Features Mobile Has That Web Doesn't**:

- Reading reminders
- Offline download management
- Cloud sync UI
- Word study/concordance
- Verse memorization
- Reading goals

**Implementation**: Port mobile components to web equivalents

**Estimated Time**: 10-12 hours
**Impact**: MEDIUM - Feature consistency

---

### 9. Admin Panel for Content Management ⭐⭐

**Why**: Easier to add/edit courses without coding

**Features**:

- Course editor (WYSIWYG markdown)
- Lesson creator
- Scripture reference picker
- Historical materials linker
- Preview before publish

**Tech Stack**:

- React Admin or Refine framework
- Markdown editor (react-md-editor)
- File upload for images

**Estimated Time**: 12-15 hours
**Impact**: LOW-MEDIUM - Makes content updates easier

---

## 🚀 Quick Wins (Can Do Now)

### 1. Documentation Updates ⏱️ 30 min

- [ ] Update README with latest features
- [ ] Add CoC courses to feature list
- [ ] Update PROJECT_STATUS_CURRENT.md
- [ ] Add screenshots to documentation

### 2. Code Quality ⏱️ 1 hour

- [ ] Run ESLint and fix remaining issues
- [ ] Add JSDoc comments to new hooks
- [ ] Remove unused imports
- [ ] Update TypeScript types

### 3. UI Polish ⏱️ 2 hours

- [ ] Consistent spacing in course screens
- [ ] Better loading states
- [ ] Improved empty states
- [ ] Better error messages

---

## 📅 Recommended Timeline

### Week 1 (Feb 1-7)

- ✅ Day 1: Commit work, import database, send permission request
- Day 2-3: Test CoC courses functionality
- Day 4-5: Build quiz system
- Day 6-7: Error handling improvements

### Week 2 (Feb 8-14)

- Wait for CoC response
- Mobile app improvements
- Web app feature parity
- Documentation updates

### Week 3 (Feb 15-21)

- Follow up on CoC permission request
- Admin panel (if time permits)
- Performance optimizations
- Prepare for deployment

### Week 4 (Feb 22-28)

- Handle CoC response (transcribe if needed)
- Final testing
- Bug fixes
- Launch preparation

---

## 🎯 Success Metrics

### Technical

- [ ] All uncommitted work committed
- [ ] CoC D&C sections 114-159 in database
- [ ] 100% of CoC courses tested
- [ ] 0 critical bugs
- [ ] <100ms API response time
- [ ] > 90% test coverage

### Content

- [ ] 165 D&C sections complete (currently 113 + 46 = 159)
- [ ] 6 courses functional
- [ ] Quiz system operational
- [ ] Progress tracking working

### User Experience

- [ ] All features work on mobile and web
- [ ] Dark mode fully supported
- [ ] Accessibility compliant (WCAG 2.1 AA)
- [ ] <2s page load time

---

## 💡 Technical Debt to Address

1. **Database Migration** - Currently manual, should be automated
2. **Test Coverage** - Only 199 test files, need integration tests
3. **API Documentation** - GraphQL schema needs updating
4. **TypeScript Strict Mode** - Some files have loose typing
5. **Dependency Updates** - Husky v9 deprecated, need v10
6. **Build Files** - tsconfig.tsbuildinfo should be gitignored

---

## 🔧 Development Environment Setup

### Prerequisites

```bash
# Required
- Node.js 18+
- PostgreSQL 15+
- npm or pnpm

# Optional
- Docker (for containerized PostgreSQL)
- Expo CLI (for mobile development)
- Android Studio / Xcode (for native builds)
```

### Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL
docker start bom-postgres-dev
# OR
sudo service postgresql start

# 3. Apply migrations
npm run db:migrate

# 4. Start development servers
npm run dev

# Mobile app: http://localhost:8081
# Web app: http://localhost:3000
# API: http://localhost:4000/graphql
```

---

## 📞 Next Actions

### Immediate (Today)

1. Commit current work
2. Review and send CoC permission request
3. Import CoC D&C sections to database

### This Week

1. Test all CoC courses functionality
2. Build quiz system
3. Improve error handling

### This Month

1. Complete remaining CoC D&C sections
2. Mobile app improvements
3. Web app feature parity
4. Prepare for production deployment

---

**Last Updated**: February 1, 2026
**Status**: Ready for next development sprint
**Priority Focus**: Commit work, test courses, obtain final D&C sections
