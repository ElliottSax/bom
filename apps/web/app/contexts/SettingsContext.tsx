import React, { createContext, useContext, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { type Theme, type FontFamily } from '../lib/types';

interface SettingsContextType {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  fontSize: number;
  setFontSize: React.Dispatch<React.SetStateAction<number>>;
  lineHeight: number;
  setLineHeight: React.Dispatch<React.SetStateAction<number>>;
  fontFamily: FontFamily;
  setFontFamily: React.Dispatch<React.SetStateAction<FontFamily>>;
  showVerseNumbers: boolean;
  setShowVerseNumbers: React.Dispatch<React.SetStateAction<boolean>>;
  cycleTheme: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useLocalStorage<Theme>('coc-theme', 'system');
  const [fontSize, setFontSize] = useLocalStorage<number>('coc-fontSize', 18);
  const [lineHeight, setLineHeight] = useLocalStorage<number>('coc-lineHeight', 1.7);
  const [fontFamily, setFontFamily] = useLocalStorage<FontFamily>('coc-fontFamily', 'serif');
  const [showVerseNumbers, setShowVerseNumbers] = useLocalStorage<boolean>('coc-showVerseNumbers', true);

  // Effect to apply theme class to documentElement
  useEffect(() => {
    const applyTheme = () => {
      const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.classList.toggle('dark', isDark);
    };
    applyTheme();
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', applyTheme);
      return () => mq.removeEventListener('change', applyTheme);
    }
  }, [theme]);

  const cycleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'system'];
    setTheme(themes[(themes.indexOf(theme) + 1) % 3]);
  };

  const value = {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    lineHeight,
    setLineHeight,
    fontFamily,
    setFontFamily,
    showVerseNumbers,
    setShowVerseNumbers,
    cycleTheme,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
