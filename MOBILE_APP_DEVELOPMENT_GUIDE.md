# Mobile App Development Guide

**Last Updated:** December 7, 2025
**Database Status:** 11,947 verses ready for integration

---

## Overview

The Book of Mormon Study Tools mobile app is ready to be developed with a complete scripture database containing:

- ✅ **Complete Book of Mormon:** 8,701 verses (all 15 books)
- ✅ **Doctrine & Covenants:** 3,244 verses (144 sections)
- ✅ **GraphQL API:** Schema and resolvers ready
- ✅ **Multi-edition support:** CoC and LDS versification systems

---

## Phase 2: Mobile App Foundation

### Architecture

**Stack:**
- React Native 0.77+ (New Architecture)
- Apollo Client (GraphQL integration)
- SQLite (offline storage)
- PouchDB (sync management)
- React Navigation (routing)

**Data Flow:**
```
[Mobile App] <--> [Apollo Client] <--> [GraphQL API] <--> [PostgreSQL]
     |
     v
[SQLite Cache] (offline-first)
```

---

## Development Roadmap

### Week 1: Core Infrastructure
1. ✅ Database populated with scripture text
2. ✅ GraphQL queries documented
3. [ ] Set up React Native project structure
4. [ ] Configure Apollo Client
5. [ ] Create SQLite offline cache
6. [ ] Implement basic navigation

### Week 2: Reading Features
1. [ ] Scripture reader component
2. [ ] Chapter navigation
3. [ ] Book selection
4. [ ] Edition switching
5. [ ] Verse highlighting
6. [ ] Font size controls

### Week 3: Offline Sync
1. [ ] Download manager
2. [ ] Sync progress tracking
3. [ ] Cache invalidation
4. [ ] Background sync
5. [ ] Offline indicator

### Week 4: Study Features
1. [ ] Note taking
2. [ ] Highlighting
3. [ ] Bookmarks
4. [ ] Search functionality
5. [ ] Cross-references

---

## Key Components to Build

### 1. Scripture Reader Component

```typescript
// src/components/ScriptureReader.tsx
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useChapter } from '../hooks/useChapter';

interface Props {
  editionId: string;
  book: string;
  chapter: number;
}

export function ScriptureReader({ editionId, book, chapter }: Props) {
  const { verses, loading, error } = useChapter(editionId, book, chapter);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <ScrollView>
      <Text style={styles.title}>{book} {chapter}</Text>
      {verses.map((verse) => (
        <Verse key={verse.id} verse={verse} />
      ))}
    </ScrollView>
  );
}
```

### 2. Apollo Client Setup

```typescript
// src/services/apollo.ts
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { persistCache } from 'apollo3-cache-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

const cache = new InMemoryCache();

// Persist cache for offline support
await persistCache({
  cache,
  storage: AsyncStorage,
  maxSize: 10485760, // 10 MB
});

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'http://localhost:4000/graphql',
  }),
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-first',
    },
  },
});
```

### 3. Offline Storage Manager

```typescript
// src/services/offlineStorage.ts
import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase({
  name: 'bom_study_tools.db',
  location: 'default',
});

export async function cacheChapter(
  editionId: string,
  book: string,
  chapter: number,
  verses: Verse[]
) {
  const tx = await db.transaction();

  for (const verse of verses) {
    await tx.executeSql(
      `INSERT OR REPLACE INTO cached_verses
       (id, editionId, book, chapter, verse, text, cachedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [verse.id, editionId, book, chapter, verse.verse, verse.text, Date.now()]
    );
  }
}

export async function getCachedChapter(
  editionId: string,
  book: string,
  chapter: number
): Promise<Verse[]> {
  const result = await db.executeSql(
    `SELECT * FROM cached_verses
     WHERE editionId = ? AND book = ? AND chapter = ?
     ORDER BY verse ASC`,
    [editionId, book, chapter]
  );

  return result[0].rows.raw();
}
```

### 4. Custom Hooks

```typescript
// src/hooks/useChapter.ts
import { useQuery, gql } from '@apollo/client';
import { useNetInfo } from '@react-native-community/netinfo';
import { getCachedChapter } from '../services/offlineStorage';

const GET_CHAPTER = gql`
  query GetChapter($editionId: ID!, $book: String!, $chapter: Int!) {
    verses(editionId: $editionId, book: $book, chapter: $chapter) {
      id
      verse
      text
      verseType
    }
  }
`;

