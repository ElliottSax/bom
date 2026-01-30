/**
 * CoC Course Detail Screen
 *
 * Display course overview, lessons, outcomes, and start/continue button
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import { useCoCCourses, CourseLevel } from '../hooks/useCoCCourses';
import { useCourseProgress } from '../hooks/useCourseProgress';
import { HomeStackParamList } from '../navigation/RootNavigator';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList>;
type RouteProps = RouteProp<HomeStackParamList, 'CoCCourseDetail'>;

export function CoCCourseDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { courseId } = route.params;
  const { colors } = useTheme();
  const { getCourse } = useCoCCourses();
  const {
    startCourse,
    isCourseStarted,
    isLessonComplete,
    calculateCourseCompletion,
    isCourseComplete,
  } = useCourseProgress();

  const course = getCourse(courseId);
  const isStarted = course ? isCourseStarted(course.id) : false;
  const progressPercentage = course ? calculateCourseCompletion(course.id, course.lessonsCount) : 0;
  const isComplete = course ? isCourseComplete(course.id) : false;

  // Start tracking course when user views details
  useEffect(() => {
    if (course && !isStarted) {
      startCourse(course.id);
    }
  }, [course, isStarted, startCourse]);

  if (!course) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Course not found
        </Text>
      </View>
    );
  }

  const getLevelLabel = (level: CourseLevel): string => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  const getLevelColor = (level: CourseLevel): string => {
    switch (level) {
      case 'beginner':
        return '#4CAF50';
      case 'intermediate':
        return '#FF9800';
      case 'advanced':
        return '#F44336';
    }
  };

  const handleStartLesson = (lessonId: string) => {
    navigation.navigate('CoCLesson', { courseId: course.id, lessonId });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Course Header */}
      <View style={[styles.header, { backgroundColor: course.color }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerIcon}>{course.icon}</Text>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{course.title}</Text>
            <Text style={styles.headerSubtitle}>{course.subtitle}</Text>
          </View>
        </View>
        {/* Progress Bar */}
        {isStarted && progressPercentage > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progressPercentage}%`,
                    backgroundColor: isComplete ? '#4CAF50' : '#fff',
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {isComplete ? '✓ Complete!' : `${progressPercentage}% done`}
            </Text>
          </View>
        )}
      </View>

      {/* Course Info */}
      <View style={styles.section}>
        <View style={styles.metaRow}>
          <View
            style={[
              styles.levelBadge,
              { backgroundColor: getLevelColor(course.level) + '20' },
            ]}
          >
            <Text style={[styles.levelText, { color: getLevelColor(course.level) }]}>
              {getLevelLabel(course.level)}
            </Text>
          </View>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            {course.lessonsCount} lessons
          </Text>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            {course.duration}
          </Text>
        </View>

        <Text style={[styles.description, { color: colors.text }]}>
          {course.description}
        </Text>
      </View>

      {/* Learning Outcomes */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          What You'll Learn
        </Text>
        {course.outcomes.map((outcome, index) => (
          <View key={index} style={styles.outcomeRow}>
            <Text style={[styles.checkmark, { color: course.color }]}>✓</Text>
            <Text style={[styles.outcomeText, { color: colors.textSecondary }]}>
              {outcome}
            </Text>
          </View>
        ))}
      </View>

      {/* Prerequisites */}
      {course.prerequisites && course.prerequisites.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Prerequisites
          </Text>
          {course.prerequisites.map((prereq, index) => (
            <Text
              key={index}
              style={[styles.prereqText, { color: colors.textSecondary }]}
            >
              • {prereq}
            </Text>
          ))}
        </View>
      )}

      {/* Lessons List */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Course Lessons
        </Text>
        {course.lessons.map((lesson, index) => {
          const lessonCompleted = isLessonComplete(course.id, lesson.id);
          return (
          <Pressable
            key={lesson.id}
            style={[styles.lessonCard, { backgroundColor: colors.surface }]}
            onPress={() => handleStartLesson(lesson.id)}
          >
            <View style={styles.lessonHeader}>
              <View
                style={[
                  styles.lessonNumber,
                  { backgroundColor: lessonCompleted ? '#4CAF50' + '20' : course.color + '20' },
                ]}
              >
                {lessonCompleted ? (
                  <Text style={[styles.lessonNumberText, { color: '#4CAF50' }]}>✓</Text>
                ) : (
                <Text style={[styles.lessonNumberText, { color: course.color }]}>
                  {index + 1}
                </Text>
                )}
              </View>
              <View style={styles.lessonInfo}>
                <Text style={[styles.lessonTitle, { color: colors.text }]}>
                  {lesson.title}
                </Text>
                <Text style={[styles.lessonDescription, { color: colors.textSecondary }]}>
                  {lesson.description}
                </Text>
              </View>
            </View>

            <View style={styles.lessonMeta}>
              <View
                style={[
                  styles.lessonTypeBadge,
                  { backgroundColor: colors.border },
                ]}
              >
                <Text style={[styles.lessonTypeText, { color: colors.textSecondary }]}>
                  {lesson.type}
                </Text>
              </View>
              <Text style={[styles.lessonDuration, { color: colors.textSecondary }]}>
                {lesson.duration} min
              </Text>
              {lesson.scriptures.length > 0 && (
                <Text style={[styles.scriptureCount, { color: colors.primary }]}>
                  📖 {lesson.scriptures.length}
                </Text>
              )}
            </View>

            {/* Objectives Preview */}
            {lesson.objectives.length > 0 && (
              <View style={styles.objectivesPreview}>
                <Text style={[styles.objectivesTitle, { color: colors.text }]}>
                  Objectives:
                </Text>
                {lesson.objectives.slice(0, 2).map((objective, idx) => (
                  <Text
                    key={idx}
                    style={[styles.objectiveText, { color: colors.textSecondary }]}
                  >
                    • {objective}
                  </Text>
                ))}
                {lesson.objectives.length > 2 && (
                  <Text style={[styles.moreText, { color: colors.textSecondary }]}>
                    +{lesson.objectives.length - 2} more
                  </Text>
                )}
              </View>
            )}
          </Pressable>
        );
        })}
      </View>

      {/* Start/Continue Button */}
      <View style={styles.startButtonContainer}>
        <Pressable
          style={[styles.startButton, { backgroundColor: isComplete ? '#4CAF50' : course.color }]}
          onPress={() => {
            // Find first incomplete lesson, or go to first lesson if all complete
            const firstIncomplete = course.lessons.find(l => !isLessonComplete(course.id, l.id));
            handleStartLesson(firstIncomplete ? firstIncomplete.id : course.lessons[0].id);
          }}
        >
          <Text style={styles.startButtonText}>
            {isComplete ? 'Review Course' : isStarted ? 'Continue Course' : 'Start Course'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  progressContainer: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metaText: {
    fontSize: 13,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  outcomeRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  checkmark: {
    fontSize: 16,
    marginRight: 8,
    fontWeight: 'bold',
  },
  outcomeText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  prereqText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 6,
  },
  lessonCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  lessonHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  lessonNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lessonNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  lessonDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  lessonTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  lessonTypeText: {
    fontSize: 11,
    textTransform: 'capitalize',
  },
  lessonDuration: {
    fontSize: 12,
  },
  scriptureCount: {
    fontSize: 12,
  },
  objectivesPreview: {
    marginTop: 8,
  },
  objectivesTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  objectiveText: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 2,
  },
  moreText: {
    fontSize: 11,
    marginTop: 2,
  },
  startButtonContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  startButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});
