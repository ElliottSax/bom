/**
 * Performance monitoring hook for React Native
 * Tracks component render times and provides performance insights
 */

import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  renderCount: number;
  averageRenderTime: number;
  lastRenderTime: number;
  componentName: string;
}

const performanceData = new Map<string, PerformanceMetrics>();

export function usePerformanceMonitor(
  componentName: string,
  enabled = __DEV__
) {
  const renderCount = useRef(0);
  const renderStartTime = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    renderCount.current++;
    const renderTime = Date.now() - renderStartTime.current;

    const existing = performanceData.get(componentName);
    const metrics: PerformanceMetrics = {
      componentName,
      renderCount: renderCount.current,
      lastRenderTime: renderTime,
      averageRenderTime: existing
        ? (existing.averageRenderTime * (existing.renderCount - 1) + renderTime) /
          existing.renderCount
        : renderTime,
    };

    performanceData.set(componentName, metrics);

    // Log slow renders (> 16ms = 60fps threshold)
    if (renderTime > 16) {
      console.warn(
        `[Performance] Slow render detected in ${componentName}: ${renderTime.toFixed(
          2
        )}ms`
      );
    }
  });

  // Mark render start
  if (enabled) {
    renderStartTime.current = Date.now();
  }

  return {
    getMetrics: () => performanceData.get(componentName),
    getAllMetrics: () => Array.from(performanceData.values()),
    clearMetrics: () => performanceData.clear(),
  };
}

/**
 * Hook to detect memory leaks in components
 * Warns if component unmounts with uncleared timers/listeners
 */
export function useMemoryLeakDetector(componentName: string) {
  const timers = useRef<Set<NodeJS.Timeout>>(new Set());
  const listeners = useRef<Set<() => void>>(new Set());

  useEffect(() => {
    return () => {
      // Check for uncleared timers
      if (timers.current.size > 0) {
        console.warn(
          `[Memory Leak] ${componentName} unmounted with ${timers.current.size} active timers`
        );
        timers.current.forEach(clearTimeout);
      }

      // Check for unremoved listeners
      if (listeners.current.size > 0) {
        console.warn(
          `[Memory Leak] ${componentName} unmounted with ${listeners.current.size} active listeners`
        );
        listeners.current.forEach((cleanup) => cleanup());
      }
    };
  }, [componentName]);

  return {
    registerTimer: (timer: NodeJS.Timeout) => timers.current.add(timer),
    clearTimer: (timer: NodeJS.Timeout) => {
      clearTimeout(timer);
      timers.current.delete(timer);
    },
    registerListener: (cleanup: () => void) => listeners.current.add(cleanup),
    clearListener: (cleanup: () => void) => listeners.current.delete(cleanup),
  };
}

/**
 * Hook to measure component lifecycle performance
 */
export function useComponentLifecycle(componentName: string, enabled = __DEV__) {
  const mountTime = useRef<number>();
  const renderCount = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    // Component mounted
    mountTime.current = Date.now();
    console.log(`[Lifecycle] ${componentName} mounted`);

    return () => {
      // Component unmounting
      const lifetime = mountTime.current ? Date.now() - mountTime.current : 0;
      console.log(
        `[Lifecycle] ${componentName} unmounted after ${lifetime.toFixed(
          2
        )}ms (${renderCount.current} renders)`
      );
    };
  }, [componentName, enabled]);

  renderCount.current++;
}
