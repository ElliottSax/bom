/**
 * Highlights Hook
 *
 * Manages verse highlights with local storage
 * Refactored to use generic usePersistedState hook
 */

import { useCallback } from 'react';
import { usePersistedList } from './usePersistedState';
import { generateId } from '../utils/id';

const HIGHLIGHTS_KEY = '@bom_highlights';

export interface Highlight {
  id: string;
  verseId: string;
  editionId: string;
  book: string;
  chapter: number;
  verse: number;
  color: string;
  createdAt: number;
}

interface UseHighlightsResult {
  highlights: Highlight[];
  loading: boolean;
  addHighlight: (highlight: Omit<Highlight, 'id' | 'createdAt'>) => void;
  removeHighlight: (verseId: string) => void;
  updateHighlightColor: (verseId: string, color: string) => void;
  getHighlight: (verseId: string) => Highlight | undefined;
  getHighlightsForChapter: (editionId: string, book: string, chapter: number) => Highlight[];
  clearAllHighlights: () => Promise<void>;
}

export function useHighlights(): UseHighlightsResult {
  const {
    items: highlights,
    loading,
    add,
    remove,
    update,
    filter,
    clear,
    setItems,
  } = usePersistedList<Highlight>({ key: HIGHLIGHTS_KEY });

  const addHighlight = useCallback(
    (highlight: Omit<Highlight, 'id' | 'createdAt'>) => {
      const newHighlight: Highlight = {
        ...highlight,
        id: generateId('highlight'),
        createdAt: Date.now(),
      };

      // Remove existing highlight for same verse, then add new one
      setItems((prev) => [
        newHighlight,
        ...prev.filter((h) => h.verseId !== highlight.verseId),
      ]);
    },
    [setItems]
  );

  const removeHighlight = useCallback(
    (verseId: string) => {
      setItems((prev) => prev.filter((h) => h.verseId !== verseId));
    },
    [setItems]
  );

  const updateHighlightColor = useCallback(
    (verseId: string, color: string) => {
      setItems((prev) =>
        prev.map((h) =>
          h.verseId === verseId ? { ...h, color, createdAt: Date.now() } : h
        )
      );
    },
    [setItems]
  );

  const getHighlight = useCallback(
    (verseId: string) => highlights.find((h) => h.verseId === verseId),
    [highlights]
  );

  const getHighlightsForChapter = useCallback(
    (editionId: string, book: string, chapter: number) =>
      highlights.filter(
        (h) => h.editionId === editionId && h.book === book && h.chapter === chapter
      ),
    [highlights]
  );

  return {
    highlights,
    loading,
    addHighlight,
    removeHighlight,
    updateHighlightColor,
    getHighlight,
    getHighlightsForChapter,
    clearAllHighlights: clear,
  };
}

/**
 * Highlight color options
 */
export const HIGHLIGHT_COLORS = {
  yellow: '#ffeb3b',
  blue: '#2196f3',
  green: '#4caf50',
  pink: '#e91e63',
  orange: '#ff9800',
} as const;

export type HighlightColor = keyof typeof HIGHLIGHT_COLORS;

/**
 * Get color name from hex value
 */
export function getColorName(hex: string): string {
  const entry = Object.entries(HIGHLIGHT_COLORS).find(([_, value]) => value === hex);
  return entry ? entry[0] : 'unknown';
}
