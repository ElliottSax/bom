'use client';

import { useDailyVerse } from '../hooks/useDailyVerse';
import { ShareButton } from './ShareButton';
import { createVerseShareData } from '../hooks/useShare';
import { SparklesIcon } from './Icons';

interface DailyVerseWidgetProps {
  volumeColor?: string;
  variant?: 'compact' | 'card' | 'hero';
  showShare?: boolean;
  className?: string;
}

export function DailyVerseWidget({
  volumeColor = '#8B5CF6',
  variant = 'card',
  showShare = true,
  className = '',
}: DailyVerseWidgetProps) {
  const { verse, refresh } = useDailyVerse();

  if (!verse) {
    return null;
  }

  const shareData = createVerseShareData(
    verse.text,
    verse.reference,
    'https://bom.study'
  );

  // Compact variant for sidebar
  if (variant === 'compact') {
    return (
      <div className={`bg-[var(--color-bg-secondary)] rounded-lg p-3 ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4">✨</span>
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">
              Daily Verse
            </span>
          </div>
          {showShare && (
            <ShareButton data={shareData} variant="icon-only" size="sm" showMenu={true} />
          )}
        </div>
        <p className="text-xs leading-relaxed text-[var(--color-text-tertiary)] line-clamp-3 italic">
          &quot;{verse.text.length > 100 ? verse.text.slice(0, 100) + '...' : verse.text}&quot;
        </p>
        <p className="text-xs font-medium mt-2" style={{ color: volumeColor }}>
          {verse.reference}
        </p>
      </div>
    );
  }

  // Hero variant for main landing/home
  if (variant === 'hero') {
    return (
      <div
        className={`
          relative overflow-hidden rounded-3xl p-8 md:p-12
          bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-cyan-500/10
          border border-purple-500/20
          ${className}
        `}
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">Verse of the Day</h3>
                <p className="text-sm text-[var(--color-text-tertiary)]">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            {showShare && (
              <ShareButton data={shareData} variant="primary" size="md" showMenu={true} />
            )}
          </div>

          <blockquote className="text-lg md:text-xl leading-relaxed text-[var(--color-text-primary)] italic mb-4">
            &quot;{verse.text}&quot;
          </blockquote>

          <p className="text-base font-semibold" style={{ color: volumeColor }}>
            — {verse.reference}
          </p>
        </div>
      </div>
    );
  }

  // Card variant (default)
  return (
    <div
      className={`
        bg-gradient-to-br from-[var(--color-bg-secondary)] to-[var(--color-bg-tertiary)]
        rounded-2xl p-6 border border-[var(--color-border-light)]
        hover:shadow-lg transition-all duration-200
        ${className}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <span className="text-lg">✨</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Verse of the Day</h3>
            <p className="text-xs text-[var(--color-text-tertiary)]">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
        {showShare && (
          <ShareButton data={shareData} variant="icon-only" size="sm" showMenu={true} />
        )}
      </div>

      <blockquote className="text-sm leading-relaxed text-[var(--color-text-secondary)] italic mb-3">
        &quot;{verse.text}&quot;
      </blockquote>

      <p className="text-sm font-semibold" style={{ color: volumeColor }}>
        — {verse.reference}
      </p>

      {/* Quick actions */}
      <div className="mt-4 pt-4 border-t border-[var(--color-border-light)] flex gap-2">
        <button
          onClick={() => {
            // Navigate to the verse
            // This would need to be wired up with the navigation system
          }}
          className="flex-1 px-3 py-2 bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-secondary)] rounded-lg text-xs font-medium transition"
        >
          Read Chapter
        </button>
        <button
          className="flex-1 px-3 py-2 bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-secondary)] rounded-lg text-xs font-medium transition"
        >
          Add to Study
        </button>
      </div>
    </div>
  );
}

// Daily verse banner for notifications
export function DailyVerseBanner() {
  const { verse } = useDailyVerse();

  if (!verse) return null;

  return (
    <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-b border-purple-500/20 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-xl flex-shrink-0">✨</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[var(--color-text-secondary)]">Today's Verse</p>
            <p className="text-sm text-[var(--color-text-primary)] truncate">
              &quot;{verse.text.length > 80 ? verse.text.slice(0, 80) + '...' : verse.text}&quot;
            </p>
          </div>
        </div>
        <ShareButton
          data={createVerseShareData(verse.text, verse.reference)}
          variant="secondary"
          size="sm"
          showMenu={true}
        />
      </div>
    </div>
  );
}

// Widget for PWA/mobile home screen
export function DailyVerseHomeScreenWidget() {
  const { verse } = useDailyVerse();

  if (!verse) return null;

  return (
    <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 p-4 text-white">
      <div className="flex flex-col h-full justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">✨</span>
            <span className="text-sm font-semibold">Daily Verse</span>
          </div>
          <p className="text-base leading-snug mb-2 line-clamp-4">
            &quot;{verse.text.length > 120 ? verse.text.slice(0, 120) + '...' : verse.text}&quot;
          </p>
        </div>
        <p className="text-sm font-semibold opacity-90">
          — {verse.reference}
        </p>
      </div>
    </div>
  );
}
