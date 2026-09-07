'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCoCCourses } from '../hooks/useCoCCourses';
import { CourseCatalog } from './CourseCatalog';
import { CourseDetail } from './CourseDetail';
import useLocalStorage from '../hooks/useLocalStorage';
import { fadeIn } from '../lib/motion';

interface CourseProgress {
  [courseId: string]: {
    started: string;
    lessonsCompleted: string[];
    completed: boolean;
    completedDate: string | null;
    quizScores: {
      [lessonId: string]: {
        score: number;
        passed: boolean;
        attempts: number;
        lastAttempt: string;
      };
    };
  };
}

export function CoursesContainer() {
  const { getCourse } = useCoCCourses();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [courseProgress, setCourseProgress] = useLocalStorage<CourseProgress>(
    'coc-course-progress',
    {}
  );

  const selectedCourse = selectedCourseId ? getCourse(selectedCourseId) : null;

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourseId(courseId);

    // Mark course as started if not already
    if (!courseProgress[courseId]) {
      setCourseProgress({
        ...courseProgress,
        [courseId]: {
          started: new Date().toISOString(),
          lessonsCompleted: [],
          completed: false,
          completedDate: null,
          quizScores: {},
        },
      });
    }
  };

  const handleBack = () => {
    setSelectedCourseId(null);
  };

  const handleLessonComplete = (lessonId: string) => {
    if (!selectedCourseId || !selectedCourse) return;

    const progress = courseProgress[selectedCourseId] || {
      started: new Date().toISOString(),
      lessonsCompleted: [],
      completed: false,
      completedDate: null,
      quizScores: {},
    };

    // Toggle completion
    const isCurrentlyCompleted = progress.lessonsCompleted.includes(lessonId);
    const updatedLessons = isCurrentlyCompleted
      ? progress.lessonsCompleted.filter((id) => id !== lessonId)
      : [...progress.lessonsCompleted, lessonId];

    // Check if all lessons are now completed
    const allCompleted = updatedLessons.length === selectedCourse.lessons.length;

    setCourseProgress({
      ...courseProgress,
      [selectedCourseId]: {
        ...progress,
        lessonsCompleted: updatedLessons,
        completed: allCompleted,
        completedDate: allCompleted ? new Date().toISOString() : null,
      },
    });
  };

  const handleQuizComplete = (lessonId: string, score: number, passed: boolean) => {
    if (!selectedCourseId) return;

    const progress = courseProgress[selectedCourseId] || {
      started: new Date().toISOString(),
      lessonsCompleted: [],
      completed: false,
      completedDate: null,
      quizScores: {},
    };

    const existingQuizData = progress.quizScores[lessonId];
    const attempts = existingQuizData ? existingQuizData.attempts + 1 : 1;

    // Keep the best score across all attempts
    const bestScore = existingQuizData ? Math.max(existingQuizData.score, score) : score;
    const everPassed = existingQuizData?.passed || passed;

    setCourseProgress({
      ...courseProgress,
      [selectedCourseId]: {
        ...progress,
        quizScores: {
          ...progress.quizScores,
          [lessonId]: {
            score: bestScore, // Store best score
            passed: everPassed, // True if ever passed
            attempts,
            lastAttempt: new Date().toISOString(),
          },
        },
      },
    });
  };

  const getCompletedLessons = (courseId: string): string[] => {
    return courseProgress[courseId]?.lessonsCompleted || [];
  };

  const getQuizScores = (courseId: string) => {
    return courseProgress[courseId]?.quizScores || {};
  };

  return (
    <AnimatePresence mode="wait">
      {selectedCourse ? (
        <motion.div
          key="course-detail"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <CourseDetail
            course={selectedCourse}
            onBack={handleBack}
            completedLessons={getCompletedLessons(selectedCourseId!)}
            onLessonComplete={handleLessonComplete}
            quizScores={getQuizScores(selectedCourseId!)}
            onQuizComplete={handleQuizComplete}
          />
        </motion.div>
      ) : (
        <motion.div
          key="course-catalog"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <CourseCatalog onCourseSelect={handleCourseSelect} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CoursesContainer;
