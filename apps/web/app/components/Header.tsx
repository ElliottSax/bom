import React from 'react';
import {
  MenuIcon,
  SearchIcon,
  SettingsIcon,
  SunIcon,
  MoonIcon,
  DownloadIcon,
  CalendarIcon,
  BookOpenIcon,
  FireIcon,
} from './Icons';
import { type Volume } from '../lib/types';
import { useSettings } from '../contexts/SettingsContext';
import { useUserData } from '../contexts/UserDataContext';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  currentVolume: Volume;
  setShowStudyPlanModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowResourcesModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowBackupModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSearch: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header: React.FC<HeaderProps> = ({
  sidebarOpen,
  setSidebarOpen,
  currentVolume,
  setShowStudyPlanModal,
  setShowResourcesModal,
  setShowBackupModal,
  setShowSettings,
  setShowSearch,
}) => {
  const { theme, cycleTheme } = useSettings();
  const { readingProgress } = useUserData();
  return (
    <header className="app-header no-print sticky top-0 z-40 bg-[var(--color-bg-primary)] border-b border-[var(--color-border-light)]">
      <div className="w-full flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors"><MenuIcon /></button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: currentVolume.color }}>
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h12a2 2 0 012 2v14l-8-4-8 4V6a2 2 0 012-2z" /></svg>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold">Scripture Study</h1>
              <p className="text-xs text-[var(--color-text-tertiary)]">Community of Christ</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {readingProgress.currentStreak > 0 && <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-orange-500/10 rounded-lg text-orange-500 mr-2"><FireIcon /><span className="text-sm font-medium">{readingProgress.currentStreak}</span></div>}
          <button onClick={() => setShowStudyPlanModal(true)} className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)]" title="Study Plans"><CalendarIcon /></button>
          <button onClick={() => setShowResourcesModal(true)} className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)]" title="Resources"><BookOpenIcon /></button>
          <button onClick={() => setShowBackupModal(true)} className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)]" title="Backup"><DownloadIcon /></button>
          <button onClick={cycleTheme} className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)]" title={`Theme: ${theme}`}>{theme === 'dark' ? <MoonIcon /> : <SunIcon />}</button>
          <button onClick={() => setShowSettings(prev => !prev)} className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)]"><SettingsIcon /></button>
          <button onClick={() => setShowSearch(true)} className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)]"><SearchIcon /></button>
        </div>
      </div>
    </header>
  );
};

export default Header;
