# Course System Testing Guide

## Overview
This guide outlines how to test the newly implemented Community of Christ course system with quizzes.

## Prerequisites
Before testing, ensure you have:
- Node.js and npm installed
- All dependencies installed (`npm install` in apps/web)
- react-markdown package installed

## Starting the Development Server

```bash
cd apps/web
npm run dev
```

The app should start at `http://localhost:3000`

## Testing Checklist

### 1. Course Access
- [ ] Click the "Courses" button (graduation cap icon) in the header
- [ ] Verify the Courses modal opens
- [ ] Confirm the course catalog displays with the "Introduction to Community of Christ" course card
- [ ] Check that course metadata is visible (6 lessons, 140 minutes, beginner level)

### 2. Course Catalog Features
- [ ] Verify course card shows:
  - Course icon (📖)
  - Title: "Introduction to Community of Christ"
  - Subtitle: "A Comprehensive Overview of CoC History, Theology, and Practice"
  - Level badge (Beginner)
  - Lesson count (6 lessons)
  - Duration (140 minutes)
  - Learning outcomes (preview of 3)
- [ ] Click the course card to navigate to course detail

### 3. Course Detail Page
- [ ] Verify course header displays correctly
- [ ] Check that all 6 lessons are listed:
  1. Origins and History: The 1844 Succession Crisis
  2. The Eight Sacraments of Community of Christ
  3. The Nine Enduring Principles
  4. Section 156: Women's Ordination and the 1984 Schism
  5. Temple Theology: Kirtland and Independence
  6. The Book of Mormon in Community of Christ
- [ ] Confirm lesson cards show:
  - Lesson number (or checkmark if completed)
  - Lesson title
  - Description
  - Duration
  - Type (reading, video, reflection)
- [ ] Verify "What You'll Learn" section lists all 8 learning outcomes
- [ ] Check progress bar is initially at 0%

### 4. Lesson Viewer
- [ ] Click on Lesson 1 to open the lesson viewer
- [ ] Verify lesson content loads with:
  - Course title in header
  - Lesson title
  - Duration badge
  - Close button
  - Description text
- [ ] Check "Learning Objectives" section:
  - [ ] Section is expanded by default
  - [ ] Click to collapse/expand
  - [ ] All objectives are listed
- [ ] Scroll through markdown content:
  - [ ] Headings render correctly (h1, h2, h3)
  - [ ] Paragraphs are formatted properly
  - [ ] Lists (bulleted and numbered) display correctly
  - [ ] Blockquotes have blue left border and styling
  - [ ] Bold text is emphasized
- [ ] Check "Key Terms" section:
  - [ ] Section is collapsed by default
  - [ ] Click to expand
  - [ ] Terms and definitions display in grid
- [ ] Check "Discussion Questions" section:
  - [ ] Section is collapsed by default
  - [ ] Click to expand
  - [ ] Questions are numbered
- [ ] Verify "Application Challenge" displays with blue left border
- [ ] Check "Additional Resources" section (if present):
  - [ ] Links are clickable
  - [ ] External link icon appears
  - [ ] Links open in new tab

### 5. Quiz System
- [ ] In the lesson viewer, locate the "Test Your Knowledge" section
- [ ] Verify quiz card displays:
  - Purple gradient background
  - Quiz icon
  - Quiz title and description
  - Question count (6 questions)
  - Passing score (70%)
  - "Take Quiz" button
- [ ] Click "Take Quiz" to open quiz modal

#### Quiz Taking Flow
- [ ] Quiz modal opens with:
  - Quiz title in header
  - Question counter (Question 1 of 6)
  - Progress bar
  - Close button
- [ ] Question display:
  - [ ] Question text is clear and readable
  - [ ] 4 multiple choice options are shown
  - [ ] Options have radio button style
  - [ ] Hover state works on options
- [ ] Select an answer:
  - [ ] Option highlights in blue when selected
  - [ ] Checkmark appears in radio button
  - [ ] Can change selection before proceeding
- [ ] Question indicators at bottom:
  - [ ] Shows all 6 question numbers
  - [ ] Current question is highlighted in blue
  - [ ] Answered questions show green border
  - [ ] Unanswered questions show gray
  - [ ] Can click to jump to any question
- [ ] Navigation:
  - [ ] "Previous" button disabled on first question
  - [ ] "Next" button enabled after selecting answer
  - [ ] "Next" button disabled if no answer selected
  - [ ] Navigate through all 6 questions
  - [ ] Last question shows "Submit Quiz" instead of "Next"

#### Quiz Submission and Results
- [ ] Click "Submit Quiz" after answering all questions
- [ ] Results screen displays:
  - [ ] Large percentage score
  - [ ] Pass/Fail status (green ✓ or red ✗)
  - [ ] Score out of total (e.g., "4 of 6 correct")
  - [ ] Passing threshold message if failed
- [ ] Review answers section:
  - [ ] All 6 questions listed
  - [ ] Each question shows:
    - [ ] Correct/incorrect indicator (✓ or ✗)
    - [ ] Question text
    - [ ] User's answer (highlighted in green if correct, red if wrong)
    - [ ] Correct answer (if user was wrong)
    - [ ] Explanation text
  - [ ] Color-coded borders (green for correct, red for incorrect)
- [ ] Footer buttons:
  - [ ] "Try Again" button resets and reopens quiz
  - [ ] "Close" button exits to lesson viewer

