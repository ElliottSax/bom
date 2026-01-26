import React from 'react';
import { VOLUMES, type Volume } from '../../lib/scriptures';
import { VolumeId } from '../../lib/scriptures';

interface VolumeTabsProps {
  volumeId: VolumeId;
  onVolumeChange: (volumeId: VolumeId) => void;
}

export const VolumeTabs: React.FC<VolumeTabsProps> = ({ volumeId, onVolumeChange }) => {
  return (
    <div className="no-print border-b border-[var(--color-border-light)] bg-[var(--color-bg-secondary)]">
      <div className="flex overflow-x-auto">
        {VOLUMES.map((vol: Volume) => (
          <button
            key={vol.id}
            onClick={() => onVolumeChange(vol.id)}
            className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              volumeId === vol.id
                ? 'border-current'
                : 'border-transparent text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
            }`}
            style={{ color: volumeId === vol.id ? vol.color : undefined }}
          >
            {vol.shortName}
          </button>
        ))}
      </div>
    </div>
  );
};