export function useChapter(
  editionId: string,
  book: string,
  chapter: number
) {
  const netInfo = useNetInfo();

  // Try GraphQL first if online
  const { data, loading, error } = useQuery(GET_CHAPTER, {
    variables: { editionId, book, chapter },
    skip: !netInfo.isConnected,
  });

  // Fall back to cache if offline
  const [cachedVerses, setCachedVerses] = useState<Verse[]>([]);

  useEffect(() => {
    if (!netInfo.isConnected) {
      getCachedChapter(editionId, book, chapter).then(setCachedVerses);
    }
  }, [netInfo.isConnected, editionId, book, chapter]);

  return {
    verses: data?.verses || cachedVerses,
    loading: loading && !cachedVerses.length,
    error,
    isOffline: !netInfo.isConnected,
  };
}
```

### 5. Navigation Structure

```typescript
// src/navigation/RootNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ReadingStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="BookList" component={BookListScreen} />
      <Stack.Screen name="ChapterList" component={ChapterListScreen} />
      <Stack.Screen name="Reader" component={ReaderScreen} />
    </Stack.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Read" component={ReadingStack} />
        <Tab.Screen name="Study" component={StudyScreen} />
        <Tab.Screen name="Search" component={SearchScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
```

---

## Database Schema (SQLite Mobile Cache)

```sql
-- Cached verses for offline reading
CREATE TABLE cached_verses (
  id TEXT PRIMARY KEY,
  editionId TEXT NOT NULL,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  text TEXT NOT NULL,
  verseType TEXT DEFAULT 'standard',
  cachedAt INTEGER NOT NULL,
  INDEX idx_cached_location (editionId, book, chapter)
);

-- User notes
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  verseId TEXT NOT NULL,
  content TEXT NOT NULL,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  syncStatus TEXT DEFAULT 'pending'
);

-- Highlights
CREATE TABLE highlights (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  verseId TEXT NOT NULL,
  color TEXT NOT NULL,
  createdAt INTEGER NOT NULL,
  syncStatus TEXT DEFAULT 'pending'
);

-- Bookmarks
CREATE TABLE bookmarks (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  verseId TEXT NOT NULL,
  label TEXT,
  createdAt INTEGER NOT NULL,
  syncStatus TEXT DEFAULT 'pending'
);

-- Reading history
CREATE TABLE reading_history (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  editionId TEXT NOT NULL,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  readAt INTEGER NOT NULL
);

-- Download queue
CREATE TABLE download_queue (
  id TEXT PRIMARY KEY,
  editionId TEXT NOT NULL,
  book TEXT,
  chapter INTEGER,
  priority INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  progress REAL DEFAULT 0,
  createdAt INTEGER NOT NULL
);
```

---

## GraphQL Integration Examples

### Query with Variables

```typescript
import { gql, useQuery } from '@apollo/client';

const SEARCH_VERSES = gql`
  query SearchVerses($searchText: String!, $editionId: ID!) {
    verses(searchText: $searchText, editionId: $editionId) {
      id
      book
      chapter
      verse
      text
    }
  }
`;

function SearchScreen() {
  const [searchText, setSearchText] = useState('');
  const { data, loading } = useQuery(SEARCH_VERSES, {
    variables: {
      searchText,
      editionId: 'coc-bom-1908',
    },
    skip: searchText.length < 3,
  });

  return (
    <View>
      <TextInput
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Search scriptures..."
      />
      {loading && <ActivityIndicator />}
      <FlatList
        data={data?.verses}
        renderItem={({ item }) => <SearchResult verse={item} />}
      />
    </View>
  );
}
```

### Mutation Example (User Data)

```typescript
const ADD_NOTE = gql`
  mutation AddNote($verseId: ID!, $content: String!) {
    addNote(verseId: $verseId, content: $content) {
      id
      content
      createdAt
    }
  }
`;

