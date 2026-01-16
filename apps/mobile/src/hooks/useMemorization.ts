/**
 * Memorization Hook
 *
 * Manage verse memorization with spaced repetition
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MEMORIZATION_KEY = '@bom_memorization';

export interface MemorizationVerse {
  id: string;
  verseId: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  editionId: string;
  addedAt: number;
  lastReviewedAt: number | null;
  nextReviewAt: number;
  level: number; // 0-5, represents mastery level
  correctCount: number;
  incorrectCount: number;
}

export interface MemorizationStats {
  total: number;
  mastered: number; // level >= 4
  learning: number; // level 1-3
  new: number; // level 0
  dueForReview: number;
}

// Spaced repetition intervals in days based on level
const REVIEW_INTERVALS = [1, 2, 4, 7, 14, 30]; // days

export function useMemorization() {
  const [verses, setVerses] = useState<MemorizationVerse[]>([]);
  const [loading, setLoading] = useState(true);

  // Load verses on mount
  useEffect(() => {
    loadVerses();
  }, []);

  const loadVerses = async () => {
    try {
      const saved = await AsyncStorage.getItem(MEMORIZATION_KEY);
      if (saved) {
        setVerses(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load memorization verses:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveVerses = async (newVerses: MemorizationVerse[]) => {
    try {
      await AsyncStorage.setItem(MEMORIZATION_KEY, JSON.stringify(newVerses));
      setVerses(newVerses);
    } catch (err) {
      console.error('Failed to save memorization verses:', err);
    }
  };

  // Add a verse to memorization
  const addVerse = useCallback(
    async (verse: {
      verseId: string;
      book: string;
      chapter: number;
      verse: number;
      text: string;
      editionId: string;
    }) => {
      // Check if already added
      if (verses.some((v) => v.verseId === verse.verseId)) {
        return false;
      }

      const now = Date.now();
      const newVerse: MemorizationVerse = {
        id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        verseId: verse.verseId,
        book: verse.book,
        chapter: verse.chapter,
        verse: verse.verse,
        text: verse.text,
        editionId: verse.editionId,
        addedAt: now,
        lastReviewedAt: null,
        nextReviewAt: now, // Due immediately
        level: 0,
        correctCount: 0,
        incorrectCount: 0,
      };

      await saveVerses([...verses, newVerse]);
      return true;
    },
    [verses]
  );

  // Remove a verse from memorization
  const removeVerse = useCallback(
    async (verseId: string) => {
      const filtered = verses.filter((v) => v.verseId !== verseId);
      await saveVerses(filtered);
    },
    [verses]
  );

  // Check if verse is being memorized
  const isMemorizing = useCallback(
    (verseId: string) => {
      return verses.some((v) => v.verseId === verseId);
    },
    [verses]
  );

  // Get verses due for review
  const getDueVerses = useCallback(() => {
    const now = Date.now();
    return verses
      .filter((v) => v.nextReviewAt <= now)
      .sort((a, b) => a.nextReviewAt - b.nextReviewAt);
  }, [verses]);

  // Record review result
  const recordReview = useCallback(
    async (verseId: string, correct: boolean) => {
      const now = Date.now();
      const updated = verses.map((v) => {
        if (v.verseId !== verseId) return v;

        let newLevel = v.level;
        if (correct) {
          newLevel = Math.min(5, v.level + 1);
        } else {
          newLevel = Math.max(0, v.level - 1);
        }

        const intervalDays = REVIEW_INTERVALS[newLevel];
        const nextReviewAt = now + intervalDays * 24 * 60 * 60 * 1000;

        return {
          ...v,
          level: newLevel,
          lastReviewedAt: now,
          nextReviewAt,
          correctCount: correct ? v.correctCount + 1 : v.correctCount,
          incorrectCount: correct ? v.incorrectCount : v.incorrectCount + 1,
        };
      });

      await saveVerses(updated);
    },
    [verses]
  );

  // Get memorization stats
  const getStats = useCallback((): MemorizationStats => {
    const now = Date.now();
    return {
      total: verses.length,
      mastered: verses.filter((v) => v.level >= 4).length,
      learning: verses.filter((v) => v.level >= 1 && v.level < 4).length,
      new: verses.filter((v) => v.level === 0).length,
      dueForReview: verses.filter((v) => v.nextReviewAt <= now).length,
    };
  }, [verses]);

  // Get level label
  const getLevelLabel = (level: number): string => {
    const labels = ['New', 'Learning', 'Reviewing', 'Familiar', 'Known', 'Mastered'];
    return labels[level] || 'Unknown';
  };

  // Get level color
  const getLevelColor = (level: number): string => {
    const colors = ['#9e9e9e', '#ff9800', '#ff5722', '#2196f3', '#4caf50', '#8bc34a'];
    return colors[level] || '#9e9e9e';
  };

  // Format next review time
  const formatNextReview = (timestamp: number): string => {
    const now = Date.now();
    const diff = timestamp - now;

    if (diff <= 0) return 'Now';
    if (diff < 60 * 60 * 1000) return 'In < 1 hour';
    if (diff < 24 * 60 * 60 * 1000) return `In ${Math.floor(diff / (60 * 60 * 1000))} hours`;
    return `In ${Math.floor(diff / (24 * 60 * 60 * 1000))} days`;
  };

  // Generate hint with blanks
  const generateHint = useCallback(
    (text: string, revealPercentage: number = 0.3): { text: string; blanks: number } => {
      const words = text.split(' ');
      const numToHide = Math.floor(words.length * (1 - revealPercentage));
      const indicesToHide = new Set<number>();

      // Randomly select words to hide
      while (indicesToHide.size < numToHide && indicesToHide.size < words.length) {
        indicesToHide.add(Math.floor(Math.random() * words.length));
      }

      const hintWords = words.map((word, index) => {
        if (indicesToHide.has(index)) {
          return '_'.repeat(Math.max(3, word.length));
        }
        return word;
      });

      return {
        text: hintWords.join(' '),
        blanks: indicesToHide.size,
      };
    },
    []
  );

  // Get first letter hint
  const getFirstLetterHint = useCallback((text: string): string => {
    const words = text.split(' ');
    return words
      .map((word) => {
        const firstChar = word[0] || '';
        const rest = word.slice(1);
        return firstChar + rest.replace(/[a-zA-Z]/g, '_');
      })
      .join(' ');
  }, []);

  return {
    verses,
    loading,
    addVerse,
    removeVerse,
    isMemorizing,
    getDueVerses,
    recordReview,
    getStats,
    getLevelLabel,
    getLevelColor,
    formatNextReview,
    generateHint,
    getFirstLetterHint,
  };
}
