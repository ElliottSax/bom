/**
 * @bom/graphql - GraphQL Schema Types
 *
 * This package contains the GraphQL schema and generated TypeScript types.
 *
 * To regenerate types from schema.graphql:
 *   npm run codegen
 *
 * The generated types will be placed in this directory.
 */

// Re-export generated types when they exist
// export * from './generated';

// Enum types matching the GraphQL schema
export enum HighlightColor {
  YELLOW = 'YELLOW',
  BLUE = 'BLUE',
  GREEN = 'GREEN',
  PINK = 'PINK',
  ORANGE = 'ORANGE',
  PURPLE = 'PURPLE',
}

export enum FontSize {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
  EXTRA_LARGE = 'EXTRA_LARGE',
}

export enum Theme {
  LIGHT = 'LIGHT',
  DARK = 'DARK',
  SEPIA = 'SEPIA',
  AUTO = 'AUTO',
}

export enum CrossReferenceType {
  OFFICIAL = 'OFFICIAL',
  AI_SUGGESTED = 'AI_SUGGESTED',
  USER_CREATED = 'USER_CREATED',
}

export enum NotificationType {
  DAILY_REMINDER = 'DAILY_REMINDER',
  STREAK_MILESTONE = 'STREAK_MILESTONE',
  NEW_FEATURE = 'NEW_FEATURE',
  SYSTEM = 'SYSTEM',
}

// Core type interfaces
export interface Verse {
  id: string;
  reference: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface Highlight {
  id: string;
  verseId: string;
  color: HighlightColor;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  verseId: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface ReadingProgress {
  book: string;
  chapter: number;
  verse: number;
  percentage: number;
  lastReadAt: string;
}

export interface StudyStreak {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string;
}

export interface SearchResults {
  results: Verse[];
  total: number;
  hasMore: boolean;
}

export interface AuthPayload {
  token: string;
  refreshToken: string;
  user: User;
}

// Input types
export interface CreateHighlightInput {
  verseId: string;
  color: HighlightColor;
}

export interface UpdateHighlightInput {
  color?: HighlightColor;
}

export interface CreateNoteInput {
  verseId: string;
  content: string;
  tags?: string[];
}

export interface UpdateNoteInput {
  content?: string;
  tags?: string[];
}

export interface UpdateReadingProgressInput {
  book: string;
  chapter: number;
  verse: number;
}

export interface SearchFilters {
  books?: string[];
  startDate?: string;
  endDate?: string;
}
