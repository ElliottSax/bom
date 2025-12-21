/**
 * Reader Screen
 *
 * Main scripture reading screen with verse actions and chapter navigation
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScriptureReader } from '../components/ScriptureReader';
import { VerseActionMenu, VerseData } from '../components/VerseActionMenu';
import { ChapterNavigation } from '../components/ChapterNavigation';
import type { ReadStackParamList } from '../navigation/RootNavigator';
import { saveLastReadPosition } from './HomeScreen';
import { useBookmarks } from '../hooks/useBookmarks';
import { useBookNavigation } from '../hooks/useBookInfo';
import { useTheme } from '../contexts/ThemeContext';

type Props = NativeStackScreenProps<ReadStackParamList, 'Reader'>;

export function ReaderScreen({ route, navigation }: Props) {
  const { editionId, book, chapter } = route.params;
  const { colors } = useTheme();
  const { bookmarks, addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const bookNav = useBookNavigation(book, chapter);

  // Verse action menu state
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<VerseData | null>(null);

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
      // TODO: Save highlight to storage
      Alert.alert(
        'Highlight Added',
        `Verse ${selectedVerse.verseNumber} highlighted in ${color === '#ffeb3b' ? 'yellow' : color === '#2196f3' ? 'blue' : color === '#4caf50' ? 'green' : color === '#e91e63' ? 'pink' : 'orange'}`
      );
    } else {
      Alert.alert('Highlight Removed', `Highlight removed from verse ${selectedVerse.verseNumber}`);
    }
  }, [selectedVerse]);

  const handleAddNote = useCallback(() => {
    if (!selectedVerse) return;

    // TODO: Navigate to note editor or show note input modal
    Alert.alert(
      'Add Note',
      `Notes feature coming soon for ${book} ${chapter}:${selectedVerse.verseNumber}`
    );
  }, [selectedVerse, book, chapter]);

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

      <VerseActionMenu
        visible={menuVisible}
        verse={selectedVerse}
        isBookmarked={selectedVerse ? isBookmarked(selectedVerse.verseId) : false}
        onClose={handleCloseMenu}
        onBookmark={handleBookmark}
        onHighlight={handleHighlight}
        onAddNote={handleAddNote}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
