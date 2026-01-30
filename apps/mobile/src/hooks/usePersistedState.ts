/**
 * Generic Persisted State Hook
 *
 * Provides a reusable hook for managing state persisted to AsyncStorage.
 * Eliminates code duplication across useHighlights, useNotes, useBookmarks, etc.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';

const log = logger.scope('PersistedState');

interface UsePersistedStateOptions<T> {
  /** Storage key for AsyncStorage */
  key: string;
  /** Initial value if nothing is stored */
  initialValue: T;
  /** Optional serializer (defaults to JSON.stringify) */
  serialize?: (value: T) => string;
  /** Optional deserializer (defaults to JSON.parse) */
  deserialize?: (stored: string) => T;
  /** Debounce save operations (ms) - useful for frequent updates */
  debounceMs?: number;
}

interface UsePersistedStateResult<T> {
  /** Current value */
  value: T;
  /** Whether initial load is complete */
  loading: boolean;
  /** Any error that occurred during load/save */
  error: Error | null;
  /** Update the value (persists automatically) */
  setValue: (newValue: T | ((prev: T) => T)) => void;
  /** Force reload from storage */
  reload: () => Promise<void>;
  /** Clear the stored value */
  clear: () => Promise<void>;
}

/**
 * Hook for managing state that persists to AsyncStorage
 *
 * @example
 * ```typescript
 * const { value: bookmarks, setValue: setBookmarks, loading } = usePersistedState({
 *   key: '@bom_bookmarks',
 *   initialValue: [],
 * });
 * ```
 */
export function usePersistedState<T>({
  key,
  initialValue,
  serialize = JSON.stringify,
  deserialize = JSON.parse,
  debounceMs = 0,
}: UsePersistedStateOptions<T>): UsePersistedStateResult<T> {
  const [value, setValueInternal] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Track if component is mounted to prevent state updates after unmount
  const isMounted = useRef(true);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const pendingValue = useRef<T | null>(null);

  // Load from storage on mount
  useEffect(() => {
    isMounted.current = true;
    loadFromStorage();

    return () => {
      isMounted.current = false;
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        // Save any pending value before unmount
        if (pendingValue.current !== null) {
          saveToStorage(pendingValue.current).catch((err) => log.error('Failed to save pending value', err));
        }
      }
    };
  }, [key]);

  const loadFromStorage = async () => {
    try {
      setLoading(true);
      setError(null);
      const stored = await AsyncStorage.getItem(key);

      if (isMounted.current) {
        if (stored !== null) {
          setValueInternal(deserialize(stored));
        }
        setLoading(false);
      }
    } catch (err) {
      log.error(`Failed to load ${key} from storage`, err);
      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      }
    }
  };

  const saveToStorage = async (valueToSave: T) => {
    try {
      await AsyncStorage.setItem(key, serialize(valueToSave));
    } catch (err) {
      log.error(`Failed to save ${key} to storage`, err);
      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    }
  };

  const setValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValueInternal((prev) => {
      const resolved = typeof newValue === 'function'
        ? (newValue as (prev: T) => T)(prev)
        : newValue;

      // Handle debounced saves
      if (debounceMs > 0) {
        pendingValue.current = resolved;
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        }
        debounceTimer.current = setTimeout(() => {
          if (pendingValue.current !== null) {
            saveToStorage(pendingValue.current);
            pendingValue.current = null;
          }
        }, debounceMs);
      } else {
        // Immediate save
        saveToStorage(resolved);
      }

      return resolved;
    });
  }, [key, debounceMs]);

  const reload = useCallback(async () => {
    await loadFromStorage();
  }, [key]);

  const clear = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(key);
      if (isMounted.current) {
        setValueInternal(initialValue);
      }
    } catch (err) {
      log.error(`Failed to clear ${key}`, err);
      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    }
  }, [key, initialValue]);

  return {
    value,
    loading,
    error,
    setValue,
    reload,
    clear,
  };
}

/**
 * Hook for managing a list with common CRUD operations
 * Built on top of usePersistedState with list-specific helpers
 */
interface UsePersistedListOptions<T extends { id: string }> extends Omit<UsePersistedStateOptions<T[]>, 'initialValue'> {
  /** Optional initial value (defaults to empty array) */
  initialValue?: T[];
}

interface UsePersistedListResult<T extends { id: string }> {
  items: T[];
  loading: boolean;
  error: Error | null;
  /** Add an item to the list (at the beginning) */
  add: (item: T) => void;
  /** Remove an item by ID */
  remove: (id: string) => void;
  /** Update an item by ID */
  update: (id: string, updates: Partial<T>) => void;
  /** Find an item by ID */
  find: (id: string) => T | undefined;
  /** Filter items */
  filter: (predicate: (item: T) => boolean) => T[];
  /** Clear all items */
  clear: () => Promise<void>;
  /** Set all items (replaces entire list, or update via function) */
  setItems: (items: T[] | ((prev: T[]) => T[])) => void;
}

export function usePersistedList<T extends { id: string }>({
  key,
  initialValue = [],
  ...options
}: UsePersistedListOptions<T>): UsePersistedListResult<T> {
  const { value: items, setValue: setItems, loading, error, clear } = usePersistedState<T[]>({
    key,
    initialValue,
    ...options,
  });

  const add = useCallback((item: T) => {
    setItems((prev) => [item, ...prev.filter((i) => i.id !== item.id)]);
  }, [setItems]);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, [setItems]);

  const update = useCallback((id: string, updates: Partial<T>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, [setItems]);

  const find = useCallback((id: string) => {
    return items.find((item) => item.id === id);
  }, [items]);

  const filter = useCallback((predicate: (item: T) => boolean) => {
    return items.filter(predicate);
  }, [items]);

  return {
    items,
    loading,
    error,
    add,
    remove,
    update,
    find,
    filter,
    clear,
    setItems,
  };
}

export default usePersistedState;
