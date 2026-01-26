import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import {
  type Bookmark,
  type Highlight,
  type Note,
  type ReadingProgress,
  type StudyPlanProgress,
  type Verse,
  type VolumeId,
  type Book,
  type UserData,
  type Theme,
  type FontFamily,
} from '../lib/types';
import { getBooksForVolume, VOLUMES, STUDY_PLANS } from '../lib/scriptures';

interface UserDataContextType {
  bookmarks: Bookmark[];
  setBookmarks: React.Dispatch<React.SetStateAction<Bookmark[]>>;
  highlights: Highlight[];
  setHighlights: React.Dispatch<React.SetStateAction<Highlight[]>>;
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  readingProgress: ReadingProgress;
  setReadingProgress: React.Dispatch<React.SetStateAction<ReadingProgress>>;
  studyPlan: StudyPlanProgress | null;
  setStudyPlan: React.Dispatch<React.SetStateAction<StudyPlanProgress | null>>;
  fileInputRef: React.RefObject<HTMLInputElement>;

  // Functions
  markChapterRead: (bookId: string, chapter: number) => void;
  isChapterRead: (bookId: string, chapter: number) => boolean;
  isBookmarked: (verseNum: number, currentBookName?: string | null, selectedChapter?: number | null) => boolean;
  toggleBookmark: (verse: Verse, currentBookName?: string | null, selectedChapter?: number | null) => void;
  getHighlight: (verseNum: number, currentBookName?: string | null, selectedChapter?: number | null) => Highlight | undefined;
  setHighlightColor: (verseNum: number, color: string, currentBookName?: string | null, selectedChapter?: number | null) => void;
  getNote: (verseNum: number, currentBookName?: string | null, selectedChapter?: number | null) => Note | undefined;
  saveNote: (currentBookName?: string | null, selectedChapter?: number | null, editingNoteVerse?: number | null, noteContent?: string) => void;
  deleteNote: (id: string) => void;
  openNoteEditor: (verse: Verse, currentBookName?: string | null, selectedChapter?: number | null) => void;
  startStudyPlan: (planId: string) => void;
  completeStudyPlanDay: () => void;
  exportData: (settings: { volumeId: VolumeId, fontSize: number, lineHeight: number, fontFamily: FontFamily, theme: Theme, showVerseNumbers: boolean }) => void;
  importData: (e: React.ChangeEvent<HTMLInputElement>) => void;

