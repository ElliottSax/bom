/**
 * Lesson Screen
 *
 * Display lesson content, scriptures, quizzes, and discussion questions
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import { useCourses, QuizQuestion } from '../hooks/useCourses';
import { HomeStackParamList } from '../navigation/RootNavigator';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList>;
type RouteProps = RouteProp<HomeStackParamList, 'Lesson'>;

export function LessonScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { courseId, lessonId } = route.params;
  const { colors } = useTheme();
  const {
    getCourse,
    getLesson,
    getLessonProgress,
    completeLesson,
    submitQuiz,
    formatDuration,
  } = useCourses();

  const course = getCourse(courseId);
  const lesson = getLesson(courseId, lessonId);
  const lessonProgress = getLessonProgress(courseId, lessonId);

  // Quiz state
  const [quizMode, setQuizMode] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ questionId: string; correct: boolean }[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);

  // Timer
  const [startTime] = useState(Date.now());

  if (!course || !lesson) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Lesson not found
        </Text>
      </View>
    );
  }

  const isCompleted = lessonProgress?.completed;
  const currentQuestion = lesson.quiz?.[currentQuestionIndex];

  // Get next lesson
  const lessonIndex = course.lessons.findIndex((l) => l.id === lessonId);
  const nextLesson = course.lessons[lessonIndex + 1];
  const prevLesson = course.lessons[lessonIndex - 1];

  const handleCompleteLesson = async () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    await completeLesson(courseId, lessonId, timeSpent);

    if (nextLesson) {
      Alert.alert(
        'Lesson Complete!',
        'Great job! Ready for the next lesson?',
        [
          { text: 'Stay Here', style: 'cancel' },
          {
            text: 'Next Lesson',
            onPress: () => navigation.replace('Lesson', { courseId, lessonId: nextLesson.id }),
          },
        ]
      );
    } else {
      Alert.alert(
        'Course Complete!',
        'Congratulations! You have completed all lessons in this course.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };

  const handleStartQuiz = () => {
    setQuizMode(true);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowResult(false);
    setQuizComplete(false);
  };

  const handleSelectAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !currentQuestion) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const newAnswers = [
      ...answers,
      { questionId: currentQuestion.id, correct: isCorrect },
    ];
    setAnswers(newAnswers);
    setShowResult(true);
  };

  const handleNextQuestion = async () => {
    if (!lesson.quiz) return;

    if (currentQuestionIndex < lesson.quiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Quiz complete
      setQuizComplete(true);
      const result = await submitQuiz(courseId, lessonId, answers);
    }
  };

  const handleFinishQuiz = () => {
    setQuizMode(false);
    if (answers.filter((a) => a.correct).length >= (lesson.quiz?.length || 0) * 0.7) {
      // Passed - mark as complete
      handleCompleteLesson();
    }
  };

  // Quiz Mode UI
  if (quizMode && lesson.quiz) {
    if (quizComplete) {
      const score = answers.filter((a) => a.correct).length;
      const total = lesson.quiz.length;
      const passed = score >= total * 0.7;

      return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.quizResultContainer}>
            <Text style={styles.quizResultIcon}>{passed ? '🎉' : '📚'}</Text>
            <Text style={[styles.quizResultTitle, { color: colors.text }]}>
              {passed ? 'Quiz Passed!' : 'Keep Studying'}
            </Text>
            <Text style={[styles.quizResultScore, { color: passed ? colors.success : colors.warning }]}>
              {score} / {total} correct
            </Text>
            <Text style={[styles.quizResultPercent, { color: colors.textSecondary }]}>
              {Math.round((score / total) * 100)}%
            </Text>

            <View style={styles.quizResultActions}>
              {!passed && (
                <Pressable
                  style={[styles.retryButton, { backgroundColor: colors.primary }]}
                  onPress={handleStartQuiz}
                >
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </Pressable>
              )}
              <Pressable
                style={[styles.doneButton, { backgroundColor: passed ? colors.success : colors.surface }]}
                onPress={handleFinishQuiz}
              >
                <Text style={[styles.doneButtonText, { color: passed ? '#fff' : colors.text }]}>
                  {passed ? 'Continue' : 'Review Lesson'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Quiz Header */}
        <View style={[styles.quizHeader, { backgroundColor: colors.surface }]}>
          <Text style={[styles.quizProgress, { color: colors.textSecondary }]}>
            Question {currentQuestionIndex + 1} of {lesson.quiz.length}
          </Text>
          <View style={[styles.quizProgressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.quizProgressFill,
                {
                  width: `${((currentQuestionIndex + 1) / lesson.quiz.length) * 100}%`,
                  backgroundColor: course.color,
                },
              ]}
            />
          </View>
        </View>

        <ScrollView style={styles.quizContent}>
          {currentQuestion && (
            <>
              <Text style={[styles.questionText, { color: colors.text }]}>
                {currentQuestion.question}
              </Text>

              <View style={styles.optionsContainer}>
                {currentQuestion.options?.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === currentQuestion.correctAnswer;
                  const showCorrect = showResult && isCorrect;
                  const showIncorrect = showResult && isSelected && !isCorrect;

                  return (
                    <Pressable
                      key={index}
                      style={[
                        styles.optionButton,
                        { backgroundColor: colors.surface },
                        isSelected && !showResult && { borderColor: course.color, borderWidth: 2 },
                        showCorrect && { backgroundColor: colors.success + '20', borderColor: colors.success, borderWidth: 2 },
                        showIncorrect && { backgroundColor: colors.error + '20', borderColor: colors.error, borderWidth: 2 },
                      ]}
                      onPress={() => handleSelectAnswer(index)}
                      disabled={showResult}
                    >
                      <View
                        style={[
                          styles.optionIndicator,
                          {
                            backgroundColor: isSelected ? course.color : colors.border,
                          },
                          showCorrect && { backgroundColor: colors.success },
                          showIncorrect && { backgroundColor: colors.error },
                        ]}
                      >
                        <Text style={styles.optionIndicatorText}>
                          {String.fromCharCode(65 + index)}
                        </Text>
                      </View>
                      <Text style={[styles.optionText, { color: colors.text }]}>
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {showResult && currentQuestion.explanation && (
                <View style={[styles.explanationBox, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.explanationTitle, { color: colors.primary }]}>
                    Explanation
                  </Text>
                  <Text style={[styles.explanationText, { color: colors.text }]}>
                    {currentQuestion.explanation}
                  </Text>
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* Quiz Actions */}
        <View style={[styles.quizActions, { backgroundColor: colors.surface }]}>
          {!showResult ? (
            <Pressable
              style={[
                styles.submitButton,
                { backgroundColor: selectedAnswer !== null ? course.color : colors.border },
              ]}
              onPress={handleSubmitAnswer}
              disabled={selectedAnswer === null}
            >
              <Text style={styles.submitButtonText}>Check Answer</Text>
            </Pressable>
          ) : (
            <Pressable
              style={[styles.nextButton, { backgroundColor: course.color }]}
              onPress={handleNextQuestion}
            >
              <Text style={styles.nextButtonText}>
                {currentQuestionIndex < lesson.quiz.length - 1 ? 'Next Question' : 'See Results'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  // Normal Lesson UI
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Lesson Header */}
      <View style={[styles.header, { backgroundColor: course.color }]}>
        <View style={styles.headerMeta}>
          <Text style={styles.lessonNumber}>Lesson {lessonIndex + 1}</Text>
          <Text style={styles.lessonDuration}>{formatDuration(lesson.duration)}</Text>
        </View>
        <Text style={styles.lessonTitle}>{lesson.title}</Text>
        <Text style={styles.lessonDescription}>{lesson.description}</Text>
      </View>

      {/* Objectives */}
      {lesson.objectives.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Learning Objectives
          </Text>
          {lesson.objectives.map((objective, index) => (
            <View key={index} style={styles.objectiveItem}>
              <Text style={[styles.objectiveNumber, { color: course.color }]}>
                {index + 1}.
              </Text>
              <Text style={[styles.objectiveText, { color: colors.text }]}>
                {objective}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Scripture References */}
      {lesson.scriptures.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Scripture Reading
          </Text>
          {lesson.scriptures.map((ref, index) => (
            <Pressable
              key={index}
              style={[styles.scriptureCard, { backgroundColor: colors.surface }]}
              onPress={() => {
                navigation.navigate('Read', {
                  screen: 'Reader',
                  params: {
                    editionId: 'coc-bom-1908',
                    book: ref.book,
                    chapter: ref.chapter,
                  },
                });
              }}
            >
              <Text style={styles.scriptureIcon}>📖</Text>
              <Text style={[styles.scriptureRef, { color: colors.primary }]}>
                {ref.book} {ref.chapter}
                {ref.verseStart ? `:${ref.verseStart}` : ''}
                {ref.verseEnd ? `-${ref.verseEnd}` : ''}
              </Text>
              <Text style={[styles.openArrow, { color: colors.textSecondary }]}>→</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Main Content */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Lesson Content
        </Text>
        <View style={[styles.contentCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.contentText, { color: colors.text }]}>
            {lesson.content}
          </Text>
        </View>
      </View>

      {/* Key Terms */}
      {lesson.keyTerms && lesson.keyTerms.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Key Terms
          </Text>
          {lesson.keyTerms.map((term, index) => (
            <View key={index} style={[styles.termCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.termWord, { color: course.color }]}>
                {term.term}
              </Text>
              <Text style={[styles.termDef, { color: colors.text }]}>
                {term.definition}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Discussion Questions */}
      {lesson.discussionQuestions && lesson.discussionQuestions.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Discussion Questions
          </Text>
          {lesson.discussionQuestions.map((question, index) => (
            <View key={index} style={[styles.questionCard, { backgroundColor: colors.surface }]}>
              <Text style={styles.questionIcon}>💭</Text>
              <Text style={[styles.questionText2, { color: colors.text }]}>
                {question}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Application Challenge */}
      {lesson.applicationChallenge && (
        <View style={styles.section}>
          <View style={[styles.challengeCard, { backgroundColor: course.color + '15' }]}>
            <Text style={[styles.challengeTitle, { color: course.color }]}>
              This Week's Challenge
            </Text>
            <Text style={[styles.challengeText, { color: colors.text }]}>
              {lesson.applicationChallenge}
            </Text>
          </View>
        </View>
      )}

      {/* Quiz Button */}
      {lesson.quiz && lesson.quiz.length > 0 && (
        <View style={styles.section}>
          <Pressable
            style={[styles.quizButton, { backgroundColor: course.color }]}
            onPress={handleStartQuiz}
          >
            <Text style={styles.quizButtonIcon}>✅</Text>
            <View style={styles.quizButtonContent}>
              <Text style={styles.quizButtonTitle}>Take the Quiz</Text>
              <Text style={styles.quizButtonSubtitle}>
                {lesson.quiz.length} questions
              </Text>
            </View>
          </Pressable>
        </View>
      )}

      {/* Complete Button */}
      {!lesson.quiz && (
        <View style={styles.section}>
          <Pressable
            style={[
              styles.completeButton,
              { backgroundColor: isCompleted ? colors.success : course.color },
            ]}
            onPress={handleCompleteLesson}
          >
            <Text style={styles.completeButtonText}>
              {isCompleted ? '✓ Completed' : 'Mark as Complete'}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Navigation */}
      <View style={styles.navSection}>
        {prevLesson && (
          <Pressable
            style={[styles.navButton, { backgroundColor: colors.surface }]}
            onPress={() => navigation.replace('Lesson', { courseId, lessonId: prevLesson.id })}
          >
            <Text style={[styles.navButtonText, { color: colors.textSecondary }]}>
              ← Previous
            </Text>
            <Text style={[styles.navButtonTitle, { color: colors.text }]} numberOfLines={1}>
              {prevLesson.title}
            </Text>
          </Pressable>
        )}
        {nextLesson && (
          <Pressable
            style={[styles.navButton, { backgroundColor: colors.surface }]}
            onPress={() => navigation.replace('Lesson', { courseId, lessonId: nextLesson.id })}
          >
            <Text style={[styles.navButtonText, { color: colors.textSecondary }]}>
              Next →
            </Text>
            <Text style={[styles.navButtonTitle, { color: colors.text }]} numberOfLines={1}>
              {nextLesson.title}
            </Text>
          </Pressable>
        )}
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  header: {
    padding: 20,
    paddingTop: 16,
  },
  headerMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  lessonNumber: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  lessonDuration: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  lessonTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  lessonDescription: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 22,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
  },
  objectiveItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  objectiveNumber: {
    fontSize: 15,
    fontWeight: '600',
    marginRight: 8,
    minWidth: 20,
  },
  objectiveText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  scriptureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  scriptureIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  scriptureRef: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  openArrow: {
    fontSize: 18,
  },
  contentCard: {
    padding: 16,
    borderRadius: 12,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 24,
  },
  termCard: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  termWord: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  termDef: {
    fontSize: 14,
    lineHeight: 20,
  },
  questionCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  questionIcon: {
    fontSize: 18,
    marginRight: 10,
    marginTop: 2,
  },
  questionText2: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  challengeCard: {
    padding: 16,
    borderRadius: 12,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  challengeText: {
    fontSize: 15,
    lineHeight: 22,
  },
  quizButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  quizButtonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  quizButtonContent: {
    flex: 1,
  },
  quizButtonTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  quizButtonSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: 2,
  },
  completeButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  navSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  navButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
  },
  navButtonText: {
    fontSize: 12,
    marginBottom: 4,
  },
  navButtonTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    height: 40,
  },
  // Quiz Styles
  quizHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  quizProgress: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  quizProgressBar: {
    height: 6,
    borderRadius: 3,
  },
  quizProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  quizContent: {
    flex: 1,
    padding: 20,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  optionIndicatorText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  explanationBox: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 15,
    lineHeight: 22,
  },
  quizActions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  submitButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  nextButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  quizResultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  quizResultIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  quizResultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  quizResultScore: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  quizResultPercent: {
    fontSize: 18,
    marginBottom: 32,
  },
  quizResultActions: {
    gap: 12,
    width: '100%',
  },
  retryButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  doneButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
});
