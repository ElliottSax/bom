/**
 * Highlights Hook
 *
 * Manages verse highlights with local storage
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  addHighlight: (highlight: Omit<Highlight, 'id' | 'createdAt'>) => Promise<void>;
  removeHighlight: (verseId: string) => Promise<void>;
  updateHighlightColor: (verseId: string, color: string) => Promise<void>;
  getHighlight: (verseId: string) => Highlight | undefined;
  getHighlightsForChapter: (editionId: string, book: string, chapter: number) => Highlight[];
  clearAllHighlights: () => Promise<void>;
}

export function useHighlights(): UseHighlightsResult {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);

  // Load highlights on mount
  useEffect(() => {
    loadHighlights();
  }, []);

  const loadHighlights = async () => {
    try {
      const stored = await AsyncStorage.getItem(HIGHLIGHTS_KEY);
      if (stored) {
        setHighlights(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load highlights:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveHighlights = async (newHighlights: Highlight[]) => {
    try {
      await AsyncStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(newHighlights));
    } catch (error) {
      console.error('Failed to save highlights:', error);
    }
  };

  const addHighlight = useCallback(
    async (highlight: Omit<Highlight, 'id' | 'createdAt'>) => {
      setHighlights((prev) => {
        // Remove existing highlight for same verse if exists
        const filtered = prev.filter((h) => h.verseId !== highlight.verseId);

        const newHighlight: Highlight = {
          ...highlight,
          id: `highlight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: Date.now(),
        };

        const updated = [newHighlight, ...filtered];
        saveHighlights(updated);
        return updated;
      });
    },
    []
  );

  const removeHighlight = useCallback(async (verseId: string) => {
    setHighlights((prev) => {
      const updated = prev.filter((h) => h.verseId !== verseId);
      saveHighlights(updated);
      return updated;
    });
  }, []);

  const updateHighlightColor = useCallback(async (verseId: string, color: string) => {
    setHighlights((prev) => {
      const updated = prev.map((h) =>
        h.verseId === verseId ? { ...h, color, createdAt: Date.now() } : h
      );
      saveHighlights(updated);
      return updated;
    });
  }, []);

  const getHighlight = useCallback(
    (verseId: string) => {
      return highlights.find((h) => h.verseId === verseId);
    },
    [highlights]
  );

  const getHighlightsForChapter = useCallback(
    (editionId: string, book: string, chapter: number) => {
      return highlights.filter(
        (h) => h.editionId === editionId && h.book === book && h.chapter === chapter
      );
    },
    [highlights]
  );

  const clearAllHighlights = useCallback(async () => {
    setHighlights([]);
    await AsyncStorage.removeItem(HIGHLIGHTS_KEY);
  }, []);

  return {
    highlights,
    loading,
    addHighlight,
    removeHighlight,
    updateHighlightColor,
    getHighlight,
    getHighlightsForChapter,
    clearAllHighlights,
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
