'use client';

import { useState, useCallback, useEffect } from 'react';
import { type VolumeId } from '../lib/types';
import { logger } from '../utils/logger';

const log = logger.scope('WordStudy');

const WORD_STUDIES_KEY = 'coc-completed-word-studies';

export interface WordOccurrence {
  verse: number;
  text: string;
  chapter: number;
  book: string;
  volumeId: VolumeId;
  reference: string;
}

export interface WordStudyResult {
  word: string;
  totalOccurrences: number;
  occurrences: WordOccurrence[];
  byBook: { book: string; count: number }[];
}

export interface CompletedWordStudy {
  word: string;
  volumeId: VolumeId;
  completedAt: number;
  totalOccurrences: number;
}

function loadCompletedStudies(): CompletedWordStudy[] {
  if (typeof window === 'undefined') return [];
  try {
    const item = localStorage.getItem(WORD_STUDIES_KEY);
    return item ? JSON.parse(item) : [];
  } catch {
    return [];
  }
}

export function useWordStudy() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WordStudyResult | null>(null);
  const [completedStudies, setCompletedStudies] = useState<CompletedWordStudy[]>(loadCompletedStudies);

  // Save to localStorage whenever completedStudies changes
  useEffect(() => {
    try {
      localStorage.setItem(WORD_STUDIES_KEY, JSON.stringify(completedStudies));
    } catch (e) {
      log.error('Failed to save completed word studies', e instanceof Error ? e : undefined);
    }
  }, [completedStudies]);

  const studyWord = useCallback(
    async (word: string, volumeId: VolumeId): Promise<WordStudyResult | null> => {
      if (!word || word.length < 2) {
        setError('Word must be at least 2 characters');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(word.toLowerCase())}&volume=${volumeId}&limit=200`
        );
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        const results = data.results || [];

        const occurrences: WordOccurrence[] = results.map((r: Record<string, string | number>) => ({
          verse: r.verse,
          text: r.text,
          chapter: r.chapter,
          book: r.book,
          volumeId: r.volumeId,
          reference: r.reference,
        }));

        const bookCounts = new Map<string, number>();
        occurrences.forEach((occ) => {
          bookCounts.set(occ.book, (bookCounts.get(occ.book) || 0) + 1);
        });

        const byBook = Array.from(bookCounts.entries())
          .map(([book, count]) => ({ book, count }))
          .sort((a, b) => b.count - a.count);

        const studyResult: WordStudyResult = {
          word: word.toLowerCase(),
          totalOccurrences: occurrences.length,
          occurrences,
          byBook,
        };

        setResult(studyResult);
        setLoading(false);
        return studyResult;
      } catch (err) {
        log.error('Word study failed', err instanceof Error ? err : undefined);
        setError('Failed to search for word');
        setLoading(false);
        return null;
      }
    },
    []
  );

  const highlightWord = useCallback(
    (text: string, word: string): { text: string; isHighlighted: boolean }[] => {
      if (!word) return [{ text, isHighlighted: false }];
      const regex = new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      const parts = text.split(regex);
      return parts.map((part) => ({
        text: part,
        isHighlighted: part.toLowerCase() === word.toLowerCase(),
      }));
    },
    []
  );

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  const completeStudy = useCallback((word: string, volumeId: VolumeId, totalOccurrences: number) => {
    const studyKey = `${word.toLowerCase()}-${volumeId}`;
    setCompletedStudies(prev => {
      // Check if already completed
      if (prev.some(s => `${s.word}-${s.volumeId}` === studyKey)) {
        return prev;
      }
      return [...prev, {
        word: word.toLowerCase(),
        volumeId,
        completedAt: Date.now(),
        totalOccurrences,
      }];
    });
  }, []);

  const isStudyCompleted = useCallback((word: string, volumeId: VolumeId): boolean => {
    const studyKey = `${word.toLowerCase()}-${volumeId}`;
    return completedStudies.some(s => `${s.word}-${s.volumeId}` === studyKey);
  }, [completedStudies]);

  const getCompletedCount = useCallback((): number => {
    return completedStudies.length;
  }, [completedStudies]);

  return {
    loading,
    error,
    result,
    studyWord,
    highlightWord,
    clearResult,
    completeStudy,
    isStudyCompleted,
    getCompletedCount,
    completedStudies,
  };
}
