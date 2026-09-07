'use client';

import {
  getDifficultyColor,
  getDifficultyBgColor,
  type Challenge,
  type UserChallenge,
} from '../lib/challenges';
import { ShareButton } from './ShareButton';

interface ChallengeCardProps {
  challenge: Challenge | UserChallenge;
  onJoin?: () => void;
  onView?: () => void;
  variant?: 'available' | 'active' | 'completed';
}

export function ChallengeCard({
  challenge,
  onJoin,
  onView,
  variant = 'available',
}: ChallengeCardProps) {
  const isUserChallenge = 'progress' in challenge;
  const userChallenge = isUserChallenge ? (challenge as UserChallenge) : null;

  const difficultyColor = getDifficultyColor(challenge.difficulty);
  const difficultyBgColor = getDifficultyBgColor(challenge.difficulty);

  return (
    <div
      className={`
        relative p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg
        ${
          variant === 'completed'
            ? 'bg-green-500/5 border-green-500/30'
            : variant === 'active'
              ? 'bg-blue-500/5 border-blue-500/30'
              : 'bg-[var(--color-bg-secondary)] border-[var(--color-border)]'
        }
      `}
    >
      {/* Challenge Icon & Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{challenge.icon}</div>
          <div>
            <h3 className="font-bold text-lg">{challenge.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${difficultyBgColor} ${difficultyColor} font-medium capitalize`}
              >
                {challenge.difficulty}
              </span>
              {variant === 'completed' && challenge.badge && (
                <span className="text-lg">{challenge.badge}</span>
              )}
            </div>
          </div>
        </div>

        {variant === 'completed' && (
          <div className="flex items-center gap-2">
            <span className="text-2xl">✅</span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-[var(--color-text-secondary)] mb-4">{challenge.description}</p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-3 text-center">
          <p className="text-xs text-[var(--color-text-tertiary)]">Duration</p>
          <p className="text-lg font-bold">{challenge.durationDays} days</p>
        </div>
        <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-3 text-center">
          <p className="text-xs text-[var(--color-text-tertiary)]">Goal</p>
          <p className="text-lg font-bold">{challenge.targetChapters} chapters</p>
        </div>
      </div>

      {/* Progress (for active challenges) */}
      {variant === 'active' && userChallenge && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-[var(--color-text-secondary)]">Progress</span>
            <span className="font-semibold">{userChallenge.percentComplete}%</span>
          </div>
          <div className="h-2 bg-gray-500/20 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                userChallenge.onPace ? 'bg-green-500' : 'bg-orange-500'
              }`}
              style={{ width: `${userChallenge.percentComplete}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
            <div>
              <p className="text-[var(--color-text-tertiary)]">Read</p>
              <p className="font-semibold">
                {userChallenge.progress.chaptersRead}/{challenge.targetChapters}
              </p>
            </div>
            <div>
              <p className="text-[var(--color-text-tertiary)]">Days Left</p>
              <p className="font-semibold">{userChallenge.daysRemaining}</p>
            </div>
            <div>
              <p className="text-[var(--color-text-tertiary)]">Daily Pace</p>
              <p className="font-semibold">{userChallenge.requiredPace}/day</p>
            </div>
          </div>

          {!userChallenge.onPace && (
            <div className="mt-3 p-2 bg-orange-500/10 border border-orange-500/30 rounded text-xs text-orange-600 dark:text-orange-400">
              ⚠️ Behind pace! Read {userChallenge.requiredPace} chapters/day to complete on time.
            </div>
          )}
        </div>
      )}

      {/* Reward */}
      <div className="flex items-center justify-between py-3 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <span className="text-yellow-500">🏆</span>
          <span className="text-sm font-semibold">{challenge.rewardPoints} points</span>
        </div>

        {/* Action button */}
        {variant === 'available' && onJoin && (
          <button
            onClick={onJoin}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition"
          >
            Join Challenge
          </button>
        )}

        {variant === 'active' && onView && (
          <button
            onClick={onView}
            className="px-4 py-2 bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-secondary)] rounded-lg text-sm font-medium transition"
          >
            View Details
          </button>
        )}

        {variant === 'completed' && (
          <ShareButton
            data={{
              title: `Challenge Completed: ${challenge.name}`,
              text: `🏆 I just completed the "${challenge.name}" challenge on Book of Mormon Study Tools!\n\nEarned ${challenge.rewardPoints} points! ${challenge.badge}\n\nStart your scripture study journey:`,
              url: 'https://bom.study',
            }}
            variant="primary"
            size="sm"
            showMenu={true}
          />
        )}
      </div>
    </div>
  );
}

// Compact challenge widget for sidebar
export function ChallengeWidget({ challenge }: { challenge: UserChallenge }) {
  return (
    <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{challenge.icon}</span>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm truncate">{challenge.name}</h4>
          <p className="text-xs text-[var(--color-text-tertiary)]">
            {challenge.daysRemaining} days left
          </p>
        </div>
      </div>

      <div className="h-1.5 bg-gray-500/20 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full transition-all duration-500 ${
            challenge.onPace ? 'bg-green-500' : 'bg-orange-500'
          }`}
          style={{ width: `${challenge.percentComplete}%` }}
        />
      </div>

      <div className="flex justify-between text-xs">
        <span className="text-[var(--color-text-tertiary)]">
          {challenge.percentComplete}% complete
        </span>
        <span className="font-semibold">
          {challenge.progress.chaptersRead}/{challenge.targetChapters}
        </span>
      </div>
    </div>
  );
}
