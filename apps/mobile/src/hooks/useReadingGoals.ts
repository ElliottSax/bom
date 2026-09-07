/**
 * Reading Goals Hook
 *
 * Create and track reading goals (chapters, verses, or minutes).
 * Supports daily and weekly goals with progress tracking, streaks, and statistics.
 *
 * Features:
 * - Multiple goal types: chapters, verses, minutes
 * - Daily or weekly periods
 * - Streak tracking (current and longest)
 * - Progress history
 * - Suggested goals for quick setup
 *
 * @module useReadingGoals
 *
 * @example
 * ```typescript
 * const {
 *   activeGoals,
 *   createGoal,
 *   recordProgress,
 *   getGoalStats
 * } = useReadingGoals();
 *
 * // Create a daily goal
 * await createGoal('chapters', 'daily', 1); // 1 chapter per day
 *
 * // Record progress
 * await recordProgress(goalId, 1); // Read 1 chapter
 *
 * // Get statistics
 * const stats = getGoalStats(goalId);
 * // {
 * //   currentProgress: 1,
 * //   target: 1,
 * //   percentComplete: 100,
 * //   currentStreak: 5,
 * //   longestStreak: 12,
 * //   daysCompleted: 45
 * // }
 *
 * // Use suggested goals
 * const { suggestedGoals } = useReadingGoals();
 * // [{ type: 'chapters', period: 'daily', target: 1, label: '1 chapter per day' }, ...]
 * ```
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';

const log = logger.scope('ReadingGoals');

const GOALS_KEY = '@bom_reading_goals';
const GOAL_HISTORY_KEY = '@bom_goal_history';

export type GoalType = 'chapters' | 'minutes' | 'verses';
export type GoalPeriod = 'daily' | 'weekly';

export interface ReadingGoal {
  id: string;
  type: GoalType;
  period: GoalPeriod;
  target: number;
  createdAt: number;
  active: boolean;
}

export interface GoalProgress {
  goalId: string;
  date: string; // YYYY-MM-DD or YYYY-WW for weekly
  progress: number;
  completed: boolean;
}

export interface GoalStats {
  currentProgress: number;
  target: number;
  percentComplete: number;
  daysCompleted: number;
  currentStreak: number;
  longestStreak: number;
  periodLabel: string;
}

const DEFAULT_GOALS: ReadingGoal[] = [];

// Helper to get date string
const getDateString = (date: Date = new Date()): string => {
  return date.toISOString().split('T')[0];
};

// Helper to get week string (YYYY-WW)
const getWeekString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const oneJan = new Date(year, 0, 1);
  const week = Math.ceil(
    ((date.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7
  );
  return `${year}-W${week.toString().padStart(2, '0')}`;
};

/**
 * React hook for reading goal management.
 *
 * @returns Object with goal management methods and state
 *
 * @example
 * ```typescript
 * function GoalsScreen() {
 *   const {
 *     activeGoals,
 *     createGoal,
 *     recordProgress,
 *     getCurrentProgress,
 *     getGoalStats
 *   } = useReadingGoals();
 *
 *   const handleCreateGoal = async () => {
 *     await createGoal('chapters', 'daily', 2); // 2 chapters per day
 *   };
 *
 *   return (
 *     <View>
 *       {activeGoals.map(goal => {
 *         const stats = getGoalStats(goal.id);
 *         return (
 *           <GoalCard
 *             key={goal.id}
 *             goal={goal}
 *             progress={stats.currentProgress}
 *             target={stats.target}
 *             streak={stats.currentStreak}
 *           />
 *         );
 *       })}
 *     </View>
 *   );
 * }
 * ```
 */
