# BOM Study Tools - Development Guide

## Quick Start

### Start the API Server
```bash
# Make sure PostgreSQL is running
docker start bom-postgres-dev

# Start the API server
cd services/api
python3 server-full.py
```

### Run Tests
```bash
# Comprehensive test suite
./test-api-comprehensive.sh
./test-database-integrity.sh
./test-performance.sh
./test-mobile-integration.sh
```

## Project Structure

```
bom/
├── apps/
│   ├── mobile/          # React Native/Expo mobile app
│   │   └── src/
│   │       ├── screens/     # Screen components
│   │       ├── components/  # Reusable components
│   │       ├── hooks/       # Custom React hooks
│   │       └── config/      # Apollo client config
│   └── web/             # Web app (future)
├── services/
│   └── api/             # Python GraphQL API server
└── scripts/             # Utility scripts
```

## API Endpoints

- **GraphQL**: `POST http://localhost:4000/graphql`
- **Health Check**: `GET http://localhost:4000/health`

### Key GraphQL Queries
- `editions` - List all scripture editions
- `verses(editionId, book, chapter, verseStart, verseEnd, limit)` - Get verses
- `books(editionId)` - Get books with statistics
- `searchVerses(query, editionId, limit)` - Search verses
- `statistics` - Get database statistics

## Database Info

- **PostgreSQL**: Port 5435, DB: `bom_study_tools_dev`
- **Total Verses**: 11,787
- **Editions**: CoC BoM 1908 (8,701), CoC D&C 2017 (3,084)

## Recent Improvements (Dec 2025)

### API Improvements
1. **SearchScreen** - Full implementation with filtering, highlighting, and suggestions
2. **Verse Range Support** - API now supports `verseStart` and `verseEnd` parameters
3. **Enhanced Search** - Relevance-ranked results with multi-word matching
4. **Test Fixes** - Corrected Alma chapter references, improved ID format validation

### Mobile App Improvements
1. **SettingsContext** - Persistent reading preferences (font size, line height, verse numbers)
2. **SettingsScreen** - Fully functional with sliders, toggles, and live preview
3. **Bookmarks System** - useBookmarks hook + BookmarksScreen with sorting
4. **Verse Action Menu** - Long-press menu for bookmark, highlight, copy, share
5. **Chapter Navigation** - Previous/Next with cross-book support
6. **HomeScreen** - Dynamic stats, last read position, daily verse with rotation
7. **Theme Integration** - All components now use theme colors
8. **Highlights System** - useHighlights hook with persistent storage
9. **Notes System** - useNotes hook + NoteEditor modal + NotesScreen
10. **Full Study Tools** - Complete bookmark, highlight, and note integration
11. **Reading Progress** - Track chapters read, streaks, and completion percentage
12. **Daily Verse** - Rotating inspirational verse (31 curated verses)
13. **Study Plans** - Multiple reading plans (30-day to 1-year) with progress tracking
14. **Cross-References** - Biblical cross-references for related verses
15. **Enhanced Scripture Reader** - Shows highlight colors, bookmark/note indicators, and reading time estimates
16. **Share Study Plans** - Share progress and invite friends to join reading plans
17. **Recent Searches** - Search history with quick access and clear option
18. **Jump to Verse** - Quick verse navigation modal with grid selection
19. **Data Backup/Restore** - Export/import all user data as JSON file
20. **Reading Reminders** - Push notifications for daily study reminders
21. **Cloud Sync** - Sync data across devices (bookmarks, notes, progress)
22. **Word Study/Concordance** - Find all occurrences of a word across scriptures

## Mobile App Features

- Scripture reader with offline caching
- Full-text search with highlighting
- Book/chapter navigation with prev/next
- Last read position tracking
- Verse action menu (long-press)
- Bookmarks with sorting
- Verse highlighting (5 colors)
- Note-taking with editor modal
- Persistent reading settings
- Dark/Light/System theme (full app support)
- Daily verse with rotation
- Reading progress tracking
- Reading streaks with fire emoji display
- Study plans (5 options)
- Mark chapters as complete
- Cross-references to Bible
- Reading time estimates
- Visual indicators for annotations
- Share progress with friends
- Bulk offline downloads with pause/resume
- Offline status indicators on book/chapter lists
- Study Tools quick access grid on HomeScreen
- Jump to verse with grid selection modal
- Recent searches history
- Data backup and restore (JSON export/import)
- Reading reminder notifications (configurable schedule)
- Cloud sync across devices
- Word study / concordance

## New Files Created

```
apps/mobile/src/
├── contexts/
│   └── SettingsContext.tsx     # Reading preferences
├── hooks/
│   ├── useSearch.ts            # Search hook
│   ├── useStats.ts             # Statistics hook
│   ├── useBookmarks.ts         # Bookmarks hook
│   ├── useHighlights.ts        # Highlights hook
│   ├── useNotes.ts             # Notes hook
│   ├── useBookInfo.ts          # Book/chapter info
│   ├── useReadingProgress.ts   # Reading progress tracking
│   ├── useDailyVerse.ts        # Daily verse rotation
│   ├── useStudyPlan.ts         # Study plan management
│   ├── useCrossReferences.ts   # Cross-reference lookups
│   ├── useOfflineDownload.ts   # Bulk download management
│   ├── useDataBackup.ts        # Export/import user data
│   ├── useReadingReminders.ts  # Push notification reminders
│   ├── useCloudSync.ts         # Cloud sync management
│   └── useWordStudy.ts         # Word concordance/frequency
├── components/
│   ├── VerseActionMenu.tsx     # Long-press menu
│   ├── ChapterNavigation.tsx   # Prev/Next nav
│   └── NoteEditor.tsx          # Note editor modal
└── screens/
    ├── BookmarksScreen.tsx     # Bookmark list
    ├── NotesScreen.tsx         # Notes list
    ├── ProgressScreen.tsx      # Reading progress stats
    ├── StudyPlanScreen.tsx     # Study plan management
    ├── OfflineDownloadScreen.tsx # Offline download manager
    ├── BackupRestoreScreen.tsx # Data backup/restore
    ├── RemindersScreen.tsx     # Reading reminder settings
    ├── CloudSyncScreen.tsx     # Cloud sync settings
    └── WordStudyScreen.tsx     # Concordance/word search
```

## TODO

- [x] Complete offline download feature
- [x] Add cross-reference lookups
- [x] Implement study plans
- [x] Add reading progress tracking
