import React from 'react';
import { Bookmark, Highlight, Note, Verse } from '../lib/types';
import { VolumeId } from '../lib/scriptures';

interface UseVerseOperationsProps {
  volumeId: VolumeId;
  currentBook: { name: string } | undefined;
  selectedChapter: number | null;
  bookmarks: Bookmark[];
  setBookmarks: React.Dispatch<React.SetStateAction<Bookmark[]>>;
  highlights: Highlight[];
  setHighlights: React.Dispatch<React.SetStateAction<Highlight[]>>;
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}

export const useVerseOperations = ({
  volumeId,
  currentBook,
  selectedChapter,
  bookmarks,
  setBookmarks,
  highlights,
  setHighlights,
  notes,
  setNotes,
}: UseVerseOperationsProps) => {
  const isBookmarked = (verseNum: number): boolean => {
    return bookmarks.some(
      b =>
        b.volumeId === volumeId &&
        b.book === currentBook?.name &&
        b.chapter === selectedChapter &&
        b.verse === verseNum
    );
  };

  const toggleBookmark = (verse: Verse) => {
    const existing = bookmarks.find(
      b =>
        b.volumeId === volumeId &&
        b.book === currentBook?.name &&
        b.chapter === selectedChapter &&
        b.verse === verse.num
    );

    if (existing) {
      setBookmarks(bookmarks.filter(b => b.id !== existing.id));
    } else {
      setBookmarks([
        ...bookmarks,
        {
          id: `${Date.now()}`,
          volumeId,
          book: currentBook?.name || '',
          chapter: selectedChapter || 0,
          verse: verse.num,
          text: verse.text,
          reference: verse.reference,
          createdAt: Date.now(),
        },
      ]);
    }
  };

  const getHighlight = (verseNum: number): Highlight | undefined => {
    return highlights.find(
      h =>
        h.volumeId === volumeId &&
        h.book === currentBook?.name &&
        h.chapter === selectedChapter &&
        h.verse === verseNum
    );
  };

  const setHighlightColor = (verseNum: number, color: string) => {
    const existing = getHighlight(verseNum);

    if (existing) {
      if (color) {
        // Update color
        setHighlights(highlights.map(h => (h.id === existing.id ? { ...h, color } : h)));
      } else {
        // Remove highlight
        setHighlights(highlights.filter(h => h.id !== existing.id));
      }
    } else if (color) {
      // Add new highlight
      setHighlights([
        ...highlights,
        {
          id: `${Date.now()}`,
          volumeId,
          book: currentBook?.name || '',
          chapter: selectedChapter || 0,
          verse: verseNum,
          color,
          createdAt: Date.now(),
        },
      ]);
    }
  };

  const getNote = (verseNum: number): Note | undefined => {
    return notes.find(
      n =>
        n.volumeId === volumeId &&
        n.book === currentBook?.name &&
        n.chapter === selectedChapter &&
        n.verse === verseNum
    );
  };

  const saveNote = (verseNum: number, content: string) => {
    if (!content.trim()) return;

    const existing = getNote(verseNum);

    if (existing) {
      setNotes(
        notes.map(n => (n.id === existing.id ? { ...n, content, updatedAt: Date.now() } : n))
      );
    } else {
      setNotes([
        ...notes,
        {
          id: `${Date.now()}`,
          volumeId,
          book: currentBook?.name || '',
          chapter: selectedChapter || 0,
          verse: verseNum,
          content,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]);
    }
  };

  const deleteNote = (noteId: string) => {
    setNotes(notes.filter(n => n.id !== noteId));
  };

  return {
    isBookmarked,
    toggleBookmark,
    getHighlight,
    setHighlightColor,
    getNote,
    saveNote,
    deleteNote,
  };
};
