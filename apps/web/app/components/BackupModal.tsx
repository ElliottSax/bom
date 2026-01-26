import React from 'react';
import { DownloadIcon, UploadIcon } from './Icons';
import { useUserData } from '../contexts/UserDataContext';
import { useSettings } from '../contexts/SettingsContext';
import { type VolumeId } from '../lib/types';

interface BackupModalProps {
  showBackupModal: boolean;
  setShowBackupModal: React.Dispatch<React.SetStateAction<boolean>>;
  currentVolumeId: VolumeId;
}

const BackupModal: React.FC<BackupModalProps> = ({
  showBackupModal,
  setShowBackupModal,
  currentVolumeId,
}) => {
  const { bookmarks, highlights, notes, readingProgress, exportData, importData, fileInputRef } = useUserData();
  const { fontSize, lineHeight, fontFamily, theme, showVerseNumbers } = useSettings();
  if (!showBackupModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setShowBackupModal(false)}>
      <div className="bg-[var(--color-bg-primary)] rounded-2xl w-full max-w-md shadow-2xl border border-[var(--color-border)]" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-[var(--color-border-light)]">
          <h3 className="text-lg font-semibold">Backup & Restore</h3>
        </div>
        <div className="p-4 space-y-4">
          <div className="p-4 bg-[var(--color-bg-tertiary)] rounded-xl">
            <h4 className="font-medium mb-2">Your Data</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-[var(--color-text-secondary)]">
              <div>{bookmarks.length} bookmarks</div>
              <div>{highlights.length} highlights</div>
              <div>{notes.length} notes</div>
              <div>{Object.keys(readingProgress.chaptersRead).length} chapters</div>
            </div>
          </div>
          <button onClick={() => { exportData({ volumeId: currentVolumeId, fontSize, lineHeight, fontFamily, theme, showVerseNumbers }); setShowBackupModal(false); }} className="w-full flex items-center justify-center gap-2 p-4 bg-[var(--color-accent)] text-white rounded-xl font-medium">
            <DownloadIcon /> Export Backup
          </button>
          <input type="file" ref={fileInputRef} onChange={importData} accept=".json" className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 p-4 bg-[var(--color-bg-tertiary)] rounded-xl font-medium">
            <UploadIcon /> Import Backup
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackupModal;