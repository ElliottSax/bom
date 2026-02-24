/**
 * Tests for useWordStudy hook
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useWordStudy } from '../hooks/useWordStudy';
import { mockFetch, resetFetch } from './test-utils';

describe('useWordStudy', () => {
  beforeEach(() => {
    resetFetch();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('studyWord', () => {
    it('should search for a word and return results', async () => {
      const mockResults = {
        results: [
          {
            verse: 7,
            text: 'I will go and do the things which the Lord hath commanded',
            chapter: 3,
            book: 'I Nephi',
            volumeId: 'coc-bom-1908',
            reference: 'I Nephi 3:7',
          },
          {
            verse: 8,
            text: 'And it came to pass that when my father had heard',
            chapter: 3,
            book: 'I Nephi',
            volumeId: 'coc-bom-1908',
            reference: 'I Nephi 3:8',
          },
        ],
      };

      mockFetch(mockResults);

      const { result } = renderHook(() => useWordStudy());

      let wordResult;
      await act(async () => {
        wordResult = await result.current.studyWord('faith', 'coc-bom-1908');
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.result).not.toBeNull();
      expect(result.current.result?.word).toBe('faith');
      expect(result.current.result?.totalOccurrences).toBe(2);
      expect(result.current.result?.occurrences).toHaveLength(2);
    });

    it('should group results by book', async () => {
      const mockResults = {
        results: [
          {
            verse: 7,
            text: 'Test verse',
            chapter: 3,
            book: 'I Nephi',
            volumeId: 'coc-bom-1908',
            reference: 'I Nephi 3:7',
          },
          {
            verse: 8,
            text: 'Test verse',
            chapter: 3,
            book: 'I Nephi',
            volumeId: 'coc-bom-1908',
            reference: 'I Nephi 3:8',
          },
          {
            verse: 1,
            text: 'Test verse',
            chapter: 1,
            book: 'Alma',
            volumeId: 'coc-bom-1908',
            reference: 'Alma 1:1',
          },
        ],
      };

      mockFetch(mockResults);

      const { result } = renderHook(() => useWordStudy());

      await act(async () => {
        await result.current.studyWord('test', 'coc-bom-1908');
      });

      expect(result.current.result?.byBook).toHaveLength(2);
      expect(result.current.result?.byBook[0]).toMatchObject({
        book: 'I Nephi',
        count: 2,
      });
      expect(result.current.result?.byBook[1]).toMatchObject({
        book: 'Alma',
        count: 1,
      });
    });

    it('should sort books by occurrence count descending', async () => {
      const mockResults = {
        results: [
          {
            verse: 1,
            text: 'Test',
            chapter: 1,
            book: 'Alma',
            volumeId: 'coc-bom-1908',
            reference: 'Alma 1:1',
          },
          {
            verse: 7,
            text: 'Test',
            chapter: 3,
            book: 'I Nephi',
            volumeId: 'coc-bom-1908',
            reference: 'I Nephi 3:7',
          },
          {
            verse: 8,
            text: 'Test',
            chapter: 3,
            book: 'I Nephi',
            volumeId: 'coc-bom-1908',
            reference: 'I Nephi 3:8',
          },
          {
            verse: 9,
            text: 'Test',
            chapter: 3,
            book: 'I Nephi',
            volumeId: 'coc-bom-1908',
            reference: 'I Nephi 3:9',
          },
        ],
      };

      mockFetch(mockResults);

      const { result } = renderHook(() => useWordStudy());

      await act(async () => {
        await result.current.studyWord('test', 'coc-bom-1908');
      });

      expect(result.current.result?.byBook[0].book).toBe('I Nephi');
      expect(result.current.result?.byBook[0].count).toBe(3);
      expect(result.current.result?.byBook[1].book).toBe('Alma');
      expect(result.current.result?.byBook[1].count).toBe(1);
    });

    it('should reject words shorter than 2 characters', async () => {
      const { result } = renderHook(() => useWordStudy());

      await act(async () => {
        await result.current.studyWord('a', 'coc-bom-1908');
      });

      expect(result.current.error).toBe('Word must be at least 2 characters');
      expect(result.current.result).toBeNull();
    });

    it('should reject empty words', async () => {
      const { result } = renderHook(() => useWordStudy());

      await act(async () => {
        await result.current.studyWord('', 'coc-bom-1908');
      });

      expect(result.current.error).toBe('Word must be at least 2 characters');
    });

    it('should set loading state during search', async () => {
      mockFetch({ results: [] });

      const { result } = renderHook(() => useWordStudy());

      expect(result.current.loading).toBe(false);

      const promise = act(async () => {
        await result.current.studyWord('faith', 'coc-bom-1908');
      });

      await promise;

      expect(result.current.loading).toBe(false);
    });

    it('should handle API errors gracefully', async () => {
      mockFetch({ error: 'Server error' }, false, 500);

      const { result } = renderHook(() => useWordStudy());

      await act(async () => {
        await result.current.studyWord('faith', 'coc-bom-1908');
      });

      expect(result.current.error).toBe('Failed to search for word');
      expect(result.current.result).toBeNull();
    });

    it('should lowercase search term', async () => {
      mockFetch({ results: [] });

      const { result } = renderHook(() => useWordStudy());

      await act(async () => {
        await result.current.studyWord('FAITH', 'coc-bom-1908');
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('q=faith')
      );
    });

    it('should encode search term for URL', async () => {
      mockFetch({ results: [] });

      const { result } = renderHook(() => useWordStudy());

      await act(async () => {
        await result.current.studyWord('test & trial', 'coc-bom-1908');
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('test%20%26%20trial')
      );
    });

    it('should include volume ID in request', async () => {
      mockFetch({ results: [] });

      const { result } = renderHook(() => useWordStudy());

      await act(async () => {
        await result.current.studyWord('faith', 'coc-dc-1908');
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('volume=coc-dc-1908')
      );
    });

    it('should limit results to 200', async () => {
      mockFetch({ results: [] });

      const { result } = renderHook(() => useWordStudy());

      await act(async () => {
        await result.current.studyWord('the', 'coc-bom-1908');
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=200')
      );
    });
  });

  describe('highlightWord', () => {
    it('should split text and mark highlighted portions', () => {
      const { result } = renderHook(() => useWordStudy());

      const parts = result.current.highlightWord('Have faith in the Lord', 'faith');

      expect(parts).toHaveLength(3);
      expect(parts[0]).toEqual({ text: 'Have ', isHighlighted: false });
      expect(parts[1]).toEqual({ text: 'faith', isHighlighted: true });
      expect(parts[2]).toEqual({ text: ' in the Lord', isHighlighted: false });
    });

    it('should be case insensitive', () => {
      const { result } = renderHook(() => useWordStudy());

      const parts = result.current.highlightWord('Have FAITH in the Lord', 'faith');

      const highlighted = parts.filter(p => p.isHighlighted);
      expect(highlighted).toHaveLength(1);
      expect(highlighted[0].text).toBe('FAITH');
    });

    it('should handle multiple occurrences', () => {
      const { result } = renderHook(() => useWordStudy());

      const parts = result.current.highlightWord('faith faith faith', 'faith');

      const highlighted = parts.filter(p => p.isHighlighted);
      expect(highlighted).toHaveLength(3);
    });

    it('should return full text if no word provided', () => {
      const { result } = renderHook(() => useWordStudy());

      const parts = result.current.highlightWord('Have faith', '');

      expect(parts).toHaveLength(1);
      expect(parts[0]).toEqual({ text: 'Have faith', isHighlighted: false });
    });

    it('should escape special regex characters', () => {
      const { result } = renderHook(() => useWordStudy());

      const parts = result.current.highlightWord('Test (word) here', '(word)');

      const highlighted = parts.filter(p => p.isHighlighted);
      expect(highlighted).toHaveLength(1);
    });

    it('should handle text without occurrences', () => {
      const { result } = renderHook(() => useWordStudy());

      const parts = result.current.highlightWord('Have faith', 'love');

      expect(parts).toHaveLength(1);
      expect(parts[0].isHighlighted).toBe(false);
    });
  });

  describe('clearResult', () => {
    it('should clear result and error', async () => {
      mockFetch({ results: [] });

      const { result } = renderHook(() => useWordStudy());

      await act(async () => {
        await result.current.studyWord('faith', 'coc-bom-1908');
      });

      expect(result.current.result).not.toBeNull();

      act(() => {
        result.current.clearResult();
      });

      expect(result.current.result).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should clear error state', async () => {
      mockFetch({ error: 'Server error' }, false, 500);

      const { result } = renderHook(() => useWordStudy());

      await act(async () => {
        await result.current.studyWord('faith', 'coc-bom-1908');
      });

      expect(result.current.error).not.toBeNull();

      act(() => {
        result.current.clearResult();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('state management', () => {
    it('should maintain separate state for each hook instance', async () => {
      mockFetch({ results: [] });

      const { result: result1 } = renderHook(() => useWordStudy());
      const { result: result2 } = renderHook(() => useWordStudy());

      await act(async () => {
        await result1.current.studyWord('faith', 'coc-bom-1908');
      });

      expect(result1.current.result).not.toBeNull();
      expect(result2.current.result).toBeNull();
    });
  });
});
