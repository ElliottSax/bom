/**
 * Cross-References Hook
 *
 * Provides related scripture references for verses
 */

import { useMemo, useCallback } from 'react';

export interface CrossReference {
  fromVerseId: string;
  toVerseId: string;
  toBook: string;
  toChapter: number;
  toVerse: number;
  type: 'parallel' | 'quote' | 'allusion' | 'related';
  note?: string;
}

export interface VerseReference {
  book: string;
  chapter: number;
  verse: number;
  text?: string;
}

// Cross-reference data for Book of Mormon
// These are commonly referenced parallel passages and quotes
const CROSS_REFERENCES: CrossReference[] = [
  // Isaiah quotes in 2 Nephi
  {
    fromVerseId: 'coc-bom-1908:II Nephi:12:1',
    toVerseId: 'bible:Isaiah:2:1',
    toBook: 'Isaiah',
    toChapter: 2,
    toVerse: 1,
    type: 'quote',
    note: 'Isaiah prophecy quoted by Nephi',
  },
  {
    fromVerseId: 'coc-bom-1908:II Nephi:12:2',
    toVerseId: 'bible:Isaiah:2:2',
    toBook: 'Isaiah',
    toChapter: 2,
    toVerse: 2,
    type: 'quote',
  },
  // Sermon on the Mount parallels in 3 Nephi
  {
    fromVerseId: 'coc-bom-1908:III Nephi:12:3',
    toVerseId: 'bible:Matthew:5:3',
    toBook: 'Matthew',
    toChapter: 5,
    toVerse: 3,
    type: 'parallel',
    note: 'Beatitudes - Blessed are the poor in spirit',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:12:4',
    toVerseId: 'bible:Matthew:5:4',
    toBook: 'Matthew',
    toChapter: 5,
    toVerse: 4,
    type: 'parallel',
    note: 'Beatitudes - Blessed are they that mourn',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:12:5',
    toVerseId: 'bible:Matthew:5:5',
    toBook: 'Matthew',
    toChapter: 5,
    toVerse: 5,
    type: 'parallel',
    note: 'Beatitudes - Blessed are the meek',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:12:6',
    toVerseId: 'bible:Matthew:5:6',
    toBook: 'Matthew',
    toChapter: 5,
    toVerse: 6,
    type: 'parallel',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:12:7',
    toVerseId: 'bible:Matthew:5:7',
    toBook: 'Matthew',
    toChapter: 5,
    toVerse: 7,
    type: 'parallel',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:12:8',
    toVerseId: 'bible:Matthew:5:8',
    toBook: 'Matthew',
    toChapter: 5,
    toVerse: 8,
    type: 'parallel',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:12:9',
    toVerseId: 'bible:Matthew:5:9',
    toBook: 'Matthew',
    toChapter: 5,
    toVerse: 9,
    type: 'parallel',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:12:10',
    toVerseId: 'bible:Matthew:5:10',
    toBook: 'Matthew',
    toChapter: 5,
    toVerse: 10,
    type: 'parallel',
  },
  // Lord's Prayer in 3 Nephi
  {
    fromVerseId: 'coc-bom-1908:III Nephi:13:9',
    toVerseId: 'bible:Matthew:6:9',
    toBook: 'Matthew',
    toChapter: 6,
    toVerse: 9,
    type: 'parallel',
    note: "The Lord's Prayer",
  },
  // Internal BoM cross-references
  {
    fromVerseId: 'coc-bom-1908:I Nephi:3:7',
    toVerseId: 'coc-bom-1908:I Nephi:17:3',
    toBook: 'I Nephi',
    toChapter: 17,
    toVerse: 3,
    type: 'related',
    note: 'God prepares a way',
  },
  {
    fromVerseId: 'coc-bom-1908:Mosiah:3:19',
    toVerseId: 'coc-bom-1908:Alma:26:12',
    toBook: 'Alma',
    toChapter: 26,
    toVerse: 12,
    type: 'related',
    note: 'Becoming as a child / Boasting in God',
  },
  {
    fromVerseId: 'coc-bom-1908:Alma:32:21',
    toVerseId: 'bible:Hebrews:11:1',
    toBook: 'Hebrews',
    toChapter: 11,
    toVerse: 1,
    type: 'parallel',
    note: 'Definition of faith',
  },
  {
    fromVerseId: 'coc-bom-1908:Moroni:10:4',
    toVerseId: 'bible:James:1:5',
    toBook: 'James',
    toChapter: 1,
    toVerse: 5,
    type: 'related',
    note: 'Ask God in faith',
  },
  // Charity passages
  {
    fromVerseId: 'coc-bom-1908:Moroni:7:45',
    toVerseId: 'bible:1 Corinthians:13:4',
    toBook: '1 Corinthians',
    toChapter: 13,
    toVerse: 4,
    type: 'parallel',
    note: 'Charity suffereth long',
  },
  {
    fromVerseId: 'coc-bom-1908:Moroni:7:47',
    toVerseId: 'bible:1 Corinthians:13:13',
    toBook: '1 Corinthians',
    toChapter: 13,
    toVerse: 13,
    type: 'parallel',
    note: 'The pure love of Christ',
  },
  // Helaman rock of Christ
  {
    fromVerseId: 'coc-bom-1908:Helaman:5:12',
    toVerseId: 'bible:Matthew:7:24',
    toBook: 'Matthew',
    toChapter: 7,
    toVerse: 24,
    type: 'related',
    note: 'Building on the rock',
  },
  // Ether faith moving mountains
  {
    fromVerseId: 'coc-bom-1908:Ether:12:27',
    toVerseId: 'bible:2 Corinthians:12:9',
    toBook: '2 Corinthians',
    toChapter: 12,
    toVerse: 9,
    type: 'related',
    note: 'Weakness made strength',
  },
  // Adam fell that men might be
  {
    fromVerseId: 'coc-bom-1908:II Nephi:2:25',
    toVerseId: 'bible:Romans:5:12',
    toBook: 'Romans',
    toChapter: 5,
    toVerse: 12,
    type: 'related',
    note: 'The Fall of Adam',
  },
  // Alma the younger conversion
  {
    fromVerseId: 'coc-bom-1908:Mosiah:27:25',
    toVerseId: 'bible:John:3:3',
    toBook: 'John',
    toChapter: 3,
    toVerse: 3,
    type: 'related',
    note: 'Born again',
  },
  // Mosiah baptismal covenant
  {
    fromVerseId: 'coc-bom-1908:Mosiah:18:8',
    toVerseId: 'bible:Galatians:6:2',
    toBook: 'Galatians',
    toChapter: 6,
    toVerse: 2,
    type: 'related',
    note: 'Bear one another burdens',
  },
  {
    fromVerseId: 'coc-bom-1908:Mosiah:18:9',
    toVerseId: 'bible:Romans:12:15',
    toBook: 'Romans',
    toChapter: 12,
    toVerse: 15,
    type: 'related',
    note: 'Mourn with those that mourn',
  },
];

