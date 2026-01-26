import { useState, useEffect } from 'react';
import { Theme, FontFamily } from '../lib/types';
import { VolumeId } from '../lib/scriptures';

const STORAGE_PREFIX = 'coc-';

export const useSettings = () => {
  const [volumeId, setVolumeId] = useState<VolumeId>('bom');
  const [theme, setTheme] = useState<Theme>('system');
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.7);
  const [fontFamily, setFontFamily] = useState<FontFamily>('serif');
  const [showVerseNumbers, setShowVerseNumbers] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const load = (key: string) => localStorage.getItem(`${STORAGE_PREFIX}${key}`);

    try {
      if (load('volumeId')) setVolumeId(load('volumeId') as VolumeId);
      if (load('theme')) setTheme(load('theme') as Theme);
      if (load('fontSize')) setFontSize(parseInt(load('fontSize')!));
      if (load('lineHeight')) setLineHeight(parseFloat(load('lineHeight')!));
      if (load('fontFamily')) setFontFamily(load('fontFamily') as FontFamily);
      if (load('showVerseNumbers')) setShowVerseNumbers(load('showVerseNumbers') === 'true');
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, []);

  // Save to localStorage whenever values change
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}volumeId`, volumeId);
  }, [volumeId]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}theme`, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}fontSize`, fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}lineHeight`, lineHeight.toString());
  }, [lineHeight]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}fontFamily`, fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}showVerseNumbers`, showVerseNumbers.toString());
  }, [showVerseNumbers]);

  // Apply theme
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

  return {
    volumeId,
    setVolumeId,
    theme,
    setTheme,
    cycleTheme,
    fontSize,
    setFontSize,
    lineHeight,
    setLineHeight,
    fontFamily,
    setFontFamily,
    showVerseNumbers,
    setShowVerseNumbers,
  };
};
