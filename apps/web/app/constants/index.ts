import { HighlightColor } from '../types';

export const HIGHLIGHT_COLORS: HighlightColor[] = [
  { name: 'Yellow', className: 'highlight-yellow' },
  { name: 'Green', className: 'highlight-green' },
  { name: 'Blue', className: 'highlight-blue' },
  { name: 'Purple', className: 'highlight-purple' },
  { name: 'Orange', className: 'highlight-orange' },
];

export const STORAGE_KEYS = {
  BOOKMARKS: 'coc-bookmarks',
  HIGHLIGHTS: 'coc-highlights',
  NOTES: 'coc-notes',
  VOLUME_ID: 'coc-volumeId',
  FONT_SIZE: 'coc-fontSize',
  LINE_HEIGHT: 'coc-lineHeight',
  FONT_FAMILY: 'coc-fontFamily',
  THEME: 'coc-theme',
  SHOW_VERSE_NUMBERS: 'coc-showVerseNumbers',
  READING_PROGRESS: 'coc-readingProgress',
  STUDY_PLAN: 'coc-studyPlan',
} as const;

export const DEFAULT_SETTINGS = {
  FONT_SIZE: 18,
  LINE_HEIGHT: 1.7,
  FONT_FAMILY: 'serif' as const,
  THEME: 'system' as const,
  SHOW_VERSE_NUMBERS: true,
};