export function useReadingGoals() {
  const [goals, setGoals] = useState<ReadingGoal[]>(DEFAULT_GOALS);
  const [history, setHistory] = useState<GoalProgress[]>([]);
  const [loading, setLoading] = useState(true);

  // Load on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [goalsJson, historyJson] = await Promise.all([
        AsyncStorage.getItem(GOALS_KEY),
        AsyncStorage.getItem(GOAL_HISTORY_KEY),
      ]);

      if (goalsJson) {
        setGoals(JSON.parse(goalsJson));
      }
      if (historyJson) {
        setHistory(JSON.parse(historyJson));
      }
    } catch (err) {
      log.error('Failed to load goals', err);
    } finally {
      setLoading(false);
    }
  };

  const saveGoals = async (newGoals: ReadingGoal[]) => {
    try {
      await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(newGoals));
      setGoals(newGoals);
    } catch (err) {
      log.error('Failed to save goals', err);
    }
  };

  const saveHistory = async (newHistory: GoalProgress[]) => {
    try {
      await AsyncStorage.setItem(GOAL_HISTORY_KEY, JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (err) {
      log.error('Failed to save history', err);
    }
  };

  // Create a new goal
  const createGoal = useCallback(
    async (type: GoalType, period: GoalPeriod, target: number) => {
      const newGoal: ReadingGoal = {
        id: `goal-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        type,
        period,
        target,
        createdAt: Date.now(),
        active: true,
      };

      // Deactivate other goals of the same type/period
      const updatedGoals = goals.map((g) =>
        g.type === type && g.period === period ? { ...g, active: false } : g
      );

      await saveGoals([...updatedGoals, newGoal]);
      return newGoal;
    },
    [goals]
  );

  // Delete a goal
  const deleteGoal = useCallback(
    async (goalId: string) => {
      await saveGoals(goals.filter((g) => g.id !== goalId));
    },
    [goals]
  );

  // Toggle goal active state
  const toggleGoal = useCallback(
    async (goalId: string) => {
      const goal = goals.find((g) => g.id === goalId);
      if (!goal) return;

      // If activating, deactivate other goals of same type/period
      const updatedGoals = goals.map((g) => {
        if (g.id === goalId) {
          return { ...g, active: !g.active };
        }
        if (g.type === goal.type && g.period === goal.period && !goal.active) {
          return { ...g, active: false };
        }
        return g;
      });

      await saveGoals(updatedGoals);
    },
    [goals]
  );

  // Record progress toward a goal
  const recordProgress = useCallback(
    async (goalId: string, amount: number) => {
      const goal = goals.find((g) => g.id === goalId);
      if (!goal) return;

      const periodKey = goal.period === 'daily' ? getDateString() : getWeekString();

      const existingIndex = history.findIndex((h) => h.goalId === goalId && h.date === periodKey);

      let newHistory: GoalProgress[];
      if (existingIndex >= 0) {
        newHistory = [...history];
        const newProgress = newHistory[existingIndex].progress + amount;
        newHistory[existingIndex] = {
          ...newHistory[existingIndex],
          progress: newProgress,
          completed: newProgress >= goal.target,
        };
      } else {
        newHistory = [
          ...history,
          {
            goalId,
            date: periodKey,
            progress: amount,
            completed: amount >= goal.target,
          },
        ];
      }

      await saveHistory(newHistory);
    },
    [goals, history]
  );

  // Get current progress for a goal
  const getCurrentProgress = useCallback(
    (goalId: string): number => {
      const goal = goals.find((g) => g.id === goalId);
      if (!goal) return 0;

      const periodKey = goal.period === 'daily' ? getDateString() : getWeekString();

      const entry = history.find((h) => h.goalId === goalId && h.date === periodKey);

      return entry?.progress || 0;
    },
    [goals, history]
  );

  // Get stats for a goal
  const getGoalStats = useCallback(
    (goalId: string): GoalStats | null => {
      const goal = goals.find((g) => g.id === goalId);
      if (!goal) return null;

      const periodKey = goal.period === 'daily' ? getDateString() : getWeekString();

      const currentEntry = history.find((h) => h.goalId === goalId && h.date === periodKey);
      const currentProgress = currentEntry?.progress || 0;

      // Count completed periods
      const goalHistory = history.filter((h) => h.goalId === goalId);
      const daysCompleted = goalHistory.filter((h) => h.completed).length;

      // Calculate streaks
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      // Sort history by date descending
      const sortedHistory = [...goalHistory].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      for (const entry of sortedHistory) {
        if (entry.completed) {
          tempStreak++;
          if (entry.date === periodKey || tempStreak > 0) {
            currentStreak = tempStreak;
          }
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          if (entry.date !== periodKey) {
            currentStreak = 0;
          }
          tempStreak = 0;
        }
      }

      return {
        currentProgress,
        target: goal.target,
        percentComplete: Math.min(100, Math.round((currentProgress / goal.target) * 100)),
        daysCompleted,
        currentStreak,
        longestStreak,
        periodLabel: goal.period === 'daily' ? 'Today' : 'This Week',
      };
    },
    [goals, history]
  );

  // Get active goals
  const activeGoals = useMemo(() => goals.filter((g) => g.active), [goals]);

  // Get goal type label
  const getTypeLabel = (type: GoalType): string => {
    switch (type) {
      case 'chapters':
        return 'chapters';
      case 'minutes':
        return 'minutes';
      case 'verses':
        return 'verses';
      default:
        return '';
    }
  };

  // Get suggested goals
  const suggestedGoals = [
    {
      type: 'chapters' as GoalType,
      period: 'daily' as GoalPeriod,
      target: 1,
      label: '1 chapter per day',
    },
    {
      type: 'chapters' as GoalType,
      period: 'daily' as GoalPeriod,
      target: 2,
      label: '2 chapters per day',
    },
    {
      type: 'chapters' as GoalType,
      period: 'weekly' as GoalPeriod,
      target: 7,
      label: '7 chapters per week',
    },
    {
      type: 'chapters' as GoalType,
      period: 'weekly' as GoalPeriod,
      target: 14,
      label: '14 chapters per week',
    },
    {
      type: 'minutes' as GoalType,
      period: 'daily' as GoalPeriod,
      target: 15,
      label: '15 min per day',
    },
    {
      type: 'minutes' as GoalType,
      period: 'daily' as GoalPeriod,
      target: 30,
      label: '30 min per day',
    },
  ];

  return {
    goals,
    activeGoals,
    history,
    loading,
    createGoal,
    deleteGoal,
    toggleGoal,
    recordProgress,
    getCurrentProgress,
    getGoalStats,
    getTypeLabel,
    suggestedGoals,
  };
}
