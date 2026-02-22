/**
 * Home Screen
 *
 * Main landing screen with "Continue Reading" and quick access
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStats, formatNumber } from '../hooks/useStats';
import { useDailyVerse } from '../hooks/useDailyVerse';
import { useReadingProgress, getProgressMessage } from '../hooks/useReadingProgress';
import { useBookmarks } from '../hooks/useBookmarks';
import { useNotes } from '../hooks/useNotes';
import { useOfflineDownload } from '../hooks/useOfflineDownload';
import { useMemorization } from '../hooks/useMemorization';
import { useReadingGoals } from '../hooks/useReadingGoals';
import { useCourses } from '../hooks/useCourses';
import { useTheme } from '../contexts/ThemeContext';
import { logger } from '../utils/logger';

const log = logger.scope('HomeScreen');

const LAST_READ_KEY = '@bom_last_read';

interface LastReadPosition {
  editionId: string;
  book: string;
  chapter: number;
  timestamp: number;
}

export function HomeScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { totalVerses, totalBooks, totalChapters, loading: statsLoading } = useStats();
  const { verse: dailyVerse, loading: verseLoading, navigateToVerse } = useDailyVerse();
  const { stats: progressStats } = useReadingProgress();
  const { bookmarks } = useBookmarks();
  const { notes } = useNotes();
  const { downloadStatus, getTotalDownloadSize } = useOfflineDownload();
  const { verses: memorizationVerses, getStats: getMemorizationStats } = useMemorization();
  const { activeGoals, getGoalStats } = useReadingGoals();
  const { coursesInProgress } = useCourses();
  const [lastRead, setLastRead] = useState<LastReadPosition | null>(null);
  const [loadingLastRead, setLoadingLastRead] = useState(true);

  // Calculate offline stats
  const downloadSize = getTotalDownloadSize();
  const downloadedChapters = Object.values(downloadStatus).reduce(
    (sum, s) => sum + (s.downloadedChapters || 0),
    0
  );
  const offlinePercent = downloadSize.chapters > 0
    ? Math.round((downloadedChapters / downloadSize.chapters) * 100)
    : 0;

  // Load last read position on mount
  useEffect(() => {
    async function loadLastRead() {
      try {
        const stored = await AsyncStorage.getItem(LAST_READ_KEY);
        if (stored) {
          setLastRead(JSON.parse(stored));
        }
      } catch (error) {
        log.error('Failed to load last read position:', error);
      } finally {
        setLoadingLastRead(false);
      }
    }
    loadLastRead();
  }, []);

  const handleContinueReading = () => {
    const position = lastRead || {
      editionId: 'coc-bom-1908',
      book: 'I Nephi',
      chapter: 1,
    };

    navigation.navigate('Read', {
      screen: 'Reader',
      params: position,
    });
  };

  const handleStartReading = () => {
    navigation.navigate('Read', {
      screen: 'BookList',
      params: {
        editionId: 'coc-bom-1908',
      },
    });
  };

  const handleDailyVersePress = () => {
    const params = navigateToVerse();
    navigation.navigate('Read', {
      screen: 'Reader',
      params,
    });
  };

  const handleProgressPress = () => {
    navigation.navigate('Progress');
  };

  const continueLabel = lastRead
    ? `${lastRead.book}, Chapter ${lastRead.chapter}`
    : 'I Nephi, Chapter 1';

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.title}>Book of Mormon</Text>
        <Text style={styles.subtitle}>Study Tools</Text>
      </View>

      {/* Reading Streak Card */}
      {progressStats.currentStreak > 0 && (
        <Pressable style={[styles.streakCard, { backgroundColor: colors.warning + '20' }]} onPress={handleProgressPress}>
          <Text style={styles.streakIcon}>🔥</Text>
          <View style={styles.streakContent}>
            <Text style={[styles.streakCount, { color: colors.warning }]}>
              {progressStats.currentStreak} day streak!
            </Text>
            <Text style={[styles.streakMessage, { color: colors.text }]}>
              {progressStats.currentStreak >= 7
                ? "Amazing dedication!"
                : progressStats.currentStreak >= 3
                ? "Keep it going!"
                : "Great start!"}
            </Text>
          </View>
        </Pressable>
      )}

      {/* Reading Progress Card */}
      {progressStats.totalChaptersRead > 0 && (
        <Pressable style={[styles.progressCard, { backgroundColor: colors.surface }]} onPress={handleProgressPress}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressPercent, { color: colors.primary }]}>
              {progressStats.percentComplete}%
            </Text>
            <Text style={[styles.progressLabel, { color: colors.text }]}>Complete</Text>
          </View>
          <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
            <View style={[styles.progressBarFill, { width: `${progressStats.percentComplete}%`, backgroundColor: colors.primary }]} />
          </View>
          <Text style={[styles.progressMessage, { color: colors.textSecondary }]}>
            {getProgressMessage(progressStats.percentComplete)}
          </Text>
        </Pressable>
      )}

      {/* Continue Reading Card */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>Continue Reading</Text>
        {loadingLastRead ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <>
            <Text style={[styles.cardSubtitle, { color: colors.text }]}>{continueLabel}</Text>
            <Pressable
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={handleContinueReading}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
            </Pressable>
          </>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>

        <Pressable
          style={[styles.actionCard, { backgroundColor: colors.surface }]}
          onPress={handleStartReading}
        >
          <Text style={styles.actionIcon}>📖</Text>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Browse Books</Text>
            <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
              {totalBooks} books, {totalChapters} chapters available
            </Text>
          </View>
          <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
        </Pressable>

        <Pressable
          style={[styles.actionCard, { backgroundColor: colors.surface }]}
          onPress={() => navigation.navigate('Search')}
        >
          <Text style={styles.actionIcon}>🔍</Text>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Search Scriptures</Text>
            <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
              {statsLoading ? 'Loading...' : `Search ${formatNumber(totalVerses)} verses`}
            </Text>
          </View>
          <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
        </Pressable>

        <Pressable
          style={[styles.actionCard, { backgroundColor: colors.surface }]}
          onPress={() => navigation.navigate('Progress')}
        >
          <Text style={styles.actionIcon}>📊</Text>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Reading Progress</Text>
            <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
              {progressStats.totalChaptersRead} of {progressStats.totalChapters} chapters
            </Text>
          </View>
          <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
        </Pressable>

        <Pressable
          style={[styles.actionCard, { backgroundColor: colors.surface }]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.actionIcon}>⚙️</Text>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Settings</Text>
            <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
              Customize your reading experience
            </Text>
          </View>
          <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
        </Pressable>
      </View>

      {/* Study Tools Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Study Tools</Text>

        <View style={styles.toolsGrid}>
          <Pressable
            style={[styles.toolCard, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate('Bookmarks')}
          >
            <Text style={styles.toolIcon}>🔖</Text>
            <Text style={[styles.toolLabel, { color: colors.text }]}>Bookmarks</Text>
            <Text style={[styles.toolCount, { color: colors.primary }]}>{bookmarks.length}</Text>
          </Pressable>

          <Pressable
            style={[styles.toolCard, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate('Notes')}
          >
            <Text style={styles.toolIcon}>📝</Text>
            <Text style={[styles.toolLabel, { color: colors.text }]}>Notes</Text>
            <Text style={[styles.toolCount, { color: colors.primary }]}>{notes.length}</Text>
          </Pressable>

          <Pressable
            style={[styles.toolCard, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate('StudyPlan')}
          >
            <Text style={styles.toolIcon}>📅</Text>
            <Text style={[styles.toolLabel, { color: colors.text }]}>Study Plan</Text>
            <Text style={[styles.toolCount, { color: colors.primary }]}>→</Text>
          </Pressable>

          <Pressable
            style={[styles.toolCard, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate('OfflineDownload')}
          >
            <Text style={styles.toolIcon}>📥</Text>
            <Text style={[styles.toolLabel, { color: colors.text }]}>Offline</Text>
            <Text style={[styles.toolCount, { color: offlinePercent === 100 ? colors.success : colors.primary }]}>
              {offlinePercent}%
            </Text>
          </Pressable>

          <Pressable
            style={[styles.toolCard, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate('WordStudy')}
          >
            <Text style={styles.toolIcon}>📚</Text>
            <Text style={[styles.toolLabel, { color: colors.text }]}>Word Study</Text>
            <Text style={[styles.toolCount, { color: colors.primary }]}>→</Text>
          </Pressable>

          <Pressable
            style={[styles.toolCard, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate('Memorization')}
          >
            <Text style={styles.toolIcon}>🧠</Text>
            <Text style={[styles.toolLabel, { color: colors.text }]}>Memorize</Text>
            <Text style={[styles.toolCount, { color: getMemorizationStats().dueForReview > 0 ? colors.warning : colors.primary }]}>
              {memorizationVerses.length > 0 ? memorizationVerses.length : '→'}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.toolCard, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate('Progress')}
          >
            <Text style={styles.toolIcon}>📊</Text>
            <Text style={[styles.toolLabel, { color: colors.text }]}>Progress</Text>
            <Text style={[styles.toolCount, { color: colors.primary }]}>→</Text>
          </Pressable>

          <Pressable
            style={[styles.toolCard, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate('ReadingGoals')}
          >
            <Text style={styles.toolIcon}>🎯</Text>
            <Text style={[styles.toolLabel, { color: colors.text }]}>Goals</Text>
            <Text style={[styles.toolCount, { color: activeGoals.length > 0 ? colors.success : colors.primary }]}>
              {activeGoals.length > 0 ? activeGoals.length : '→'}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.toolCard, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate('Courses')}
          >
            <Text style={styles.toolIcon}>🎓</Text>
            <Text style={[styles.toolLabel, { color: colors.text }]}>Courses</Text>
            <Text style={[styles.toolCount, { color: coursesInProgress.length > 0 ? colors.warning : colors.primary }]}>
              {coursesInProgress.length > 0 ? coursesInProgress.length : '→'}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.toolCard, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate('CoCCourses')}
          >
            <Text style={styles.toolIcon}>🏛️</Text>
            <Text style={[styles.toolLabel, { color: colors.text }]}>CoC Courses</Text>
            <Text style={[styles.toolCount, { color: colors.primary }]}>→</Text>
          </Pressable>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsSection}>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          {statsLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[styles.statNumber, { color: colors.primary }]}>{formatNumber(totalVerses)}</Text>
          )}
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Verses</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>{totalBooks}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Books</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>{totalChapters}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Chapters</Text>
        </View>
      </View>

      {/* Daily Verse */}
      <Pressable
        style={[styles.dailyVerseCard, { backgroundColor: colors.primary + '15', borderLeftColor: colors.primary }]}
        onPress={handleDailyVersePress}
      >
        <Text style={[styles.dailyVerseLabel, { color: colors.primary }]}>Verse of the Day</Text>
        {verseLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <>
            <Text style={[styles.dailyVerseText, { color: colors.text }]}>
              "{dailyVerse.text.length > 200
                ? dailyVerse.text.substring(0, 200) + '...'
                : dailyVerse.text}"
            </Text>
            <Text style={[styles.dailyVerseReference, { color: colors.primary }]}>
              {dailyVerse.reference}
            </Text>
          </>
        )}
      </Pressable>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

