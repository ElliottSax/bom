/**
 * Offline Download Screen
 *
 * Manage offline scripture downloads
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useOfflineDownload } from '../hooks/useOfflineDownload';
import { getAllBooks } from '../hooks/useBookInfo';

export function OfflineDownloadScreen() {
  const { colors } = useTheme();
  const {
    downloadStatus,
    progress,
    isDownloading,
    downloadBook,
    downloadAllBooks,
    pauseDownload,
    resumeDownload,
    cancelDownload,
    deleteAllDownloads,
    checkDownloadStatus,
    getTotalDownloadSize,
  } = useOfflineDownload();

  const books = getAllBooks();
  const downloadSize = getTotalDownloadSize();

  // Check download status on mount
  useEffect(() => {
    checkDownloadStatus();
  }, []);

  const handleDownloadAll = () => {
    Alert.alert(
      'Download All Books',
      `This will download all ${downloadSize.chapters} chapters (~${downloadSize.estimatedMB} MB). Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Download', onPress: downloadAllBooks },
      ]
    );
  };

  const handleDeleteAll = () => {
    Alert.alert(
      'Delete All Downloads',
      'This will remove all downloaded scriptures. You will need an internet connection to read them again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: deleteAllDownloads,
        },
      ]
    );
  };

  const handleDownloadBook = (bookName: string) => {
    const status = downloadStatus[bookName];
    if (status?.isComplete) {
      Alert.alert('Already Downloaded', `${bookName} is already available offline.`);
      return;
    }
    downloadBook(bookName);
  };

  // Calculate overall progress
  const totalChapters = books.reduce((sum, b) => sum + b.chapters, 0);
  const downloadedChapters = Object.values(downloadStatus).reduce(
    (sum, s) => sum + (s.downloadedChapters || 0),
    0
  );
  const overallPercent = totalChapters > 0
    ? Math.round((downloadedChapters / totalChapters) * 100)
    : 0;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Stats */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Offline Reading</Text>
        <Text style={styles.headerSubtitle}>
          Download scriptures to read without internet
        </Text>

        <View style={styles.overallProgress}>
          <Text style={styles.overallPercent}>{overallPercent}%</Text>
          <Text style={styles.overallLabel}>Downloaded</Text>
        </View>

        <View style={styles.progressBarContainer}>
          <View
            style={[styles.progressBar, { width: `${overallPercent}%` }]}
          />
        </View>

        <Text style={styles.chapterCount}>
          {downloadedChapters} of {totalChapters} chapters
        </Text>
      </View>

      {/* Download Progress (when active) */}
      {isDownloading && (
        <View style={[styles.activeDownload, { backgroundColor: colors.surface }]}>
          <View style={styles.activeHeader}>
            <Text style={[styles.activeTitle, { color: colors.text }]}>
              Downloading...
            </Text>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>

          <Text style={[styles.activeBook, { color: colors.primary }]}>
            {progress.currentBook} {progress.currentChapter}
          </Text>

          <View style={[styles.activeProgressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.activeProgressFill,
                {
                  width: `${progress.percentComplete}%`,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>

          <Text style={[styles.activeStats, { color: colors.textSecondary }]}>
            {progress.completedChapters} of {progress.totalChapters} chapters
          </Text>

          {progress.error && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {progress.error}
            </Text>
          )}

          <View style={styles.activeActions}>
            {progress.isPaused ? (
              <Pressable
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                onPress={resumeDownload}
              >
                <Text style={styles.actionButtonText}>Resume</Text>
              </Pressable>
            ) : (
              <Pressable
                style={[styles.actionButton, { backgroundColor: colors.warning }]}
                onPress={pauseDownload}
              >
                <Text style={styles.actionButtonText}>Pause</Text>
              </Pressable>
            )}
            <Pressable
              style={[styles.actionButton, { backgroundColor: colors.error }]}
              onPress={cancelDownload}
            >
              <Text style={styles.actionButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Quick Actions */}
      {!isDownloading && (
        <View style={styles.quickActions}>
          <Pressable
            style={[styles.downloadAllButton, { backgroundColor: colors.primary }]}
            onPress={handleDownloadAll}
          >
            <Text style={styles.downloadAllText}>Download All Books</Text>
            <Text style={styles.downloadAllSubtext}>
              ~{downloadSize.estimatedMB} MB
            </Text>
          </Pressable>

          {downloadedChapters > 0 && (
            <Pressable
              style={[styles.deleteAllButton, { backgroundColor: colors.error + '15' }]}
              onPress={handleDeleteAll}
            >
              <Text style={[styles.deleteAllText, { color: colors.error }]}>
                Delete All Downloads
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Book List */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Books
        </Text>

        {books.map((book) => {
          const status = downloadStatus[book.name];
          const isComplete = status?.isComplete || false;
          const downloaded = status?.downloadedChapters || 0;
          const percent = book.chapters > 0
            ? Math.round((downloaded / book.chapters) * 100)
            : 0;
          const isBookDownloading = status?.isDownloading || false;

          return (
            <Pressable
              key={book.name}
              style={[styles.bookItem, { backgroundColor: colors.surface }]}
              onPress={() => handleDownloadBook(book.name)}
              disabled={isDownloading}
            >
              <View style={styles.bookInfo}>
                <View style={styles.bookHeader}>
                  <Text style={[styles.bookName, { color: colors.text }]}>
                    {isComplete && '✓ '}{book.name}
                  </Text>
                  {isBookDownloading && (
                    <ActivityIndicator size="small" color={colors.primary} />
                  )}
                </View>
                <Text style={[styles.bookChapters, { color: colors.textSecondary }]}>
                  {downloaded}/{book.chapters} chapters
                </Text>
              </View>

              <View style={styles.bookProgress}>
                {isComplete ? (
                  <View style={[styles.completeBadge, { backgroundColor: colors.success + '20' }]}>
                    <Text style={[styles.completeBadgeText, { color: colors.success }]}>
                      Offline
                    </Text>
                  </View>
                ) : (
                  <>
                    <View style={[styles.bookProgressBar, { backgroundColor: colors.border }]}>
                      <View
                        style={[
                          styles.bookProgressFill,
                          {
                            width: `${percent}%`,
                            backgroundColor: colors.primary,
                          },
                        ]}
                      />
                    </View>
                    {!isDownloading && (
                      <Text style={[styles.downloadIcon, { color: colors.primary }]}>
                        ↓
                      </Text>
                    )}
                  </>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Info */}
      <View style={styles.infoSection}>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          Downloaded chapters are stored locally and available without internet.
          Downloads may take several minutes depending on your connection.
        </Text>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 24,
  },
  overallProgress: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  overallPercent: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  overallLabel: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    marginLeft: 8,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 4,
  },
  chapterCount: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
  },
  activeDownload: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activeTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  activeBook: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  activeProgressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  activeProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  activeStats: {
    fontSize: 14,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 12,
  },
  activeActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  quickActions: {
    padding: 16,
    gap: 12,
  },
  downloadAllButton: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  downloadAllText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  downloadAllSubtext: {
    color: '#ffffff',
    opacity: 0.8,
    fontSize: 14,
  },
  deleteAllButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteAllText: {
    fontSize: 16,
    fontWeight: '600',
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    marginBottom: 8,
  },
  bookInfo: {
    flex: 1,
  },
  bookHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  bookChapters: {
    fontSize: 12,
  },
  bookProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 100,
  },
  bookProgressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  bookProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  completeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  completeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  downloadIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoSection: {
    padding: 16,
    paddingTop: 0,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 40,
  },
});
