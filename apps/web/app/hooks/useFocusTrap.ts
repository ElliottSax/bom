import { useEffect, useRef } from 'react';

/**
 * Hook to trap focus within a modal dialog for accessibility
 * @param isOpen - Whether the modal is currently open
 */
export function useFocusTrap(isOpen: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Store the element that had focus before opening the modal
    const previouslyFocusedElement = document.activeElement as HTMLElement;

    // Focus the first element when modal opens
    firstElement?.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    // Cleanup: restore focus to previously focused element
    return () => {
      container.removeEventListener('keydown', handleTabKey);
      previouslyFocusedElement?.focus();
    };
  }, [isOpen]);

  return containerRef;
}
