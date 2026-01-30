import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePersistedState, usePersistedList } from '../hooks/usePersistedState';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('usePersistedState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
  });

  describe('initial state', () => {
    it('should use default value when no stored value exists', async () => {
      const { result } = renderHook(() =>
        usePersistedState('testKey', 'defaultValue')
      );

      expect(result.current[0]).toBe('defaultValue');
      expect(result.current[2]).toBe(true); // isLoading
    });

    it('should load stored value on mount', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify('storedValue'));

      const { result } = renderHook(() =>
        usePersistedState('testKey', 'defaultValue')
      );

      await waitFor(() => {
        expect(result.current[2]).toBe(false); // isLoading
      });

      expect(result.current[0]).toBe('storedValue');
    });
  });

  describe('setValue', () => {
    it('should update state and persist to storage', async () => {
      const { result } = renderHook(() =>
        usePersistedState('testKey', 'initial')
      );

      await waitFor(() => {
        expect(result.current[2]).toBe(false);
      });

      act(() => {
        result.current[1]('newValue');
      });

      expect(result.current[0]).toBe('newValue');

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'testKey',
          JSON.stringify('newValue')
        );
      });
    });

    it('should support function updates', async () => {
      const { result } = renderHook(() =>
        usePersistedState('testKey', 5)
      );

      await waitFor(() => {
        expect(result.current[2]).toBe(false);
      });

      act(() => {
        result.current[1]((prev: number) => prev + 1);
      });

      expect(result.current[0]).toBe(6);
    });
  });

  describe('clearValue', () => {
    it('should reset to default and remove from storage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify('storedValue'));

      const { result } = renderHook(() =>
        usePersistedState('testKey', 'defaultValue')
      );

      await waitFor(() => {
        expect(result.current[0]).toBe('storedValue');
      });

      act(() => {
        result.current[3](); // clearValue
      });

      expect(result.current[0]).toBe('defaultValue');

      await waitFor(() => {
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('testKey');
      });
    });
  });

  describe('complex types', () => {
    it('should handle objects', async () => {
      const defaultObj = { name: 'test', count: 0 };
      const { result } = renderHook(() =>
        usePersistedState('objectKey', defaultObj)
      );

      await waitFor(() => {
        expect(result.current[2]).toBe(false);
      });

      act(() => {
        result.current[1]({ name: 'updated', count: 1 });
      });

      expect(result.current[0]).toEqual({ name: 'updated', count: 1 });
    });

    it('should handle arrays', async () => {
      const { result } = renderHook(() =>
        usePersistedState('arrayKey', [1, 2, 3])
      );

      await waitFor(() => {
        expect(result.current[2]).toBe(false);
      });

      act(() => {
        result.current[1]([...result.current[0], 4]);
      });

      expect(result.current[0]).toEqual([1, 2, 3, 4]);
    });
  });
});

describe('usePersistedList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  it('should start with empty array', async () => {
    const { result } = renderHook(() =>
      usePersistedList<{ id: string; name: string }>('listKey')
    );

    expect(result.current.items).toEqual([]);
  });

  it('should add items', async () => {
    const { result } = renderHook(() =>
      usePersistedList<{ id: string; name: string }>('listKey')
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.addItem({ id: '1', name: 'Item 1' });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toEqual({ id: '1', name: 'Item 1' });
  });

  it('should remove items by predicate', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify([
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ])
    );

    const { result } = renderHook(() =>
      usePersistedList<{ id: string; name: string }>('listKey')
    );

    await waitFor(() => {
      expect(result.current.items).toHaveLength(2);
    });

    act(() => {
      result.current.removeItem((item) => item.id === '1');
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe('2');
  });

  it('should update items', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify([{ id: '1', name: 'Original' }])
    );

    const { result } = renderHook(() =>
      usePersistedList<{ id: string; name: string }>('listKey')
    );

    await waitFor(() => {
      expect(result.current.items).toHaveLength(1);
    });

    act(() => {
      result.current.updateItem(
        (item) => item.id === '1',
        { id: '1', name: 'Updated' }
      );
    });

    expect(result.current.items[0].name).toBe('Updated');
  });

  it('should check if item exists', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify([{ id: '1', name: 'Item' }])
    );

    const { result } = renderHook(() =>
      usePersistedList<{ id: string; name: string }>('listKey')
    );

    await waitFor(() => {
      expect(result.current.items).toHaveLength(1);
    });

    expect(result.current.hasItem((item) => item.id === '1')).toBe(true);
    expect(result.current.hasItem((item) => item.id === '2')).toBe(false);
  });

  it('should clear all items', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify([{ id: '1' }, { id: '2' }])
    );

    const { result } = renderHook(() =>
      usePersistedList<{ id: string }>('listKey')
    );

    await waitFor(() => {
      expect(result.current.items).toHaveLength(2);
    });

    act(() => {
      result.current.clearItems();
    });

    expect(result.current.items).toHaveLength(0);
  });
});
