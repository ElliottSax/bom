import { VolumeId } from '../lib/scriptures';

export interface Verse {
  num: number;
  text: string;
  reference: string;
}

export interface Bookmark {
  id: string;
  volumeId: VolumeId;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string;
  createdAt: number;
}

export interface Highlight {
  id: string;
  volumeId: VolumeId;
  book: string;
  chapter: number;
  verse: number;
  color: string;
  createdAt: number;
}

export interface Note {
  id: string;
  volumeId: VolumeId;
  book: string;
  chapter: number;
  verse: number;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface SearchResult {
  volumeId: VolumeId;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string;
}

export interface ReadingProgress {
  chaptersRead: { [key: string]: number };
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string | null;
}

export interface StudyPlanProgress {
  planId: string;
  startDate: string;
  currentDay: number;
  completedDays: number[];
}

export interface UserSettings {
  volumeId: VolumeId;
  fontSize: number;
  lineHeight: number;
  fontFamily: FontFamily;
  theme: Theme;
  showVerseNumbers: boolean;
}

export interface UserData {
  version: number;
  exportDate: string;
  bookmarks: Bookmark[];
  highlights: Highlight[];
  notes: Note[];
  readingProgress: ReadingProgress;
  studyPlan: StudyPlanProgress | null;
  settings: UserSettings;
}

export type Theme = 'light' | 'dark' | 'system';
export type FontFamily = 'serif' | 'sans';
export type ActiveTab = 'books' | 'bookmarks' | 'notes' | 'progress';

export interface HighlightColor {
  name: string;
  className: string;
}
