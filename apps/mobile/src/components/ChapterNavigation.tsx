/**
 * Chapter Navigation Component
 *
 * Previous/Next chapter navigation for the scripture reader
 */

import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface ChapterNavigationProps {
  book: string;
  chapter: number;
  maxChapter: number;
  onPrevious: () => void;
  onNext: () => void;
  onChapterSelect: () => void;
}

export function ChapterNavigation({
  book,
  chapter,
  maxChapter,
  onPrevious,
  onNext,
  onChapterSelect,
}: ChapterNavigationProps) {
  const { colors } = useTheme();

  const hasPrevious = chapter > 1;
  const hasNext = chapter < maxChapter;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      {/* Previous Button */}
      <Pressable
        style={[
          styles.navButton,
          !hasPrevious && styles.navButtonDisabled,
        ]}
        onPress={onPrevious}
        disabled={!hasPrevious}
      >
        <Text
          style={[
            styles.navArrow,
            { color: hasPrevious ? colors.primary : colors.border },
          ]}
        >
          ‹
        </Text>
        <Text
          style={[
            styles.navLabel,
            { color: hasPrevious ? colors.text : colors.textSecondary },
          ]}
        >
          Previous
        </Text>
      </Pressable>

      {/* Chapter Selector */}
      <Pressable style={styles.chapterSelector} onPress={onChapterSelect}>
        <Text style={[styles.chapterLabel, { color: colors.textSecondary }]}>
          {book}
        </Text>
        <Text style={[styles.chapterNumber, { color: colors.primary }]}>
          {chapter} / {maxChapter}
        </Text>
      </Pressable>

      {/* Next Button */}
      <Pressable
        style={[
          styles.navButton,
          styles.navButtonRight,
          !hasNext && styles.navButtonDisabled,
        ]}
        onPress={onNext}
        disabled={!hasNext}
      >
        <Text
          style={[
            styles.navLabel,
            { color: hasNext ? colors.text : colors.textSecondary },
          ]}
        >
          Next
        </Text>
        <Text
          style={[
            styles.navArrow,
            { color: hasNext ? colors.primary : colors.border },
          ]}
        >
          ›
        </Text>
      </Pressable>
    </View>
  );
}

/**
 * Floating chapter navigation buttons (alternative style)
 */
interface FloatingNavProps {
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export function FloatingChapterNav({
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
}: FloatingNavProps) {
  const { colors } = useTheme();

  return (
    <>
      {hasPrevious && (
        <Pressable
          style={[
            styles.floatingButton,
            styles.floatingLeft,
            { backgroundColor: colors.surface },
          ]}
          onPress={onPrevious}
        >
          <Text style={[styles.floatingArrow, { color: colors.primary }]}>‹</Text>
        </Pressable>
      )}
      {hasNext && (
        <Pressable
          style={[
            styles.floatingButton,
            styles.floatingRight,
            { backgroundColor: colors.surface },
          ]}
          onPress={onNext}
        >
          <Text style={[styles.floatingArrow, { color: colors.primary }]}>›</Text>
        </Pressable>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 90,
  },
  navButtonRight: {
    justifyContent: 'flex-end',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navArrow: {
    fontSize: 28,
    fontWeight: '300',
  },
  navLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 4,
  },
  chapterSelector: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  chapterLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  chapterNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  floatingButton: {
    position: 'absolute',
    top: '45%',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  floatingLeft: {
    left: 8,
  },
  floatingRight: {
    right: 8,
  },
  floatingArrow: {
    fontSize: 24,
    fontWeight: '300',
  },
});
