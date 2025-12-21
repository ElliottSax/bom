/**
 * Chapter Navigation Component
 *
 * Previous/Next chapter navigation for the scripture reader
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface ChapterNavigationProps {
  book: string;
  chapter: number;
  maxChapter: number;
  verseCount?: number;
  onPrevious: () => void;
  onNext: () => void;
  onChapterSelect: () => void;
  onJumpToVerse?: (verse: number) => void;
}

export function ChapterNavigation({
  book,
  chapter,
  maxChapter,
  verseCount,
  onPrevious,
  onNext,
  onChapterSelect,
  onJumpToVerse,
}: ChapterNavigationProps) {
  const { colors } = useTheme();
  const [jumpModalVisible, setJumpModalVisible] = useState(false);
  const [verseInput, setVerseInput] = useState('');

  const hasPrevious = chapter > 1;
  const hasNext = chapter < maxChapter;

  const handleJumpToVerse = () => {
    const verseNum = parseInt(verseInput, 10);
    if (verseNum > 0 && verseNum <= (verseCount || 999) && onJumpToVerse) {
      onJumpToVerse(verseNum);
      setJumpModalVisible(false);
      setVerseInput('');
    }
  };

  const verses = verseCount ? Array.from({ length: verseCount }, (_, i) => i + 1) : [];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      {/* Jump to Verse Modal */}
      {verseCount && onJumpToVerse && (
        <Modal
          visible={jumpModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setJumpModalVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setJumpModalVisible(false)}>
            <View style={[styles.jumpModal, { backgroundColor: colors.surface }]}>
              <Text style={[styles.jumpTitle, { color: colors.text }]}>Jump to Verse</Text>
              <Text style={[styles.jumpSubtitle, { color: colors.textSecondary }]}>
                {book} {chapter} ({verseCount} verses)
              </Text>

              <TextInput
                style={[styles.verseInput, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                placeholder="Verse number"
                placeholderTextColor={colors.textSecondary}
                value={verseInput}
                onChangeText={setVerseInput}
                keyboardType="number-pad"
                autoFocus
                onSubmitEditing={handleJumpToVerse}
              />

              <FlatList
                data={verses}
                numColumns={5}
                keyExtractor={(item) => item.toString()}
                style={styles.verseGrid}
                contentContainerStyle={styles.verseGridContent}
                renderItem={({ item }) => (
                  <Pressable
                    style={[styles.verseButton, { backgroundColor: colors.background }]}
                    onPress={() => {
                      onJumpToVerse(item);
                      setJumpModalVisible(false);
                      setVerseInput('');
                    }}
                  >
                    <Text style={[styles.verseButtonText, { color: colors.primary }]}>{item}</Text>
                  </Pressable>
                )}
              />

              <Pressable
                style={[styles.cancelButton, { backgroundColor: colors.background }]}
                onPress={() => setJumpModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      )}
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
      <View style={styles.centerSection}>
        <Pressable style={styles.chapterSelector} onPress={onChapterSelect}>
          <Text style={[styles.chapterLabel, { color: colors.textSecondary }]}>
            {book}
          </Text>
          <Text style={[styles.chapterNumber, { color: colors.primary }]}>
            {chapter} / {maxChapter}
          </Text>
        </Pressable>
        {verseCount && onJumpToVerse && (
          <Pressable
            style={[styles.jumpButton, { backgroundColor: colors.primary + '15' }]}
            onPress={() => setJumpModalVisible(true)}
          >
            <Text style={[styles.jumpButtonText, { color: colors.primary }]}>↓ Verse</Text>
          </Pressable>
        )}
      </View>

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
  centerSection: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
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
  jumpButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  jumpButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  jumpModal: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    padding: 20,
    maxHeight: '70%',
  },
  jumpTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  jumpSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  verseInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
  },
  verseGrid: {
    maxHeight: 200,
  },
  verseGridContent: {
    gap: 8,
  },
  verseButton: {
    flex: 1,
    margin: 4,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    minWidth: 44,
  },
  verseButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButton: {
    marginTop: 16,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
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
