/**
 * Integration Test: Reading Goals User Flow
 *
 * Tests the complete user journey from creating a reading goal
 * to tracking progress and viewing statistics.
 */
import { renderHook, act } from '@testing-library/react';
import { useReadingGoals } from '../../hooks/useReadingGoals';
import { createLocalStorageMock } from '../test-utils';

describe('Integration: Reading Goals Flow', () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    localStorageMock = createLocalStorageMock();
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-02-15T10:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Complete Reading Goals Journey', () => {
    it('should complete full user journey: create goal, track progress, achieve goal', () => {
      const { result } = renderHook(() => useReadingGoals());

      // STEP 1: User creates a daily reading goal
      let goalId: string;
      act(() => {
        const goal = result.current.createGoal('chapters', 'daily', 2);
        goalId = goal.id;
      });

      expect(result.current.goals).toHaveLength(1);
      expect(result.current.activeGoals).toHaveLength(1);

      // STEP 2: User reads first chapter
      act(() => {
        result.current.recordProgress(goalId, 1);
      });

      let stats = result.current.getGoalStats(goalId);
      expect(stats?.currentProgress).toBe(1);
      expect(stats?.percentComplete).toBe(50);
      expect(stats?.completed).toBe(false);

      // STEP 3: User reads second chapter (completes goal)
      act(() => {
        result.current.recordProgress(goalId, 1);
      });

      stats = result.current.getGoalStats(goalId);
      expect(stats?.currentProgress).toBe(2);
      expect(stats?.percentComplete).toBe(100);
      expect(stats?.daysCompleted).toBe(1);

      // STEP 4: Next day - user continues with streak
      jest.setSystemTime(new Date('2024-02-16T10:00:00Z'));

      act(() => {
        result.current.recordProgress(goalId, 2);
      });

      stats = result.current.getGoalStats(goalId);
      expect(stats?.currentProgress).toBe(2);
      expect(stats?.daysCompleted).toBe(2);
      expect(stats?.currentStreak).toBeGreaterThan(0);

      // STEP 5: User views all goals
      expect(result.current.goals).toHaveLength(1);
      expect(result.current.activeGoals[0].id).toBe(goalId);

      // STEP 6: Verify persistence
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'coc-reading-goals',
        expect.any(String)
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith('coc-goal-history', expect.any(String));
    });

    it('should handle weekly goal completion over multiple days', () => {
      const { result } = renderHook(() => useReadingGoals());

      // Create weekly goal: 7 chapters per week
      let goalId: string;
      act(() => {
        const goal = result.current.createGoal('chapters', 'weekly', 7);
        goalId = goal.id;
      });

      // Day 1: Read 2 chapters
      act(() => {
        result.current.recordProgress(goalId, 2);
      });

      let stats = result.current.getGoalStats(goalId);
      expect(stats?.currentProgress).toBe(2);
      expect(stats?.percentComplete).toBe(29); // 2/7 * 100 = 28.57 -> 29

      // Day 2: Read 2 more chapters
      jest.setSystemTime(new Date('2024-02-16T10:00:00Z'));
      act(() => {
        result.current.recordProgress(goalId, 2);
      });

      stats = result.current.getGoalStats(goalId);
      expect(stats?.currentProgress).toBe(4);
      expect(stats?.percentComplete).toBe(57);

      // Day 3: Complete goal
      jest.setSystemTime(new Date('2024-02-17T10:00:00Z'));
      act(() => {
        result.current.recordProgress(goalId, 3);
      });

      stats = result.current.getGoalStats(goalId);
      expect(stats?.currentProgress).toBe(7);
      expect(stats?.percentComplete).toBe(100);
      expect(stats?.periodLabel).toBe('This Week');
    });

    it('should handle multiple concurrent goals', () => {
      const { result } = renderHook(() => useReadingGoals());

      // Create multiple goals
      let chaptersGoalId: string;
      let minutesGoalId: string;

      act(() => {
        const goal1 = result.current.createGoal('chapters', 'daily', 1);
        const goal2 = result.current.createGoal('minutes', 'daily', 15);
        chaptersGoalId = goal1.id;
        minutesGoalId = goal2.id;
      });

      expect(result.current.activeGoals).toHaveLength(2);

      // Record progress for both
      act(() => {
        result.current.recordProgress(chaptersGoalId, 1);
        result.current.recordProgress(minutesGoalId, 15);
      });

      const chaptersStats = result.current.getGoalStats(chaptersGoalId);
      const minutesStats = result.current.getGoalStats(minutesGoalId);

      expect(chaptersStats?.percentComplete).toBe(100);
      expect(minutesStats?.percentComplete).toBe(100);
    });

    it('should handle goal modification mid-week', () => {
      const { result } = renderHook(() => useReadingGoals());

      // Create goal: 1 chapter/day
      let goal1Id: string;
      act(() => {
        const goal = result.current.createGoal('chapters', 'daily', 1);
        goal1Id = goal.id;
        result.current.recordProgress(goal1Id, 1);
      });

      // User realizes goal is too easy, creates new goal: 2 chapters/day
      act(() => {
        result.current.createGoal('chapters', 'daily', 2);
      });

      expect(result.current.goals).toHaveLength(2);
      expect(result.current.activeGoals).toHaveLength(1);

      // Old goal should be inactive
      const oldGoal = result.current.goals.find((g) => g.id === goal1Id);
      expect(oldGoal?.active).toBe(false);

      // New goal should be active
      const newGoal = result.current.activeGoals[0];
      expect(newGoal.target).toBe(2);
    });

    it('should maintain streak across multiple weeks', () => {
      const { result } = renderHook(() => useReadingGoals());

      let goalId: string;
      act(() => {
        const goal = result.current.createGoal('chapters', 'daily', 1);
        goalId = goal.id;
      });

      // Week 1: Complete all 7 days
      for (let day = 0; day < 7; day++) {
        act(() => {
          result.current.recordProgress(goalId, 1);
        });

        jest.setSystemTime(new Date(`2024-02-${15 + day}T10:00:00Z`));
      }

      const stats = result.current.getGoalStats(goalId);
      expect(stats?.daysCompleted).toBe(7);
      expect(stats?.currentStreak).toBeGreaterThan(0);
    });

    it('should handle partial progress gracefully', () => {
      const { result } = renderHook(() => useReadingGoals());

      let goalId: string;
      act(() => {
        const goal = result.current.createGoal('chapters', 'daily', 3);
        goalId = goal.id;
      });

      // User reads only 1 chapter (33% progress)
      act(() => {
        result.current.recordProgress(goalId, 1);
      });

      const stats = result.current.getGoalStats(goalId);
      expect(stats?.currentProgress).toBe(1);
      expect(stats?.percentComplete).toBe(33);

      // Next day: start fresh
      jest.setSystemTime(new Date('2024-02-16T10:00:00Z'));

      const newStats = result.current.getGoalStats(goalId);
      expect(newStats?.currentProgress).toBe(0); // New day, no progress yet
      expect(newStats?.daysCompleted).toBe(0); // Previous day not completed
    });
  });

  describe('Error Recovery', () => {
    it('should recover from storage errors', () => {
      const { result } = renderHook(() => useReadingGoals());

      // Create goal successfully
      let goalId: string;
      act(() => {
        const goal = result.current.createGoal('chapters', 'daily', 1);
        goalId = goal.id;
      });

      // Simulate storage error
      localStorageMock.setItem = jest.fn().mockImplementation(() => {
        throw new Error('Storage full');
      });

      // Recording progress should not crash
      act(() => {
        result.current.recordProgress(goalId, 1);
      });

      // State should still be updated in memory
      const stats = result.current.getGoalStats(goalId);
      expect(stats?.currentProgress).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle recording progress for non-existent goal', () => {
      const { result } = renderHook(() => useReadingGoals());

      act(() => {
        result.current.recordProgress('non-existent-id', 5);
      });

      // Should not crash, history should remain empty
      expect(result.current.history).toHaveLength(0);
    });

    it('should handle zero target goals', () => {
      const { result } = renderHook(() => useReadingGoals());

      act(() => {
        result.current.createGoal('chapters', 'daily', 0);
      });

      // Goal created but any progress immediately completes it
      const goalId = result.current.goals[0].id;

      act(() => {
        result.current.recordProgress(goalId, 0);
      });

      const stats = result.current.getGoalStats(goalId);
      expect(stats?.percentComplete).toBe(0); // 0/0 handled
    });

    it('should handle exceeding goal target', () => {
      const { result } = renderHook(() => useReadingGoals());

      let goalId: string;
      act(() => {
        const goal = result.current.createGoal('chapters', 'daily', 2);
        goalId = goal.id;
      });

      // User reads 5 chapters (exceeds goal)
      act(() => {
        result.current.recordProgress(goalId, 5);
      });

      const stats = result.current.getGoalStats(goalId);
      expect(stats?.currentProgress).toBe(5);
      expect(stats?.percentComplete).toBe(100); // Capped at 100%
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data consistency across hook instances', () => {
      // First instance creates goal
      const { result: result1 } = renderHook(() => useReadingGoals());

      let goalId: string;
      act(() => {
        const goal = result1.current.createGoal('chapters', 'daily', 1);
        goalId = goal.id;
        result1.current.recordProgress(goalId, 1);
      });

      // Second instance should see the same data (from localStorage)
      const { result: result2 } = renderHook(() => useReadingGoals());

      expect(result2.current.goals).toHaveLength(1);
      expect(result2.current.history).toHaveLength(1);
    });

    it('should preserve history when deleting goals', () => {
      const { result } = renderHook(() => useReadingGoals());

      let goalId: string;
      act(() => {
        const goal = result.current.createGoal('chapters', 'daily', 1);
        goalId = goal.id;
        result.current.recordProgress(goalId, 1);
      });

      expect(result.current.history).toHaveLength(1);

      // Delete goal
      act(() => {
        result.current.deleteGoal(goalId);
      });

      // History should remain (for historical tracking)
      expect(result.current.history).toHaveLength(1);
      expect(result.current.goals).toHaveLength(0);
    });
  });
});
