/**
 * Custom hook for fetching scripture statistics
 */

import { gql, useQuery } from '@apollo/client';

// GraphQL query for fetching edition stats
const GET_EDITIONS = gql`
  query GetEditions {
    editions {
      id
      name
      shortName
      verseCount
    }
  }
`;

// GraphQL query for fetching book stats
const GET_BOOKS = gql`
  query GetBooks($editionId: ID!) {
    books(editionId: $editionId) {
      book
      verseCount
      chapters
    }
  }
`;

export interface Edition {
  id: string;
  name: string;
  shortName: string;
  verseCount: number;
}

export interface BookStats {
  book: string;
  verseCount: number;
  chapters: number;
}

interface UseStatsResult {
  editions: Edition[];
  totalVerses: number;
  totalBooks: number;
  totalChapters: number;
  loading: boolean;
  error: Error | undefined;
  refetch: () => void;
}

interface UseBookStatsResult {
  books: BookStats[];
  loading: boolean;
  error: Error | undefined;
}

/**
 * Hook for fetching overall scripture statistics
 */
export function useStats(): UseStatsResult {
  const { data, loading, error, refetch } = useQuery(GET_EDITIONS, {
    fetchPolicy: 'cache-first',
  });

  const editions: Edition[] = data?.editions || [];
  const totalVerses = editions.reduce((sum, e) => sum + (e.verseCount || 0), 0);

  // Estimate total books and chapters based on available data
  // These are approximations - a real implementation would query the server
  const totalBooks = 15; // Standard BoM book count
  const totalChapters = 119; // Approximate chapter count

  return {
    editions,
    totalVerses,
    totalBooks,
    totalChapters,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook for fetching book-level statistics for a specific edition
 */
export function useBookStats(editionId: string): UseBookStatsResult {
  const { data, loading, error } = useQuery(GET_BOOKS, {
    variables: { editionId },
    fetchPolicy: 'cache-first',
    skip: !editionId,
  });

  return {
    books: data?.books || [],
    loading,
    error,
  };
}

/**
 * Format large numbers with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}
