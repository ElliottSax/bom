/**
 * Course Detail Screen
 *
 * Shows course overview, lessons list, and progress
 */

import React from 'react';
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
import { useCourses } from '../hooks/useCourses';
import { HomeStackParamList } from '../navigation/RootNavigator';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList>;
type RouteProps = RouteProp<HomeStackParamList, 'CourseDetail'>;

export function CourseDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { courseId } = route.params;
  const { colors } = useTheme();
  const {
    getCourse,
    getCourseProgress,
    getLessonProgress,
    getNextLesson,
    startCourse,
    formatDuration,
    getLevelColor,
  } = useCourses();

  const course = getCourse(courseId);
  const progress = getCourseProgress(courseId);
  const nextLesson = getNextLesson(courseId);

  if (!course) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Course not found
        </Text>
      </View>
    );
  }

  const isStarted = !!progress;
  const isCompleted = progress?.completedAt;
  const percentComplete = progress
    ? Math.round((progress.lessonsCompleted / progress.totalLessons) * 100)
    : 0;

  const handleStartCourse = async () => {
    if (!isStarted) {
      await startCourse(courseId);
    }
    if (nextLesson) {
      navigation.navigate('Lesson', { courseId, lessonId: nextLesson.id });
    }
  };

  const getLessonTypeIcon = (type: string): string => {
    switch (type) {
      case 'reading':
        return '📖';
      case 'study':
        return '📝';
      case 'quiz':
        return '✅';
      case 'reflection':
        return '💭';
      default:
        return '📄';
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Hero Section */}
      <View style={[styles.hero, { backgroundColor: course.color }]}>
        <Text style={styles.heroIcon}>{course.icon}</Text>
        <Text style={styles.heroTitle}>{course.title}</Text>
        <Text style={styles.heroSubtitle}>{course.subtitle}</Text>

        {/* Progress */}
        {isStarted && !isCompleted && (
          <View style={styles.heroProgress}>
            <View style={styles.heroProgressBar}>
              <View
                style={[styles.heroProgressFill, { width: `${percentComplete}%` }]}
              />
            </View>
            <Text style={styles.heroProgressText}>
              {percentComplete}% Complete
            </Text>
          </View>
        )}

        {isCompleted && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedBadgeText}>Course Completed</Text>
          </View>
        )}
      </View>

      {/* Start/Continue Button */}
      <View style={styles.actionSection}>
        <Pressable
          style={[styles.actionButton, { backgroundColor: course.color }]}
          onPress={handleStartCourse}
        >
          <Text style={styles.actionButtonText}>
            {isCompleted
              ? 'Review Course'
              : isStarted
              ? 'Continue Learning'
              : 'Start Course'}
          </Text>
        </Pressable>
      </View>

      {/* Course Info */}
      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {course.lessonsCount}
            </Text>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Lessons
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {course.duration}
            </Text>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Duration
            </Text>
          </View>
          <View style={styles.infoItem}>
            <View
              style={[
                styles.levelPill,
                { backgroundColor: getLevelColor(course.level) + '20' },
              ]}
            >
              <Text
                style={[styles.levelText, { color: getLevelColor(course.level) }]}
              >
                {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
              </Text>
            </View>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Level
            </Text>
          </View>
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          About This Course
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {course.description}
        </Text>
      </View>

      {/* Learning Outcomes */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          What You'll Learn
        </Text>
        {course.outcomes.map((outcome, index) => (
          <View key={index} style={styles.outcomeItem}>
            <Text style={[styles.outcomeCheck, { color: course.color }]}>✓</Text>
            <Text style={[styles.outcomeText, { color: colors.text }]}>
              {outcome}
            </Text>
          </View>
        ))}
      </View>

      {/* Lessons */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Course Lessons
        </Text>
        {course.lessons.map((lesson, index) => {
          const lessonProg = getLessonProgress(courseId, lesson.id);
          const isLessonCompleted = lessonProg?.completed;
          const isNextLesson = nextLesson?.id === lesson.id;

          return (
            <Pressable
              key={lesson.id}
              style={[
                styles.lessonCard,
                { backgroundColor: colors.surface },
                isNextLesson && { borderColor: course.color, borderWidth: 2 },
              ]}
              onPress={() =>
                navigation.navigate('Lesson', { courseId, lessonId: lesson.id })
              }
            >
              <View style={styles.lessonLeft}>
                <View
                  style={[
                    styles.lessonNumber,
                    {
                      backgroundColor: isLessonCompleted
                        ? colors.success
                        : isNextLesson
                        ? course.color
                        : colors.border,
                    },
                  ]}
                >
                  {isLessonCompleted ? (
                    <Text style={styles.lessonNumberText}>✓</Text>
                  ) : (
                    <Text style={styles.lessonNumberText}>{index + 1}</Text>
                  )}
                </View>
              </View>

              <View style={styles.lessonContent}>
                <View style={styles.lessonHeader}>
                  <Text style={styles.lessonTypeIcon}>
                    {getLessonTypeIcon(lesson.type)}
                  </Text>
                  <Text style={[styles.lessonType, { color: colors.textSecondary }]}>
                    {lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)}
                  </Text>
                </View>
                <Text style={[styles.lessonTitle, { color: colors.text }]}>
                  {lesson.title}
                </Text>
                <Text
                  style={[styles.lessonDescription, { color: colors.textSecondary }]}
                  numberOfLines={2}
                >
                  {lesson.description}
                </Text>
                <View style={styles.lessonMeta}>
                  <Text style={[styles.lessonDuration, { color: colors.textSecondary }]}>
                    {formatDuration(lesson.duration)}
                  </Text>
                  {lesson.quiz && (
                    <Text style={[styles.quizBadge, { color: course.color }]}>
                      Quiz
                    </Text>
                  )}
                </View>
              </View>

              {isNextLesson && (
                <View style={[styles.nextBadge, { backgroundColor: course.color }]}>
                  <Text style={styles.nextBadgeText}>Next</Text>
                </View>
              )}
            </Pressable>
          );
        })}

        {/* Coming Soon Note */}
        {course.lessons.length === 1 && (
          <View style={[styles.comingSoonCard, { backgroundColor: colors.warning + '10' }]}>
            <Text style={styles.comingSoonIcon}>🚀</Text>
            <Text style={[styles.comingSoonText, { color: colors.textSecondary }]}>
              More lessons are being developed! Check back soon for the full course.
            </Text>
          </View>
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
  hero: {
    padding: 24,
    paddingTop: 20,
    paddingBottom: 32,
    alignItems: 'center',
  },
  heroIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },
  heroProgress: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  heroProgressBar: {
    width: '80%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
  },
  heroProgressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  heroProgressText: {
    marginTop: 8,
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  completedBadge: {
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  completedBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionSection: {
    padding: 16,
    paddingTop: 0,
    marginTop: -20,
  },
  actionButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  infoSection: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoItem: {
    alignItems: 'center',
  },
  infoValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 13,
  },
  levelPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  levelText: {
    fontSize: 14,
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
  description: {
    fontSize: 15,
    lineHeight: 24,
  },
  outcomeItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  outcomeCheck: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 12,
    marginTop: 2,
  },
  outcomeText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  lessonCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  lessonLeft: {
    marginRight: 14,
  },
  lessonNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  lessonContent: {
    flex: 1,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  lessonTypeIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  lessonType: {
    fontSize: 12,
    textTransform: 'uppercase',
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  lessonDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  lessonDuration: {
    fontSize: 12,
  },
  quizBadge: {
    fontSize: 12,
    fontWeight: '600',
  },
  nextBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  nextBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  comingSoonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  comingSoonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  comingSoonText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    height: 40,
  },
});
