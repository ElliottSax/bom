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
        usePersistedState({
          key: 'testKey',
          initialValue: 'defaultValue',
        })
      );

      expect(result.current.value).toBe('defaultValue');
      expect(result.current.loading).toBe(true); // Initial loading state

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should load stored value on mount', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify('storedValue'));

      const { result } = renderHook(() =>
        usePersistedState({
          key: 'testKey',
          initialValue: 'defaultValue',
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.value).toBe('storedValue');
    });
  });

  describe('setValue', () => {
    it('should update state and persist to storage', async () => {
      const { result } = renderHook(() =>
        usePersistedState({
          key: 'testKey',
          initialValue: 'initial',
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setValue('newValue');
      });

      expect(result.current.value).toBe('newValue');

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('testKey', JSON.stringify('newValue'));
      });
    });

    it('should support function updates', async () => {
      const { result } = renderHook(() =>
        usePersistedState({
          key: 'testKey',
          initialValue: 5,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setValue((prev: number) => prev + 1);
      });

      expect(result.current.value).toBe(6);
    });
  });

  describe('clear', () => {
    it('should reset to default and remove from storage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify('storedValue'));

      const { result } = renderHook(() =>
        usePersistedState({
          key: 'testKey',
          initialValue: 'defaultValue',
        })
      );

      await waitFor(() => {
        expect(result.current.value).toBe('storedValue');
      });

      await act(async () => {
        await result.current.clear();
      });

      expect(result.current.value).toBe('defaultValue');

      await waitFor(() => {
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('testKey');
      });
    });
  });

  describe('reload', () => {
    it('should reload value from storage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify('initialValue'));

      const { result } = renderHook(() =>
        usePersistedState({
          key: 'testKey',
          initialValue: 'defaultValue',
        })
      );

      await waitFor(() => {
        expect(result.current.value).toBe('initialValue');
      });

      // Change the stored value
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify('updatedValue'));

      await act(async () => {
        await result.current.reload();
      });

      expect(result.current.value).toBe('updatedValue');
    });
  });

  describe('complex types', () => {
    it('should handle objects', async () => {
      const defaultObj = { name: 'test', count: 0 };
      const { result } = renderHook(() =>
        usePersistedState({
          key: 'objectKey',
          initialValue: defaultObj,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setValue({ name: 'updated', count: 1 });
      });

      expect(result.current.value).toEqual({ name: 'updated', count: 1 });
    });

    it('should handle arrays', async () => {
      const { result } = renderHook(() =>
        usePersistedState({
          key: 'arrayKey',
          initialValue: [1, 2, 3],
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setValue([...result.current.value, 4]);
      });

      expect(result.current.value).toEqual([1, 2, 3, 4]);
    });
  });

  describe('error handling', () => {
    it('should handle load errors', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const { result } = renderHook(() =>
        usePersistedState({
          key: 'testKey',
          initialValue: 'default',
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.error?.message).toBe('Storage error');
      expect(result.current.value).toBe('default'); // Should keep default value
    });

    it('should handle save errors', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Save failed'));

      const { result } = renderHook(() =>
        usePersistedState({
          key: 'testKey',
          initialValue: 'initial',
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setValue('newValue');
      });

      // Value should update even if save fails
      expect(result.current.value).toBe('newValue');

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });
    });
  });

  describe('debouncing', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should debounce rapid updates', async () => {
      const { result } = renderHook(() =>
        usePersistedState({
          key: 'testKey',
          initialValue: 0,
          debounceMs: 500,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Make multiple rapid updates
      act(() => {
        result.current.setValue(1);
        result.current.setValue(2);
        result.current.setValue(3);
      });

      expect(result.current.value).toBe(3);

      // Storage should not be called yet
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Now storage should be called once with final value
      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('testKey', JSON.stringify(3));
      });
    });
  });

  describe('custom serialization', () => {
    it('should use custom serializer', async () => {
      const customSerialize = (val: number) => `custom:${val}`;
      const customDeserialize = (str: string) => parseInt(str.replace('custom:', ''), 10);

      const { result } = renderHook(() =>
        usePersistedState({
          key: 'testKey',
          initialValue: 42,
          serialize: customSerialize,
          deserialize: customDeserialize,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setValue(100);
      });

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('testKey', 'custom:100');
      });
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
      usePersistedList<{ id: string; name: string }>({
        key: 'listKey',
      })
    );

    expect(result.current.items).toEqual([]);
  });

  it('should start with initial value', async () => {
    const initialItems = [
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' },
    ];

    const { result } = renderHook(() =>
      usePersistedList({
        key: 'listKey',
        initialValue: initialItems,
      })
    );

    expect(result.current.items).toEqual(initialItems);
  });

  it('should add items', async () => {
    const { result } = renderHook(() =>
      usePersistedList<{ id: string; name: string }>({
        key: 'listKey',
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.add({ id: '1', name: 'Item 1' });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toEqual({ id: '1', name: 'Item 1' });
  });

  it('should prevent duplicate IDs when adding', async () => {
    const { result } = renderHook(() =>
      usePersistedList<{ id: string; name: string }>({
        key: 'listKey',
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.add({ id: '1', name: 'Item 1' });
      result.current.add({ id: '1', name: 'Item 1 Updated' });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].name).toBe('Item 1 Updated');
  });

  it('should remove items by ID', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify([
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ])
    );

    const { result } = renderHook(() =>
      usePersistedList<{ id: string; name: string }>({
        key: 'listKey',
      })
    );

    await waitFor(() => {
      expect(result.current.items).toHaveLength(2);
    });

    act(() => {
      result.current.remove('1');
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe('2');
  });

  it('should update items by ID', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify([{ id: '1', name: 'Original' }])
    );

    const { result } = renderHook(() =>
      usePersistedList<{ id: string; name: string }>({
        key: 'listKey',
      })
    );

    await waitFor(() => {
      expect(result.current.items).toHaveLength(1);
    });

    act(() => {
      result.current.update('1', { name: 'Updated' });
    });

    expect(result.current.items[0].name).toBe('Updated');
  });

  it('should find items by ID', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify([
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ])
    );

    const { result } = renderHook(() =>
      usePersistedList<{ id: string; name: string }>({
        key: 'listKey',
      })
    );

    await waitFor(() => {
      expect(result.current.items).toHaveLength(2);
    });

    const found = result.current.find('1');
    expect(found).toEqual({ id: '1', name: 'Item 1' });

    const notFound = result.current.find('999');
    expect(notFound).toBeUndefined();
  });

  it('should filter items', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify([
        { id: '1', name: 'Item 1', active: true },
        { id: '2', name: 'Item 2', active: false },
        { id: '3', name: 'Item 3', active: true },
      ])
    );

    const { result } = renderHook(() =>
      usePersistedList<{ id: string; name: string; active: boolean }>({
        key: 'listKey',
      })
    );

    await waitFor(() => {
      expect(result.current.items).toHaveLength(3);
    });

    const activeItems = result.current.filter((item) => item.active);
    expect(activeItems).toHaveLength(2);
    expect(activeItems[0].id).toBe('1');
    expect(activeItems[1].id).toBe('3');
  });

  it('should clear all items', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify([{ id: '1' }, { id: '2' }])
    );

    const { result } = renderHook(() =>
      usePersistedList<{ id: string }>({
        key: 'listKey',
      })
    );

    await waitFor(() => {
      expect(result.current.items).toHaveLength(2);
    });

    await act(async () => {
      await result.current.clear();
    });

    expect(result.current.items).toHaveLength(0);
  });

  it('should set all items at once', async () => {
    const { result } = renderHook(() =>
      usePersistedList<{ id: string; name: string }>({
        key: 'listKey',
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const newItems = [
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' },
    ];

    act(() => {
      result.current.setItems(newItems);
    });

    expect(result.current.items).toEqual(newItems);
  });

  it('should set items using function', async () => {
    const { result } = renderHook(() =>
      usePersistedList<{ id: string; count: number }>({
        key: 'listKey',
        initialValue: [
          { id: '1', count: 1 },
          { id: '2', count: 2 },
        ],
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setItems((prev) => prev.map((item) => ({ ...item, count: item.count * 2 })));
    });

    expect(result.current.items[0].count).toBe(2);
    expect(result.current.items[1].count).toBe(4);
  });
});
