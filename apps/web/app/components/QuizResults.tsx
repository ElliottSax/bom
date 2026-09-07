'use client';

import React, { useState } from 'react';
import { type QuizQuestionData } from './QuizQuestion';

interface QuizResultsProps {
  questions: QuizQuestionData[];
  answers: (number | null)[];
  passingScore: number;
  onRetry: () => void;
  onClose: () => void;
}

export function QuizResults({
  questions,
  answers,
  passingScore,
  onRetry,
  onClose,
}: QuizResultsProps) {
  const [showMissedOnly, setShowMissedOnly] = useState(false);

  // Calculate results
  const correctCount = answers.filter(
    (answer, index) => answer === questions[index].correctAnswer
  ).length;
  const totalQuestions = questions.length;
  const score = Math.round((correctCount / totalQuestions) * 100);
  const passed = score >= passingScore;

  // Get missed questions
  const missedQuestions = questions.filter(
    (_, index) => answers[index] !== questions[index].correctAnswer
  );

  const questionsToShow = showMissedOnly
    ? questions.filter((_, index) => answers[index] !== questions[index].correctAnswer)
    : questions;

  return (
    <div className="flex flex-col h-full">
      {/* Score Card */}
      <div
        className={`rounded-xl p-8 mb-6 text-center ${
          passed
            ? 'bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30'
            : 'bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30'
        }`}
      >
        {/* Score Circle */}
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-[var(--color-bg-tertiary)]"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              className={passed ? 'text-green-500' : 'text-red-500'}
              strokeDasharray={`${(score / 100) * 352} 352`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-4xl font-bold ${passed ? 'text-green-500' : 'text-red-500'}`}>
              {score}%
            </span>
          </div>
        </div>

        {/* Pass/Fail Badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-semibold mb-2 ${
            passed ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
          }`}
        >
          {passed ? (
            <>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Passed!
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              Not Passed
            </>
          )}
        </div>

        {/* Stats */}
        <p className="text-[var(--color-text-secondary)]">
          {correctCount} of {totalQuestions} questions correct
        </p>
        {!passed && (
          <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
            {passingScore}% required to pass
          </p>
        )}
      </div>

      {/* Review Section */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Review Your Answers
          </h3>
          {missedQuestions.length > 0 && (
            <button
              onClick={() => setShowMissedOnly(!showMissedOnly)}
              className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                showMissedOnly
                  ? 'bg-red-500/10 text-red-500'
                  : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
              }`}
            >
              {showMissedOnly ? 'Show All' : `Show Missed (${missedQuestions.length})`}
            </button>
          )}
        </div>

        {/* Questions Review */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {questionsToShow.map((question) => {
            const originalIndex = questions.indexOf(question);
            const userAnswer = answers[originalIndex];
            const isCorrect = userAnswer === question.correctAnswer;

            return (
              <div
                key={question.id}
                className={`rounded-lg p-4 border-2 ${
                  isCorrect
                    ? 'border-green-500/30 bg-green-500/5'
                    : 'border-red-500/30 bg-red-500/5'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Status Icon */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCorrect ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  >
                    {isCorrect ? (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Question Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--color-text-primary)] mb-2">
                      {originalIndex + 1}. {question.question}
                    </p>

                    {/* Answer Display */}
                    <div className="space-y-1 mb-3">
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        Your answer:{' '}
                        <span
                          className={`font-medium ${isCorrect ? 'text-green-500' : 'text-red-500'}`}
                        >
                          {userAnswer !== null ? question.options[userAnswer] : 'Not answered'}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-[var(--color-text-secondary)]">
                          Correct answer:{' '}
                          <span className="font-medium text-green-500">
                            {question.options[question.correctAnswer]}
                          </span>
                        </p>
                      )}
                    </div>

                    {/* Explanation */}
                    <div className="bg-[var(--color-bg-secondary)] rounded-lg p-3">
                      <p className="text-sm text-[var(--color-text-tertiary)]">
                        <span className="font-medium text-[var(--color-text-secondary)]">
                          Explanation:
                        </span>{' '}
                        {question.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-4 pt-4 mt-4 border-t border-[var(--color-border-light)]">
        <button
          onClick={onRetry}
          className="flex-1 py-3 rounded-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] font-semibold transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={onClose}
          className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
            passed
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {passed ? 'Continue' : 'Close'}
        </button>
      </div>
    </div>
  );
}

export default QuizResults;
