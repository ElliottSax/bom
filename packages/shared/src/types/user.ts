/**
 * Shared User Types
 */

export interface User {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  language: string;
  fontSize: FontSize;
  theme: Theme;
  notificationsEnabled: boolean;
  dailyReminderTime?: string;
  aiFeatures: AIPreferences;
}

export enum FontSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  EXTRA_LARGE = 'extra-large',
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SEPIA = 'sepia',
  AUTO = 'auto',
}

export interface AIPreferences {
  semanticSearchEnabled: boolean;
  chatbotEnabled: boolean;
  autoSuggestionsEnabled: boolean;
}
