/**
 * QuizQuestion Component
 *
 * Displays a single quiz question with multiple choice options
 * Supports showing explanations after answering
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import type { QuizQuestionData } from './Quiz';

interface QuizQuestionProps {
  question: QuizQuestionData;
  questionNumber: number;
  selectedAnswer: number | null;
  onSelectAnswer: (answerIndex: number) => void;
  showExplanation?: boolean;
  showCorrectAnswer?: boolean;
}

export function QuizQuestion({
  question,
  questionNumber,
  selectedAnswer,
  onSelectAnswer,
  showExplanation = false,
  showCorrectAnswer = false,
}: QuizQuestionProps) {
  const { colors } = useTheme();

  const getOptionStyle = (optionIndex: number) => {
    const isSelected = selectedAnswer === optionIndex;
    const isCorrect = optionIndex === question.correctAnswer;
    const isWrong = isSelected && !isCorrect && showCorrectAnswer;

    if (showCorrectAnswer) {
      if (isCorrect) {
        return {
          backgroundColor: '#4CAF5020',
          borderColor: '#4CAF50',
          borderWidth: 2,
        };
      }
      if (isWrong) {
        return {
          backgroundColor: '#F4433620',
          borderColor: '#F44336',
          borderWidth: 2,
        };
      }
    }

    if (isSelected && !showCorrectAnswer) {
      return {
        backgroundColor: colors.primary + '20',
        borderColor: colors.primary,
        borderWidth: 2,
      };
    }

    return {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
    };
  };

  const getOptionIcon = (optionIndex: number) => {
    const isSelected = selectedAnswer === optionIndex;
    const isCorrect = optionIndex === question.correctAnswer;

    if (showCorrectAnswer) {
      if (isCorrect) return '✓';
      if (isSelected && !isCorrect) return '✗';
    }

    return String.fromCharCode(65 + optionIndex); // A, B, C, D
  };

  return (
    <View style={styles.container}>
      {/* Question Text */}
      <View style={styles.questionContainer}>
        <Text style={[styles.questionNumber, { color: colors.primary }]}>
          Q{questionNumber}
        </Text>
        <Text style={[styles.questionText, { color: colors.text }]}>
          {question.question}
        </Text>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {question.options.map((option, index) => {
          const optionStyle = getOptionStyle(index);
          const icon = getOptionIcon(index);

          return (
            <Pressable
              key={index}
              style={[styles.option, optionStyle]}
              onPress={() => !showCorrectAnswer && onSelectAnswer(index)}
              disabled={showCorrectAnswer}
            >
              <View
                style={[
                  styles.optionIcon,
                  {
                    backgroundColor:
                      selectedAnswer === index && !showCorrectAnswer
                        ? colors.primary
                        : index === question.correctAnswer && showCorrectAnswer
                          ? '#4CAF50'
                          : selectedAnswer === index && showCorrectAnswer
                            ? '#F44336'
                            : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.optionIconText,
                    {
                      color:
                        selectedAnswer === index || (showCorrectAnswer && index === question.correctAnswer)
                          ? '#FFFFFF'
                          : colors.textSecondary,
                    },
                  ]}
                >
                  {icon}
                </Text>
              </View>
              <Text
                style={[
                  styles.optionText,
                  {
                    color: colors.text,
                    fontWeight: selectedAnswer === index ? '600' : '400',
                  },
                ]}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Explanation (shown after answering) */}
      {showExplanation && question.explanation && (
        <View
          style={[
            styles.explanationContainer,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.explanationHeader}>
            <Text
              style={[styles.explanationLabel, { color: colors.primary }]}
            >
              💡 Explanation
            </Text>
          </View>
          <Text style={[styles.explanationText, { color: colors.text }]}>
            {question.explanation}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  questionContainer: {
    gap: 12,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  optionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconText: {
    fontSize: 16,
    fontWeight: '700',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  explanationContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  explanationHeader: {
    marginBottom: 8,
  },
  explanationLabel: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  explanationText: {
    fontSize: 15,
    lineHeight: 24,
  },
});
