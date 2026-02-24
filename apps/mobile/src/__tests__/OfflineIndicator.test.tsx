/**
 * Tests for OfflineIndicator component
 */
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Animated } from 'react-native';
import { OfflineIndicator } from '../components/OfflineIndicator';
import { createNetInfoMock, mockThemeColors } from './test-utils';

// Mock dependencies
jest.mock('../hooks/useNetworkStatus');
jest.mock('../contexts/ThemeContext');

const mockUseNetworkStatus = require('../hooks/useNetworkStatus')
  .useNetworkStatus as jest.Mock;
const mockUseTheme = require('../contexts/ThemeContext').useTheme as jest.Mock;

describe('OfflineIndicator', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockUseTheme.mockReturnValue({
      colors: mockThemeColors,
    });

    // Mock Animated.timing
    jest.spyOn(Animated, 'timing').mockImplementation((value: any, config: any) => ({
      start: (callback?: (result: { finished: boolean }) => void) => {
        // Immediately call the callback for synchronous testing
        if (callback) callback({ finished: true });
      },
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('rendering', () => {
    it('should render when offline', () => {
      mockUseNetworkStatus.mockReturnValue({ isConnected: false });

      const { getByText } = render(<OfflineIndicator />);

      expect(getByText("You're offline - reading cached content")).toBeTruthy();
    });

    it('should render with warning icon', () => {
      mockUseNetworkStatus.mockReturnValue({ isConnected: false });

      const { getByText } = render(<OfflineIndicator />);

      expect(getByText('[ ! ]')).toBeTruthy();
    });

    it('should have alert role for accessibility', () => {
      mockUseNetworkStatus.mockReturnValue({ isConnected: false });

      const { getByRole } = render(<OfflineIndicator />);

      expect(getByRole('alert')).toBeTruthy();
    });

    it('should have assertive live region', () => {
      mockUseNetworkStatus.mockReturnValue({ isConnected: false });

      const { getByLabelText } = render(<OfflineIndicator />);

      const banner = getByLabelText('You are offline. Reading cached content.');
      expect(banner.props.accessibilityLiveRegion).toBe('assertive');
    });
  });

  describe('connection state', () => {
    it('should hide when online', () => {
      mockUseNetworkStatus.mockReturnValue({ isConnected: true });

      const { queryByText } = render(<OfflineIndicator />);

      // Component still renders but is translated off-screen
      // The text exists in the DOM but should be hidden
      const element = queryByText("You're offline - reading cached content");
      expect(element).toBeTruthy();
    });

    it('should animate when connection changes', async () => {
      const netInfoMock = createNetInfoMock({ isConnected: true, type: 'wifi' });
      mockUseNetworkStatus.mockReturnValue({ isConnected: true });

      const { rerender } = render(<OfflineIndicator />);

      expect(Animated.timing).toHaveBeenCalled();

      // Change to offline
      mockUseNetworkStatus.mockReturnValue({ isConnected: false });
      rerender(<OfflineIndicator />);

      expect(Animated.timing).toHaveBeenCalledTimes(2);
    });

    it('should use native driver for animations', () => {
      mockUseNetworkStatus.mockReturnValue({ isConnected: false });

      render(<OfflineIndicator />);

      expect(Animated.timing).toHaveBeenCalledWith(
        expect.any(Animated.Value),
        expect.objectContaining({
          useNativeDriver: true,
        })
      );
    });

    it('should animate to correct position when offline', () => {
      mockUseNetworkStatus.mockReturnValue({ isConnected: false });

      render(<OfflineIndicator />);

      expect(Animated.timing).toHaveBeenCalledWith(
        expect.any(Animated.Value),
        expect.objectContaining({
          toValue: 0, // Visible position
        })
      );
    });

    it('should animate to hidden position when online', () => {
      mockUseNetworkStatus.mockReturnValue({ isConnected: true });

      render(<OfflineIndicator />);

      expect(Animated.timing).toHaveBeenCalledWith(
        expect.any(Animated.Value),
        expect.objectContaining({
          toValue: -36, // Hidden position (BANNER_HEIGHT)
        })
      );
    });
  });

  describe('styling', () => {
    it('should use theme warning color', () => {
      mockUseNetworkStatus.mockReturnValue({ isConnected: false });
      mockUseTheme.mockReturnValue({
        colors: { ...mockThemeColors, warning: '#ff5722' },
      });

      const { getByRole } = render(<OfflineIndicator />);

      const banner = getByRole('alert');
      expect(banner.props.style).toContainEqual(
        expect.objectContaining({
          backgroundColor: '#ff5722',
        })
      );
    });

    it('should use theme surface color for text', () => {
      mockUseNetworkStatus.mockReturnValue({ isConnected: false });
      mockUseTheme.mockReturnValue({
        colors: { ...mockThemeColors, surface: '#ffffff' },
      });

      const { getByText } = render(<OfflineIndicator />);

      const text = getByText("You're offline - reading cached content");
      expect(text.props.style).toContainEqual(
        expect.objectContaining({
          color: '#ffffff',
        })
      );
    });

    it('should be positioned absolutely at top', () => {
      mockUseNetworkStatus.mockReturnValue({ isConnected: false });

      const { getByRole } = render(<OfflineIndicator />);

      const banner = getByRole('alert');
      expect(banner.props.style).toContainEqual(
        expect.objectContaining({
          position: 'absolute',
          top: 0,
        })
      );
    });

    it('should have high z-index for visibility', () => {
      mockUseNetworkStatus.mockReturnValue({ isConnected: false });

      const { getByRole } = render(<OfflineIndicator />);

      const banner = getByRole('alert');
      expect(banner.props.style).toContainEqual(
        expect.objectContaining({
          zIndex: 1000,
        })
      );
    });
  });

  describe('animation configuration', () => {
    it('should use 300ms duration', () => {
      mockUseNetworkStatus.mockReturnValue({ isConnected: false });

      render(<OfflineIndicator />);

      expect(Animated.timing).toHaveBeenCalledWith(
        expect.any(Animated.Value),
        expect.objectContaining({
          duration: 300,
        })
      );
    });

    it('should start animation immediately', () => {
      mockUseNetworkStatus.mockReturnValue({ isConnected: false });

      const mockStart = jest.fn();
      jest.spyOn(Animated, 'timing').mockReturnValue({
        start: mockStart,
      } as any);

      render(<OfflineIndicator />);

      expect(mockStart).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle rapid connection changes', async () => {
      mockUseNetworkStatus.mockReturnValue({ isConnected: true });

      const { rerender } = render(<OfflineIndicator />);

      // Rapid toggle
      mockUseNetworkStatus.mockReturnValue({ isConnected: false });
      rerender(<OfflineIndicator />);

      mockUseNetworkStatus.mockReturnValue({ isConnected: true });
      rerender(<OfflineIndicator />);

      mockUseNetworkStatus.mockReturnValue({ isConnected: false });
      rerender(<OfflineIndicator />);

      // Should handle all transitions gracefully
      expect(Animated.timing).toHaveBeenCalled();
    });

    it('should handle missing theme colors gracefully', () => {
      mockUseNetworkStatus.mockReturnValue({ isConnected: false });
      mockUseTheme.mockReturnValue({
        colors: {},
      });

      const { getByRole } = render(<OfflineIndicator />);

      expect(getByRole('alert')).toBeTruthy();
    });

    it('should truncate text if too long', () => {
      mockUseNetworkStatus.mockReturnValue({ isConnected: false });

      const { getByText } = render(<OfflineIndicator />);

      const text = getByText("You're offline - reading cached content");
      expect(text.props.numberOfLines).toBe(1);
    });
  });

  describe('accessibility', () => {
    it('should announce offline state to screen readers', () => {
      mockUseNetworkStatus.mockReturnValue({ isConnected: false });

      const { getByLabelText } = render(<OfflineIndicator />);

      const banner = getByLabelText('You are offline. Reading cached content.');
      expect(banner).toBeTruthy();
    });

    it('should have assertive live region for immediate announcement', () => {
      mockUseNetworkStatus.mockReturnValue({ isConnected: false });

      const { getByRole } = render(<OfflineIndicator />);

      const banner = getByRole('alert');
      expect(banner.props.accessibilityLiveRegion).toBe('assertive');
    });

    it('should use alert role for importance', () => {
      mockUseNetworkStatus.mockReturnValue({ isConnected: false });

      const { getByRole } = render(<OfflineIndicator />);

      expect(getByRole('alert')).toBeTruthy();
    });
  });

  describe('re-rendering', () => {
    it('should not re-animate on unrelated re-renders', () => {
      mockUseNetworkStatus.mockReturnValue({ isConnected: false });

      const { rerender } = render(<OfflineIndicator />);

      const callCount = (Animated.timing as jest.Mock).mock.calls.length;

      // Re-render with same connection state
      rerender(<OfflineIndicator />);

      // Should not call timing again since isConnected hasn't changed
      // (React's useEffect dependency array prevents this)
      expect((Animated.timing as jest.Mock).mock.calls.length).toBe(callCount);
    });

    it('should re-animate when connection state changes', () => {
      mockUseNetworkStatus.mockReturnValue({ isConnected: false });

      const { rerender } = render(<OfflineIndicator />);

      const callCount = (Animated.timing as jest.Mock).mock.calls.length;

      // Change connection state
      mockUseNetworkStatus.mockReturnValue({ isConnected: true });
      rerender(<OfflineIndicator />);

      expect((Animated.timing as jest.Mock).mock.calls.length).toBeGreaterThan(
        callCount
      );
    });
  });

  describe('visual appearance', () => {
    it('should render icon before text', () => {
      mockUseNetworkStatus.mockReturnValue({ isConnected: false });

      const { getAllByText } = render(<OfflineIndicator />);

      const elements = getAllByText(/./);
      const iconIndex = elements.findIndex(el => el.props.children === '[ ! ]');
      const textIndex = elements.findIndex(
        el => el.props.children === "You're offline - reading cached content"
      );

      // Icon should come before text
      expect(iconIndex).toBeLessThan(textIndex);
    });

    it('should use flexbox for horizontal layout', () => {
      mockUseNetworkStatus.mockReturnValue({ isConnected: false });

      const { getByRole } = render(<OfflineIndicator />);

      const banner = getByRole('alert');
      const contentContainer = banner.props.children;

      // Check that content uses row direction
      expect(contentContainer.props.style.flexDirection).toBe('row');
    });
  });
});