### 6. Progress Tracking
- [ ] After completing a quiz, close the quiz modal
- [ ] Verify quiz score badge appears in lesson viewer:
  - [ ] "Quiz: XX%" badge shown
  - [ ] Green background if passed (≥70%)
  - [ ] Orange background if failed (<70%)
- [ ] Click "Mark Complete" to mark lesson as completed
- [ ] Return to course detail page (use back button)
- [ ] Verify progress updates:
  - [ ] Completed lesson shows green checkmark
  - [ ] Progress bar increases
  - [ ] Completion percentage updates
  - [ ] Quiz score displays in lesson card
- [ ] Complete all 6 lessons and verify:
  - [ ] Progress bar reaches 100%
  - [ ] Course marked as complete

### 7. Quiz Retaking
- [ ] Return to a completed lesson with quiz
- [ ] Verify "Take Quiz" button changes to "Retake Quiz"
- [ ] Click "Retake Quiz"
- [ ] Complete quiz again with different answers
- [ ] Verify score updates after retaking
- [ ] Check that attempt count increments (stored in localStorage)

### 8. Local Storage Persistence
- [ ] Complete some lessons and quizzes
- [ ] Refresh the page
- [ ] Reopen courses modal and navigate to course
- [ ] Verify:
  - [ ] Lesson completion status persists
  - [ ] Quiz scores persist
  - [ ] Progress percentage is maintained
- [ ] Open browser DevTools → Application → Local Storage
- [ ] Find `coc-course-progress` key
- [ ] Verify data structure:
```json
{
  "intro-coc": {
    "started": "ISO date",
    "lessonsCompleted": ["intro-coc-1", "intro-coc-2"],
    "completed": false,
    "completedDate": null,
    "quizScores": {
      "intro-coc-1": {
        "score": 83,
        "passed": true,
        "attempts": 2,
        "lastAttempt": "ISO date"
      }
    }
  }
}
```

### 9. Navigation Flow
- [ ] Test lesson navigation:
  - [ ] "Previous" button navigates to previous lesson
  - [ ] "Next" button navigates to next lesson
  - [ ] Buttons disabled at boundaries (first/last lesson)
- [ ] Test modal closing:
  - [ ] X button closes lesson viewer
  - [ ] Returns to course detail
  - [ ] State is preserved when reopening
- [ ] Test course navigation:
  - [ ] "Back to Courses" returns to catalog
  - [ ] Can reopen course and resume where left off

### 10. Responsive Design
- [ ] Resize browser window to mobile width
- [ ] Verify:
  - [ ] Modal sizes appropriately
  - [ ] Text remains readable
  - [ ] Buttons are tappable
  - [ ] Quiz questions display properly
  - [ ] Progress indicators adapt to small screens

### 11. Theme Support
- [ ] Toggle theme (light/dark) using header button
- [ ] Verify all course components adapt:
  - [ ] Background colors change
  - [ ] Text remains readable
  - [ ] Borders and accents update
  - [ ] Quiz results maintain visibility

### 12. Error Handling
- [ ] Test with empty progress (clear localStorage)
- [ ] Verify course starts fresh
- [ ] Test quiz with no answers selected
- [ ] Verify "Next" and "Submit" are disabled

## Quiz Content Verification

### Lesson 1: Origins and History
- Questions about 1844, Emma Smith, Reorganization
- 6 questions, 70% passing

### Lesson 2: Eight Sacraments
- Questions about sacramental theology
- 6 questions, 70% passing

### Lesson 3: Enduring Principles
- Questions about all 9 principles
- 6 questions, 70% passing

### Lesson 4: Section 156
- Questions about women's ordination, schism
- 6 questions, 70% passing

### Lesson 5: Temple Theology
- Questions about Kirtland and Independence temples
- 6 questions, 70% passing

### Lesson 6: Book of Mormon
- Questions about historicity and hermeneutical approaches
- 6 questions, 70% passing

## Known Issues / Future Enhancements

### Current Limitations
- No certificate generation upon course completion
- No course analytics or detailed progress reports
- No ability to export quiz results
- No social sharing of course completion
- No course discussions or comments

### Planned Features
- Course completion certificates
- Multiple courses support
- Advanced progress analytics
- Quiz difficulty levels
- Timed quizzes option
- Quiz explanations with scripture references

## Troubleshooting

### Quiz doesn't open
- Check browser console for errors
- Verify cocQuizzes.ts is properly imported
- Check that quiz ID matches lesson ID

### Scores not saving
- Check localStorage is enabled
- Verify no browser extensions blocking storage
- Clear localStorage and retry

### Markdown not rendering
- Ensure react-markdown is installed
- Check for console errors
- Verify lesson content is valid markdown

### Performance Issues
- Ensure Next.js dev server is running properly
- Check for console warnings
- Try production build for better performance

## Success Criteria

All tests pass if:
1. ✅ Course catalog displays correctly
2. ✅ All 6 lessons are accessible and readable
3. ✅ All 6 quizzes function properly
4. ✅ Progress tracking works and persists
5. ✅ Quiz retaking functions correctly
6. ✅ Navigation flows smoothly
7. ✅ Theme switching works
8. ✅ Mobile responsive design works
9. ✅ No console errors during normal usage
10. ✅ Data persists across page refreshes

## Reporting Issues

If you encounter issues during testing:
1. Note the specific test case that failed
2. Check browser console for errors
3. Record browser and version
4. Note any localStorage data
5. Document steps to reproduce
6. Take screenshots if applicable

## Next Steps After Testing

Once testing is complete:
1. Document any bugs found
2. Prioritize fixes needed
3. Consider user feedback
4. Plan additional features
5. Prepare for production deployment
