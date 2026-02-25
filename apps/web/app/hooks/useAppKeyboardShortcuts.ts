'use client';

import { useMemo } from 'react';
import { useKeyboardShortcuts, COMMON_SHORTCUTS, type KeyboardShortcut } from './useKeyboardShortcuts';

interface AppKeyboardShortcutsProps {
  onSearch: () => void;
  onSettings: () => void;
  onHelp: () => void;
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  enabled?: boolean;
}

/**
 * Application-wide keyboard shortcuts
 * Consolidates all shortcut logic in one place
 */
export function useAppKeyboardShortcuts({
  onSearch,
  onSettings,
  onHelp,
  onToggleSidebar,
  onToggleTheme,
  enabled = true,
}: AppKeyboardShortcutsProps) {
  const shortcuts: KeyboardShortcut[] = useMemo(
    () => [
      {
        ...COMMON_SHORTCUTS.SEARCH,
        action: onSearch,
      },
      {
        ...COMMON_SHORTCUTS.SETTINGS,
        action: onSettings,
      },
      {
        ...COMMON_SHORTCUTS.HELP,
        action: onHelp,
      },
      {
        ...COMMON_SHORTCUTS.TOGGLE_SIDEBAR,
        action: onToggleSidebar,
      },
      {
        ...COMMON_SHORTCUTS.TOGGLE_THEME,
        action: onToggleTheme,
      },
    ],
    [onSearch, onSettings, onHelp, onToggleSidebar, onToggleTheme]
  );

  useKeyboardShortcuts({ shortcuts, enabled });

  // Return shortcuts for display in help modal
  return shortcuts;
}
