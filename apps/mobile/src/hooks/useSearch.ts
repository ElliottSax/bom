/**
 * Custom hook for searching scriptures
 */

import { useState, useCallback, useRef } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import { logger } from '../utils/logger';

const log = logger.scope('Search');

// GraphQL query for searching verses
const SEARCH_VERSES = gql`
  query SearchVerses($query: String!, $editionId: ID, $limit: Int) {
    searchVerses(query: $query, editionId: $editionId, limit: $limit) {
      id
      editionId
      book
      chapter
      verse
      text
      verseType
    }
  }
`;

export interface SearchResult {
  id: string;
  editionId: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  verseType: string;
}

interface UseSearchResult {
  results: SearchResult[];
  loading: boolean;
  error: Error | undefined;
  totalResults: number;
  search: (query: string, editionId?: string) => void;
  clearResults: () => void;
  hasSearched: boolean;
}

/**
 * Hook for searching scripture verses
 *
 * @param defaultLimit - Default number of results to return (default: 50)
 * @returns Search results, loading state, and search function
 */
export function useSearch(defaultLimit: number = 50): UseSearchResult {
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const [executeSearch, { loading, error }] = useLazyQuery(SEARCH_VERSES, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data?.searchVerses) {
        setResults(data.searchVerses);
      }
    },
    onError: (err) => {
      log.error('Search error', err);
      setResults([]);
    },
  });

  const search = useCallback(
    (query: string, editionId?: string) => {
      // Clear previous debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Don't search for very short queries
      if (query.trim().length < 2) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      // Debounce search by 300ms
      debounceRef.current = setTimeout(() => {
        setHasSearched(true);
        executeSearch({
          variables: {
            query: query.trim(),
            editionId: editionId || undefined,
            limit: defaultLimit,
          },
        });
      }, 300);
    },
    [executeSearch, defaultLimit]
  );

  const clearResults = useCallback(() => {
    setResults([]);
    setHasSearched(false);
  }, []);

  return {
    results,
    loading,
    error,
    totalResults: results.length,
    search,
    clearResults,
    hasSearched,
  };
}

/**
 * Highlight search term in text
 */
export function highlightSearchTerm(
  text: string,
  searchTerm: string
): { text: string; isHighlighted: boolean }[] {
  if (!searchTerm || searchTerm.length < 2) {
    return [{ text, isHighlighted: false }];
  }

  const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part) => ({
    text: part,
    isHighlighted: part.toLowerCase() === searchTerm.toLowerCase(),
  }));
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
