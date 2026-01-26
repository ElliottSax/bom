/**
 * Offline Storage Service
 *
 * Manages SQLite database for offline scripture caching
 */

import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';

// Enable promise API
SQLite.enablePromise(true);

let database: SQLiteDatabase | null = null;

/**
 * Initialize SQLite database
 */
export async function initDatabase(): Promise<SQLiteDatabase> {
  if (database) {
    return database;
  }

  try {
    database = await SQLite.openDatabase({
      name: 'bom_study_tools.db',
      location: 'default',
    });

    console.log('SQLite database opened successfully');

    // Create tables
    await createTables(database);

    return database;
  } catch (error) {
    console.error('Error opening database:', error);
    throw error;
  }
}

/**
 * Create database tables
 */
async function createTables(db: SQLiteDatabase): Promise<void> {
  const tables = [
    // Cached verses
    `CREATE TABLE IF NOT EXISTS cached_verses (
      id TEXT PRIMARY KEY,
      editionId TEXT NOT NULL,
      book TEXT NOT NULL,
      chapter INTEGER NOT NULL,
      verse INTEGER NOT NULL,
      text TEXT NOT NULL,
      verseType TEXT DEFAULT 'standard',
      cachedAt INTEGER NOT NULL
    )`,

    // Index for fast lookups
    `CREATE INDEX IF NOT EXISTS idx_cached_location
     ON cached_verses (editionId, book, chapter)`,

    // User notes
    `CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      verseId TEXT NOT NULL,
      content TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      syncStatus TEXT DEFAULT 'pending'
    )`,

    // Highlights
    `CREATE TABLE IF NOT EXISTS highlights (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      verseId TEXT NOT NULL,
      color TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      syncStatus TEXT DEFAULT 'pending'
    )`,

    // Bookmarks
    `CREATE TABLE IF NOT EXISTS bookmarks (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      verseId TEXT NOT NULL,
      label TEXT,
      createdAt INTEGER NOT NULL,
      syncStatus TEXT DEFAULT 'pending'
    )`,

    // Reading history
    `CREATE TABLE IF NOT EXISTS reading_history (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      editionId TEXT NOT NULL,
      book TEXT NOT NULL,
      chapter INTEGER NOT NULL,
      verse INTEGER NOT NULL,
      readAt INTEGER NOT NULL
    )`,

    // Download queue
    `CREATE TABLE IF NOT EXISTS download_queue (
      id TEXT PRIMARY KEY,
      editionId TEXT NOT NULL,
      book TEXT,
      chapter INTEGER,
      priority INTEGER DEFAULT 0,
      status TEXT DEFAULT 'pending',
      progress REAL DEFAULT 0,
      createdAt INTEGER NOT NULL
    )`,

    // Indexes for userId lookups (improves query performance)
    `CREATE INDEX IF NOT EXISTS idx_notes_userId ON notes (userId)`,
    `CREATE INDEX IF NOT EXISTS idx_highlights_userId ON highlights (userId)`,
    `CREATE INDEX IF NOT EXISTS idx_bookmarks_userId ON bookmarks (userId)`,
    `CREATE INDEX IF NOT EXISTS idx_reading_history_userId ON reading_history (userId)`,

    // Composite indexes for common query patterns
    `CREATE INDEX IF NOT EXISTS idx_notes_userId_verseId ON notes (userId, verseId)`,
    `CREATE INDEX IF NOT EXISTS idx_highlights_userId_verseId ON highlights (userId, verseId)`,
    `CREATE INDEX IF NOT EXISTS idx_bookmarks_userId_verseId ON bookmarks (userId, verseId)`,
  ];

  for (const sql of tables) {
    await db.executeSql(sql);
  }

  console.log('Database tables created successfully');
}

/**
 * Cache a chapter's verses
 */
