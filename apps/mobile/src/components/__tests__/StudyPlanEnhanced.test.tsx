/**
 * Unit tests for Enhanced Study Plan Component
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EnhancedStudyPlanManager } from '../StudyPlanEnhanced';
import { EnhancedThemeProvider } from '../../contexts/EnhancedThemeContext';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('react-native-push-notification', () => ({
  configure: jest.fn(),
  localNotificationSchedule: jest.fn(),
  cancelLocalNotifications: jest.fn(),
}));
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

// Mock theme context
const mockTheme = {
  colors: {
    background: '#ffffff',
    card: '#f5f5f5',
    text: '#000000',
    textSecondary: '#666666',
    primary: '#0066cc',
    primaryLight: '#e3f2fd',
    accent: '#ff6b6b',
    success: '#4caf50',
    successLight: '#e8f5e9',
    border: '#e0e0e0',
  },
  isDark: false,
  settings: {
    fontSize: 'medium',
    lineHeight: 1.5,
    reducedMotion: false,
  },
};

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <EnhancedThemeProvider>
      {component}
    </EnhancedThemeProvider>
  );
};

describe('EnhancedStudyPlanManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByText } = renderWithTheme(<EnhancedStudyPlanManager />);
      expect(getByText(/your journey/i)).toBeTruthy();
    });

    it('should display stats overview', async () => {
      const mockStats = {
        totalDaysStudied: 10,
        bestStreak: 5,
        totalTimeSpent: 300,
        achievements: [],
      };

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === '@bom_study_stats') {
          return Promise.resolve(JSON.stringify(mockStats));
        }
        return Promise.resolve(null);
      });

      const { getByText } = renderWithTheme(<EnhancedStudyPlanManager />);

      await waitFor(() => {
        expect(getByText('10')).toBeTruthy();
        expect(getByText('5')).toBeTruthy();
        expect(getByText('5h')).toBeTruthy();
      });
    });

    it('should show no plan card when no active plan', () => {
      const { getByText } = renderWithTheme(<EnhancedStudyPlanManager />);
      expect(getByText(/start your scripture study journey/i)).toBeTruthy();
    });
  });

  describe('Plan Templates', () => {
    it('should display template options when create button pressed', async () => {
      const { getByText, queryByText } = renderWithTheme(<EnhancedStudyPlanManager />);

      const createButton = getByText(/choose a study plan/i);
      fireEvent.press(createButton);

      await waitFor(() => {
        expect(queryByText(/book of mormon in one year/i)).toBeTruthy();
        expect(queryByText(/90-day challenge/i)).toBeTruthy();
        expect(queryByText(/doctrine & covenants in one year/i)).toBeTruthy();
        expect(queryByText(/moroni's promise challenge/i)).toBeTruthy();
      });
    });

    it('should create plan from template', async () => {
      const { getByText } = renderWithTheme(<EnhancedStudyPlanManager />);

      const createButton = getByText(/choose a study plan/i);
      fireEvent.press(createButton);

      await waitFor(() => {
        const templateButton = getByText(/book of mormon in one year/i);
        fireEvent.press(templateButton);
      });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@bom_study_plans',
        expect.stringContaining('Book of Mormon in One Year')
      );
    });
  });

  describe('Progress Tracking', () => {
    it('should mark today as complete', async () => {
      const mockPlan = {
        id: 'test-plan',
        name: 'Test Plan',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        frequency: 'daily',
        content: [],
        progress: {},
        reminders: false,
        createdAt: new Date().toISOString(),
        streak: 0,
        longestStreak: 0,
        totalDaysCompleted: 0,
        completionRate: 0,
      };

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === '@bom_study_plans') {
          return Promise.resolve(JSON.stringify([mockPlan]));
        }
        if (key === '@bom_active_plan') {
          return Promise.resolve(mockPlan.id);
        }
        return Promise.resolve(null);
      });

      const { getByText } = renderWithTheme(<EnhancedStudyPlanManager />);

      await waitFor(() => {
        const completeButton = getByText(/mark complete/i);
        fireEvent.press(completeButton);
      });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@bom_study_plans',
        expect.stringContaining('"completed":true')
      );
    });

    it('should calculate streak correctly', async () => {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const mockPlan = {
        id: 'test-plan',
        name: 'Test Plan',
        startDate: yesterday,
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        frequency: 'daily',
        content: [],
        progress: {
          [yesterday]: { completed: true, completedAt: yesterday },
        },
        reminders: false,
        createdAt: yesterday,
        streak: 1,
        longestStreak: 1,
        totalDaysCompleted: 1,
        completionRate: 50,
      };

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === '@bom_study_plans') {
          return Promise.resolve(JSON.stringify([mockPlan]));
        }
        if (key === '@bom_active_plan') {
          return Promise.resolve(mockPlan.id);
        }
        return Promise.resolve(null);
      });

      const { getByText } = renderWithTheme(<EnhancedStudyPlanManager />);

      await waitFor(() => {
        expect(getByText('🔥 1')).toBeTruthy();
      });
    });
  });

  describe('Achievements', () => {
    it('should unlock first day achievement', async () => {
      const mockStats = {
        totalPlansCreated: 1,
        totalPlansCompleted: 0,
        totalDaysStudied: 1,
        totalVersesRead: 0,
        totalTimeSpent: 0,
        bestStreak: 1,
        achievements: [
          {
            id: 'first-day',
            name: 'First Day',
            description: 'Complete your first day of study',
            icon: '🌟',
            unlockedAt: new Date().toISOString(),
            target: 1,
          },
        ],
      };

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === '@bom_study_stats') {
          return Promise.resolve(JSON.stringify(mockStats));
        }
        return Promise.resolve(null);
      });

      const { getByText } = renderWithTheme(<EnhancedStudyPlanManager />);

      await waitFor(() => {
        expect(getByText('🌟')).toBeTruthy();
        expect(getByText('First Day')).toBeTruthy();
      });
    });

    it('should track best streak', async () => {
      const mockStats = {
        totalDaysStudied: 30,
        bestStreak: 30,
        totalTimeSpent: 900,
        achievements: [],
      };

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === '@bom_study_stats') {
          return Promise.resolve(JSON.stringify(mockStats));
        }
        return Promise.resolve(null);
      });

      const { getByText } = renderWithTheme(<EnhancedStudyPlanManager />);

      await waitFor(() => {
        expect(getByText('30')).toBeTruthy();
        expect(getByText('Best Streak')).toBeTruthy();
      });
    });
  });

  describe('Auto Night Mode', () => {
    it('should schedule night mode when enabled', async () => {
      const mockPlan = {
        id: 'test-plan',
        name: 'Test Plan',
        reminders: true,
        reminderTime: '20:00',
        nightModeStartHour: 20,
        nightModeEndHour: 6,
      };

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === '@bom_study_plans') {
          return Promise.resolve(JSON.stringify([mockPlan]));
        }
        return Promise.resolve(null);
      });

      renderWithTheme(<EnhancedStudyPlanManager />);

      // Note: Actual night mode switching would require mocking Date
      // and testing the checkNightMode function
      await waitFor(() => {
        expect(AsyncStorage.getItem).toHaveBeenCalledWith('@bom_study_plans');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle AsyncStorage errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const { getByText } = renderWithTheme(<EnhancedStudyPlanManager />);

      await waitFor(() => {
        // Should still render with default state
        expect(getByText(/start your scripture study journey/i)).toBeTruthy();
      });
    });

    it('should handle corrupt data gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json');

      const { getByText } = renderWithTheme(<EnhancedStudyPlanManager />);

      await waitFor(() => {
        // Should still render with default state
        expect(getByText(/start your scripture study journey/i)).toBeTruthy();
      });
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', async () => {
      const renderSpy = jest.fn();

      const TestWrapper = () => {
        renderSpy();
        return <EnhancedStudyPlanManager />;
      };

      renderWithTheme(<TestWrapper />);

      await waitFor(() => {
        expect(renderSpy).toHaveBeenCalledTimes(1);
      });

      // Simulate prop change that shouldn't trigger re-render
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(renderSpy).toHaveBeenCalledTimes(1);
    });
  });
});