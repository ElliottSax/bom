import React from 'react';
import { type Volume } from '../lib/types';
import { FireIcon } from './Icons';

interface VolumeHomeScreenProps {
  currentVolume: Volume;
  volumeId: string;
  completionPercentage: number;
  booksCount: number;
  currentStreak: number;
  onSearchClick: () => void;
  onStudyPlanClick: () => void;
  hasStudyPlan: boolean;
}

const VolumeHomeScreenComponent: React.FC<VolumeHomeScreenProps> = ({
  currentVolume,
  volumeId,
  completionPercentage,
  booksCount,
  currentStreak,
  onSearchClick,
  onStudyPlanClick,
  hasStudyPlan,
}) => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <div className="max-w-xl text-center">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          style={{ backgroundColor: currentVolume.color }}
        >
          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h12a2 2 0 012 2v14l-8-4-8 4V6a2 2 0 012-2z" />
          </svg>
        </div>

        <h2 className="book-title mb-2">{currentVolume.name}</h2>
        <p className="font-medium mb-1" style={{ color: currentVolume.color }}>
          {currentVolume.description}
        </p>
        <p className="text-[var(--color-text-tertiary)] text-sm mb-6">Community of Christ</p>

        <div className="flex justify-center gap-6 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: currentVolume.color }}>
              {completionPercentage}%
            </p>
            <p className="text-xs text-[var(--color-text-tertiary)]">Complete</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-[var(--color-text-secondary)]">{booksCount}</p>
            <p className="text-xs text-[var(--color-text-tertiary)]">
              {volumeId === 'dc' ? 'Sections' : 'Books'}
            </p>
          </div>

          {currentStreak > 0 && (
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500 flex items-center justify-center gap-1">
                <FireIcon /> {currentStreak}
              </p>
              <p className="text-xs text-[var(--color-text-tertiary)]">Streak</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={onSearchClick}
            className="px-6 py-3 text-white font-semibold rounded-xl hover:opacity-90 transition shadow-lg"
            style={{ backgroundColor: currentVolume.color }}
          >
            Search {currentVolume.shortName}
          </button>

          {!hasStudyPlan && (
            <button
              onClick={onStudyPlanClick}
              className="px-6 py-3 bg-[var(--color-bg-tertiary)] font-semibold rounded-xl hover:bg-[var(--color-border)] transition"
            >
              Start a Plan
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export const VolumeHomeScreen = React.memo(VolumeHomeScreenComponent);
