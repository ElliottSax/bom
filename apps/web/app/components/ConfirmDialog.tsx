import React, { useEffect } from 'react';

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

  if (!show) return null;

  const variantColors = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-blue-600 hover:bg-blue-700',
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
    >
      <div
        className="bg-[var(--color-bg-primary)] rounded-2xl w-full max-w-md shadow-2xl border border-[var(--color-border)]"
        onClick={e => e.stopPropagation()}
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
          <button
            onClick={onCancel}
            className="px-4 py-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white font-medium rounded-lg transition-colors ${variantColors[variant]}`}
            autoFocus
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
