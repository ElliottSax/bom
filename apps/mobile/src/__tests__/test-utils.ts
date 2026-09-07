/**
 * Shared test utilities for mobile app testing
 */
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';

// Mock AsyncStorage helper
export function createAsyncStorageMock() {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn(async (key: string) => store[key] || null),
    setItem: jest.fn(async (key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn(async (key: string) => {
      delete store[key];
    }),
    clear: jest.fn(async () => {
      store = {};
    }),
    getAllKeys: jest.fn(async () => Object.keys(store)),
    multiGet: jest.fn(async (keys: string[]) => keys.map((key) => [key, store[key] || null])),
    multiSet: jest.fn(async (keyValuePairs: [string, string][]) => {
      keyValuePairs.forEach(([key, value]) => {
        store[key] = value;
      });
    }),
    multiRemove: jest.fn(async (keys: string[]) => {
      keys.forEach((key) => {
        delete store[key];
      });
    }),
    _getStore: () => store, // Helper for tests
    _clearStore: () => {
      store = {};
    },
  };
}

// Mock NetInfo helper
export function createNetInfoMock(initialState = { isConnected: true, type: 'wifi' }) {
  let currentState = initialState;
  const listeners: Array<(state: typeof initialState) => void> = [];

  return {
    addEventListener: jest.fn((callback: (state: typeof initialState) => void) => {
      listeners.push(callback);
      return jest.fn(() => {
        const index = listeners.indexOf(callback);
        if (index > -1) listeners.splice(index, 1);
      });
    }),
    fetch: jest.fn(async () => currentState),
    _setState: (state: typeof initialState) => {
      currentState = state;
      listeners.forEach((listener) => listener(state));
    },
    _getState: () => currentState,
    _clearListeners: () => {
      listeners.length = 0;
    },
  };
}

// Custom render function with providers if needed
export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { ...options });
}

// Wait for async operations
export const waitFor = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Create mock verse data
export function createMockVerse(
  overrides?: Partial<{
    id: number;
    book: string;
    chapter: number;
    verse: number;
    text: string;
    volumeId: string;
    editionId: string;
  }>
) {
  return {
    id: 1,
    book: 'I Nephi',
    chapter: 3,
    verse: 7,
    text: 'And it came to pass that I, Nephi, said unto my father: I will go and do the things which the Lord hath commanded, for I know that the Lord giveth no commandments unto the children of men, save he shall prepare a way for them that they may accomplish the thing which he commandeth them.',
    volumeId: 'coc-bom-1908',
    editionId: 'coc-bom-1908',
    ...overrides,
  };
}

// Create mock navigation object
export function createMockNavigation() {
  return {
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
    setOptions: jest.fn(),
    dispatch: jest.fn(),
    setParams: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
    removeListener: jest.fn(),
    isFocused: jest.fn(() => true),
    canGoBack: jest.fn(() => true),
    getId: jest.fn(() => 'test-id'),
    getParent: jest.fn(),
    getState: jest.fn(() => ({
      index: 0,
      routes: [{ name: 'Home', key: 'home' }],
      key: 'stack',
      routeNames: ['Home'],
      type: 'stack',
      stale: false,
    })),
  };
}

// Create mock route object
export function createMockRoute(params: Record<string, any> = {}) {
  return {
    key: 'test-route',
    name: 'TestScreen',
    params,
  };
}

// Mock theme colors
export const mockThemeColors = {
  primary: '#1976d2',
  secondary: '#dc004e',
  background: '#ffffff',
  surface: '#f5f5f5',
  text: '#000000',
  textSecondary: '#666666',
  border: '#e0e0e0',
  error: '#f44336',
  warning: '#ff9800',
  success: '#4caf50',
  info: '#2196f3',
};

// Mock theme context
export function createMockTheme() {
  return {
    colors: mockThemeColors,
    isDark: false,
    toggleTheme: jest.fn(),
  };
}

// Mock Apollo Client for GraphQL
export function createMockApolloClient() {
  return {
    query: jest.fn(),
    mutate: jest.fn(),
    watchQuery: jest.fn(),
    readQuery: jest.fn(),
    writeQuery: jest.fn(),
    cache: {
      readQuery: jest.fn(),
      writeQuery: jest.fn(),
      reset: jest.fn(),
    },
  };
}

// Mock logger
export const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  scope: jest.fn(() => mockLogger),
};

// Advance animation frames
export function flushAnimationFrames(count = 1) {
  for (let i = 0; i < count; i++) {
    jest.runOnlyPendingTimers();
  }
}

// Mock dimensions
export function mockDimensions(width = 375, height = 812) {
  jest.spyOn(require('react-native'), 'Dimensions').mockReturnValue({
    get: jest.fn(() => ({ width, height })),
  });
}

// Create mock study plan
export function createMockStudyPlan(
  overrides?: Partial<{
    id: string;
    name: string;
    description: string;
    totalDays: number;
    currentDay: number;
    completed: boolean;
  }>
) {
  return {
    id: 'plan-1',
    name: '30 Day Challenge',
    description: 'Read the Book of Mormon in 30 days',
    totalDays: 30,
    currentDay: 1,
    completed: false,
    ...overrides,
  };
}

// Create mock bookmark
export function createMockBookmark(
  overrides?: Partial<{
    id: string;
    verseId: string;
    book: string;
    chapter: number;
    verse: number;
    createdAt: number;
    note?: string;
  }>
) {
  return {
    id: 'bookmark-1',
    verseId: 'verse-1',
    book: 'I Nephi',
    chapter: 3,
    verse: 7,
    createdAt: Date.now(),
    ...overrides,
  };
}

// Create mock highlight
export function createMockHighlight(
  overrides?: Partial<{
    id: string;
    verseId: string;
    color: string;
    createdAt: number;
  }>
) {
  return {
    id: 'highlight-1',
    verseId: 'verse-1',
    color: '#ffeb3b',
    createdAt: Date.now(),
    ...overrides,
  };
}

// Create mock note
export function createMockNote(
  overrides?: Partial<{
    id: string;
    verseId: string;
    text: string;
    createdAt: number;
    updatedAt: number;
  }>
) {
  return {
    id: 'note-1',
    verseId: 'verse-1',
    text: 'This is a test note',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

// Mock Animated timing
export function mockAnimatedTiming() {
  const timing = jest.fn(() => ({
    start: jest.fn((callback?: (result: { finished: boolean }) => void) => {
      if (callback) callback({ finished: true });
    }),
  }));

  return timing;
}
