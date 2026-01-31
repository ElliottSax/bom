'use client';

import React from 'react';
import { useCourseProgress } from '../contexts/CourseProgressContext';
import { type Course } from '../hooks/useCoCCourses';

interface ContinueLearningProps {
  courses: Course[];
  onCourseSelect: (courseId: string) => void;
  onLessonSelect?: (courseId: string, lessonIndex: number) => void;
}

export function ContinueLearning({ courses, onCourseSelect, onLessonSelect }: ContinueLearningProps) {
  const { lastViewedLesson, calculateCourseCompletion } = useCourseProgress();

  if (!lastViewedLesson) {
    return null;
  }

  // Check if the course still exists
  const course = courses.find(c => c.id === lastViewedLesson.courseId);
  if (!course) {
    return null;
  }

  // Calculate time since last viewed
  const lastViewedDate = new Date(lastViewedLesson.timestamp);
  const now = new Date();
  const diffMs = now.getTime() - lastViewedDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  let timeAgo = '';
  if (diffDays > 0) {
    timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMins > 0) {
    timeAgo = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  } else {
    timeAgo = 'Just now';
  }

  const progressPercentage = calculateCourseCompletion(course.id, course.lessonsCount);
  const nextLessonIndex = Math.min(lastViewedLesson.lessonIndex + 1, course.lessons.length - 1);
  const isLastLesson = lastViewedLesson.lessonIndex === course.lessons.length - 1;

  const handleContinue = () => {
    if (onLessonSelect) {
      // If we can directly select a lesson, go to next or current
      onLessonSelect(course.id, isLastLesson ? lastViewedLesson.lessonIndex : nextLessonIndex);
    } else {
      // Otherwise just go to the course
      onCourseSelect(course.id);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-6 mb-6">
      <div className="flex items-start gap-4">
        {/* Course Icon */}
        <div className="text-4xl flex-shrink-0">{course.icon}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-blue-500 dark:text-blue-400">
              Continue Learning
            </span>
            <span className="text-xs text-[var(--color-text-tertiary)]">
              • {timeAgo}
            </span>
          </div>

          <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-1 truncate">
            {course.title}
          </h3>

          <p className="text-sm text-[var(--color-text-secondary)] mb-3">
            {isLastLesson ? (
              <>Last lesson: <span className="font-medium">{lastViewedLesson.lessonTitle}</span></>
            ) : (
              <>Up next: <span className="font-medium">{course.lessons[nextLessonIndex]?.title || lastViewedLesson.lessonTitle}</span></>
            )}
          </p>

          {/* Progress Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-[var(--color-bg-tertiary)] rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="text-xs text-[var(--color-text-secondary)] flex-shrink-0">
              {progressPercentage}% complete
            </span>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors flex-shrink-0"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          Continue
        </button>
      </div>
    </div>
  );
}

export default ContinueLearning;
