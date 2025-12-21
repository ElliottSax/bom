/**
 * Settings Context
 *
 * Manages persistent reading and app preferences
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@bom_app_settings';

export interface ReadingSettings {
  fontSize: number;
  lineHeight: number;
  showVerseNumbers: boolean;
  paragraphView: boolean;
  redLetter: boolean;
}

export interface StudySettings {
  dailyReminders: boolean;
  reminderTime: string;
  autoSaveNotes: boolean;
}

export interface SyncSettings {
  autoSync: boolean;
  wifiOnly: boolean;
  lastSyncTime: number | null;
}

export interface AppSettings {
  reading: ReadingSettings;
  study: StudySettings;
  sync: SyncSettings;
}

const defaultSettings: AppSettings = {
  reading: {
    fontSize: 16,
    lineHeight: 1.6,
    showVerseNumbers: true,
    paragraphView: false,
    redLetter: false,
  },
  study: {
    dailyReminders: true,
    reminderTime: '08:00',
    autoSaveNotes: true,
  },
  sync: {
    autoSync: true,
    wifiOnly: false,
    lastSyncTime: null,
  },
};

interface SettingsContextType {
  settings: AppSettings;
  loading: boolean;
  // Reading settings
  updateFontSize: (size: number) => void;
  updateLineHeight: (height: number) => void;
  toggleVerseNumbers: () => void;
  toggleParagraphView: () => void;
  toggleRedLetter: () => void;
  // Study settings
  toggleDailyReminders: () => void;
  setReminderTime: (time: string) => void;
  toggleAutoSaveNotes: () => void;
  // Sync settings
  toggleAutoSync: () => void;
  toggleWifiOnly: () => void;
  updateLastSyncTime: () => void;
  // General
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle new settings
        setSettings({
          reading: { ...defaultSettings.reading, ...parsed.reading },
          study: { ...defaultSettings.study, ...parsed.study },
          sync: { ...defaultSettings.sync, ...parsed.sync },
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const updateSettings = useCallback((updater: (prev: AppSettings) => AppSettings) => {
    setSettings((prev) => {
      const newSettings = updater(prev);
      saveSettings(newSettings);
      return newSettings;
    });
  }, []);

  // Reading settings
  const updateFontSize = useCallback((size: number) => {
    updateSettings((prev) => ({
      ...prev,
      reading: { ...prev.reading, fontSize: Math.max(12, Math.min(24, size)) },
    }));
  }, [updateSettings]);

  const updateLineHeight = useCallback((height: number) => {
    updateSettings((prev) => ({
      ...prev,
      reading: { ...prev.reading, lineHeight: Math.max(1.2, Math.min(2.0, height)) },
    }));
  }, [updateSettings]);

  const toggleVerseNumbers = useCallback(() => {
    updateSettings((prev) => ({
      ...prev,
      reading: { ...prev.reading, showVerseNumbers: !prev.reading.showVerseNumbers },
    }));
  }, [updateSettings]);

  const toggleParagraphView = useCallback(() => {
    updateSettings((prev) => ({
      ...prev,
      reading: { ...prev.reading, paragraphView: !prev.reading.paragraphView },
    }));
  }, [updateSettings]);

  const toggleRedLetter = useCallback(() => {
    updateSettings((prev) => ({
      ...prev,
      reading: { ...prev.reading, redLetter: !prev.reading.redLetter },
    }));
  }, [updateSettings]);

  // Study settings
  const toggleDailyReminders = useCallback(() => {
    updateSettings((prev) => ({
      ...prev,
      study: { ...prev.study, dailyReminders: !prev.study.dailyReminders },
    }));
  }, [updateSettings]);

  const setReminderTime = useCallback((time: string) => {
    updateSettings((prev) => ({
      ...prev,
      study: { ...prev.study, reminderTime: time },
    }));
  }, [updateSettings]);

  const toggleAutoSaveNotes = useCallback(() => {
    updateSettings((prev) => ({
      ...prev,
      study: { ...prev.study, autoSaveNotes: !prev.study.autoSaveNotes },
    }));
  }, [updateSettings]);

  // Sync settings
  const toggleAutoSync = useCallback(() => {
    updateSettings((prev) => ({
      ...prev,
      sync: { ...prev.sync, autoSync: !prev.sync.autoSync },
    }));
  }, [updateSettings]);

  const toggleWifiOnly = useCallback(() => {
    updateSettings((prev) => ({
      ...prev,
      sync: { ...prev.sync, wifiOnly: !prev.sync.wifiOnly },
    }));
  }, [updateSettings]);

  const updateLastSyncTime = useCallback(() => {
    updateSettings((prev) => ({
      ...prev,
      sync: { ...prev.sync, lastSyncTime: Date.now() },
    }));
  }, [updateSettings]);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    saveSettings(defaultSettings);
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        updateFontSize,
        updateLineHeight,
        toggleVerseNumbers,
        toggleParagraphView,
        toggleRedLetter,
        toggleDailyReminders,
        setReminderTime,
        toggleAutoSaveNotes,
        toggleAutoSync,
        toggleWifiOnly,
        updateLastSyncTime,
        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
