/**
 * Courses Screen
 *
 * Course catalog showing available Book of Mormon courses
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import { useCourses, CourseLevel } from '../hooks/useCourses';
import { HomeStackParamList } from '../navigation/RootNavigator';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList>;

export function CoursesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const {
    courses,
    loading,
    getCourseProgress,
    getLevelColor,
    coursesInProgress,
    completedCourses,
  } = useCourses();

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const getLevelLabel = (level: CourseLevel): string => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Book of Mormon Courses</Text>
        <Text style={styles.headerSubtitle}>
          Seminary-style courses with lessons, quizzes, and progress tracking
        </Text>
      </View>

      {/* Continue Learning */}
      {coursesInProgress.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Continue Learning
          </Text>
          {coursesInProgress.map((progress) => {
            const course = courses.find((c) => c.id === progress.courseId);
            if (!course) return null;

            const percentComplete = Math.round(
              (progress.lessonsCompleted / progress.totalLessons) * 100
            );

            return (
              <Pressable
                key={course.id}
                style={[styles.continueCard, { backgroundColor: colors.surface }]}
                onPress={() =>
                  navigation.navigate('CourseDetail', { courseId: course.id })
                }
              >
                <View style={styles.continueContent}>
                  <Text style={styles.continueIcon}>{course.icon}</Text>
                  <View style={styles.continueInfo}>
                    <Text style={[styles.continueTitle, { color: colors.text }]}>
                      {course.title}
                    </Text>
                    <Text style={[styles.continueSubtitle, { color: colors.textSecondary }]}>
                      {progress.lessonsCompleted} of {progress.totalLessons} lessons
                    </Text>
                  </View>
                </View>
                <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${percentComplete}%`, backgroundColor: course.color },
                    ]}
                  />
                </View>
                <Pressable
                  style={[styles.continueButton, { backgroundColor: course.color }]}
                  onPress={() =>
                    navigation.navigate('CourseDetail', { courseId: course.id })
                  }
                >
                  <Text style={styles.continueButtonText}>Continue</Text>
                </Pressable>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Completed Courses */}
      {completedCourses.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Completed Courses
          </Text>
          <View style={styles.completedRow}>
            {completedCourses.map((progress) => {
              const course = courses.find((c) => c.id === progress.courseId);
              if (!course) return null;

              return (
                <Pressable
                  key={course.id}
                  style={[styles.completedCard, { backgroundColor: colors.surface }]}
                  onPress={() =>
                    navigation.navigate('CourseDetail', { courseId: course.id })
                  }
                >
                  <Text style={styles.completedIcon}>{course.icon}</Text>
                  <Text
                    style={[styles.completedTitle, { color: colors.text }]}
                    numberOfLines={2}
                  >
                    {course.title}
                  </Text>
                  <View style={[styles.certificateBadge, { backgroundColor: colors.success + '20' }]}>
                    <Text style={[styles.certificateText, { color: colors.success }]}>
                      Completed
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {/* All Courses */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          All Courses
        </Text>
        {courses.map((course) => {
          const progress = getCourseProgress(course.id);
          const isStarted = !!progress;
          const isCompleted = progress?.completedAt;

          return (
            <Pressable
              key={course.id}
              style={[styles.courseCard, { backgroundColor: colors.surface }]}
              onPress={() =>
                navigation.navigate('CourseDetail', { courseId: course.id })
              }
            >
              {/* Course Header */}
              <View style={styles.courseHeader}>
                <View
                  style={[styles.courseIconContainer, { backgroundColor: course.color + '20' }]}
                >
                  <Text style={styles.courseIcon}>{course.icon}</Text>
                </View>
                <View style={styles.courseHeaderInfo}>
                  <Text style={[styles.courseTitle, { color: colors.text }]}>
                    {course.title}
                  </Text>
                  <Text style={[styles.courseSubtitle, { color: colors.textSecondary }]}>
                    {course.subtitle}
                  </Text>
                </View>
              </View>

              {/* Course Description */}
              <Text
                style={[styles.courseDescription, { color: colors.textSecondary }]}
                numberOfLines={2}
              >
                {course.description}
              </Text>

              {/* Course Meta */}
              <View style={styles.courseMeta}>
                <View
                  style={[
                    styles.levelBadge,
                    { backgroundColor: getLevelColor(course.level) + '20' },
                  ]}
                >
                  <Text
                    style={[styles.levelText, { color: getLevelColor(course.level) }]}
                  >
                    {getLevelLabel(course.level)}
                  </Text>
                </View>
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {course.lessonsCount} {course.lessonsCount === 1 ? 'lesson' : 'lessons'}
                </Text>
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {course.duration}
                </Text>
                {course.lessonsCount === 1 && (
                  <View style={[styles.previewBadge, { backgroundColor: colors.warning + '20' }]}>
                    <Text style={[styles.previewText, { color: colors.warning }]}>
                      Preview
                    </Text>
                  </View>
                )}
              </View>

              {/* Progress or Status */}
              {isCompleted ? (
                <View style={[styles.statusBadge, { backgroundColor: colors.success + '20' }]}>
                  <Text style={[styles.statusText, { color: colors.success }]}>
                    Completed
                  </Text>
                </View>
              ) : isStarted ? (
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${(progress.lessonsCompleted / progress.totalLessons) * 100}%`,
                          backgroundColor: course.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                    {progress.lessonsCompleted}/{progress.totalLessons} lessons
                  </Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          More courses coming soon!
        </Text>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  continueCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  continueContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  continueIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  continueInfo: {
    flex: 1,
  },
  continueTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  continueSubtitle: {
    fontSize: 13,
  },
  continueButton: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  completedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  completedCard: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  completedIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  completedTitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  certificateBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  certificateText: {
    fontSize: 11,
    fontWeight: '600',
  },
  courseCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  courseHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  courseIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  courseIcon: {
    fontSize: 28,
  },
  courseHeaderInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  courseTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  courseSubtitle: {
    fontSize: 13,
  },
  courseDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  courseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
  },
  statusBadge: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  previewBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  previewText: {
    fontSize: 11,
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
});
