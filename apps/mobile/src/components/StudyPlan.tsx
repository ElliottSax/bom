/**
 * Study Plan Component
 *
 * Creates and manages scripture reading plans with progress tracking
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { logger } from '../utils/logger';

const log = logger.scope('StudyPlan');

const STUDY_PLANS_KEY = '@bom_study_plans';
const ACTIVE_PLAN_KEY = '@bom_active_plan';

interface StudyPlan {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  frequency: 'daily' | 'weekdays' | 'weekly' | 'custom';
  customDays?: number[]; // 0=Sun, 6=Sat
  content: StudyContent[];
  progress: { [date: string]: StudyProgress };
  reminders: boolean;
  reminderTime?: string; // HH:MM format
  createdAt: string;
  streak: number;
}

interface StudyContent {
  editionId: string;
  book: string;
  startChapter: number;
  endChapter: number;
  versesPerDay?: number;
}

interface StudyProgress {
  completed: boolean;
  completedAt?: string;
  notes?: string;
  versesRead?: number;
}

export function StudyPlanManager() {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [activePlan, setActivePlan] = useState<StudyPlan | null>(null);
  const [showCreatePlan, setShowCreatePlan] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadPlansAsync = async () => {
      if (isMounted) {
        await loadPlans();
      }
    };

    loadPlansAsync();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  const loadPlans = async () => {
    try {
      const storedPlans = await AsyncStorage.getItem(STUDY_PLANS_KEY);
      const activePlanId = await AsyncStorage.getItem(ACTIVE_PLAN_KEY);

      if (storedPlans) {
        const parsedPlans = JSON.parse(storedPlans);
        setPlans(parsedPlans);

        if (activePlanId) {
          const active = parsedPlans.find((p: StudyPlan) => p.id === activePlanId);
          setActivePlan(active || null);
        }
      }
    } catch (error) {
      log.error('Error loading study plans:', error);
    }
  };

  const savePlans = async (newPlans: StudyPlan[]) => {
    try {
      await AsyncStorage.setItem(STUDY_PLANS_KEY, JSON.stringify(newPlans));
      setPlans(newPlans);
    } catch (error) {
      log.error('Error saving study plans:', error);
    }
  };

  const getTodayProgress = () => {
    if (!activePlan) return null;

    const today = new Date().toISOString().split('T')[0];
    return activePlan.progress[today];
  };

  const markTodayComplete = async () => {
    if (!activePlan) return;

    const today = new Date().toISOString().split('T')[0];
    const updatedPlan = {
      ...activePlan,
      progress: {
        ...activePlan.progress,
        [today]: {
          completed: true,
          completedAt: new Date().toISOString(),
        },
      },
      streak: calculateStreak({ ...activePlan, progress: {
        ...activePlan.progress,
        [today]: { completed: true, completedAt: new Date().toISOString() }
      }}),
    };

    const updatedPlans = plans.map(p =>
      p.id === activePlan.id ? updatedPlan : p
    );

    await savePlans(updatedPlans);
    setActivePlan(updatedPlan);
  };

  const calculateStreak = (plan: StudyPlan): number => {
    let streak = 0;
    const today = new Date();
    const dates = Object.keys(plan.progress).sort().reverse();

    for (const dateStr of dates) {
      const date = new Date(dateStr);
      if (date > today) continue;

      if (plan.progress[dateStr]?.completed) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const getReadingForToday = () => {
    if (!activePlan) return null;

    // Calculate what should be read today based on the plan
    const startDate = new Date(activePlan.startDate);
    const today = new Date();
    const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // This is simplified - would need more complex calculation based on content
    const content = activePlan.content[0];
    if (!content) return null;

    const totalChapters = content.endChapter - content.startChapter + 1;
    const currentChapter = Math.min(
      content.startChapter + daysSinceStart,
      content.endChapter
    );

    return {
      book: content.book,
      chapter: currentChapter,
      editionId: content.editionId,
    };
  };

  const todayProgress = getTodayProgress();
  const todayReading = getReadingForToday();

  return (
    <ScrollView style={styles.container}>
      {/* Active Plan Card */}
      {activePlan ? (
        <View style={styles.activePlanCard}>
          <View style={styles.planHeader}>
            <Text style={styles.planTitle}>{activePlan.name}</Text>
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>🔥 {activePlan.streak}</Text>
            </View>
          </View>

          {todayReading && (
            <View style={styles.todaySection}>
              <Text style={styles.todayLabel}>Today's Reading</Text>
              <Text style={styles.todayContent}>
                {todayReading.book} {todayReading.chapter}
              </Text>
            </View>
          )}

          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>Today's Progress</Text>
            {todayProgress?.completed ? (
              <View style={styles.completedBadge}>
                <Text style={styles.completedText}>✓ Completed</Text>
              </View>
            ) : (
              <Pressable style={styles.markCompleteButton} onPress={markTodayComplete}>
                <Text style={styles.markCompleteText}>Mark Complete</Text>
              </Pressable>
            )}
          </View>

          {/* Progress Calendar */}
          <ProgressCalendar plan={activePlan} />
        </View>
      ) : (
        <View style={styles.noPlanCard}>
          <Text style={styles.noPlanText}>No active study plan</Text>
          <Pressable
            style={styles.createPlanButton}
            onPress={() => setShowCreatePlan(true)}
          >
            <Text style={styles.createPlanButtonText}>Create Study Plan</Text>
          </Pressable>
        </View>
      )}

      {/* Plan List */}
      <View style={styles.plansSection}>
        <Text style={styles.sectionTitle}>Your Study Plans</Text>
        {plans.map(plan => (
          <PlanListItem
            key={plan.id}
            plan={plan}
            isActive={plan.id === activePlan?.id}
            onActivate={() => {
              setActivePlan(plan);
              AsyncStorage.setItem(ACTIVE_PLAN_KEY, plan.id);
            }}
          />
        ))}
      </View>

      {/* Create Plan Modal would go here */}
    </ScrollView>
  );
}

