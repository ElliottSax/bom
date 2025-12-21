/**
 * Bookmarks Screen
 *
 * Display and manage saved bookmarks
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useBookmarks, sortBookmarks, Bookmark } from '../hooks/useBookmarks';

type SortBy = 'date' | 'location';

export function BookmarksScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { bookmarks, removeBookmark, clearAllBookmarks, loading } = useBookmarks();
  const [sortBy, setSortBy] = useState<SortBy>('date');

  const sortedBookmarks = useMemo(
    () => sortBookmarks(bookmarks, sortBy),
    [bookmarks, sortBy]
  );

  const handleBookmarkPress = (bookmark: Bookmark) => {
    navigation.navigate('Read', {
      screen: 'Reader',
      params: {
        editionId: bookmark.editionId,
        book: bookmark.book,
        chapter: bookmark.chapter,
      },
    });
  };

  const handleBookmarkLongPress = (bookmark: Bookmark) => {
    Alert.alert(
      'Remove Bookmark',
      `Remove bookmark for ${bookmark.book} ${bookmark.chapter}:${bookmark.verse}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeBookmark(bookmark.verseId),
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Bookmarks',
      'Are you sure you want to remove all bookmarks? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: clearAllBookmarks,
        },
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const renderBookmark = ({ item }: { item: Bookmark }) => (
    <Pressable
      style={[styles.bookmarkItem, { backgroundColor: colors.surface }]}
      onPress={() => handleBookmarkPress(item)}
      onLongPress={() => handleBookmarkLongPress(item)}
      android_ripple={{ color: colors.primary + '20' }}
    >
      <View style={styles.bookmarkHeader}>
        <Text style={[styles.reference, { color: colors.primary }]}>
          {item.book} {item.chapter}:{item.verse}
        </Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {formatDate(item.createdAt)}
        </Text>
      </View>
      <Text
        style={[styles.verseText, { color: colors.text }]}
        numberOfLines={2}
      >
        {item.text}
      </Text>
      {item.label && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {item.label}
        </Text>
      )}
    </Pressable>
  );

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>Loading bookmarks...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Sort Controls */}
      <View style={[styles.controls, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.sortLabel, { color: colors.textSecondary }]}>Sort by:</Text>
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
              Date
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
        {bookmarks.length > 0 && (
          <Pressable onPress={handleClearAll}>
            <Text style={[styles.clearText, { color: colors.error }]}>Clear All</Text>
          </Pressable>
        )}
      </View>

      {/* Bookmarks List */}
      {sortedBookmarks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📑</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No Bookmarks Yet
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Long-press any verse while reading to add a bookmark
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedBookmarks}
          renderItem={renderBookmark}
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
  list: {
    padding: 16,
  },
  bookmarkItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  bookmarkHeader: {
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
  verseText: {
    fontSize: 14,
    lineHeight: 20,
  },
  label: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
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
