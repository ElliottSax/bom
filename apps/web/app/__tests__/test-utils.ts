/**
 * Shared test utilities for web app testing
 */
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Mock API response helper
export function mockFetch(response: unknown, ok = true, status = 200) {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok,
      status,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
    } as Response)
  );
}

// Mock API error helper
export function mockFetchError(error: Error) {
  global.fetch = jest.fn(() => Promise.reject(error));
}

// Reset fetch mock
export function resetFetch() {
  if (global.fetch && typeof global.fetch === 'function' && 'mockClear' in global.fetch) {
    (global.fetch as jest.Mock).mockClear();
  }
}

// Mock localStorage with working storage
export function createLocalStorageMock() {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
    _getStore: () => store, // Helper for tests
  };
}

// Custom render function with providers if needed
export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { ...options });
}

// Wait for async operations
export const waitFor = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Simulate user typing
export function typeText(element: HTMLElement, text: string) {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
  )?.set;

  nativeInputValueSetter?.call(element, text);

  const event = new Event('input', { bubbles: true });
  element.dispatchEvent(event);
}

// Create mock verse data
export function createMockVerse(
  overrides?: Partial<{
    id: string;
    verseId: string;
    book: string;
    chapter: number;
    verse: number;
    text: string;
    volumeId: string;
    reference: string;
  }>
) {
  return {
    id: 'verse-1',
    verseId: 'coc-bom-1908:I Nephi:3:7',
    book: 'I Nephi',
    chapter: 3,
    verse: 7,
    text: 'And it came to pass that I, Nephi, said unto my father: I will go and do the things which the Lord hath commanded, for I know that the Lord giveth no commandments unto the children of men, save he shall prepare a way for them that they may accomplish the thing which he commandeth them.',
    volumeId: 'coc-bom-1908',
    reference: 'I Nephi 3:7',
    ...overrides,
  };
}

// Create mock goal data
export function createMockGoal(
  overrides?: Partial<{
    id: string;
    type: 'chapters' | 'minutes' | 'verses';
    period: 'daily' | 'weekly';
    target: number;
    createdAt: number;
    active: boolean;
  }>
) {
  return {
    id: 'goal-1',
    type: 'chapters' as const,
    period: 'daily' as const,
    target: 1,
    createdAt: Date.now(),
    active: true,
    ...overrides,
  };
}

// Create mock memorization verse
export function createMockMemorizationVerse(
  overrides?: Partial<{
    id: string;
    verseId: string;
    book: string;
    chapter: number;
    verse: number;
    text: string;
    addedAt: number;
    lastReviewedAt: number | null;
    nextReviewAt: number;
    level: number;
    correctCount: number;
    incorrectCount: number;
  }>
) {
  return {
    id: 'mem-1',
    verseId: 'coc-bom-1908:I Nephi:3:7',
    book: 'I Nephi',
    chapter: 3,
    verse: 7,
    text: 'I will go and do the things which the Lord hath commanded',
    addedAt: Date.now(),
    lastReviewedAt: null,
    nextReviewAt: Date.now(),
    level: 0,
    correctCount: 0,
    incorrectCount: 0,
    ...overrides,
  };
}

// Advance timers and flush promises
export async function advanceTimersAndFlush(ms: number) {
  jest.advanceTimersByTime(ms);
  await Promise.resolve();
}
