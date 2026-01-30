/**
 * CoC Lesson Screen
 *
 * Display lesson content with markdown rendering, scripture references,
 * key terms, discussion questions, and historical materials
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Markdown from 'react-native-markdown-display';
import { useTheme } from '../contexts/ThemeContext';
import { useCoCCourses } from '../hooks/useCoCCourses';
import { useCourseProgress } from '../hooks/useCourseProgress';
import { HomeStackParamList } from '../navigation/RootNavigator';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList>;
type RouteProps = RouteProp<HomeStackParamList, 'CoCLesson'>;

type TabType = 'content' | 'scriptures' | 'terms' | 'discussion' | 'materials';

export function CoCLessonScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { courseId, lessonId } = route.params;
  const { colors } = useTheme();
  const { getCourse, getLesson } = useCoCCourses();
  const {
    markLessonComplete,
    isLessonComplete,
    markCourseComplete,
    calculateCourseCompletion,
  } = useCourseProgress();

  const [activeTab, setActiveTab] = useState<TabType>('content');

  const course = getCourse(courseId);
  const lesson = getLesson(courseId, lessonId);

  if (!course || !lesson) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Lesson not found
        </Text>
      </View>
    );
  }

  // Get next/prev lessons
  const lessonIndex = course.lessons.findIndex((l) => l.id === lessonId);
  const nextLesson = course.lessons[lessonIndex + 1];
  const prevLesson = course.lessons[lessonIndex - 1];
  const lessonCompleted = isLessonComplete(courseId, lessonId);

  // Mark lesson complete and check if course is done
  const handleMarkComplete = useCallback(async () => {
    await markLessonComplete(courseId, lessonId);

    // Check if all lessons are now complete
    const totalLessons = course.lessons.length;
    const completedCount = course.lessons.filter(l =>
      l.id === lessonId || isLessonComplete(courseId, l.id)
    ).length;

    if (completedCount >= totalLessons) {
      await markCourseComplete(courseId);
    }
  }, [courseId, lessonId, course.lessons, markLessonComplete, markCourseComplete, isLessonComplete]);

  const handleOpenUrl = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  const renderMarkdown = () => (
    <View style={styles.markdownContainer}>
      <Markdown
        style={{
          body: { color: colors.text, fontSize: 15, lineHeight: 24 },
          heading1: { color: colors.text, fontSize: 24, fontWeight: 'bold', marginTop: 20, marginBottom: 12 },
          heading2: { color: colors.text, fontSize: 20, fontWeight: 'bold', marginTop: 16, marginBottom: 10 },
          heading3: { color: colors.text, fontSize: 18, fontWeight: '600', marginTop: 14, marginBottom: 8 },
          paragraph: { color: colors.text, marginBottom: 12 },
          list_item: { color: colors.text, marginBottom: 6 },
          strong: { fontWeight: 'bold' },
          em: { fontStyle: 'italic' },
          blockquote: {
            backgroundColor: colors.border + '30',
            borderLeftWidth: 4,
            borderLeftColor: course.color,
            paddingLeft: 12,
            paddingVertical: 8,
            marginVertical: 8,
          },
          table: { borderColor: colors.border },
          th: { backgroundColor: colors.surface, padding: 8 },
          td: { padding: 8, borderColor: colors.border },
        }}
      >
        {lesson.content}
      </Markdown>
    </View>
  );

  const renderScriptures = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.tabTitle, { color: colors.text }]}>
        Scripture References
      </Text>
      {lesson.scriptures.map((scripture, index) => (
        <View
          key={index}
          style={[styles.scriptureCard, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.scriptureRef, { color: course.color }]}>
            {scripture.book} {scripture.chapter}:{scripture.verseStart}
            {scripture.verseEnd && `-${scripture.verseEnd}`}
          </Text>
          <Pressable
            onPress={() => {
              // Navigate to scripture reader if available
              // For now, just show reference
            }}
          >
            <Text style={[styles.readLink, { color: colors.primary }]}>
              Read in app →
            </Text>
          </Pressable>
        </View>
      ))}
      {lesson.scriptures.length === 0 && (
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No scripture references for this lesson
        </Text>
      )}
    </View>
  );

  const renderKeyTerms = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.tabTitle, { color: colors.text }]}>
        Key Terms
      </Text>
      {lesson.keyTerms?.map((term, index) => (
        <View
          key={index}
          style={[styles.termCard, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.termName, { color: course.color }]}>
            {term.term}
          </Text>
          <Text style={[styles.termDefinition, { color: colors.text }]}>
            {term.definition}
          </Text>
        </View>
      ))}
      {(!lesson.keyTerms || lesson.keyTerms.length === 0) && (
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No key terms for this lesson
        </Text>
      )}
    </View>
  );

  const renderDiscussion = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.tabTitle, { color: colors.text }]}>
        Discussion Questions
      </Text>
      {lesson.discussionQuestions?.map((question, index) => (
        <View
          key={index}
          style={[styles.questionCard, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.questionNumber, { color: course.color }]}>
            Question {index + 1}
          </Text>
          <Text style={[styles.questionText, { color: colors.text }]}>
            {question}
          </Text>
        </View>
      ))}

      {/* Historical Context */}
      {lesson.historicalContext && (
        <View style={styles.contextSection}>
          <Text style={[styles.contextTitle, { color: colors.text }]}>
            Historical Context
          </Text>
          <Text style={[styles.contextText, { color: colors.textSecondary }]}>
            {lesson.historicalContext}
          </Text>
        </View>
      )}

      {/* CoC Perspective */}
      {lesson.cocPerspective && (
        <View style={styles.contextSection}>
          <Text style={[styles.contextTitle, { color: colors.text }]}>
            CoC Perspective
          </Text>
          <Text style={[styles.contextText, { color: colors.textSecondary }]}>
            {lesson.cocPerspective}
          </Text>
        </View>
      )}

      {/* Application Challenge */}
      {lesson.applicationChallenge && (
        <View style={[styles.challengeCard, { backgroundColor: course.color + '20' }]}>
          <Text style={[styles.challengeTitle, { color: course.color }]}>
            Application Challenge
          </Text>
          <Text style={[styles.challengeText, { color: colors.text }]}>
            {lesson.applicationChallenge}
          </Text>
        </View>
      )}
    </View>
  );

  const renderMaterials = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.tabTitle, { color: colors.text }]}>
        Historical Materials & Resources
      </Text>
      {lesson.historicalMaterials?.map((material, index) => (
        <Pressable
          key={index}
          style={[styles.materialCard, { backgroundColor: colors.surface }]}
          onPress={() => handleOpenUrl(material.url)}
        >
          <View style={styles.materialHeader}>
            <Text style={[styles.materialType, { color: course.color }]}>
              {material.type.replace(/_/g, ' ').toUpperCase()}
            </Text>
            <Text style={[styles.externalIcon, { color: colors.primary }]}>↗</Text>
          </View>
          <Text style={[styles.materialTitle, { color: colors.text }]}>
            {material.title}
          </Text>
          <Text
            style={[styles.materialUrl, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {material.url}
          </Text>
        </Pressable>
      ))}
      {(!lesson.historicalMaterials || lesson.historicalMaterials.length === 0) && (
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No additional materials for this lesson
        </Text>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: course.color }]}>
        <Text style={styles.headerTitle}>{lesson.title}</Text>
        <View style={styles.headerMeta}>
          <Text style={styles.headerMetaText}>
            {lesson.type} • {lesson.duration} min
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface }]}>
        <Pressable
          style={[
            styles.tab,
            activeTab === 'content' && { borderBottomColor: course.color, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab('content')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'content' ? course.color : colors.textSecondary },
            ]}
          >
            Content
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.tab,
            activeTab === 'scriptures' && { borderBottomColor: course.color, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab('scriptures')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'scriptures' ? course.color : colors.textSecondary },
            ]}
          >
            Scriptures
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.tab,
            activeTab === 'terms' && { borderBottomColor: course.color, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab('terms')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'terms' ? course.color : colors.textSecondary },
            ]}
          >
            Terms
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.tab,
            activeTab === 'discussion' && { borderBottomColor: course.color, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab('discussion')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'discussion' ? course.color : colors.textSecondary },
            ]}
          >
            Discuss
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.tab,
            activeTab === 'materials' && { borderBottomColor: course.color, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab('materials')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'materials' ? course.color : colors.textSecondary },
            ]}
          >
            Resources
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollContent}>
        {activeTab === 'content' && renderMarkdown()}
        {activeTab === 'scriptures' && renderScriptures()}
        {activeTab === 'terms' && renderKeyTerms()}
        {activeTab === 'discussion' && renderDiscussion()}
        {activeTab === 'materials' && renderMaterials()}

        {/* Mark Complete Button */}
        <View style={styles.completeSection}>
          <Pressable
            style={[
              styles.completeButton,
              {
                backgroundColor: lessonCompleted ? '#4CAF50' + '20' : course.color,
                borderWidth: lessonCompleted ? 2 : 0,
                borderColor: '#4CAF50',
              },
            ]}
            onPress={handleMarkComplete}
            disabled={lessonCompleted}
          >
            <Text
              style={[
                styles.completeButtonText,
                { color: lessonCompleted ? '#4CAF50' : '#fff' },
              ]}
            >
              {lessonCompleted ? '✓ Lesson Completed' : 'Mark as Complete'}
            </Text>
          </Pressable>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navButtons}>
          {prevLesson && (
            <Pressable
              style={[styles.navButton, { backgroundColor: colors.surface }]}
              onPress={async () => {
                if (!lessonCompleted) await handleMarkComplete();
                navigation.replace('CoCLesson', { courseId, lessonId: prevLesson.id });
              }}
            >
              <Text style={[styles.navButtonText, { color: colors.text }]}>
                ← Previous
              </Text>
            </Pressable>
          )}
          {nextLesson && (
            <Pressable
              style={[styles.navButton, { backgroundColor: course.color }]}
              onPress={async () => {
                if (!lessonCompleted) await handleMarkComplete();
                navigation.replace('CoCLesson', { courseId, lessonId: nextLesson.id });
              }}
            >
              <Text style={[styles.navButtonText, { color: '#fff' }]}>
                Next Lesson →
              </Text>
            </Pressable>
          )}
          {!nextLesson && (
            <Pressable
              style={[styles.navButton, { backgroundColor: '#4CAF50' }]}
              onPress={async () => {
                if (!lessonCompleted) await handleMarkComplete();
                await markCourseComplete(courseId);
                navigation.navigate('CoCCourseDetail', { courseId });
              }}
            >
              <Text style={[styles.navButtonText, { color: '#fff' }]}>
                ✓ Finish Course
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  headerMeta: {
    flexDirection: 'row',
  },
  headerMetaText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContent: {
    flex: 1,
  },
  markdownContainer: {
    padding: 16,
  },
  tabContent: {
    padding: 16,
  },
  tabTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  scriptureCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  scriptureRef: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  readLink: {
    fontSize: 13,
  },
  termCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  termName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  termDefinition: {
    fontSize: 14,
    lineHeight: 20,
  },
  questionCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  questionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  contextSection: {
    marginTop: 16,
    marginBottom: 12,
  },
  contextTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  contextText: {
    fontSize: 14,
    lineHeight: 22,
  },
  challengeCard: {
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  challengeText: {
    fontSize: 14,
    lineHeight: 22,
  },
  materialCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  materialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  materialType: {
    fontSize: 11,
    fontWeight: '600',
  },
  externalIcon: {
    fontSize: 16,
  },
  materialTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 6,
  },
  materialUrl: {
    fontSize: 12,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  completeSection: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 0,
  },
  completeButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  navButtons: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 32,
  },
  navButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});
