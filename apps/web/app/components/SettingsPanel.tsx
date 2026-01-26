import React from 'react';
import { CloseIcon } from './Icons';
import { useSettings } from '../../contexts/SettingsContext';

interface SettingsPanelProps {
  showSettings: boolean;
  setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  showSettings,
  setShowSettings,
}) => {
  const { fontSize, setFontSize, lineHeight, setLineHeight, fontFamily, setFontFamily, showVerseNumbers, setShowVerseNumbers } = useSettings();
  if (!showSettings) return null;

  return (
    <div className="fixed right-4 top-16 z-50 bg-[var(--color-bg-primary)] rounded-xl shadow-xl border border-[var(--color-border)] p-4 w-72 slide-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Settings</h3>
        <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-[var(--color-bg-tertiary)] rounded">
          <CloseIcon />
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-[var(--color-text-secondary)] block mb-2">Font Size: {fontSize}px</label>
          <input type="range" min="14" max="24" value={fontSize} onChange={e => setFontSize(parseInt(e.target.value))} className="w-full accent-[var(--color-accent)]" />
        </div>
        <div>
          <label className="text-sm text-[var(--color-text-secondary)] block mb-2">Line Height: {lineHeight.toFixed(1)}</label>
          <input type="range" min="1.4" max="2.2" step="0.1" value={lineHeight} onChange={e => setLineHeight(parseFloat(e.target.value))} className="w-full accent-[var(--color-accent)]" />
        </div>
        <div>
          <label className="text-sm text-[var(--color-text-secondary)] block mb-2">Font Style</label>
          <div className="flex gap-2">
            <button
              onClick={() => setFontFamily('serif')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm ${fontFamily === 'serif' ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-bg-tertiary)]'}`}
              style={{ fontFamily: 'Georgia' }}
            >
              Serif
            </button>
            <button
              onClick={() => setFontFamily('sans')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm ${fontFamily === 'sans' ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-bg-tertiary)]'}`}
            >
              Sans
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--color-text-secondary)]">Verse Numbers</span>
          <button
            onClick={() => setShowVerseNumbers(!showVerseNumbers)}
            className={`w-10 h-6 rounded-full ${showVerseNumbers ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white shadow mx-1 transition-transform ${showVerseNumbers ? 'translate-x-4' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
