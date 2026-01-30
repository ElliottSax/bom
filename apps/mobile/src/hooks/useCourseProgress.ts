/**
 * Course Progress Hook for Mobile
 *
 * Manages course and lesson progress tracking using AsyncStorage.
 * Mobile-compatible version of the web CourseProgressContext.
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';

const log = logger.scope('CourseProgress');

// ============================================================================
// Types
// ============================================================================

export interface CourseProgressData {
  started: string; // ISO date string
  lessonsCompleted: string[]; // Array of lesson IDs
  completed: boolean;
  completedDate: string | null; // ISO date string or null
}

export interface QuizScore {
  score: number;
  passed: boolean;
  attempts: number;
  lastAttempt: string; // ISO date string
}

export interface CourseProgressState {
  [courseId: string]: CourseProgressData;
}

export interface QuizScoresState {
  [lessonId: string]: QuizScore;
}

// ============================================================================
// Storage Keys
// ============================================================================

const COURSE_PROGRESS_KEY = '@coc-courseProgress';
const QUIZ_SCORES_KEY = '@coc-quizScores';

// ============================================================================
// Hook
// ============================================================================

export function useCourseProgress() {
  const [courseProgress, setCourseProgress] = useState<CourseProgressState>({});
  const [quizScores, setQuizScores] = useState<QuizScoresState>({});
  const [loading, setLoading] = useState(true);

  // Load data from AsyncStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [progressData, scoresData] = await Promise.all([
          AsyncStorage.getItem(COURSE_PROGRESS_KEY),
          AsyncStorage.getItem(QUIZ_SCORES_KEY),
        ]);

        if (progressData) {
          setCourseProgress(JSON.parse(progressData));
        }
        if (scoresData) {
          setQuizScores(JSON.parse(scoresData));
        }
      } catch (error) {
        log.error('Error loading course progress', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Save course progress to AsyncStorage
  const saveCourseProgress = useCallback(async (newProgress: CourseProgressState) => {
    try {
      await AsyncStorage.setItem(COURSE_PROGRESS_KEY, JSON.stringify(newProgress));
      setCourseProgress(newProgress);
    } catch (error) {
      log.error('Error saving course progress', error);
    }
  }, []);

  // Save quiz scores to AsyncStorage
  const saveQuizScores = useCallback(async (newScores: QuizScoresState) => {
    try {
      await AsyncStorage.setItem(QUIZ_SCORES_KEY, JSON.stringify(newScores));
      setQuizScores(newScores);
    } catch (error) {
      log.error('Error saving quiz scores', error);
    }
  }, []);

  // ==================== Course Progress Functions ====================

  const startCourse = useCallback(async (courseId: string) => {
    if (courseProgress[courseId]) {
      // Course already started, don't override
      return;
    }

    const newProgress = {
      ...courseProgress,
      [courseId]: {
        started: new Date().toISOString(),
        lessonsCompleted: [],
        completed: false,
        completedDate: null,
      },
    };

    await saveCourseProgress(newProgress);
  }, [courseProgress, saveCourseProgress]);

  const isCourseStarted = useCallback((courseId: string): boolean => {
    return !!courseProgress[courseId];
  }, [courseProgress]);

  const markLessonComplete = useCallback(async (courseId: string, lessonId: string) => {
    const course = courseProgress[courseId] || {
      started: new Date().toISOString(),
      lessonsCompleted: [],
      completed: false,
      completedDate: null,
    };

    // Don't add duplicate lesson completions
    if (course.lessonsCompleted.includes(lessonId)) {
      return;
    }

    const newProgress = {
      ...courseProgress,
      [courseId]: {
        ...course,
        lessonsCompleted: [...course.lessonsCompleted, lessonId],
      },
    };

    await saveCourseProgress(newProgress);
  }, [courseProgress, saveCourseProgress]);

  const isLessonComplete = useCallback((courseId: string, lessonId: string): boolean => {
    const course = courseProgress[courseId];
    return course ? course.lessonsCompleted.includes(lessonId) : false;
  }, [courseProgress]);

  const getCompletedLessons = useCallback((courseId: string): string[] => {
    const course = courseProgress[courseId];
    return course ? course.lessonsCompleted : [];
  }, [courseProgress]);

  const getCourseProgress = useCallback((courseId: string): CourseProgressData | undefined => {
    return courseProgress[courseId];
  }, [courseProgress]);

  const calculateCourseCompletion = useCallback((courseId: string, totalLessons: number): number => {
    const course = courseProgress[courseId];
    if (!course || totalLessons === 0) return 0;
    return Math.round((course.lessonsCompleted.length / totalLessons) * 100);
  }, [courseProgress]);

  const markCourseComplete = useCallback(async (courseId: string) => {
    const course = courseProgress[courseId];
    if (!course) return;

    const newProgress = {
      ...courseProgress,
      [courseId]: {
        ...course,
        completed: true,
        completedDate: new Date().toISOString(),
      },
    };

    await saveCourseProgress(newProgress);
  }, [courseProgress, saveCourseProgress]);

  const isCourseComplete = useCallback((courseId: string): boolean => {
    const course = courseProgress[courseId];
    return course ? course.completed : false;
  }, [courseProgress]);

  // ==================== Quiz Functions ====================

  const recordQuizScore = useCallback(async (lessonId: string, score: number, passed: boolean) => {
    const existingScore = quizScores[lessonId];
    const newScores = {
      ...quizScores,
      [lessonId]: {
        score,
        passed,
        attempts: existingScore ? existingScore.attempts + 1 : 1,
        lastAttempt: new Date().toISOString(),
      },
    };

    await saveQuizScores(newScores);
  }, [quizScores, saveQuizScores]);

  const getQuizScore = useCallback((lessonId: string): QuizScore | undefined => {
    return quizScores[lessonId];
  }, [quizScores]);

  // ==================== Utility Functions ====================

  const resetCourseProgress = useCallback(async (courseId: string) => {
    const newProgress = { ...courseProgress };
    delete newProgress[courseId];
    await saveCourseProgress(newProgress);
  }, [courseProgress, saveCourseProgress]);

  const resetAllProgress = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(COURSE_PROGRESS_KEY),
        AsyncStorage.removeItem(QUIZ_SCORES_KEY),
      ]);
      setCourseProgress({});
      setQuizScores({});
    } catch (error) {
      log.error('Error resetting progress', error);
    }
  }, []);

  const getOverallStats = useCallback(() => {
    const courseIds = Object.keys(courseProgress);
    const totalCourses = courseIds.length;
    const completedCourses = courseIds.filter(id => courseProgress[id].completed).length;
    const totalLessonsCompleted = courseIds.reduce(
      (sum, id) => sum + courseProgress[id].lessonsCompleted.length,
      0
    );
    const totalQuizzesTaken = Object.keys(quizScores).length;
    const quizzesPassed = Object.values(quizScores).filter(q => q.passed).length;

    return {
      totalCourses,
      completedCourses,
      totalLessonsCompleted,
      totalQuizzesTaken,
      quizzesPassed,
    };
  }, [courseProgress, quizScores]);

  return {
    // State
    courseProgress,
    quizScores,
    loading,

    // Course progress functions
    startCourse,
    isCourseStarted,
    markLessonComplete,
    isLessonComplete,
    getCompletedLessons,
    getCourseProgress,
    calculateCourseCompletion,
    markCourseComplete,
    isCourseComplete,

    // Quiz functions
    recordQuizScore,
    getQuizScore,

    // Utility functions
    resetCourseProgress,
    resetAllProgress,
    getOverallStats,
  };
}
