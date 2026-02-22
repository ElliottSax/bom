/**
 * Enhanced Theme Context
 *
 * Provides advanced theming with multiple color schemes, OLED mode, and custom themes
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useColorScheme, Appearance, StatusBar, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { logger } from '../utils/logger';

const log = logger.scope('EnhancedTheme');

const THEME_KEY = '@bom_theme_preference';
const CUSTOM_THEMES_KEY = '@bom_custom_themes';

export type ThemeMode = 'light' | 'dark' | 'system' | 'sepia' | 'high-contrast' | 'custom';

interface ColorPalette {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  textDisabled: string;
  border: string;
  divider: string;
  error: string;
  errorLight: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  info: string;
  infoLight: string;
  highlight: {
    yellow: string;
    blue: string;
    green: string;
    pink: string;
    orange: string;
    purple: string;
  };
  statusBar: 'light-content' | 'dark-content';
  navBar: string;
  tabBar: string;
  tabBarActive: string;
  tabBarInactive: string;
}

interface ThemeSettings {
  mode: ThemeMode;
  useOledBlack: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  fontFamily?: string;
  lineHeight: number;
  reducedMotion: boolean;
  autoNightMode: boolean;
  nightModeStartHour: number;
  nightModeEndHour: number;
  customThemeId?: string;
}

interface CustomTheme {
  id: string;
  name: string;
  colors: ColorPalette;
  isUserCreated: boolean;
}

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  colors: ColorPalette;
  isDark: boolean;
  settings: ThemeSettings;
  updateSettings: (settings: Partial<ThemeSettings>) => void;
  customThemes: CustomTheme[];
  createCustomTheme: (name: string, colors: Partial<ColorPalette>) => void;
  deleteCustomTheme: (id: string) => void;
  animatedColors: any;
  toggleTheme: () => void;
}

// Default Theme Palettes
const lightColors: ColorPalette = {
  primary: '#49cce6',
  primaryLight: '#e0f7fa',
  primaryDark: '#2a9fb8',
  accent: '#93c742',
  background: '#ffffff',
  surface: '#ffffff',
  card: '#ffffff',
  text: '#212225',
  textSecondary: '#666666',
  textDisabled: '#9e9e9e',
  border: '#e0e0e0',
  divider: '#e0e0e0',
  error: '#d32f2f',
  errorLight: '#ffebee',
  success: '#93c742',
  successLight: '#f1f8e9',
  warning: '#faa61a',
  warningLight: '#fff3e0',
  info: '#49cce6',
  infoLight: '#e0f7fa',
  highlight: {
    yellow: '#fff59d',
    blue: '#90caf9',
    green: '#a5d6a7',
    pink: '#f48fb1',
    orange: '#ffcc80',
    purple: '#ce93d8',
  },
  statusBar: 'dark-content',
  navBar: '#ffffff',
  tabBar: '#ffffff',
  tabBarActive: '#49cce6',
  tabBarInactive: '#757575',
};

const darkColors: ColorPalette = {
  primary: '#49cce6',
  primaryLight: '#1a3a52',
  primaryDark: '#2a9fb8',
  accent: '#93c742',
  background: '#121212',
  surface: '#1e1e1e',
  card: '#2c2c2c',
  text: 'rgba(255, 255, 255, 0.87)',
  textSecondary: 'rgba(255, 255, 255, 0.60)',
  textDisabled: 'rgba(255, 255, 255, 0.38)',
  border: '#333333',
  divider: '#424242',
  error: '#ef5350',
  errorLight: '#4d2626',
  success: '#93c742',
  successLight: '#2e4d2f',
  warning: '#faa61a',
  warningLight: '#4d3d26',
  info: '#49cce6',
  infoLight: '#263d4d',
  highlight: {
    yellow: 'rgba(255, 245, 157, 0.3)',
    blue: 'rgba(144, 202, 249, 0.3)',
    green: 'rgba(165, 214, 167, 0.3)',
    pink: 'rgba(244, 143, 177, 0.3)',
    orange: 'rgba(255, 204, 128, 0.3)',
    purple: 'rgba(206, 147, 216, 0.3)',
  },
  statusBar: 'light-content',
  navBar: '#1e1e1e',
  tabBar: '#1e1e1e',
  tabBarActive: '#49cce6',
  tabBarInactive: '#808080',
};

const oledDarkColors: ColorPalette = {
  ...darkColors,
  background: '#000000',
  surface: '#0a0a0a',
  card: '#141414',
  border: '#1a1a1a',
  divider: '#2a2a2a',
  navBar: '#000000',
  tabBar: '#000000',
};

const sepiaColors: ColorPalette = {
  primary: '#8b4513',
  primaryLight: '#f4e4c1',
  primaryDark: '#5d2e0f',
  accent: '#d2691e',
  background: '#f4ecd8',
  surface: '#faf6ed',
  card: '#fdfaf3',
  text: '#3e2723',
  textSecondary: '#5d4037',
  textDisabled: '#8d6e63',
  border: '#d7ccc8',
  divider: '#bcaaa4',
  error: '#c62828',
  errorLight: '#ffcdd2',
  success: '#558b2f',
  successLight: '#dcedc8',
  warning: '#f57c00',
  warningLight: '#ffe0b2',
  info: '#1565c0',
  infoLight: '#bbdefb',
  highlight: {
    yellow: 'rgba(251, 192, 45, 0.3)',
    blue: 'rgba(100, 149, 237, 0.3)',
    green: 'rgba(143, 188, 143, 0.3)',
    pink: 'rgba(188, 143, 143, 0.3)',
    orange: 'rgba(210, 105, 30, 0.3)',
    purple: 'rgba(147, 112, 219, 0.3)',
  },
  statusBar: 'dark-content',
  navBar: '#faf6ed',
  tabBar: '#faf6ed',
  tabBarActive: '#8b4513',
  tabBarInactive: '#8d6e63',
};

const highContrastColors: ColorPalette = {
  primary: '#0000ff',
  primaryLight: '#ccccff',
  primaryDark: '#000080',
  accent: '#ff0000',
  background: '#ffffff',
  surface: '#ffffff',
  card: '#ffffff',
  text: '#000000',
  textSecondary: '#000000',
  textDisabled: '#666666',
  border: '#000000',
  divider: '#000000',
  error: '#ff0000',
  errorLight: '#ffcccc',
  success: '#00ff00',
  successLight: '#ccffcc',
  warning: '#ffff00',
  warningLight: '#ffffcc',
  info: '#00ffff',
  infoLight: '#ccffff',
  highlight: {
    yellow: '#ffff00',
    blue: '#0000ff',
    green: '#00ff00',
    pink: '#ff00ff',
    orange: '#ff8800',
    purple: '#8800ff',
  },
  statusBar: 'dark-content',
  navBar: '#ffffff',
  tabBar: '#ffffff',
  tabBarActive: '#0000ff',
  tabBarInactive: '#666666',
};

// Predefined Custom Themes
const predefinedThemes: CustomTheme[] = [
  {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      ...lightColors,
      primary: '#006994',
      primaryLight: '#e0f2f7',
      accent: '#00acc1',
      background: '#f0f8ff',
    },
    isUserCreated: false,
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: {
      ...lightColors,
      primary: '#2e7d32',
      primaryLight: '#e8f5e9',
      accent: '#66bb6a',
      background: '#f1f8e9',
    },
    isUserCreated: false,
  },
  {
    id: 'sunset',
    name: 'Sunset',
    colors: {
      ...darkColors,
      primary: '#ff6b35',
      primaryLight: '#3d2026',
      accent: '#f77b71',
      background: '#1a0e14',
    },
    isUserCreated: false,
  },
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function EnhancedThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [settings, setSettings] = useState<ThemeSettings>({
    mode: 'system',
    useOledBlack: false,
    fontSize: 'medium',
    lineHeight: 1.5,
    reducedMotion: false,
    autoNightMode: false,
    nightModeStartHour: 20,
    nightModeEndHour: 6,
  });
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>(predefinedThemes);

  // Animation values
  const colorAnimation = useSharedValue(0);

  useEffect(() => {
    loadPreferences();

    // Set up auto night mode
    if (settings.autoNightMode) {
      const interval = setInterval(checkNightMode, 60000); // Check every minute
      checkNightMode();
      return () => clearInterval(interval);
    }
  }, [settings.autoNightMode]);

  useEffect(() => {
    // Animate theme change
    colorAnimation.value = withTiming(settings.mode === 'dark' ||
      (settings.mode === 'system' && systemColorScheme === 'dark') ? 1 : 0,
      { duration: 300 });
  }, [settings.mode, systemColorScheme]);

  const loadPreferences = async () => {
    try {
      const [savedSettings, savedCustomThemes] = await Promise.all([
        AsyncStorage.getItem(THEME_KEY),
        AsyncStorage.getItem(CUSTOM_THEMES_KEY),
      ]);

      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }

      if (savedCustomThemes) {
        const themes = JSON.parse(savedCustomThemes);
        setCustomThemes([...predefinedThemes, ...themes]);
      }
    } catch (error) {
      log.error('Error loading theme preferences', error);
    }
  };

  const savePreferences = async (newSettings: ThemeSettings, themes?: CustomTheme[]) => {
    try {
      await AsyncStorage.setItem(THEME_KEY, JSON.stringify(newSettings));
      if (themes) {
        const userThemes = themes.filter(t => t.isUserCreated);
        await AsyncStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(userThemes));
      }
    } catch (error) {
      log.error('Error saving theme preferences', error);
    }
  };

  const checkNightMode = () => {
    const now = new Date();
    const hour = now.getHours();
    const { nightModeStartHour, nightModeEndHour } = settings;

    const isNightTime = nightModeStartHour > nightModeEndHour
      ? hour >= nightModeStartHour || hour < nightModeEndHour
      : hour >= nightModeStartHour && hour < nightModeEndHour;

    if (isNightTime && settings.mode !== 'dark') {
      setTheme('dark');
    } else if (!isNightTime && settings.mode === 'dark') {
      setTheme('light');
    }
  };

  const setTheme = useCallback((mode: ThemeMode) => {
    const newSettings = { ...settings, mode };
    setSettings(newSettings);
    savePreferences(newSettings);

    // Update status bar
    const isDarkMode = mode === 'dark' || (mode === 'system' && systemColorScheme === 'dark');
    StatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content', true);

    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(isDarkMode ? '#000000' : '#ffffff', true);
    }
  }, [settings, systemColorScheme]);

  const updateSettings = useCallback((updates: Partial<ThemeSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    savePreferences(newSettings);
  }, [settings]);

  const createCustomTheme = useCallback((name: string, colors: Partial<ColorPalette>) => {
    const newTheme: CustomTheme = {
      id: `custom-${Date.now()}`,
      name,
      colors: { ...lightColors, ...colors },
      isUserCreated: true,
    };

    const updatedThemes = [...customThemes, newTheme];
    setCustomThemes(updatedThemes);
    savePreferences(settings, updatedThemes);
  }, [customThemes, settings]);

  const deleteCustomTheme = useCallback((id: string) => {
    const updatedThemes = customThemes.filter(t => t.id !== id);
    setCustomThemes(updatedThemes);
    savePreferences(settings, updatedThemes);

    if (settings.customThemeId === id) {
      setTheme('system');
    }
  }, [customThemes, settings]);

  const toggleTheme = useCallback(() => {
    const modes: ThemeMode[] = ['light', 'dark', 'sepia'];
    const currentIndex = modes.indexOf(settings.mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setTheme(modes[nextIndex]);
  }, [settings.mode]);

  // Determine current colors
  const getColors = (): ColorPalette => {
    switch (settings.mode) {
      case 'dark':
        return settings.useOledBlack ? oledDarkColors : darkColors;
      case 'light':
        return lightColors;
      case 'sepia':
        return sepiaColors;
      case 'high-contrast':
        return highContrastColors;
      case 'custom':
        const customTheme = customThemes.find(t => t.id === settings.customThemeId);
        return customTheme ? customTheme.colors : lightColors;
      case 'system':
      default:
        const isDarkSystem = systemColorScheme === 'dark';
        return isDarkSystem
          ? (settings.useOledBlack ? oledDarkColors : darkColors)
          : lightColors;
    }
  };

  const isDark = settings.mode === 'dark' ||
    (settings.mode === 'system' && systemColorScheme === 'dark');

  const colors = getColors();

  // Animated colors for smooth transitions
  const animatedColors = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        colorAnimation.value,
        [0, 1],
        [lightColors.background, darkColors.background]
      ),
    };
  });

  const value: ThemeContextType = {
    theme: settings.mode,
    setTheme,
    colors,
    isDark,
    settings,
    updateSettings,
    customThemes,
    createCustomTheme,
    deleteCustomTheme,
    animatedColors,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useEnhancedTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useEnhancedTheme must be used within an EnhancedThemeProvider');
  }
  return context;
}

// Helper hooks
export function useThemedStyles<T extends Record<string, any>>(
  styles: (colors: ColorPalette, isDark: boolean) => T
): T {
  const { colors, isDark } = useEnhancedTheme();
  return styles(colors, isDark);
}

export function useFontSize() {
  const { settings } = useEnhancedTheme();

  const sizes = {
    small: { body: 14, heading: 18, title: 24 },
    medium: { body: 16, heading: 20, title: 28 },
    large: { body: 18, heading: 24, title: 32 },
    'extra-large': { body: 20, heading: 28, title: 36 },
  };

  return sizes[settings.fontSize];
}