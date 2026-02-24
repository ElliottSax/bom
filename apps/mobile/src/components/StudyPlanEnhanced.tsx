/**
 * Enhanced Study Plan Component
 *
 * Adds reminder scheduling, plan templates, and advanced progress tracking
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Switch,
  Alert,
  Modal,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import PushNotification from 'react-native-push-notification';
import { useTheme } from '../contexts/ThemeContext';
import type { StudyPlan as BaseStudyPlan, StudyPlanContent, ThemeColors } from '../types';
import { logger } from '../utils/logger';

const log = logger.scope('StudyPlanEnhanced');

const STUDY_PLANS_KEY = '@bom_study_plans';
const ACTIVE_PLAN_KEY = '@bom_active_plan';
const STUDY_STATS_KEY = '@bom_study_stats';

// Plan Templates
const PLAN_TEMPLATES = [
  {
    id: 'bom-year',
    name: 'Book of Mormon in One Year',
    description: 'Read the entire Book of Mormon in 365 days',
    duration: 365,
    content: [
      { editionId: 'coc-bom-1908', book: 'I Nephi', startChapter: 1, endChapter: 7 },
      { editionId: 'coc-bom-1908', book: 'II Nephi', startChapter: 1, endChapter: 15 },
      { editionId: 'coc-bom-1908', book: 'Jacob', startChapter: 1, endChapter: 5 },
      // ... more books
    ],
  },
  {
    id: 'bom-90',
    name: '90-Day Book of Mormon Challenge',
    description: 'Intensive study of the Book of Mormon in 90 days',
    duration: 90,
    frequency: 'daily',
    pagesPerDay: 6,
  },
  {
    id: 'dc-year',
    name: 'Doctrine & Covenants in One Year',
    description: 'Study all D&C sections over the course of a year',
    duration: 365,
    content: [
      { editionId: 'coc-dc-2017', startSection: 1, endSection: 167 },
    ],
  },
  {
    id: 'moroni-promise',
    name: "Moroni's Promise Challenge",
    description: 'Focus on Moroni 10 with deep study and prayer',
    duration: 30,
    content: [
      { editionId: 'coc-bom-1908', book: 'Moroni', startChapter: 10, endChapter: 10 },
    ],
  },
  {
    id: 'christ-words',
    name: 'Words of Christ',
    description: 'Study all the words of Jesus in the Book of Mormon',
    duration: 60,
    thematic: true,
    tags: ['Jesus Christ', 'Sermon', 'Teachings'],
  },
];

// Extended StudyPlan interface with enhanced features
interface StudyPlan extends BaseStudyPlan {
  templateId?: string;
  customDays?: number[]; // 0=Sun, 6=Sat
  longestStreak: number;
  totalDaysCompleted: number;
  completionRate: number;
  badges?: string[];
  versesPerDay?: number;
  startSection?: number;
  endSection?: number;
}

// Extend StudyPlanContent for additional properties
interface StudyContent extends StudyPlanContent {
  versesPerDay?: number;
  startSection?: number;
  endSection?: number;
}

interface StudyProgress {
  completed: boolean;
  completedAt?: string;
  notes?: string;
  versesRead?: number;
  timeSpent?: number; // in minutes
  highlights?: number;
  insights?: string[];
}

interface StudyStats {
  totalPlansCreated: number;
  totalPlansCompleted: number;
  totalDaysStudied: number;
  totalVersesRead: number;
  totalTimeSpent: number; // in minutes
  favoriteBook?: string;
  bestStreak: number;
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress?: number;
  target?: number;
}

const ACHIEVEMENTS = [
  { id: 'first-day', name: 'First Day', description: 'Complete your first day of study', icon: '🌟', target: 1 },
  { id: 'week-warrior', name: 'Week Warrior', description: 'Study for 7 consecutive days', icon: '💪', target: 7 },
  { id: 'month-master', name: 'Month Master', description: 'Study for 30 consecutive days', icon: '🏆', target: 30 },
  { id: 'century-club', name: 'Century Club', description: 'Study for 100 days total', icon: '💯', target: 100 },
  { id: 'scripture-scholar', name: 'Scripture Scholar', description: 'Read 1000 verses', icon: '📚', target: 1000 },
  { id: 'early-bird', name: 'Early Bird', description: 'Study before 7 AM', icon: '🌅' },
  { id: 'night-owl', name: 'Night Owl', description: 'Study after 10 PM', icon: '🦉' },
  { id: 'perfect-week', name: 'Perfect Week', description: 'Complete all planned days in a week', icon: '✨' },
];

export function EnhancedStudyPlanManager() {
  const { colors, isDark } = useTheme();
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [activePlan, setActivePlan] = useState<StudyPlan | null>(null);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof PLAN_TEMPLATES[0] | null>(null);
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [loading, setLoading] = useState(false);
  const progressAnimation = useRef(new Animated.Value(0)).current;

  // Setup push notifications
  useEffect(() => {
    if (Platform.OS !== 'web') {
      PushNotification.configure({
        onNotification: function (notification) {
          log.debug('Notification:', { notification });
        },
        permissions: {
          alert: true,
          badge: true,
          sound: true,
        },
        popInitialNotification: true,
        requestPermissions: true,
      });
    }
  }, []);

  // Load plans and stats
  useEffect(() => {
    loadData();
    checkAchievements();
  }, []);

  // Animate progress when plan changes
  useEffect(() => {
    if (activePlan) {
      const completion = activePlan.completionRate;
      Animated.timing(progressAnimation, {
        toValue: completion,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [activePlan]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [storedPlans, activePlanId, storedStats] = await Promise.all([
        AsyncStorage.getItem(STUDY_PLANS_KEY),
        AsyncStorage.getItem(ACTIVE_PLAN_KEY),
        AsyncStorage.getItem(STUDY_STATS_KEY),
      ]);

      if (storedPlans) {
        const parsedPlans = JSON.parse(storedPlans);
        setPlans(parsedPlans);

        if (activePlanId) {
          const active = parsedPlans.find((p: StudyPlan) => p.id === activePlanId);
          if (active) {
            setActivePlan(updatePlanStats(active));
          }
        }
      }

      if (storedStats) {
        setStats(JSON.parse(storedStats));
      } else {
        // Initialize stats
        const initialStats: StudyStats = {
          totalPlansCreated: 0,
          totalPlansCompleted: 0,
          totalDaysStudied: 0,
          totalVersesRead: 0,
          totalTimeSpent: 0,
          bestStreak: 0,
          achievements: ACHIEVEMENTS.map(a => ({ ...a, progress: 0 })),
        };
        setStats(initialStats);
        await AsyncStorage.setItem(STUDY_STATS_KEY, JSON.stringify(initialStats));
      }
    } catch (error) {
      log.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePlanStats = (plan: StudyPlan): StudyPlan => {
    const completedDays = Object.values(plan.progress).filter(p => p.completed).length;
    const totalDays = Math.floor(
      (new Date(plan.endDate).getTime() - new Date(plan.startDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    const elapsedDays = Math.floor(
      (new Date().getTime() - new Date(plan.startDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    const expectedDays = Math.min(elapsedDays, totalDays);

    return {
      ...plan,
      totalDaysCompleted: completedDays,
      completionRate: expectedDays > 0 ? (completedDays / expectedDays) * 100 : 0,
      streak: calculateStreak(plan),
      longestStreak: Math.max(plan.longestStreak || 0, calculateStreak(plan)),
    };
  };

  const calculateStreak = (plan: StudyPlan): number => {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      if (plan.progress[dateStr]?.completed) {
        streak++;
      } else if (i > 0) {
        // Don't break if today is not completed yet
        break;
      }
    }

    return streak;
  };

  const scheduleReminder = (plan: StudyPlan) => {
    if (!plan.reminders || !plan.reminderTime || Platform.OS === 'web') return;

    const [hours, minutes] = plan.reminderTime.split(':').map(Number);

    PushNotification.localNotificationSchedule({
      id: plan.id,
      title: '📖 Time to Study!',
      message: `Time for your ${plan.name} reading`,
      playSound: true,
      soundName: 'default',
      repeatType: plan.frequency === 'daily' ? 'day' : 'week',
      date: new Date(new Date().setHours(hours, minutes, 0, 0)),
    });
  };

  const cancelReminder = (planId: string) => {
    if (Platform.OS !== 'web') {
      PushNotification.cancelLocalNotifications({ id: planId });
    }
  };

  const createPlanFromTemplate = async (template: typeof PLAN_TEMPLATES[0]) => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + template.duration);

    const newPlan: StudyPlan = {
      id: `plan-${Date.now()}`,
      name: template.name,
      description: template.description,
      templateId: template.id,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      frequency: template.frequency || 'daily',
      content: template.content || [],
      progress: {},
      reminders: true,
      reminderTime: '08:00',
      createdAt: new Date().toISOString(),
      streak: 0,
      longestStreak: 0,
      totalDaysCompleted: 0,
      completionRate: 0,
    };

    const updatedPlans = [...plans, newPlan];
    await savePlans(updatedPlans);
    setActivePlan(newPlan);
    await AsyncStorage.setItem(ACTIVE_PLAN_KEY, newPlan.id);
    scheduleReminder(newPlan);

    // Update stats
    if (stats) {
      const updatedStats = {
        ...stats,
        totalPlansCreated: stats.totalPlansCreated + 1,
      };
      setStats(updatedStats);
      await AsyncStorage.setItem(STUDY_STATS_KEY, JSON.stringify(updatedStats));
    }

    setShowTemplates(false);
    Alert.alert('Success', `Created "${template.name}" study plan!`);
  };

  const savePlans = async (newPlans: StudyPlan[]) => {
    try {
      await AsyncStorage.setItem(STUDY_PLANS_KEY, JSON.stringify(newPlans));
      setPlans(newPlans);
    } catch (error) {
      log.error('Error saving plans:', error);
    }
  };

  const markTodayComplete = async () => {
    if (!activePlan) return;

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const timeSpent = Math.floor(Math.random() * 30) + 10; // Mock time spent

    const updatedPlan = updatePlanStats({
      ...activePlan,
      progress: {
        ...activePlan.progress,
        [today]: {
          completed: true,
          completedAt: now.toISOString(),
          timeSpent,
        },
      },
    });

    const updatedPlans = plans.map(p =>
      p.id === activePlan.id ? updatedPlan : p
    );

    await savePlans(updatedPlans);
    setActivePlan(updatedPlan);

    // Update global stats
    if (stats) {
      const updatedStats = {
        ...stats,
        totalDaysStudied: stats.totalDaysStudied + 1,
        totalTimeSpent: stats.totalTimeSpent + timeSpent,
        bestStreak: Math.max(stats.bestStreak, updatedPlan.streak),
      };
      setStats(updatedStats);
      await AsyncStorage.setItem(STUDY_STATS_KEY, JSON.stringify(updatedStats));
    }

    checkAchievements();

    // Celebrate milestone streaks
    if (updatedPlan.streak === 7) {
      Alert.alert('🎉 Week Warrior!', 'You\'ve studied for 7 consecutive days!');
    } else if (updatedPlan.streak === 30) {
      Alert.alert('🏆 Month Master!', 'Amazing! 30 days of consistent study!');
    } else if (updatedPlan.streak === 100) {
      Alert.alert('💯 Century Club!', 'Incredible! 100 days of scripture study!');
    }
  };

  const checkAchievements = async () => {
    if (!stats) return;

    const updatedAchievements = [...stats.achievements];
    let newUnlocks = false;

    // Check streak achievements
    if (stats.totalDaysStudied >= 1 && !updatedAchievements.find(a => a.id === 'first-day')?.unlockedAt) {
      const achievement = updatedAchievements.find(a => a.id === 'first-day');
      if (achievement) {
        achievement.unlockedAt = new Date().toISOString();
        newUnlocks = true;
        Alert.alert('🌟 Achievement Unlocked!', 'First Day - You\'ve started your scripture journey!');
      }
    }

    if (stats.bestStreak >= 7 && !updatedAchievements.find(a => a.id === 'week-warrior')?.unlockedAt) {
      const achievement = updatedAchievements.find(a => a.id === 'week-warrior');
      if (achievement) {
        achievement.unlockedAt = new Date().toISOString();
        newUnlocks = true;
      }
    }

    if (newUnlocks) {
      const updatedStats = { ...stats, achievements: updatedAchievements };
      setStats(updatedStats);
      await AsyncStorage.setItem(STUDY_STATS_KEY, JSON.stringify(updatedStats));
    }
  };

  const getReadingForToday = () => {
    if (!activePlan) return null;

    const startDate = new Date(activePlan.startDate);
    const today = new Date();
    const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const content = activePlan.content[0];
    if (!content) return null;

    const totalChapters = (content.endChapter || 0) - (content.startChapter || 0) + 1;
    const currentChapter = Math.min(
      (content.startChapter || 0) + daysSinceStart,
      content.endChapter || 0
    );

    return {
      book: content.book,
      chapter: currentChapter,
      editionId: content.editionId,
    };
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const todayProgress = activePlan ? activePlan.progress[new Date().toISOString().split('T')[0]] : null;
  const todayReading = getReadingForToday();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Stats Overview */}
      {stats && (
        <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statsTitle, { color: colors.text }]}>Your Journey</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{stats.totalDaysStudied}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Days Studied</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{stats.bestStreak}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Best Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{Math.floor(stats.totalTimeSpent / 60)}h</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Time Spent</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {stats.achievements.filter(a => a.unlockedAt).length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Achievements</Text>
            </View>
          </View>
        </View>
      )}

      {/* Active Plan Card */}
      {activePlan ? (
        <View style={[styles.activePlanCard, { backgroundColor: colors.card }]}>
          <View style={styles.planHeader}>
            <Text style={[styles.planTitle, { color: colors.text }]}>{activePlan.name}</Text>
            <View style={[styles.streakBadge, { backgroundColor: colors.accent }]}>
              <Text style={styles.streakText}>🔥 {activePlan.streak}</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: colors.primary,
                    width: progressAnimation.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>
              {Math.round(activePlan.completionRate)}% Complete
            </Text>
          </View>

          {todayReading && (
            <View style={styles.todaySection}>
              <Text style={[styles.todayLabel, { color: colors.textSecondary }]}>Today's Reading</Text>
              <Pressable style={[styles.readingCard, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.todayContent, { color: colors.primary }]}>
                  {todayReading.book} {todayReading.chapter}
                </Text>
                <Text style={styles.readingArrow}>→</Text>
              </Pressable>
            </View>
          )}

          <View style={styles.actionButtons}>
            {todayProgress?.completed ? (
              <View style={[styles.completedBadge, { backgroundColor: colors.successLight }]}>
                <Text style={[styles.completedText, { color: colors.success }]}>✓ Completed Today</Text>
              </View>
            ) : (
              <Pressable
                style={[styles.markCompleteButton, { backgroundColor: colors.primary }]}
                onPress={markTodayComplete}
              >
                <Text style={styles.markCompleteText}>Mark Complete</Text>
              </Pressable>
            )}
          </View>

          {/* Mini Calendar */}
          <MiniProgressCalendar plan={activePlan} colors={colors} />
        </View>
      ) : (
        <View style={[styles.noPlanCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.noPlanText, { color: colors.textSecondary }]}>
            Start your scripture study journey
          </Text>
          <Pressable
            style={[styles.createPlanButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowTemplates(true)}
          >
            <Text style={styles.createPlanButtonText}>Choose a Study Plan</Text>
          </Pressable>
        </View>
      )}

      {/* Plan Templates Modal */}
      <Modal
        visible={showTemplates}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTemplates(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Choose a Study Plan</Text>
            <ScrollView style={styles.templateList}>
              {PLAN_TEMPLATES.map(template => (
                <Pressable
                  key={template.id}
                  style={[styles.templateCard, { backgroundColor: colors.background }]}
                  onPress={() => createPlanFromTemplate(template)}
                >
                  <Text style={[styles.templateName, { color: colors.text }]}>{template.name}</Text>
                  <Text style={[styles.templateDescription, { color: colors.textSecondary }]}>
                    {template.description}
                  </Text>
                  <Text style={[styles.templateDuration, { color: colors.primary }]}>
                    {template.duration} days
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable
              style={[styles.closeButton, { backgroundColor: colors.border }]}
              onPress={() => setShowTemplates(false)}
            >
              <Text style={[styles.closeButtonText, { color: colors.text }]}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Achievements Section */}
      {stats && stats.achievements.filter(a => a.unlockedAt).length > 0 && (
        <View style={[styles.achievementsSection, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Achievements</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {stats.achievements
              .filter(a => a.unlockedAt)
              .map(achievement => (
                <View key={achievement.id} style={[styles.achievementBadge, { backgroundColor: colors.primaryLight }]}>
                  <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                  <Text style={[styles.achievementName, { color: colors.text }]}>{achievement.name}</Text>
                </View>
              ))}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
}

// Mini Calendar Component
function MiniProgressCalendar({ plan, colors }: { plan: StudyPlan; colors: ThemeColors }) {
  const today = new Date();
  // const startDate = new Date(plan.startDate); // Reserved for future date range calculation
  const currentWeek = [];

  for (let i = -3; i <= 3; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const progress = plan.progress[dateStr];

    currentWeek.push({
      date,
      dateStr,
      isToday: i === 0,
      isCompleted: progress?.completed,
      isFuture: date > today,
    });
  }

  return (
    <View style={styles.miniCalendar}>
      <Text style={[styles.miniCalendarTitle, { color: colors.textSecondary }]}>This Week</Text>
      <View style={styles.weekDays}>
        {currentWeek.map((day, index) => (
          <View
            key={index}
            style={[
              styles.dayCircle,
              day.isToday && [styles.todayCircle, { borderColor: colors.primary }],
              day.isCompleted && [styles.completedCircle, { backgroundColor: colors.success }],
            ]}
          >
            <Text style={[styles.dayNumber, day.isCompleted && styles.completedDayText, { color: day.isCompleted ? 'white' : colors.text }]}>
              {day.date.getDate()}
            </Text>
            <Text style={[styles.dayName, { color: day.isToday ? colors.primary : colors.textSecondary }]}>
              {day.date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsCard: {
    margin: 15,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  activePlanCard: {
    margin: 15,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  streakBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakText: {
    color: 'white',
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
  },
  todaySection: {
    marginBottom: 20,
  },
  todayLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  readingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
  },
  todayContent: {
    fontSize: 18,
    fontWeight: '600',
  },
  readingArrow: {
    fontSize: 20,
    color: '#0066cc',
  },
  actionButtons: {
    marginBottom: 20,
  },
  markCompleteButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  markCompleteText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  completedBadge: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  completedText: {
    fontWeight: '600',
    fontSize: 16,
  },
  miniCalendar: {
    marginTop: 10,
  },
  miniCalendarTitle: {
    fontSize: 14,
    marginBottom: 10,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCircle: {
    width: 42,
    alignItems: 'center',
    padding: 5,
  },
  todayCircle: {
    borderWidth: 2,
    borderRadius: 21,
  },
  completedCircle: {
    borderRadius: 21,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  completedDayText: {
    color: 'white',
  },
  dayName: {
    fontSize: 11,
  },
  noPlanCard: {
    margin: 15,
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  noPlanText: {
    fontSize: 16,
    marginBottom: 20,
  },
  createPlanButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createPlanButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  templateList: {
    maxHeight: 400,
  },
  templateCard: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  templateDescription: {
    fontSize: 14,
    marginBottom: 5,
  },
  templateDuration: {
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    marginTop: 15,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontWeight: '600',
  },
  achievementsSection: {
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  achievementBadge: {
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 80,
  },
  achievementIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  achievementName: {
    fontSize: 11,
    textAlign: 'center',
  },
});