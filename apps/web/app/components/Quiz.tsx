'use client';

import React, { useState } from 'react';
import { CloseIcon, CheckIcon } from './Icons';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  explanation: string;
}

export interface QuizData {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  passingScore: number; // percentage
}

interface QuizProps {
  quiz: QuizData;
  onClose: () => void;
  onComplete?: (score: number, passed: boolean) => void;
}

export function Quiz({ quiz, onClose, onComplete }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    Array(quiz.questions.length).fill(null)
  );
  const [showResults, setShowResults] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const canProceed = selectedAnswers[currentQuestionIndex] !== null;

  const handleSelectAnswer = (optionIndex: number) => {
    if (submitted) return;

    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setShowResults(true);

    // Calculate score
    const correctCount = selectedAnswers.filter(
      (answer, index) => answer === quiz.questions[index].correctAnswer
    ).length;
    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;

    if (onComplete) {
      onComplete(score, passed);
    }
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers(Array(quiz.questions.length).fill(null));
    setShowResults(false);
    setSubmitted(false);
  };

  const calculateScore = () => {
    const correctCount = selectedAnswers.filter(
      (answer, index) => answer === quiz.questions[index].correctAnswer
    ).length;
    return Math.round((correctCount / quiz.questions.length) * 100);
  };

  if (showResults) {
    const score = calculateScore();
    const passed = score >= quiz.passingScore;
    const correctCount = selectedAnswers.filter(
      (answer, index) => answer === quiz.questions[index].correctAnswer
    ).length;

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

          {/* Results */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Score Card */}
            <div className={`rounded-lg p-6 mb-6 text-center ${
              passed ? 'bg-green-500/10' : 'bg-red-500/10'
            }`}>
              <div className="text-6xl font-bold mb-2" style={{ color: passed ? '#10b981' : '#ef4444' }}>
                {score}%
              </div>
              <p className="text-lg font-semibold mb-1" style={{ color: passed ? '#10b981' : '#ef4444' }}>
                {passed ? '✓ Passed!' : '✗ Not Passed'}
              </p>
              <p className="text-[var(--color-text-secondary)]">
                {correctCount} of {quiz.questions.length} correct
                {!passed && ` (${quiz.passingScore}% required to pass)`}
              </p>
            </div>

            {/* Question Review */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                Review Your Answers
              </h3>
              {quiz.questions.map((question, index) => {
                const userAnswer = selectedAnswers[index];
                const isCorrect = userAnswer === question.correctAnswer;

                return (
                  <div
                    key={question.id}
                    className={`rounded-lg p-4 border-2 ${
                      isCorrect
                        ? 'border-green-500 bg-green-500/5'
                        : 'border-red-500 bg-red-500/5'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {isCorrect ? '✓' : '✗'}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[var(--color-text-primary)] mb-2">
                          {index + 1}. {question.question}
                        </p>
                        <p className="text-sm text-[var(--color-text-secondary)] mb-1">
                          Your answer: <span className={isCorrect ? 'text-green-500' : 'text-red-500'}>
                            {question.options[userAnswer!]}
                          </span>
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                            Correct answer: <span className="text-green-500">
                              {question.options[question.correctAnswer]}
                            </span>
                          </p>
                        )}
                        <p className="text-sm text-[var(--color-text-tertiary)] italic">
                          {question.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-[var(--color-border-light)]">
            <button
              onClick={handleRetry}
              className="px-4 py-2 rounded-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
            >
              Close
            </button>
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
              {quiz.title}
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
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
              style={{
                width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
            {currentQuestion.question}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswers[currentQuestionIndex] === index;

              return (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(index)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-[var(--color-border-light)] hover:border-blue-300 hover:bg-[var(--color-bg-secondary)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-[var(--color-border-light)]'
                    }`}>
                      {isSelected && <CheckIcon />}
                    </div>
                    <span className="text-[var(--color-text-primary)]">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Answered Questions Indicator */}
          <div className="mt-6 flex flex-wrap gap-2">
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? 'bg-blue-500 text-white'
                    : selectedAnswers[index] !== null
                    ? 'bg-green-500/20 text-green-500 border-2 border-green-500'
                    : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] border-2 border-[var(--color-border-light)]'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
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
            disabled={!canProceed}
            className={`px-4 py-2 rounded-lg transition-colors ${
              !canProceed
                ? 'bg-blue-500/50 text-white cursor-not-allowed opacity-50'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isLastQuestion ? 'Submit Quiz' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Quiz;
