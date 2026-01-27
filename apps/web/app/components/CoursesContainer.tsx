'use client';

import React, { useState } from 'react';
import { useCoCCourses, type Course } from '../hooks/useCoCCourses';
import { CourseCatalog } from './CourseCatalog';
import { CourseDetail } from './CourseDetail';
import useLocalStorage from '../hooks/useLocalStorage';

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

    setCourseProgress({
      ...courseProgress,
      [selectedCourseId]: {
        ...progress,
        quizScores: {
          ...progress.quizScores,
          [lessonId]: {
            score,
            passed,
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

  if (selectedCourse) {
    return (
      <CourseDetail
        course={selectedCourse}
        onBack={handleBack}
        completedLessons={getCompletedLessons(selectedCourseId!)}
        onLessonComplete={handleLessonComplete}
        quizScores={getQuizScores(selectedCourseId!)}
        onQuizComplete={handleQuizComplete}
      />
    );
  }

  return <CourseCatalog onCourseSelect={handleCourseSelect} />;
}

export default CoursesContainer;
