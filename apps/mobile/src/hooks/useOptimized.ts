/**
 * Optimized React hooks for performance
 */

import { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StudyPlan, Verse, SearchResult } from '../types';

/**
 * Optimized search with debouncing
 */
export function useDebouncedSearch(searchFn: (query: string) => void, delay: number = 500) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedSearch = useCallback(
    (query: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        searchFn(query);
      }, delay);
    },
    [searchFn, delay]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedSearch;
}

/**
 * Optimized study plan progress calculation
 */
export function useStudyPlanProgress(plan: StudyPlan | null) {
  const progress = useMemo(() => {
    if (!plan || !plan.progress) return 0;

    const totalDays = Object.keys(plan.progress).length;
    if (totalDays === 0) return 0;

    const completedDays = Object.values(plan.progress).filter((p) => p.completed).length;

    return Math.round((completedDays / totalDays) * 100);
  }, [plan]);

  const streak = useMemo(() => {
    if (!plan || !plan.progress) return 0;

    const dates = Object.keys(plan.progress).sort().reverse();
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];

    for (const date of dates) {
      if (date > today) continue;

      if (plan.progress[date]?.completed) {
        currentStreak++;
      } else {
        break;
      }
    }

    return currentStreak;
  }, [plan]);

  const nextStudyDate = useMemo(() => {
    if (!plan) return null;

    const today = new Date();
    const endDate = new Date(plan.endDate);

    if (today > endDate) return null;

    // Find next uncompleted date
    const dates = Object.keys(plan.progress).sort();
    for (const date of dates) {
      const dateObj = new Date(date);
      if (dateObj >= today && !plan.progress[date]?.completed) {
        return dateObj;
      }
    }

    return null;
  }, [plan]);

  return { progress, streak, nextStudyDate };
}

/**
 * Optimized verse filtering and sorting
 */
export function useFilteredVerses(
  verses: Verse[],
  searchQuery: string,
  sortBy: 'book' | 'chapter' | 'verse' = 'verse'
) {
  const filteredVerses = useMemo(() => {
    if (!searchQuery) return verses;

    const query = searchQuery.toLowerCase();
    return verses.filter(
      (verse) =>
        verse.text.toLowerCase().includes(query) || verse.book.toLowerCase().includes(query)
    );
  }, [verses, searchQuery]);

  const sortedVerses = useMemo(() => {
    return [...filteredVerses].sort((a, b) => {
      switch (sortBy) {
        case 'book':
          return a.book.localeCompare(b.book);
        case 'chapter':
          return a.chapter - b.chapter;
        case 'verse':
        default:
          return a.verse - b.verse;
      }
    });
  }, [filteredVerses, sortBy]);

  return sortedVerses;
}

/**
 * Optimized search results grouping
 */
export function useGroupedSearchResults(results: SearchResult[]) {
  const groupedResults = useMemo(() => {
    const groups = new Map<string, SearchResult[]>();

    results.forEach((result) => {
      const key = `${result.book} ${result.chapter}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(result);
    });

    return Array.from(groups.entries()).map(([key, items]) => ({
      title: key,
      data: items.sort((a, b) => a.verse - b.verse),
    }));
  }, [results]);

  return groupedResults;
}

/**
 * Optimized infinite scroll hook
 */
export function useInfiniteScroll<T>(items: T[], pageSize: number = 20) {
  const [displayedItems, setDisplayedItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const endIndex = page * pageSize;
    setDisplayedItems(items.slice(0, endIndex));
    setHasMore(endIndex < items.length);
  }, [items, page, pageSize]);

  const loadMore = useCallback(() => {
    if (hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore]);

  const reset = useCallback(() => {
    setPage(1);
  }, []);

  return {
    displayedItems,
    hasMore,
    loadMore,
    reset,
  };
}

/**
 * Optimized local storage hook with caching
 */
export function useCachedStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void, () => void] {
  const [cachedValue, setCachedValue] = useState<T>(initialValue);
  const cacheRef = useRef<T>(initialValue);

  useEffect(() => {
    // Load from storage on mount
    AsyncStorage.getItem(key).then((stored) => {
      if (stored) {
        const parsed = JSON.parse(stored) as T;
        setCachedValue(parsed);
        cacheRef.current = parsed;
      }
    });
  }, [key]);

  const setValue = useCallback(
    (value: T) => {
      setCachedValue(value);
      cacheRef.current = value;
      AsyncStorage.setItem(key, JSON.stringify(value));
    },
    [key]
  );

  const clearValue = useCallback(() => {
    setCachedValue(initialValue);
    cacheRef.current = initialValue;
    AsyncStorage.removeItem(key);
  }, [key, initialValue]);

  return [cachedValue, setValue, clearValue];
}

/**
 * Optimized scroll position restoration
 */
import { NativeSyntheticEvent, NativeScrollEvent, ScrollView } from 'react-native';

export function useScrollPosition(key: string) {
  const scrollViewRef = useRef<ScrollView>(null);
  const positionRef = useRef(0);

  const savePosition = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const position = event.nativeEvent.contentOffset.y;
      positionRef.current = position;
      AsyncStorage.setItem(`scroll_${key}`, position.toString());
    },
    [key]
  );

  const restorePosition = useCallback(async () => {
    const saved = await AsyncStorage.getItem(`scroll_${key}`);
    if (saved && scrollViewRef.current) {
      const position = parseFloat(saved);
      scrollViewRef.current.scrollTo({ y: position, animated: false });
    }
  }, [key]);

  useEffect(() => {
    restorePosition();
  }, [restorePosition]);

  return {
    scrollViewRef,
    savePosition,
    restorePosition,
  };
}

/**
 * Optimized form validation
 */
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validate: (values: T) => Record<string, string>
) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = useMemo(() => {
    return validate(values);
  }, [values, validate]);

  const visibleErrors = useMemo(() => {
    const visible: Record<string, string> = {};
    Object.keys(errors).forEach((key) => {
      if (touched[key]) {
        visible[key] = errors[key];
      }
    });
    return visible;
  }, [errors, touched]);

  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  const setFieldValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setFieldTouched = useCallback((field: string, isTouched: boolean = true) => {
    setTouched((prev) => ({ ...prev, [field]: isTouched }));
  }, []);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors: visibleErrors,
    touched,
    isValid,
    setFieldValue,
    setFieldTouched,
    resetForm,
  };
}
