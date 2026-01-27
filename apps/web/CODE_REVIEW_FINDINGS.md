# Code Review Findings: Course & Quiz System

**Review Date**: 2026-01-27
**Reviewer**: Claude Sonnet 4.5
**Files Reviewed**: 10 files (~2,700 lines of code)

## Executive Summary

Reviewed the newly implemented CoC course system with quiz functionality. Found **15 issues** across 3 severity levels:

- 🔴 **Critical**: 2 bugs that could cause runtime errors
- 🟡 **Medium**: 7 issues affecting UX, accessibility, or code quality
- 🟢 **Low**: 6 minor improvements and code smells

Overall code quality is good with well-structured components, but there are some bugs and missing edge case handling that should be addressed before production.

---

## 🔴 Critical Issues (Must Fix)

### 1. Null Pointer Exception in Quiz Results
**File**: `apps/web/app/components/Quiz.tsx`
**Line**: 165
**Severity**: 🔴 Critical

**Issue**: Using non-null assertion operator on potentially null value:
```typescript
{question.options[userAnswer!]}  // Line 165
```

**Problem**: If a user somehow gets to the results screen with unanswered questions (e.g., by manipulating state), `userAnswer` could be `null`, causing `question.options[null]` which returns `undefined` and crashes the display.

**How it could happen**:
- User opens dev tools and manipulates React state
- Race condition in state updates
- Browser back/forward navigation

**Fix**:
```typescript
{userAnswer !== null ? question.options[userAnswer] : 'Not answered'}
```

**Impact**: Runtime error, broken results screen

---

### 2. Missing Quiz Validation Before Submission
**File**: `apps/web/app/components/Quiz.tsx`
**Lines**: 63-77

**Issue**: The `handleSubmit` function doesn't verify all questions are answered:
```typescript
const handleSubmit = () => {
  setSubmitted(true);
  setShowResults(true);
  // Calculates score even if some answers are null
}
```

**Problem**: Users can submit incomplete quizzes. The score calculation on line 68 treats `null` answers as incorrect (which is fine), but the UI doesn't warn users or require all questions to be answered.

**Expected Behavior**: Either:
1. Disable submit until all answered, OR
2. Show warning: "You have X unanswered questions. Submit anyway?"

**Fix Option 1** (Strict):
```typescript
const allAnswered = selectedAnswers.every(answer => answer !== null);

// In render:
<button
  onClick={handleNext}
  disabled={!canProceed || (isLastQuestion && !allAnswered)}
>
  {isLastQuestion ? 'Submit Quiz' : 'Next'}
</button>
```

**Fix Option 2** (With Warning):
```typescript
const handleSubmit = () => {
  const unansweredCount = selectedAnswers.filter(a => a === null).length;

  if (unansweredCount > 0) {
    const confirmed = window.confirm(
      `You have ${unansweredCount} unanswered question(s). Submit anyway?`
    );
    if (!confirmed) return;
  }

  setSubmitted(true);
  setShowResults(true);
  // ... rest
};
```

**Impact**: Poor user experience, accidental submissions

---

## 🟡 Medium Priority Issues

### 3. Duplicate Score Calculation Logic
**File**: `apps/web/app/components/Quiz.tsx`
**Lines**: 68-72, 86-91, 96-98

**Issue**: Score calculation is duplicated 3 times:
```typescript
// In handleSubmit (lines 68-72)
const correctCount = selectedAnswers.filter(...).length;
const score = Math.round((correctCount / quiz.questions.length) * 100);

// In calculateScore function (lines 86-91)
const correctCount = selectedAnswers.filter(...).length;
return Math.round((correctCount / quiz.questions.length) * 100);

// In results render (lines 96-98)
const correctCount = selectedAnswers.filter(...).length;
```

**Problem**: DRY violation, maintenance burden, potential for inconsistency

**Fix**: Use the existing `calculateScore` function everywhere:
```typescript
const handleSubmit = () => {
  setSubmitted(true);
  setShowResults(true);

  const score = calculateScore();
  const passed = score >= quiz.passingScore;

  if (onComplete) {
    onComplete(score, passed);
  }
};

// In results render:
const score = calculateScore();
const passed = score >= quiz.passingScore;
const correctCount = selectedAnswers.filter(
  (answer, index) => answer === quiz.questions[index].correctAnswer
).length;
```

**Impact**: Code maintainability

