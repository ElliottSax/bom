/**
 * Progress Screen
 *
 * Display reading progress and statistics
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import {
  useReadingProgress,
  getProgressMessage,
} from '../hooks/useReadingProgress';
import { getAllBooks } from '../hooks/useBookInfo';

export function ProgressScreen() {
  const { colors } = useTheme();
  const { stats, getBookProgress, resetProgress, loading } = useReadingProgress();

  const handleReset = () => {
    Alert.alert(
      'Reset Progress',
      'Are you sure you want to reset all reading progress? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: resetProgress,
        },
      ]
    );
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>Loading progress...</Text>
      </View>
    );
  }

  const books = getAllBooks();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Overall Progress */}
      <View style={[styles.heroCard, { backgroundColor: colors.primary }]}>
        <Text style={styles.heroPercent}>{stats.percentComplete}%</Text>
        <Text style={styles.heroLabel}>Complete</Text>
        <Text style={styles.heroSubtext}>
          {stats.totalChaptersRead} of {stats.totalChapters} chapters
        </Text>
        <Text style={styles.heroMessage}>
          {getProgressMessage(stats.percentComplete)}
        </Text>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${stats.percentComplete}%` },
            ]}
          />
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {stats.currentStreak}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Day Streak
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {stats.booksCompleted}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Books Done
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {formatDate(stats.lastReadDate)}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Last Read
          </Text>
        </View>
      </View>

      {/* Book Progress */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Book Progress
        </Text>

        {books.map((book) => {
          const bookProgress = getBookProgress('coc-bom-1908', book.name);
          const isComplete = bookProgress.percent === 100;

          return (
            <View
              key={book.name}
              style={[styles.bookItem, { backgroundColor: colors.surface }]}
            >
              <View style={styles.bookHeader}>
                <Text style={[styles.bookName, { color: colors.text }]}>
                  {isComplete && '✓ '}{book.name}
                </Text>
                <Text style={[styles.bookChapters, { color: colors.textSecondary }]}>
                  {bookProgress.completed}/{bookProgress.total}
                </Text>
              </View>
              <View style={[styles.bookProgressBar, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.bookProgressFill,
                    {
                      width: `${bookProgress.percent}%`,
                      backgroundColor: isComplete ? colors.success : colors.primary,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>

      {/* Reset Button */}
      <Pressable
        style={[styles.resetButton, { backgroundColor: colors.error + '15' }]}
        onPress={handleReset}
      >
        <Text style={[styles.resetButtonText, { color: colors.error }]}>
          Reset All Progress
        </Text>
      </Pressable>

      <View style={styles.bottomPadding} />
    </ScrollView>
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
  heroCard: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  heroPercent: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  heroLabel: {
    fontSize: 20,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 4,
  },
  heroSubtext: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
    marginBottom: 12,
  },
  heroMessage: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 8,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  bookItem: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  bookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookName: {
    fontSize: 14,
    fontWeight: '500',
  },
  bookChapters: {
    fontSize: 12,
  },
  bookProgressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  bookProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  resetButton: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});
