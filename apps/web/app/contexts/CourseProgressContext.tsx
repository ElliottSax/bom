'use client';

import React, { createContext, useContext, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

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

export interface LessonBookmark {
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  courseTitle: string;
  createdAt: string; // ISO date string
}

export interface LessonNote {
  courseId: string;
  lessonId: string;
  content: string;
  updatedAt: string; // ISO date string
}

export interface LessonNotesState {
  [key: string]: LessonNote; // key is `${courseId}-${lessonId}`
}

export interface LastViewedLesson {
  courseId: string;
  courseTitle: string;
  lessonId: string;
  lessonTitle: string;
  lessonIndex: number;
  timestamp: string; // ISO date string
}

// ============================================================================
// Context Type
// ============================================================================

interface CourseProgressContextType {
  courseProgress: CourseProgressState;
  quizScores: QuizScoresState;
  bookmarks: LessonBookmark[];
  lessonNotes: LessonNotesState;
  lastViewedLesson: LastViewedLesson | null;

  // Course progress functions
  startCourse: (courseId: string) => void;
  isCourseStarted: (courseId: string) => boolean;
  markLessonComplete: (courseId: string, lessonId: string) => void;
  isLessonComplete: (courseId: string, lessonId: string) => boolean;
  getCompletedLessons: (courseId: string) => string[];
  getCourseProgress: (courseId: string) => CourseProgressData | undefined;
  calculateCourseCompletion: (courseId: string, totalLessons: number) => number;
  markCourseComplete: (courseId: string) => void;
  isCourseComplete: (courseId: string) => boolean;

  // Quiz functions
  recordQuizScore: (lessonId: string, score: number, passed: boolean) => void;
  getQuizScore: (lessonId: string) => QuizScore | undefined;

  // Bookmark functions
  addBookmark: (courseId: string, lessonId: string, lessonTitle: string, courseTitle: string) => void;
  removeBookmark: (courseId: string, lessonId: string) => void;
  isBookmarked: (courseId: string, lessonId: string) => boolean;
  toggleBookmark: (courseId: string, lessonId: string, lessonTitle: string, courseTitle: string) => void;

  // Notes functions
  saveNote: (courseId: string, lessonId: string, content: string) => void;
  getNote: (courseId: string, lessonId: string) => LessonNote | undefined;
  deleteNote: (courseId: string, lessonId: string) => void;

  // Last viewed tracking
  setLastViewedLesson: (courseId: string, courseTitle: string, lessonId: string, lessonTitle: string, lessonIndex: number) => void;
}

// ============================================================================
// Context
// ============================================================================

const CourseProgressContext = createContext<CourseProgressContextType | undefined>(undefined);

export const CourseProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courseProgress, setCourseProgress] = useLocalStorage<CourseProgressState>('coc-courseProgress', {});
  const [quizScores, setQuizScores] = useLocalStorage<QuizScoresState>('coc-quizScores', {});
  const [bookmarks, setBookmarks] = useLocalStorage<LessonBookmark[]>('coc-lessonBookmarks', []);
  const [lessonNotes, setLessonNotes] = useLocalStorage<LessonNotesState>('coc-lessonNotes', {});
  const [lastViewedLesson, setLastViewedLessonState] = useLocalStorage<LastViewedLesson | null>('coc-lastViewedLesson', null);

  // ==================== Course Progress Functions ====================

  const startCourse = useCallback((courseId: string) => {
    setCourseProgress((prev) => {
      if (prev[courseId]) {
        // Course already started, don't override
        return prev;
      }
      return {
        ...prev,
        [courseId]: {
          started: new Date().toISOString(),
          lessonsCompleted: [],
          completed: false,
          completedDate: null,
        },
      };
    });
  }, [setCourseProgress]);

  const isCourseStarted = useCallback((courseId: string): boolean => {
    return !!courseProgress[courseId];
  }, [courseProgress]);

  const markLessonComplete = useCallback((courseId: string, lessonId: string) => {
    setCourseProgress((prev) => {
      const course = prev[courseId] || {
        started: new Date().toISOString(),
        lessonsCompleted: [],
        completed: false,
        completedDate: null,
      };

      // Don't add duplicate lesson completions
      if (course.lessonsCompleted.includes(lessonId)) {
        return prev;
      }

      return {
        ...prev,
        [courseId]: {
          ...course,
          lessonsCompleted: [...course.lessonsCompleted, lessonId],
        },
      };
    });
  }, [setCourseProgress]);

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

  const markCourseComplete = useCallback((courseId: string) => {
    setCourseProgress((prev) => {
      const course = prev[courseId];
      if (!course) return prev;

      return {
        ...prev,
        [courseId]: {
          ...course,
          completed: true,
          completedDate: new Date().toISOString(),
        },
      };
    });
  }, [setCourseProgress]);

  const isCourseComplete = useCallback((courseId: string): boolean => {
    const course = courseProgress[courseId];
    return course ? course.completed : false;
  }, [courseProgress]);

  // ==================== Quiz Functions ====================

  const recordQuizScore = useCallback((lessonId: string, score: number, passed: boolean) => {
    setQuizScores((prev) => {
      const existingScore = prev[lessonId];
      return {
        ...prev,
        [lessonId]: {
          score,
          passed,
          attempts: existingScore ? existingScore.attempts + 1 : 1,
          lastAttempt: new Date().toISOString(),
        },
      };
    });
  }, [setQuizScores]);

  const getQuizScore = useCallback((lessonId: string): QuizScore | undefined => {
    return quizScores[lessonId];
  }, [quizScores]);

  // ==================== Bookmark Functions ====================

  const addBookmark = useCallback((courseId: string, lessonId: string, lessonTitle: string, courseTitle: string) => {
    setBookmarks((prev) => {
      // Check if already bookmarked
      const exists = prev.some(b => b.courseId === courseId && b.lessonId === lessonId);
      if (exists) return prev;

      return [
        ...prev,
        {
          courseId,
          lessonId,
          lessonTitle,
          courseTitle,
          createdAt: new Date().toISOString(),
        },
      ];
    });
  }, [setBookmarks]);

  const removeBookmark = useCallback((courseId: string, lessonId: string) => {
    setBookmarks((prev) => prev.filter(b => !(b.courseId === courseId && b.lessonId === lessonId)));
  }, [setBookmarks]);

  const isBookmarked = useCallback((courseId: string, lessonId: string): boolean => {
    return bookmarks.some(b => b.courseId === courseId && b.lessonId === lessonId);
  }, [bookmarks]);

  const toggleBookmark = useCallback((courseId: string, lessonId: string, lessonTitle: string, courseTitle: string) => {
    if (isBookmarked(courseId, lessonId)) {
      removeBookmark(courseId, lessonId);
    } else {
      addBookmark(courseId, lessonId, lessonTitle, courseTitle);
    }
  }, [isBookmarked, removeBookmark, addBookmark]);

  // ==================== Notes Functions ====================

  const saveNote = useCallback((courseId: string, lessonId: string, content: string) => {
    const key = `${courseId}-${lessonId}`;
    setLessonNotes((prev) => ({
      ...prev,
      [key]: {
        courseId,
        lessonId,
        content,
        updatedAt: new Date().toISOString(),
      },
    }));
  }, [setLessonNotes]);

  const getNote = useCallback((courseId: string, lessonId: string): LessonNote | undefined => {
    const key = `${courseId}-${lessonId}`;
    return lessonNotes[key];
  }, [lessonNotes]);

  const deleteNote = useCallback((courseId: string, lessonId: string) => {
    const key = `${courseId}-${lessonId}`;
    setLessonNotes((prev) => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  }, [setLessonNotes]);

  // ==================== Last Viewed Functions ====================

  const setLastViewedLesson = useCallback((
    courseId: string,
    courseTitle: string,
    lessonId: string,
    lessonTitle: string,
    lessonIndex: number
  ) => {
    setLastViewedLessonState({
      courseId,
      courseTitle,
      lessonId,
      lessonTitle,
      lessonIndex,
      timestamp: new Date().toISOString(),
    });
  }, [setLastViewedLessonState]);

  // ==================== Context Value ====================

  const value: CourseProgressContextType = {
    courseProgress,
    quizScores,
    bookmarks,
    lessonNotes,
    lastViewedLesson,
    startCourse,
    isCourseStarted,
    markLessonComplete,
    isLessonComplete,
    getCompletedLessons,
    getCourseProgress,
    calculateCourseCompletion,
    markCourseComplete,
    isCourseComplete,
    recordQuizScore,
    getQuizScore,
    addBookmark,
    removeBookmark,
    isBookmarked,
    toggleBookmark,
    saveNote,
    getNote,
    deleteNote,
    setLastViewedLesson,
  };

  return <CourseProgressContext.Provider value={value}>{children}</CourseProgressContext.Provider>;
};

// ============================================================================
// Hook
// ============================================================================

export const useCourseProgress = () => {
  const context = useContext(CourseProgressContext);
  if (context === undefined) {
    throw new Error('useCourseProgress must be used within a CourseProgressProvider');
  }
  return context;
};