export async function cacheChapter(
  editionId: string,
  book: string,
  chapter: number,
  verses: Array<{ id: string; verse: number; text: string; verseType: string }>
): Promise<void> {
  const db = await initDatabase();
  const now = Date.now();

  try {
    await db.transaction(async (tx) => {
      for (const verse of verses) {
        await tx.executeSql(
          `INSERT OR REPLACE INTO cached_verses
           (id, editionId, book, chapter, verse, text, verseType, cachedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [verse.id, editionId, book, chapter, verse.verse, verse.text, verse.verseType, now]
        );
      }
    });

    console.log(`Cached ${verses.length} verses for ${book} ${chapter}`);
  } catch (error) {
    console.error('Error caching chapter:', error);
    throw error;
  }
}

/**
 * Get cached chapter verses
 */
export async function getCachedChapter(
  editionId: string,
  book: string,
  chapter: number
): Promise<Array<any>> {
  const db = await initDatabase();

  try {
    const [result] = await db.executeSql(
      `SELECT id, verse, text, verseType, book, chapter
       FROM cached_verses
       WHERE editionId = ? AND book = ? AND chapter = ?
       ORDER BY verse ASC`,
      [editionId, book, chapter]
    );

    const verses = [];
    for (let i = 0; i < result.rows.length; i++) {
      verses.push(result.rows.item(i));
    }

    return verses;
  } catch (error) {
    console.error('Error getting cached chapter:', error);
    return [];
  }
}

/**
 * Check if a chapter is cached
 */
export async function isChapterCached(
  editionId: string,
  book: string,
  chapter: number
): Promise<boolean> {
  const db = await initDatabase();

  try {
    const [result] = await db.executeSql(
      `SELECT COUNT(*) as count
       FROM cached_verses
       WHERE editionId = ? AND book = ? AND chapter = ?`,
      [editionId, book, chapter]
    );

    return result.rows.item(0).count > 0;
  } catch (error) {
    console.error('Error checking cached chapter:', error);
    return false;
  }
}

/**
 * Get cache size in MB
 */
export async function getCacheSize(): Promise<number> {
  const db = await initDatabase();

  try {
    const [result] = await db.executeSql(
      `SELECT page_count * page_size as size
       FROM pragma_page_count(), pragma_page_size()`
    );

    const sizeInBytes = result.rows.item(0).size;
    return sizeInBytes / (1024 * 1024); // Convert to MB
  } catch (error) {
    console.error('Error getting cache size:', error);
    return 0;
  }
}

/**
 * Clear all cached verses
 */
export async function clearCache(): Promise<void> {
  const db = await initDatabase();

  try {
    await db.executeSql('DELETE FROM cached_verses');
    console.log('Cache cleared successfully');
  } catch (error) {
    console.error('Error clearing cache:', error);
    throw error;
  }
}

/**
 * Clear old cache entries (older than 30 days)
 */
export async function clearOldCache(): Promise<void> {
  const db = await initDatabase();
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

  try {
    await db.executeSql(
      'DELETE FROM cached_verses WHERE cachedAt < ?',
      [thirtyDaysAgo]
    );
    console.log('Old cache entries cleared');
  } catch (error) {
    console.error('Error clearing old cache:', error);
    throw error;
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  totalVerses: number;
  totalChapters: number;
  sizeInMB: number;
  oldestEntry: number;
  newestEntry: number;
}> {
  const db = await initDatabase();

  try {
    const [result] = await db.executeSql(`
      SELECT
        COUNT(*) as totalVerses,
        COUNT(DISTINCT book || '-' || chapter) as totalChapters,
        MIN(cachedAt) as oldestEntry,
        MAX(cachedAt) as newestEntry
      FROM cached_verses
    `);

    const sizeInMB = await getCacheSize();
    const stats = result.rows.item(0);

    return {
      totalVerses: stats.totalVerses,
      totalChapters: stats.totalChapters,
      sizeInMB,
      oldestEntry: stats.oldestEntry,
      newestEntry: stats.newestEntry,
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    throw error;
  }
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  if (database) {
    await database.close();
    database = null;
    console.log('Database closed');
  }
}
