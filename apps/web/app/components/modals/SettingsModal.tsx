import React, { useEffect } from 'react';
import { CloseIcon } from '../Icons';
import { FontFamily } from '../../lib/types';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface SettingsModalProps {
  show: boolean;
  onClose: () => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  lineHeight: number;
  setLineHeight: (height: number) => void;
  fontFamily: FontFamily;
  setFontFamily: (family: FontFamily) => void;
  showVerseNumbers: boolean;
  setShowVerseNumbers: (show: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  show,
  onClose,
  fontSize,
  setFontSize,
  lineHeight,
  setLineHeight,
  fontFamily,
  setFontFamily,
  showVerseNumbers,
  setShowVerseNumbers,
}) => {
  const focusTrapRef = useFocusTrap(show);

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
      ref={focusTrapRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      className="fixed right-4 top-16 z-50 bg-[var(--color-bg-primary)] rounded-xl shadow-xl border border-[var(--color-border)] p-4 w-72 slide-in"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 id="settings-title" className="font-semibold">Settings</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-[var(--color-bg-tertiary)] rounded"
          aria-label="Close settings"
        >
          <CloseIcon />
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-[var(--color-text-secondary)] block mb-2">
            Font Size: {fontSize}px
          </label>
          <input
            type="range"
            min="14"
            max="24"
            value={fontSize}
            onChange={e => setFontSize(parseInt(e.target.value))}
            className="w-full accent-[var(--color-accent)]"
          />
        </div>
        <div>
          <label className="text-sm text-[var(--color-text-secondary)] block mb-2">
            Line Height: {lineHeight.toFixed(1)}
          </label>
          <input
            type="range"
            min="1.4"
            max="2.2"
            step="0.1"
            value={lineHeight}
            onChange={e => setLineHeight(parseFloat(e.target.value))}
            className="w-full accent-[var(--color-accent)]"
          />
        </div>
        <div>
          <label className="text-sm text-[var(--color-text-secondary)] block mb-2">
            Font Style
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setFontFamily('serif')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm ${
                fontFamily === 'serif'
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-[var(--color-bg-tertiary)]'
              }`}
              style={{ fontFamily: 'Georgia' }}
            >
              Serif
            </button>
            <button
              onClick={() => setFontFamily('sans')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm ${
                fontFamily === 'sans'
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-[var(--color-bg-tertiary)]'
              }`}
            >
              Sans
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--color-text-secondary)]">Verse Numbers</span>
          <button
            onClick={() => setShowVerseNumbers(!showVerseNumbers)}
            className={`w-10 h-6 rounded-full ${
              showVerseNumbers ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow mx-1 transition-transform ${
                showVerseNumbers ? 'translate-x-4' : ''
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
