/**
 * ID Generation Utilities
 *
 * Provides consistent ID generation across the app
 */

/**
 * Generate a unique ID with optional prefix
 *
 * @param prefix - Optional prefix for the ID (e.g., 'bookmark', 'note')
 * @returns Unique ID string
 *
 * @example
 * ```typescript
 * generateId('bookmark') // => 'bookmark_1699123456789_abc123def'
 * generateId() // => '1699123456789_abc123def'
 * ```
 */
export function generateId(prefix?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 11);

  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
}

/**
 * Generate a verse-specific ID
 *
 * @param editionId - Edition ID
 * @param book - Book name
 * @param chapter - Chapter number
 * @param verse - Verse number
 * @returns Deterministic verse ID
 *
 * @example
 * ```typescript
 * generateVerseId('coc-bom-1908', '1 Nephi', 3, 7)
 * // => 'coc-bom-1908:1-nephi:3:7'
 * ```
 */
export function generateVerseId(
  editionId: string,
  book: string,
  chapter: number,
  verse: number
): string {
  const normalizedBook = book.toLowerCase().replace(/\s+/g, '-');
  return `${editionId}:${normalizedBook}:${chapter}:${verse}`;
}

/**
 * Parse a verse ID into its components
 *
 * @param verseId - Verse ID string
 * @returns Parsed components or null if invalid
 */
export function parseVerseId(verseId: string): {
  editionId: string;
  book: string;
  chapter: number;
  verse: number;
} | null {
  const parts = verseId.split(':');
  if (parts.length !== 4) return null;

  const [editionId, book, chapterStr, verseStr] = parts;
  const chapter = parseInt(chapterStr, 10);
  const verse = parseInt(verseStr, 10);

  if (isNaN(chapter) || isNaN(verse)) return null;

  return { editionId, book, chapter, verse };
}

export default generateId;
