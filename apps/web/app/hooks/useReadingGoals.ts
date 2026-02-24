'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { logger } from '../utils/logger';

const log = logger.scope('ReadingGoals');

const GOALS_KEY = 'coc-reading-goals';
const GOAL_HISTORY_KEY = 'coc-goal-history';

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
  date: string;
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

const getDateString = (date: Date = new Date()): string => date.toISOString().split('T')[0];

const getWeekString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const oneJan = new Date(year, 0, 1);
  const week = Math.ceil(((date.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7);
  return `${year}-W${week.toString().padStart(2, '0')}`;
};

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

export function useReadingGoals() {
  const [goals, setGoals] = useState<ReadingGoal[]>(() => loadFromStorage(GOALS_KEY, []));
  const [history, setHistory] = useState<GoalProgress[]>(() => loadFromStorage(GOAL_HISTORY_KEY, []));

  useEffect(() => {
    try { localStorage.setItem(GOALS_KEY, JSON.stringify(goals)); } catch (e) { log.error('Save goals failed', e instanceof Error ? e : undefined); }
  }, [goals]);

  useEffect(() => {
    try { localStorage.setItem(GOAL_HISTORY_KEY, JSON.stringify(history)); } catch (e) { log.error('Save history failed', e instanceof Error ? e : undefined); }
  }, [history]);

  const createGoal = useCallback((type: GoalType, period: GoalPeriod, target: number) => {
    const newGoal: ReadingGoal = {
      id: `goal-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      type, period, target, createdAt: Date.now(), active: true,
    };
    setGoals(prev => [
      ...prev.map(g => g.type === type && g.period === period ? { ...g, active: false } : g),
      newGoal,
    ]);
    return newGoal;
  }, []);

  const deleteGoal = useCallback((goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
  }, []);

  const toggleGoal = useCallback((goalId: string) => {
    setGoals(prev => {
      const goal = prev.find(g => g.id === goalId);
      if (!goal) return prev;
      return prev.map(g => {
        if (g.id === goalId) return { ...g, active: !g.active };
        if (g.type === goal.type && g.period === goal.period && !goal.active) return { ...g, active: false };
        return g;
      });
    });
  }, []);

  const recordProgress = useCallback((goalId: string, amount: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    const periodKey = goal.period === 'daily' ? getDateString() : getWeekString();

    setHistory(prev => {
      const idx = prev.findIndex(h => h.goalId === goalId && h.date === periodKey);
      if (idx >= 0) {
        const updated = [...prev];
        const newProgress = updated[idx].progress + amount;
        updated[idx] = { ...updated[idx], progress: newProgress, completed: newProgress >= goal.target };
        return updated;
      }
      return [...prev, { goalId, date: periodKey, progress: amount, completed: amount >= goal.target }];
    });
  }, [goals]);

  const getGoalStats = useCallback((goalId: string): GoalStats | null => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return null;

    const periodKey = goal.period === 'daily' ? getDateString() : getWeekString();
    const currentEntry = history.find(h => h.goalId === goalId && h.date === periodKey);
    const currentProgress = currentEntry?.progress || 0;
    const goalHistory = history.filter(h => h.goalId === goalId);
    const daysCompleted = goalHistory.filter(h => h.completed).length;

    let currentStreak = 0, longestStreak = 0, tempStreak = 0;
    const sorted = [...goalHistory].sort((a, b) => b.date.localeCompare(a.date));
    for (const entry of sorted) {
      if (entry.completed) {
        tempStreak++;
        currentStreak = tempStreak;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        if (entry.date !== periodKey) currentStreak = 0;
        tempStreak = 0;
      }
    }

    return {
      currentProgress, target: goal.target,
      percentComplete: Math.min(100, Math.round((currentProgress / goal.target) * 100)),
      daysCompleted, currentStreak, longestStreak,
      periodLabel: goal.period === 'daily' ? 'Today' : 'This Week',
    };
  }, [goals, history]);

  const activeGoals = useMemo(() => goals.filter(g => g.active), [goals]);

  const getTypeLabel = (type: GoalType): string => {
    switch (type) { case 'chapters': return 'chapters'; case 'minutes': return 'minutes'; case 'verses': return 'verses'; }
  };

  const suggestedGoals = [
    { type: 'chapters' as GoalType, period: 'daily' as GoalPeriod, target: 1, label: '1 chapter per day' },
    { type: 'chapters' as GoalType, period: 'daily' as GoalPeriod, target: 2, label: '2 chapters per day' },
    { type: 'chapters' as GoalType, period: 'weekly' as GoalPeriod, target: 7, label: '7 chapters per week' },
    { type: 'chapters' as GoalType, period: 'weekly' as GoalPeriod, target: 14, label: '14 chapters per week' },
    { type: 'minutes' as GoalType, period: 'daily' as GoalPeriod, target: 15, label: '15 min per day' },
    { type: 'minutes' as GoalType, period: 'daily' as GoalPeriod, target: 30, label: '30 min per day' },
  ];

  return {
    goals, activeGoals, history,
    createGoal, deleteGoal, toggleGoal,
    recordProgress, getGoalStats, getTypeLabel, suggestedGoals,
  };
}
