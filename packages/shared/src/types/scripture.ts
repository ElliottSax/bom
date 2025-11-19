/**
 * Shared Scripture Types
 * Used across mobile, web, and API
 */

export interface Verse {
  id: string;
  reference: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  language: string;
}

export interface Highlight {
  id: string;
  userId: string;
  verseId: string;
  color: HighlightColor;
  createdAt: Date;
  updatedAt: Date;
}

export enum HighlightColor {
  YELLOW = 'yellow',
  BLUE = 'blue',
  GREEN = 'green',
  PINK = 'pink',
  ORANGE = 'orange',
  PURPLE = 'purple',
}

export interface Note {
  id: string;
  userId: string;
  verseId: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CrossReference {
  id: string;
  fromVerse: string;
  toVerse: string;
  type: CrossReferenceType;
}

export enum CrossReferenceType {
  OFFICIAL = 'official',
  AI_SUGGESTED = 'ai_suggested',
  USER_CREATED = 'user_created',
}

export interface ReadingProgress {
  userId: string;
  book: string;
  chapter: number;
  verse: number;
  percentage: number;
  lastReadAt: Date;
}

export interface StudyStreak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: Date;
}
