/**
 * Scripture Reader Component
 *
 * Main component for reading scripture chapters with offline support
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from 'react-native';
import { useChapter } from '../hooks/useChapter';

interface ScriptureReaderProps {
  editionId: string;
  book: string;
  chapter: number;
  onVersePress?: (verseId: string, verseNumber: number) => void;
  fontSize?: number;
  lineHeight?: number;
}

export function ScriptureReader({
  editionId,
  book,
  chapter,
  onVersePress,
  fontSize = 16,
  lineHeight = 1.6,
}: ScriptureReaderProps) {
  const { verses, loading, error, isOffline, refetch } = useChapter(
    editionId,
    book,
    chapter
  );

  const scrollViewRef = useRef<ScrollView>(null);

  // Loading state
  if (loading && verses.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading chapter...</Text>
      </View>
    );
  }

  // Error state
  if (error && verses.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load chapter</Text>
        <Text style={styles.errorDetail}>{error.message}</Text>
        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  // No verses found
  if (!loading && verses.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No verses found</Text>
        <Text style={styles.emptyDetail}>
          {book} Chapter {chapter} may not be available in this edition.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Offline indicator */}
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>📡 Offline Mode</Text>
        </View>
      )}

      {/* Chapter title */}
      <View style={styles.header}>
        <Text style={styles.chapterTitle}>
          {book} {chapter}
        </Text>
        <Text style={styles.verseCount}>{verses.length} verses</Text>
      </View>

      {/* Verses */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => refetch()}
            enabled={!isOffline}
          />
        }
      >
        {verses.map((verse, index) => (
          <VerseItem
            key={verse.id}
            verse={verse}
            fontSize={fontSize}
            lineHeight={lineHeight}
            onPress={onVersePress}
            isFirst={index === 0}
          />
        ))}

        {/* End of chapter spacer */}
        <View style={styles.endSpacer} />
      </ScrollView>
    </View>
  );
}

// Individual verse component
interface VerseItemProps {
  verse: {
    id: string;
    verse: number;
    text: string;
    verseType: string;
  };
  fontSize: number;
  lineHeight: number;
  onPress?: (verseId: string, verseNumber: number) => void;
  isFirst: boolean;
}

function VerseItem({ verse, fontSize, lineHeight, onPress, isFirst }: VerseItemProps) {
  const handlePress = () => {
    if (onPress) {
      onPress(verse.id, verse.verse);
    }
  };

  return (
    <Pressable
      style={[styles.verseContainer, isFirst && styles.firstVerse]}
      onPress={handlePress}
      android_ripple={{ color: '#e0e0e0' }}
    >
      <Text style={styles.verseNumber}>{verse.verse}</Text>
      <Text
        style={[
          styles.verseText,
          {
            fontSize,
            lineHeight: fontSize * lineHeight,
          },
        ]}
      >
        {verse.text}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  offlineBanner: {
    backgroundColor: '#ff9800',
    padding: 8,
    alignItems: 'center',
  },
  offlineText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chapterTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  verseCount: {
    fontSize: 14,
    color: '#666666',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  verseContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 4,
    borderRadius: 4,
  },
  firstVerse: {
    marginTop: 0,
  },
  verseNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0066cc',
    marginRight: 12,
    marginTop: 4,
    minWidth: 24,
  },
  verseText: {
    flex: 1,
    color: '#333333',
  },
  endSpacer: {
    height: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666666',
    marginBottom: 8,
  },
  emptyDetail: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
});
