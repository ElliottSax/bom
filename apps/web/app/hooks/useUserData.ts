import { useState, useEffect } from 'react';
import { Bookmark, Highlight, Note } from '../lib/types';
import { logger } from '../utils/logger';

const log = logger.scope('UserData');

const STORAGE_PREFIX = 'coc-';

export const useUserData = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const load = (key: string) => localStorage.getItem(`${STORAGE_PREFIX}${key}`);

    try {
      if (load('bookmarks')) setBookmarks(JSON.parse(load('bookmarks')!));
      if (load('highlights')) setHighlights(JSON.parse(load('highlights')!));
      if (load('notes')) setNotes(JSON.parse(load('notes')!));
    } catch (error) {
      log.error('Error loading user data', error);
    }
  }, []);

  // Save to localStorage whenever values change
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}bookmarks`, JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}highlights`, JSON.stringify(highlights));
  }, [highlights]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}notes`, JSON.stringify(notes));
  }, [notes]);

  return {
    bookmarks,
    setBookmarks,
    highlights,
    setHighlights,
    notes,
    setNotes,
  };
};