---

### 4. Missing Keyboard Navigation
**File**: `apps/web/app/components/Quiz.tsx`

**Issue**: No keyboard shortcuts for quiz navigation:
- Arrow keys don't navigate questions
- Number keys don't jump to questions
- Enter doesn't submit/advance
- Escape doesn't close quiz

**Accessibility Impact**: Power users and keyboard-only users have degraded experience

**Fix**: Add keyboard event handlers:
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowRight' && canProceed) {
      handleNext();
    } else if (e.key === 'ArrowLeft' && currentQuestionIndex > 0) {
      handlePrevious();
    } else if (e.key === 'Enter' && canProceed) {
      handleNext();
    } else if (e.key >= '1' && e.key <= '9') {
      const index = parseInt(e.key) - 1;
      if (index < quiz.questions.length) {
        setCurrentQuestionIndex(index);
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [currentQuestionIndex, canProceed, quiz.questions.length]);
```

**Impact**: Accessibility, user experience

---

### 5. No Focus Management for Modal
**File**: `apps/web/app/components/Quiz.tsx`, `LessonViewer.tsx`, `CoursesModal.tsx`

**Issue**: When modals open:
- Focus is not trapped inside modal
- Focus doesn't move to first interactive element
- Tab key can escape to background content
- Screen readers aren't notified of modal

**WCAG Violation**: WCAG 2.1 Level A - 2.4.3 Focus Order

**Fix**: Add focus trap and ARIA attributes:
```typescript
import { useEffect, useRef } from 'react';

export function Quiz({ quiz, onClose, onComplete }: QuizProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Focus first interactive element
    closeButtonRef.current?.focus();

    // Save previously focused element
    const previouslyFocused = document.activeElement as HTMLElement;

    return () => {
      // Restore focus on unmount
      previouslyFocused?.focus();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-title"
    >
      <div ref={modalRef} className="bg-[var(--color-bg-primary)] ...">
        <div className="flex items-center justify-between p-4 border-b ...">
          <h2 id="quiz-title" className="text-xl font-bold ...">
            {quiz.title}
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-2 rounded-lg ..."
            aria-label="Close quiz"
          >
            <CloseIcon />
          </button>
        </div>
        {/* ... */}
      </div>
    </div>
  );
}
```

**Impact**: Accessibility compliance, screen reader support

---

### 6. Unused Router Import
**File**: `apps/web/app/components/CourseCatalog.tsx`
**Line**: 5, 18-20

**Issue**: Imports `useRouter` from Next.js but the router path is never used:
```typescript
import { useRouter } from 'next/navigation';  // Line 5

const router = useRouter();  // Line 13

const handleCourseClick = (courseId: string) => {
  if (onCourseSelect) {
    onCourseSelect(courseId);  // Always called in current implementation
  } else {
    router.push(`/courses/${courseId}`);  // Dead code - never reached
  }
};
```

**Problem**: `onCourseSelect` is always provided by parent (`CoursesContainer`), so the else branch is unreachable.

**Fix**: Remove dead code:
```typescript
// Remove: import { useRouter } from 'next/navigation';

export function CourseCatalog({ onCourseSelect }: CourseCatalogProps) {
  const { courses, loading } = useCoCCourses();
  // Remove: const router = useRouter();

  const handleCourseClick = (courseId: string) => {
    onCourseSelect?.(courseId);  // Optional chaining for safety
  };

  // Or if onCourseSelect is required, update the interface:
  // interface CourseCatalogProps {
  //   onCourseSelect: (courseId: string) => void;  // Required, not optional
  // }
```

**Impact**: Bundle size (minimal), code clarity

---

### 7. Missing Error State in CourseCatalog
**File**: `apps/web/app/components/CourseCatalog.tsx`

**Issue**: Only handles `loading` state, not error state:
```typescript
const { courses, loading } = useCoCCourses();
// What if there's an error?
```

**Problem**: If `useCoCCourses` hook throws an error or returns error state, there's no UI feedback.

**Fix**: Add error handling:
```typescript
const { courses, loading, error } = useCoCCourses();

if (loading) {
  return <LoadingState />;
}

if (error) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <p className="text-red-500 mb-4">Failed to load courses</p>
      <p className="text-sm text-[var(--color-text-secondary)]">{error.message}</p>
      <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg">
        Retry
      </button>
    </div>
  );
}
```

**Impact**: Error handling, user experience

---

### 8. Quiz Score Saved on Every Attempt, Not Best Score
**File**: `apps/web/app/components/CoursesContainer.tsx`
**Lines**: 84-106

**Issue**: Quiz score is replaced on each attempt:
```typescript
const handleQuizComplete = (lessonId: string, score: number, passed: boolean) => {
  // ...
  setCourseProgress({
    ...courseProgress,
    [selectedCourseId]: {
      ...progress,
      quizScores: {
        ...progress.quizScores,
        [lessonId]: {
          score,  // Overwrites previous score
          passed,
          attempts,
          lastAttempt: new Date().toISOString(),
        },
      },
    },
  });
};
```

**Problem**: If user scores 100% on first attempt, then 50% on retry, their displayed score is 50%. Most quiz systems show the **best** score or **latest passing** score.

**Design Question**: Should we track:
- Best score ever?
- Latest passing score?
- All attempt history?

**Suggested Fix** (Best Score):
```typescript
const handleQuizComplete = (lessonId: string, score: number, passed: boolean) => {
  // ...
  const existingQuizData = progress.quizScores[lessonId];
  const attempts = existingQuizData ? existingQuizData.attempts + 1 : 1;

  // Keep best score
  const bestScore = existingQuizData
    ? Math.max(existingQuizData.score, score)
    : score;
  const everPassed = existingQuizData?.passed || passed;

  setCourseProgress({
    ...courseProgress,
    [selectedCourseId]: {
      ...progress,
      quizScores: {
        ...progress.quizScores,
        [lessonId]: {
          score: bestScore,  // Track best
          currentScore: score,  // Track latest
          passed: everPassed,
          attempts,
          lastAttempt: new Date().toISOString(),
        },
      },
    },
  });
};
```

**Impact**: User experience, quiz strategy

---

### 9. No Loading State When Quiz Data is Missing
**File**: `apps/web/app/components/LessonViewer.tsx`
**Lines**: 44-46

**Issue**: If quiz data isn't loaded yet:
```typescript
const quiz = COC_QUIZZES.find(q => q.lessonId === lesson.id);
// quiz could be undefined
```

Then later:
```typescript
{/* Quiz Section */}
{quiz && (
  // Renders quiz section
)}
```

**Problem**: Quiz section disappears entirely if quiz not found. Could be:
- Quiz hasn't loaded yet
- Quiz doesn't exist for this lesson
- Data import failed

**Fix**: Add better messaging:
```typescript
const quiz = COC_QUIZZES.find(q => q.lessonId === lesson.id);
const hasQuiz = Boolean(quiz);

