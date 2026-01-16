/**
 * Memorization Screen
 *
 * Practice and review memorized verses with spaced repetition
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Modal,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useMemorization, MemorizationVerse } from '../hooks/useMemorization';

type ViewMode = 'list' | 'review' | 'stats';

export function MemorizationScreen() {
  const { colors } = useTheme();
  const {
    verses,
    loading,
    removeVerse,
    getDueVerses,
    recordReview,
    getStats,
    getLevelLabel,
    getLevelColor,
    formatNextReview,
    generateHint,
    getFirstLetterHint,
  } = useMemorization();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [hintLevel, setHintLevel] = useState(0); // 0=none, 1=first letters, 2=30% revealed

  const stats = useMemo(() => getStats(), [getStats, verses]);
  const dueVerses = useMemo(() => getDueVerses(), [getDueVerses, verses]);
  const currentVerse = dueVerses[currentReviewIndex];

  const handleStartReview = () => {
    if (dueVerses.length === 0) {
      Alert.alert('No Reviews Due', 'All verses are reviewed. Check back later!');
      return;
    }
    setCurrentReviewIndex(0);
    setShowAnswer(false);
    setHintLevel(0);
    setViewMode('review');
  };

  const handleRevealAnswer = () => {
    setShowAnswer(true);
  };

  const handleShowHint = () => {
    setHintLevel((prev) => Math.min(2, prev + 1));
  };

  const handleReviewResult = async (correct: boolean) => {
    if (currentVerse) {
      await recordReview(currentVerse.verseId, correct);
    }

    // Move to next verse or end review
    if (currentReviewIndex < dueVerses.length - 1) {
      setCurrentReviewIndex((prev) => prev + 1);
      setShowAnswer(false);
      setHintLevel(0);
    } else {
      setViewMode('stats');
    }
  };

  const handleRemoveVerse = (verse: MemorizationVerse) => {
    Alert.alert(
      'Remove Verse',
      `Remove "${verse.book} ${verse.chapter}:${verse.verse}" from memorization?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeVerse(verse.verseId),
        },
      ]
    );
  };

  const getHintText = () => {
    if (!currentVerse) return '';
    if (hintLevel === 1) return getFirstLetterHint(currentVerse.text);
    if (hintLevel === 2) return generateHint(currentVerse.text, 0.4).text;
    return '• • •';
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading...
        </Text>
      </View>
    );
  }

  // Review mode
  if (viewMode === 'review' && currentVerse) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.reviewHeader, { backgroundColor: colors.surface }]}>
          <Text style={[styles.reviewProgress, { color: colors.textSecondary }]}>
            {currentReviewIndex + 1} / {dueVerses.length}
          </Text>
          <Pressable onPress={() => setViewMode('list')}>
            <Text style={[styles.closeButton, { color: colors.primary }]}>Close</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.reviewContent}>
          {/* Reference */}
          <Text style={[styles.reference, { color: colors.primary }]}>
            {currentVerse.book} {currentVerse.chapter}:{currentVerse.verse}
          </Text>

          {/* Level indicator */}
          <View
            style={[
              styles.levelBadge,
              { backgroundColor: getLevelColor(currentVerse.level) + '20' },
            ]}
          >
            <Text
              style={[styles.levelText, { color: getLevelColor(currentVerse.level) }]}
            >
              {getLevelLabel(currentVerse.level)}
            </Text>
          </View>

          {/* Hint/Answer area */}
          <View style={[styles.textArea, { backgroundColor: colors.surface }]}>
            {showAnswer ? (
              <Text style={[styles.verseText, { color: colors.text }]}>
                {currentVerse.text}
              </Text>
            ) : (
              <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                {hintLevel === 0
                  ? 'Try to recite the verse from memory'
                  : getHintText()}
              </Text>
            )}
          </View>

          {/* Action buttons */}
          {!showAnswer ? (
            <View style={styles.hintButtons}>
              {hintLevel < 2 && (
                <Pressable
                  style={[styles.hintButton, { backgroundColor: colors.surface }]}
                  onPress={handleShowHint}
                >
                  <Text style={[styles.hintButtonText, { color: colors.text }]}>
                    {hintLevel === 0 ? 'Show First Letters' : 'Show More'}
                  </Text>
                </Pressable>
              )}
              <Pressable
                style={[styles.revealButton, { backgroundColor: colors.primary }]}
                onPress={handleRevealAnswer}
              >
                <Text style={styles.revealButtonText}>Reveal Answer</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.resultButtons}>
              <Pressable
                style={[styles.resultButton, styles.incorrectButton]}
                onPress={() => handleReviewResult(false)}
              >
                <Text style={styles.resultButtonText}>Needs Practice</Text>
              </Pressable>
              <Pressable
                style={[styles.resultButton, styles.correctButton]}
                onPress={() => handleReviewResult(true)}
              >
                <Text style={styles.resultButtonText}>Got It!</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  // Stats/completion view
  if (viewMode === 'stats') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.statsContent}>
          <Text style={[styles.statsTitle, { color: colors.text }]}>
            Review Complete!
          </Text>
          <Text style={[styles.statsSubtitle, { color: colors.textSecondary }]}>
            Great job practicing your verses
          </Text>

          <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Total verses
              </Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stats.total}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Mastered
              </Text>
              <Text style={[styles.statValue, { color: '#4caf50' }]}>
                {stats.mastered}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Learning
              </Text>
              <Text style={[styles.statValue, { color: '#ff9800' }]}>
                {stats.learning}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                New
              </Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stats.new}
              </Text>
            </View>
          </View>

          <Pressable
            style={[styles.doneButton, { backgroundColor: colors.primary }]}
            onPress={() => setViewMode('list')}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // List view (default)
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Stats banner */}
      <View style={[styles.statsBanner, { backgroundColor: colors.primary }]}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel2}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.mastered}</Text>
            <Text style={styles.statLabel2}>Mastered</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.dueForReview}</Text>
            <Text style={styles.statLabel2}>Due</Text>
          </View>
        </View>
      </View>

      {/* Review button */}
      {stats.dueForReview > 0 && (
        <Pressable
          style={[styles.reviewButton, { backgroundColor: colors.success }]}
          onPress={handleStartReview}
        >
          <Text style={styles.reviewButtonText}>
            Review {stats.dueForReview} verse{stats.dueForReview !== 1 ? 's' : ''}
          </Text>
        </Pressable>
      )}

      {/* Empty state */}
      {verses.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No Verses Yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Long-press any verse while reading and tap "Memorize" to add it here.
          </Text>
        </View>
      )}

      {/* Verse list */}
      {verses.map((verse) => (
        <Pressable
          key={verse.id}
          style={[styles.verseCard, { backgroundColor: colors.surface }]}
          onLongPress={() => handleRemoveVerse(verse)}
        >
          <View style={styles.verseCardHeader}>
            <Text style={[styles.verseReference, { color: colors.primary }]}>
              {verse.book} {verse.chapter}:{verse.verse}
            </Text>
            <View
              style={[
                styles.levelPill,
                { backgroundColor: getLevelColor(verse.level) + '20' },
              ]}
            >
              <Text
                style={[styles.levelPillText, { color: getLevelColor(verse.level) }]}
              >
                {getLevelLabel(verse.level)}
              </Text>
            </View>
          </View>
          <Text
            style={[styles.versePreview, { color: colors.text }]}
            numberOfLines={2}
          >
            {verse.text}
          </Text>
          <View style={styles.verseCardFooter}>
            <Text style={[styles.nextReview, { color: colors.textSecondary }]}>
              Next: {formatNextReview(verse.nextReviewAt)}
            </Text>
            <Text style={[styles.accuracy, { color: colors.textSecondary }]}>
              {verse.correctCount + verse.incorrectCount > 0
                ? `${Math.round(
                    (verse.correctCount / (verse.correctCount + verse.incorrectCount)) *
                      100
                  )}% accuracy`
                : 'Not reviewed'}
            </Text>
          </View>
        </Pressable>
      ))}

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          Long-press a verse to remove it
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  statsBanner: {
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel2: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  reviewButton: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  reviewButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  verseCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
  },
  verseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  verseReference: {
    fontSize: 16,
    fontWeight: '600',
  },
  levelPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  versePreview: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  verseCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nextReview: {
    fontSize: 12,
  },
  accuracy: {
    fontSize: 12,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
  // Review mode styles
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  reviewProgress: {
    fontSize: 14,
  },
  closeButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  reviewContent: {
    padding: 20,
    alignItems: 'center',
  },
  reference: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  levelBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 24,
  },
  levelText: {
    fontSize: 13,
    fontWeight: '600',
  },
  textArea: {
    width: '100%',
    padding: 24,
    borderRadius: 16,
    minHeight: 150,
    justifyContent: 'center',
    marginBottom: 24,
  },
  verseText: {
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
  },
  hintText: {
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  hintButtons: {
    gap: 12,
    width: '100%',
  },
  hintButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  hintButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  revealButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  revealButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  resultButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  incorrectButton: {
    backgroundColor: '#f44336',
  },
  correctButton: {
    backgroundColor: '#4caf50',
  },
  resultButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Stats mode styles
  statsContent: {
    flex: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statsSubtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  statsCard: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statLabel: {
    fontSize: 16,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  doneButton: {
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
