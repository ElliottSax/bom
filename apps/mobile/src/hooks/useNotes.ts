/**
 * Notes Hook
 *
 * Manages verse notes with local storage
 * Refactored to use generic usePersistedState hook
 */

import { useCallback, useRef } from 'react';
import { usePersistedList } from './usePersistedState';
import { generateId } from '../utils/id';

const NOTES_KEY = '@bom_notes';

export interface Note {
  id: string;
  verseId: string;
  editionId: string;
  book: string;
  chapter: number;
  verse: number;
  content: string;
  createdAt: number;
  updatedAt: number;
}

interface UseNotesResult {
  notes: Note[];
  loading: boolean;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Note;
  updateNote: (verseId: string, content: string) => void;
  deleteNote: (verseId: string) => void;
  getNote: (verseId: string) => Note | undefined;
  getNotesForChapter: (editionId: string, book: string, chapter: number) => Note[];
  searchNotes: (query: string) => Note[];
  clearAllNotes: () => Promise<void>;
}

export function useNotes(): UseNotesResult {
  const {
    items: notes,
    loading,
    clear,
    setItems,
  } = usePersistedList<Note>({ key: NOTES_KEY });

  // Keep track of last added note for return value
  const lastAddedNote = useRef<Note | null>(null);

  const addNote = useCallback(
    (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note => {
      const now = Date.now();
      const newNote: Note = {
        ...note,
        id: generateId('note'),
        createdAt: now,
        updatedAt: now,
      };

      lastAddedNote.current = newNote;

      // Remove existing note for same verse, then add new one
      setItems((prev) => [
        newNote,
        ...prev.filter((n) => n.verseId !== note.verseId),
      ]);

      return newNote;
    },
    [setItems]
  );

  const updateNote = useCallback(
    (verseId: string, content: string) => {
      setItems((prev) =>
        prev.map((n) =>
          n.verseId === verseId
            ? { ...n, content, updatedAt: Date.now() }
            : n
        )
      );
    },
    [setItems]
  );

  const deleteNote = useCallback(
    (verseId: string) => {
      setItems((prev) => prev.filter((n) => n.verseId !== verseId));
    },
    [setItems]
  );

  const getNote = useCallback(
    (verseId: string) => notes.find((n) => n.verseId === verseId),
    [notes]
  );

  const getNotesForChapter = useCallback(
    (editionId: string, book: string, chapter: number) =>
      notes.filter(
        (n) => n.editionId === editionId && n.book === book && n.chapter === chapter
      ),
    [notes]
  );

  const searchNotes = useCallback(
    (query: string) => {
      const lowerQuery = query.toLowerCase();
      return notes.filter((n) => n.content.toLowerCase().includes(lowerQuery));
    },
    [notes]
  );

  return {
    notes,
    loading,
    addNote,
    updateNote,
    deleteNote,
    getNote,
    getNotesForChapter,
    searchNotes,
    clearAllNotes: clear,
  };
}

/**
 * Format note date for display
 */
export function formatNoteDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}
