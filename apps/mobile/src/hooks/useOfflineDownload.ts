/**
 * Offline Download Hook
 *
 * Manages downloading scripture books for offline reading
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApolloClient, gql } from '@apollo/client';
import { getAllBooks, getChapterCount } from './useBookInfo';
import {
  cacheChapter,
  isChapterCached,
  getCacheStats,
  clearCache,
} from '../services/offlineStorage';
import { logger } from '../utils/logger';

const log = logger.scope('OfflineDownload');

const DOWNLOAD_STATUS_KEY = '@bom_download_status';

// GraphQL query for fetching verses
const GET_CHAPTER = gql`
  query GetChapter($editionId: ID!, $book: String!, $chapter: Int!) {
    verses(editionId: $editionId, book: $book, chapter: $chapter) {
      id
      verse
      text
      verseType
      book
      chapter
    }
  }
`;

export interface BookDownloadStatus {
  book: string;
  totalChapters: number;
  downloadedChapters: number;
  isComplete: boolean;
  isDownloading: boolean;
  lastUpdated: number;
}

export interface DownloadProgress {
  currentBook: string;
  currentChapter: number;
  totalBooks: number;
  completedBooks: number;
  totalChapters: number;
  completedChapters: number;
  percentComplete: number;
  isDownloading: boolean;
  isPaused: boolean;
  error: string | null;
}

interface DownloadStatusMap {
  [book: string]: BookDownloadStatus;
}

interface UseOfflineDownloadResult {
  downloadStatus: DownloadStatusMap;
  progress: DownloadProgress;
  isDownloading: boolean;
  downloadBook: (book: string) => Promise<void>;
  downloadAllBooks: () => Promise<void>;
  pauseDownload: () => void;
  resumeDownload: () => void;
  cancelDownload: () => void;
  deleteBookDownload: (book: string) => Promise<void>;
  deleteAllDownloads: () => Promise<void>;
  checkDownloadStatus: () => Promise<void>;
  getBookDownloadStatus: (book: string) => BookDownloadStatus | null;
  getTotalDownloadSize: () => { chapters: number; estimatedMB: number };
}

const EDITION_ID = 'coc-bom-1908';

export function useOfflineDownload(): UseOfflineDownloadResult {
  const client = useApolloClient();
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatusMap>({});
  const [progress, setProgress] = useState<DownloadProgress>({
    currentBook: '',
    currentChapter: 0,
    totalBooks: 0,
    completedBooks: 0,
    totalChapters: 0,
    completedChapters: 0,
    percentComplete: 0,
    isDownloading: false,
    isPaused: false,
    error: null,
  });

  const isDownloadingRef = useRef(false);
  const isPausedRef = useRef(false);
  const shouldCancelRef = useRef(false);

  // Load saved download status on mount
  useEffect(() => {
    loadDownloadStatus();
  }, []);

  const loadDownloadStatus = async () => {
    try {
      const saved = await AsyncStorage.getItem(DOWNLOAD_STATUS_KEY);
      if (saved) {
        setDownloadStatus(JSON.parse(saved));
      }
    } catch (error) {
      log.error('Failed to load download status', error);
    }
  };

  const saveDownloadStatus = async (status: DownloadStatusMap) => {
    try {
      await AsyncStorage.setItem(DOWNLOAD_STATUS_KEY, JSON.stringify(status));
    } catch (error) {
      log.error('Failed to save download status', error);
    }
  };

  const checkDownloadStatus = useCallback(async () => {
    const books = getAllBooks();
    const status: DownloadStatusMap = {};

    for (const book of books) {
      let downloadedChapters = 0;

      for (let ch = 1; ch <= book.chapters; ch++) {
        const isCached = await isChapterCached(EDITION_ID, book.name, ch);
        if (isCached) {
          downloadedChapters++;
        }
      }

      status[book.name] = {
        book: book.name,
        totalChapters: book.chapters,
        downloadedChapters,
        isComplete: downloadedChapters === book.chapters,
        isDownloading: false,
        lastUpdated: Date.now(),
      };
    }

    setDownloadStatus(status);
    await saveDownloadStatus(status);
  }, []);

  const downloadChapter = async (book: string, chapter: number): Promise<boolean> => {
    try {
      const { data } = await client.query({
        query: GET_CHAPTER,
        variables: { editionId: EDITION_ID, book, chapter },
        fetchPolicy: 'network-only',
      });

      if (data?.verses) {
        await cacheChapter(EDITION_ID, book, chapter, data.verses);
        return true;
      }
      return false;
    } catch (error) {
      log.error(`Failed to download ${book} ${chapter}`, error);
      return false;
    }
  };

  const downloadBook = useCallback(async (bookName: string) => {
    if (isDownloadingRef.current) {
      log.warn('Download already in progress');
      return;
    }

    const totalChapters = getChapterCount(bookName);
    if (totalChapters === 0) {
      log.error(`Book not found: ${bookName}`);
      return;
    }

    isDownloadingRef.current = true;
    isPausedRef.current = false;
    shouldCancelRef.current = false;

    setProgress((prev) => ({
      ...prev,
      currentBook: bookName,
      currentChapter: 0,
      totalBooks: 1,
      completedBooks: 0,
      totalChapters,
      completedChapters: 0,
      percentComplete: 0,
      isDownloading: true,
      isPaused: false,
      error: null,
    }));

    // Update status to show downloading
    setDownloadStatus((prev) => ({
      ...prev,
      [bookName]: {
        ...prev[bookName],
        book: bookName,
        totalChapters,
        isDownloading: true,
        lastUpdated: Date.now(),
      },
    }));

    let completedChapters = 0;

    for (let ch = 1; ch <= totalChapters; ch++) {
      // Check for pause or cancel
      while (isPausedRef.current && !shouldCancelRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      if (shouldCancelRef.current) {
        break;
      }

      setProgress((prev) => ({
        ...prev,
        currentChapter: ch,
      }));

      // Check if already cached
      const isCached = await isChapterCached(EDITION_ID, bookName, ch);
      if (!isCached) {
        const success = await downloadChapter(bookName, ch);
        if (!success) {
          setProgress((prev) => ({
            ...prev,
            error: `Failed to download ${bookName} ${ch}`,
          }));
        }
      }

      completedChapters++;
      const percent = Math.round((completedChapters / totalChapters) * 100);

      setProgress((prev) => ({
        ...prev,
        completedChapters,
        percentComplete: percent,
      }));

      // Small delay to not overwhelm the server
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const isComplete = completedChapters === totalChapters && !shouldCancelRef.current;

    // Update final status
    setDownloadStatus((prev) => {
      const updated = {
        ...prev,
        [bookName]: {
          book: bookName,
          totalChapters,
          downloadedChapters: completedChapters,
          isComplete,
          isDownloading: false,
          lastUpdated: Date.now(),
        },
      };
      saveDownloadStatus(updated);
      return updated;
    });

    setProgress((prev) => ({
      ...prev,
      completedBooks: isComplete ? 1 : 0,
      isDownloading: false,
    }));

    isDownloadingRef.current = false;
  }, [client]);

  const downloadAllBooks = useCallback(async () => {
    if (isDownloadingRef.current) {
      log.warn('Download already in progress');
      return;
    }

    const books = getAllBooks();
    const totalBooks = books.length;
    const totalChapters = books.reduce((sum, b) => sum + b.chapters, 0);

    isDownloadingRef.current = true;
    isPausedRef.current = false;
    shouldCancelRef.current = false;

    setProgress({
      currentBook: '',
      currentChapter: 0,
      totalBooks,
      completedBooks: 0,
      totalChapters,
      completedChapters: 0,
      percentComplete: 0,
      isDownloading: true,
      isPaused: false,
      error: null,
    });

    let globalCompletedChapters = 0;
    let completedBooks = 0;

    for (const book of books) {
      if (shouldCancelRef.current) break;

      setProgress((prev) => ({
        ...prev,
        currentBook: book.name,
        currentChapter: 0,
      }));

      // Update status to show downloading
      setDownloadStatus((prev) => ({
        ...prev,
        [book.name]: {
          ...prev[book.name],
          book: book.name,
          totalChapters: book.chapters,
          isDownloading: true,
          lastUpdated: Date.now(),
        },
      }));

      let bookCompletedChapters = 0;

      for (let ch = 1; ch <= book.chapters; ch++) {
        // Check for pause or cancel
        while (isPausedRef.current && !shouldCancelRef.current) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        if (shouldCancelRef.current) break;

        setProgress((prev) => ({
          ...prev,
          currentChapter: ch,
        }));

        // Check if already cached
        const isCached = await isChapterCached(EDITION_ID, book.name, ch);
        if (!isCached) {
          const success = await downloadChapter(book.name, ch);
          if (!success) {
            setProgress((prev) => ({
              ...prev,
              error: `Failed to download ${book.name} ${ch}`,
            }));
          }
        }

        bookCompletedChapters++;
        globalCompletedChapters++;

        const percent = Math.round((globalCompletedChapters / totalChapters) * 100);
        setProgress((prev) => ({
          ...prev,
          completedChapters: globalCompletedChapters,
          percentComplete: percent,
        }));

        // Small delay
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      const bookComplete = bookCompletedChapters === book.chapters;
      if (bookComplete) completedBooks++;

      // Update book status
      setDownloadStatus((prev) => {
        const updated = {
          ...prev,
          [book.name]: {
            book: book.name,
            totalChapters: book.chapters,
            downloadedChapters: bookCompletedChapters,
            isComplete: bookComplete,
            isDownloading: false,
            lastUpdated: Date.now(),
          },
        };
        saveDownloadStatus(updated);
        return updated;
      });

      setProgress((prev) => ({
        ...prev,
        completedBooks,
      }));
    }

    setProgress((prev) => ({
      ...prev,
      isDownloading: false,
    }));

    isDownloadingRef.current = false;
  }, [client]);

  const pauseDownload = useCallback(() => {
    isPausedRef.current = true;
    setProgress((prev) => ({ ...prev, isPaused: true }));
  }, []);

  const resumeDownload = useCallback(() => {
    isPausedRef.current = false;
    setProgress((prev) => ({ ...prev, isPaused: false }));
  }, []);

  const cancelDownload = useCallback(() => {
    shouldCancelRef.current = true;
    isPausedRef.current = false;
    setProgress((prev) => ({
      ...prev,
      isDownloading: false,
      isPaused: false,
    }));
  }, []);

  const deleteBookDownload = useCallback(async (bookName: string) => {
    // Note: This would require adding a deleteBookCache function to offlineStorage
    // For now, we just update the status
    setDownloadStatus((prev) => {
      const updated = { ...prev };
      delete updated[bookName];
      saveDownloadStatus(updated);
      return updated;
    });
  }, []);

  const deleteAllDownloads = useCallback(async () => {
    await clearCache();
    setDownloadStatus({});
    await saveDownloadStatus({});
  }, []);

  const getBookDownloadStatus = useCallback(
    (book: string): BookDownloadStatus | null => {
      return downloadStatus[book] || null;
    },
    [downloadStatus]
  );

  const getTotalDownloadSize = useCallback(() => {
    const books = getAllBooks();
    const totalChapters = books.reduce((sum, b) => sum + b.chapters, 0);
    // Rough estimate: ~2KB per verse, ~25 verses per chapter
    const estimatedMB = (totalChapters * 25 * 2) / 1024;
    return { chapters: totalChapters, estimatedMB: Math.round(estimatedMB * 10) / 10 };
  }, []);

  return {
    downloadStatus,
    progress,
    isDownloading: progress.isDownloading,
    downloadBook,
    downloadAllBooks,
    pauseDownload,
    resumeDownload,
    cancelDownload,
    deleteBookDownload,
    deleteAllDownloads,
    checkDownloadStatus,
    getBookDownloadStatus,
    getTotalDownloadSize,
  };
}
