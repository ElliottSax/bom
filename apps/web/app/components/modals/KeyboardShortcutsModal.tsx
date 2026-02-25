'use client';

import { X, Keyboard } from 'lucide-react';
import { getModifierKey, formatShortcut, type KeyboardShortcut } from '../../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: Omit<KeyboardShortcut, 'action'>[];
}

export function KeyboardShortcutsModal({ isOpen, onClose, shortcuts }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const modKey = getModifierKey();

  const categories = {
    navigation: shortcuts.filter(s =>
      s.description.toLowerCase().includes('chapter') ||
      s.description.toLowerCase().includes('verse') ||
      s.description.toLowerCase().includes('sidebar')
    ),
    actions: shortcuts.filter(s =>
      ['bookmark', 'highlight', 'note'].some(word => s.description.toLowerCase().includes(word))
    ),
    general: shortcuts.filter(s =>
      ['search', 'settings', 'help', 'theme', 'close'].some(word => s.description.toLowerCase().includes(word))
    ),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 bg-[var(--color-bg-primary)] rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Keyboard className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Keyboard Shortcuts</h2>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                Navigate faster with these shortcuts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--color-bg-secondary)] rounded-lg transition"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Navigation */}
          {categories.navigation.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className="text-2xl">🧭</span>
                Navigation
              </h3>
              <div className="space-y-2">
                {categories.navigation.map((shortcut, index) => (
                  <ShortcutRow key={index} shortcut={shortcut} />
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {categories.actions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                Quick Actions
              </h3>
              <div className="space-y-2">
                {categories.actions.map((shortcut, index) => (
                  <ShortcutRow key={index} shortcut={shortcut} />
                ))}
              </div>
            </div>
          )}

          {/* General */}
          {categories.general.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className="text-2xl">⚙️</span>
                General
              </h3>
              <div className="space-y-2">
                {categories.general.map((shortcut, index) => (
                  <ShortcutRow key={index} shortcut={shortcut} />
                ))}
              </div>
            </div>
          )}

          {/* Pro Tip */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-[var(--color-text-secondary)]">
              <span className="font-semibold text-blue-500">💡 Pro Tip:</span> Press{' '}
              <kbd className="px-2 py-1 bg-[var(--color-bg-tertiary)] rounded border border-[var(--color-border)] text-xs font-mono">
                ?
              </kbd>{' '}
              anytime to view this shortcuts menu. Keyboard shortcuts work everywhere except when typing in text fields.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
          <p className="text-xs text-[var(--color-text-tertiary)] text-center">
            Using {modKey === '⌘' ? 'Mac' : 'Windows/Linux'} keyboard layout
          </p>
        </div>
      </div>
    </div>
  );
}

function ShortcutRow({ shortcut }: { shortcut: Omit<KeyboardShortcut, 'action'> }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[var(--color-bg-secondary)] transition">
      <span className="text-sm text-[var(--color-text-secondary)]">
        {shortcut.description}
      </span>
      <kbd className="px-3 py-1.5 bg-[var(--color-bg-tertiary)] rounded-md border border-[var(--color-border)] text-xs font-mono font-semibold">
        {formatShortcut(shortcut)}
      </kbd>
    </div>
  );
}
