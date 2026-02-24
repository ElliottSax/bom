'use client';

import { useState, useEffect, useCallback } from 'react';
import { logger } from '../utils/logger';

const log = logger.scope('Memorization');

const MEMORIZATION_KEY = 'coc-memorization';

export interface MemorizationVerse {
  id: string;
  verseId: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  addedAt: number;
  lastReviewedAt: number | null;
  nextReviewAt: number;
  level: number; // 0-5
  correctCount: number;
  incorrectCount: number;
}

export interface MemorizationStats {
  total: number;
  mastered: number;
  learning: number;
  new: number;
  dueForReview: number;
}

const REVIEW_INTERVALS = [1, 2, 4, 7, 14, 30]; // days

function loadFromStorage(): MemorizationVerse[] {
  if (typeof window === 'undefined') return [];
  try {
    const item = localStorage.getItem(MEMORIZATION_KEY);
    return item ? JSON.parse(item) : [];
  } catch { return []; }
}

export function useMemorization() {
  const [verses, setVerses] = useState<MemorizationVerse[]>(loadFromStorage);

  useEffect(() => {
    try { localStorage.setItem(MEMORIZATION_KEY, JSON.stringify(verses)); }
    catch (e) { log.error('Save memorization failed', e instanceof Error ? e : undefined); }
  }, [verses]);

  const addVerse = useCallback((verse: {
    verseId: string; book: string; chapter: number; verse: number; text: string;
  }) => {
    setVerses(prev => {
      if (prev.some(v => v.verseId === verse.verseId)) return prev;
      const now = Date.now();
      return [...prev, {
        id: `mem-${now}-${Math.random().toString(36).substring(2, 11)}`,
        ...verse, addedAt: now, lastReviewedAt: null, nextReviewAt: now,
        level: 0, correctCount: 0, incorrectCount: 0,
      }];
    });
  }, []);

  const removeVerse = useCallback((verseId: string) => {
    setVerses(prev => prev.filter(v => v.verseId !== verseId));
  }, []);

  const isMemorizing = useCallback((verseId: string) => {
    return verses.some(v => v.verseId === verseId);
  }, [verses]);

  const getDueVerses = useCallback(() => {
    const now = Date.now();
    return verses.filter(v => v.nextReviewAt <= now).sort((a, b) => a.nextReviewAt - b.nextReviewAt);
  }, [verses]);

  const recordReview = useCallback((verseId: string, correct: boolean) => {
    const now = Date.now();
    setVerses(prev => prev.map(v => {
      if (v.verseId !== verseId) return v;
      const newLevel = correct ? Math.min(5, v.level + 1) : Math.max(0, v.level - 1);
      const intervalDays = REVIEW_INTERVALS[newLevel];
      return {
        ...v, level: newLevel, lastReviewedAt: now,
        nextReviewAt: now + intervalDays * 86400000,
        correctCount: correct ? v.correctCount + 1 : v.correctCount,
        incorrectCount: correct ? v.incorrectCount : v.incorrectCount + 1,
      };
    }));
  }, []);

  const getStats = useCallback((): MemorizationStats => {
    const now = Date.now();
    return {
      total: verses.length,
      mastered: verses.filter(v => v.level >= 4).length,
      learning: verses.filter(v => v.level >= 1 && v.level < 4).length,
      new: verses.filter(v => v.level === 0).length,
      dueForReview: verses.filter(v => v.nextReviewAt <= now).length,
    };
  }, [verses]);

  const getLevelLabel = (level: number): string => {
    return ['New', 'Learning', 'Reviewing', 'Familiar', 'Known', 'Mastered'][level] || 'Unknown';
  };

  const getLevelColor = (level: number): string => {
    return ['#9e9e9e', '#ff9800', '#ff5722', '#2196f3', '#4caf50', '#8bc34a'][level] || '#9e9e9e';
  };

  const formatNextReview = (timestamp: number): string => {
    const diff = timestamp - Date.now();
    if (diff <= 0) return 'Now';
    if (diff < 3600000) return 'In < 1 hour';
    if (diff < 86400000) return `In ${Math.floor(diff / 3600000)} hours`;
    return `In ${Math.floor(diff / 86400000)} days`;
  };

  const generateHint = useCallback((text: string, revealPercentage: number = 0.3) => {
    const words = text.split(' ');
    const numToHide = Math.floor(words.length * (1 - revealPercentage));
    const indices = new Set<number>();
    while (indices.size < numToHide && indices.size < words.length) {
      indices.add(Math.floor(Math.random() * words.length));
    }
    const hintWords = words.map((w, i) => indices.has(i) ? '_'.repeat(Math.max(3, w.length)) : w);
    return { text: hintWords.join(' '), blanks: indices.size };
  }, []);

  const getFirstLetterHint = useCallback((text: string): string => {
    return text.split(' ').map(w => w[0] + w.slice(1).replace(/[a-zA-Z]/g, '_')).join(' ');
  }, []);

  return {
    verses, addVerse, removeVerse, isMemorizing, getDueVerses,
    recordReview, getStats, getLevelLabel, getLevelColor,
    formatNextReview, generateHint, getFirstLetterHint,
  };
}