function ProgressCalendar({ plan }: { plan: StudyPlan }) {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const progress = plan.progress[dateStr];
      const isToday = day === today.getDate();
      const isCompleted = progress?.completed;

      days.push(
        <View
          key={day}
          style={[
            styles.calendarDay,
            isToday && styles.calendarToday,
            isCompleted && styles.calendarCompleted,
          ]}
        >
          <Text
            style={[
              styles.calendarDayText,
              isCompleted && styles.calendarCompletedText,
            ]}
          >
            {day}
          </Text>
        </View>
      );
    }

    return days;
  };

  return (
    <View style={styles.calendar}>
      <Text style={styles.calendarTitle}>
        {new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric'
        })}
      </Text>
      <View style={styles.calendarWeekdays}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <Text key={index} style={styles.calendarWeekday}>{day}</Text>
        ))}
      </View>
      <View style={styles.calendarGrid}>
        {renderCalendar()}
      </View>
    </View>
  );
}

function PlanListItem({
  plan,
  isActive,
  onActivate
}: {
  plan: StudyPlan;
  isActive: boolean;
  onActivate: () => void;
}) {
  const completionRate = Math.round(
    (Object.values(plan.progress).filter(p => p.completed).length /
     Object.keys(plan.progress).length) * 100
  ) || 0;

  return (
    <Pressable
      style={[styles.planItem, isActive && styles.planItemActive]}
      onPress={onActivate}
    >
      <View style={styles.planItemHeader}>
        <Text style={styles.planItemTitle}>{plan.name}</Text>
        {isActive && <Text style={styles.activeBadge}>ACTIVE</Text>}
      </View>
      <Text style={styles.planItemDescription}>{plan.description}</Text>
      <View style={styles.planItemStats}>
        <Text style={styles.planItemStat}>🔥 {plan.streak} day streak</Text>
        <Text style={styles.planItemStat}>📊 {completionRate}% complete</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  activePlanCard: {
    backgroundColor: 'white',
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
    color: '#333',
  },
  streakBadge: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakText: {
    color: 'white',
    fontWeight: '600',
  },
  todaySection: {
    marginBottom: 20,
  },
  todayLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  todayContent: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0066cc',
  },
  progressSection: {
    marginBottom: 20,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  markCompleteButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  markCompleteText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  completedBadge: {
    backgroundColor: '#e8f5e9',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  completedText: {
    color: '#4caf50',
    fontWeight: '600',
    fontSize: 16,
  },
  noPlanCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  noPlanText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  createPlanButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createPlanButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  plansSection: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  planItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  planItemActive: {
    borderColor: '#0066cc',
    borderWidth: 2,
  },
  planItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  planItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  activeBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0066cc',
  },
  planItemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  planItemStats: {
    flexDirection: 'row',
    gap: 15,
  },
  planItemStat: {
    fontSize: 13,
    color: '#999',
  },
  calendar: {
    marginTop: 20,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  calendarWeekdays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 5,
  },
  calendarWeekday: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  calendarDayText: {
    fontSize: 14,
    color: '#333',
  },
  calendarToday: {
    backgroundColor: '#e3f2fd',
    borderRadius: 20,
  },
  calendarCompleted: {
    backgroundColor: '#4caf50',
    borderRadius: 20,
  },
  calendarCompletedText: {
    color: 'white',
    fontWeight: '600',
  },
});