# Migration Checklist - BOM Study Tools Refactoring

## 🎯 Goal

Migrate from the monolithic `page.tsx` to the fully refactored architecture.

## 📋 Pre-Migration Checklist

### 1. Backup Current Code

- [ ] Create backup: `cp app/page.tsx app/page-backup-$(date +%Y%m%d).tsx`
- [ ] Commit current work to git
- [ ] Create a new branch: `git checkout -b refactor-main-component`

### 2. Verify Dependencies

- [ ] Check `package.json` includes all required dependencies:
  ```json
  {
    "@tanstack/react-query": "^5.x",
    "react": "^18.x",
    "next": "^14.x"
  }
  ```
- [ ] Run `npm install` or `yarn install`

### 3. Review New Files

- [ ] Review all new hook files in `app/hooks/`
- [ ] Review all new component files in `app/components/`
- [ ] Review all new modal files in `app/components/modals/`
- [ ] Review utility files in `app/utils/`

## 🔄 Migration Steps

### Phase 1: Verify New Components (15 min)

#### Step 1.1: Test Hooks

```bash
# Create a simple test file to verify hooks work
cat > app/test-hooks.tsx << 'EOF'
import { useSettings } from './hooks/useSettings';

export default function TestHooks() {
  const { volumeId, theme, fontSize } = useSettings();
  return <div>{volumeId} - {theme} - {fontSize}</div>;
}
EOF
```

- [ ] Import `useSettings` - check for errors
- [ ] Import `useUserData` - check for errors
- [ ] Import `useReadingProgress` - check for errors
- [ ] Import `useVerseOperations` - check for errors

#### Step 1.2: Test Components

- [ ] Try importing `VolumeHomeScreen`
- [ ] Try importing `BookChapterSelector`
- [ ] Try importing `ChapterReader`
- [ ] Try importing modal components

### Phase 2: Integration (30 min)

#### Step 2.1: Copy Refactored File

```bash
# Option A: Complete replacement
cp app/page-fully-refactored.tsx app/page.tsx

# Option B: Side-by-side comparison
# Keep both files and test the refactored one first
```

- [ ] File copied successfully
- [ ] No TypeScript errors in IDE
- [ ] No import errors

#### Step 2.2: Verify Imports

Check that all imports resolve correctly:

- [ ] Hooks from `./hooks/*`
- [ ] Components from `./components/*`
- [ ] Modals from `./components/modals/*`
- [ ] Utils from `./utils/*`
- [ ] Types from `./lib/types`
- [ ] Scripture data from `./lib/scriptures`

### Phase 3: Testing (45 min)

#### Step 3.1: Basic Functionality

- [ ] App loads without errors
- [ ] Header displays correctly
- [ ] Sidebar displays correctly
- [ ] Volume tabs work
- [ ] Theme switching works

#### Step 3.2: Navigation Flow

- [ ] Can select a volume
- [ ] Can select a book
- [ ] Can select a chapter
- [ ] Can read verses
- [ ] Navigation controls work (prev/next)

#### Step 3.3: User Interactions

- [ ] Can click on a verse
- [ ] Can bookmark a verse
- [ ] Can highlight a verse (all colors)
- [ ] Can add a note to a verse
- [ ] Can mark chapter as read

#### Step 3.4: Search Functionality

- [ ] Search modal opens
- [ ] Can type search query
- [ ] Search results display
- [ ] Can click on search result
- [ ] Navigates to correct verse

#### Step 3.5: Settings

- [ ] Settings modal opens
- [ ] Can change font size
- [ ] Can change line height
- [ ] Can change font family
- [ ] Can toggle verse numbers
- [ ] Settings persist on reload

#### Step 3.6: Study Plans

- [ ] Study plan modal opens
- [ ] Can select a study plan
- [ ] Study plan progress displays
- [ ] Can complete a day
- [ ] Can end study plan

#### Step 3.7: Data Management

- [ ] Backup modal opens
- [ ] Can export data
- [ ] Export file downloads
- [ ] Can import data
- [ ] Imported data loads correctly

