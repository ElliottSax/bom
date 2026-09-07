'use client';

import React from 'react';
import {
  type Achievement,
  getRarityColor,
  getRarityBgColor,
  getAchievementProgress,
} from '../lib/achievements';
import type { AchievementUserData } from '../lib/achievements';

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked: boolean;
  unlockedAt?: string;
  onClick?: () => void;
  userData?: AchievementUserData;
  showProgress?: boolean;
}

export function AchievementBadge({
  achievement,
  unlocked,
  unlockedAt,
  onClick,
  userData,
  showProgress = false,
}: AchievementBadgeProps) {
  const rarityColor = getRarityColor(achievement.rarity);
  const rarityBgColor = getRarityBgColor(achievement.rarity);

  const progress =
    userData && !unlocked ? getAchievementProgress(achievement, userData) : unlocked ? 1 : 0;

  const progressPercentage = Math.round(progress * 100);

  return (
    <div
      onClick={onClick}
      className={`
        relative p-4 rounded-xl border-2 transition-all duration-200
        ${
          unlocked
            ? `${rarityBgColor} border-${achievement.rarity === 'legendary' ? 'yellow' : achievement.rarity === 'epic' ? 'purple' : achievement.rarity === 'rare' ? 'blue' : 'gray'}-500/30 hover:scale-105 cursor-pointer`
            : 'bg-gray-500/5 border-gray-500/20 opacity-60'
        }
      `}
    >
      {/* Badge Icon */}
      <div className="text-center mb-2">
        <div
          className={`
            text-5xl mb-2
            ${!unlocked && 'grayscale opacity-50'}
          `}
        >
          {achievement.icon}
        </div>
        <h3 className={`font-bold text-sm ${unlocked ? rarityColor : 'text-gray-500'}`}>
          {achievement.name}
        </h3>
      </div>

      {/* Description */}
      <p className="text-xs text-[var(--color-text-tertiary)] text-center mb-2">
        {achievement.description}
      </p>

      {/* Points & Rarity */}
      <div className="flex items-center justify-between text-xs">
        <span className={`font-semibold ${unlocked ? rarityColor : 'text-gray-500'}`}>
          {achievement.points} pts
        </span>
        <span className={`capitalize ${unlocked ? rarityColor : 'text-gray-500'}`}>
          {achievement.rarity}
        </span>
      </div>

      {/* Progress bar (for locked achievements) */}
      {!unlocked && showProgress && progressPercentage > 0 && (
        <div className="mt-2">
          <div className="h-1.5 bg-gray-500/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-xs text-[var(--color-text-tertiary)] text-center mt-1">
            {progressPercentage}%
          </p>
        </div>
      )}

      {/* Unlocked date */}
      {unlocked && unlockedAt && (
        <div className="mt-2 pt-2 border-t border-gray-500/20">
          <p className="text-xs text-[var(--color-text-tertiary)] text-center">
            Unlocked {new Date(unlockedAt).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Sparkle effect for newly unlocked */}
      {unlocked && (
        <div className="absolute -top-1 -right-1 animate-pulse">
          <span className="text-2xl">✨</span>
        </div>
      )}
    </div>
  );
}

// Achievement notification toast component
interface AchievementToastProps {
  achievement: Achievement;
  onClose: () => void;
  onShare?: () => void;
}

export function AchievementToast({ achievement, onClose, onShare }: AchievementToastProps) {
  const rarityColor = getRarityColor(achievement.rarity);
  const rarityBgColor = getRarityBgColor(achievement.rarity);

  return (
    <div
      className={`
        ${rarityBgColor}
        border-2 border-${achievement.rarity === 'legendary' ? 'yellow' : achievement.rarity === 'epic' ? 'purple' : achievement.rarity === 'rare' ? 'blue' : 'gray'}-500/30
        rounded-xl p-4 shadow-2xl
        animate-slide-in-right
        max-w-sm
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="text-4xl flex-shrink-0 animate-bounce">{achievement.icon}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-yellow-500">🎉 ACHIEVEMENT UNLOCKED!</span>
          </div>
          <h3 className={`font-bold text-sm ${rarityColor}`}>{achievement.name}</h3>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            {achievement.description}
          </p>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
            +{achievement.points} points • {achievement.rarity}
          </p>

          {/* Actions */}
          <div className="flex gap-2 mt-2">
            {onShare && (
              <button
                onClick={onShare}
                className="text-xs px-2 py-1 bg-[var(--color-bg-tertiary)] rounded hover:bg-[var(--color-bg-secondary)] transition"
              >
                Share
              </button>
            )}
            <button
              onClick={onClose}
              className="text-xs px-2 py-1 bg-[var(--color-bg-tertiary)] rounded hover:bg-[var(--color-bg-secondary)] transition"
            >
              Dismiss
            </button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition flex-shrink-0"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
