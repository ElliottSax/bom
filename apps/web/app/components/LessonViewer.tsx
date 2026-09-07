'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { type Lesson } from '../hooks/useCoCCourses';
import ReactMarkdown from 'react-markdown';
import { CloseIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';
import { Quiz } from './Quiz';
import { useCourseProgress } from '../contexts/CourseProgressContext';
import { modalOverlay, modalContent, fadeInUp, hoverLift, tapPress } from '../lib/motion';

// Print-friendly HTML template
const generatePrintHTML = (lesson: Lesson, courseTitle: string): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${lesson.title} - ${courseTitle}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Georgia, 'Times New Roman', serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .header {
      border-bottom: 2px solid #333;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .course-title {
      font-size: 14px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    h1 {
      font-size: 28px;
      margin-bottom: 10px;
    }
    .meta {
      font-size: 14px;
      color: #666;
    }
    .description {
      font-size: 16px;
      color: #555;
      margin-bottom: 30px;
      font-style: italic;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 15px;
      color: #222;
      border-bottom: 1px solid #ddd;
      padding-bottom: 5px;
    }
    .objectives-list, .terms-list, .questions-list {
      list-style: none;
      padding-left: 0;
    }
    .objectives-list li {
      padding-left: 25px;
      position: relative;
      margin-bottom: 8px;
    }
    .objectives-list li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #4a7;
    }
    .term {
      margin-bottom: 15px;
    }
    .term-name {
      font-weight: bold;
      color: #222;
    }
    .term-def {
      color: #555;
      margin-top: 3px;
    }
    .questions-list li {
      margin-bottom: 10px;
      padding-left: 25px;
      position: relative;
    }
    .questions-list li:before {
      content: counter(question) ".";
      counter-increment: question;
      position: absolute;
      left: 0;
      font-weight: bold;
      color: #666;
    }
    .questions-list {
      counter-reset: question;
    }
    .content {
      margin-bottom: 30px;
    }
    .content h1 { font-size: 24px; margin: 25px 0 15px 0; }
    .content h2 { font-size: 20px; margin: 20px 0 12px 0; }
    .content h3 { font-size: 17px; margin: 18px 0 10px 0; }
    .content p { margin-bottom: 15px; }
    .content ul, .content ol { margin: 15px 0; padding-left: 30px; }
    .content li { margin-bottom: 8px; }
    .content blockquote {
      border-left: 3px solid #ccc;
      padding-left: 20px;
      margin: 20px 0;
      font-style: italic;
      color: #555;
    }
    .content table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .content th, .content td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
    }
    .content th {
      background: #f5f5f5;
      font-weight: bold;
    }
    .challenge {
      background: #EAF3FB;
      border-left: 4px solid #0075C9;
      padding: 20px;
      margin: 30px 0;
    }
    .challenge-title {
      font-weight: bold;
      color: #0075C9;
      margin-bottom: 10px;
    }
    .resources {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
    }
    .resources a {
      color: #0075C9;
      text-decoration: none;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #333;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="course-title">${courseTitle}</div>
    <h1>${lesson.title}</h1>
    <div class="meta">${lesson.duration} minute read • ${lesson.type}</div>
  </div>

  <div class="description">${lesson.description}</div>

  ${
    lesson.objectives && lesson.objectives.length > 0
      ? `
  <div class="section">
    <div class="section-title">Learning Objectives</div>
    <ul class="objectives-list">
      ${lesson.objectives.map((obj) => `<li>${obj}</li>`).join('')}
    </ul>
  </div>
  `
      : ''
  }

  <div class="section content">
    <div class="section-title">Lesson Content</div>
    ${lesson.content}
  </div>

  ${
    lesson.keyTerms && lesson.keyTerms.length > 0
      ? `
  <div class="section">
    <div class="section-title">Key Terms</div>
    <div class="terms-list">
      ${lesson.keyTerms
        .map(
          (term) => `
        <div class="term">
          <div class="term-name">${term.term}</div>
          <div class="term-def">${term.definition}</div>
        </div>
      `
        )
        .join('')}
    </div>
  </div>
  `
      : ''
  }

  ${
    lesson.discussionQuestions && lesson.discussionQuestions.length > 0
      ? `
  <div class="section">
    <div class="section-title">Discussion Questions</div>
    <ul class="questions-list">
      ${lesson.discussionQuestions.map((q) => `<li>${q}</li>`).join('')}
    </ul>
  </div>
  `
      : ''
  }

  ${
    lesson.applicationChallenge
      ? `
  <div class="challenge">
    <div class="challenge-title">Application Challenge</div>
    <div>${lesson.applicationChallenge}</div>
  </div>
  `
      : ''
  }

  ${
    lesson.historicalMaterials && lesson.historicalMaterials.length > 0
      ? `
  <div class="section resources">
    <div class="section-title">Additional Resources</div>
    <ul>
      ${lesson.historicalMaterials.map((m) => `<li><a href="${m.url}">${m.title}</a></li>`).join('')}
    </ul>
  </div>
  `
      : ''
  }

  <div class="footer">
    Printed from Community of Christ Courses • ${new Date().toLocaleDateString()}
  </div>
</body>
</html>
  `;
};

interface LessonViewerProps {
  lesson: Lesson;
  courseId: string;
  courseTitle: string;
  lessonIndex: number;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  onComplete?: () => void;
  isCompleted?: boolean;
  onQuizComplete?: (score: number, passed: boolean) => void;
  quizScore?: { score: number; passed: boolean } | null;
}

export function LessonViewer({
  lesson,
  courseId,
  courseTitle,
  lessonIndex,
  onClose,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  onComplete,
  isCompleted,
  onQuizComplete,
  quizScore,
}: LessonViewerProps) {
  const [showObjectives, setShowObjectives] = useState(true);
  const [showKeyTerms, setShowKeyTerms] = useState(false);
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  const { isBookmarked, toggleBookmark, getNote, saveNote, setLastViewedLesson } =
    useCourseProgress();
  const bookmarked = isBookmarked(courseId, lesson.id);

  // Track last viewed lesson
  useEffect(() => {
    setLastViewedLesson(courseId, courseTitle, lesson.id, lesson.title, lessonIndex);
  }, [courseId, courseTitle, lesson.id, lesson.title, lessonIndex, setLastViewedLesson]);

  // Load existing note when lesson changes
  useEffect(() => {
    const existingNote = getNote(courseId, lesson.id);
    setNoteContent(existingNote?.content || '');
    setNoteSaved(false);
  }, [courseId, lesson.id, getNote]);

  // Handle note save with debounce feedback
  const handleSaveNote = useCallback(() => {
    saveNote(courseId, lesson.id, noteContent);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  }, [courseId, lesson.id, noteContent, saveNote]);

  // Use inline quiz data from lesson
  const quiz = lesson.quiz;

  // Print handler
  const handlePrint = useCallback(() => {
    const printHTML = generatePrintHTML(lesson, courseTitle);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printHTML);
      printWindow.document.close();
      // Wait for content to load, then trigger print
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  }, [lesson, courseTitle]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle keys when quiz is open or user is typing
      if (
        showQuiz ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          if (hasPrevious && onPrevious) {
            e.preventDefault();
            onPrevious();
          }
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          if (hasNext && onNext) {
            e.preventDefault();
            onNext();
          }
          break;
        case 'p':
        case 'P':
          if (!e.ctrlKey && !e.metaKey) {
            handlePrint();
          }
          break;
        case 'b':
        case 'B':
          if (!e.ctrlKey && !e.metaKey) {
            toggleBookmark(courseId, lesson.id, lesson.title, courseTitle);
          }
          break;
        case 'm':
        case 'M':
          if (!e.ctrlKey && !e.metaKey && onComplete && !isCompleted) {
            onComplete();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    showQuiz,
    onClose,
    hasPrevious,
    onPrevious,
    hasNext,
    onNext,
    handlePrint,
    toggleBookmark,
    courseId,
    lesson.id,
    lesson.title,
    courseTitle,
    onComplete,
    isCompleted,
  ]);

  const handleQuizComplete = (score: number, passed: boolean) => {
    if (onQuizComplete) {
      onQuizComplete(score, passed);
    }
    setShowQuiz(false);
  };

  return (
    <motion.div
      variants={modalOverlay}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        variants={modalContent}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="bg-[var(--color-bg-primary)] rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-light)]">
          <div className="flex-1 min-w-0 mr-4">
            <p className="text-sm text-[var(--color-text-secondary)] mb-1">{courseTitle}</p>
            <h2 className="text-xl font-bold text-[var(--color-text-primary)] truncate">
              {lesson.title}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded">
              {lesson.duration} min
            </span>
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
              aria-label="Print lesson"
              title="Print or export as PDF"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
            </button>
            <button
              onClick={() => toggleBookmark(courseId, lesson.id, lesson.title, courseTitle)}
              className={`p-2 rounded-lg transition-colors ${
                bookmarked
                  ? 'text-gold-500 bg-gold-500/10 hover:bg-gold-500/20'
                  : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-secondary)]'
              }`}
              aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
              title={bookmarked ? 'Remove bookmark' : 'Bookmark this lesson'}
            >
              <svg
                className="w-5 h-5"
                fill={bookmarked ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </button>
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
          <p className="text-[var(--color-text-secondary)] mb-6">{lesson.description}</p>

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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <AnimatePresence>
                {showObjectives && (
                  <motion.ul
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="list-disc list-inside space-y-2 text-[var(--color-text-secondary)] bg-[var(--color-bg-secondary)] p-4 rounded-lg"
                  >
                    {lesson.objectives.map((objective, index) => (
                      <li key={index}>{objective}</li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
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
                  <blockquote className="border-l-4 border-[var(--color-accent)] pl-4 italic text-[var(--color-text-secondary)] bg-[var(--color-bg-secondary)] p-4 my-4 rounded-r-lg">
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
                  <thead className="bg-[var(--color-bg-secondary)]">{children}</thead>
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
                  <strong className="font-bold text-[var(--color-text-primary)]">{children}</strong>
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <AnimatePresence>
                {showKeyTerms && (
                  <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="bg-[var(--color-bg-secondary)] p-4 rounded-lg space-y-3"
                  >
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
                  </motion.div>
                )}
              </AnimatePresence>
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <AnimatePresence>
                {showDiscussion && (
                  <motion.ul
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="bg-[var(--color-bg-secondary)] p-4 rounded-lg space-y-2"
                  >
                    {lesson.discussionQuestions.map((question, index) => (
                      <li
                        key={index}
                        className="text-[var(--color-text-secondary)] flex items-start gap-2"
                      >
                        <span className="text-[var(--color-accent)] font-semibold flex-shrink-0">
                          {index + 1}.
                        </span>
                        <span>{question}</span>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Application Challenge */}
          {lesson.applicationChallenge && (
            <div className="bg-[var(--color-accent)]/10 border-l-4 border-[var(--color-accent)] p-4 rounded-r-lg mb-6">
              <h3 className="text-lg font-semibold text-[var(--color-accent)] mb-2">
                Application Challenge
              </h3>
              <p className="text-[var(--color-text-secondary)]">{lesson.applicationChallenge}</p>
            </div>
          )}

          {/* Personal Notes */}
          <div className="mb-6">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="flex items-center justify-between w-full text-left mb-2"
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">My Notes</h3>
                {noteContent.trim() && (
                  <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-500 rounded">
                    {noteContent.split(/\s+/).filter(Boolean).length} words
                  </span>
                )}
              </div>
              <svg
                className={`w-5 h-5 transition-transform ${showNotes ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {showNotes && (
              <div className="bg-[var(--color-bg-secondary)] p-4 rounded-lg">
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Write your notes, insights, and reflections here..."
                  className="w-full h-40 p-3 rounded-lg border border-[var(--color-border-light)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    Notes are saved locally on your device
                  </p>
                  <div className="flex items-center gap-2">
                    {noteSaved && (
                      <span className="text-sm text-green-500 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Saved!
                      </span>
                    )}
                    <button
                      onClick={handleSaveNote}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Save Notes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quiz Section */}
          {quiz && quiz.questions && quiz.questions.length > 0 && (
            <div className="bg-gradient-to-r from-[var(--color-accent)]/10 to-[var(--color-accent-light)]/10 border-2 border-[var(--color-accent)]/20 rounded-lg p-6 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <svg
                      className="w-6 h-6 text-[var(--color-accent)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <h3 className="text-xl font-bold text-[var(--color-text-primary)]">
                      Test Your Knowledge
                    </h3>
                  </div>
                  <p className="text-[var(--color-text-secondary)] mb-1">
                    Take a short quiz to test your understanding of this lesson.
                  </p>
                  <p className="text-sm text-[var(--color-text-tertiary)]">
                    {quiz.questions.length} questions - {quiz.passingScore}% to pass
                  </p>

                  {quizScore && (
                    <div
                      className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                        quizScore.passed
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-red-500/10 text-red-500'
                      }`}
                    >
                      <span className="font-semibold">
                        {quizScore.passed ? 'Passed' : 'Not Passed'}
                      </span>
                      <span className="text-sm">({quizScore.score}%)</span>
                    </div>
                  )}
                </div>
                <motion.button
                  whileHover={hoverLift}
                  whileTap={tapPress}
                  onClick={() => setShowQuiz(true)}
                  className="px-6 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-light)] text-white font-semibold rounded-lg transition-colors"
                >
                  {quizScore ? 'Retake Quiz' : 'Take Quiz'}
                </motion.button>
              </div>
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
                      className="text-[var(--color-accent)] hover:text-[var(--color-accent-light)] hover:underline flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
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
        <div className="border-t border-[var(--color-border-light)]">
          <div className="flex items-center justify-between p-4">
            <motion.button
              whileHover={hasPrevious ? hoverLift : undefined}
              whileTap={hasPrevious ? tapPress : undefined}
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
            </motion.button>

            <div className="flex items-center gap-3">
              {onComplete && (
                <motion.button
                  whileHover={isCompleted ? undefined : hoverLift}
                  whileTap={isCompleted ? undefined : tapPress}
                  onClick={onComplete}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isCompleted
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-light)]'
                  }`}
                >
                  {isCompleted ? '✓ Completed' : 'Mark Complete'}
                </motion.button>
              )}
            </div>

            <motion.button
              whileHover={hasNext ? hoverLift : undefined}
              whileTap={hasNext ? tapPress : undefined}
              onClick={onNext}
              disabled={!hasNext}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                hasNext
                  ? 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-light)] text-white'
                  : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-tertiary)] cursor-not-allowed opacity-50'
              }`}
            >
              Next
              <ChevronRightIcon />
            </motion.button>
          </div>
          {/* Keyboard shortcuts hint */}
          <div className="px-4 pb-3 text-center">
            <p className="text-xs text-[var(--color-text-tertiary)]">
              <span className="hidden sm:inline">Keyboard shortcuts: </span>
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-[var(--color-bg-tertiary)] rounded text-[10px]">
                  ←
                </kbd>
                <kbd className="px-1.5 py-0.5 bg-[var(--color-bg-tertiary)] rounded text-[10px]">
                  →
                </kbd>
                <span className="mx-1">navigate</span>
              </span>
              <span className="mx-2 hidden sm:inline">•</span>
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-[var(--color-bg-tertiary)] rounded text-[10px]">
                  B
                </kbd>
                <span className="mx-1">bookmark</span>
              </span>
              <span className="mx-2 hidden sm:inline">•</span>
              <span className="inline-flex items-center gap-1 hidden sm:inline-flex">
                <kbd className="px-1.5 py-0.5 bg-[var(--color-bg-tertiary)] rounded text-[10px]">
                  P
                </kbd>
                <span className="mx-1">print</span>
              </span>
              <span className="mx-2 hidden md:inline">•</span>
              <span className="inline-flex items-center gap-1 hidden md:inline-flex">
                <kbd className="px-1.5 py-0.5 bg-[var(--color-bg-tertiary)] rounded text-[10px]">
                  Esc
                </kbd>
                <span className="mx-1">close</span>
              </span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quiz Modal */}
      {showQuiz && quiz && (
        <Quiz
          lessonId={lesson.id}
          quiz={quiz}
          onClose={() => setShowQuiz(false)}
          onComplete={handleQuizComplete}
        />
      )}
    </motion.div>
  );
}

export default LessonViewer;
