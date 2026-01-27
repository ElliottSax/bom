'use client';

import React, { useState } from 'react';
import { type Course, type Lesson } from '../hooks/useCoCCourses';
import { ChevronLeftIcon, CheckIcon } from './Icons';
import { LessonViewer } from './LessonViewer';

interface CourseDetailProps {
  course: Course;
  onBack: () => void;
  completedLessons?: string[];
  onLessonComplete?: (lessonId: string) => void;
}

export function CourseDetail({
  course,
  onBack,
  completedLessons = [],
  onLessonComplete,
}: CourseDetailProps) {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number>(0);

  const handleLessonSelect = (lesson: Lesson, index: number) => {
    setSelectedLesson(lesson);
    setCurrentLessonIndex(index);
  };

  const handlePreviousLesson = () => {
    if (currentLessonIndex > 0) {
      const prevIndex = currentLessonIndex - 1;
      setSelectedLesson(course.lessons[prevIndex]);
      setCurrentLessonIndex(prevIndex);
    }
  };

  const handleNextLesson = () => {
    if (currentLessonIndex < course.lessons.length - 1) {
      const nextIndex = currentLessonIndex + 1;
      setSelectedLesson(course.lessons[nextIndex]);
      setCurrentLessonIndex(nextIndex);
    }
  };

  const handleComplete = () => {
    if (selectedLesson && onLessonComplete) {
      onLessonComplete(selectedLesson.id);
    }
  };

  const completedCount = course.lessons.filter((lesson) =>
    completedLessons.includes(lesson.id)
  ).length;
  const progressPercentage = Math.round((completedCount / course.lessons.length) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-6 transition-colors"
      >
        <ChevronLeftIcon />
        Back to Courses
      </button>

      {/* Course Header */}
      <div className="bg-[var(--color-bg-secondary)] rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl" aria-hidden="true">
                {course.icon}
              </span>
              <span
                className={`px-2 py-1 text-xs font-medium rounded ${
                  course.level === 'beginner'
                    ? 'bg-green-500/10 text-green-500'
                    : course.level === 'intermediate'
                    ? 'bg-yellow-500/10 text-yellow-500'
                    : 'bg-red-500/10 text-red-500'
                }`}
              >
                {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
              {course.title}
            </h1>
            <p className="text-lg text-[var(--color-text-secondary)] mb-4">
              {course.subtitle}
            </p>
            <p className="text-[var(--color-text-tertiary)]">
              {course.description}
            </p>
          </div>
        </div>

        {/* Course Stats */}
        <div className="flex items-center gap-6 text-sm text-[var(--color-text-secondary)] border-t border-[var(--color-border-light)] pt-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>{course.lessonsCount} lessons</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              {completedCount} of {course.lessonsCount} completed ({progressPercentage}%)
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        {completedCount > 0 && (
          <div className="mt-4">
            <div className="w-full bg-[var(--color-bg-tertiary)] rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Learning Outcomes */}
      {course.outcomes.length > 0 && (
        <div className="bg-[var(--color-bg-secondary)] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">
            What You'll Learn
          </h2>
          <ul className="space-y-2">
            {course.outcomes.map((outcome, index) => (
              <li key={index} className="flex items-start gap-3 text-[var(--color-text-secondary)]">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{outcome}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Lessons List */}
      <div className="bg-[var(--color-bg-secondary)] rounded-lg p-6">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">
          Course Lessons
        </h2>
        <div className="space-y-2">
          {course.lessons.map((lesson, index) => {
            const isCompleted = completedLessons.includes(lesson.id);
            return (
              <button
                key={lesson.id}
                onClick={() => handleLessonSelect(lesson, index)}
                className="w-full text-left bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-tertiary)] rounded-lg p-4 transition-colors border border-[var(--color-border-light)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex items-start gap-4">
                  {/* Lesson Number / Completion */}
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                        <CheckIcon />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[var(--color-bg-secondary)] border-2 border-[var(--color-border-light)] flex items-center justify-center text-sm font-medium text-[var(--color-text-secondary)]">
                        {index + 1}
                      </div>
                    )}
                  </div>

                  {/* Lesson Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[var(--color-text-primary)] mb-1">
                      {lesson.title}
                    </h3>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-2 line-clamp-2">
                      {lesson.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-[var(--color-text-tertiary)]">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {lesson.duration} min
                      </span>
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded">
                        {lesson.type}
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0 text-[var(--color-text-tertiary)]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lesson Viewer Modal */}
      {selectedLesson && (
        <LessonViewer
          lesson={selectedLesson}
          courseTitle={course.title}
          onClose={() => setSelectedLesson(null)}
          onPrevious={handlePreviousLesson}
          onNext={handleNextLesson}
          hasPrevious={currentLessonIndex > 0}
          hasNext={currentLessonIndex < course.lessons.length - 1}
          onComplete={handleComplete}
          isCompleted={completedLessons.includes(selectedLesson.id)}
        />
      )}
    </div>
  );
}

export default CourseDetail;
