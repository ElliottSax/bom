/**
 * Study Plan Hook
 *
 * Manage reading plans for the Book of Mormon
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllBooks, getChapterCount } from './useBookInfo';
import { logger } from '../utils/logger';

const log = logger.scope('StudyPlan');

const STUDY_PLAN_KEY = '@bom_study_plan';
const PLAN_PROGRESS_KEY = '@bom_plan_progress';

export interface StudyPlanDay {
  dayNumber: number;
  book: string;
  startChapter: number;
  endChapter: number;
  completed: boolean;
  completedAt?: number;
}

export interface StudyPlan {
  id: string;
  name: string;
  description: string;
  totalDays: number;
  chaptersPerDay: number;
  days: StudyPlanDay[];
}

export interface ActivePlan {
  planId: string;
  startedAt: number;
  currentDay: number;
  completedDays: number[];
}

// Pre-built study plans
const STUDY_PLANS: Omit<StudyPlan, 'days'>[] = [
  {
    id: '30-day',
    name: '30-Day Challenge',
    description: 'Read the entire Book of Mormon in 30 days (~8 chapters/day)',
    totalDays: 30,
    chaptersPerDay: 8,
  },
  {
    id: '60-day',
    name: '60-Day Journey',
    description: 'A moderate pace through the scriptures (~4 chapters/day)',
    totalDays: 60,
    chaptersPerDay: 4,
  },
  {
    id: '90-day',
    name: '90-Day Study',
    description: 'Take time to ponder as you read (~3 chapters/day)',
    totalDays: 90,
    chaptersPerDay: 3,
  },
  {
    id: '180-day',
    name: '6-Month Deep Dive',
    description: 'In-depth study with time for reflection (~1-2 chapters/day)',
    totalDays: 180,
    chaptersPerDay: 1.5,
  },
  {
    id: '365-day',
    name: 'Year-Long Journey',
    description: 'Read at a leisurely pace throughout the year',
    totalDays: 365,
    chaptersPerDay: 0.7,
  },
];

/**
 * Generate reading schedule for a plan
 */
function generatePlanDays(totalDays: number): StudyPlanDay[] {
  const books = getAllBooks();
  const days: StudyPlanDay[] = [];

  // Build list of all chapters
  const allChapters: { book: string; chapter: number }[] = [];
  books.forEach((book) => {
    for (let ch = 1; ch <= book.chapters; ch++) {
      allChapters.push({ book: book.name, chapter: ch });
    }
  });

  const totalChapters = allChapters.length;
  const chaptersPerDay = Math.ceil(totalChapters / totalDays);

  let chapterIndex = 0;
  for (let day = 1; day <= totalDays && chapterIndex < totalChapters; day++) {
    const startChapter = allChapters[chapterIndex];
    let endChapterIndex = Math.min(chapterIndex + chaptersPerDay - 1, totalChapters - 1);

    // Try to keep same book together for the day if possible
    if (startChapter.book !== allChapters[endChapterIndex]?.book) {
      // Find the last chapter of the starting book within our range
      let lastOfBook = chapterIndex;
      while (
        lastOfBook < endChapterIndex &&
        allChapters[lastOfBook + 1]?.book === startChapter.book
      ) {
        lastOfBook++;
      }

      // If we have at least half the chapters from the starting book, stop there
      if (lastOfBook - chapterIndex >= Math.floor(chaptersPerDay / 2)) {
        endChapterIndex = lastOfBook;
      }
    }

    const endChapter = allChapters[endChapterIndex];

    // Handle spanning multiple books
    if (startChapter.book === endChapter.book) {
      days.push({
        dayNumber: day,
        book: startChapter.book,
        startChapter: startChapter.chapter,
        endChapter: endChapter.chapter,
        completed: false,
      });
    } else {
      // Spanning books - show as range
      days.push({
        dayNumber: day,
        book: `${startChapter.book} - ${endChapter.book}`,
        startChapter: startChapter.chapter,
        endChapter: endChapter.chapter,
        completed: false,
      });
    }

    chapterIndex = endChapterIndex + 1;
  }

  return days;
}

interface UseStudyPlanResult {
  availablePlans: StudyPlan[];
  activePlan: ActivePlan | null;
  currentPlan: StudyPlan | null;
  todaysReading: StudyPlanDay | null;
  loading: boolean;
  startPlan: (planId: string) => Promise<void>;
  completeTodaysReading: () => Promise<void>;
  markDayComplete: (dayNumber: number) => Promise<void>;
  markDayIncomplete: (dayNumber: number) => Promise<void>;
  abandonPlan: () => Promise<void>;
  getDayProgress: () => { completed: number; total: number; percent: number };
}

