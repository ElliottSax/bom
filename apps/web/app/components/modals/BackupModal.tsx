import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CloseIcon, DownloadIcon, UploadIcon } from '../Icons';
import { modalOverlay, modalContent, tapPress } from '../../lib/motion';

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

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
          variants={modalOverlay}
          initial="hidden"
          animate="visible"
          exit="hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="backup-title"
        >
          <motion.div
            variants={modalContent}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-[var(--color-bg-primary)] rounded-2xl w-full max-w-md shadow-2xl border border-[var(--color-border)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-[var(--color-border-light)] flex items-center justify-between">
              <h3 id="backup-title" className="text-lg font-semibold">
                Backup & Restore
              </h3>
              <motion.button
                onClick={onClose}
                whileTap={tapPress}
                className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-lg transition-colors"
                aria-label="Close backup and restore"
              >
                <CloseIcon />
              </motion.button>
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
              <motion.button
                onClick={() => {
                  onExport();
                  onClose();
                }}
                whileTap={tapPress}
                className="w-full flex items-center justify-center gap-2 p-4 bg-[var(--color-accent)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                <DownloadIcon /> Export Backup
              </motion.button>
              <motion.button
                onClick={onImport}
                whileTap={tapPress}
                className="w-full flex items-center justify-center gap-2 p-4 bg-[var(--color-bg-tertiary)] rounded-xl font-medium hover:bg-[var(--color-border)] transition-colors"
              >
                <UploadIcon /> Import Backup
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
