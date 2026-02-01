/**
 * Quiz Component
 *
 * Main quiz container for CoC course lessons
 * Manages quiz state, question progression, and scoring
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { QuizQuestion } from './QuizQuestion';
import { QuizResults } from './QuizResults';

export interface QuizQuestionData {
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
  questions: QuizQuestionData[];
  passingScore: number; // percentage (0-100)
}

interface QuizProps {
  quiz: QuizData;
  onComplete: (score: number, passed: boolean) => void;
  onRetake?: () => void;
}

export function Quiz({ quiz, onComplete, onRetake }: QuizProps) {
  const { colors } = useTheme();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(quiz.questions.length).fill(null)
  );
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const hasAnswer = answers[currentQuestionIndex] !== null;

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Calculate score and show results
      const correctCount = answers.filter(
        (answer, index) => answer === quiz.questions[index].correctAnswer
      ).length;
      const scorePercentage = Math.round(
        (correctCount / quiz.questions.length) * 100
      );
      const passed = scorePercentage >= quiz.passingScore;

      setShowResults(true);
      onComplete(scorePercentage, passed);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleRetake = () => {
    setAnswers(new Array(quiz.questions.length).fill(null));
    setCurrentQuestionIndex(0);
    setShowResults(false);
    onRetake?.();
  };

  const handleReviewQuestion = (questionIndex: number) => {
    setShowResults(false);
    setCurrentQuestionIndex(questionIndex);
  };

  if (showResults) {
    const correctCount = answers.filter(
      (answer, index) => answer === quiz.questions[index].correctAnswer
    ).length;
    const scorePercentage = Math.round(
      (correctCount / quiz.questions.length) * 100
    );
    const passed = scorePercentage >= quiz.passingScore;

    return (
      <QuizResults
        quiz={quiz}
        answers={answers}
        score={scorePercentage}
        passed={passed}
        onRetake={handleRetake}
        onReviewQuestion={handleReviewQuestion}
      />
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Quiz Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{quiz.title}</Text>
        {quiz.description && (
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {quiz.description}
          </Text>
        )}
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </Text>
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.primary,
                width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`,
              },
            ]}
          />
        </View>
      </View>

      {/* Question */}
      <QuizQuestion
        question={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        selectedAnswer={answers[currentQuestionIndex]}
        onSelectAnswer={handleAnswerSelect}
        showExplanation={false}
      />

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        <Pressable
          style={[
            styles.button,
            styles.secondaryButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: currentQuestionIndex === 0 ? 0.5 : 1,
            },
          ]}
          onPress={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>
            Previous
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.button,
            styles.primaryButton,
            {
              backgroundColor: hasAnswer ? colors.primary : colors.border,
              opacity: hasAnswer ? 1 : 0.5,
            },
          ]}
          onPress={handleNext}
          disabled={!hasAnswer}
        >
          <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
            {isLastQuestion ? 'Submit Quiz' : 'Next'}
          </Text>
        </Pressable>
      </View>

      {/* Question Dots Navigation */}
      <View style={styles.dotsContainer}>
        {quiz.questions.map((_, index) => (
          <Pressable
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor:
                  answers[index] !== null
                    ? colors.primary
                    : currentQuestionIndex === index
                      ? colors.border
                      : colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setCurrentQuestionIndex(index)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
    marginBottom: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {},
  secondaryButton: {
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
});
