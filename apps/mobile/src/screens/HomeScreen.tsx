/**
 * Home Screen
 *
 * Main landing screen with "Continue Reading" and quick access
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export function HomeScreen() {
  const navigation = useNavigation();

  const handleContinueReading = () => {
    // Future: Get last read position from storage
    // For now, go to I Nephi 1
    navigation.navigate('Read', {
      screen: 'Reader',
      params: {
        editionId: 'coc-bom-1908',
        book: 'I Nephi',
        chapter: 1,
      },
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Book of Mormon</Text>
        <Text style={styles.subtitle}>Study Tools</Text>
      </View>

      {/* Continue Reading Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Continue Reading</Text>
        <Text style={styles.cardSubtitle}>I Nephi, Chapter 1</Text>
        <Pressable
          style={styles.primaryButton}
          onPress={handleContinueReading}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
        </Pressable>
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
              15 books, 119 chapters available
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
              Search 8,701 verses
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        <Pressable
          style={styles.actionCard}
          onPress={() => {}}
        >
          <Text style={styles.actionIcon}>📥</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Download for Offline</Text>
            <Text style={styles.actionSubtitle}>
              Coming soon
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      </View>

      {/* Stats */}
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>8,701</Text>
          <Text style={styles.statLabel}>Verses</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>15</Text>
          <Text style={styles.statLabel}>Books</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>119</Text>
          <Text style={styles.statLabel}>Chapters</Text>
        </View>
      </View>
    </ScrollView>
  );
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
});
