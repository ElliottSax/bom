# Quick Start - Testing the Refactored App

## 🚀 Start the Application

### 1. Start the Development Server

```bash
cd /mnt/e/projects/bom/apps/web
npm run dev
```

The app should start on `http://localhost:3000`

### 2. Open in Browser

```
http://localhost:3000
```

## ✅ Testing Checklist

### Basic Functionality (2 min)

- [ ] App loads without errors
- [ ] No console errors (open DevTools)
- [ ] Header displays correctly
- [ ] Sidebar is visible
- [ ] Volume tabs are clickable

### Theme & Settings (2 min)

- [ ] Click theme button (sun/moon icon) - theme should change
- [ ] Click settings icon
- [ ] Adjust font size slider - text should change
- [ ] Adjust line height slider - text spacing should change
- [ ] Toggle font family - text should change style
- [ ] Toggle verse numbers - numbers should show/hide
- [ ] Close settings - settings should persist on reload

### Navigation (5 min)

- [ ] Click "Book of Mormon" tab (should be selected by default)
- [ ] Click on "1 Nephi" in sidebar
- [ ] Chapter grid should appear
- [ ] Click on Chapter 1
- [ ] Verses should load and display
- [ ] Click "Previous" button (should be disabled on chapter 1)
- [ ] Click "Next" button - should go to chapter 2
- [ ] Click back arrow - should go back to chapter grid
- [ ] Click back arrow again - should go to volume home

### Search (3 min)

- [ ] Click search icon (magnifying glass)
- [ ] Type "faith" in search box
- [ ] Search results should appear
- [ ] Click on a search result
- [ ] Should navigate to that verse
- [ ] Searched verse should be highlighted

### Bookmarks & Highlights (5 min)

- [ ] Navigate to any verse
- [ ] Click on a verse to select it
- [ ] Action menu should appear below verse
- [ ] Click "Save" button - bookmark icon should fill
- [ ] Click on a highlight color - verse should be highlighted
- [ ] Click "Note" button
- [ ] Type a note and click "Save"
- [ ] Note should appear below the verse
- [ ] Go to "Bookmarks" tab in sidebar
- [ ] Your bookmark should be listed
- [ ] Click on bookmark - should navigate to verse
- [ ] Go to "Notes" tab in sidebar
- [ ] Your note should be listed
- [ ] Click X on note - note should be deleted

### Reading Progress (3 min)

- [ ] Navigate to any chapter
- [ ] Click "Mark Read" button
- [ ] Button should change to "Done" with checkmark
- [ ] Go to "Progress" tab in sidebar
- [ ] Completion percentage should update
- [ ] Chapter count should increase
- [ ] If it's your first read today, streak should be 1
- [ ] Reload page - progress should persist

### Study Plans (3 min)

- [ ] Click calendar icon in header
- [ ] Study plans list should appear
- [ ] Click on a study plan (e.g., "Book of Mormon in 30 Days")
- [ ] Plan should activate with progress bar
- [ ] Click "Complete Day" button
- [ ] Progress should update
- [ ] Click "End" button
- [ ] Plan should be removed

### Data Backup (3 min)

- [ ] Click download icon in header
- [ ] Backup modal should appear
- [ ] Shows count of bookmarks, highlights, notes
- [ ] Click "Export Backup"
- [ ] JSON file should download
- [ ] Click "Import Backup"
- [ ] Select the downloaded file
- [ ] Data should import successfully
- [ ] Alert should say "Imported!"

### Resources (1 min)

- [ ] Click book icon in header
- [ ] Resources modal should appear
- [ ] Categories and links should be displayed
- [ ] Click an external link - should open in new tab
- [ ] Close modal

### Multiple Volumes (2 min)

- [ ] Click "New Testament" tab
- [ ] Books should change to NT books
- [ ] Select "Matthew"
- [ ] Select Chapter 1
- [ ] Verses should load
- [ ] Click "Doctrine & Covenants" tab
- [ ] Should show sections instead of chapters
- [ ] Select "Section 1"
- [ ] Text should load

### Mobile Responsiveness (2 min)

- [ ] Resize browser window to mobile size
- [ ] Header should adapt
- [ ] Sidebar toggle should work
- [ ] Volume tabs should scroll horizontally
- [ ] Modals should be responsive
- [ ] Text should be readable

## 🐛 Common Issues & Solutions

### Issue: "Hydration error"

**Cause:** Server/client mismatch
**Solution:** Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Issue: "Cannot read property of undefined"

**Cause:** Data not loaded yet
**Solution:** Check that API server is running

### Issue: Verses not loading

**Cause:** API server not running
**Solution:**

```bash
cd /mnt/e/projects/bom/services/api
python3 server-full.py
```

### Issue: Search not working

**Cause:** React Query not configured
**Solution:** Check that QueryClientProvider is in layout.tsx

### Issue: Settings not persisting

**Cause:** LocalStorage issue
**Solution:** Check browser console for storage errors

### Issue: Theme not applying

**Cause:** CSS not loading
**Solution:** Check globals.css is imported in layout.tsx

## ✅ Success Criteria

All tests pass when:

✅ No console errors
✅ All navigation works smoothly
✅ All modals open and close
✅ Data persists after reload
✅ Search returns results
✅ Bookmarks/highlights/notes work
✅ Theme switching works
✅ Settings are saved
✅ Reading progress tracks correctly
✅ Study plans function properly
✅ Backup/restore works

## 📊 Performance Check

Open DevTools Performance tab and check:

- [ ] Initial page load < 3 seconds
- [ ] Chapter load < 1 second
- [ ] Search results < 2 seconds
- [ ] No jank when scrolling
- [ ] Smooth animations

## 🎉 Next Steps After Testing

If all tests pass:

1. ✅ Mark testing task as complete
2. 📝 Document any issues found
3. 🔧 Fix any bugs discovered
4. 🚀 Deploy to production
5. 🎊 Celebrate the successful refactor!

If issues are found:

1. 📋 Create a list of issues
2. 🐛 Prioritize critical bugs
3. 🔧 Fix issues one by one
4. ✅ Re-test after fixes
5. 📝 Update documentation

## 📞 Getting Help

If you encounter issues:

1. Check browser console for errors
2. Review the migration documentation
3. Compare with backup file
4. Check that all files were created
5. Verify imports are correct

## 📁 Important Files

- `page.tsx` - Main refactored file
- `page-backup-20260124-163116.tsx` - Backup
- `layout.tsx` - Fixed QueryClient provider
- `contexts/` - SettingsContext, UserDataContext
- `components/` - All new components
- `hooks/` - useVerses, useSearch

---

**Happy Testing!** 🧪

Remember: The app is now much more maintainable, testable, and scalable than before!
