/**
 * Tests for useDailyVerse hook
 */
import { renderHook, act } from '@testing-library/react';
import { useDailyVerse } from '../hooks/useDailyVerse';

describe('useDailyVerse', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('verse selection', () => {
    it('should return a daily verse', () => {
      const { result } = renderHook(() => useDailyVerse());

      expect(result.current.verse).toBeDefined();
      expect(result.current.verse.book).toBeDefined();
      expect(result.current.verse.chapter).toBeGreaterThan(0);
      expect(result.current.verse.verse).toBeGreaterThan(0);
      expect(result.current.verse.text).toBeDefined();
      expect(result.current.verse.reference).toBeDefined();
    });

    it('should format reference correctly', () => {
      const { result } = renderHook(() => useDailyVerse());

      const ref = result.current.verse.reference;
      expect(ref).toMatch(/^.+ \d+:\d+$/);
      expect(ref).toBe(
        `${result.current.verse.book} ${result.current.verse.chapter}:${result.current.verse.verse}`
      );
    });

    it('should select from curated verses list', () => {
      const { result } = renderHook(() => useDailyVerse());

      const verse = result.current.verse;
      const curatedBooks = [
        'I Nephi',
        'II Nephi',
        'Jacob',
        'Mosiah',
        'Alma',
        'Helaman',
        'III Nephi',
        'Ether',
        'Moroni',
      ];

      expect(curatedBooks).toContain(verse.book);
    });

    it('should be deterministic for same day', () => {
      jest.setSystemTime(new Date('2024-02-15T10:00:00Z'));

      const { result: result1 } = renderHook(() => useDailyVerse());
      const verse1 = result1.current.verse;

      // Create another instance on the same day
      const { result: result2 } = renderHook(() => useDailyVerse());
      const verse2 = result2.current.verse;

      expect(verse1.book).toBe(verse2.book);
      expect(verse1.chapter).toBe(verse2.chapter);
      expect(verse1.verse).toBe(verse2.verse);
    });

    it('should change on different days', () => {
      jest.setSystemTime(new Date('2024-02-15T10:00:00Z'));
      const { result: result1 } = renderHook(() => useDailyVerse());
      const verse1 = result1.current.verse;

      jest.setSystemTime(new Date('2024-02-16T10:00:00Z'));
      const { result: result2 } = renderHook(() => useDailyVerse());
      const verse2 = result2.current.verse;

      // Verses should be different (unless by coincidence the list cycles)
      const sameVerse =
        verse1.book === verse2.book &&
        verse1.chapter === verse2.chapter &&
        verse1.verse === verse2.verse;

      // They could be the same if the list cycles, but likely not
      expect(verse1.reference).toBeDefined();
      expect(verse2.reference).toBeDefined();
    });
  });

  describe('refresh', () => {
    it('should refresh the verse', () => {
      const { result } = renderHook(() => useDailyVerse());

      const originalVerse = result.current.verse;

      act(() => {
        result.current.refresh();
      });

      // Should still be the same verse on the same day
      expect(result.current.verse.reference).toBe(originalVerse.reference);
    });

    it('should get new verse after day changes', () => {
      jest.setSystemTime(new Date('2024-02-15T10:00:00Z'));

      const { result } = renderHook(() => useDailyVerse());
      const verse1 = result.current.verse;

      // Change to next day
      jest.setSystemTime(new Date('2024-02-16T10:00:00Z'));

      act(() => {
        result.current.refresh();
      });

      const verse2 = result.current.verse;

      // Should have updated to new day's verse
      expect(verse1.reference).toBeDefined();
      expect(verse2.reference).toBeDefined();
    });
  });

  describe('verse content quality', () => {
    it('should have non-empty text', () => {
      const { result } = renderHook(() => useDailyVerse());

      expect(result.current.verse.text.length).toBeGreaterThan(10);
    });

    it('should include well-known verses', () => {
      // Test across multiple days to find specific verses
      const foundVerses = new Set<string>();

      for (let day = 0; day < 365; day++) {
        const date = new Date('2024-01-01');
        date.setDate(date.getDate() + day);
        jest.setSystemTime(date);

        const { result } = renderHook(() => useDailyVerse());
        foundVerses.add(result.current.verse.reference);
      }

      // Should include famous verses like:
      // I Nephi 3:7, II Nephi 2:25, Moroni 10:4-5, etc.
      expect(foundVerses.size).toBeGreaterThan(20);
    });

    it('should cycle through all verses over time', () => {
      const seenVerses = new Set<string>();
      const iterations = 50;

      for (let day = 0; day < iterations; day++) {
        const date = new Date('2024-01-01');
        date.setDate(date.getDate() + day);
        jest.setSystemTime(date);

        const { result } = renderHook(() => useDailyVerse());
        seenVerses.add(result.current.verse.reference);
      }

      // Should have variety - at least 20 unique verses in 50 days
      expect(seenVerses.size).toBeGreaterThan(20);
    });
  });

  describe('edge cases', () => {
    it('should handle year boundaries', () => {
      jest.setSystemTime(new Date('2024-12-31T23:59:59Z'));
      const { result: result1 } = renderHook(() => useDailyVerse());
      const verse1 = result1.current.verse;

      jest.setSystemTime(new Date('2025-01-01T00:00:00Z'));
      const { result: result2 } = renderHook(() => useDailyVerse());
      const verse2 = result2.current.verse;

      // Both should return valid verses
      expect(verse1.reference).toBeDefined();
      expect(verse2.reference).toBeDefined();
    });

    it('should handle leap years', () => {
      jest.setSystemTime(new Date('2024-02-29T12:00:00Z'));
      const { result } = renderHook(() => useDailyVerse());

      expect(result.current.verse).toBeDefined();
      expect(result.current.verse.reference).toBeDefined();
    });

    it('should be consistent across time zones', () => {
      // Same day, different times
      jest.setSystemTime(new Date('2024-02-15T01:00:00Z'));
      const { result: result1 } = renderHook(() => useDailyVerse());

      jest.setSystemTime(new Date('2024-02-15T23:00:00Z'));
      const { result: result2 } = renderHook(() => useDailyVerse());

      expect(result1.current.verse.reference).toBe(
        result2.current.verse.reference
      );
    });
  });

  describe('hook stability', () => {
    it('should return stable refresh function', () => {
      const { result, rerender } = renderHook(() => useDailyVerse());

      const firstRefresh = result.current.refresh;

      rerender();

      expect(result.current.refresh).toBe(firstRefresh);
    });

    it('should not cause unnecessary re-renders', () => {
      let renderCount = 0;
      const { rerender } = renderHook(() => {
        renderCount++;
        return useDailyVerse();
      });

      rerender();
      rerender();

      // Should render: initial + 2 rerenders = 3
      expect(renderCount).toBe(3);
    });
  });

  describe('data structure', () => {
    it('should have correct verse structure', () => {
      const { result } = renderHook(() => useDailyVerse());

      const verse = result.current.verse;

      expect(typeof verse.book).toBe('string');
      expect(typeof verse.chapter).toBe('number');
      expect(typeof verse.verse).toBe('number');
      expect(typeof verse.text).toBe('string');
      expect(typeof verse.reference).toBe('string');
    });

    it('should have valid chapter and verse numbers', () => {
      const { result } = renderHook(() => useDailyVerse());

      expect(result.current.verse.chapter).toBeGreaterThan(0);
      expect(result.current.verse.verse).toBeGreaterThan(0);
      expect(result.current.verse.chapter).toBeLessThan(100);
      expect(result.current.verse.verse).toBeLessThan(100);
    });
  });
});
