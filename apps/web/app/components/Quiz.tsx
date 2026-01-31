'use client';

import React, { useState, useCallback } from 'react';
import { CloseIcon } from './Icons';
import { QuizQuestion, type QuizQuestionData } from './QuizQuestion';
import { QuizResults } from './QuizResults';
import { useCourseProgress } from '../contexts/CourseProgressContext';

// Re-export QuizQuestionData for external use
export type { QuizQuestionData };

export interface QuizData {
  questions: QuizQuestionData[];
  passingScore: number; // percentage (e.g., 70)
}

interface QuizProps {
  lessonId: string;
  quiz: QuizData;
  onClose: () => void;
  onComplete?: (score: number, passed: boolean) => void;
}

export function Quiz({ lessonId, quiz, onClose, onComplete }: QuizProps) {
  const { recordQuizScore } = useCourseProgress();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    Array(quiz.questions.length).fill(null)
  );
  const [submittedQuestions, setSubmittedQuestions] = useState<boolean[]>(
    Array(quiz.questions.length).fill(false)
  );
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isCurrentSubmitted = submittedQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const allQuestionsSubmitted = submittedQuestions.every(Boolean);

  const handleSelectAnswer = useCallback((optionIndex: number) => {
    if (isCurrentSubmitted) return;

    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
  }, [currentQuestionIndex, isCurrentSubmitted, selectedAnswers]);

  const handleSubmitQuestion = useCallback(() => {
    if (selectedAnswers[currentQuestionIndex] === null) return;

    const newSubmitted = [...submittedQuestions];
    newSubmitted[currentQuestionIndex] = true;
    setSubmittedQuestions(newSubmitted);
  }, [currentQuestionIndex, selectedAnswers, submittedQuestions]);

  const handleNext = useCallback(() => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (allQuestionsSubmitted) {
      // Calculate and record final score
      const correctCount = selectedAnswers.filter(
        (answer, index) => answer === quiz.questions[index].correctAnswer
      ).length;
      const score = Math.round((correctCount / quiz.questions.length) * 100);
      const passed = score >= quiz.passingScore;

      // Record score to context
      recordQuizScore(lessonId, score, passed);

      // Notify parent
      if (onComplete) {
        onComplete(score, passed);
      }

      setShowResults(true);
    }
  }, [
    currentQuestionIndex,
    isLastQuestion,
    allQuestionsSubmitted,
    selectedAnswers,
    quiz.questions,
    quiz.passingScore,
    lessonId,
    recordQuizScore,
    onComplete,
  ]);

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  }, [currentQuestionIndex]);

  const handleRetry = useCallback(() => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers(Array(quiz.questions.length).fill(null));
    setSubmittedQuestions(Array(quiz.questions.length).fill(false));
    setShowResults(false);
  }, [quiz.questions.length]);

  const handleGoToQuestion = useCallback((index: number) => {
    setCurrentQuestionIndex(index);
  }, []);

  // Calculate progress
  const answeredCount = submittedQuestions.filter(Boolean).length;
  const progressPercentage = (answeredCount / quiz.questions.length) * 100;

  if (showResults) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-light)]">
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
              Quiz Results
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors"
              aria-label="Close quiz"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Results Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <QuizResults
              questions={quiz.questions}
              answers={selectedAnswers}
              passingScore={quiz.passingScore}
              onRetry={handleRetry}
              onClose={onClose}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-light)]">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
              Quiz
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {answeredCount} of {quiz.questions.length} questions answered
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors"
            aria-label="Close quiz"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-4 pt-4">
          <div className="w-full bg-[var(--color-bg-tertiary)] rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <QuizQuestion
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={quiz.questions.length}
            selectedAnswer={selectedAnswers[currentQuestionIndex]}
            onSelectAnswer={handleSelectAnswer}
            onSubmit={handleSubmitQuestion}
            submitted={isCurrentSubmitted}
            showFeedback={isCurrentSubmitted}
          />
        </div>

        {/* Question Navigation Pills */}
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2 justify-center">
            {quiz.questions.map((_, index) => {
              const isAnswered = submittedQuestions[index];
              const isCorrect = isAnswered && selectedAnswers[index] === quiz.questions[index].correctAnswer;
              const isCurrent = index === currentQuestionIndex;

              return (
                <button
                  key={index}
                  onClick={() => handleGoToQuestion(index)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                    isCurrent
                      ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[var(--color-bg-primary)]'
                      : ''
                  } ${
                    isAnswered
                      ? isCorrect
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                      : selectedAnswers[index] !== null
                      ? 'bg-blue-500/20 text-blue-500 border-2 border-blue-500'
                      : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] border-2 border-[var(--color-border-light)]'
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between p-4 border-t border-[var(--color-border-light)]">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentQuestionIndex === 0
                ? 'bg-[var(--color-bg-secondary)] text-[var(--color-text-tertiary)] cursor-not-allowed opacity-50'
                : 'bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]'
            }`}
          >
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={!isCurrentSubmitted}
            className={`px-4 py-2 rounded-lg transition-colors ${
              !isCurrentSubmitted
                ? 'bg-blue-500/50 text-white cursor-not-allowed opacity-50'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isLastQuestion && allQuestionsSubmitted ? 'See Results' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Quiz;
