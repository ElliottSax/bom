/**
 * Theme Context
 *
 * Provides dark mode support throughout the app
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@bom_theme_preference';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeColors {
  primary: string;
  primaryDark: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
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
  primary: '#0066cc',
  primaryDark: '#0052a3',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
  error: '#f44336',
  success: '#4caf50',
  warning: '#ff9800',
  highlight: {
    yellow: '#ffeb3b',
    blue: '#2196f3',
    green: '#4caf50',
    pink: '#e91e63',
    orange: '#ff9800',
  },
  statusBar: 'dark-content',
};

const darkColors: ThemeColors = {
  primary: '#4da6ff',
  primaryDark: '#0066cc',
  background: '#121212',
  surface: '#1e1e1e',
  text: '#ffffff',
  textSecondary: '#b0b0b0',
  border: '#333333',
  error: '#ff6b6b',
  success: '#66bb6a',
  warning: '#ffa726',
  highlight: {
    yellow: 'rgba(255, 235, 59, 0.3)',
    blue: 'rgba(33, 150, 243, 0.3)',
    green: 'rgba(76, 175, 80, 0.3)',
    pink: 'rgba(233, 30, 99, 0.3)',
    orange: 'rgba(255, 152, 0, 0.3)',
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
      console.error('Error loading theme preference:', error);
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
      console.error('Error saving theme preference:', error);
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