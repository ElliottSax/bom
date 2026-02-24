'use client';

import React, { useState, useMemo } from 'react';
import { useCoCCourses, type Course, type Lesson } from '../hooks/useCoCCourses';
import { useCourseProgress } from '../contexts/CourseProgressContext';
import { ProgressDashboard } from './ProgressDashboard';
import { ContinueLearning } from './ContinueLearning';
import { ThemeToggle } from './ThemeToggle';

interface CourseCatalogProps {
  onCourseSelect: (courseId: string) => void;  // Required, not optional
}

interface SearchResult {
  type: 'course' | 'lesson';
  course: Course;
  lesson?: Lesson;
  matchedField: string;
  matchedText: string;
}

export function CourseCatalog({ onCourseSelect }: CourseCatalogProps) {
  const { courses, loading } = useCoCCourses();
  const { calculateCourseCompletion, isCourseStarted } = useCourseProgress();
  const [searchQuery, setSearchQuery] = useState('');

  const handleCourseClick = (courseId: string) => {
    onCourseSelect(courseId);
  };

  // Search through courses and lessons
  const searchResults = useMemo((): SearchResult[] => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    courses.forEach(course => {
      // Search course title
      if (course.title.toLowerCase().includes(query)) {
        results.push({
          type: 'course',
          course,
          matchedField: 'title',
          matchedText: course.title,
        });
      }
      // Search course description
      else if (course.description.toLowerCase().includes(query)) {
        results.push({
          type: 'course',
          course,
          matchedField: 'description',
          matchedText: course.description.substring(0, 150) + '...',
        });
      }
      // Search course subtitle
      else if (course.subtitle.toLowerCase().includes(query)) {
        results.push({
          type: 'course',
          course,
          matchedField: 'subtitle',
          matchedText: course.subtitle,
        });
      }

      // Search lessons
      course.lessons.forEach(lesson => {
        if (lesson.title.toLowerCase().includes(query)) {
          results.push({
            type: 'lesson',
            course,
            lesson,
            matchedField: 'lesson title',
            matchedText: lesson.title,
          });
        } else if (lesson.description.toLowerCase().includes(query)) {
          results.push({
            type: 'lesson',
            course,
            lesson,
            matchedField: 'lesson description',
            matchedText: lesson.description,
          });
        } else if (lesson.content.toLowerCase().includes(query)) {
          // Find the matching context
          const contentLower = lesson.content.toLowerCase();
          const matchIndex = contentLower.indexOf(query);
          const start = Math.max(0, matchIndex - 50);
          const end = Math.min(lesson.content.length, matchIndex + query.length + 50);
          const matchedText = (start > 0 ? '...' : '') + lesson.content.substring(start, end) + (end < lesson.content.length ? '...' : '');

          results.push({
            type: 'lesson',
            course,
            lesson,
            matchedField: 'lesson content',
            matchedText,
          });
        }
      });
    });

    return results;
  }, [courses, searchQuery]);

  // Filter courses based on search
  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return courses;

    const query = searchQuery.toLowerCase();
    return courses.filter(course =>
      course.title.toLowerCase().includes(query) ||
      course.subtitle.toLowerCase().includes(query) ||
      course.description.toLowerCase().includes(query) ||
      course.lessons.some(lesson =>
        lesson.title.toLowerCase().includes(query) ||
        lesson.description.toLowerCase().includes(query) ||
        lesson.content.toLowerCase().includes(query)
      )
    );
  }, [courses, searchQuery]);

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
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
              Community of Christ Courses
            </h1>
            <p className="text-[var(--color-text-secondary)]">
              Explore authentic CoC study materials and deepen your understanding of Community of Christ identity, history, and theology.
            </p>
          </div>
          <ThemeToggle className="flex-shrink-0 ml-4" />
        </div>
      </div>

      {/* Search Box */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search courses and lessons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-10 rounded-lg border border-[var(--color-border-light)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-tertiary)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Continue Learning */}
      {!searchQuery && (
        <ContinueLearning
          courses={courses}
          onCourseSelect={handleCourseClick}
        />
      )}

      {/* Search Results */}
      {searchQuery && searchResults.length > 0 && (
        <div className="mb-8 bg-[var(--color-bg-secondary)] rounded-lg p-4 border border-[var(--color-border-light)]">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
            Search Results ({searchResults.length})
          </h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {searchResults.slice(0, 10).map((result, index) => (
              <button
                key={`${result.course.id}-${result.lesson?.id || 'course'}-${index}`}
                onClick={() => handleCourseClick(result.course.id)}
                className="w-full text-left p-3 rounded-lg bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-border-light)] transition-colors"
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg" aria-hidden="true">
                    {result.type === 'course' ? result.course.icon : '📖'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-[var(--color-text-primary)]">
                        {result.type === 'lesson' ? result.lesson?.title : result.course.title}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-tertiary)]">
                        {result.matchedField}
                      </span>
                    </div>
                    {result.type === 'lesson' && (
                      <div className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                        in {result.course.title}
                      </div>
                    )}
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1 line-clamp-2">
                      {result.matchedText}
                    </p>
                  </div>
                </div>
              </button>
            ))}
            {searchResults.length > 10 && (
              <p className="text-sm text-[var(--color-text-tertiary)] text-center pt-2">
                Showing 10 of {searchResults.length} results
              </p>
            )}
          </div>
        </div>
      )}

      {/* No Results Message */}
      {searchQuery && filteredCourses.length === 0 && (
        <div className="mb-8 p-8 text-center bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border-light)]">
          <svg
            className="w-12 h-12 mx-auto text-[var(--color-text-tertiary)] mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-1">No courses found</h3>
          <p className="text-[var(--color-text-secondary)]">
            Try a different search term or browse all courses below.
          </p>
        </div>
      )}

      {/* Course Count */}
      {searchQuery && filteredCourses.length > 0 && (
        <div className="mb-4 text-sm text-[var(--color-text-secondary)]">
          Showing {filteredCourses.length} of {courses.length} courses
        </div>
      )}

      {/* Main Content with Progress Dashboard */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Course Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCourses.map((course) => {
          const progressPercentage = calculateCourseCompletion(course.id, course.lessonsCount);
          const isStarted = isCourseStarted(course.id);
          return (
            <CourseCard
              key={course.id}
              course={course}
              onClick={() => handleCourseClick(course.id)}
              progressPercentage={progressPercentage}
              isStarted={isStarted}
              searchQuery={searchQuery}
            />
          );
        })}
          </div>
        </div>

        {/* Progress Dashboard Sidebar */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="lg:sticky lg:top-4">
            <ProgressDashboard courses={courses} />
          </div>
        </div>
      </div>

      {!searchQuery && courses.length === 0 && (
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
  progressPercentage: number;
  isStarted: boolean;
  searchQuery?: string;
}

// Helper function to highlight search matches
function HighlightText({ text, query }: { text: string; query?: string }) {
  if (!query?.trim()) {
    return <>{text}</>;
  }

  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={index} className="bg-yellow-300 dark:bg-yellow-600 px-0.5 rounded">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

function CourseCard({ course, onClick, progressPercentage, isStarted, searchQuery }: CourseCardProps) {
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
        <HighlightText text={course.title} query={searchQuery} />
      </h3>
      <p className="text-sm text-[var(--color-text-secondary)] mb-4">
        <HighlightText text={course.subtitle} query={searchQuery} />
      </p>

      {/* Description */}
      <p className="text-sm text-[var(--color-text-tertiary)] mb-4 line-clamp-3">
        <HighlightText text={course.description} query={searchQuery} />
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

      {/* Progress Bar (if started) */}
      {isStarted && progressPercentage > 0 && (
        <div className="mt-4 pt-4 border-t border-[var(--color-border-light)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">
              Your Progress
            </span>
            <span className="text-xs font-bold text-[var(--color-text-primary)]">
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full bg-[var(--color-bg-tertiary)] rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                progressPercentage === 100
                  ? 'bg-green-500'
                  : 'bg-blue-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          {progressPercentage === 100 && (
            <div className="mt-2 flex items-center gap-1 text-xs text-green-500">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Course Completed!</span>
            </div>
          )}
        </div>
      )}

      {/* Outcomes Preview (if not started) */}
      {!isStarted && course.outcomes.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[var(--color-border-light)]">
          <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-2">
            You&apos;ll learn:
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
