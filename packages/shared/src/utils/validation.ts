import { z } from 'zod';
import { BOOK_OF_MORMON_BOOKS, BookOfMormonBook } from './constants';

/**
 * Shared validation schemas using Zod
 */

// Valid book names for validation (includes display names)
const VALID_BOOK_SLUGS = new Set(BOOK_OF_MORMON_BOOKS);
const VALID_BOOK_DISPLAY_NAMES = new Set([
  '1 Nephi', '2 Nephi', '3 Nephi', '4 Nephi',
  'I Nephi', 'II Nephi', 'III Nephi', 'IV Nephi',
  'Jacob', 'Enos', 'Jarom', 'Omni', 'Words of Mormon',
  'Mosiah', 'Alma', 'Helaman', 'Mormon', 'Ether', 'Moroni',
]);

// Chapter limits per book (approximate - should be verified)
const BOOK_CHAPTER_LIMITS: Partial<Record<string, number>> = {
  '1-nephi': 22, '2-nephi': 33, 'jacob': 7, 'enos': 1,
  'jarom': 1, 'omni': 1, 'words-of-mormon': 1, 'mosiah': 29,
  'alma': 63, 'helaman': 16, '3-nephi': 30, '4-nephi': 1,
  'mormon': 9, 'ether': 15, 'moroni': 10,
};

// Improved verse reference regex - matches book-chapter-verse format
export const verseReferenceSchema = z.string().refine(
  (ref) => {
    // Match patterns like: 1-nephi-3-7, alma-32-21, etc.
    const match = ref.match(/^([1-4]?-?[a-z-]+)-(\d+)-(\d+)$/i);
    if (!match) return false;

    const [, bookSlug, chapterStr, verseStr] = match;
    const chapter = parseInt(chapterStr, 10);
    const verse = parseInt(verseStr, 10);

    // Validate book name
    const normalizedBook = bookSlug.toLowerCase();
    if (!VALID_BOOK_SLUGS.has(normalizedBook as BookOfMormonBook)) {
      return false;
    }

    // Validate chapter is reasonable (1-100)
    if (chapter < 1 || chapter > 100) return false;

    // Validate verse is reasonable (1-200)
    if (verse < 1 || verse > 200) return false;

    return true;
  },
  { message: 'Invalid verse reference format (e.g., 1-nephi-3-7, alma-32-21)' }
);

export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const noteContentSchema = z
  .string()
  .min(1, 'Note content cannot be empty')
  .max(10000, 'Note content exceeds maximum length');

export const tagSchema = z
  .string()
  .min(1, 'Tag cannot be empty')
  .max(50, 'Tag exceeds maximum length')
  .regex(/^[a-zA-Z0-9-_]+$/, 'Tags can only contain letters, numbers, hyphens, and underscores');

export const tagsArraySchema = z.array(tagSchema).max(20, 'Maximum 20 tags allowed');

export const chapterSchema = z.number().int().min(1).max(100);

export const verseNumberSchema = z.number().int().min(1).max(200);

export const bookNameSchema = z.string().refine(
  (name) => {
    const normalized = name.toLowerCase().replace(/\s+/g, '-');
    return VALID_BOOK_SLUGS.has(normalized as BookOfMormonBook) ||
           VALID_BOOK_DISPLAY_NAMES.has(name);
  },
  { message: 'Invalid book name' }
);

export const searchQuerySchema = z
  .string()
  .min(1, 'Search query cannot be empty')
  .max(500, 'Search query exceeds maximum length')
  .transform((val) => val.trim());

export const highlightColorSchema = z.enum(['yellow', 'blue', 'green', 'pink', 'orange', 'purple']);

// ============================================
// Validator Functions
// ============================================

/**
 * Validates a verse reference string
 */
export function validateVerseReference(reference: string): boolean {
  return verseReferenceSchema.safeParse(reference).success;
}

/**
 * Validates an email address
 */
export function validateEmail(email: string): boolean {
  return emailSchema.safeParse(email).success;
}

/**
 * Validates a password
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const result = passwordSchema.safeParse(password);
  if (result.success) {
    return { valid: true, errors: [] };
  }
  return {
    valid: false,
    errors: result.error.errors.map((e) => e.message),
  };
}

/**
 * Validates note content
 */
export function validateNoteContent(content: string): boolean {
  return noteContentSchema.safeParse(content).success;
}

/**
 * Validates a tag
 */
export function validateTag(tag: string): boolean {
  return tagSchema.safeParse(tag).success;
}

/**
 * Validates an array of tags
 */
export function validateTags(tags: string[]): boolean {
  return tagsArraySchema.safeParse(tags).success;
}

/**
 * Validates a book name (slug or display name)
 */
export function validateBookName(name: string): boolean {
  return bookNameSchema.safeParse(name).success;
}

/**
 * Validates a chapter number for a specific book
 */
export function validateChapter(book: string, chapter: number): boolean {
  if (!chapterSchema.safeParse(chapter).success) return false;

  const normalized = book.toLowerCase().replace(/\s+/g, '-');
  const maxChapter = BOOK_CHAPTER_LIMITS[normalized];

  if (maxChapter && chapter > maxChapter) return false;

  return true;
}

/**
 * Validates a verse number
 */
export function validateVerseNumber(verse: number): boolean {
  return verseNumberSchema.safeParse(verse).success;
}

/**
 * Validates a search query
 */
export function validateSearchQuery(query: string): boolean {
  return searchQuerySchema.safeParse(query).success;
}

/**
 * Validates a highlight color
 */
export function validateHighlightColor(color: string): boolean {
  return highlightColorSchema.safeParse(color).success;
}

/**
 * Parses a verse reference string into components
 */
export function parseVerseReference(reference: string): {
  book: string;
  chapter: number;
  verse: number;
} | null {
  const match = reference.match(/^([1-4]?-?[a-z-]+)-(\d+)-(\d+)$/i);
  if (!match) return null;

  const [, book, chapterStr, verseStr] = match;
  return {
    book: book.toLowerCase(),
    chapter: parseInt(chapterStr, 10),
    verse: parseInt(verseStr, 10),
  };
}

/**
 * Formats a verse reference from components
 */
export function formatVerseReference(book: string, chapter: number, verse: number): string {
  const normalizedBook = book.toLowerCase().replace(/\s+/g, '-');
  return `${normalizedBook}-${chapter}-${verse}`;
}
