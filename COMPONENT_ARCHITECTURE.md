# Component Architecture - BOM Study Tools

## 🏗️ Component Hierarchy

```
Home (page.tsx)
│
├── <input type="file" /> (Hidden file input for import)
│
├── Header
│   ├── MenuIcon (toggle sidebar)
│   ├── Logo + Title
│   ├── Streak Badge (FireIcon)
│   ├── Study Plan Button (CalendarIcon)
│   ├── Resources Button (BookOpenIcon)
│   ├── Backup Button (DownloadIcon)
│   ├── Theme Toggle (SunIcon/MoonIcon)
│   ├── Settings Button (SettingsIcon)
│   └── Search Button (SearchIcon)
│
├── VolumeTabs
│   └── [Volume Buttons x4] (BoM, OT, NT, D&C)
│
├── SettingsModal (conditional: show={showSettings})
│   ├── Font Size Slider
│   ├── Line Height Slider
│   ├── Font Family Buttons
│   └── Verse Numbers Toggle
│
├── SearchModal (conditional: show={showSearch})
│   ├── Search Input
│   ├── Loading Spinner
│   └── Results List
│       └── [Result Buttons]
│
├── NoteEditorModal (conditional: show={showNoteEditor})
│   ├── Reference Display
│   ├── Textarea
│   └── Save/Cancel Buttons
│
├── StudyPlanModal (conditional: show={showStudyPlanModal})
│   ├── Active Plan View
│   │   ├── Progress Bar
│   │   └── Complete Day Button
│   └── Plan Selection List
│       └── [Plan Buttons]
│
├── BackupModal (conditional: show={showBackupModal})
│   ├── Data Summary
│   ├── Export Button
│   └── Import Button
│
├── ResourcesModal (conditional: show={showResourcesModal})
│   └── [Resource Categories]
│       └── [Resource Links]
│
└── Main Layout (flex container)
    │
    ├── Sidebar (conditional: sidebarOpen={sidebarOpen})
    │   ├── Tab Navigation
    │   │   ├── Books Tab
    │   │   ├── Bookmarks Tab
    │   │   ├── Notes Tab
    │   │   └── Progress Tab
    │   │
    │   └── Tab Content
    │       ├── Books List (if activeTab === 'books')
    │       │   └── [Book Buttons]
    │       │
    │       ├── Bookmarks List (if activeTab === 'bookmarks')
    │       │   └── [Bookmark Cards]
    │       │
    │       ├── Notes List (if activeTab === 'notes')
    │       │   └── [Note Cards]
    │       │
    │       └── Progress View (if activeTab === 'progress')
    │           ├── Completion Circle
    │           └── Streak Display
    │
    └── Main Content Area
        │
        ├── VolumeHomeScreen (if !selectedBook)
        │   ├── Volume Icon
        │   ├── Volume Info
        │   ├── Stats Grid
        │   │   ├── Completion %
        │   │   ├── Books Count
        │   │   └── Streak (if > 0)
        │   └── Action Buttons
        │       ├── Search Button
        │       └── Start Plan Button
        │
        ├── BookChapterSelector (if selectedBook && !selectedChapter)
        │   ├── Back Button
        │   ├── Book Title
        │   └── Chapter Grid
        │       └── [Chapter Buttons]
        │           └── CheckIcon (if read)
        │
        └── ChapterReader (if selectedBook && selectedChapter)
            ├── Chapter Header (sticky)
            │   ├── Back Button
            │   ├── Chapter Title
            │   ├── Mark Read Button
            │   └── Navigation Widget
            │       ├── Previous Button
            │       ├── Chapter Counter
            │       └── Next Button
            │
            ├── Verses Container
            │   └── [VerseDisplay] (for each verse)
            │       ├── Verse Text (with highlight)
            │       ├── Note Display (if has note)
            │       ├── Bookmark Indicator (if bookmarked)
            │       └── Action Panel (if selected)
            │           ├── Bookmark Button
            │           ├── Note Button
            │           └── Highlight Color Picker
            │               └── [Color Buttons]
            │
            └── Footer Navigation
                ├── Previous Chapter Button
                ├── Mark Read Button / Done Badge
                └── Next Chapter Button
```

## 🎯 State Management Flow

