/**
 * Shared TypeScript type definitions
 */

import { ApolloClient, NormalizedCacheObject } from '@apollo/client';

// Apollo Client type
export type ApolloClientType = ApolloClient<NormalizedCacheObject>;

// Theme types
export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  highlight: {
    yellow: string;
    green: string;
    blue: string;
    pink: string;
    orange: string;
  };
}

// Study Tab types
export interface StudyTab {
  id: string;
  title: string;
  type: 'verse' | 'search' | 'notes' | 'books' | 'plan' | 'home';
  data: StudyTabData;
  lastAccessed: string;
  scrollPosition?: number;
  icon?: string;
  color?: string;
  isPinned?: boolean;
  history?: NavigationEntry[];
  currentHistoryIndex?: number;
}

export interface StudyTabData {
  editionId?: string;
  book?: string;
  chapter?: number;
  verse?: {
    editionId: string;
    book: string;
    chapter: number;
    verse?: number;
  };
  search?: {
    query: string;
    results?: number;
  };
  notes?: {
    notebookId?: string;
    noteId?: string;
  };
  books?: {
    editionId?: string;
  };
  searchQuery?: string;
  noteId?: string;
  planId?: string;
  [key: string]: unknown;
}

export interface NavigationEntry {
  type: string;
  data: NavigationData;
  title: string;
  timestamp: string;
}

// Study Plan content types
export interface StudyPlanContent {
  editionId: string;
  book: string;
  startChapter: number;
  endChapter: number;
}

// Offline operation types
export interface OfflineOperationVariables {
  [key: string]:
    | string
    | number
    | boolean
    | null
    | undefined
    | OfflineOperationVariables
    | OfflineOperationVariables[];
}

// Highlight types
export interface Highlight {
  id: string;
  verseId: string;
  color: string;
  createdAt: string;
  updatedAt?: string;
  userId: string;
}

// Note types
export interface Note {
  id: string;
  verseId: string;
  content: string;
  markdown?: string;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
  userId: string;
}

// Cross Reference types
export interface CrossReference {
  id: string;
  sourceVerseId: string;
  targetVerseId: string;
  type: 'parallel' | 'similar' | 'contrast' | 'fulfillment' | 'quotation' | 'custom';
  notes?: string;
  createdAt: string;
  targetVerse?: {
    id: string;
    book: string;
    chapter: number;
    verse: number;
    text: string;
  };
}

// Notebook types
export interface Notebook {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  noteIds: string[];
  createdAt: string;
  updatedAt: string;
}

// Study Plan types
export interface StudyPlan {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  frequency: 'daily' | 'weekdays' | 'weekly' | 'custom';
  content: StudyPlanContent[];
  progress: {
    [date: string]: {
      completed: boolean;
      completedAt?: string;
      notes?: string;
    };
  };
  reminders: boolean;
  reminderTime?: string;
  createdAt: string;
  updatedAt?: string;
  streak: number;
}

// Verse types
export interface Verse {
  id: string;
  editionId: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  heading?: string;
}

// Search result types
export interface SearchResult {
  id: string;
  editionId: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  highlight?: string;
}

// User preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  syncEnabled: boolean;
  offlineMode: boolean;
  notificationsEnabled: boolean;
  studyReminders: boolean;
}

// GraphQL operation types
export interface GraphQLOperation {
  query: string;
  variables?: Record<string, unknown>;
  operationName?: string;
}

// Style types for better type safety
export interface StyleProp {
  [key: string]: string | number | StyleProp;
}
