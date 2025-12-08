/**
 * Chapter List Component
 *
 * Displays a list of chapters for a selected book
 */

import React from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';

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
  // Generate array of chapter numbers
  const chapters = Array.from({ length: totalChapters }, (_, i) => i + 1);

  const renderChapter = ({ item }: { item: number }) => {
    const isCurrentChapter = item === currentChapter;

    return (
      <Pressable
        style={[
          styles.chapterItem,
          isCurrentChapter && styles.currentChapterItem,
        ]}
        onPress={() => onChapterSelect(item)}
        android_ripple={{ color: '#e0e0e0' }}
      >
        <View style={styles.chapterContent}>
          <Text
            style={[
              styles.chapterNumber,
              isCurrentChapter && styles.currentChapterText,
            ]}
          >
            Chapter {item}
          </Text>
        </View>
        <Text
          style={[
            styles.chevron,
            isCurrentChapter && styles.currentChapterText,
          ]}
        >
          ›
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{bookName}</Text>
        <Text style={styles.headerSubtitle}>
          {totalChapters} {totalChapters === 1 ? 'chapter' : 'chapters'}
        </Text>
      </View>

      <FlatList
        data={chapters}
        renderItem={renderChapter}
        keyExtractor={(item) => item.toString()}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
  chapterNumber: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
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