// In render:
{hasQuiz ? (
  quiz && (
    <div className="bg-gradient-to-r from-purple-500/10 ...">
      {/* Quiz UI */}
    </div>
  )
) : (
  <div className="bg-gray-500/10 border border-gray-500/20 rounded-lg p-6 mb-6 text-center">
    <p className="text-[var(--color-text-secondary)]">
      📝 No quiz available for this lesson yet
    </p>
  </div>
)}
```

**Impact**: User experience, clarity

---

## 🟢 Low Priority / Minor Issues

### 10. Inline Styles Instead of CSS Classes
**File**: `apps/web/app/components/Quiz.tsx`
**Lines**: 123, 126

**Issue**: Using inline styles for colors:
```typescript
<div style={{ color: passed ? '#10b981' : '#ef4444' }}>
```

**Problem**: Harder to maintain, theme-inconsistent, can't use CSS custom properties

**Fix**: Use CSS classes or custom properties:
```typescript
<div className={passed ? 'text-green-500' : 'text-red-500'}>
  {score}%
</div>
```

**Impact**: Maintainability, theming

---

### 11. Magic Numbers for Colors
**File**: `apps/web/app/components/Quiz.tsx`

**Issue**: Hardcoded color values `#10b981`, `#ef4444` don't match theme system

**Fix**: Use theme tokens or Tailwind classes consistently

---

### 12. Missing PropTypes or TypeScript Strict Mode
**File**: All component files

**Issue**: No runtime prop validation, relying solely on TypeScript

**Recommendation**: Consider adding runtime validation for production:
```typescript
import PropTypes from 'prop-types';

Quiz.propTypes = {
  quiz: PropTypes.shape({
    questions: PropTypes.arrayOf(PropTypes.object).isRequired,
    // ...
  }).isRequired,
};
```

