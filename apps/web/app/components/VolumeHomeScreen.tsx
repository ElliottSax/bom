import React from 'react';
import { motion } from 'motion/react';
import { type Volume } from '../lib/types';
import { FireIcon } from './Icons';
import { fadeInUp, staggerChildren, hoverLift, tapPress, transitionFast } from '../lib/motion';

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
    <motion.div
      className="h-full flex flex-col items-center justify-center p-8"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-xl text-center">
        <motion.div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          style={{ backgroundColor: currentVolume.color }}
          whileHover={{ scale: 1.04, transition: transitionFast }}
        >
          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h12a2 2 0 012 2v14l-8-4-8 4V6a2 2 0 012-2z" />
          </svg>
        </motion.div>

        <h2 className="book-title mb-2">{currentVolume.name}</h2>
        <p className="font-medium mb-3" style={{ color: currentVolume.color }}>
          {currentVolume.description}
        </p>
        <div
          className="w-10 h-0.5 rounded-full mx-auto mb-4"
          style={{ backgroundColor: 'var(--color-gold)' }}
        />
        <p className="text-[var(--color-text-tertiary)] text-sm mb-6">Community of Christ</p>

        <motion.div
          className="flex justify-center gap-6 mb-6"
          variants={staggerChildren}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="text-center" variants={fadeInUp}>
            <p className="text-2xl font-bold" style={{ color: currentVolume.color }}>
              {completionPercentage}%
            </p>
            <p className="text-xs text-[var(--color-text-tertiary)]">Complete</p>
          </motion.div>

          <motion.div className="text-center" variants={fadeInUp}>
            <p className="text-2xl font-bold text-[var(--color-text-secondary)]">{booksCount}</p>
            <p className="text-xs text-[var(--color-text-tertiary)]">
              {volumeId === 'dc' ? 'Sections' : 'Books'}
            </p>
          </motion.div>

          {currentStreak > 0 && (
            <motion.div className="text-center" variants={fadeInUp}>
              <p
                className="text-2xl font-bold flex items-center justify-center gap-1"
                style={{ color: 'var(--color-gold)' }}
              >
                <FireIcon /> {currentStreak}
              </p>
              <p className="text-xs text-[var(--color-text-tertiary)]">Streak</p>
            </motion.div>
          )}
        </motion.div>

        <div className="flex gap-3 justify-center">
          <motion.button
            onClick={onSearchClick}
            className="px-6 py-3 text-white font-semibold rounded-xl hover:opacity-90 transition shadow-lg"
            style={{ backgroundColor: currentVolume.color }}
            whileHover={hoverLift}
            whileTap={tapPress}
          >
            Search {currentVolume.shortName}
          </motion.button>

          {!hasStudyPlan && (
            <motion.button
              onClick={onStudyPlanClick}
              className="px-6 py-3 bg-[var(--color-bg-tertiary)] font-semibold rounded-xl hover:bg-[var(--color-border)] transition"
              whileHover={hoverLift}
              whileTap={tapPress}
            >
              Start a Plan
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Memoize to prevent unnecessary re-renders
export const VolumeHomeScreen = React.memo(VolumeHomeScreenComponent);
