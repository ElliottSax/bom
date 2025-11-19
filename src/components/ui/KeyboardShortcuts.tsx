'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, X } from 'lucide-react';

interface Shortcut {
  keys: string[];
  description: string;
  action: () => void;
}

interface KeyboardShortcutsProps {
  shortcuts: Shortcut[];
  onClose?: () => void;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      shortcuts.forEach(({ keys, action }) => {
        const modifierKey = keys.includes('cmd') || keys.includes('ctrl');
        const shiftKey = keys.includes('shift');
        const keyPressed = keys[keys.length - 1].toLowerCase();

        const matchesModifier = modifierKey ? (e.metaKey || e.ctrlKey) : true;
        const matchesShift = shiftKey ? e.shiftKey : true;
        const matchesKey = e.key.toLowerCase() === keyPressed;

        if (matchesModifier && matchesShift && matchesKey) {
          e.preventDefault();
          action();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

export function KeyboardShortcutsHelper({ shortcuts, onClose }: KeyboardShortcutsProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && e.shiftKey) {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* Floating help button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 p-3 rounded-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-lg hover:shadow-xl transition-shadow"
        title="Keyboard shortcuts (?)"
      >
        <Command className="w-5 h-5" />
      </motion.button>

      {/* Shortcuts modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-50 p-6"
            >
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Command className="w-6 h-6 text-white" />
                    <h2 className="text-2xl font-bold text-white">
                      Keyboard Shortcuts
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Shortcuts list */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                  <div className="space-y-3">
                    {shortcuts.map((shortcut, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                      >
                        <span className="text-gray-700 dark:text-gray-300">
                          {shortcut.description}
                        </span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, j) => (
                            <kbd
                              key={j}
                              className="px-2 py-1 text-sm font-mono bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm"
                            >
                              {key}
                            </kbd>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Global shortcuts */}
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                      GLOBAL SHORTCUTS
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center justify-between">
                        <span>Show keyboard shortcuts</span>
                        <kbd className="px-2 py-1 font-mono bg-gray-100 dark:bg-gray-800 rounded">
                          ?
                        </kbd>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Close modal/dialog</span>
                        <kbd className="px-2 py-1 font-mono bg-gray-100 dark:bg-gray-800 rounded">
                          Esc
                        </kbd>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
