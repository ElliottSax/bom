'use client';

import { useState } from 'react';
import { AchievementBadge } from '../AchievementBadge';
import { ShareButton } from '../ShareButton';
import type { Achievement, AchievementUserData } from '../../lib/achievements';

interface AchievementsModalProps {
  show: boolean;
  onClose: () => void;
  unlockedAchievements: (Achievement & { unlockedAt: string })[];
  lockedAchievements: Achievement[];
  totalPoints: number;
  completionPercentage: number;
  userData: AchievementUserData;
}

export function AchievementsModal({
  show,
  onClose,
  unlockedAchievements,
  lockedAchievements,
  totalPoints,
  completionPercentage,
  userData,
}: AchievementsModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'reading' | 'streak' | 'study' | 'course' | 'milestone'>('all');
  const [showLocked, setShowLocked] = useState(true);

  if (!show) return null;

  const categories = [
    { id: 'all' as const, name: 'All', icon: '🏆' },
    { id: 'reading' as const, name: 'Reading', icon: '📖' },
    { id: 'streak' as const, name: 'Streaks', icon: '🔥' },
    { id: 'study' as const, name: 'Study', icon: '✍️' },
    { id: 'course' as const, name: 'Courses', icon: '🎓' },
    { id: 'milestone' as const, name: 'Milestones', icon: '⭐' },
  ];

  const filteredUnlocked = selectedCategory === 'all'
    ? unlockedAchievements
    : unlockedAchievements.filter(a => a.category === selectedCategory);

  const filteredLocked = selectedCategory === 'all'
    ? lockedAchievements
    : lockedAchievements.filter(a => a.category === selectedCategory);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-bg-primary)] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
          <div>
            <h2 className="text-2xl font-bold">Achievements</h2>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              {unlockedAchievements.length} of {unlockedAchievements.length + lockedAchievements.length} unlocked
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--color-bg-secondary)] rounded-lg transition"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-[var(--color-bg-secondary)]">
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-500">{unlockedAchievements.length}</p>
            <p className="text-xs text-[var(--color-text-tertiary)]">Unlocked</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-500">{totalPoints}</p>
            <p className="text-xs text-[var(--color-text-tertiary)]">Points</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-500">{completionPercentage}%</p>
            <p className="text-xs text-[var(--color-text-tertiary)]">Complete</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-500">
              {unlockedAchievements.filter(a => a.rarity === 'legendary').length}
            </p>
            <p className="text-xs text-[var(--color-text-tertiary)]">Legendary</p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 p-4 overflow-x-auto border-b border-[var(--color-border)]">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap flex items-center gap-2 transition
                ${selectedCategory === cat.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)]'
                }
              `}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Toggle Locked */}
        <div className="px-6 py-3 flex items-center justify-between border-b border-[var(--color-border)]">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showLocked}
              onChange={(e) => setShowLocked(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">Show locked achievements</span>
          </label>
        </div>

        {/* Achievement Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Unlocked Achievements */}
          {filteredUnlocked.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>✅</span>
                <span>Unlocked ({filteredUnlocked.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredUnlocked.map(achievement => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    unlocked={true}
                    unlockedAt={achievement.unlockedAt}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Locked Achievements */}
          {showLocked && filteredLocked.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>🔒</span>
                <span>Locked ({filteredLocked.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredLocked.map(achievement => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    unlocked={false}
                    userData={userData}
                    showProgress={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredUnlocked.length === 0 && filteredLocked.length === 0 && (
            <div className="text-center py-12">
              <p className="text-4xl mb-4">🎯</p>
              <p className="text-[var(--color-text-secondary)]">
                No achievements in this category yet
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex justify-between items-center">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Keep studying to unlock more achievements!
          </p>
          {unlockedAchievements.length > 0 && (
            <ShareButton
              data={{
                title: 'My Scripture Study Achievements',
                text: `I've unlocked ${unlockedAchievements.length} achievements and earned ${totalPoints} points on Book of Mormon Study Tools! 🏆\n\nStart your scripture study journey:`,
                url: 'https://bom.study',
              }}
              variant="primary"
              size="sm"
              showMenu={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}
