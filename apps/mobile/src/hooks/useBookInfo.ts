/**
 * Book Information Hook
 *
 * Provides chapter counts and book metadata
 */

import { useMemo } from 'react';

// Chapter counts for CoC Book of Mormon 1908 edition
const BOOK_CHAPTERS: Record<string, number> = {
  'I Nephi': 22,
  'II Nephi': 33,
  'Jacob': 7,
  'Enos': 1,
  'Jarom': 1,
  'Omni': 1,
  'Words of Mormon': 1,
  'Mosiah': 29,
  'Alma': 30,
  'Helaman': 16,
  'III Nephi': 30,
  'IV Nephi': 1,
  'Mormon': 9,
  'Ether': 15,
  'Moroni': 10,
};

// Book order for navigation
const BOOK_ORDER = [
  'I Nephi',
  'II Nephi',
  'Jacob',
  'Enos',
  'Jarom',
  'Omni',
  'Words of Mormon',
  'Mosiah',
  'Alma',
  'Helaman',
  'III Nephi',
  'IV Nephi',
  'Mormon',
  'Ether',
  'Moroni',
];

export interface BookInfo {
  name: string;
  chapters: number;
  index: number;
}

/**
 * Get chapter count for a specific book
 */
export function getChapterCount(book: string): number {
  return BOOK_CHAPTERS[book] || 1;
}

/**
 * Get all books with their chapter counts
 */
export function getAllBooks(): BookInfo[] {
  return BOOK_ORDER.map((name, index) => ({
    name,
    chapters: BOOK_CHAPTERS[name] || 1,
    index,
  }));
}

/**
 * Get next chapter info (handles book transitions)
 */
export function getNextChapter(
  book: string,
  chapter: number
): { book: string; chapter: number } | null {
  const maxChapter = getChapterCount(book);

  if (chapter < maxChapter) {
    return { book, chapter: chapter + 1 };
  }

  // Move to next book
  const bookIndex = BOOK_ORDER.indexOf(book);
  if (bookIndex < BOOK_ORDER.length - 1) {
    return { book: BOOK_ORDER[bookIndex + 1], chapter: 1 };
  }

  return null; // End of Book of Mormon
}

/**
 * Get previous chapter info (handles book transitions)
 */
export function getPreviousChapter(
  book: string,
  chapter: number
): { book: string; chapter: number } | null {
  if (chapter > 1) {
    return { book, chapter: chapter - 1 };
  }

  // Move to previous book
  const bookIndex = BOOK_ORDER.indexOf(book);
  if (bookIndex > 0) {
    const prevBook = BOOK_ORDER[bookIndex - 1];
    return { book: prevBook, chapter: getChapterCount(prevBook) };
  }

  return null; // Beginning of Book of Mormon
}

/**
 * Hook for book navigation
 */
export function useBookNavigation(book: string, chapter: number) {
  const maxChapter = getChapterCount(book);
  const bookIndex = BOOK_ORDER.indexOf(book);

  const navigation = useMemo(() => {
    const next = getNextChapter(book, chapter);
    const prev = getPreviousChapter(book, chapter);

    return {
      book,
      chapter,
      maxChapter,
      bookIndex,
      totalBooks: BOOK_ORDER.length,
      hasNext: next !== null,
      hasPrevious: prev !== null,
      next,
      previous: prev,
      isFirstChapter: chapter === 1 && bookIndex === 0,
      isLastChapter: chapter === maxChapter && bookIndex === BOOK_ORDER.length - 1,
    };
  }, [book, chapter, maxChapter, bookIndex]);

  return navigation;
}

/**
 * Get book by index
 */
export function getBookByIndex(index: number): string | null {
  if (index >= 0 && index < BOOK_ORDER.length) {
    return BOOK_ORDER[index];
  }
  return null;
}

/**
 * Get book index
 */
export function getBookIndex(book: string): number {
  return BOOK_ORDER.indexOf(book);
}