function NoteEditor({ verseId }: { verseId: string }) {
  const [addNote, { loading }] = useMutation(ADD_NOTE);

  const handleSave = async (content: string) => {
    await addNote({
      variables: { verseId, content },
      // Update cache optimistically
      optimisticResponse: {
        addNote: {
          __typename: 'Note',
          id: `temp-${Date.now()}`,
          content,
          createdAt: new Date().toISOString(),
        },
      },
    });
  };

  // ...
}
```

---

## Offline-First Strategy

### 1. Initial App Load
- Load essential UI and navigation immediately
- Show "Continue Reading" from cached data
- Sync in background when online

### 2. Progressive Download
- Download Book of Mormon first (most used)
- Queue D&C sections based on user preference
- Download in chunks to show progress

### 3. Sync Strategy
```typescript
interface SyncManager {
  // Download priority order
  downloadPriority: [
    { work: 'Book of Mormon', priority: 1 },
    { work: 'D&C', sections: [1-50], priority: 2 },
    { work: 'D&C', sections: [51-144], priority: 3 },
  ];

  // Sync user data when online
  syncUserData(): Promise<void>;

  // Track download progress
  onProgress(callback: (progress: number) => void): void;

  // Estimate storage requirements
  getStorageEstimate(): number; // ~50MB for full text
}
```

### 4. Cache Management
- Store last 20 chapters accessed (auto-manage)
- Allow user to "pin" chapters for offline
- Clear old cache after 30 days
- Show storage usage in settings

---

## Performance Considerations

### 1. Virtual Scrolling
For large chapters (e.g., Alma with 100+ verses):

```typescript
import { FlatList } from 'react-native';

<FlatList
  data={verses}
  renderItem={({ item }) => <Verse verse={item} />}
  keyExtractor={(item) => item.id}
  initialNumToRender={20}
  maxToRenderPerBatch={10}
  windowSize={21}
  removeClippedSubviews={true}
/>
```

### 2. Image Optimization
- No images in v1.0 (text only)
- Future: Lazy load maps, charts

### 3. Bundle Size
- Code splitting by feature
- Lazy load search, study tools
- Target: < 20MB initial bundle

---

## Testing Strategy

### Unit Tests
```bash
npm test
```

### E2E Tests (Detox)
```typescript
describe('Scripture Reading', () => {
  it('should load and display I Nephi 1', async () => {
    await element(by.id('book-list')).tap();
    await element(by.text('I Nephi')).tap();
    await element(by.text('Chapter 1')).tap();
    await expect(element(by.text('I, Nephi'))).toBeVisible();
  });

  it('should work offline', async () => {
    await device.disableWiFi();
    await element(by.id('reader')).swipe('up');
    await expect(element(by.id('verse-10'))).toBeVisible();
    await device.enableWiFi();
  });
});
```

---

## Next Steps

### Immediate (This Week)
1. [ ] Create React Native project structure
2. [ ] Set up Apollo Client
3. [ ] Implement basic scripture reader
4. [ ] Add navigation (Book → Chapter → Verse)
5. [ ] Test with I Nephi (986 verses)

### Week 2
1. [ ] Implement SQLite caching
2. [ ] Add download manager
3. [ ] Create offline indicator
4. [ ] Test with Alma (2,575 verses - largest book)

### Week 3
1. [ ] Add note taking
2. [ ] Implement highlighting
3. [ ] Create search functionality
4. [ ] Add bookmarks

### Week 4
1. [ ] Cross-references
2. [ ] Reading history
3. [ ] Progress tracking
4. [ ] Settings (font size, theme)

---

## Resources

**Documentation:**
- [GraphQL Queries](./GRAPHQL_QUERIES_FULL_DATASET.md) - 20 query examples
- [API Guide](./GRAPHQL_API_GUIDE.md) - Schema reference
- [Database Status](./CURRENT_STATUS.md) - 11,947 verses ready

**External:**
- [React Native Docs](https://reactnative.dev/)
- [Apollo Client](https://www.apollographql.com/docs/react/)
- [React Navigation](https://reactnavigation.org/)
- [SQLite](https://github.com/andpor/react-native-sqlite-storage)

---

## Success Criteria

**MVP (Minimum Viable Product):**
- ✅ Read all 15 Book of Mormon books
- ✅ Read 144 D&C sections
- ✅ Offline reading (cached chapters)
- ✅ Edition switching (CoC ↔ LDS when available)
- ✅ Basic search
- ✅ Bookmarks

**Full v1.0:**
- All MVP features
- Notes and highlights
- Cross-references
- Reading history
- Progress tracking
- Cloud sync

---

**Current Status:** Database ready, API tested, mobile app foundation next! 🚀
