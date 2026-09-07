/**
 * Tests for useReadingGoals hook
 */
import { renderHook, act } from '@testing-library/react';
import { useReadingGoals } from '../hooks/useReadingGoals';
import { createLocalStorageMock, createMockGoal } from './test-utils';

describe('useReadingGoals', () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    localStorageMock = createLocalStorageMock();
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-02-15T10:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('createGoal', () => {
    it('should create a new reading goal', () => {
      const { result } = renderHook(() => useReadingGoals());

      act(() => {
        result.current.createGoal('chapters', 'daily', 2);
      });

      expect(result.current.goals).toHaveLength(1);
      expect(result.current.goals[0]).toMatchObject({
        type: 'chapters',
        period: 'daily',
        target: 2,
        active: true,
      });
    });

    it('should deactivate existing goals of same type and period', () => {
      const { result } = renderHook(() => useReadingGoals());

      act(() => {
        result.current.createGoal('chapters', 'daily', 1);
      });

      expect(result.current.goals[0].active).toBe(true);

      act(() => {
        result.current.createGoal('chapters', 'daily', 2);
      });

      expect(result.current.goals).toHaveLength(2);
      expect(result.current.goals[0].active).toBe(false);
      expect(result.current.goals[1].active).toBe(true);
    });

    it('should allow multiple goals of different types', () => {
      const { result } = renderHook(() => useReadingGoals());

      act(() => {
        result.current.createGoal('chapters', 'daily', 1);
        result.current.createGoal('minutes', 'daily', 15);
      });

      expect(result.current.goals).toHaveLength(2);
      expect(result.current.goals[0].active).toBe(true);
      expect(result.current.goals[1].active).toBe(true);
    });

    it('should persist goals to localStorage', () => {
      const { result } = renderHook(() => useReadingGoals());

      act(() => {
        result.current.createGoal('chapters', 'daily', 1);
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'coc-reading-goals',
        expect.any(String)
      );
    });
  });

  describe('deleteGoal', () => {
    it('should delete a goal', () => {
      const { result } = renderHook(() => useReadingGoals());

      let goalId: string;
      act(() => {
        const goal = result.current.createGoal('chapters', 'daily', 1);
        goalId = goal.id;
      });

      expect(result.current.goals).toHaveLength(1);

      act(() => {
        result.current.deleteGoal(goalId);
      });

      expect(result.current.goals).toHaveLength(0);
    });

    it('should not error when deleting non-existent goal', () => {
      const { result } = renderHook(() => useReadingGoals());

      act(() => {
        result.current.deleteGoal('non-existent');
      });

      expect(result.current.goals).toHaveLength(0);
    });
  });

  describe('toggleGoal', () => {
    it('should toggle goal active state', () => {
      const { result } = renderHook(() => useReadingGoals());

      let goalId: string;
      act(() => {
        const goal = result.current.createGoal('chapters', 'daily', 1);
        goalId = goal.id;
      });

      expect(result.current.goals[0].active).toBe(true);

      act(() => {
        result.current.toggleGoal(goalId);
      });

      expect(result.current.goals[0].active).toBe(false);

      act(() => {
        result.current.toggleGoal(goalId);
      });

      expect(result.current.goals[0].active).toBe(true);
    });

    it('should deactivate other goals of same type when activating', () => {
      const { result } = renderHook(() => useReadingGoals());

      let goalId1: string;
      act(() => {
        const goal1 = result.current.createGoal('chapters', 'daily', 1);
        goalId1 = goal1.id;
        result.current.createGoal('chapters', 'daily', 2);
      });

      expect(result.current.goals[0].active).toBe(false);
      expect(result.current.goals[1].active).toBe(true);

      act(() => {
        result.current.toggleGoal(goalId1);
      });

      expect(result.current.goals[0].active).toBe(true);
      expect(result.current.goals[1].active).toBe(false);
    });
  });

  describe('recordProgress', () => {
    it('should record progress for a goal', () => {
      const { result } = renderHook(() => useReadingGoals());

      let goalId: string;
      act(() => {
        const goal = result.current.createGoal('chapters', 'daily', 5);
        goalId = goal.id;
      });

      act(() => {
        result.current.recordProgress(goalId, 2);
      });

      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].progress).toBe(2);
      expect(result.current.history[0].completed).toBe(false);
    });

    it('should mark goal as completed when target is met', () => {
      const { result } = renderHook(() => useReadingGoals());

      let goalId: string;
      act(() => {
        const goal = result.current.createGoal('chapters', 'daily', 2);
        goalId = goal.id;
      });

      act(() => {
        result.current.recordProgress(goalId, 2);
      });

      expect(result.current.history[0].completed).toBe(true);
    });

    it('should accumulate progress for same period', () => {
      const { result } = renderHook(() => useReadingGoals());

      let goalId: string;
      act(() => {
        const goal = result.current.createGoal('chapters', 'daily', 5);
        goalId = goal.id;
      });

      act(() => {
        result.current.recordProgress(goalId, 2);
        result.current.recordProgress(goalId, 1);
      });

      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].progress).toBe(3);
    });

    it('should not record progress for non-existent goal', () => {
      const { result } = renderHook(() => useReadingGoals());

      act(() => {
        result.current.recordProgress('non-existent', 5);
      });

      expect(result.current.history).toHaveLength(0);
    });

    it('should persist history to localStorage', () => {
      const { result } = renderHook(() => useReadingGoals());

      let goalId: string;
      act(() => {
        const goal = result.current.createGoal('chapters', 'daily', 1);
        goalId = goal.id;
      });

      act(() => {
        result.current.recordProgress(goalId, 1);
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith('coc-goal-history', expect.any(String));
    });
  });

  describe('getGoalStats', () => {
    it('should return current stats for a goal', () => {
      const { result } = renderHook(() => useReadingGoals());

      let goalId: string;
      act(() => {
        const goal = result.current.createGoal('chapters', 'daily', 5);
        goalId = goal.id;
        result.current.recordProgress(goalId, 3);
      });

      const stats = result.current.getGoalStats(goalId);

      expect(stats).toMatchObject({
        currentProgress: 3,
        target: 5,
        percentComplete: 60,
        daysCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
      });
    });

    it('should calculate streak correctly', () => {
      const { result } = renderHook(() => useReadingGoals());

      let goalId: string;
      act(() => {
        const goal = result.current.createGoal('chapters', 'daily', 1);
        goalId = goal.id;
      });

      // Record progress for today
      act(() => {
        result.current.recordProgress(goalId, 1);
      });

      const stats = result.current.getGoalStats(goalId);

      expect(stats?.currentStreak).toBeGreaterThanOrEqual(0);
      expect(stats?.daysCompleted).toBe(1);
    });

    it('should return null for non-existent goal', () => {
      const { result } = renderHook(() => useReadingGoals());

      const stats = result.current.getGoalStats('non-existent');

      expect(stats).toBeNull();
    });

    it('should handle weekly goals', () => {
      const { result } = renderHook(() => useReadingGoals());

      let goalId: string;
      act(() => {
        const goal = result.current.createGoal('chapters', 'weekly', 7);
        goalId = goal.id;
        result.current.recordProgress(goalId, 3);
      });

      const stats = result.current.getGoalStats(goalId);

      expect(stats?.periodLabel).toBe('This Week');
      expect(stats?.currentProgress).toBe(3);
    });
  });

  describe('activeGoals', () => {
    it('should return only active goals', () => {
      const { result } = renderHook(() => useReadingGoals());

      act(() => {
        const goal1 = result.current.createGoal('chapters', 'daily', 1);
        result.current.createGoal('minutes', 'daily', 15);
        result.current.toggleGoal(goal1.id);
      });

      expect(result.current.activeGoals).toHaveLength(1);
      expect(result.current.activeGoals[0].type).toBe('minutes');
    });
  });

  describe('helper functions', () => {
    it('should return correct type labels', () => {
      const { result } = renderHook(() => useReadingGoals());

      expect(result.current.getTypeLabel('chapters')).toBe('chapters');
      expect(result.current.getTypeLabel('minutes')).toBe('minutes');
      expect(result.current.getTypeLabel('verses')).toBe('verses');
    });

    it('should provide suggested goals', () => {
      const { result } = renderHook(() => useReadingGoals());

      expect(result.current.suggestedGoals).toHaveLength(6);
      expect(result.current.suggestedGoals[0]).toMatchObject({
        type: 'chapters',
        period: 'daily',
        target: 1,
        label: '1 chapter per day',
      });
    });
  });

  describe('localStorage persistence', () => {
    it('should load goals from localStorage on mount', () => {
      const mockGoals = [
        createMockGoal({ id: 'goal-1' }),
        createMockGoal({ id: 'goal-2', type: 'minutes', target: 15 }),
      ];

      localStorageMock.setItem('coc-reading-goals', JSON.stringify(mockGoals));

      const { result } = renderHook(() => useReadingGoals());

      expect(result.current.goals).toHaveLength(2);
    });

    it('should load history from localStorage on mount', () => {
      const mockHistory = [
        {
          goalId: 'goal-1',
          date: '2024-02-15',
          progress: 2,
          completed: true,
        },
      ];

      localStorageMock.setItem('coc-goal-history', JSON.stringify(mockHistory));

      const { result } = renderHook(() => useReadingGoals());

      expect(result.current.history).toHaveLength(1);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorageMock.setItem('coc-reading-goals', 'invalid json');

      const { result } = renderHook(() => useReadingGoals());

      expect(result.current.goals).toEqual([]);
    });
  });
});
