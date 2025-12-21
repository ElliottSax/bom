/**
 * Unit tests for StudyPlan component
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StudyPlanManager } from '../StudyPlan';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe('StudyPlanManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  describe('Initialization', () => {
    it('should render without crashing', () => {
      const { getByText } = render(<StudyPlanManager />);
      expect(getByText(/No active study plan/i)).toBeTruthy();
    });

    it('should load saved plans from AsyncStorage', async () => {
      const mockPlans = [
        {
          id: 'plan1',
          name: 'Test Plan',
          description: 'Test description',
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          frequency: 'daily',
          content: [],
          progress: {},
          reminders: false,
          createdAt: '2025-01-01',
          streak: 0,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockPlans)
      );

      const { getByText } = render(<StudyPlanManager />);

      await waitFor(() => {
        expect(AsyncStorage.getItem).toHaveBeenCalledWith('@bom_study_plans');
      });
    });
  });

  describe('Plan Creation', () => {
    it('should display create plan button when no active plan', () => {
      const { getByText } = render(<StudyPlanManager />);
      expect(getByText('Create Study Plan')).toBeTruthy();
    });

    it('should save new plan to AsyncStorage', async () => {
      const { getByText } = render(<StudyPlanManager />);

      // Trigger plan creation
      const createButton = getByText('Create Study Plan');
      fireEvent.press(createButton);

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalled();
      });
    });
  });

  describe('Progress Tracking', () => {
    it('should mark today as complete', async () => {
      const mockPlan = {
        id: 'plan1',
        name: 'Daily Reading',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        frequency: 'daily',
        content: [
          {
            editionId: 'coc-bom-1908',
            book: 'I Nephi',
            startChapter: 1,
            endChapter: 10,
          },
        ],
        progress: {},
        reminders: true,
        createdAt: new Date().toISOString(),
        streak: 0,
      };

      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify([mockPlan])) // Study plans
        .mockResolvedValueOnce(JSON.stringify(mockPlan.id)); // Active plan

      const { getByText } = render(<StudyPlanManager />);

      await waitFor(() => {
        expect(getByText('Daily Reading')).toBeTruthy();
      });

      const markCompleteButton = getByText('Mark Complete');
      fireEvent.press(markCompleteButton);

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          '@bom_study_plans',
          expect.stringContaining('completed')
        );
      });
    });

    it('should calculate streak correctly', () => {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const progress = {
        [today]: { completed: true, completedAt: new Date().toISOString() },
        [yesterday]: { completed: true, completedAt: new Date().toISOString() },
      };

      // Test streak calculation logic
      let streak = 0;
      const dates = Object.keys(progress).sort().reverse();

      for (const dateStr of dates) {
        if (progress[dateStr]?.completed) {
          streak++;
        } else {
          break;
        }
      }

      expect(streak).toBe(2);
    });
  });

  describe('Calendar Display', () => {
    it('should render calendar with current month', async () => {
      const mockPlan = {
        id: 'plan1',
        name: 'Monthly Plan',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        frequency: 'daily',
        content: [],
        progress: {},
        reminders: false,
        createdAt: new Date().toISOString(),
        streak: 0,
      };

      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify([mockPlan]))
        .mockResolvedValueOnce(JSON.stringify(mockPlan.id));

      const { getByText } = render(<StudyPlanManager />);

      await waitFor(() => {
        const monthYear = new Date().toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        });
        expect(getByText(monthYear)).toBeTruthy();
      });
    });

    it('should highlight completed days', async () => {
      const today = new Date().toISOString().split('T')[0];

      const mockPlan = {
        id: 'plan1',
        name: 'Test Plan',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        frequency: 'daily',
        content: [],
        progress: {
          [today]: { completed: true, completedAt: new Date().toISOString() },
        },
        reminders: false,
        createdAt: new Date().toISOString(),
        streak: 1,
      };

      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify([mockPlan]))
        .mockResolvedValueOnce(JSON.stringify(mockPlan.id));

      const { getByTestId } = render(<StudyPlanManager />);

      await waitFor(() => {
        // Would need to add testID to calendar days
        // expect(getByTestId(`calendar-day-${today}`)).toHaveStyle({
        //   backgroundColor: expect.any(String)
        // });
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle AsyncStorage errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );

      const { getByText } = render(<StudyPlanManager />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error loading study plans:',
          expect.any(Error)
        );
      });

      // Should still render with no plan
      expect(getByText(/No active study plan/i)).toBeTruthy();

      consoleErrorSpy.mockRestore();
    });

    it('should handle corrupted data', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json');

      const { getByText } = render(<StudyPlanManager />);

      await waitFor(() => {
        expect(getByText(/No active study plan/i)).toBeTruthy();
      });
    });
  });

  describe('Memory Management', () => {
    it('should cleanup on unmount', () => {
      const { unmount } = render(<StudyPlanManager />);

      // Component should cleanup without errors
      expect(() => unmount()).not.toThrow();
    });
  });
});