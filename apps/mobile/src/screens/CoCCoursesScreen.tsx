/**
 * Community of Christ Courses Screen
 *
 * Course catalog showing available CoC study courses
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
import { useCoCCourses, CourseLevel } from '../hooks/useCoCCourses';
import { HomeStackParamList } from '../navigation/RootNavigator';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList>;

export function CoCCoursesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const { courses, loading } = useCoCCourses();

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

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Community of Christ Courses</Text>
        <Text style={styles.headerSubtitle}>
          Explore RLDS/CoC history, theology, and distinctives
        </Text>
      </View>

      {/* Introduction */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          About These Courses
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          These courses use authentic RLDS historical materials from archive.org,
          Community of Christ official resources, and scholarly research to provide
          accurate, in-depth study of CoC identity, beliefs, and history.
        </Text>
      </View>

      {/* Courses List */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Available Courses
        </Text>
        {courses.map((course) => (
          <Pressable
            key={course.id}
            style={[styles.courseCard, { backgroundColor: colors.surface }]}
            onPress={() =>
              navigation.navigate('CoCCourseDetail', { courseId: course.id })
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
              numberOfLines={3}
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
            </View>

            {/* Outcomes Preview */}
            <View style={styles.outcomesPreview}>
              <Text style={[styles.outcomesTitle, { color: colors.text }]}>
                What you'll learn:
              </Text>
              {course.outcomes.slice(0, 3).map((outcome, index) => (
                <Text
                  key={index}
                  style={[styles.outcomeText, { color: colors.textSecondary }]}
                >
                  • {outcome}
                </Text>
              ))}
              {course.outcomes.length > 3 && (
                <Text style={[styles.moreText, { color: colors.primary }]}>
                  +{course.outcomes.length - 3} more
                </Text>
              )}
            </View>
          </Pressable>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          More CoC courses coming soon!
        </Text>
        <Text style={[styles.footerSubtext, { color: colors.textSecondary }]}>
          Materials sourced from archive.org, cofchrist.org, and centerplace.org
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
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  courseCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
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
    lineHeight: 18,
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
    marginBottom: 12,
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
  outcomesPreview: {
    marginTop: 8,
  },
  outcomesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  outcomeText: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 4,
  },
  moreText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 12,
    textAlign: 'center',
  },
});
