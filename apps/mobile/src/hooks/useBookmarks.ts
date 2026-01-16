/**
 * Bookmarks Hook
 *
 * Manages verse bookmarks with local storage
 * Refactored to use generic usePersistedState hook
 */

import { useCallback } from 'react';
import { usePersistedList } from './usePersistedState';
import { generateId } from '../utils/id';

const BOOKMARKS_KEY = '@bom_bookmarks';

export interface Bookmark {
  id: string;
  verseId: string;
  editionId: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  label?: string;
  createdAt: number;
}

interface UseBookmarksResult {
  bookmarks: Bookmark[];
  loading: boolean;
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => void;
  removeBookmark: (verseId: string) => void;
  isBookmarked: (verseId: string) => boolean;
  updateBookmarkLabel: (verseId: string, label: string) => void;
  clearAllBookmarks: () => Promise<void>;
}

export function useBookmarks(): UseBookmarksResult {
  const {
    items: bookmarks,
    loading,
    clear,
    setItems,
  } = usePersistedList<Bookmark>({ key: BOOKMARKS_KEY });

  const addBookmark = useCallback(
    (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => {
      setItems((prev) => {
        // Check if already bookmarked
        if (prev.some((b) => b.verseId === bookmark.verseId)) {
          return prev;
        }

        const newBookmark: Bookmark = {
          ...bookmark,
          id: generateId('bookmark'),
          createdAt: Date.now(),
        };

        return [newBookmark, ...prev];
      });
    },
    [setItems]
  );

  const removeBookmark = useCallback(
    (verseId: string) => {
      setItems((prev) => prev.filter((b) => b.verseId !== verseId));
    },
    [setItems]
  );

  const isBookmarked = useCallback(
    (verseId: string) => bookmarks.some((b) => b.verseId === verseId),
    [bookmarks]
  );

  const updateBookmarkLabel = useCallback(
    (verseId: string, label: string) => {
      setItems((prev) =>
        prev.map((b) => (b.verseId === verseId ? { ...b, label } : b))
      );
    },
    [setItems]
  );

  return {
    bookmarks,
    loading,
    addBookmark,
    removeBookmark,
    isBookmarked,
    updateBookmarkLabel,
    clearAllBookmarks: clear,
  };
}

/**
 * Get bookmarks for a specific book/chapter
 */
export function filterBookmarksByLocation(
  bookmarks: Bookmark[],
  editionId: string,
  book?: string,
  chapter?: number
): Bookmark[] {
  return bookmarks.filter((b) => {
    if (b.editionId !== editionId) return false;
    if (book && b.book !== book) return false;
    if (chapter !== undefined && b.chapter !== chapter) return false;
    return true;
  });
}

/**
 * Sort bookmarks by different criteria
 */
export function sortBookmarks(
  bookmarks: Bookmark[],
  by: 'date' | 'location' = 'date'
): Bookmark[] {
  const sorted = [...bookmarks];

  if (by === 'date') {
    sorted.sort((a, b) => b.createdAt - a.createdAt);
  } else {
    sorted.sort((a, b) => {
      if (a.book !== b.book) return a.book.localeCompare(b.book);
      if (a.chapter !== b.chapter) return a.chapter - b.chapter;
      return a.verse - b.verse;
    });
  }

  return sorted;
}
