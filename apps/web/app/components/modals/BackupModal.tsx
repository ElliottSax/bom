import React, { useEffect } from 'react';
import { DownloadIcon, UploadIcon } from '../Icons';

interface BackupModalProps {
  show: boolean;
  onClose: () => void;
  bookmarksCount: number;
  highlightsCount: number;
  notesCount: number;
  chaptersReadCount: number;
  onExport: () => void;
  onImport: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  show,
  onClose,
  bookmarksCount,
  highlightsCount,
  notesCount,
  chaptersReadCount,
  onExport,
  onImport,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (show) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="backup-title"
    >
      <div
        className="bg-[var(--color-bg-primary)] rounded-2xl w-full max-w-md shadow-2xl border border-[var(--color-border)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b border-[var(--color-border-light)]">
          <h3 id="backup-title" className="text-lg font-semibold">Backup & Restore</h3>
        </div>
        <div className="p-4 space-y-4">
          <div className="p-4 bg-[var(--color-bg-tertiary)] rounded-xl">
            <h4 className="font-medium mb-2">Your Data</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-[var(--color-text-secondary)]">
              <div>{bookmarksCount} bookmarks</div>
              <div>{highlightsCount} highlights</div>
              <div>{notesCount} notes</div>
              <div>{chaptersReadCount} chapters</div>
            </div>
          </div>
          <button
            onClick={() => {
              onExport();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 p-4 bg-[var(--color-accent)] text-white rounded-xl font-medium"
          >
            <DownloadIcon /> Export Backup
          </button>
          <button
            onClick={onImport}
            className="w-full flex items-center justify-center gap-2 p-4 bg-[var(--color-bg-tertiary)] rounded-xl font-medium"
          >
            <UploadIcon /> Import Backup
          </button>
        </div>
      </div>
    </div>
  );
};
