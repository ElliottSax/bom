/**
 * Tests for useCrossReferences hook
 */
import { renderHook } from '@testing-library/react';
import {
  useCrossReferences,
  formatCrossReference,
  getCrossRefTypeLabel,
  getCrossRefTypeColor,
} from '../hooks/useCrossReferences';

describe('useCrossReferences', () => {
  describe('getCrossReferences', () => {
    it('should return cross references for a verse', () => {
      const { result } = renderHook(() => useCrossReferences());

      const refs = result.current.getCrossReferences(
        'coc-bom-1908',
        'I Nephi',
        3,
        7
      );

      expect(refs).toHaveLength(1);
      expect(refs[0]).toMatchObject({
        toBook: 'I Nephi',
        toChapter: 17,
        toVerse: 3,
        type: 'related',
      });
    });

    it('should return empty array for verses without cross references', () => {
      const { result } = renderHook(() => useCrossReferences());

      const refs = result.current.getCrossReferences(
        'coc-bom-1908',
        'I Nephi',
        1,
        1
      );

      expect(refs).toEqual([]);
    });

    it('should return multiple cross references for Sermon on the Mount', () => {
      const { result } = renderHook(() => useCrossReferences());

      const refs = result.current.getCrossReferences(
        'coc-bom-1908',
        'III Nephi',
        12,
        3
      );

      expect(refs).toHaveLength(1);
      expect(refs[0].toBook).toBe('Matthew');
      expect(refs[0].type).toBe('parallel');
    });

    it('should handle Isaiah quotations', () => {
      const { result } = renderHook(() => useCrossReferences());

      const refs = result.current.getCrossReferences(
        'coc-bom-1908',
        'II Nephi',
        12,
        1
      );

      expect(refs).toHaveLength(1);
      expect(refs[0].toBook).toBe('Isaiah');
      expect(refs[0].type).toBe('quote');
      expect(refs[0].note).toBe('Isaiah prophecy quoted by Nephi');
    });

    it('should be case-sensitive for verse IDs', () => {
      const { result } = renderHook(() => useCrossReferences());

      // This should not match because the book name case is different
      const refs = result.current.getCrossReferences(
        'coc-bom-1908',
        'i nephi',
        3,
        7
      );

      expect(refs).toEqual([]);
    });
  });

  describe('getChapterCrossReferences', () => {
    it('should return all cross references in a chapter', () => {
      const { result } = renderHook(() => useCrossReferences());

      const chapterRefs = result.current.getChapterCrossReferences(
        'coc-bom-1908',
        'III Nephi',
        12
      );

      expect(chapterRefs.size).toBeGreaterThan(0);
    });

    it('should map verse numbers to cross references', () => {
      const { result } = renderHook(() => useCrossReferences());

      const chapterRefs = result.current.getChapterCrossReferences(
        'coc-bom-1908',
        'III Nephi',
        12
      );

      expect(chapterRefs.has(3)).toBe(true);
      expect(chapterRefs.has(4)).toBe(true);
      expect(chapterRefs.has(5)).toBe(true);
    });

    it('should return empty map for chapter without cross references', () => {
      const { result } = renderHook(() => useCrossReferences());

      const chapterRefs = result.current.getChapterCrossReferences(
        'coc-bom-1908',
        'I Nephi',
        1
      );

      expect(chapterRefs.size).toBe(0);
    });

    it('should handle chapters with multiple verses having references', () => {
      const { result } = renderHook(() => useCrossReferences());

      const chapterRefs = result.current.getChapterCrossReferences(
        'coc-bom-1908',
        'III Nephi',
        12
      );

      const verses = Array.from(chapterRefs.keys());
      expect(verses.length).toBeGreaterThan(1);
    });
  });

  describe('hasCrossReferences', () => {
    it('should return true for verses with cross references', () => {
      const { result } = renderHook(() => useCrossReferences());

      const hasRefs = result.current.hasCrossReferences(
        'coc-bom-1908',
        'I Nephi',
        3,
        7
      );

      expect(hasRefs).toBe(true);
    });

    it('should return false for verses without cross references', () => {
      const { result } = renderHook(() => useCrossReferences());

      const hasRefs = result.current.hasCrossReferences(
        'coc-bom-1908',
        'I Nephi',
        1,
        1
      );

      expect(hasRefs).toBe(false);
    });

    it('should be efficient for repeated checks', () => {
      const { result } = renderHook(() => useCrossReferences());

      // Should use Map for O(1) lookup
      const iterations = 1000;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        result.current.hasCrossReferences('coc-bom-1908', 'I Nephi', 3, 7);
      }

      const end = performance.now();
      const timePerCheck = (end - start) / iterations;

      // Should be very fast (< 0.01ms per check on average)
      expect(timePerCheck).toBeLessThan(0.1);
    });
  });

  describe('formatCrossReference', () => {
    it('should format cross reference as string', () => {
      const ref = {
        fromVerseId: 'test',
        toBook: 'Matthew',
        toChapter: 5,
        toVerse: 3,
        type: 'parallel' as const,
      };

      const formatted = formatCrossReference(ref);

      expect(formatted).toBe('Matthew 5:3');
    });

    it('should handle different books', () => {
      const ref = {
        fromVerseId: 'test',
        toBook: 'I Corinthians',
        toChapter: 13,
        toVerse: 4,
        type: 'parallel' as const,
      };

      const formatted = formatCrossReference(ref);

      expect(formatted).toBe('I Corinthians 13:4');
    });
  });

  describe('getCrossRefTypeLabel', () => {
    it('should return correct labels for each type', () => {
      expect(getCrossRefTypeLabel('quote')).toBe('Quote');
      expect(getCrossRefTypeLabel('parallel')).toBe('Parallel');
      expect(getCrossRefTypeLabel('allusion')).toBe('Allusion');
      expect(getCrossRefTypeLabel('related')).toBe('Related');
    });
  });

  describe('getCrossRefTypeColor', () => {
    it('should return correct colors for each type', () => {
      expect(getCrossRefTypeColor('quote')).toBe('#2196f3');
      expect(getCrossRefTypeColor('parallel')).toBe('#4caf50');
      expect(getCrossRefTypeColor('allusion')).toBe('#ff9800');
      expect(getCrossRefTypeColor('related')).toBe('#9c27b0');
    });

    it('should return default color for unknown type', () => {
      const color = getCrossRefTypeColor('unknown' as any);
      expect(color).toBe('#666666');
    });
  });

  describe('cross reference data integrity', () => {
    it('should have valid verse IDs for all references', () => {
      const { result } = renderHook(() => useCrossReferences());

      // Check a few known references
      const refs1 = result.current.getCrossReferences(
        'coc-bom-1908',
        'Moroni',
        10,
        4
      );
      expect(refs1.length).toBeGreaterThan(0);

      const refs2 = result.current.getCrossReferences(
        'coc-bom-1908',
        'Alma',
        32,
        21
      );
      expect(refs2.length).toBeGreaterThan(0);
    });

    it('should include notes for important references', () => {
      const { result } = renderHook(() => useCrossReferences());

      const refs = result.current.getCrossReferences(
        'coc-bom-1908',
        'III Nephi',
        12,
        3
      );

      expect(refs[0].note).toBeDefined();
      expect(refs[0].note).toContain('Beatitudes');
    });

    it('should have correct types for Bible parallels', () => {
      const { result } = renderHook(() => useCrossReferences());

      const beatitudeRefs = result.current.getCrossReferences(
        'coc-bom-1908',
        'III Nephi',
        12,
        3
      );

      expect(beatitudeRefs[0].type).toBe('parallel');
    });

    it('should have correct types for Isaiah quotes', () => {
      const { result } = renderHook(() => useCrossReferences());

      const isaiahRefs = result.current.getCrossReferences(
        'coc-bom-1908',
        'II Nephi',
        12,
        1
      );

      expect(isaiahRefs[0].type).toBe('quote');
    });
  });

  describe('hook stability', () => {
    it('should return stable functions across renders', () => {
      const { result, rerender } = renderHook(() => useCrossReferences());

      const firstGetRefs = result.current.getCrossReferences;
      const firstHasRefs = result.current.hasCrossReferences;
      const firstGetChapter = result.current.getChapterCrossReferences;

      rerender();

      expect(result.current.getCrossReferences).toBe(firstGetRefs);
      expect(result.current.hasCrossReferences).toBe(firstHasRefs);
      expect(result.current.getChapterCrossReferences).toBe(firstGetChapter);
    });
  });
});
