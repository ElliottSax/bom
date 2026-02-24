'use client';

import { useState } from 'react';
import { ShareButton } from './ShareButton';
import { createStreakShareData } from '../hooks/useShare';

interface StreakWidgetProps {
  currentStreak: number;
  longestStreak: number;
  variant?: 'compact' | 'detailed';
  showShare?: boolean;
  className?: string;
}

export function StreakWidget({
  currentStreak,
  longestStreak,
  variant = 'compact',
  showShare = true,
  className = '',
}: StreakWidgetProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Determine streak level and emoji
  const getStreakLevel = (streak: number) => {
    if (streak >= 365) return { level: 'legendary', emoji: '👑', color: 'text-yellow-500' };
    if (streak >= 100) return { level: 'epic', emoji: '🔥🔥🔥', color: 'text-purple-500' };
    if (streak >= 30) return { level: 'great', emoji: '🔥🔥', color: 'text-orange-600' };
    if (streak >= 7) return { level: 'good', emoji: '🔥', color: 'text-orange-500' };
    if (streak >= 3) return { level: 'building', emoji: '🔥', color: 'text-orange-400' };
    return { level: 'starting', emoji: '🔥', color: 'text-gray-500' };
  };

  const { emoji, color } = getStreakLevel(currentStreak);
  const isMilestone = [3, 7, 14, 30, 60, 100, 365].includes(currentStreak);

  // Calculate days until next milestone
  const getNextMilestone = (streak: number) => {
    const milestones = [3, 7, 14, 30, 60, 100, 365];
    const next = milestones.find(m => m > streak);
    return next || null;
  };

  const nextMilestone = getNextMilestone(currentStreak);
  const daysUntilNext = nextMilestone ? nextMilestone - currentStreak : 0;

  if (variant === 'compact') {
    return (
      <div
        onClick={() => setShowDetails(!showDetails)}
        className={`
          relative cursor-pointer group
          ${className}
        `}
      >
        <div className="flex items-center gap-2">
          <span className={`text-2xl ${isMilestone ? 'animate-pulse' : ''}`}>
            {emoji}
          </span>
          <div>
            <p className={`text-xl font-bold ${color}`}>{currentStreak}</p>
            <p className="text-xs text-[var(--color-text-tertiary)]">day streak</p>
          </div>
        </div>

        {/* Tooltip */}
        {showDetails && (
          <div className="absolute top-full mt-2 left-0 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg shadow-lg p-4 z-10 min-w-[250px]">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-[var(--color-text-secondary)]">Current:</span>
                <span className="text-sm font-semibold">{currentStreak} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[var(--color-text-secondary)]">Best:</span>
                <span className="text-sm font-semibold">{longestStreak} days</span>
              </div>
              {nextMilestone && (
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--color-text-secondary)]">Next goal:</span>
                  <span className="text-sm font-semibold">{daysUntilNext} days to {nextMilestone}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Detailed variant
  return (
    <div className={`bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-2xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span className={`text-3xl ${isMilestone ? 'animate-bounce' : ''}`}>{emoji}</span>
          <span>Study Streak</span>
        </h3>
        {showShare && currentStreak >= 7 && (
          <ShareButton
            data={createStreakShareData(currentStreak)}
            variant="secondary"
            size="sm"
            showMenu={true}
          />
        )}
      </div>

      {/* Main Streak Display */}
      <div className="text-center mb-6">
        <p className={`text-6xl font-bold ${color} mb-2`}>{currentStreak}</p>
        <p className="text-xl text-[var(--color-text-secondary)]">
          {currentStreak === 1 ? 'day' : 'days'} in a row
        </p>
        {isMilestone && (
          <div className="mt-3 px-4 py-2 bg-yellow-500/20 rounded-lg inline-block">
            <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
              🎉 Milestone Reached!
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[var(--color-bg-secondary)] rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-blue-500">{longestStreak}</p>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Best Streak</p>
        </div>
        {nextMilestone && (
          <div className="bg-[var(--color-bg-secondary)] rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-purple-500">{nextMilestone}</p>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Next Goal</p>
          </div>
        )}
      </div>

      {/* Progress to next milestone */}
      {nextMilestone && (
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-[var(--color-text-secondary)]">
              {daysUntilNext} {daysUntilNext === 1 ? 'day' : 'days'} to {nextMilestone}-day streak
            </span>
            <span className="font-semibold text-[var(--color-text-primary)]">
              {Math.round((currentStreak / nextMilestone) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-gray-500/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
              style={{ width: `${(currentStreak / nextMilestone) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Motivational message */}
      <div className="mt-6 pt-6 border-t border-gray-500/20">
        <p className="text-sm text-center text-[var(--color-text-secondary)]">
          {currentStreak === 0 && "Start your streak today! 💪"}
          {currentStreak > 0 && currentStreak < 7 && "Keep it going! 🎯"}
          {currentStreak >= 7 && currentStreak < 30 && "Great consistency! 🌟"}
          {currentStreak >= 30 && currentStreak < 100 && "Amazing dedication! 🔥"}
          {currentStreak >= 100 && currentStreak < 365 && "Incredible commitment! 🏆"}
          {currentStreak >= 365 && "Legendary achievement! 👑"}
        </p>
      </div>

      {/* Don't break the streak warning */}
      {currentStreak >= 3 && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-center text-red-600 dark:text-red-400 font-medium">
            ⚠️ Don&apos;t break the streak! Study today to keep it going.
          </p>
        </div>
      )}
    </div>
  );
}

// Streak Calendar/Heatmap component
interface StreakCalendarProps {
  dates: string[]; // Array of ISO date strings when user studied
  className?: string;
}

export function StreakCalendar({ dates, className = '' }: StreakCalendarProps) {
  // Get last 7 weeks (49 days)
  const getDaysGrid = () => {
    const today = new Date();
    const days: { date: Date; studied: boolean }[] = [];

    for (let i = 48; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date,
        studied: dates.includes(dateStr),
      });
    }

    return days;
  };

  const days = getDaysGrid();
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className={`bg-[var(--color-bg-secondary)] rounded-lg p-4 ${className}`}>
      <h3 className="text-sm font-semibold mb-3">Study Activity</h3>

      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 text-xs text-[var(--color-text-tertiary)] mr-1">
          {weekDays.map(day => (
            <div key={day} className="h-3 flex items-center">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="flex gap-1">
          {Array.from({ length: 7 }).map((_, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const dayData = days[weekIndex * 7 + dayIndex];
                if (!dayData) return null;

                return (
                  <div
                    key={dayIndex}
                    className={`
                      w-3 h-3 rounded-sm transition-colors
                      ${dayData.studied
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-gray-500/20 hover:bg-gray-500/30'
                      }
                    `}
                    title={`${dayData.date.toLocaleDateString()} - ${dayData.studied ? 'Studied' : 'No study'}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 text-xs text-[var(--color-text-tertiary)]">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-gray-500/20 rounded-sm" />
          <div className="w-3 h-3 bg-green-500/30 rounded-sm" />
          <div className="w-3 h-3 bg-green-500/60 rounded-sm" />
          <div className="w-3 h-3 bg-green-500 rounded-sm" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
