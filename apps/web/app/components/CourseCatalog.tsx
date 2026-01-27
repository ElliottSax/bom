'use client';

import React from 'react';
import { useCoCCourses, type Course } from '../hooks/useCoCCourses';

interface CourseCatalogProps {
  onCourseSelect: (courseId: string) => void;  // Required, not optional
}

export function CourseCatalog({ onCourseSelect }: CourseCatalogProps) {
  const { courses, loading } = useCoCCourses();

  const handleCourseClick = (courseId: string) => {
    onCourseSelect(courseId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[var(--color-text-secondary)]">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
          Community of Christ Courses
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          Explore authentic CoC study materials and deepen your understanding of Community of Christ identity, history, and theology.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onClick={() => handleCourseClick(course.id)}
          />
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[var(--color-text-secondary)] text-lg">
            No courses available yet. Check back soon!
          </p>
        </div>
      )}
    </div>
  );
}

interface CourseCardProps {
  course: Course;
  onClick: () => void;
}

function CourseCard({ course, onClick }: CourseCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] rounded-lg p-6 text-left transition-all duration-200 hover:shadow-lg border border-[var(--color-border-light)] focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {/* Icon and Level Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl" aria-hidden="true">
          {course.icon}
        </div>
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

      {/* Title and Subtitle */}
      <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
        {course.title}
      </h3>
      <p className="text-sm text-[var(--color-text-secondary)] mb-4">
        {course.subtitle}
      </p>

      {/* Description */}
      <p className="text-sm text-[var(--color-text-tertiary)] mb-4 line-clamp-3">
        {course.description}
      </p>

      {/* Course Stats */}
      <div className="flex items-center gap-4 text-xs text-[var(--color-text-secondary)] border-t border-[var(--color-border-light)] pt-4">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span>{course.lessonsCount} lessons</span>
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{course.duration}</span>
        </div>
      </div>

      {/* Outcomes Preview */}
      {course.outcomes.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[var(--color-border-light)]">
          <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-2">
            You'll learn:
          </p>
          <ul className="text-xs text-[var(--color-text-tertiary)] space-y-1">
            {course.outcomes.slice(0, 2).map((outcome, index) => (
              <li key={index} className="flex items-start gap-2">
                <svg className="w-3 h-3 mt-0.5 flex-shrink-0 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="line-clamp-1">{outcome}</span>
              </li>
            ))}
            {course.outcomes.length > 2 && (
              <li className="text-[var(--color-text-secondary)]">
                +{course.outcomes.length - 2} more...
              </li>
            )}
          </ul>
        </div>
      )}
    </button>
  );
}

export default CourseCatalog;
