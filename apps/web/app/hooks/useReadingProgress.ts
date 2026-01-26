import { useState, useEffect } from 'react';
import { ReadingProgress, StudyPlanProgress } from '../lib/types';
import { VolumeId } from '../lib/scriptures';

const STORAGE_PREFIX = 'coc-';

const initialProgress: ReadingProgress = {
  chaptersRead: {},
  currentStreak: 0,
  longestStreak: 0,
  lastReadDate: null,
};

export const useReadingProgress = (volumeId: VolumeId) => {
  const [readingProgress, setReadingProgress] = useState<ReadingProgress>(initialProgress);
  const [studyPlan, setStudyPlan] = useState<StudyPlanProgress | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const load = (key: string) => localStorage.getItem(`${STORAGE_PREFIX}${key}`);

    try {
      if (load('readingProgress')) {
        setReadingProgress(JSON.parse(load('readingProgress')!));
      }
      if (load('studyPlan')) {
        setStudyPlan(JSON.parse(load('studyPlan')!));
      }
    } catch (error) {
      console.error('Error loading reading progress:', error);
    }
  }, []);

  // Save to localStorage whenever values change
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}readingProgress`, JSON.stringify(readingProgress));
  }, [readingProgress]);

  useEffect(() => {
    if (studyPlan) {
      localStorage.setItem(`${STORAGE_PREFIX}studyPlan`, JSON.stringify(studyPlan));
    }
  }, [studyPlan]);

  const markChapterRead = (bookId: string, chapter: number) => {
    const key = `${volumeId}:${bookId}:${chapter}`;
    const today = new Date().toISOString().split('T')[0];

    setReadingProgress(prev => {
      const chaptersRead = { ...prev.chaptersRead, [key]: Date.now() };
      let streak = prev.currentStreak;
      let longest = prev.longestStreak;

      if (prev.lastReadDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        streak = prev.lastReadDate === yesterdayStr ? prev.currentStreak + 1 : 1;
        longest = Math.max(longest, streak);
      }

      return {
        chaptersRead,
        currentStreak: streak,
        longestStreak: longest,
        lastReadDate: today,
      };
    });
  };

  const isChapterRead = (bookId: string, chapter: number): boolean => {
    return !!readingProgress.chaptersRead[`${volumeId}:${bookId}:${chapter}`];
  };

  const startStudyPlan = (planId: string) => {
    setStudyPlan({
      planId,
      startDate: new Date().toISOString().split('T')[0],
      currentDay: 1,
      completedDays: [],
    });
  };

  const completeStudyPlanDay = () => {
    if (!studyPlan) return;

    setStudyPlan(prev =>
      prev
        ? {
            ...prev,
            completedDays: [...prev.completedDays, prev.currentDay],
            currentDay: prev.currentDay + 1,
          }
        : null
    );
  };

  const endStudyPlan = () => {
    setStudyPlan(null);
    localStorage.removeItem(`${STORAGE_PREFIX}studyPlan`);
  };

  return {
    readingProgress,
    setReadingProgress,
    markChapterRead,
    isChapterRead,
    studyPlan,
    startStudyPlan,
    completeStudyPlanDay,
    endStudyPlan,
  };
};