```
┌─────────────────────────────────────────────────┐
│                   Home Component                 │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │          Custom Hooks (State)            │  │
│  ├──────────────────────────────────────────┤  │
│  │  useSettings()                           │  │
│  │  ├─ volumeId, theme, fontSize, ...      │  │
│  │  └─ Auto-persists to localStorage       │  │
│  │                                          │  │
│  │  useUserData()                           │  │
│  │  ├─ bookmarks, highlights, notes        │  │
│  │  └─ Auto-syncs to localStorage          │  │
│  │                                          │  │
│  │  useReadingProgress(volumeId)           │  │
│  │  ├─ chaptersRead, streaks, studyPlan    │  │
│  │  └─ Auto-persists to localStorage       │  │
│  │                                          │  │
│  │  useVerseOperations({ ... })            │  │
│  │  ├─ isBookmarked, toggleBookmark        │  │
│  │  ├─ getHighlight, setHighlightColor     │  │
│  │  └─ getNote, saveNote, deleteNote       │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │         Local UI State (useState)        │  │
│  ├──────────────────────────────────────────┤  │
│  │  selectedBook, selectedChapter           │  │
│  │  sidebarOpen, activeTab                  │  │
│  │  showSettings, showSearch, ...           │  │
│  │  searchQuery, verses, loading            │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │           Event Handlers                  │  │
│  ├──────────────────────────────────────────┤  │
│  │  handleVolumeChange                       │  │
│  │  handleBookSelect                         │  │
│  │  handleChapterSelect                      │  │
│  │  navigateToReference                      │  │
│  │  openNoteEditor                           │  │
│  │  handleExportData                         │  │
│  │  handleImportData                         │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│                       │                          │
│                       ▼                          │
│  ┌──────────────────────────────────────────┐  │
│  │        Props to Components               │  │
│  └──────────────────────────────────────────┘  │
└──────────────────────────┬───────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
     ┌─────────┐     ┌─────────┐     ┌─────────┐
     │ Header  │     │ Sidebar │     │  Main   │
     └─────────┘     └─────────┘     │ Content │
                                     └─────────┘
```

## 📦 Data Flow Patterns

### Pattern 1: Settings Changes

```
User Action (e.g., font size slider)
    │
    ▼
Component receives onChange
    │
    ▼
Calls setFontSize(newValue)
    │
    ▼
useSettings hook updates state
    │
    ▼
useEffect in hook persists to localStorage
    │
    ▼
Component re-renders with new value
```

### Pattern 2: Bookmark Toggle

```
User clicks verse
    │
    ▼
VerseDisplay calls onToggleBookmark
    │
    ▼
ChapterReader forwards to verseOps.toggleBookmark
    │
    ▼
useVerseOperations checks if bookmark exists
    │
    ├─ If exists: removes from array
    └─ If not: adds to array
    │
    ▼
useUserData updates bookmarks state
    │
    ▼
useEffect in hook saves to localStorage
    │
    ▼
VerseDisplay re-renders with updated bookmark status
```

### Pattern 3: Chapter Navigation

```
User clicks "Next Chapter" button
    │
    ▼
ChapterReader calls onNextChapter
    │
    ▼
Home component increments selectedChapter
    │
    ▼
useEffect detects selectedChapter change
    │
    ▼
Fetches new verses from API
    │
    ▼
Updates verses state
    │
    ▼
ChapterReader re-renders with new verses
```

### Pattern 4: Search

```
User types in search box
    │
    ▼
SearchModal updates searchQuery state
    │
    ▼
Home component receives setSearchQuery call
    │
    ▼
useEffect debounces query (300ms)
    │
    ▼
Calls ScriptureService.searchVerses()
    │
    ▼
Updates searchResults state
    │
    ▼
SearchModal displays results
    │
    ▼
User clicks result
    │
    ▼
Calls onNavigate with verse reference
    │
    ▼
Home navigates to verse and closes modal
```

## 🔄 Component Communication

### Parent → Child (Props)

```typescript
// Home passes data down
<ChapterReader
  verses={verses}
  fontSize={fontSize}
  onToggleBookmark={verseOps.toggleBookmark}
/>

// Child receives and uses
const ChapterReader: React.FC<Props> = ({ verses, fontSize, onToggleBookmark }) => {
  // Use props
}
```

### Child → Parent (Callbacks)

```typescript
// Parent provides callback
<BookChapterSelector
  onChapterSelect={handleChapterSelect}
/>

// Child calls callback
const handleClick = (chapter) => {
  onChapterSelect(chapter); // Notifies parent
};
```

### Sibling Communication (Through Parent)

```typescript
// Sidebar (child 1) updates tab
<Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

// Home (parent) manages state
const [activeTab, setActiveTab] = useState('books');

// Main content (child 2) reacts to change
{activeTab === 'books' && <BooksList />}
```

## 🎨 Styling Architecture

### CSS Classes Organization

