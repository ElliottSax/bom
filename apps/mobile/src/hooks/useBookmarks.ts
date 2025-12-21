/**
 * Bookmarks Hook
 *
 * Manages verse bookmarks with local storage
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => Promise<void>;
  removeBookmark: (verseId: string) => Promise<void>;
  isBookmarked: (verseId: string) => boolean;
  updateBookmarkLabel: (verseId: string, label: string) => Promise<void>;
  clearAllBookmarks: () => Promise<void>;
}

export function useBookmarks(): UseBookmarksResult {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  // Load bookmarks on mount
  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      const stored = await AsyncStorage.getItem(BOOKMARKS_KEY);
      if (stored) {
        setBookmarks(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveBookmarks = async (newBookmarks: Bookmark[]) => {
    try {
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(newBookmarks));
    } catch (error) {
      console.error('Failed to save bookmarks:', error);
    }
  };

  const addBookmark = useCallback(
    async (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => {
      const newBookmark: Bookmark = {
        ...bookmark,
        id: `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now(),
      };

      setBookmarks((prev) => {
        // Check if already bookmarked
        const exists = prev.some((b) => b.verseId === bookmark.verseId);
        if (exists) return prev;

        const updated = [newBookmark, ...prev];
        saveBookmarks(updated);
        return updated;
      });
    },
    []
  );

  const removeBookmark = useCallback(async (verseId: string) => {
    setBookmarks((prev) => {
      const updated = prev.filter((b) => b.verseId !== verseId);
      saveBookmarks(updated);
      return updated;
    });
  }, []);

  const isBookmarked = useCallback(
    (verseId: string) => {
      return bookmarks.some((b) => b.verseId === verseId);
    },
    [bookmarks]
  );

  const updateBookmarkLabel = useCallback(async (verseId: string, label: string) => {
    setBookmarks((prev) => {
      const updated = prev.map((b) =>
        b.verseId === verseId ? { ...b, label } : b
      );
      saveBookmarks(updated);
      return updated;
    });
  }, []);

  const clearAllBookmarks = useCallback(async () => {
    setBookmarks([]);
    await AsyncStorage.removeItem(BOOKMARKS_KEY);
  }, []);

  return {
    bookmarks,
    loading,
    addBookmark,
    removeBookmark,
    isBookmarked,
    updateBookmarkLabel,
    clearAllBookmarks,
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
