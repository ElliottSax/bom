/**
 * Chapter List Component
 *
 * Displays a list of chapters for a selected book
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { isChapterCached } from '../services/offlineStorage';

const EDITION_ID = 'coc-bom-1908';

interface ChapterListProps {
  bookName: string;
  totalChapters: number;
  onChapterSelect: (chapter: number) => void;
  currentChapter?: number;
}

export function ChapterList({
  bookName,
  totalChapters,
  onChapterSelect,
  currentChapter,
}: ChapterListProps) {
  const { colors } = useTheme();
  const [cachedChapters, setCachedChapters] = useState<Set<number>>(new Set());

  // Generate array of chapter numbers
  const chapters = Array.from({ length: totalChapters }, (_, i) => i + 1);

  // Check which chapters are cached
  useEffect(() => {
    const checkCached = async () => {
      const cached = new Set<number>();
      for (let ch = 1; ch <= totalChapters; ch++) {
        const isCached = await isChapterCached(EDITION_ID, bookName, ch);
        if (isCached) cached.add(ch);
      }
      setCachedChapters(cached);
    };
    checkCached();
  }, [bookName, totalChapters]);

  const cachedCount = cachedChapters.size;
  const allCached = cachedCount === totalChapters;

  const renderChapter = ({ item }: { item: number }) => {
    const isCurrentChapter = item === currentChapter;
    const isCached = cachedChapters.has(item);

    return (
      <Pressable
        style={[
          styles.chapterItem,
          { backgroundColor: colors.surface, borderColor: colors.border },
          isCurrentChapter && { backgroundColor: colors.primary + '15', borderColor: colors.primary },
        ]}
        onPress={() => onChapterSelect(item)}
        android_ripple={{ color: colors.primary + '20' }}
      >
        <View style={styles.chapterContent}>
          <View style={styles.chapterRow}>
            <Text
              style={[
                styles.chapterNumber,
                { color: colors.text },
                isCurrentChapter && { color: colors.primary, fontWeight: 'bold' },
              ]}
            >
              Chapter {item}
            </Text>
            {isCached && (
              <Text style={[styles.offlineIcon, { color: colors.success }]}>✓</Text>
            )}
          </View>
        </View>
        <Text
          style={[
            styles.chevron,
            { color: colors.textSecondary },
            isCurrentChapter && { color: colors.primary },
          ]}
        >
          ›
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>{bookName}</Text>
        <View style={styles.headerRow}>
          <Text style={styles.headerSubtitle}>
            {totalChapters} {totalChapters === 1 ? 'chapter' : 'chapters'}
          </Text>
          {cachedCount > 0 && (
            <Text style={styles.offlineStatus}>
              {allCached ? '• All offline' : `• ${cachedCount} offline`}
            </Text>
          )}
        </View>
      </View>

      <FlatList
        data={chapters}
        renderItem={renderChapter}
        keyExtractor={(item) => item.toString()}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.border }]} />}
        // Grid layout for many chapters
        numColumns={totalChapters > 15 ? 3 : 1}
        key={totalChapters > 15 ? 'grid' : 'list'}
        columnWrapperStyle={
          totalChapters > 15 ? styles.columnWrapper : undefined
        }
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offlineStatus: {
    fontSize: 14,
    color: '#e3f2fd',
    marginLeft: 8,
  },
  listContent: {
    paddingVertical: 8,
  },
  chapterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    flex: 1,
    margin: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  currentChapterItem: {
    backgroundColor: '#e3f2fd',
    borderColor: '#0066cc',
  },
  chapterContent: {
    flex: 1,
  },
  chapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chapterNumber: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  offlineIcon: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  currentChapterText: {
    color: '#0066cc',
    fontWeight: 'bold',
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
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
});
