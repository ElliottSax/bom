/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import useLocalStorage from '../hooks/useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('should return stored value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('stored value'));
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('stored value');
  });

  it('should update localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    act(() => {
      result.current[1]('new value');
    });

    expect(result.current[0]).toBe('new value');
    expect(JSON.parse(localStorage.getItem('test-key')!)).toBe('new value');
  });

  it('should handle objects', () => {
    const initialValue = { name: 'test', count: 0 };
    const { result } = renderHook(() => useLocalStorage('object-key', initialValue));

    expect(result.current[0]).toEqual(initialValue);

    act(() => {
      result.current[1]({ name: 'updated', count: 5 });
    });

    expect(result.current[0]).toEqual({ name: 'updated', count: 5 });
  });

  it('should handle arrays', () => {
    const initialValue = [1, 2, 3];
    const { result } = renderHook(() => useLocalStorage('array-key', initialValue));

    expect(result.current[0]).toEqual(initialValue);

    act(() => {
      result.current[1]([...result.current[0], 4]);
    });

    expect(result.current[0]).toEqual([1, 2, 3, 4]);
  });

  it('should handle boolean values', () => {
    const { result } = renderHook(() => useLocalStorage('bool-key', false));

    expect(result.current[0]).toBe(false);

    act(() => {
      result.current[1](true);
    });

    expect(result.current[0]).toBe(true);
  });

  it('should return initial value on parse error', () => {
    localStorage.setItem('bad-key', 'invalid json{');
    const { result } = renderHook(() => useLocalStorage('bad-key', 'fallback'));

    expect(result.current[0]).toBe('fallback');
  });

  it('should use the same key across rerenders', () => {
    const { result, rerender } = renderHook(
      ({ key }) => useLocalStorage(key, 'default'),
      { initialProps: { key: 'key1' } }
    );

    act(() => {
      result.current[1]('value1');
    });

    rerender({ key: 'key2' });

    // Should get default for new key
    expect(result.current[0]).toBe('default');
  });

  it('should handle null values', () => {
    const { result } = renderHook(() => useLocalStorage<string | null>('null-key', null));

    expect(result.current[0]).toBe(null);

    act(() => {
      result.current[1]('not null');
    });

    expect(result.current[0]).toBe('not null');

    act(() => {
      result.current[1](null);
    });

    expect(result.current[0]).toBe(null);
  });
});