```css
/* Layout */
.reading-container        /* Main content padding */
.sidebar                  /* Sidebar layout */
.app-header               /* Header layout */

/* Typography */
.book-title               /* Large book titles */
.chapter-heading          /* Chapter headings */
.scripture-text           /* Verse text */
.verse-number             /* Verse numbers */

/* Interactions */
.sidebar-item             /* Sidebar navigation items */
.sidebar-item--active     /* Active sidebar item */
.highlight-yellow         /* Yellow highlight */
.highlight-green          /* Green highlight */
/* ... other colors */

/* Animations */
.slide-in                 /* Slide in animation */
.fade-in                  /* Fade in animation */

/* Utilities */
.no-print                 /* Hide when printing */
```

### CSS Variables (Theme)

```css
:root {
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8f9fa;
  --color-bg-tertiary: #e9ecef;
  --color-text-primary: #212529;
  --color-text-secondary: #6c757d;
  --color-text-tertiary: #adb5bd;
  --color-border: #dee2e6;
  --color-border-light: #e9ecef;
  --color-accent: #4a90e2;
  --color-gold: #ffc107;
  --font-serif: Georgia, serif;
  --font-sans: system-ui, sans-serif;
}

.dark {
  --color-bg-primary: #1a1a1a;
  --color-bg-secondary: #242424;
  --color-bg-tertiary: #2d2d2d;
  --color-text-primary: #e0e0e0;
  --color-text-secondary: #a0a0a0;
  --color-text-tertiary: #707070;
  /* ... */
}
```

## 📊 Component Responsibility Matrix

| Component               | Responsibilities           | State                        | Side Effects |
| ----------------------- | -------------------------- | ---------------------------- | ------------ |
| **Home**                | Composition, orchestration | UI state, selected items     | None         |
| **Header**              | Top navigation, actions    | None                         | None         |
| **Sidebar**             | Navigation, tabs           | None                         | None         |
| **VolumeTabs**          | Volume selection           | None                         | None         |
| **VolumeHomeScreen**    | Volume overview            | None                         | None         |
| **BookChapterSelector** | Chapter grid               | None                         | None         |
| **ChapterReader**       | Reading view               | Selected verse               | None         |
| **VerseDisplay**        | Single verse UI            | None                         | None         |
| **SettingsModal**       | Settings UI                | None                         | None         |
| **SearchModal**         | Search UI                  | None                         | None         |
| **useSettings**         | Settings logic             | All settings                 | localStorage |
| **useUserData**         | User data logic            | Bookmarks, highlights, notes | localStorage |
| **useReadingProgress**  | Progress logic             | Reading data                 | localStorage |
| **useVerseOperations**  | Verse CRUD                 | None                         | Via setters  |

## 🧩 Reusability Map

### Highly Reusable (Can be used anywhere)

- ✅ All Icon components
- ✅ VerseDisplay
- ✅ All Modal components
- ✅ VolumeTabs

### Moderately Reusable (Some coupling)

- 🟡 VolumeHomeScreen (needs volume data)
- 🟡 BookChapterSelector (needs book data)
- 🟡 ChapterReader (needs verse data)
- 🟡 Header (needs specific props)
- 🟡 Sidebar (needs specific props)

### Context-Specific (Domain-specific)

- 🔴 All custom hooks (scripture app specific)
- 🔴 ScriptureService (API specific)
- 🔴 Data backup utils (data structure specific)

## 🎯 Key Architectural Decisions

### 1. **Hooks over Context for most state**

- Simpler to understand
- Easier to test
- Less prop drilling still
- Can add Context later if needed

### 2. **Component composition over configuration**

- More flexible
- Easier to customize
- Better TypeScript support
- Clearer data flow

### 3. **Separate modal components**

- Better code splitting
- Easier to test
- Cleaner main component
- Reusable across app

### 4. **Service layer for API calls**

- Single source of truth
- Easy to mock for testing
- Can add caching/retry logic
- Consistent error handling

### 5. **LocalStorage for persistence**

- Simple implementation
- No backend required
- Works offline
- Can migrate to IndexedDB later

## 📈 Scalability Considerations

### Easy to Add

- ✅ New volumes
- ✅ New features (cross-references, audio, etc.)
- ✅ New themes
- ✅ New study tools

### Moderate Effort

- 🟡 Multi-language support
- 🟡 User accounts / sync
- 🟡 Advanced search
- 🟡 PDF export

### Significant Refactor

- 🔴 Offline-first with service worker
- 🔴 Real-time collaboration
- 🔴 Native mobile apps
- 🔴 Complex permissions

This architecture provides a solid foundation for future growth while maintaining simplicity and maintainability.