#### Step 3.8: Resources

- [ ] Resources modal opens
- [ ] External links work
- [ ] Modal closes correctly

### Phase 4: Data Persistence (15 min)

#### Step 4.1: LocalStorage

- [ ] Bookmarks persist after reload
- [ ] Highlights persist after reload
- [ ] Notes persist after reload
- [ ] Settings persist after reload
- [ ] Reading progress persists after reload
- [ ] Study plan persists after reload

#### Step 4.2: Cross-Browser Testing

- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works in Edge

### Phase 5: Performance (15 min)

#### Step 5.1: Load Times

- [ ] Initial page load < 3 seconds
- [ ] Chapter load < 1 second
- [ ] Search results < 2 seconds
- [ ] Modal opens instantly

#### Step 5.2: Interactions

- [ ] No lag when clicking verses
- [ ] Smooth scrolling
- [ ] No jank when toggling theme
- [ ] Fast navigation between chapters

## 🐛 Troubleshooting

### Common Issues

#### Issue: "Cannot find module './hooks/useSettings'"

**Solution:** Ensure all hook files are in the correct location: `app/hooks/`

#### Issue: "Type error in useVerseOperations"

**Solution:** Check that all types are properly imported from `lib/types`

#### Issue: "React Query not working"

**Solution:**

1. Verify `@tanstack/react-query` is installed
2. Ensure QueryClientProvider wraps the app (check `layout.tsx`)

#### Issue: "LocalStorage not persisting"

**Solution:** Check browser's localStorage quota and privacy settings

#### Issue: "Modals not showing"

**Solution:**

1. Verify z-index in CSS
2. Check modal show state is being set to `true`
3. Verify modal files are imported correctly

#### Issue: "Verses not loading"

**Solution:**

1. Check API server is running
2. Verify API routes in `/api/verses` and `/api/search`
3. Check browser console for fetch errors

## ✅ Post-Migration Checklist

### Code Quality

- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] No console warnings
- [ ] All ESLint rules pass
- [ ] Code formatted with Prettier

### Documentation

- [ ] Update README if needed
- [ ] Document any breaking changes
- [ ] Add comments to complex logic

### Git

- [ ] Commit refactored code
- [ ] Write descriptive commit message
- [ ] Push to remote branch
- [ ] Create pull request
- [ ] Request code review

### Testing

- [ ] All manual tests pass
- [ ] No regressions found
- [ ] Performance is same or better
- [ ] All features work as before

## 📊 Success Criteria

The migration is successful when:

✅ All functionality works identically to before
✅ No TypeScript errors
✅ No console errors or warnings
✅ All data persists correctly
✅ Performance is same or better
✅ Code is more maintainable
✅ Components are reusable
✅ Hooks are testable

## 🎉 Completion

Once all checkboxes are checked:

1. **Celebrate!** 🎊 You've successfully refactored a 607-line monolith!
2. **Share with team** - Show them the before/after
3. **Plan next steps** - See REFACTORING_COMPLETE.md for future enhancements
4. **Write tests** - Now that the code is modular, add unit tests
5. **Document patterns** - Help future developers understand the architecture

## 📚 Reference Documents

- `REFACTORING_SUMMARY.md` - Overview of changes
- `REFACTORING_IMPLEMENTATION_GUIDE.md` - Detailed implementation guide
- `REFACTORING_COMPLETE.md` - Final summary and metrics
- `page-fully-refactored.tsx` - The new main component
- `page-backup.tsx` - Your backup (create this first!)

## 🆘 Need Help?

If you encounter issues:

1. Check the troubleshooting section above
2. Review the reference documents
3. Compare with `page-backup.tsx` to see what changed
4. Check browser console for errors
5. Verify all files are in correct locations

## 📝 Notes Section

Use this space to track your migration:

```
Date Started: _______________
Issues Encountered:
-
-
-

Solutions Applied:
-
-
-

Time Taken: _______________
Date Completed: _______________
```

---

**Remember:** Take your time, test thoroughly, and don't hesitate to roll back if needed. You always have your backup!
