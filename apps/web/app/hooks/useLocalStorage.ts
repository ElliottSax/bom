import { useState, useEffect } from 'react';
import { logger } from '../utils/logger';

const log = logger.scope('LocalStorage');

function useLocalStorage<T>(key: string, initialValue: T) {
  // Get from local storage or return initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      log.error('Error reading from localStorage', error);
      return initialValue;
    }
  });

  // Effect to update local storage when state changes
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      }
    } catch (error) {
      log.error('Error writing to localStorage', error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}

export default useLocalStorage;