// Build lookup maps for efficient access
const crossRefsByFrom = new Map<string, CrossReference[]>();
const crossRefsByTo = new Map<string, CrossReference[]>();

CROSS_REFERENCES.forEach((ref) => {
  // Add to from lookup
  const fromRefs = crossRefsByFrom.get(ref.fromVerseId) || [];
  fromRefs.push(ref);
  crossRefsByFrom.set(ref.fromVerseId, fromRefs);

  // Add to to lookup (for reverse references)
  const toRefs = crossRefsByTo.get(ref.toVerseId) || [];
  toRefs.push(ref);
  crossRefsByTo.set(ref.toVerseId, toRefs);
});

interface UseCrossReferencesResult {
  getCrossReferences: (verseId: string) => CrossReference[];
  getRelatedVerses: (book: string, chapter: number, verse: number) => CrossReference[];
  hasCrossReferences: (verseId: string) => boolean;
  getChapterCrossReferences: (editionId: string, book: string, chapter: number) => Map<number, CrossReference[]>;
}

export function useCrossReferences(): UseCrossReferencesResult {
  const getCrossReferences = useCallback((verseId: string): CrossReference[] => {
    return crossRefsByFrom.get(verseId) || [];
  }, []);

  const getRelatedVerses = useCallback(
    (book: string, chapter: number, verse: number): CrossReference[] => {
      const verseId = `coc-bom-1908:${book}:${chapter}:${verse}`;
      return getCrossReferences(verseId);
    },
    [getCrossReferences]
  );

  const hasCrossReferences = useCallback((verseId: string): boolean => {
    return crossRefsByFrom.has(verseId);
  }, []);

  const getChapterCrossReferences = useCallback(
    (editionId: string, book: string, chapter: number): Map<number, CrossReference[]> => {
      const result = new Map<number, CrossReference[]>();

      // Check all possible verses in the chapter (assuming max 100 verses)
      for (let verse = 1; verse <= 100; verse++) {
        const verseId = `${editionId}:${book}:${chapter}:${verse}`;
        const refs = crossRefsByFrom.get(verseId);
        if (refs && refs.length > 0) {
          result.set(verse, refs);
        }
      }

      return result;
    },
    []
  );

  return {
    getCrossReferences,
    getRelatedVerses,
    hasCrossReferences,
    getChapterCrossReferences,
  };
}

/**
 * Format a cross-reference for display
 */
export function formatCrossReference(ref: CrossReference): string {
  return `${ref.toBook} ${ref.toChapter}:${ref.toVerse}`;
}

/**
 * Get type label for cross-reference
 */
export function getCrossRefTypeLabel(type: CrossReference['type']): string {
  switch (type) {
    case 'quote':
      return 'Quote';
    case 'parallel':
      return 'Parallel';
    case 'allusion':
      return 'Allusion';
    case 'related':
      return 'Related';
    default:
      return 'Reference';
  }
}

/**
 * Get type color for cross-reference
 */
export function getCrossRefTypeColor(type: CrossReference['type']): string {
  switch (type) {
    case 'quote':
      return '#2196f3'; // Blue
    case 'parallel':
      return '#4caf50'; // Green
    case 'allusion':
      return '#ff9800'; // Orange
    case 'related':
      return '#9c27b0'; // Purple
    default:
      return '#666666';
  }
}
