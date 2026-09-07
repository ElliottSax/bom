/**
 * Word Study Hook
 *
 * Search for word occurrences across all scriptures (concordance)
 */

import { useState, useCallback } from 'react';
import { useApolloClient, gql } from '@apollo/client';
import { logger } from '../utils/logger';

const log = logger.scope('WordStudy');

const SEARCH_VERSES = gql`
  query SearchVerses($query: String!, $editionId: String, $limit: Int) {
    searchVerses(query: $query, editionId: $editionId, limit: $limit) {
      id
      verse
      text
      chapter {
        number
        book {
          name
          edition {
            id
            name
          }
        }
      }
    }
  }
`;

export interface WordOccurrence {
  id: string;
  verse: number;
  text: string;
  chapter: number;
  book: string;
  editionId: string;
  editionName: string;
}

export interface WordStudyResult {
  word: string;
  totalOccurrences: number;
  occurrences: WordOccurrence[];
  byBook: { book: string; count: number }[];
}

export function useWordStudy() {
  const client = useApolloClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WordStudyResult | null>(null);

  // Study a specific word
  const studyWord = useCallback(
    async (word: string, editionId?: string): Promise<WordStudyResult | null> => {
      if (!word || word.length < 2) {
        setError('Word must be at least 2 characters');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const { data } = await client.query({
          query: SEARCH_VERSES,
          variables: {
            query: word.toLowerCase(),
            editionId,
            limit: 200,
          },
          fetchPolicy: 'network-only',
        });

        interface SearchVerseResult {
          id: string;
          verse: number;
          text: string;
          chapter: {
            number: number;
            book: {
              name: string;
              edition: {
                id: string;
                name: string;
              };
            };
          };
        }

        const occurrences: WordOccurrence[] = data.searchVerses.map((verse: SearchVerseResult) => ({
          id: verse.id,
          verse: verse.verse,
          text: verse.text,
          chapter: verse.chapter.number,
          book: verse.chapter.book.name,
          editionId: verse.chapter.book.edition.id,
          editionName: verse.chapter.book.edition.name,
        }));

        // Group by book
        const bookCounts = new Map<string, number>();
        occurrences.forEach((occ) => {
          const current = bookCounts.get(occ.book) || 0;
          bookCounts.set(occ.book, current + 1);
        });

        const byBook = Array.from(bookCounts.entries())
          .map(([book, count]) => ({ book, count }))
          .sort((a, b) => b.count - a.count);

        const studyResult: WordStudyResult = {
          word: word.toLowerCase(),
          totalOccurrences: occurrences.length,
          occurrences,
          byBook,
        };

        setResult(studyResult);
        setLoading(false);
        return studyResult;
      } catch (err) {
        log.error('Word study failed', err);
        setError('Failed to search for word');
        setLoading(false);
        return null;
      }
    },
    [client]
  );

  // Get common scripture words to filter out
  const getCommonWords = (): Set<string> => {
    return new Set([
      'the',
      'and',
      'of',
      'to',
      'a',
      'in',
      'that',
      'is',
      'was',
      'it',
      'for',
      'be',
      'with',
      'as',
      'his',
      'he',
      'i',
      'on',
      'have',
      'by',
      'at',
      'this',
      'they',
      'from',
      'or',
      'an',
      'which',
      'we',
      'not',
      'but',
      'you',
      'are',
      'my',
      'all',
      'their',
      'so',
      'if',
      'them',
      'unto',
      'shall',
      'did',
      'were',
      'had',
      'will',
      'been',
      'would',
      'said',
      'do',
      'there',
      'me',
      'thee',
      'thy',
      'thou',
    ]);
  };

  // Extract significant words from verse text
  const extractWords = useCallback((text: string): string[] => {
    const commonWords = getCommonWords();
    const words = text
      .toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter((word) => word.length >= 3 && !commonWords.has(word));

    // Remove duplicates
    return [...new Set(words)];
  }, []);

  // Get word frequency from a list of verses
  const getWordFrequency = useCallback((texts: string[]): { word: string; count: number }[] => {
    const frequency = new Map<string, number>();
    const commonWords = getCommonWords();

    texts.forEach((text) => {
      const words = text
        .toLowerCase()
        .replace(/[^a-z\s]/g, '')
        .split(/\s+/)
        .filter((word) => word.length >= 3 && !commonWords.has(word));

      words.forEach((word) => {
        const current = frequency.get(word) || 0;
        frequency.set(word, current + 1);
      });
    });

    return Array.from(frequency.entries())
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count);
  }, []);

  // Highlight word in text
  const highlightWord = useCallback(
    (text: string, word: string): { text: string; isHighlighted: boolean }[] => {
      const regex = new RegExp(`(${word})`, 'gi');
      const parts = text.split(regex);

      return parts.map((part) => ({
        text: part,
        isHighlighted: part.toLowerCase() === word.toLowerCase(),
      }));
    },
    []
  );

  // Clear results
  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    loading,
    error,
    result,
    studyWord,
    extractWords,
    getWordFrequency,
    highlightWord,
    clearResult,
  };
}
