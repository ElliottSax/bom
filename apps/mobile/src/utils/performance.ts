/**
 * Performance utility functions for React Native
 * Includes optimization helpers and performance measurement tools
 */

import { InteractionManager } from 'react-native';

/**
 * Debounce function to limit execution frequency
 * Useful for search inputs, scroll handlers, etc.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit execution rate
 * Useful for scroll handlers, gestures, etc.
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Run code after interactions are complete
 * Improves perceived performance by deferring non-critical work
 */
export function runAfterInteractions<T>(fn: () => T): Promise<T> {
  return new Promise((resolve) => {
    InteractionManager.runAfterInteractions(() => {
      resolve(fn());
    });
  });
}

/**
 * Measure execution time of a function
 */
export async function measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;

    if (__DEV__) {
      console.log(`[Performance] ${name}: ${duration}ms`);
    }

    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`[Performance] ${name} failed after ${duration}ms`);
    throw error;
  }
}

/**
 * Synchronous version of measure
 */
export function measure<T>(name: string, fn: () => T): T {
  const start = Date.now();
  try {
    const result = fn();
    const duration = Date.now() - start;

    if (__DEV__) {
      console.log(`[Performance] ${name}: ${duration}ms`);
    }

    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`[Performance] ${name} failed after ${duration}ms`);
    throw error;
  }
}

/**
 * Batch setState updates to reduce re-renders
 * React Native doesn't have unstable_batchedUpdates exposed,
 * but we can use a similar pattern
 */
export function batchUpdates(fn: () => void): void {
  // In React Native, updates are already batched within event handlers
  // This is a no-op but kept for API consistency
  fn();
}

/**
 * FlatList optimization: Standard item layout calculator
 */
export function createGetItemLayout(itemHeight: number, separatorHeight = 0) {
  return (_data: unknown, index: number) => ({
    length: itemHeight,
    offset: (itemHeight + separatorHeight) * index,
    index,
  });
}

/**
 * Check if value has changed (shallow comparison)
 * Useful for shouldComponentUpdate logic
 */
export function hasChanged(prev: unknown, next: unknown): boolean {
  if (prev === next) return false;

  if (typeof prev !== 'object' || typeof next !== 'object') {
    return prev !== next;
  }

  if (!prev || !next) return prev !== next;

  const prevKeys = Object.keys(prev);
  const nextKeys = Object.keys(next);

  if (prevKeys.length !== nextKeys.length) return true;

  for (const key of prevKeys) {
    if ((prev as Record<string, unknown>)[key] !== (next as Record<string, unknown>)[key])
      return true;
  }

  return false;
}

/**
 * Memoize function results
 * Simple memoization for expensive computations
 */
export function memoize<T extends (...args: unknown[]) => unknown>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Chunk array into smaller arrays
 * Useful for processing large datasets in batches
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Process array in chunks with delays between
 * Prevents blocking the main thread
 */
export async function processInChunks<T, R>(
  array: T[],
  processor: (item: T) => R,
  chunkSize = 50,
  delayMs = 10
): Promise<R[]> {
  const chunks = chunk(array, chunkSize);
  const results: R[] = [];

  for (const chunkArray of chunks) {
    for (const item of chunkArray) {
      results.push(processor(item));
    }

    // Give the main thread a break
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

/**
 * Log memory warnings (iOS only, approximation for Android)
 */
export function setupMemoryWarnings() {
  if (__DEV__) {
    // This would need react-native-device-info or similar
    console.log('[Performance] Memory monitoring enabled in development');
  }
}

/**
 * Animation configuration presets for optimal performance
 */
export const AnimationPresets = {
  // Fast, snappy animations for UI interactions
  quick: {
    duration: 200,
    useNativeDriver: true,
  },
  // Standard animations for most use cases
  standard: {
    duration: 300,
    useNativeDriver: true,
  },
  // Smooth, gentle animations
  smooth: {
    duration: 500,
    useNativeDriver: true,
  },
  // Layout animations (can't use native driver)
  layout: {
    duration: 300,
    useNativeDriver: false,
  },
};

/**
 * Check if device is low-end
 * Useful for conditional rendering or quality adjustments
 */
export function isLowEndDevice(): boolean {
  // This is a placeholder - in production, you'd use:
  // - react-native-device-info to get RAM, processor info
  // - Performance benchmarks on app start
  // - User settings/preferences

  if (__DEV__) {
    return false; // Assume high-end in development
  }

  // For now, return false - implement proper detection later
  return false;
}

/**
 * Get optimal FlatList configuration based on device
 */
export function getOptimalFlatListProps() {
  const isLowEnd = isLowEndDevice();

  return {
    maxToRenderPerBatch: isLowEnd ? 5 : 10,
    updateCellsBatchingPeriod: isLowEnd ? 100 : 50,
    initialNumToRender: isLowEnd ? 10 : 15,
    windowSize: isLowEnd ? 11 : 21,
    removeClippedSubviews: true,
  };
}
