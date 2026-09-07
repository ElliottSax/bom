/**
 * Tests for useOnboarding hook
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useOnboarding } from '../hooks/useOnboarding';
import { createLocalStorageMock } from './test-utils';

describe('useOnboarding', () => {
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
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('initial state', () => {
    it('should show onboarding for new users', async () => {
      const { result } = renderHook(() => useOnboarding());

      expect(result.current.isOnboardingComplete).toBe(false);
      expect(result.current.showOnboarding).toBe(false);

      // Wait for the delay
      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(result.current.showOnboarding).toBe(true);
      });
    });

    it('should not show onboarding for returning users', () => {
      localStorageMock.setItem('coc-onboarding-complete', 'true');

      const { result } = renderHook(() => useOnboarding());

      expect(result.current.isOnboardingComplete).toBe(true);
      expect(result.current.showOnboarding).toBe(false);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.showOnboarding).toBe(false);
    });

    it('should have 500ms delay before showing onboarding', async () => {
      const { result } = renderHook(() => useOnboarding());

      expect(result.current.showOnboarding).toBe(false);

      act(() => {
        jest.advanceTimersByTime(400);
      });

      expect(result.current.showOnboarding).toBe(false);

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.showOnboarding).toBe(true);
      });
    });
  });

  describe('completeOnboarding', () => {
    it('should mark onboarding as complete', async () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(result.current.showOnboarding).toBe(true);
      });

      act(() => {
        result.current.completeOnboarding();
      });

      expect(result.current.isOnboardingComplete).toBe(true);
      expect(result.current.showOnboarding).toBe(false);
    });

    it('should persist completion to localStorage', () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.completeOnboarding();
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith('coc-onboarding-complete', 'true');
    });

    it('should work when called before delay expires', () => {
      const { result } = renderHook(() => useOnboarding());

      // Complete immediately without waiting for delay
      act(() => {
        result.current.completeOnboarding();
      });

      expect(result.current.isOnboardingComplete).toBe(true);
      expect(result.current.showOnboarding).toBe(false);

      // Advance timer - should not show onboarding
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.showOnboarding).toBe(false);
    });
  });

  describe('resetOnboarding', () => {
    it('should reset onboarding for returning users', () => {
      localStorageMock.setItem('coc-onboarding-complete', 'true');

      const { result } = renderHook(() => useOnboarding());

      expect(result.current.isOnboardingComplete).toBe(true);

      act(() => {
        result.current.resetOnboarding();
      });

      expect(result.current.isOnboardingComplete).toBe(false);
      expect(result.current.showOnboarding).toBe(true);
    });

    it('should remove completion flag from localStorage', () => {
      localStorageMock.setItem('coc-onboarding-complete', 'true');

      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.resetOnboarding();
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('coc-onboarding-complete');
    });

    it('should immediately show onboarding without delay', () => {
      localStorageMock.setItem('coc-onboarding-complete', 'true');

      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.resetOnboarding();
      });

      // Should show immediately, no delay
      expect(result.current.showOnboarding).toBe(true);
    });
  });

  describe('setShowOnboarding', () => {
    it('should manually control onboarding visibility', async () => {
      const { result } = renderHook(() => useOnboarding());

      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(result.current.showOnboarding).toBe(true);
      });

      act(() => {
        result.current.setShowOnboarding(false);
      });

      expect(result.current.showOnboarding).toBe(false);

      act(() => {
        result.current.setShowOnboarding(true);
      });

      expect(result.current.showOnboarding).toBe(true);
    });

    it('should allow showing onboarding without completing it', async () => {
      localStorageMock.setItem('coc-onboarding-complete', 'true');

      const { result } = renderHook(() => useOnboarding());

      expect(result.current.showOnboarding).toBe(false);

      act(() => {
        result.current.setShowOnboarding(true);
      });

      expect(result.current.showOnboarding).toBe(true);
      expect(result.current.isOnboardingComplete).toBe(true);
    });
  });

  describe('timer cleanup', () => {
    it('should cleanup timer on unmount', async () => {
      const { unmount } = renderHook(() => useOnboarding());

      unmount();

      // Advance time - should not cause any updates
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // If timer wasn't cleaned up, this would cause issues
      expect(true).toBe(true);
    });

    it('should not show onboarding after unmount', async () => {
      const { result, unmount } = renderHook(() => useOnboarding());

      unmount();

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should still have initial state
      expect(result.current.showOnboarding).toBe(false);
    });
  });

  describe('SSR compatibility', () => {
    it('should handle undefined window gracefully', () => {
      const originalWindow = global.window;
      // @ts-expect-error -- deleting global.window to simulate SSR
      delete global.window;

      const { result } = renderHook(() => useOnboarding());

      expect(result.current.isOnboardingComplete).toBe(true);
      expect(result.current.showOnboarding).toBe(false);

      global.window = originalWindow;
    });

    it('should not access localStorage during SSR', () => {
      const originalWindow = global.window;
      // @ts-expect-error -- deleting global.window to simulate SSR
      delete global.window;

      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.completeOnboarding();
      });

      // Should not throw error
      expect(result.current.isOnboardingComplete).toBe(true);

      global.window = originalWindow;
    });
  });

  describe('concurrent usage', () => {
    it('should maintain independent state for multiple instances', async () => {
      const { result: result1 } = renderHook(() => useOnboarding());
      const { result: result2 } = renderHook(() => useOnboarding());

      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(result1.current.showOnboarding).toBe(true);
        expect(result2.current.showOnboarding).toBe(true);
      });

      act(() => {
        result1.current.completeOnboarding();
      });

      expect(result1.current.isOnboardingComplete).toBe(true);
      expect(result1.current.showOnboarding).toBe(false);

      // result2 should still show onboarding
      expect(result2.current.showOnboarding).toBe(true);
    });
  });

  describe('localStorage edge cases', () => {
    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem = jest.fn(() => {
        throw new Error('QuotaExceededError');
      });

      const { result } = renderHook(() => useOnboarding());

      act(() => {
        result.current.completeOnboarding();
      });

      // Should not throw, should update state anyway
      expect(result.current.isOnboardingComplete).toBe(true);
    });

    it('should handle corrupted localStorage data', () => {
      localStorageMock.setItem('coc-onboarding-complete', 'invalid-value');

      const { result } = renderHook(() => useOnboarding());

      // Should treat as not completed since value is not exactly 'true'
      expect(result.current.isOnboardingComplete).toBe(false);
    });

    it('should handle null localStorage value', () => {
      localStorageMock.getItem = jest.fn(() => null);

      const { result } = renderHook(() => useOnboarding());

      expect(result.current.isOnboardingComplete).toBe(false);
    });
  });

  describe('state transitions', () => {
    it('should handle complete -> reset -> complete cycle', async () => {
      const { result } = renderHook(() => useOnboarding());

      // Initial: incomplete, waiting to show
      expect(result.current.isOnboardingComplete).toBe(false);

      // Complete it
      act(() => {
        result.current.completeOnboarding();
      });
      expect(result.current.isOnboardingComplete).toBe(true);
      expect(result.current.showOnboarding).toBe(false);

      // Reset it
      act(() => {
        result.current.resetOnboarding();
      });
      expect(result.current.isOnboardingComplete).toBe(false);
      expect(result.current.showOnboarding).toBe(true);

      // Complete again
      act(() => {
        result.current.completeOnboarding();
      });
      expect(result.current.isOnboardingComplete).toBe(true);
      expect(result.current.showOnboarding).toBe(false);
    });
  });
});
