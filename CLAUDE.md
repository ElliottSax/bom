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
6. **HomeScreen** - Dynamic stats, last read position, featured verse
7. **Theme Integration** - All components now use theme colors
8. **Highlights System** - useHighlights hook with persistent storage
9. **Notes System** - useNotes hook + NoteEditor modal + NotesScreen
10. **Full Study Tools** - Complete bookmark, highlight, and note integration

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
- Dark/Light/System theme
- Featured verse display

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
│   └── useBookInfo.ts          # Book/chapter info
├── components/
│   ├── VerseActionMenu.tsx     # Long-press menu
│   ├── ChapterNavigation.tsx   # Prev/Next nav
│   └── NoteEditor.tsx          # Note editor modal
└── screens/
    ├── BookmarksScreen.tsx     # Bookmark list
    └── NotesScreen.tsx         # Notes list
```

## TODO

- [ ] Complete offline download feature
- [ ] Add cross-reference lookups
- [ ] Implement study plans
- [ ] Add reading progress tracking
