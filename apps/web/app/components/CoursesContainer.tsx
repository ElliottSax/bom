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

  const getCompletedLessons = (courseId: string): string[] => {
    return courseProgress[courseId]?.lessonsCompleted || [];
  };

  if (selectedCourse) {
    return (
      <CourseDetail
        course={selectedCourse}
        onBack={handleBack}
        completedLessons={getCompletedLessons(selectedCourseId!)}
        onLessonComplete={handleLessonComplete}
      />
    );
  }

  return <CourseCatalog onCourseSelect={handleCourseSelect} />;
}

export default CoursesContainer;