  // For NoteEditorModal
  showNoteEditor: boolean;
  setShowNoteEditor: React.Dispatch<React.SetStateAction<boolean>>;
  noteContent: string;
  setNoteContent: React.Dispatch<React.SetStateAction<string>>;
  editingNoteVerse: number | null;
  setEditingNoteVerse: React.Dispatch<React.SetStateAction<number | null>>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataContextProvider: React.FC<{ children: React.ReactNode, currentVolumeId: VolumeId }> = ({ children, currentVolumeId }) => {
  const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>('coc-bookmarks', []);
  const [highlights, setHighlights] = useLocalStorage<Highlight[]>('coc-highlights', []);
  const [notes, setNotes] = useLocalStorage<Note[]>('coc-notes', []);
  const [readingProgress, setReadingProgress] = useLocalStorage<ReadingProgress>('coc-readingProgress', {
    chaptersRead: {},
    currentStreak: 0,
    longestStreak: 0,
    lastReadDate: null,
  });
  const [studyPlan, setStudyPlan] = useLocalStorage<StudyPlanProgress | null>('coc-studyPlan', null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [editingNoteVerse, setEditingNoteVerse] = useState<number | null>(null);

  const markChapterRead = useCallback((bookId: string, chapter: number) => {
    const key = `${currentVolumeId}:${bookId}:${chapter}`;
    const today = new Date().toISOString().split('T')[0];
    setReadingProgress(prev => {
      const chaptersRead = { ...prev.chaptersRead, [key]: Date.now() };
      let streak = prev.currentStreak, longest = prev.longestStreak;
      if (prev.lastReadDate !== today) {
        const y = new Date(); y.setDate(y.getDate() - 1);
        streak = prev.lastReadDate === y.toISOString().split('T')[0] ? prev.currentStreak + 1 : 1;
        longest = Math.max(longest, streak);
      }
      return { chaptersRead, currentStreak: streak, longestStreak: longest, lastReadDate: today };
    });
  }, [currentVolumeId, setReadingProgress]);

  const isChapterRead = useCallback((bookId: string, chapter: number) => {
    return !!readingProgress.chaptersRead[`${currentVolumeId}:${bookId}:${chapter}`];
  }, [currentVolumeId, readingProgress.chaptersRead]);

  const isBookmarked = useCallback((verseNum: number, currentBookName: string | null = null, selectedChapter: number | null = null) => {
    return bookmarks.some(b => b.volumeId === currentVolumeId && b.book === currentBookName && b.chapter === selectedChapter && b.verse === verseNum);
  }, [bookmarks, currentVolumeId]);

  const toggleBookmark = useCallback((verse: Verse, currentBookName: string | null = null, selectedChapter: number | null = null) => {
    const existingBookmark = bookmarks.find(b => b.volumeId === currentVolumeId && b.book === currentBookName && b.chapter === selectedChapter && b.verse === verse.num);
    if (existingBookmark) {
      setBookmarks(bookmarks.filter(b => b.id !== existingBookmark.id));
    } else {
      setBookmarks([...bookmarks, { id: `${Date.now()}`, volumeId: currentVolumeId, book: currentBookName || '', chapter: selectedChapter || 0, verse: verse.num, text: verse.text, reference: verse.reference, createdAt: Date.now() }]);
    }
  }, [bookmarks, currentVolumeId, setBookmarks]);

  const getHighlight = useCallback((verseNum: number, currentBookName: string | null = null, selectedChapter: number | null = null) => {
    return highlights.find(h => h.volumeId === currentVolumeId && h.book === currentBookName && h.chapter === selectedChapter && h.verse === verseNum);
  }, [highlights, currentVolumeId]);

  const setHighlightColor = useCallback((verseNum: number, color: string, currentBookName: string | null = null, selectedChapter: number | null = null) => {
    const existingHighlight = getHighlight(verseNum, currentBookName, selectedChapter);
    if (existingHighlight) {
      if (color) {
        setHighlights(highlights.map(h => h.id === existingHighlight.id ? { ...h, color } : h));
      } else {
        setHighlights(highlights.filter(h => h.id !== existingHighlight.id));
      }
    } else if (color) {
      setHighlights([...highlights, { id: `${Date.now()}`, volumeId: currentVolumeId, book: currentBookName || '', chapter: selectedChapter || 0, verse: verseNum, color, createdAt: Date.now() }]);
    }
  }, [getHighlight, highlights, currentVolumeId, setHighlights]);

  const getNote = useCallback((verseNum: number, currentBookName: string | null = null, selectedChapter: number | null = null) => {
    return notes.find(n => n.volumeId === currentVolumeId && n.book === currentBookName && n.chapter === selectedChapter && n.verse === verseNum);
  }, [notes, currentVolumeId]);

  const saveNote = useCallback((currentBookName: string | null = null, selectedChapter: number | null = null, editingNoteVerseNum: number | null = null, noteContentText: string = noteContent) => {
    if (!editingNoteVerseNum || !noteContentText.trim()) return;
    const existingNote = getNote(editingNoteVerseNum, currentBookName, selectedChapter);
    if (existingNote) {
      setNotes(notes.map(n => n.id === existingNote.id ? { ...n, content: noteContentText, updatedAt: Date.now() } : n));
    } else {
      setNotes([...notes, { id: `${Date.now()}`, volumeId: currentVolumeId, book: currentBookName || '', chapter: selectedChapter || 0, verse: editingNoteVerseNum, content: noteContentText, createdAt: Date.now(), updatedAt: Date.now() }]);
    }
    setShowNoteEditor(false);
    setNoteContent('');
    setEditingNoteVerse(null);
  }, [currentVolumeId, notes, getNote, setNotes, setShowNoteEditor, setNoteContent, setEditingNoteVerse, noteContent]); // Added noteContent to dependencies

  const deleteNote = useCallback((id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  }, [notes, setNotes]);

  const openNoteEditor = useCallback((verse: Verse, currentBookName: string | null = null, selectedChapter: number | null = null) => {
    const existingNote = getNote(verse.num, currentBookName, selectedChapter);
    setEditingNoteVerse(verse.num);
    setNoteContent(existingNote?.content || '');
    setShowNoteEditor(true);
  }, [getNote, setEditingNoteVerse, setNoteContent, setShowNoteEditor]);

  const startStudyPlan = useCallback((planId: string) => {
    setStudyPlan({ planId, startDate: new Date().toISOString().split('T')[0], currentDay: 1, completedDays: [] });
  }, [setStudyPlan]);

  const completeStudyPlanDay = useCallback(() => {
    if (!studyPlan) return;
    setStudyPlan(prev => prev ? { ...prev, completedDays: [...prev.completedDays, prev.currentDay], currentDay: prev.currentDay + 1 } : null);
  }, [studyPlan, setStudyPlan]);

  const exportData = useCallback((settings: { volumeId: VolumeId, fontSize: number, lineHeight: number, fontFamily: FontFamily, theme: Theme, showVerseNumbers: boolean }) => {
    const data: UserData = { version: 2, exportDate: new Date().toISOString(), bookmarks, highlights, notes, readingProgress, studyPlan, settings };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `scripture-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [bookmarks, highlights, notes, readingProgress, studyPlan]);

  const importData = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data: UserData = JSON.parse(ev.target?.result as string);
        if (data.version && data.bookmarks) {
          setBookmarks(data.bookmarks);
          setHighlights(data.highlights);
          setNotes(data.notes);
          setReadingProgress(data.readingProgress);
          if (data.studyPlan) setStudyPlan(data.studyPlan);
          // Settings are now managed by SettingsContext, so we don't set them here directly.
          alert('Imported!');
        }
      } catch {
        alert('Error reading file');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [setBookmarks, setHighlights, setNotes, setReadingProgress, setStudyPlan]);

  const value = {
    bookmarks,
    setBookmarks,
    highlights,
    setHighlights,
    notes,
    setNotes,
    readingProgress,
    setReadingProgress,
    studyPlan,
    setStudyPlan,
    fileInputRef,
    markChapterRead,
    isChapterRead,
    isBookmarked,
    toggleBookmark,
    getHighlight,
    setHighlightColor,
    getNote,
    saveNote,
    deleteNote,
    openNoteEditor,
    startStudyPlan,
    completeStudyPlanDay,
    exportData,
    importData,
    showNoteEditor,
    setShowNoteEditor,
    noteContent,
    setNoteContent,
    editingNoteVerse,
    setEditingNoteVerse,
  };

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
};

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataContextProvider');
  }
  return context;
};
