/**
 * Optimized Book List Component with Performance Improvements
 * - Uses React.memo to prevent unnecessary re-renders
 * - Implements getItemLayout for FlatList performance
 * - Uses useCallback for stable function references
 */

import React, { useEffect, useCallback, useMemo } from 'react';
import { View, FlatList, Text, StyleSheet, Pressable, ListRenderItem } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useOfflineDownload } from '../../hooks/useOfflineDownload';

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
] as const;

type BookItem = (typeof BOOK_OF_MORMON_BOOKS)[number];

interface BookListProps {
  editionId: string;
  onBookSelect: (bookName: string, totalChapters: number) => void;
}

// Memoized book item component
const BookItemComponent = React.memo(
  ({
    item,
    colors,
    onPress,
    status,
  }: {
    item: BookItem;
    colors: ReturnType<typeof useTheme>['colors'];
    onPress: () => void;
    status: ReturnType<typeof useOfflineDownload>['downloadStatus'][string];
  }) => {
    const isComplete = status?.isComplete || false;
    const hasPartial = status && status.downloadedChapters > 0 && !isComplete;
    const downloadedCount = status?.downloadedChapters || 0;

    return (
      <Pressable
        style={[styles.bookItem, { backgroundColor: colors.surface }]}
        onPress={onPress}
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
  }
);

BookItemComponent.displayName = 'BookItem';

// Item separator component
const ItemSeparator = React.memo(
  ({ colors }: { colors: ReturnType<typeof useTheme>['colors'] }) => (
    <View style={[styles.separator, { backgroundColor: colors.border }]} />
  )
);

ItemSeparator.displayName = 'ItemSeparator';

export const OptimizedBookList = React.memo(
  ({ editionId: _editionId, onBookSelect }: BookListProps) => {
    const { colors } = useTheme();
    const { downloadStatus, checkDownloadStatus } = useOfflineDownload();

    // Check download status on mount
    useEffect(() => {
      checkDownloadStatus();
    }, [checkDownloadStatus]);

    // Memoize the book list
    const books = useMemo(() => BOOK_OF_MORMON_BOOKS, []);

    // Optimize FlatList performance with getItemLayout
    const getItemLayout = useCallback(
      (_data: unknown, index: number) => ({
        length: ITEM_HEIGHT + SEPARATOR_HEIGHT,
        offset: (ITEM_HEIGHT + SEPARATOR_HEIGHT) * index,
        index,
      }),
      []
    );

    // Memoize keyExtractor
    const keyExtractor = useCallback((item: BookItem) => item.name, []);

    // Memoize renderItem
    const renderItem: ListRenderItem<BookItem> = useCallback(
      ({ item }) => {
        const handlePress = () => onBookSelect(item.name, item.chapters);
        const status = downloadStatus[item.name];

        return (
          <BookItemComponent item={item} colors={colors} onPress={handlePress} status={status} />
        );
      },
      [colors, downloadStatus, onBookSelect]
    );

    // Memoize separator component
    const renderSeparator = useCallback(() => <ItemSeparator colors={colors} />, [colors]);

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <Text style={styles.headerTitle}>Book of Mormon</Text>
          <Text style={styles.headerSubtitle}>Community of Christ Edition (1908)</Text>
        </View>

        <FlatList
          data={books}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={renderSeparator}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={15}
          windowSize={21}
          removeClippedSubviews={true}
        />
      </View>
    );
  }
);

OptimizedBookList.displayName = 'OptimizedBookList';

// Constants for getItemLayout
const ITEM_HEIGHT = 72;
const SEPARATOR_HEIGHT = 1;

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
    height: ITEM_HEIGHT,
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
    height: SEPARATOR_HEIGHT,
    backgroundColor: '#e0e0e0',
    marginLeft: 16,
  },
});
