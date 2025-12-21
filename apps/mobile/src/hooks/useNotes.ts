/**
 * Notes Hook
 *
 * Manages verse notes with local storage
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Note>;
  updateNote: (verseId: string, content: string) => Promise<void>;
  deleteNote: (verseId: string) => Promise<void>;
  getNote: (verseId: string) => Note | undefined;
  getNotesForChapter: (editionId: string, book: string, chapter: number) => Note[];
  searchNotes: (query: string) => Note[];
  clearAllNotes: () => Promise<void>;
}

export function useNotes(): UseNotesResult {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // Load notes on mount
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTES_KEY);
      if (stored) {
        setNotes(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveNotes = async (newNotes: Note[]) => {
    try {
      await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(newNotes));
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  };

  const addNote = useCallback(
    async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> => {
      const now = Date.now();
      const newNote: Note = {
        ...note,
        id: `note_${now}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: now,
        updatedAt: now,
      };

      setNotes((prev) => {
        // Remove existing note for same verse if exists
        const filtered = prev.filter((n) => n.verseId !== note.verseId);
        const updated = [newNote, ...filtered];
        saveNotes(updated);
        return updated;
      });

      return newNote;
    },
    []
  );

  const updateNote = useCallback(async (verseId: string, content: string) => {
    setNotes((prev) => {
      const updated = prev.map((n) =>
        n.verseId === verseId
          ? { ...n, content, updatedAt: Date.now() }
          : n
      );
      saveNotes(updated);
      return updated;
    });
  }, []);

  const deleteNote = useCallback(async (verseId: string) => {
    setNotes((prev) => {
      const updated = prev.filter((n) => n.verseId !== verseId);
      saveNotes(updated);
      return updated;
    });
  }, []);

  const getNote = useCallback(
    (verseId: string) => {
      return notes.find((n) => n.verseId === verseId);
    },
    [notes]
  );

  const getNotesForChapter = useCallback(
    (editionId: string, book: string, chapter: number) => {
      return notes.filter(
        (n) => n.editionId === editionId && n.book === book && n.chapter === chapter
      );
    },
    [notes]
  );

  const searchNotes = useCallback(
    (query: string) => {
      const lowerQuery = query.toLowerCase();
      return notes.filter((n) =>
        n.content.toLowerCase().includes(lowerQuery)
      );
    },
    [notes]
  );

  const clearAllNotes = useCallback(async () => {
    setNotes([]);
    await AsyncStorage.removeItem(NOTES_KEY);
  }, []);

  return {
    notes,
    loading,
    addNote,
    updateNote,
    deleteNote,
    getNote,
    getNotesForChapter,
    searchNotes,
    clearAllNotes,
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
