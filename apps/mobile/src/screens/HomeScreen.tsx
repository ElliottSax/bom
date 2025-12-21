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

const LAST_READ_KEY = '@bom_last_read';

interface LastReadPosition {
  editionId: string;
  book: string;
  chapter: number;
  timestamp: number;
}

export function HomeScreen() {
  const navigation = useNavigation();
  const { totalVerses, totalBooks, totalChapters, loading: statsLoading } = useStats();
  const [lastRead, setLastRead] = useState<LastReadPosition | null>(null);
  const [loadingLastRead, setLoadingLastRead] = useState(true);

  // Load last read position on mount
  useEffect(() => {
    async function loadLastRead() {
      try {
        const stored = await AsyncStorage.getItem(LAST_READ_KEY);
        if (stored) {
          setLastRead(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load last read position:', error);
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

  const continueLabel = lastRead
    ? `${lastRead.book}, Chapter ${lastRead.chapter}`
    : 'I Nephi, Chapter 1';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Book of Mormon</Text>
        <Text style={styles.subtitle}>Study Tools</Text>
      </View>

      {/* Continue Reading Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Continue Reading</Text>
        {loadingLastRead ? (
          <ActivityIndicator size="small" color="#0066cc" />
        ) : (
          <>
            <Text style={styles.cardSubtitle}>{continueLabel}</Text>
            <Pressable
              style={styles.primaryButton}
              onPress={handleContinueReading}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
            </Pressable>
          </>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <Pressable
          style={styles.actionCard}
          onPress={handleStartReading}
        >
          <Text style={styles.actionIcon}>📖</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Browse Books</Text>
            <Text style={styles.actionSubtitle}>
              {totalBooks} books, {totalChapters} chapters available
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        <Pressable
          style={styles.actionCard}
          onPress={() => navigation.navigate('Search')}
        >
          <Text style={styles.actionIcon}>🔍</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Search Scriptures</Text>
            <Text style={styles.actionSubtitle}>
              {statsLoading ? 'Loading...' : `Search ${formatNumber(totalVerses)} verses`}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        <Pressable
          style={styles.actionCard}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.actionIcon}>⚙️</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Settings</Text>
            <Text style={styles.actionSubtitle}>
              Customize your reading experience
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      </View>

      {/* Stats */}
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          {statsLoading ? (
            <ActivityIndicator size="small" color="#0066cc" />
          ) : (
            <Text style={styles.statNumber}>{formatNumber(totalVerses)}</Text>
          )}
          <Text style={styles.statLabel}>Verses</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalBooks}</Text>
          <Text style={styles.statLabel}>Books</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalChapters}</Text>
          <Text style={styles.statLabel}>Chapters</Text>
        </View>
      </View>

      {/* Daily Verse */}
      <View style={styles.dailyVerseCard}>
        <Text style={styles.dailyVerseLabel}>Featured Verse</Text>
        <Text style={styles.dailyVerseText}>
          "And now, as ye are desirous to come into the fold of God, and to be called his people,
          and are willing to bear one another's burdens, that they may be light..."
        </Text>
        <Text style={styles.dailyVerseReference}>Mosiah 18:8</Text>
      </View>
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
    console.error('Failed to save last read position:', error);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 24,
    backgroundColor: '#0066cc',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#e3f2fd',
  },
  card: {
    margin: 16,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  cardSubtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#0066cc',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
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
    color: '#333333',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  chevron: {
    fontSize: 24,
    color: '#999999',
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
    backgroundColor: '#ffffff',
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
    color: '#0066cc',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textTransform: 'uppercase',
  },
  dailyVerseCard: {
    margin: 16,
    marginTop: 8,
    padding: 20,
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0066cc',
  },
  dailyVerseLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0066cc',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  dailyVerseText: {
    fontSize: 16,
    color: '#333333',
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: 8,
  },
  dailyVerseReference: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066cc',
    textAlign: 'right',
  },
});
