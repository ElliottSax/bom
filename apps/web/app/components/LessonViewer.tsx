'use client';

import React, { useState } from 'react';
import { type Lesson } from '../hooks/useCoCCourses';
import ReactMarkdown from 'react-markdown';
import { CloseIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface LessonViewerProps {
  lesson: Lesson;
  courseTitle: string;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  onComplete?: () => void;
  isCompleted?: boolean;
}

export function LessonViewer({
  lesson,
  courseTitle,
  onClose,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  onComplete,
  isCompleted,
}: LessonViewerProps) {
  const [showObjectives, setShowObjectives] = useState(true);
  const [showKeyTerms, setShowKeyTerms] = useState(false);
  const [showDiscussion, setShowDiscussion] = useState(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-light)]">
          <div className="flex-1 min-w-0 mr-4">
            <p className="text-sm text-[var(--color-text-secondary)] mb-1">
              {courseTitle}
            </p>
            <h2 className="text-xl font-bold text-[var(--color-text-primary)] truncate">
              {lesson.title}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs bg-blue-500/10 text-blue-500 rounded">
              {lesson.duration} min
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors"
              aria-label="Close lesson"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Description */}
          <p className="text-[var(--color-text-secondary)] mb-6">
            {lesson.description}
          </p>

          {/* Objectives */}
          {lesson.objectives && lesson.objectives.length > 0 && (
            <div className="mb-6">
              <button
                onClick={() => setShowObjectives(!showObjectives)}
                className="flex items-center justify-between w-full text-left mb-2"
              >
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                  Learning Objectives
                </h3>
                <svg
                  className={`w-5 h-5 transition-transform ${showObjectives ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showObjectives && (
                <ul className="list-disc list-inside space-y-2 text-[var(--color-text-secondary)] bg-[var(--color-bg-secondary)] p-4 rounded-lg">
                  {lesson.objectives.map((objective, index) => (
                    <li key={index}>{objective}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Main Content */}
          <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none mb-8">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] mt-8 mb-4 first:mt-0">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl md:text-2xl font-bold text-[var(--color-text-primary)] mt-6 mb-3">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg md:text-xl font-semibold text-[var(--color-text-primary)] mt-4 mb-2">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-[var(--color-text-secondary)] mb-4 leading-relaxed">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-2 text-[var(--color-text-secondary)] mb-4 ml-4">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-2 text-[var(--color-text-secondary)] mb-4 ml-4">
                    {children}
                  </ol>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-500 pl-4 italic text-[var(--color-text-secondary)] bg-[var(--color-bg-secondary)] p-4 my-4 rounded-r-lg">
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full divide-y divide-[var(--color-border-light)]">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-[var(--color-bg-secondary)]">
                    {children}
                  </thead>
                ),
                th: ({ children }) => (
                  <th className="px-4 py-2 text-left text-xs font-medium text-[var(--color-text-primary)] uppercase tracking-wider">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-2 text-sm text-[var(--color-text-secondary)] border-t border-[var(--color-border-light)]">
                    {children}
                  </td>
                ),
                strong: ({ children }) => (
                  <strong className="font-bold text-[var(--color-text-primary)]">
                    {children}
                  </strong>
                ),
              }}
            >
              {lesson.content}
            </ReactMarkdown>
          </div>

          {/* Key Terms */}
          {lesson.keyTerms && lesson.keyTerms.length > 0 && (
            <div className="mb-6">
              <button
                onClick={() => setShowKeyTerms(!showKeyTerms)}
                className="flex items-center justify-between w-full text-left mb-2"
              >
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                  Key Terms
                </h3>
                <svg
                  className={`w-5 h-5 transition-transform ${showKeyTerms ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showKeyTerms && (
                <div className="bg-[var(--color-bg-secondary)] p-4 rounded-lg space-y-3">
                  {lesson.keyTerms.map((term, index) => (
                    <div key={index}>
                      <dt className="font-semibold text-[var(--color-text-primary)] mb-1">
                        {term.term}
                      </dt>
                      <dd className="text-sm text-[var(--color-text-secondary)]">
                        {term.definition}
                      </dd>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Discussion Questions */}
          {lesson.discussionQuestions && lesson.discussionQuestions.length > 0 && (
            <div className="mb-6">
              <button
                onClick={() => setShowDiscussion(!showDiscussion)}
                className="flex items-center justify-between w-full text-left mb-2"
              >
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                  Discussion Questions
                </h3>
                <svg
                  className={`w-5 h-5 transition-transform ${showDiscussion ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showDiscussion && (
                <ul className="bg-[var(--color-bg-secondary)] p-4 rounded-lg space-y-2">
                  {lesson.discussionQuestions.map((question, index) => (
                    <li key={index} className="text-[var(--color-text-secondary)] flex items-start gap-2">
                      <span className="text-blue-500 font-semibold flex-shrink-0">
                        {index + 1}.
                      </span>
                      <span>{question}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Application Challenge */}
          {lesson.applicationChallenge && (
            <div className="bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <h3 className="text-lg font-semibold text-blue-500 mb-2">
                Application Challenge
              </h3>
              <p className="text-[var(--color-text-secondary)]">
                {lesson.applicationChallenge}
              </p>
            </div>
          )}

          {/* Historical Materials */}
          {lesson.historicalMaterials && lesson.historicalMaterials.length > 0 && (
            <div className="mt-6 p-4 bg-[var(--color-bg-secondary)] rounded-lg">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
                Additional Resources
              </h3>
              <ul className="space-y-2">
                {lesson.historicalMaterials.map((material, index) => (
                  <li key={index}>
                    <a
                      href={material.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600 hover:underline flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      {material.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-[var(--color-border-light)]">
          <button
            onClick={onPrevious}
            disabled={!hasPrevious}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              hasPrevious
                ? 'bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]'
                : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-tertiary)] cursor-not-allowed opacity-50'
            }`}
          >
            <ChevronLeftIcon />
            Previous
          </button>

          <div className="flex items-center gap-3">
            {onComplete && (
              <button
                onClick={onComplete}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isCompleted
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isCompleted ? '✓ Completed' : 'Mark Complete'}
              </button>
            )}
          </div>

          <button
            onClick={onNext}
            disabled={!hasNext}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              hasNext
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-tertiary)] cursor-not-allowed opacity-50'
            }`}
          >
            Next
            <ChevronRightIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

export default LessonViewer;
