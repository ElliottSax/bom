/**
 * Custom hook for fetching and caching scripture chapters
 */

import { useQuery, gql } from '@apollo/client';
import { useNetInfo } from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import { getCachedChapter, cacheChapter } from '../services/offlineStorage';

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

export interface Verse {
  id: string;
  verse: number;
  text: string;
  verseType: string;
  book: string;
  chapter: number;
}

interface UseChapterResult {
  verses: Verse[];
  loading: boolean;
  error: Error | undefined;
  isOffline: boolean;
  refetch: () => void;
}

/**
 * Hook to fetch a scripture chapter with offline support
 *
 * @param editionId - Edition ID (e.g., 'coc-bom-1908')
 * @param book - Book name (e.g., 'I Nephi')
 * @param chapter - Chapter number
 * @returns Chapter verses, loading state, error, and offline indicator
 */
export function useChapter(
  editionId: string,
  book: string,
  chapter: number
): UseChapterResult {
  const netInfo = useNetInfo();
  const [cachedVerses, setCachedVerses] = useState<Verse[]>([]);
  const [isCacheLoaded, setIsCacheLoaded] = useState(false);

  // Fetch from API when online
  const { data, loading, error, refetch } = useQuery(GET_CHAPTER, {
    variables: { editionId, book, chapter },
    skip: !netInfo.isConnected,
    onCompleted: (data) => {
      // Cache verses when successfully fetched
      if (data?.verses) {
        cacheChapter(editionId, book, chapter, data.verses).catch((err) => {
          console.error('Failed to cache chapter:', err);
        });
      }
    },
  });

  // Load from cache when offline or as fallback
  useEffect(() => {
    async function loadCache() {
      try {
        const cached = await getCachedChapter(editionId, book, chapter);
        setCachedVerses(cached);
        setIsCacheLoaded(true);
      } catch (err) {
        console.error('Failed to load cached chapter:', err);
        setIsCacheLoaded(true);
      }
    }

    loadCache();
  }, [editionId, book, chapter]);

  // Determine which verses to return
  const verses = data?.verses || cachedVerses;
  const isOffline = !netInfo.isConnected;

  // Show loading only if we're online, fetching, and have no cached data
  const isLoading = (loading && !isCacheLoaded) || (!isCacheLoaded && !verses.length);

  return {
    verses,
    loading: isLoading,
    error,
    isOffline,
    refetch,
  };
}

/**
 * Hook to prefetch multiple chapters for offline reading
 *
 * @param chapters - Array of chapters to prefetch
 */
export function usePrefetchChapters(
  chapters: Array<{ editionId: string; book: string; chapter: number }>
) {
  const netInfo = useNetInfo();
  const [progress, setProgress] = useState(0);
  const [isPrefetching, setIsPrefetching] = useState(false);

  const prefetch = async () => {
    if (!netInfo.isConnected) {
      console.warn('Cannot prefetch while offline');
      return;
    }

    setIsPrefetching(true);
    setProgress(0);

    for (let i = 0; i < chapters.length; i++) {
      const { editionId, book, chapter } = chapters[i];

      try {
        // This would use Apollo Client's query function
        // Implementation depends on how we structure the download manager
        console.log(`Prefetching ${book} ${chapter}...`);

        setProgress(((i + 1) / chapters.length) * 100);
      } catch (err) {
        console.error(`Failed to prefetch ${book} ${chapter}:`, err);
      }
    }

    setIsPrefetching(false);
  };

  return {
    prefetch,
    progress,
    isPrefetching,
  };
}

/**
 * Hook to get chapter metadata (verse count, etc.)
 */
export function useChapterMetadata(
  editionId: string,
  book: string,
  chapter: number
) {
  const { verses, loading, error } = useChapter(editionId, book, chapter);

  return {
    verseCount: verses.length,
    loading,
    error,
  };
}
