/**
 * Book List Component
 *
 * Displays a list of available books for navigation
 */

import React, { useEffect } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useOfflineDownload } from '../hooks/useOfflineDownload';

// Book of Mormon structure (CoC 1908 edition)
const BOOK_OF_MORMON_BOOKS = [
  { name: 'I Nephi', chapters: 7 },
  { name: 'II Nephi', chapters: 15 },
  { name: 'Jacob', chapters: 5 },
  { name: 'Enos', chapters: 1 },
  { name: 'Jarom', chapters: 1 },
  { name: 'Omni', chapters: 1 },
  { name: 'Words of Mormon', chapters: 1 },
  { name: 'Mosiah', chapters: 13 },
  { name: 'Alma', chapters: 30 },
  { name: 'Helaman', chapters: 5 },
  { name: 'III Nephi', chapters: 14 },
  { name: 'IV Nephi', chapters: 1 },
  { name: 'Mormon', chapters: 4 },
  { name: 'Ether', chapters: 6 },
  { name: 'Moroni', chapters: 10 },
];

interface BookListProps {
  editionId: string;
  onBookSelect: (bookName: string, totalChapters: number) => void;
}

export function BookList({ editionId: _editionId, onBookSelect }: BookListProps) {
  const { colors } = useTheme();
  const { downloadStatus, checkDownloadStatus } = useOfflineDownload();

  // For now, use hardcoded Book of Mormon structure
  const books = BOOK_OF_MORMON_BOOKS;

  // Check download status on mount
  useEffect(() => {
    checkDownloadStatus();
  }, []);

  const renderBook = ({ item }: { item: typeof BOOK_OF_MORMON_BOOKS[0] }) => {
    const status = downloadStatus[item.name];
    const isComplete = status?.isComplete || false;
    const hasPartial = status && status.downloadedChapters > 0 && !isComplete;
    const downloadedCount = status?.downloadedChapters || 0;

    return (
      <Pressable
        style={[styles.bookItem, { backgroundColor: colors.surface }]}
        onPress={() => onBookSelect(item.name, item.chapters)}
        android_ripple={{ color: colors.primary + '20' }}
      >
        <View style={styles.bookContent}>
          <View style={styles.bookNameRow}>
            <Text style={[styles.bookName, { color: colors.text }]}>{item.name}</Text>
            {isComplete && (
              <View style={[styles.offlineBadge, { backgroundColor: colors.success + '20' }]}>
                <Text style={[styles.offlineBadgeText, { color: colors.success }]}>Offline</Text>
              </View>
            )}
            {hasPartial && (
              <View style={[styles.offlineBadge, { backgroundColor: colors.warning + '20' }]}>
                <Text style={[styles.offlineBadgeText, { color: colors.warning }]}>
                  {downloadedCount}/{item.chapters}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.chapterCount, { color: colors.textSecondary }]}>
            {item.chapters} {item.chapters === 1 ? 'chapter' : 'chapters'}
          </Text>
        </View>
        <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Book of Mormon</Text>
        <Text style={styles.headerSubtitle}>Community of Christ Edition (1908)</Text>
      </View>

      <FlatList
        data={books}
        renderItem={renderBook}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.border }]} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 16,
    backgroundColor: '#0066cc',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e3f2fd',
  },
  listContent: {
    paddingVertical: 8,
  },
  bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
  },
  bookContent: {
    flex: 1,
  },
  bookNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  bookName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  offlineBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  offlineBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  chapterCount: {
    fontSize: 14,
    color: '#666666',
  },
  chevron: {
    fontSize: 24,
    color: '#999999',
    marginLeft: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginLeft: 16,
  },
});
