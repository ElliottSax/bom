'use client';

import { useCallback } from 'react';

export interface CrossReference {
  fromVerseId: string;
  toBook: string;
  toChapter: number;
  toVerse: number;
  type: 'parallel' | 'quote' | 'allusion' | 'related';
  note?: string;
}

const CROSS_REFERENCES: CrossReference[] = [
  { fromVerseId: 'coc-bom-1908:II Nephi:12:1', toBook: 'Isaiah', toChapter: 2, toVerse: 1, type: 'quote', note: 'Isaiah prophecy quoted by Nephi' },
  { fromVerseId: 'coc-bom-1908:II Nephi:12:2', toBook: 'Isaiah', toChapter: 2, toVerse: 2, type: 'quote' },
  { fromVerseId: 'coc-bom-1908:III Nephi:12:3', toBook: 'Matthew', toChapter: 5, toVerse: 3, type: 'parallel', note: 'Beatitudes - Blessed are the poor in spirit' },
  { fromVerseId: 'coc-bom-1908:III Nephi:12:4', toBook: 'Matthew', toChapter: 5, toVerse: 4, type: 'parallel', note: 'Beatitudes - Blessed are they that mourn' },
  { fromVerseId: 'coc-bom-1908:III Nephi:12:5', toBook: 'Matthew', toChapter: 5, toVerse: 5, type: 'parallel', note: 'Beatitudes - Blessed are the meek' },
  { fromVerseId: 'coc-bom-1908:III Nephi:12:6', toBook: 'Matthew', toChapter: 5, toVerse: 6, type: 'parallel' },
  { fromVerseId: 'coc-bom-1908:III Nephi:12:7', toBook: 'Matthew', toChapter: 5, toVerse: 7, type: 'parallel' },
  { fromVerseId: 'coc-bom-1908:III Nephi:12:8', toBook: 'Matthew', toChapter: 5, toVerse: 8, type: 'parallel' },
  { fromVerseId: 'coc-bom-1908:III Nephi:12:9', toBook: 'Matthew', toChapter: 5, toVerse: 9, type: 'parallel' },
  { fromVerseId: 'coc-bom-1908:III Nephi:12:10', toBook: 'Matthew', toChapter: 5, toVerse: 10, type: 'parallel' },
  { fromVerseId: 'coc-bom-1908:III Nephi:13:9', toBook: 'Matthew', toChapter: 6, toVerse: 9, type: 'parallel', note: "The Lord's Prayer" },
  { fromVerseId: 'coc-bom-1908:I Nephi:3:7', toBook: 'I Nephi', toChapter: 17, toVerse: 3, type: 'related', note: 'God prepares a way' },
  { fromVerseId: 'coc-bom-1908:Mosiah:3:19', toBook: 'Alma', toChapter: 26, toVerse: 12, type: 'related', note: 'Becoming as a child / Boasting in God' },
  { fromVerseId: 'coc-bom-1908:Alma:32:21', toBook: 'Hebrews', toChapter: 11, toVerse: 1, type: 'parallel', note: 'Definition of faith' },
  { fromVerseId: 'coc-bom-1908:Moroni:10:4', toBook: 'James', toChapter: 1, toVerse: 5, type: 'related', note: 'Ask God in faith' },
  { fromVerseId: 'coc-bom-1908:Moroni:7:45', toBook: '1 Corinthians', toChapter: 13, toVerse: 4, type: 'parallel', note: 'Charity suffereth long' },
  { fromVerseId: 'coc-bom-1908:Moroni:7:47', toBook: '1 Corinthians', toChapter: 13, toVerse: 13, type: 'parallel', note: 'The pure love of Christ' },
  { fromVerseId: 'coc-bom-1908:Helaman:5:12', toBook: 'Matthew', toChapter: 7, toVerse: 24, type: 'related', note: 'Building on the rock' },
  { fromVerseId: 'coc-bom-1908:Ether:12:27', toBook: '2 Corinthians', toChapter: 12, toVerse: 9, type: 'related', note: 'Weakness made strength' },
  { fromVerseId: 'coc-bom-1908:II Nephi:2:25', toBook: 'Romans', toChapter: 5, toVerse: 12, type: 'related', note: 'The Fall of Adam' },
  { fromVerseId: 'coc-bom-1908:Mosiah:27:25', toBook: 'John', toChapter: 3, toVerse: 3, type: 'related', note: 'Born again' },
  { fromVerseId: 'coc-bom-1908:Mosiah:18:8', toBook: 'Galatians', toChapter: 6, toVerse: 2, type: 'related', note: 'Bear one another burdens' },
  { fromVerseId: 'coc-bom-1908:Mosiah:18:9', toBook: 'Romans', toChapter: 12, toVerse: 15, type: 'related', note: 'Mourn with those that mourn' },
];

const crossRefsByFrom = new Map<string, CrossReference[]>();
CROSS_REFERENCES.forEach(ref => {
  const existing = crossRefsByFrom.get(ref.fromVerseId) || [];
  existing.push(ref);
  crossRefsByFrom.set(ref.fromVerseId, existing);
});

export function formatCrossReference(ref: CrossReference): string {
  return `${ref.toBook} ${ref.toChapter}:${ref.toVerse}`;
}

export function getCrossRefTypeLabel(type: CrossReference['type']): string {
  switch (type) {
    case 'quote': return 'Quote';
    case 'parallel': return 'Parallel';
    case 'allusion': return 'Allusion';
    case 'related': return 'Related';
    default: return 'Reference';
  }
}

export function getCrossRefTypeColor(type: CrossReference['type']): string {
  switch (type) {
    case 'quote': return '#2196f3';
    case 'parallel': return '#4caf50';
    case 'allusion': return '#ff9800';
    case 'related': return '#9c27b0';
    default: return '#666666';
  }
}

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
