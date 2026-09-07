'use client';

import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon, MoonIcon } from './Icons';
import { fadeIn, tapPress } from '../lib/motion';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      whileTap={tapPress}
      className={`p-2 rounded-lg transition-colors hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-accent)] ${className}`}
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div className="flex items-center gap-2">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={resolvedTheme}
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="inline-flex"
          >
            {/* resolvedTheme is 'dark' -> show the sun (switches to light); 'light' -> show the moon */}
            {resolvedTheme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </motion.span>
        </AnimatePresence>
        {showLabel && (
          <span className="text-sm text-[var(--color-text-secondary)]">
            {resolvedTheme === 'dark' ? 'Light' : 'Dark'}
          </span>
        )}
      </div>
    </motion.button>
  );
}

export default ThemeToggle;
