/**
 * QuizResults Component
 *
 * Displays quiz results with score, pass/fail status, and review options
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import type { QuizData } from './Quiz';
import { QuizQuestion } from './QuizQuestion';

interface QuizResultsProps {
  quiz: QuizData;
  answers: (number | null)[];
  score: number; // percentage
  passed: boolean;
  onRetake: () => void;
  onReviewQuestion?: (questionIndex: number) => void;
}

export function QuizResults({
  quiz,
  answers,
  score,
  passed,
  onRetake,
  onReviewQuestion,
}: QuizResultsProps) {
  const { colors } = useTheme();

  const correctCount = answers.filter(
    (answer, index) => answer === quiz.questions[index].correctAnswer
  ).length;

  const getScoreColor = () => {
    if (score >= 90) return '#4CAF50'; // Green
    if (score >= quiz.passingScore) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const getScoreMessage = () => {
    if (score >= 90) return 'Excellent work!';
    if (score >= quiz.passingScore) return 'Good job!';
    return 'Keep studying!';
  };

  const getScoreIcon = () => {
    if (score >= 90) return '🎉';
    if (score >= quiz.passingScore) return '👍';
    return '📚';
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Results Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Quiz Complete!
        </Text>
      </View>

      {/* Score Card */}
      <View
        style={[
          styles.scoreCard,
          {
            backgroundColor: colors.surface,
            borderColor: getScoreColor(),
            borderWidth: 2,
          },
        ]}
      >
        <Text style={styles.scoreIcon}>{getScoreIcon()}</Text>
        <Text
          style={[styles.scoreText, { color: getScoreColor() }]}
        >
          {score}%
        </Text>
        <Text style={[styles.scoreMessage, { color: colors.text }]}>
          {getScoreMessage()}
        </Text>
        <View style={styles.scoreDetails}>
          <Text style={[styles.scoreDetail, { color: colors.textSecondary }]}>
            {correctCount} out of {quiz.questions.length} correct
          </Text>
          <Text
            style={[
              styles.passStatus,
              {
                color: passed ? '#4CAF50' : '#F44336',
                fontWeight: '700',
              },
            ]}
          >
            {passed ? '✓ Passed' : '✗ Not Passed'}
          </Text>
          {!passed && (
            <Text
              style={[styles.passingScoreNote, { color: colors.textSecondary }]}
            >
              Passing score: {quiz.passingScore}%
            </Text>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <Pressable
          style={[
            styles.button,
            styles.primaryButton,
            { backgroundColor: colors.primary },
          ]}
          onPress={onRetake}
        >
          <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
            🔄 Retake Quiz
          </Text>
        </Pressable>
      </View>

      {/* Question Review */}
      <View style={styles.reviewSection}>
        <Text style={[styles.reviewTitle, { color: colors.text }]}>
          Review Your Answers
        </Text>

        {quiz.questions.map((question, index) => {
          const isCorrect = answers[index] === question.correctAnswer;

          return (
            <View key={question.id} style={styles.reviewItem}>
              <View style={styles.reviewItemHeader}>
                <View style={styles.reviewItemHeaderLeft}>
                  <View
                    style={[
                      styles.reviewStatusIcon,
                      {
                        backgroundColor: isCorrect ? '#4CAF5020' : '#F4433620',
                      },
                    ]}
                  >
                    <Text style={styles.reviewStatusIconText}>
                      {isCorrect ? '✓' : '✗'}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.reviewItemTitle,
                      { color: colors.text, fontWeight: '600' },
                    ]}
                  >
                    Question {index + 1}
                  </Text>
                </View>
                {onReviewQuestion && (
                  <Pressable
                    style={[
                      styles.reviewButton,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => onReviewQuestion(index)}
                  >
                    <Text style={[styles.reviewButtonText, { color: colors.primary }]}>
                      Review
                    </Text>
                  </Pressable>
                )}
              </View>

              <View style={styles.reviewItemContent}>
                <QuizQuestion
                  question={question}
                  questionNumber={index + 1}
                  selectedAnswer={answers[index]}
                  onSelectAnswer={() => {}}
                  showExplanation={true}
                  showCorrectAnswer={true}
                />
              </View>
            </View>
          );
        })}
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
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  scoreCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  scoreIcon: {
    fontSize: 64,
  },
  scoreText: {
    fontSize: 56,
    fontWeight: 'bold',
    letterSpacing: -2,
  },
  scoreMessage: {
    fontSize: 20,
    fontWeight: '600',
  },
  scoreDetails: {
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  scoreDetail: {
    fontSize: 16,
  },
  passStatus: {
    fontSize: 18,
    marginTop: 4,
  },
  passingScoreNote: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  actionsContainer: {
    marginBottom: 32,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {},
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  reviewSection: {
    gap: 16,
  },
  reviewTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  reviewItem: {
    gap: 16,
    marginBottom: 24,
  },
  reviewItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewItemHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reviewStatusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewStatusIconText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  reviewItemTitle: {
    fontSize: 16,
  },
  reviewButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  reviewButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewItemContent: {
    paddingLeft: 8,
  },
});
