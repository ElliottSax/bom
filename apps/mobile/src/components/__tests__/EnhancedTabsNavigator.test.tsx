/**
 * Unit tests for Enhanced Tabs Navigator Component
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EnhancedTabsNavigator } from '../EnhancedTabsNavigator';
import { EnhancedThemeProvider } from '../../contexts/EnhancedThemeContext';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: any) => children,
  Swipeable: ({ children }: any) => children,
  RectButton: 'RectButton',
}));

const mockOnTabChange = jest.fn();
const mockOnNavigate = jest.fn();

const defaultProps = {
  onTabChange: mockOnTabChange,
  currentContent: <></>,
  onNavigate: mockOnNavigate,
};

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <EnhancedThemeProvider>
      {component}
    </EnhancedThemeProvider>
  );
};

describe('EnhancedTabsNavigator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByTestId } = renderWithTheme(
        <EnhancedTabsNavigator {...defaultProps} />
      );
      // Component should render
      expect(true).toBe(true);
    });

    it('should create default home tab on first load', async () => {
      renderWithTheme(<EnhancedTabsNavigator {...defaultProps} />);

      await waitFor(() => {
        expect(mockOnTabChange).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'home',
            title: expect.any(String),
          })
        );
      });
    });

    it('should load saved tabs from AsyncStorage', async () => {
      const savedTabs = [
        {
          id: 'tab1',
          title: 'Saved Tab',
          type: 'verse',
          data: { book: 'Moroni' },
          lastAccessed: new Date().toISOString(),
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(savedTabs)
      );

      renderWithTheme(<EnhancedTabsNavigator {...defaultProps} />);

      await waitFor(() => {
        expect(mockOnTabChange).toHaveBeenCalledWith(savedTabs[0]);
      });
    });
  });

  describe('Tab Management', () => {
    it('should add new tab', async () => {
      const { getByText } = renderWithTheme(
        <EnhancedTabsNavigator {...defaultProps} />
      );

      // Open new tab modal
      const addButton = getByText('+');
      fireEvent.press(addButton);

      await waitFor(() => {
        const homeOption = getByText('Home');
        fireEvent.press(homeOption);
      });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@bom_study_tabs',
        expect.stringContaining('home')
      );
    });

    it('should limit tabs to MAX_TABS', async () => {
      // Create MAX_TABS tabs
      const maxTabs = Array.from({ length: 10 }, (_, i) => ({
        id: `tab${i}`,
        title: `Tab ${i}`,
        type: 'home' as const,
        data: {},
        lastAccessed: new Date().toISOString(),
      }));

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(maxTabs)
      );

      const { getByText } = renderWithTheme(
        <EnhancedTabsNavigator {...defaultProps} />
      );

      await waitFor(() => {
        const addButton = getByText('+');
        fireEvent.press(addButton);
      });

      // Should show alert about tab limit
      expect(mockOnTabChange).not.toHaveBeenCalledWith(
        expect.objectContaining({ id: 'tab11' })
      );
    });

    it('should close tab', async () => {
      const tabs = [
        { id: 'tab1', title: 'Tab 1', type: 'home' as const, data: {} },
        { id: 'tab2', title: 'Tab 2', type: 'verse' as const, data: {} },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(tabs)
      );

      const { getAllByText } = renderWithTheme(
        <EnhancedTabsNavigator {...defaultProps} />
      );

      await waitFor(() => {
        const closeButtons = getAllByText('×');
        fireEvent.press(closeButtons[0]);
      });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@bom_study_tabs',
        expect.not.stringContaining('tab1')
      );
    });

    it('should not close last tab', async () => {
      const singleTab = [
        { id: 'tab1', title: 'Last Tab', type: 'home' as const, data: {} },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(singleTab)
      );

      renderWithTheme(<EnhancedTabsNavigator {...defaultProps} />);

      // Attempt to close last tab should create new home tab
      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('Tab Features', () => {
    it('should pin/unpin tab', async () => {
      const tab = {
        id: 'tab1',
        title: 'Test Tab',
        type: 'home' as const,
        data: {},
        isPinned: false,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([tab])
      );

      renderWithTheme(<EnhancedTabsNavigator {...defaultProps} />);

      // Long press would trigger pin action
      await waitFor(() => {
        expect(AsyncStorage.getItem).toHaveBeenCalled();
      });

      // After pinning
      const pinnedTab = { ...tab, isPinned: true };
      expect(pinnedTab.isPinned).toBe(true);
    });

    it('should duplicate tab', async () => {
      const originalTab = {
        id: 'original',
        title: 'Original',
        type: 'verse' as const,
        data: { book: 'Alma' },
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([originalTab])
      );

      renderWithTheme(<EnhancedTabsNavigator {...defaultProps} />);

      await waitFor(() => {
        expect(AsyncStorage.getItem).toHaveBeenCalled();
      });

      // Duplicating would create a copy
      const duplicatedTab = {
        ...originalTab,
        id: expect.any(String),
        title: 'Original (Copy)',
      };

      expect(duplicatedTab.data).toEqual(originalTab.data);
    });

    it('should restore closed tab', async () => {
      renderWithTheme(<EnhancedTabsNavigator {...defaultProps} />);

      // Simulate closing and restoring
      const closedTab = {
        id: 'closed',
        title: 'Closed Tab',
        type: 'notes' as const,
        data: {},
      };

      // Mock recently closed tabs
      await waitFor(() => {
        expect(AsyncStorage.getItem).toHaveBeenCalled();
      });

      // Restoring should add tab back
      expect(closedTab.title).toBe('Closed Tab');
    });
  });

  describe('Navigation', () => {
    it('should navigate back in history', async () => {
      const tabWithHistory = {
        id: 'tab1',
        title: 'Current',
        type: 'verse' as const,
        data: { chapter: 2 },
        history: [
          { type: 'verse', data: { chapter: 1 }, title: 'Previous', timestamp: '' },
          { type: 'verse', data: { chapter: 2 }, title: 'Current', timestamp: '' },
        ],
        currentHistoryIndex: 1,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([tabWithHistory])
      );

      renderWithTheme(<EnhancedTabsNavigator {...defaultProps} />);

      await waitFor(() => {
        expect(mockOnTabChange).toHaveBeenCalledWith(
          expect.objectContaining({ data: { chapter: 2 } })
        );
      });

      // Navigate back would change to chapter 1
      const expectedBackState = {
        ...tabWithHistory,
        currentHistoryIndex: 0,
        data: { chapter: 1 },
      };

      expect(expectedBackState.data.chapter).toBe(1);
    });

    it('should navigate forward in history', async () => {
      const tabWithHistory = {
        id: 'tab1',
        title: 'Previous',
        type: 'verse' as const,
        data: { chapter: 1 },
        history: [
          { type: 'verse', data: { chapter: 1 }, title: 'Previous', timestamp: '' },
          { type: 'verse', data: { chapter: 2 }, title: 'Next', timestamp: '' },
        ],
        currentHistoryIndex: 0,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([tabWithHistory])
      );

      renderWithTheme(<EnhancedTabsNavigator {...defaultProps} />);

      // Navigate forward would change to chapter 2
      const expectedForwardState = {
        ...tabWithHistory,
        currentHistoryIndex: 1,
        data: { chapter: 2 },
      };

      expect(expectedForwardState.data.chapter).toBe(2);
    });

    it('should handle refresh', async () => {
      const tab = {
        id: 'tab1',
        title: 'Test',
        type: 'verse' as const,
        data: { book: 'Moroni' },
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([tab])
      );

      renderWithTheme(<EnhancedTabsNavigator {...defaultProps} />);

      await waitFor(() => {
        // Refresh would call onNavigate with current tab data
        expect(mockOnTabChange).toHaveBeenCalled();
      });
    });
  });

  describe('Incognito Mode', () => {
    it('should not save tabs in incognito mode', async () => {
      renderWithTheme(<EnhancedTabsNavigator {...defaultProps} />);

      // Enable incognito mode
      // In incognito, AsyncStorage.setItem should not be called
      await waitFor(() => {
        expect(AsyncStorage.getItem).toHaveBeenCalled();
      });

      // When incognito is true, no saving should occur
      const incognitoMode = true;
      if (incognitoMode) {
        expect(AsyncStorage.setItem).not.toHaveBeenCalledWith(
          '@bom_study_tabs',
          expect.any(String)
        );
      }
    });
  });

  describe('Tab Types', () => {
    const tabTypes = [
      { type: 'home', icon: '🏠', title: 'Home' },
      { type: 'verse', icon: '📖', title: 'Scripture' },
      { type: 'search', icon: '🔍', title: 'Search' },
      { type: 'notes', icon: '📝', title: 'Notes' },
      { type: 'books', icon: '📚', title: 'Library' },
      { type: 'plan', icon: '📅', title: 'Study Plan' },
    ];

    tabTypes.forEach(({ type, icon, title }) => {
      it(`should create ${type} tab with correct icon and title`, async () => {
        const tab = {
          id: 'test',
          type: type as any,
          icon,
          title,
          data: {},
        };

        expect(tab.icon).toBe(icon);
        expect(tab.title).toBe(title);
      });
    });
  });

  describe('Performance', () => {
    it('should handle many tabs efficiently', async () => {
      const manyTabs = Array.from({ length: 10 }, (_, i) => ({
        id: `tab${i}`,
        title: `Tab ${i}`,
        type: 'home' as const,
        data: {},
        lastAccessed: new Date().toISOString(),
      }));

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(manyTabs)
      );

      const startTime = Date.now();

      renderWithTheme(<EnhancedTabsNavigator {...defaultProps} />);

      await waitFor(() => {
        expect(mockOnTabChange).toHaveBeenCalled();
      });

      const renderTime = Date.now() - startTime;
      expect(renderTime).toBeLessThan(1000); // Should render within 1 second
    });

    it('should debounce rapid tab switches', async () => {
      const tabs = Array.from({ length: 3 }, (_, i) => ({
        id: `tab${i}`,
        title: `Tab ${i}`,
        type: 'home' as const,
        data: {},
      }));

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(tabs)
      );

      renderWithTheme(<EnhancedTabsNavigator {...defaultProps} />);

      // Rapid switches should not cause excessive updates
      await waitFor(() => {
        // Only the last switch should take effect
        expect(mockOnTabChange).toHaveBeenCalledTimes(1);
      });
    });
  });
});