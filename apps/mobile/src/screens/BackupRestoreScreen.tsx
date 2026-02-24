/**
 * Backup & Restore Screen
 *
 * Export and import user data (bookmarks, notes, highlights, progress)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useDataBackup, BackupStats } from '../hooks/useDataBackup';
import type { ThemeColors } from '../types';

export function BackupRestoreScreen() {
  const { colors } = useTheme();
  const {
    exporting,
    importing,
    error,
    getBackupStats,
    exportData,
    importData,
    clearAllData,
  } = useDataBackup();

  const [stats, setStats] = useState<BackupStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load stats on mount
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setRefreshing(true);
    const backupStats = await getBackupStats();
    setStats(backupStats);
    setRefreshing(false);
  };

  const handleExport = async () => {
    const success = await exportData();
    if (success) {
      Alert.alert('Success', 'Your data has been exported successfully.');
    }
  };

  const handleImport = (merge: boolean) => {
    Alert.alert(
      merge ? 'Merge Data' : 'Replace Data',
      merge
        ? 'This will add imported data to your existing data. Conflicts will use the imported version.'
        : 'This will replace all your current data with the imported data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: merge ? 'Merge' : 'Replace',
          style: merge ? 'default' : 'destructive',
          onPress: async () => {
            const success = await importData(merge);
            if (success) {
              Alert.alert('Success', 'Data imported successfully.');
              loadStats();
            }
          },
        },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your bookmarks, notes, highlights, and reading progress. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            const success = await clearAllData();
            if (success) {
              Alert.alert('Data Cleared', 'All user data has been removed.');
              loadStats();
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Backup & Restore</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Export your data to keep it safe or transfer to another device
        </Text>
      </View>

      {/* Current Data Stats */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Your Data</Text>
        {refreshing ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : stats ? (
          <View style={styles.statsGrid}>
            <StatItem
              label="Bookmarks"
              value={stats.bookmarks}
              icon="🔖"
              colors={colors}
            />
            <StatItem
              label="Highlights"
              value={stats.highlights}
              icon="🖍️"
              colors={colors}
            />
            <StatItem
              label="Notes"
              value={stats.notes}
              icon="📝"
              colors={colors}
            />
            <StatItem
              label="Chapters Read"
              value={stats.chaptersRead}
              icon="✓"
              colors={colors}
            />
          </View>
        ) : null}
        <Pressable
          style={styles.refreshButton}
          onPress={loadStats}
          disabled={refreshing}
        >
          <Text style={[styles.refreshText, { color: colors.primary }]}>
            Refresh Stats
          </Text>
        </Pressable>
      </View>

      {/* Export Section */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Export</Text>
        <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
          Save all your data to a JSON file that you can store safely or transfer to another device.
        </Text>
        <Pressable
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleExport}
          disabled={exporting}
        >
          {exporting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Text style={styles.buttonIcon}>📤</Text>
              <Text style={styles.buttonText}>Export Data</Text>
            </>
          )}
        </Pressable>
      </View>

      {/* Import Section */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Import</Text>
        <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
          Restore data from a previously exported backup file.
        </Text>

        <Pressable
          style={[styles.button, { backgroundColor: colors.success }]}
          onPress={() => handleImport(true)}
          disabled={importing}
        >
          {importing ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Text style={styles.buttonIcon}>🔄</Text>
              <Text style={styles.buttonText}>Import & Merge</Text>
            </>
          )}
        </Pressable>
        <Text style={[styles.buttonHint, { color: colors.textSecondary }]}>
          Adds imported data to existing data
        </Text>

        <Pressable
          style={[styles.button, styles.buttonOutline, { borderColor: colors.warning }]}
          onPress={() => handleImport(false)}
          disabled={importing}
        >
          <Text style={styles.buttonIcon}>📥</Text>
          <Text style={[styles.buttonTextOutline, { color: colors.warning }]}>
            Import & Replace
          </Text>
        </Pressable>
        <Text style={[styles.buttonHint, { color: colors.textSecondary }]}>
          Replaces all existing data
        </Text>
      </View>

      {/* Danger Zone */}
      <View style={[styles.card, styles.dangerCard, { backgroundColor: colors.error + '10' }]}>
        <Text style={[styles.cardTitle, { color: colors.error }]}>Danger Zone</Text>
        <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
          Permanently delete all your data. Make sure to export a backup first!
        </Text>
        <Pressable
          style={[styles.button, { backgroundColor: colors.error }]}
          onPress={handleClearData}
        >
          <Text style={styles.buttonIcon}>🗑️</Text>
          <Text style={styles.buttonText}>Clear All Data</Text>
        </Pressable>
      </View>

      {/* Error Display */}
      {error && (
        <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        </View>
      )}

      {/* Info Section */}
      <View style={styles.infoSection}>
        <Text style={[styles.infoTitle, { color: colors.textSecondary }]}>
          What's included in backup:
        </Text>
        <Text style={[styles.infoItem, { color: colors.textSecondary }]}>
          • Bookmarks
        </Text>
        <Text style={[styles.infoItem, { color: colors.textSecondary }]}>
          • Verse highlights
        </Text>
        <Text style={[styles.infoItem, { color: colors.textSecondary }]}>
          • Notes
        </Text>
        <Text style={[styles.infoItem, { color: colors.textSecondary }]}>
          • Reading progress & streaks
        </Text>
        <Text style={[styles.infoItem, { color: colors.textSecondary }]}>
          • Study plan progress
        </Text>
        <Text style={[styles.infoItem, { color: colors.textSecondary }]}>
          • App settings
        </Text>
        <Text style={[styles.infoItem, { color: colors.textSecondary }]}>
          • Recent searches
        </Text>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

// Stat Item Component
interface StatItemProps {
  label: string;
  value: number;
  icon: string;
  colors: ThemeColors;
}

function StatItem({ label, value, icon, colors }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    margin: 16,
    marginTop: 8,
    padding: 20,
    borderRadius: 16,
  },
  dangerCard: {
    marginTop: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 13,
    marginTop: 2,
  },
  refreshButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  refreshText: {
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 8,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  buttonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextOutline: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonHint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 8,
  },
  errorContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  infoSection: {
    padding: 20,
    paddingTop: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoItem: {
    fontSize: 13,
    lineHeight: 22,
  },
  bottomSpacer: {
    height: 40,
  },
});
