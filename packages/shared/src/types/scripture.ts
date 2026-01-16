/**
 * Shared Scripture Types
 * Used across mobile, web, and API
 */

export interface Verse {
  id: string;
  editionId: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  verseType?: string;
  reference?: string;
  language?: string;
}

export interface Edition {
  id: string;
  name: string;
  shortName: string;
  language: string;
  year?: number;
  verseCount?: number;
}

export interface Book {
  book: string;
  verseCount: number;
  chapters: number;
  firstChapter: number;
  lastChapter: number;
}

export interface Highlight {
  id: string;
  userId?: string;
  verseId: string;
  editionId?: string;
  book?: string;
  chapter?: number;
  verse?: number;
  color: HighlightColor;
  createdAt: Date | number;
  updatedAt?: Date | number;
}

// Enum values match GraphQL schema (lowercase values)
export enum HighlightColor {
  YELLOW = 'yellow',
  BLUE = 'blue',
  GREEN = 'green',
  PINK = 'pink',
  ORANGE = 'orange',
  PURPLE = 'purple',
}

// Array of all highlight colors for iteration
export const HIGHLIGHT_COLORS = Object.values(HighlightColor);

export interface Note {
  id: string;
  userId?: string;
  verseId: string;
  editionId?: string;
  book?: string;
  chapter?: number;
  verse?: number;
  content: string;
  tags?: string[];
  createdAt: Date | number;
  updatedAt: Date | number;
}

export interface CrossReference {
  id: string;
  fromVerse: string;
  toVerse: string;
  type: CrossReferenceType;
  note?: string;
}

export enum CrossReferenceType {
  OFFICIAL = 'official',
  AI_SUGGESTED = 'ai_suggested',
  USER_CREATED = 'user_created',
}

export interface ReadingProgress {
  userId?: string;
  editionId: string;
  book: string;
  chapter: number;
  verse?: number;
  percentage: number;
  lastReadAt: Date | number;
  completed?: boolean;
}

export interface StudyStreak {
  userId?: string;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: Date | number;
}

export interface Bookmark {
  id: string;
  verseId: string;
  editionId: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  label?: string;
  createdAt: number;
}

// ============================================
// Type Guards
// ============================================

export function isVerse(obj: unknown): obj is Verse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as Verse).id === 'string' &&
    typeof (obj as Verse).book === 'string' &&
    typeof (obj as Verse).chapter === 'number' &&
    typeof (obj as Verse).verse === 'number' &&
    typeof (obj as Verse).text === 'string'
  );
}

export function isHighlight(obj: unknown): obj is Highlight {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as Highlight).id === 'string' &&
    typeof (obj as Highlight).verseId === 'string' &&
    typeof (obj as Highlight).color === 'string' &&
    HIGHLIGHT_COLORS.includes((obj as Highlight).color)
  );
}

export function isNote(obj: unknown): obj is Note {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as Note).id === 'string' &&
    typeof (obj as Note).verseId === 'string' &&
    typeof (obj as Note).content === 'string'
  );
}

export function isBookmark(obj: unknown): obj is Bookmark {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as Bookmark).id === 'string' &&
    typeof (obj as Bookmark).verseId === 'string' &&
    typeof (obj as Bookmark).book === 'string' &&
    typeof (obj as Bookmark).chapter === 'number' &&
    typeof (obj as Bookmark).verse === 'number'
  );
}

export function isHighlightColor(value: string): value is HighlightColor {
  return HIGHLIGHT_COLORS.includes(value as HighlightColor);
}
