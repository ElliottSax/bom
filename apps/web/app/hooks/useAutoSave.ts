import { useEffect, useRef } from 'react';

/**
 * Hook to automatically save data after a delay
 * @param value - The value to auto-save
 * @param onSave - Callback function to save the value
 * @param delay - Delay in milliseconds before saving (default: 1000ms)
 */
export function useAutoSave<T>(
  value: T,
  onSave: (value: T) => void,
  delay: number = 1000
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialValueRef = useRef<T>(value);

  useEffect(() => {
    // Don't auto-save on initial mount
    if (initialValueRef.current === value) {
      initialValueRef.current = value;
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      onSave(value);
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, onSave, delay]);
}
