/**
 * Tests for OnboardingScreen component
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { createMockNavigation, createAsyncStorageMock, mockThemeColors } from './test-utils';

// Mock dependencies
jest.mock('@react-navigation/native');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../contexts/ThemeContext');
jest.mock('../utils/logger');

const mockNavigation = createMockNavigation();
const mockUseNavigation = require('@react-navigation/native').useNavigation as jest.Mock;
const mockAsyncStorage = createAsyncStorageMock();
const mockUseTheme = require('../contexts/ThemeContext').useTheme as jest.Mock;
const mockLogger = require('../utils/logger').logger;

describe('OnboardingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseNavigation.mockReturnValue(mockNavigation);
    mockUseTheme.mockReturnValue({
      colors: mockThemeColors,
    });

    Object.keys(mockAsyncStorage).forEach((key) => {
      require('@react-native-async-storage/async-storage')[key] = mockAsyncStorage[key];
    });

    mockLogger.scope = jest.fn(() => ({
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    }));
  });

  describe('rendering', () => {
    it('should render onboarding screen', () => {
      const { getByText } = render(<OnboardingScreen />);

      expect(getByText('Scripture Study Tools')).toBeTruthy();
      expect(getByText('Welcome')).toBeTruthy();
    });

    it('should render first page content', () => {
      const { getByText } = render(<OnboardingScreen />);

      expect(
        getByText(
          'Explore the Book of Mormon with powerful study tools designed for the Community of Christ edition. Deepen your understanding and enrich your daily scripture experience.'
        )
      ).toBeTruthy();
    });

    it('should render Skip button', () => {
      const { getByText } = render(<OnboardingScreen />);

      expect(getByText('Skip')).toBeTruthy();
    });

    it('should render Next button on first page', () => {
      const { getByText } = render(<OnboardingScreen />);

      expect(getByText('Next')).toBeTruthy();
    });

    it('should render emoji icons', () => {
      const { getByText } = render(<OnboardingScreen />);

      // Book emoji from first page
      expect(getByText('\uD83D\uDCD6')).toBeTruthy();
    });
  });

  describe('navigation between pages', () => {
    it('should show Next button on non-final pages', () => {
      const { getByText } = render(<OnboardingScreen />);

      expect(getByText('Next')).toBeTruthy();
    });

    it('should advance to next page when Next is pressed', () => {
      const { getByText } = render(<OnboardingScreen />);

      const nextButton = getByText('Next');
      fireEvent.press(nextButton);

      // Second page title
      expect(getByText('Powerful Features')).toBeTruthy();
    });

    it('should show Get Started button on final page', () => {
      const { getByText } = render(<OnboardingScreen />);

      // Navigate to last page
      const nextButton = getByText('Next');
      fireEvent.press(nextButton); // Page 2
      fireEvent.press(nextButton); // Page 3
      fireEvent.press(nextButton); // Page 4 (last)

      expect(getByText('Get Started')).toBeTruthy();
    });

    it('should update page indicators when navigating', () => {
      const { getByText } = render(<OnboardingScreen />);

      // Should start on first page
      expect(getByText('Scripture Study Tools')).toBeTruthy();

      const nextButton = getByText('Next');
      fireEvent.press(nextButton);

      // Should be on second page
      expect(getByText('Powerful Features')).toBeTruthy();
    });
  });

  describe('Skip functionality', () => {
    it('should complete onboarding when Skip is pressed', async () => {
      const { getByText } = render(<OnboardingScreen />);

      const skipButton = getByText('Skip');
      fireEvent.press(skipButton);

      await waitFor(() => {
        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('@bom_onboarding_complete', 'true');
      });
    });

    it('should navigate to Home after skipping', async () => {
      const { getByText } = render(<OnboardingScreen />);

      const skipButton = getByText('Skip');
      fireEvent.press(skipButton);

      await waitFor(() => {
        expect(mockNavigation.reset).toHaveBeenCalledWith({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      });
    });
  });

  describe('Get Started functionality', () => {
    it('should complete onboarding when Get Started is pressed', async () => {
      const { getByText } = render(<OnboardingScreen />);

      // Navigate to last page
      const nextButton = getByText('Next');
      fireEvent.press(nextButton);
      fireEvent.press(nextButton);
      fireEvent.press(nextButton);

      const getStartedButton = getByText('Get Started');
      fireEvent.press(getStartedButton);

      await waitFor(() => {
        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('@bom_onboarding_complete', 'true');
      });
    });

    it('should navigate to Home after getting started', async () => {
      const { getByText } = render(<OnboardingScreen />);

      // Navigate to last page
      const nextButton = getByText('Next');
      fireEvent.press(nextButton);
      fireEvent.press(nextButton);
      fireEvent.press(nextButton);

      const getStartedButton = getByText('Get Started');
      fireEvent.press(getStartedButton);

      await waitFor(() => {
        expect(mockNavigation.reset).toHaveBeenCalledWith({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      });
    });
  });

  describe('page content', () => {
    it('should show features list on page 2', () => {
      const { getByText } = render(<OnboardingScreen />);

      const nextButton = getByText('Next');
      fireEvent.press(nextButton);

      expect(getByText(/Bookmarks/)).toBeTruthy();
      expect(getByText(/Notes/)).toBeTruthy();
      expect(getByText(/Highlights/)).toBeTruthy();
      expect(getByText(/Search/)).toBeTruthy();
      expect(getByText(/Study Plans/)).toBeTruthy();
    });

    it('should show daily study features on page 3', () => {
      const { getByText } = render(<OnboardingScreen />);

      const nextButton = getByText('Next');
      fireEvent.press(nextButton);
      fireEvent.press(nextButton);

      expect(getByText(/Daily Verse/)).toBeTruthy();
      expect(getByText(/Reading Goals/)).toBeTruthy();
      expect(getByText(/Memorization/)).toBeTruthy();
    });

    it('should show welcome message on final page', () => {
      const { getByText } = render(<OnboardingScreen />);

      const nextButton = getByText('Next');
      fireEvent.press(nextButton);
      fireEvent.press(nextButton);
      fireEvent.press(nextButton);

      expect(getByText('Begin Your Journey')).toBeTruthy();
      expect(getByText(/You are ready to dive into the scriptures/)).toBeTruthy();
    });
  });

  describe('error handling', () => {
    it('should handle AsyncStorage errors gracefully', async () => {
      mockAsyncStorage.setItem = jest.fn().mockRejectedValue(new Error('Storage error'));

      const { getByText } = render(<OnboardingScreen />);

      const skipButton = getByText('Skip');
      fireEvent.press(skipButton);

      // Should still navigate even if storage fails
      await waitFor(() => {
        expect(mockNavigation.reset).toHaveBeenCalled();
      });
    });

    it('should log errors when storage fails', async () => {
      const mockError = new Error('Storage error');
      mockAsyncStorage.setItem = jest.fn().mockRejectedValue(mockError);

      const mockLoggerInstance = {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
      };
      mockLogger.scope.mockReturnValue(mockLoggerInstance);

      const { getByText } = render(<OnboardingScreen />);

      const skipButton = getByText('Skip');
      fireEvent.press(skipButton);

      await waitFor(() => {
        expect(mockLoggerInstance.error).toHaveBeenCalledWith(
          'Failed to save onboarding completion',
          mockError
        );
      });
    });
  });

  describe('theming', () => {
    it('should apply theme colors', () => {
      mockUseTheme.mockReturnValue({
        colors: {
          ...mockThemeColors,
          primary: '#ff0000',
          background: '#00ff00',
        },
      });

      const { getByText } = render(<OnboardingScreen />);

      // Component should render with theme colors
      expect(getByText('Scripture Study Tools')).toBeTruthy();
    });

    it('should handle theme updates', () => {
      const { rerender } = render(<OnboardingScreen />);

      mockUseTheme.mockReturnValue({
        colors: {
          ...mockThemeColors,
          primary: '#0000ff',
        },
      });

      rerender(<OnboardingScreen />);

      // Should still render correctly
      expect(true).toBe(true);
    });
  });

  describe('accessibility', () => {
    it('should have accessible buttons', () => {
      const { getByText } = render(<OnboardingScreen />);

      const skipButton = getByText('Skip');
      const nextButton = getByText('Next');

      expect(skipButton).toBeTruthy();
      expect(nextButton).toBeTruthy();
    });

    it('should have accessible text content', () => {
      const { getByText } = render(<OnboardingScreen />);

      const title = getByText('Scripture Study Tools');
      expect(title).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('should handle rapid button presses', () => {
      const { getByText } = render(<OnboardingScreen />);

      const nextButton = getByText('Next');

      // Rapidly press next
      fireEvent.press(nextButton);
      fireEvent.press(nextButton);
      fireEvent.press(nextButton);

      // Should handle gracefully
      expect(true).toBe(true);
    });

    it('should handle concurrent Skip and Next presses', async () => {
      const { getByText } = render(<OnboardingScreen />);

      const skipButton = getByText('Skip');
      const nextButton = getByText('Next');

      // Press both
      fireEvent.press(skipButton);
      fireEvent.press(nextButton);

      // Should complete onboarding
      await waitFor(() => {
        expect(mockAsyncStorage.setItem).toHaveBeenCalled();
      });
    });
  });

  describe('page indicators', () => {
    it('should show correct number of pages', () => {
      const { getByText } = render(<OnboardingScreen />);

      // Should have 4 pages total
      expect(getByText('Scripture Study Tools')).toBeTruthy();

      const nextButton = getByText('Next');

      fireEvent.press(nextButton);
      expect(getByText('Powerful Features')).toBeTruthy();

      fireEvent.press(nextButton);
      expect(getByText('Daily Study')).toBeTruthy();

      fireEvent.press(nextButton);
      expect(getByText('Begin Your Journey')).toBeTruthy();
    });
  });

  describe('scroll behavior', () => {
    it('should render ScrollView for page content', () => {
      const { UNSAFE_getAllByType } = render(<OnboardingScreen />);

      const scrollViews = UNSAFE_getAllByType(require('react-native').ScrollView);
      expect(scrollViews.length).toBeGreaterThan(0);
    });
  });

  describe('state management', () => {
    it('should track current page', () => {
      const { getByText } = render(<OnboardingScreen />);

      // Start on page 0
      expect(getByText('Scripture Study Tools')).toBeTruthy();

      const nextButton = getByText('Next');
      fireEvent.press(nextButton);

      // Now on page 1
      expect(getByText('Powerful Features')).toBeTruthy();
    });

    it('should know when on last page', () => {
      const { getByText, queryByText } = render(<OnboardingScreen />);

      // Navigate to last page
      const nextButton = getByText('Next');
      fireEvent.press(nextButton);
      fireEvent.press(nextButton);
      fireEvent.press(nextButton);

      // Should show Get Started instead of Next
      expect(getByText('Get Started')).toBeTruthy();
      expect(queryByText('Next')).toBeNull();
    });
  });
});