**Impact**: Runtime safety

---

### 13. No Rate Limiting on Quiz Retries
**File**: `apps/web/app/components/Quiz.tsx`

**Issue**: Users can retry quizzes unlimited times with no cooldown

**Consideration**: Should there be:
- Maximum attempts per day?
- Cooldown period between attempts?
- Penalty for excessive retries?

**Note**: This may be intentional for educational use

---

### 14. Quiz Data Not Lazy Loaded
**File**: `apps/web/app/data/cocQuizzes.ts`

**Issue**: All quiz data (600+ lines, 36 questions) is loaded immediately:
```typescript
export const COC_QUIZZES: QuizData[] = [ /* all quizzes */ ];
```

**Optimization**: Consider lazy loading:
```typescript
// cocQuizzes/index.ts
export const getQuizByLessonId = async (lessonId: string) => {
  const quiz = await import(`./quizzes/${lessonId}.ts`);
  return quiz.default;
};
```

**Impact**: Initial bundle size, performance

**Note**: With only 6 quizzes, this is low priority

---

### 15. No Analytics Tracking
**File**: All quiz and course components

**Issue**: No event tracking for:
- Quiz started
- Quiz completed
- Score achieved
- Lesson viewed
- Course progress

**Recommendation**: Add analytics:
```typescript
const handleSubmit = () => {
  // ... existing code

  // Track quiz completion
  analytics.track('Quiz Completed', {
    quizId: quiz.id,
    lessonId: quiz.lessonId,
    score,
    passed,
    attempts: attempts + 1,
  });
};
```

**Impact**: Product insights, user behavior analysis

---

## Additional Observations

### Positive Aspects ✅

1. **Well-structured components** - Good separation of concerns
2. **TypeScript types** - Comprehensive interfaces
3. **Accessibility basics** - ARIA labels on buttons
4. **Responsive design** - Mobile-friendly layouts
5. **State management** - Clean useState usage
6. **Code organization** - Logical file structure
7. **Consistent styling** - Uses theme variables
8. **Documentation** - Good comments and JSDoc

### Code Smells

1. **Large component files** - Quiz.tsx is 328 lines (consider splitting)
2. **Deep nesting** - Some JSX is 6-7 levels deep
3. **Long functions** - Some functions exceed 20 lines
4. **Prop drilling** - Multiple props passed through layers

### Performance Considerations

1. **No memoization** - Consider `useMemo` for expensive calculations
2. **Re-renders** - Quiz re-renders on every answer selection
3. **Large state objects** - Course progress could grow large

---

## Recommended Fix Priority

### Phase 1 (Before Testing)
1. 🔴 Fix null pointer in results (Issue #1)
2. 🔴 Add quiz validation (Issue #2)
3. 🟡 Remove duplicate score calculation (Issue #3)

### Phase 2 (Before Production)
4. 🟡 Add keyboard navigation (Issue #4)
5. 🟡 Implement focus management (Issue #5)
6. 🟡 Handle quiz scoring strategy (Issue #8)
7. 🟡 Add error handling (Issue #7)

### Phase 3 (Post-Launch)
8. 🟢 Fix inline styles (Issue #10-11)
9. 🟢 Add analytics (Issue #15)
10. 🟢 Consider lazy loading (Issue #14)

---

## Testing Recommendations

### Unit Tests Needed
- `calculateScore()` with all answered
- `calculateScore()` with some null answers
- `calculateScore()` with all wrong
- `handleSubmit()` with incomplete quiz
- `handleRetry()` state reset

### Integration Tests Needed
- Complete quiz end-to-end
- Navigate all questions
- Submit and view results
- Retry quiz
- Close and reopen quiz

### Accessibility Tests Needed
- Screen reader navigation
- Keyboard-only navigation
- Focus trap in modal
- Color contrast ratios
- ARIA label coverage

---

## Conclusion

The course and quiz system is **well-implemented overall** with good structure and TypeScript typing. The critical bugs (#1, #2) should be fixed before testing, and the medium-priority issues should be addressed before production deployment.

**Estimated Fix Time**:
- Critical issues: 1-2 hours
- Medium issues: 4-6 hours
- Low priority: 2-4 hours
- **Total**: ~8-12 hours to address all findings

**Recommendation**: Fix critical issues immediately, medium issues before production, and low priority issues as ongoing improvements.
