/**
 * Notes Screen
 *
 * Display and manage all verse notes
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useNotes, formatNoteDate, Note } from '../hooks/useNotes';

type SortBy = 'date' | 'location';

export function NotesScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { notes, deleteNote, clearAllNotes, loading, searchNotes } = useNotes();
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = useMemo(() => {
    let result = searchQuery ? searchNotes(searchQuery) : notes;

    // Sort
    if (sortBy === 'date') {
      result = [...result].sort((a, b) => b.updatedAt - a.updatedAt);
    } else {
      result = [...result].sort((a, b) => {
        if (a.book !== b.book) return a.book.localeCompare(b.book);
        if (a.chapter !== b.chapter) return a.chapter - b.chapter;
        return a.verse - b.verse;
      });
    }

    return result;
  }, [notes, sortBy, searchQuery, searchNotes]);

  const handleNotePress = (note: Note) => {
    navigation.navigate('Read', {
      screen: 'Reader',
      params: {
        editionId: note.editionId,
        book: note.book,
        chapter: note.chapter,
      },
    });
  };

  const handleNoteLongPress = (note: Note) => {
    Alert.alert(
      'Delete Note',
      `Delete note for ${note.book} ${note.chapter}:${note.verse}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteNote(note.verseId),
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notes',
      'Are you sure you want to delete all notes? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: clearAllNotes,
        },
      ]
    );
  };

  const renderNote = ({ item }: { item: Note }) => (
    <Pressable
      style={[styles.noteItem, { backgroundColor: colors.surface }]}
      onPress={() => handleNotePress(item)}
      onLongPress={() => handleNoteLongPress(item)}
      android_ripple={{ color: colors.primary + '20' }}
    >
      <View style={styles.noteHeader}>
        <Text style={[styles.reference, { color: colors.primary }]}>
          {item.book} {item.chapter}:{item.verse}
        </Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {formatNoteDate(item.updatedAt)}
        </Text>
      </View>
      <Text
        style={[styles.noteContent, { color: colors.text }]}
        numberOfLines={3}
      >
        {item.content}
      </Text>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>Loading notes...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <TextInput
          style={[
            styles.searchInput,
            { color: colors.text, backgroundColor: colors.background },
          ]}
          placeholder="Search notes..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Sort Controls */}
      <View style={[styles.controls, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.sortLabel, { color: colors.textSecondary }]}>Sort:</Text>
        <View style={styles.sortButtons}>
          <Pressable
            style={[
              styles.sortButton,
              sortBy === 'date' && { backgroundColor: colors.primary + '20' },
            ]}
            onPress={() => setSortBy('date')}
          >
            <Text
              style={[
                styles.sortButtonText,
                { color: sortBy === 'date' ? colors.primary : colors.text },
              ]}
            >
              Recent
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.sortButton,
              sortBy === 'location' && { backgroundColor: colors.primary + '20' },
            ]}
            onPress={() => setSortBy('location')}
          >
            <Text
              style={[
                styles.sortButtonText,
                { color: sortBy === 'location' ? colors.primary : colors.text },
              ]}
            >
              Location
            </Text>
          </Pressable>
        </View>
        {notes.length > 0 && (
          <Pressable onPress={handleClearAll}>
            <Text style={[styles.clearText, { color: colors.error }]}>Clear</Text>
          </Pressable>
        )}
      </View>

      {/* Notes Count */}
      {filteredNotes.length > 0 && (
        <View style={styles.countContainer}>
          <Text style={[styles.countText, { color: colors.textSecondary }]}>
            {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
            {searchQuery && ` matching "${searchQuery}"`}
          </Text>
        </View>
      )}

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {searchQuery ? 'No Matching Notes' : 'No Notes Yet'}
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {searchQuery
              ? 'Try a different search term'
              : 'Long-press any verse while reading to add a note'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotes}
          renderItem={renderNote}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    padding: 12,
  },
  searchInput: {
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  sortLabel: {
    fontSize: 14,
    marginRight: 12,
  },
  sortButtons: {
    flexDirection: 'row',
    flex: 1,
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  clearText: {
    fontSize: 14,
    fontWeight: '500',
  },
  countContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  countText: {
    fontSize: 12,
  },
  list: {
    padding: 16,
    paddingTop: 8,
  },
  noteItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reference: {
    fontSize: 16,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
  },
  noteContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
