/**
 * Theme Context
 *
 * Provides dark mode support throughout the app
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';

const log = logger.scope('ThemeContext');

const THEME_KEY = '@bom_theme_preference';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeColors {
  primary: string;
  primaryDark: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  highlight: {
    yellow: string;
    blue: string;
    green: string;
    pink: string;
    orange: string;
  };
  statusBar: 'light-content' | 'dark-content';
}

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  colors: ThemeColors;
  isDark: boolean;
}

const lightColors: ThemeColors = {
  primary: '#49cce6',
  primaryDark: '#2a9fb8',
  secondary: '#6c757d',
  background: '#ffffff',
  surface: '#ffffff',
  text: '#212225',
  textSecondary: '#666666',
  border: '#e0e0e0',
  error: '#d32f2f',
  success: '#93c742',
  warning: '#faa61a',
  info: '#49cce6',
  highlight: {
    yellow: '#fff59d',
    blue: '#90caf9',
    green: '#a5d6a7',
    pink: '#f48fb1',
    orange: '#ffcc80',
  },
  statusBar: 'dark-content',
};

const darkColors: ThemeColors = {
  primary: '#49cce6',
  primaryDark: '#2a9fb8',
  secondary: '#adb5bd',
  background: '#121212',
  surface: '#1e1e1e',
  text: 'rgba(255, 255, 255, 0.87)',
  textSecondary: 'rgba(255, 255, 255, 0.60)',
  border: '#333333',
  error: '#ff6b6b',
  success: '#93c742',
  warning: '#faa61a',
  info: '#49cce6',
  highlight: {
    yellow: 'rgba(255, 245, 157, 0.3)',
    blue: 'rgba(144, 202, 249, 0.3)',
    green: 'rgba(165, 214, 167, 0.3)',
    pink: 'rgba(244, 143, 177, 0.3)',
    orange: 'rgba(255, 204, 128, 0.3)',
  },
  statusBar: 'light-content',
};

// OLED black variant for pure black backgrounds
const oledDarkColors: ThemeColors = {
  ...darkColors,
  background: '#000000',
  surface: '#0a0a0a',
  border: '#1a1a1a',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>('system');
  const [useOledBlack, setUseOledBlack] = useState(false);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);
      if (savedTheme) {
        const { theme: savedMode, oled } = JSON.parse(savedTheme);
        setThemeState(savedMode as ThemeMode);
        setUseOledBlack(oled || false);
      }
    } catch (error) {
      log.error('Error loading theme preference', error);
    }
  };

  const setTheme = async (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem(
        THEME_KEY,
        JSON.stringify({ theme: newTheme, oled: useOledBlack })
      );
    } catch (error) {
      log.error('Error saving theme preference', error);
    }
  };

  const isDark = theme === 'dark' || (theme === 'system' && systemColorScheme === 'dark');

  const colors = isDark
    ? (useOledBlack ? oledDarkColors : darkColors)
    : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Themed style helper
export function themedStyles<T extends Record<string, any>>(
  lightStyles: T,
  darkStyles: T
): (isDark: boolean) => T {
  return (isDark: boolean) => isDark ? darkStyles : lightStyles;
}