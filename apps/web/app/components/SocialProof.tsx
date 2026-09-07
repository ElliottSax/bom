'use client';

import { useUserData } from '../contexts/UserDataContext';
import { FireIcon } from './Icons';

// A personal study-stats summary, sourced entirely from the current user's own
// locally-stored data. This used to be a "Community Today" widget showing
// fabricated global numbers (hardcoded fake active-user/chapter counts that
// incremented on a timer to simulate live activity) -- removed in favor of
// real numbers the app actually has, about the person looking at the screen.
export function CommunityStatsWidget() {
  const { bookmarks, notes, highlights, readingProgress } = useUserData();
  const chaptersReadCount = Object.keys(readingProgress.chaptersRead).length;

  return (
    <div className="bg-gradient-to-br from-[var(--color-accent)]/10 to-[var(--color-gold)]/10 border border-[var(--color-accent)]/30 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📖</span>
        <h3 className="font-bold text-lg">Your Study Stats</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-[var(--color-bg-secondary)] rounded-lg">
          <p className="text-2xl font-bold text-[var(--color-accent)]">{chaptersReadCount}</p>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Chapters Read</p>
        </div>

        <div className="text-center p-3 bg-[var(--color-bg-secondary)] rounded-lg">
          <p className="text-2xl font-bold text-[var(--color-accent)]">{bookmarks.length}</p>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Bookmarks</p>
        </div>

        <div className="text-center p-3 bg-[var(--color-bg-secondary)] rounded-lg">
          <p className="text-2xl font-bold text-[var(--color-accent)]">
            {notes.length + highlights.length}
          </p>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Notes &amp; Highlights</p>
        </div>

        <div className="text-center p-3 bg-[var(--color-bg-secondary)] rounded-lg">
          <p className="text-2xl font-bold text-gold-600 dark:text-gold-300 flex items-center justify-center gap-1">
            <FireIcon /> {readingProgress.currentStreak}
          </p>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Day Streak</p>
        </div>
      </div>
    </div>
  );
}
