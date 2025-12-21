/**
 * Scripture Reader Component
 *
 * Main component for reading scripture chapters with offline support
 */

import React, { useRef, useMemo } from 'react';
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
import { useSettings } from '../contexts/SettingsContext';
import { useTheme } from '../contexts/ThemeContext';
import { useHighlights } from '../hooks/useHighlights';
import { useNotes } from '../hooks/useNotes';
import { useBookmarks } from '../hooks/useBookmarks';
import { useCrossReferences } from '../hooks/useCrossReferences';
import { estimateVerseReadingTime } from '../hooks/useReadingProgress';

interface ScriptureReaderProps {
  editionId: string;
  book: string;
  chapter: number;
  onVersePress?: (verseId: string, verseNumber: number) => void;
  onVerseLongPress?: (verseId: string, verseNumber: number, text: string) => void;
}

export function ScriptureReader({
  editionId,
  book,
  chapter,
  onVersePress,
  onVerseLongPress,
}: ScriptureReaderProps) {
  const { settings } = useSettings();
  const { colors } = useTheme();
  const { fontSize, lineHeight, showVerseNumbers } = settings.reading;
  const { verses, loading, error, isOffline, refetch } = useChapter(
    editionId,
    book,
    chapter
  );

  // Get annotations for this chapter
  const { getHighlight } = useHighlights();
  const { getNote } = useNotes();
  const { isBookmarked } = useBookmarks();
  const { hasCrossReferences } = useCrossReferences();

  const scrollViewRef = useRef<ScrollView>(null);

  // Build annotations map for efficient lookup
  const annotations = useMemo(() => {
    const map = new Map<string, {
      highlightColor?: string;
      hasNote: boolean;
      isBookmarked: boolean;
      hasCrossRefs: boolean;
    }>();

    verses.forEach((verse) => {
      const highlight = getHighlight(verse.id);
      const note = getNote(verse.id);
      const bookmarked = isBookmarked(verse.id);
      const crossRefs = hasCrossReferences(verse.id);

      if (highlight || note || bookmarked || crossRefs) {
        map.set(verse.id, {
          highlightColor: highlight?.color,
          hasNote: !!note,
          isBookmarked: bookmarked,
          hasCrossRefs: crossRefs,
        });
      }
    });

    return map;
  }, [verses, getHighlight, getNote, isBookmarked, hasCrossReferences]);

  // Calculate reading time
  const readingTime = useMemo(() => {
    if (verses.length === 0) return null;
    return estimateVerseReadingTime(verses);
  }, [verses]);

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Offline indicator */}
      {isOffline && (
        <View style={[styles.offlineBanner, { backgroundColor: colors.warning }]}>
          <Text style={styles.offlineText}>Offline Mode</Text>
        </View>
      )}

      {/* Chapter title */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.chapterTitle, { color: colors.text }]}>
          {book} {chapter}
        </Text>
        <View style={styles.headerStats}>
          <Text style={[styles.verseCount, { color: colors.textSecondary }]}>{verses.length} verses</Text>
          {readingTime && (
            <Text style={[styles.readingTime, { color: colors.textSecondary }]}>
              · {readingTime.formatted}
            </Text>
          )}
        </View>
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
        {verses.map((verse, index) => {
          const verseAnnotations = annotations.get(verse.id);
          return (
            <VerseItem
              key={verse.id}
              verse={verse}
              fontSize={fontSize}
              lineHeight={lineHeight}
              showVerseNumbers={showVerseNumbers}
              onPress={onVersePress}
              onLongPress={onVerseLongPress}
              isFirst={index === 0}
              colors={colors}
              highlightColor={verseAnnotations?.highlightColor}
              hasNote={verseAnnotations?.hasNote}
              isBookmarked={verseAnnotations?.isBookmarked}
              hasCrossRefs={verseAnnotations?.hasCrossRefs}
            />
          );
        })}

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
  showVerseNumbers: boolean;
  onPress?: (verseId: string, verseNumber: number) => void;
  onLongPress?: (verseId: string, verseNumber: number, text: string) => void;
  isFirst: boolean;
  colors: any;
  highlightColor?: string;
  hasNote?: boolean;
  isBookmarked?: boolean;
  hasCrossRefs?: boolean;
}

function VerseItem({
  verse,
  fontSize,
  lineHeight,
  showVerseNumbers,
  onPress,
  onLongPress,
  isFirst,
  colors,
  highlightColor,
  hasNote,
  isBookmarked,
  hasCrossRefs,
}: VerseItemProps) {
  const handlePress = () => {
    if (onPress) {
      onPress(verse.id, verse.verse);
    }
  };

  const handleLongPress = () => {
    if (onLongPress) {
      onLongPress(verse.id, verse.verse, verse.text);
    }
  };

  // Calculate background color based on highlight
  const backgroundColor = highlightColor
    ? highlightColor + '30' // 30% opacity
    : colors.surface;

  return (
    <Pressable
      style={[
        styles.verseContainer,
        isFirst && styles.firstVerse,
        { backgroundColor },
        highlightColor && styles.highlightedVerse,
      ]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={500}
      android_ripple={{ color: colors.primary + '20' }}
    >
      {/* Verse number with indicators */}
      <View style={styles.verseNumberContainer}>
        {showVerseNumbers && (
          <Text style={[styles.verseNumber, { color: colors.primary }]}>
            {verse.verse}
          </Text>
        )}
        {/* Annotation indicators */}
        <View style={styles.indicators}>
          {isBookmarked && (
            <Text style={styles.indicator}>🔖</Text>
          )}
          {hasNote && (
            <Text style={styles.indicator}>📝</Text>
          )}
          {hasCrossRefs && (
            <Text style={styles.indicatorSmall}>↗</Text>
          )}
        </View>
      </View>

      {/* Verse text */}
      <Text
        style={[
          styles.verseText,
          {
            fontSize,
            lineHeight: fontSize * lineHeight,
            color: colors.text,
            marginLeft: showVerseNumbers ? 0 : 4,
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
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verseCount: {
    fontSize: 14,
    color: '#666666',
  },
  readingTime: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 4,
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
  highlightedVerse: {
    borderRadius: 8,
    marginHorizontal: -4,
    paddingHorizontal: 8,
  },
  firstVerse: {
    marginTop: 0,
  },
  verseNumberContainer: {
    minWidth: 32,
    marginRight: 8,
    alignItems: 'flex-start',
  },
  verseNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0066cc',
    marginTop: 4,
  },
  indicators: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
    gap: 2,
  },
  indicator: {
    fontSize: 10,
  },
  indicatorSmall: {
    fontSize: 10,
    color: '#9c27b0',
    fontWeight: 'bold',
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
