// Volume ID type
export type VolumeId = 'bom' | 'ot' | 'nt' | 'dc';

export interface Volume {
  id: VolumeId;
  name: string;
  shortName: string;
  description: string;
  color: string;
}

export interface Book {
  id: string;
  name: string;
  shortName: string;
  chapters: number;
  volumeId: VolumeId;
}

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

export interface UserData {
  version: number;
  exportDate: string;
  bookmarks: Bookmark[];
  highlights: Highlight[];
  notes: Note[];
  readingProgress: ReadingProgress;
  studyPlan: StudyPlanProgress | null;
  settings: {
    volumeId: VolumeId;
    fontSize: number;
    lineHeight: number;
    fontFamily: string;
    theme: string;
    showVerseNumbers: boolean;
  };
}

export type Theme = 'light' | 'dark' | 'system';
export type FontFamily = 'serif' | 'sans';

export const HIGHLIGHT_COLORS = [
  { name: 'Yellow', className: 'highlight-yellow' },
  { name: 'Green', className: 'highlight-green' },
  { name: 'Blue', className: 'highlight-blue' },
  { name: 'Purple', className: 'highlight-purple' },
  { name: 'Orange', className: 'highlight-orange' },
];

export interface StudyPlan {
  id: string;
  name: string;
  description: string;
  volumeId: VolumeId;
  days: number;
}

export interface CocResourceItem {
  name: string;
  url?: string; // Optional URL for external links
  description: string;
}

export interface CocResourceCategory {
  category: string;
  items: CocResourceItem[];
}
