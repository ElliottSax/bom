/**
 * Tests for web app hooks
 */
import { renderHook, act } from '@testing-library/react';
import useLocalStorage from '../hooks/useLocalStorage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should return initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('should persist value to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'default'));

    act(() => {
      result.current[1]('newValue');
    });

    expect(result.current[0]).toBe('newValue');
    expect(localStorageMock.getItem('testKey')).toBe(JSON.stringify('newValue'));
  });

  it('should retrieve existing value from localStorage', () => {
    localStorageMock.setItem('existingKey', JSON.stringify('existingValue'));

    const { result } = renderHook(() => useLocalStorage('existingKey', 'default'));
    expect(result.current[0]).toBe('existingValue');
  });

  it('should handle object values', () => {
    const initialObj = { name: 'Test', count: 0 };
    const { result } = renderHook(() => useLocalStorage('objKey', initialObj));

    expect(result.current[0]).toEqual(initialObj);

    act(() => {
      result.current[1]({ name: 'Updated', count: 5 });
    });

    expect(result.current[0]).toEqual({ name: 'Updated', count: 5 });
  });

  it('should handle array values', () => {
    const initialArray = ['a', 'b', 'c'];
    const { result } = renderHook(() => useLocalStorage('arrKey', initialArray));

    expect(result.current[0]).toEqual(initialArray);

    act(() => {
      result.current[1]([...initialArray, 'd']);
    });

    expect(result.current[0]).toEqual(['a', 'b', 'c', 'd']);
  });

  it('should handle functional updates', () => {
    const { result } = renderHook(() => useLocalStorage('countKey', 0));

    act(() => {
      result.current[1]((prev: number) => prev + 1);
    });

    expect(result.current[0]).toBe(1);

    act(() => {
      result.current[1]((prev: number) => prev + 5);
    });

    expect(result.current[0]).toBe(6);
  });
});

describe('Course Progress State', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should track course progress in localStorage', () => {
    interface CourseProgress {
      started: string;
      lessonsCompleted: string[];
      completed: boolean;
      completedDate: string | null;
    }

    const initialProgress: Record<string, CourseProgress> = {
      'course-1': {
        started: new Date().toISOString(),
        lessonsCompleted: [],
        completed: false,
        completedDate: null,
      },
    };

    const { result } = renderHook(() => useLocalStorage<Record<string, CourseProgress>>('courseProgress', {}));

    act(() => {
      result.current[1](initialProgress);
    });

    expect(result.current[0]['course-1']).toBeDefined();
    expect(result.current[0]['course-1'].lessonsCompleted).toEqual([]);
  });

  it('should mark lessons as complete', () => {
    const { result } = renderHook(() =>
      useLocalStorage<Record<string, { lessonsCompleted: string[] }>>('courseProgress', {
        'course-1': { lessonsCompleted: [] },
      })
    );

    act(() => {
      result.current[1]((prev) => ({
        ...prev,
        'course-1': {
          ...prev['course-1'],
          lessonsCompleted: [...prev['course-1'].lessonsCompleted, 'lesson-1'],
        },
      }));
    });

    expect(result.current[0]['course-1'].lessonsCompleted).toContain('lesson-1');
  });

  it('should track quiz scores', () => {
    const { result } = renderHook(() =>
      useLocalStorage<Record<string, { score: number; passed: boolean }>>('quizScores', {})
    );

    act(() => {
      result.current[1]({
        'lesson-1': { score: 85, passed: true },
      });
    });

    expect(result.current[0]['lesson-1'].score).toBe(85);
    expect(result.current[0]['lesson-1'].passed).toBe(true);
  });
});

describe('Theme State', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should persist theme preference', () => {
    const { result } = renderHook(() => useLocalStorage('theme', 'light'));

    expect(result.current[0]).toBe('light');

    act(() => {
      result.current[1]('dark');
    });

    expect(result.current[0]).toBe('dark');
    expect(localStorageMock.getItem('theme')).toBe(JSON.stringify('dark'));
  });
});
