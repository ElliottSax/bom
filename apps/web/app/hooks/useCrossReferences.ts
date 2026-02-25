'use client';

import { useCallback } from 'react';
import {
  type CrossReference,
  crossRefsByFrom,
  formatCrossReference as formatRef,
  getCrossRefTypeLabel as getTypeLabel,
  getCrossRefTypeColor as getTypeColor,
} from '../data/cross-references';

// Re-export types and utilities
export type { CrossReference };
export const formatCrossReference = formatRef;
export const getCrossRefTypeLabel = getTypeLabel;
export const getCrossRefTypeColor = getTypeColor;

/**
 * Hook for accessing cross-references between scriptures
 * Now with 200+ references including:
 * - Isaiah chapters (2 Nephi 12-24)
 * - Sermon on the Mount (3 Nephi 12-14)
 * - Key doctrinal passages
 * - Internal BoM references
 */
export function useCrossReferences() {
  const getCrossReferences = useCallback((editionId: string, book: string, chapter: number, verse: number): CrossReference[] => {
    const verseId = `${editionId}:${book}:${chapter}:${verse}`;
    return crossRefsByFrom.get(verseId) || [];
  }, []);

  const getChapterCrossReferences = useCallback((editionId: string, book: string, chapter: number): Map<number, CrossReference[]> => {
    const result = new Map<number, CrossReference[]>();
    for (let verse = 1; verse <= 100; verse++) {
      const verseId = `${editionId}:${book}:${chapter}:${verse}`;
      const refs = crossRefsByFrom.get(verseId);
      if (refs?.length) result.set(verse, refs);
    }
    return result;
  }, []);

  const hasCrossReferences = useCallback((editionId: string, book: string, chapter: number, verse: number): boolean => {
    return crossRefsByFrom.has(`${editionId}:${book}:${chapter}:${verse}`);
  }, []);

  return { getCrossReferences, getChapterCrossReferences, hasCrossReferences };
}
