/**
 * Reader Screen
 *
 * Main scripture reading screen with verse actions and chapter navigation
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScriptureReader } from '../components/ScriptureReader';
import { VerseActionMenu, VerseData } from '../components/VerseActionMenu';
import { ChapterNavigation } from '../components/ChapterNavigation';
import { NoteEditor } from '../components/NoteEditor';
import type { ReadStackParamList } from '../navigation/RootNavigator';
import { saveLastReadPosition } from './HomeScreen';
import { useBookmarks } from '../hooks/useBookmarks';
import { useHighlights } from '../hooks/useHighlights';
import { useNotes } from '../hooks/useNotes';
import { useBookNavigation } from '../hooks/useBookInfo';
import { useReadingProgress } from '../hooks/useReadingProgress';
import { useTheme } from '../contexts/ThemeContext';

type Props = NativeStackScreenProps<ReadStackParamList, 'Reader'>;

export function ReaderScreen({ route, navigation }: Props) {
  const { editionId, book, chapter } = route.params;
  const { colors } = useTheme();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { addHighlight, removeHighlight, getHighlight } = useHighlights();
  const { addNote, updateNote, deleteNote, getNote } = useNotes();
  const { markChapterComplete, isChapterComplete } = useReadingProgress();
  const bookNav = useBookNavigation(book, chapter);

  // Track if current chapter is complete
  const chapterIsComplete = isChapterComplete(editionId, book, chapter);

  // Verse action menu state
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<VerseData | null>(null);

  // Note editor state
  const [noteEditorVisible, setNoteEditorVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<{ content: string; updatedAt?: number } | null>(null);

  // Save last read position when chapter changes
  React.useEffect(() => {
    saveLastReadPosition(editionId, book, chapter);
  }, [editionId, book, chapter]);

  const handleVersePress = useCallback((verseId: string, verseNumber: number) => {
    // Quick tap - could scroll to verse or show quick info
  }, []);

  const handleVerseLongPress = useCallback(
    (verseId: string, verseNumber: number, text: string) => {
      setSelectedVerse({
        verseId,
        verseNumber,
        text,
        book,
        chapter,
        editionId,
      });
      setMenuVisible(true);
    },
    [book, chapter, editionId]
  );

  const handleBookmark = useCallback(() => {
    if (!selectedVerse) return;

    if (isBookmarked(selectedVerse.verseId)) {
      removeBookmark(selectedVerse.verseId);
    } else {
      addBookmark({
        verseId: selectedVerse.verseId,
        editionId: selectedVerse.editionId,
        book: selectedVerse.book,
        chapter: selectedVerse.chapter,
        verse: selectedVerse.verseNumber,
        text: selectedVerse.text.substring(0, 100) + (selectedVerse.text.length > 100 ? '...' : ''),
      });
    }
  }, [selectedVerse, isBookmarked, addBookmark, removeBookmark]);

  const handleHighlight = useCallback((color: string) => {
    if (!selectedVerse) return;

    if (color) {
      addHighlight({
        verseId: selectedVerse.verseId,
        editionId: selectedVerse.editionId,
        book: selectedVerse.book,
        chapter: selectedVerse.chapter,
        verse: selectedVerse.verseNumber,
        color,
      });
    } else {
      removeHighlight(selectedVerse.verseId);
    }
  }, [selectedVerse, addHighlight, removeHighlight]);

  const handleAddNote = useCallback(() => {
    if (!selectedVerse) return;

    // Check if there's an existing note
    const existingNote = getNote(selectedVerse.verseId);
    if (existingNote) {
      setEditingNote({
        content: existingNote.content,
        updatedAt: existingNote.updatedAt,
      });
    } else {
      setEditingNote(null);
    }

    setMenuVisible(false);
    setNoteEditorVisible(true);
  }, [selectedVerse, getNote]);

  const handleSaveNote = useCallback(
    (content: string) => {
      if (!selectedVerse) return;

      const existingNote = getNote(selectedVerse.verseId);
      if (existingNote) {
        updateNote(selectedVerse.verseId, content);
      } else {
        addNote({
          verseId: selectedVerse.verseId,
          editionId: selectedVerse.editionId,
          book: selectedVerse.book,
          chapter: selectedVerse.chapter,
          verse: selectedVerse.verseNumber,
          content,
        });
      }
    },
    [selectedVerse, getNote, addNote, updateNote]
  );

  const handleDeleteNote = useCallback(() => {
    if (!selectedVerse) return;
    deleteNote(selectedVerse.verseId);
  }, [selectedVerse, deleteNote]);

  const handleCloseNoteEditor = useCallback(() => {
    setNoteEditorVisible(false);
    setEditingNote(null);
    setSelectedVerse(null);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setMenuVisible(false);
    setSelectedVerse(null);
  }, []);

  const handlePreviousChapter = useCallback(() => {
    if (bookNav.previous) {
      navigation.setParams({
        book: bookNav.previous.book,
        chapter: bookNav.previous.chapter,
      });
    }
  }, [bookNav.previous, navigation]);

  const handleNextChapter = useCallback(() => {
    if (bookNav.next) {
      navigation.setParams({
        book: bookNav.next.book,
        chapter: bookNav.next.chapter,
      });
    }
  }, [bookNav.next, navigation]);

  const handleChapterSelect = useCallback(() => {
    // Navigate to chapter list for current book
    navigation.navigate('ChapterList', {
      editionId,
      book,
    });
  }, [navigation, editionId, book]);

  const handleMarkComplete = useCallback(() => {
    if (!chapterIsComplete) {
      markChapterComplete(editionId, book, chapter);
    }
  }, [chapterIsComplete, markChapterComplete, editionId, book, chapter]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScriptureReader
        editionId={editionId}
        book={book}
        chapter={chapter}
        onVersePress={handleVersePress}
        onVerseLongPress={handleVerseLongPress}
      />

      <ChapterNavigation
        book={book}
        chapter={chapter}
        maxChapter={bookNav.maxChapter}
        onPrevious={handlePreviousChapter}
        onNext={handleNextChapter}
        onChapterSelect={handleChapterSelect}
      />

      {/* Mark Complete Button */}
      <Pressable
        style={[
          styles.completeButton,
          {
            backgroundColor: chapterIsComplete ? colors.success : colors.primary,
          },
        ]}
        onPress={handleMarkComplete}
        disabled={chapterIsComplete}
      >
        <Text style={styles.completeButtonText}>
          {chapterIsComplete ? '✓ Completed' : 'Mark as Read'}
        </Text>
      </Pressable>

      <VerseActionMenu
        visible={menuVisible}
        verse={selectedVerse}
        isBookmarked={selectedVerse ? isBookmarked(selectedVerse.verseId) : false}
        onClose={handleCloseMenu}
        onBookmark={handleBookmark}
        onHighlight={handleHighlight}
        onAddNote={handleAddNote}
      />

      <NoteEditor
        visible={noteEditorVisible}
        verseReference={selectedVerse ? `${selectedVerse.book} ${selectedVerse.chapter}:${selectedVerse.verseNumber}` : ''}
        verseText={selectedVerse?.text || ''}
        initialContent={editingNote?.content}
        lastUpdated={editingNote?.updatedAt}
        onSave={handleSaveNote}
        onDelete={editingNote ? handleDeleteNote : undefined}
        onClose={handleCloseNoteEditor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  completeButton: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  completeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
