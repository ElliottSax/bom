import React, { useEffect, useState, useCallback } from 'react';
import { CloseIcon } from '../Icons';
import { useAutoSave } from '../../hooks/useAutoSave';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface NoteEditorModalProps {
  show: boolean;
  onClose: () => void;
  bookName: string;
  chapter: number;
  verse: number;
  content: string;
  setContent: (content: string) => void;
  onSave: () => void;
}

const MAX_NOTE_LENGTH = 5000;

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  show,
  onClose,
  bookName,
  chapter,
  verse,
  content,
  setContent,
  onSave,
}) => {
  const focusTrapRef = useFocusTrap(show);
  const [validationError, setValidationError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Auto-save after 2 seconds of inactivity
  const handleAutoSave = useCallback(() => {
    if (content.trim() && !validationError) {
      setIsSaving(true);
      onSave();
      setTimeout(() => setIsSaving(false), 500);
    }
  }, [content, validationError, onSave]);

  useAutoSave(content, handleAutoSave, 2000);

  const handleContentChange = (newContent: string) => {
    if (newContent.length > MAX_NOTE_LENGTH) {
      setValidationError(`Note is too long (${newContent.length}/${MAX_NOTE_LENGTH} characters)`);
    } else {
      setValidationError('');
    }
    setContent(newContent);
  };

  const handleSave = useCallback(() => {
    if (validationError) return;
    if (content.trim().length === 0) {
      setValidationError('Note cannot be empty');
      return;
    }
    onSave();
    onClose();
  }, [validationError, content, onSave, onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        handleSave();
      }
    };

    if (show) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [show, onClose, handleSave]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="note-title"
    >
      <div
        ref={focusTrapRef}
        className="bg-[var(--color-bg-primary)] rounded-2xl w-full max-w-lg shadow-2xl border border-[var(--color-border)]"
      >
        <div className="p-4 border-b border-[var(--color-border-light)] flex justify-between items-center">
          <div>
            <h3 id="note-title" className="font-semibold flex items-center gap-2">
              Note
              {isSaving && (
                <span className="text-xs text-[var(--color-text-tertiary)] flex items-center gap-1">
                  <svg className="animate-spin w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth="3" stroke="currentColor" strokeOpacity="0.25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" opacity="0.75" />
                  </svg>
                  Saving...
                </span>
              )}
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {bookName} {chapter}:{verse}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-lg"
            aria-label="Close note editor"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="p-4">
          <textarea
            value={content}
            onChange={e => handleContentChange(e.target.value)}
            placeholder="Write your thoughts... (Auto-saves after 2 seconds)"
            aria-label="Note content"
            aria-invalid={!!validationError}
            aria-describedby={validationError ? 'note-error' : undefined}
            className={`w-full h-40 bg-[var(--color-bg-tertiary)] border rounded-xl p-4 focus:outline-none resize-none ${
              validationError
                ? 'border-red-500 focus:border-red-500'
                : 'border-[var(--color-border)] focus:border-[var(--color-accent)]'
            }`}
            autoFocus
          />
          {validationError && (
            <p id="note-error" className="text-sm text-red-500 mt-2">
              {validationError}
            </p>
          )}
          <p className="text-xs text-[var(--color-text-tertiary)] mt-2">
            {content.length}/{MAX_NOTE_LENGTH} characters • Ctrl+Enter to save
          </p>
        </div>
        <div className="p-4 border-t border-[var(--color-border-light)] flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!!validationError || content.trim().length === 0}
            className="px-5 py-2 bg-[var(--color-accent)] text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
