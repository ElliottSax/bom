import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { modalOverlay, modalContent, tapPress } from '../lib/motion';

interface ConfirmDialogProps {
  show: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  show,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.key === 'Enter') {
        onConfirm();
      }
    };

    if (show) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [show, onConfirm, onCancel]);

  const variantColors = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-amber-600 hover:bg-amber-700',
    info: 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-light)]',
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onCancel}
          variants={modalOverlay}
          initial="hidden"
          animate="visible"
          exit="hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          aria-describedby="confirm-message"
        >
          <motion.div
            variants={modalContent}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-[var(--color-bg-primary)] rounded-2xl w-full max-w-md shadow-2xl border border-[var(--color-border)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              <h3 id="confirm-title" className="text-lg font-semibold mb-2">
                {title}
              </h3>
              <p id="confirm-message" className="text-[var(--color-text-secondary)] text-sm">
                {message}
              </p>
            </div>
            <div className="p-4 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border-light)] flex justify-end gap-2 rounded-b-2xl">
              <motion.button
                onClick={onCancel}
                whileTap={tapPress}
                className="px-4 py-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] rounded-lg transition-colors"
              >
                {cancelText}
              </motion.button>
              <motion.button
                onClick={onConfirm}
                whileTap={tapPress}
                className={`px-4 py-2 text-white font-medium rounded-lg transition-colors ${variantColors[variant]}`}
                autoFocus
              >
                {confirmText}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
