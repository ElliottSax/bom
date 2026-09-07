import React from 'react';
import { motion } from 'motion/react';
import { VOLUMES, type Volume } from '../../lib/scriptures';
import { VolumeId } from '../../lib/scriptures';
import { transitionFast, tapPress } from '../../lib/motion';

interface VolumeTabsProps {
  volumeId: VolumeId;
  onVolumeChange: (volumeId: VolumeId) => void;
}

export const VolumeTabs: React.FC<VolumeTabsProps> = ({ volumeId, onVolumeChange }) => {
  return (
    <div className="no-print border-b border-[var(--color-border-light)] bg-[var(--color-bg-secondary)]">
      <div className="flex overflow-x-auto">
        {VOLUMES.map((vol: Volume) => {
          const isActive = volumeId === vol.id;
          return (
            <motion.button
              key={vol.id}
              onClick={() => onVolumeChange(vol.id)}
              whileTap={tapPress}
              className={`relative flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? ''
                  : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
              }`}
              style={{ color: isActive ? vol.color : undefined }}
            >
              {vol.shortName}
              {isActive && (
                <motion.span
                  layoutId="volume-tab-indicator"
                  className="absolute left-0 right-0 -bottom-px h-0.5 rounded-full"
                  style={{ backgroundColor: vol.color }}
                  transition={transitionFast}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
