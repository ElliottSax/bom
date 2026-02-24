/**
 * Data Backup Hook
 *
 * Export and import user data (bookmarks, notes, highlights, reading progress)
 */

import { useState, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNFS from 'react-native-fs';
import Share from 'react-native-share';
import DocumentPicker from 'react-native-document-picker';
import { logger } from '../utils/logger';

const log = logger.scope('DataBackup');

// Storage keys for user data
const STORAGE_KEYS = {
  bookmarks: '@bom_bookmarks',
  highlights: '@bom_highlights',
  notes: '@bom_notes',
  readingProgress: '@bom_reading_progress',
  studyPlan: '@bom_study_plan',
  settings: '@bom_settings',
  lastRead: '@bom_last_read',
  recentSearches: '@bom_recent_searches',
};

export interface BackupData {
  version: number;
  exportedAt: string;
  data: {
    bookmarks: Record<string, unknown>[];
    highlights: Record<string, unknown>[];
    notes: Record<string, unknown>[];
    readingProgress: Record<string, unknown>;
    studyPlan: Record<string, unknown> | null;
    settings: Record<string, unknown>;
    lastRead: Record<string, unknown> | null;
    recentSearches: string[];
  };
}

export interface BackupStats {
  bookmarks: number;
  highlights: number;
  notes: number;
  chaptersRead: number;
}

export function useDataBackup() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current backup stats
  const getBackupStats = useCallback(async (): Promise<BackupStats> => {
    try {
      const [bookmarksJson, highlightsJson, notesJson, progressJson] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.bookmarks),
        AsyncStorage.getItem(STORAGE_KEYS.highlights),
        AsyncStorage.getItem(STORAGE_KEYS.notes),
        AsyncStorage.getItem(STORAGE_KEYS.readingProgress),
      ]);

      const bookmarks = bookmarksJson ? JSON.parse(bookmarksJson) : [];
      const highlights = highlightsJson ? JSON.parse(highlightsJson) : [];
      const notes = notesJson ? JSON.parse(notesJson) : [];
      const progress = progressJson ? JSON.parse(progressJson) : { completedChapters: [] };

      return {
        bookmarks: bookmarks.length,
        highlights: highlights.length,
        notes: notes.length,
        chaptersRead: progress.completedChapters?.length || 0,
      };
    } catch (err) {
      log.error('Failed to get backup stats', err);
      return { bookmarks: 0, highlights: 0, notes: 0, chaptersRead: 0 };
    }
  }, []);

  // Export all user data to a JSON file
  const exportData = useCallback(async (): Promise<boolean> => {
    setExporting(true);
    setError(null);

    try {
      // Gather all data
      const [
        bookmarksJson,
        highlightsJson,
        notesJson,
        progressJson,
        studyPlanJson,
        settingsJson,
        lastReadJson,
        recentSearchesJson,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.bookmarks),
        AsyncStorage.getItem(STORAGE_KEYS.highlights),
        AsyncStorage.getItem(STORAGE_KEYS.notes),
        AsyncStorage.getItem(STORAGE_KEYS.readingProgress),
        AsyncStorage.getItem(STORAGE_KEYS.studyPlan),
        AsyncStorage.getItem(STORAGE_KEYS.settings),
        AsyncStorage.getItem(STORAGE_KEYS.lastRead),
        AsyncStorage.getItem(STORAGE_KEYS.recentSearches),
      ]);

      const backupData: BackupData = {
        version: 1,
        exportedAt: new Date().toISOString(),
        data: {
          bookmarks: bookmarksJson ? JSON.parse(bookmarksJson) : [],
          highlights: highlightsJson ? JSON.parse(highlightsJson) : [],
          notes: notesJson ? JSON.parse(notesJson) : [],
          readingProgress: progressJson ? JSON.parse(progressJson) : null,
          studyPlan: studyPlanJson ? JSON.parse(studyPlanJson) : null,
          settings: settingsJson ? JSON.parse(settingsJson) : null,
          lastRead: lastReadJson ? JSON.parse(lastReadJson) : null,
          recentSearches: recentSearchesJson ? JSON.parse(recentSearchesJson) : [],
        },
      };

      // Create filename with date
      const date = new Date().toISOString().split('T')[0];
      const filename = `bom-backup-${date}.json`;
      const filePath = `${RNFS.DocumentDirectoryPath}/${filename}`;

      // Write to file
      await RNFS.writeFile(filePath, JSON.stringify(backupData, null, 2), 'utf8');

      // Share the file
      await Share.open({
        url: Platform.OS === 'android' ? `file://${filePath}` : filePath,
        type: 'application/json',
        title: 'Export BOM Study Data',
      });

      setExporting(false);
      return true;
    } catch (err) {
      // User cancelled share is not an error
      if (err instanceof Error && err.message?.includes('User did not share')) {
        setExporting(false);
        return true;
      }
      log.error('Export failed', err);
      setError('Failed to export data. Please try again.');
      setExporting(false);
      return false;
    }
  }, []);

  // Import data from a JSON file
  const importData = useCallback(async (merge: boolean = false): Promise<boolean> => {
    setImporting(true);
    setError(null);

    try {
      // Pick a document
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.json, DocumentPicker.types.allFiles],
      });

      if (!result || result.length === 0) {
        setImporting(false);
        return false;
      }

      const fileUri = result[0].uri;

      // Validate file size (max 10MB to prevent memory issues)
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      const stats = await RNFS.stat(fileUri);

      if (stats.size > MAX_FILE_SIZE) {
        throw new Error('File is too large. Maximum file size is 10MB.');
      }

      // Read file content
      const content = await RNFS.readFile(fileUri, 'utf8');
      const backupData: BackupData = JSON.parse(content);

      // Validate backup format
      if (!backupData.version || !backupData.data) {
        throw new Error('Invalid backup file format');
      }

      // Import data
      if (merge) {
        // Merge with existing data
        await mergeData(backupData.data);
      } else {
        // Replace all data
        await replaceData(backupData.data);
      }

      setImporting(false);
      return true;
    } catch (err) {
      log.error('Import failed', err);
      setError('Failed to import data. Make sure you selected a valid backup file.');
      setImporting(false);
      return false;
    }
  }, []);

  // Merge imported data with existing data
  const mergeData = async (data: BackupData['data']) => {
    // Bookmarks - merge by verseId
    const existingBookmarks = JSON.parse(
      (await AsyncStorage.getItem(STORAGE_KEYS.bookmarks)) || '[]'
    );
    const mergedBookmarks = mergeByKey(existingBookmarks, data.bookmarks, 'verseId');
    await AsyncStorage.setItem(STORAGE_KEYS.bookmarks, JSON.stringify(mergedBookmarks));

    // Highlights - merge by verseId
    const existingHighlights = JSON.parse(
      (await AsyncStorage.getItem(STORAGE_KEYS.highlights)) || '[]'
    );
    const mergedHighlights = mergeByKey(existingHighlights, data.highlights, 'verseId');
    await AsyncStorage.setItem(STORAGE_KEYS.highlights, JSON.stringify(mergedHighlights));

    // Notes - merge by verseId
    const existingNotes = JSON.parse(
      (await AsyncStorage.getItem(STORAGE_KEYS.notes)) || '[]'
    );
    const mergedNotes = mergeByKey(existingNotes, data.notes, 'verseId');
    await AsyncStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(mergedNotes));

    // Reading progress - merge completed chapters
    if (data.readingProgress) {
      const existingProgress = JSON.parse(
        (await AsyncStorage.getItem(STORAGE_KEYS.readingProgress)) || '{}'
      );
      const mergedChapters = Array.from(
        new Set([
          ...(existingProgress.completedChapters || []),
          ...(data.readingProgress.completedChapters || []),
        ])
      );
      await AsyncStorage.setItem(
        STORAGE_KEYS.readingProgress,
        JSON.stringify({
          ...existingProgress,
          ...data.readingProgress,
          completedChapters: mergedChapters,
        })
      );
    }

    // Recent searches - merge and dedupe
    if (data.recentSearches) {
      const existingSearches = JSON.parse(
        (await AsyncStorage.getItem(STORAGE_KEYS.recentSearches)) || '[]'
      );
      const mergedSearches = Array.from(new Set([...existingSearches, ...data.recentSearches])).slice(0, 20);
      await AsyncStorage.setItem(STORAGE_KEYS.recentSearches, JSON.stringify(mergedSearches));
    }
  };

  // Replace all data with imported data
  const replaceData = async (data: BackupData['data']) => {
    const updates: [string, string][] = [];

    if (data.bookmarks) {
      updates.push([STORAGE_KEYS.bookmarks, JSON.stringify(data.bookmarks)]);
    }
    if (data.highlights) {
      updates.push([STORAGE_KEYS.highlights, JSON.stringify(data.highlights)]);
    }
    if (data.notes) {
      updates.push([STORAGE_KEYS.notes, JSON.stringify(data.notes)]);
    }
    if (data.readingProgress) {
      updates.push([STORAGE_KEYS.readingProgress, JSON.stringify(data.readingProgress)]);
    }
    if (data.studyPlan) {
      updates.push([STORAGE_KEYS.studyPlan, JSON.stringify(data.studyPlan)]);
    }
    if (data.settings) {
      updates.push([STORAGE_KEYS.settings, JSON.stringify(data.settings)]);
    }
    if (data.lastRead) {
      updates.push([STORAGE_KEYS.lastRead, JSON.stringify(data.lastRead)]);
    }
    if (data.recentSearches) {
      updates.push([STORAGE_KEYS.recentSearches, JSON.stringify(data.recentSearches)]);
    }

    await AsyncStorage.multiSet(updates);
  };

  // Helper to merge arrays by a key
  const mergeByKey = <T extends Record<string, any>>(
    existing: T[],
    incoming: T[],
    key: string
  ): T[] => {
    const map = new Map<string, T>();
    existing.forEach((item) => map.set(item[key], item));
    incoming.forEach((item) => {
      // Incoming items override existing
      map.set(item[key], item);
    });
    return Array.from(map.values());
  };

  // Clear all user data
  const clearAllData = useCallback(async (): Promise<boolean> => {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
      return true;
    } catch (err) {
      log.error('Failed to clear data', err);
      setError('Failed to clear data.');
      return false;
    }
  }, []);

  return {
    exporting,
    importing,
    error,
    getBackupStats,
    exportData,
    importData,
    clearAllData,
  };
}
