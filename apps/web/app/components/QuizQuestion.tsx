'use client';

import React, { useState } from 'react';
import { CheckIcon } from './Icons';

export interface QuizQuestionData {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  explanation: string;
}

interface QuizQuestionProps {
  question: QuizQuestionData;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  onSelectAnswer: (optionIndex: number) => void;
  onSubmit: () => void;
  submitted: boolean;
  showFeedback: boolean;
}

export function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  onSubmit,
  submitted,
  showFeedback,
}: QuizQuestionProps) {
  const isCorrect = selectedAnswer === question.correctAnswer;
  const canSubmit = selectedAnswer !== null && !submitted;

  return (
    <div className="flex flex-col h-full">
      {/* Question Header */}
      <div className="mb-6">
        <p className="text-sm text-[var(--color-text-secondary)] mb-2">
          Question {questionNumber} of {totalQuestions}
        </p>
        <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
          {question.question}
        </h3>
      </div>

      {/* Options */}
      <div className="space-y-3 flex-1">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrectOption = index === question.correctAnswer;

          // Determine styling based on state
          let optionStyle = '';
          let iconStyle = '';

          if (showFeedback && submitted) {
            if (isCorrectOption) {
              optionStyle = 'border-green-500 bg-green-500/10';
              iconStyle = 'border-green-500 bg-green-500';
            } else if (isSelected && !isCorrectOption) {
              optionStyle = 'border-red-500 bg-red-500/10';
              iconStyle = 'border-red-500 bg-red-500';
            } else {
              optionStyle = 'border-[var(--color-border-light)] opacity-50';
              iconStyle = 'border-[var(--color-border-light)]';
            }
          } else if (isSelected) {
            optionStyle = 'border-blue-500 bg-blue-500/10';
            iconStyle = 'border-blue-500 bg-blue-500';
          } else {
            optionStyle = 'border-[var(--color-border-light)] hover:border-blue-300 hover:bg-[var(--color-bg-secondary)]';
            iconStyle = 'border-[var(--color-border-light)]';
          }

          return (
            <button
              key={index}
              onClick={() => !submitted && onSelectAnswer(index)}
              disabled={submitted}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${optionStyle} ${
                submitted ? 'cursor-default' : 'cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${iconStyle}`}>
                  {showFeedback && submitted && isCorrectOption && (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {showFeedback && submitted && isSelected && !isCorrectOption && (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                  {(!showFeedback || !submitted) && isSelected && (
                    <div className="w-3 h-3 rounded-full bg-white" />
                  )}
                </div>
                <span className={`text-[var(--color-text-primary)] ${
                  showFeedback && submitted && !isCorrectOption && !isSelected ? 'opacity-50' : ''
                }`}>
                  {option}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Feedback Section */}
      {showFeedback && submitted && (
        <div className={`mt-6 p-4 rounded-lg ${
          isCorrect
            ? 'bg-green-500/10 border-l-4 border-green-500'
            : 'bg-red-500/10 border-l-4 border-red-500'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
              isCorrect ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {isCorrect ? (
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className={`font-semibold mb-1 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </p>
              {!isCorrect && (
                <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                  The correct answer is: <span className="font-medium text-green-500">{question.options[question.correctAnswer]}</span>
                </p>
              )}
              <p className="text-sm text-[var(--color-text-tertiary)]">
                {question.explanation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button (only shown when answer selected but not yet submitted) */}
      {!submitted && (
        <div className="mt-6">
          <button
            onClick={onSubmit}
            disabled={!canSubmit}
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
              canSubmit
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)] cursor-not-allowed'
            }`}
          >
            Submit Answer
          </button>
        </div>
      )}
    </div>
  );
}

export default QuizQuestion;
