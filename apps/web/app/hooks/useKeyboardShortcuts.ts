'use client';

import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  description: string;
  action: () => void;
  enabled?: boolean;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

/**
 * Hook for handling keyboard shortcuts
 * Automatically handles Cmd on Mac, Ctrl on Windows/Linux
 */
export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow Cmd/Ctrl+K even in inputs for search
        if (!(event.key === 'k' && (event.ctrlKey || event.metaKey))) {
          return;
        }
      }

      for (const shortcut of shortcuts) {
        if (shortcut.enabled === false) continue;

        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrlKey ? event.ctrlKey : true;
        const metaMatch = shortcut.metaKey ? event.metaKey : true;
        const shiftMatch = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.altKey ? event.altKey : !event.altKey;

        // Handle Cmd (Mac) / Ctrl (Windows/Linux) as equivalent
        const modifierMatch =
          (shortcut.ctrlKey || shortcut.metaKey)
            ? (event.ctrlKey || event.metaKey)
            : ctrlMatch && metaMatch;

        if (keyMatch && modifierMatch && shiftMatch && altMatch) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);
}

/**
 * Get platform-specific modifier key label
 */
export function getModifierKey(): '⌘' | 'Ctrl' {
  if (typeof window === 'undefined') return 'Ctrl';
  return navigator.platform.toLowerCase().includes('mac') ? '⌘' : 'Ctrl';
}

/**
 * Format keyboard shortcut for display
 */
export function formatShortcut(shortcut: Omit<KeyboardShortcut, 'action' | 'description'>): string {
  const parts: string[] = [];
  const isMac = typeof window !== 'undefined' && navigator.platform.toLowerCase().includes('mac');

  if (shortcut.ctrlKey || shortcut.metaKey) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (shortcut.shiftKey) {
    parts.push('Shift');
  }
  if (shortcut.altKey) {
    parts.push(isMac ? '⌥' : 'Alt');
  }
  parts.push(shortcut.key.toUpperCase());

  return parts.join(isMac ? '' : '+');
}

/**
 * Common keyboard shortcuts for scripture study app
 */
export const COMMON_SHORTCUTS = {
  SEARCH: { key: 'k', ctrlKey: true, description: 'Open search' },
  BOOKMARK: { key: 'b', description: 'Toggle bookmark' },
  HIGHLIGHT: { key: 'h', description: 'Highlight verse' },
  NOTE: { key: 'n', description: 'Add note' },
  SETTINGS: { key: ',', ctrlKey: true, description: 'Open settings' },
  HELP: { key: '?', shiftKey: true, description: 'Show keyboard shortcuts' },
  NEXT_CHAPTER: { key: 'ArrowRight', description: 'Next chapter' },
  PREV_CHAPTER: { key: 'ArrowLeft', description: 'Previous chapter' },
  NEXT_VERSE: { key: 'ArrowDown', description: 'Next verse' },
  PREV_VERSE: { key: 'ArrowUp', description: 'Previous verse' },
  TOGGLE_SIDEBAR: { key: 's', altKey: true, description: 'Toggle sidebar' },
  TOGGLE_THEME: { key: 'd', ctrlKey: true, description: 'Toggle dark mode' },
  CLOSE_MODAL: { key: 'Escape', description: 'Close modal' },
} as const;