/**
 * Save last read position (to be called from ReaderScreen)
 */
export async function saveLastReadPosition(
  editionId: string,
  book: string,
  chapter: number
): Promise<void> {
  try {
    const position: LastReadPosition = {
      editionId,
      book,
      chapter,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(LAST_READ_KEY, JSON.stringify(position));
  } catch (error) {
    logger.scope('HomeScreen').error('Failed to save last read position:', error);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 12,
  },
  streakIcon: {
    fontSize: 36,
    marginRight: 12,
  },
  streakContent: {
    flex: 1,
  },
  streakCount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  streakMessage: {
    fontSize: 14,
    marginTop: 2,
  },
  progressCard: {
    margin: 16,
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  progressPercent: {
    fontSize: 32,
    fontWeight: 'bold',
    marginRight: 8,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressMessage: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.3,
  },
  card: {
    margin: 16,
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardSubtitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    lineHeight: 28,
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 40,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  actionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  chevron: {
    fontSize: 24,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  toolCard: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  toolIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  toolLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  toolCount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 16,
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
  },
  dailyVerseCard: {
    margin: 16,
    marginTop: 8,
    padding: 24,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  dailyVerseLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 1,
  },
  dailyVerseText: {
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 26,
    marginBottom: 12,
    fontFamily: 'serif',
  },
  dailyVerseReference: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    letterSpacing: 0.3,
  },
  bottomPadding: {
    height: 40,
  },
});