export function useStudyPlan(): UseStudyPlanResult {
  const [activePlan, setActivePlan] = useState<ActivePlan | null>(null);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate full plan data
  const availablePlans = useMemo((): StudyPlan[] => {
    return STUDY_PLANS.map((plan) => ({
      ...plan,
      days: generatePlanDays(plan.totalDays),
    }));
  }, []);

  // Get current plan details
  const currentPlan = useMemo((): StudyPlan | null => {
    if (!activePlan) return null;
    return availablePlans.find((p) => p.id === activePlan.planId) || null;
  }, [activePlan, availablePlans]);

  // Calculate today's reading based on days since start
  const todaysReading = useMemo((): StudyPlanDay | null => {
    if (!activePlan || !currentPlan) return null;

    const daysSinceStart = Math.floor(
      (Date.now() - activePlan.startedAt) / (1000 * 60 * 60 * 24)
    );
    const currentDayNumber = Math.min(daysSinceStart + 1, currentPlan.totalDays);

    const day = currentPlan.days[currentDayNumber - 1];
    if (!day) return null;

    return {
      ...day,
      completed: completedDays.includes(day.dayNumber),
    };
  }, [activePlan, currentPlan, completedDays]);

  // Load active plan
  useEffect(() => {
    loadActivePlan();
  }, []);

  const loadActivePlan = async () => {
    try {
      const [planData, progressData] = await Promise.all([
        AsyncStorage.getItem(STUDY_PLAN_KEY),
        AsyncStorage.getItem(PLAN_PROGRESS_KEY),
      ]);

      if (planData) {
        setActivePlan(JSON.parse(planData));
      }
      if (progressData) {
        setCompletedDays(JSON.parse(progressData));
      }
    } catch (error) {
      log.error('Failed to load study plan', error);
    } finally {
      setLoading(false);
    }
  };

  const startPlan = useCallback(async (planId: string) => {
    const newPlan: ActivePlan = {
      planId,
      startedAt: Date.now(),
      currentDay: 1,
      completedDays: [],
    };

    try {
      await Promise.all([
        AsyncStorage.setItem(STUDY_PLAN_KEY, JSON.stringify(newPlan)),
        AsyncStorage.setItem(PLAN_PROGRESS_KEY, JSON.stringify([])),
      ]);
      setActivePlan(newPlan);
      setCompletedDays([]);
    } catch (error) {
      log.error('Failed to start study plan', error);
    }
  }, []);

  const markDayComplete = useCallback(
    async (dayNumber: number) => {
      if (completedDays.includes(dayNumber)) return;

      const updated = [...completedDays, dayNumber];
      try {
        await AsyncStorage.setItem(PLAN_PROGRESS_KEY, JSON.stringify(updated));
        setCompletedDays(updated);
      } catch (error) {
        log.error('Failed to mark day complete', error);
      }
    },
    [completedDays]
  );

  const markDayIncomplete = useCallback(
    async (dayNumber: number) => {
      const updated = completedDays.filter((d) => d !== dayNumber);
      try {
        await AsyncStorage.setItem(PLAN_PROGRESS_KEY, JSON.stringify(updated));
        setCompletedDays(updated);
      } catch (error) {
        log.error('Failed to mark day incomplete', error);
      }
    },
    [completedDays]
  );

  const completeTodaysReading = useCallback(async () => {
    if (!todaysReading) return;
    await markDayComplete(todaysReading.dayNumber);
  }, [todaysReading, markDayComplete]);

  const abandonPlan = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STUDY_PLAN_KEY),
        AsyncStorage.removeItem(PLAN_PROGRESS_KEY),
      ]);
      setActivePlan(null);
      setCompletedDays([]);
    } catch (error) {
      log.error('Failed to abandon study plan', error);
    }
  }, []);

  const getDayProgress = useCallback(() => {
    if (!currentPlan) {
      return { completed: 0, total: 0, percent: 0 };
    }
    const completed = completedDays.length;
    const total = currentPlan.totalDays;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percent };
  }, [currentPlan, completedDays]);

  return {
    availablePlans,
    activePlan,
    currentPlan,
    todaysReading,
    loading,
    startPlan,
    completeTodaysReading,
    markDayComplete,
    markDayIncomplete,
    abandonPlan,
    getDayProgress,
  };
}

/**
 * Format reading assignment for display
 */
export function formatReadingAssignment(day: StudyPlanDay): string {
  if (day.startChapter === day.endChapter) {
    return `${day.book} ${day.startChapter}`;
  }
  if (day.book.includes(' - ')) {
    // Spans multiple books
    return day.book;
  }
  return `${day.book} ${day.startChapter}-${day.endChapter}`;
}

/**
 * Get plan duration label
 */
export function getPlanDurationLabel(totalDays: number): string {
  if (totalDays <= 30) return `${totalDays} days`;
  if (totalDays <= 60) return `${Math.round(totalDays / 7)} weeks`;
  if (totalDays <= 365) return `${Math.round(totalDays / 30)} months`;
  return '1 year';
}
