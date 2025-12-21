/**
 * Reading Progress Hook
 *
 * Tracks reading progress through the scriptures
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllBooks, getChapterCount } from './useBookInfo';

const PROGRESS_KEY = '@bom_reading_progress';
const READING_HISTORY_KEY = '@bom_reading_history';

export interface ChapterProgress {
  editionId: string;
  book: string;
  chapter: number;
  completedAt: number;
  readTime?: number; // Time spent reading in seconds
}

export interface ReadingSession {
  id: string;
  editionId: string;
  book: string;
  chapter: number;
  startedAt: number;
  endedAt?: number;
  versesRead: number;
}

interface ReadingStats {
  totalChaptersRead: number;
  totalChapters: number;
  percentComplete: number;
  currentStreak: number;
  longestStreak: number;
  lastReadDate: number | null;
  booksCompleted: number;
  totalBooks: number;
}

interface UseReadingProgressResult {
  progress: ChapterProgress[];
  stats: ReadingStats;
  loading: boolean;
  markChapterComplete: (editionId: string, book: string, chapter: number) => Promise<void>;
  markChapterIncomplete: (editionId: string, book: string, chapter: number) => Promise<void>;
  isChapterComplete: (editionId: string, book: string, chapter: number) => boolean;
  getBookProgress: (editionId: string, book: string) => { completed: number; total: number; percent: number };
  resetProgress: () => Promise<void>;
}

// Calculate total chapters in BoM
const TOTAL_CHAPTERS = getAllBooks().reduce((sum, book) => sum + book.chapters, 0);
const TOTAL_BOOKS = getAllBooks().length;

export function useReadingProgress(): UseReadingProgressResult {
  const [progress, setProgress] = useState<ChapterProgress[]>([]);
  const [loading, setLoading] = useState(true);

  // Load progress on mount
  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const stored = await AsyncStorage.getItem(PROGRESS_KEY);
      if (stored) {
        setProgress(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load reading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async (newProgress: ChapterProgress[]) => {
    try {
      await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress));
    } catch (error) {
      console.error('Failed to save reading progress:', error);
    }
  };

  const markChapterComplete = useCallback(
    async (editionId: string, book: string, chapter: number) => {
      setProgress((prev) => {
        // Check if already marked
        const exists = prev.some(
          (p) => p.editionId === editionId && p.book === book && p.chapter === chapter
        );
        if (exists) return prev;

        const newProgress: ChapterProgress = {
          editionId,
          book,
          chapter,
          completedAt: Date.now(),
        };

        const updated = [...prev, newProgress];
        saveProgress(updated);
        return updated;
      });
    },
    []
  );

  const markChapterIncomplete = useCallback(
    async (editionId: string, book: string, chapter: number) => {
      setProgress((prev) => {
        const updated = prev.filter(
          (p) => !(p.editionId === editionId && p.book === book && p.chapter === chapter)
        );
        saveProgress(updated);
        return updated;
      });
    },
    []
  );

  const isChapterComplete = useCallback(
    (editionId: string, book: string, chapter: number) => {
      return progress.some(
        (p) => p.editionId === editionId && p.book === book && p.chapter === chapter
      );
    },
    [progress]
  );

  const getBookProgress = useCallback(
    (editionId: string, book: string) => {
      const total = getChapterCount(book);
      const completed = progress.filter(
        (p) => p.editionId === editionId && p.book === book
      ).length;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

      return { completed, total, percent };
    },
    [progress]
  );

  const resetProgress = useCallback(async () => {
    setProgress([]);
    await AsyncStorage.removeItem(PROGRESS_KEY);
  }, []);

  // Calculate stats
  const stats = useMemo((): ReadingStats => {
    const bomProgress = progress.filter((p) => p.editionId === 'coc-bom-1908');
    const totalChaptersRead = bomProgress.length;
    const percentComplete = Math.round((totalChaptersRead / TOTAL_CHAPTERS) * 100);

    // Calculate completed books
    const booksCompleted = getAllBooks().filter((book) => {
      const bookProgress = bomProgress.filter((p) => p.book === book.name);
      return bookProgress.length === book.chapters;
    }).length;

    // Calculate streak
    const sortedDates = [...new Set(
      bomProgress.map((p) => new Date(p.completedAt).toDateString())
    )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (sortedDates[0] === today || sortedDates[0] === yesterday) {
      for (let i = 0; i < sortedDates.length; i++) {
        const currentDate = new Date(sortedDates[i]);
        const expectedDate = new Date(Date.now() - i * 86400000);

        if (currentDate.toDateString() === expectedDate.toDateString()) {
          tempStreak++;
        } else {
          break;
        }
      }
      currentStreak = tempStreak;
    }

    // Calculate longest streak (simplified)
    longestStreak = Math.max(currentStreak, 1);

    const lastReadDate = bomProgress.length > 0
      ? Math.max(...bomProgress.map((p) => p.completedAt))
      : null;

    return {
      totalChaptersRead,
      totalChapters: TOTAL_CHAPTERS,
      percentComplete,
      currentStreak,
      longestStreak,
      lastReadDate,
      booksCompleted,
      totalBooks: TOTAL_BOOKS,
    };
  }, [progress]);

  return {
    progress,
    stats,
    loading,
    markChapterComplete,
    markChapterIncomplete,
    isChapterComplete,
    getBookProgress,
    resetProgress,
  };
}

/**
 * Format reading time
 */
export function formatReadingTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return `${hours}h ${remainingMins}m`;
}

/**
 * Get motivational message based on progress
 */
export function getProgressMessage(percentComplete: number): string {
  if (percentComplete === 0) return "Ready to begin your journey!";
  if (percentComplete < 10) return "Great start! Keep going!";
  if (percentComplete < 25) return "You're making progress!";
  if (percentComplete < 50) return "Almost halfway there!";
  if (percentComplete < 75) return "Over halfway complete!";
  if (percentComplete < 90) return "The finish line is in sight!";
  if (percentComplete < 100) return "Almost there! You can do it!";
  return "Congratulations! You've read the entire Book of Mormon!";
}

/**
 * Estimate reading time based on word count
 * Average reading speed: 200 words per minute for scripture (slower than normal)
 */
export function estimateReadingTime(wordCount: number): { minutes: number; formatted: string } {
  const wordsPerMinute = 200;
  const minutes = Math.ceil(wordCount / wordsPerMinute);

  if (minutes < 1) {
    return { minutes: 1, formatted: '< 1 min' };
  }
  if (minutes === 1) {
    return { minutes: 1, formatted: '1 min' };
  }
  if (minutes < 60) {
    return { minutes, formatted: `${minutes} min` };
  }

  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  if (remainingMins === 0) {
    return { minutes, formatted: `${hours} hr` };
  }
  return { minutes, formatted: `${hours} hr ${remainingMins} min` };
}

/**
 * Estimate reading time from verse text
 */
export function estimateVerseReadingTime(verses: { text: string }[]): { minutes: number; formatted: string } {
  const totalWords = verses.reduce((sum, verse) => {
    return sum + verse.text.split(/\s+/).length;
  }, 0);
  return estimateReadingTime(totalWords);
}
