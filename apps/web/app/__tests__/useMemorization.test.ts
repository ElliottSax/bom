/**
 * Tests for useMemorization hook
 */
import { renderHook, act } from '@testing-library/react';
import { useMemorization } from '../hooks/useMemorization';
import { createLocalStorageMock, createMockMemorizationVerse } from './test-utils';

describe('useMemorization', () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    localStorageMock = createLocalStorageMock();
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    jest.clearAllMocks();
  });

  describe('addVerse', () => {
    it('should add a new verse for memorization', () => {
      const { result } = renderHook(() => useMemorization());

      act(() => {
        result.current.addVerse({
          verseId: 'verse-1',
          book: 'I Nephi',
          chapter: 3,
          verse: 7,
          text: 'I will go and do',
        });
      });

      expect(result.current.verses).toHaveLength(1);
      expect(result.current.verses[0]).toMatchObject({
        verseId: 'verse-1',
        book: 'I Nephi',
        chapter: 3,
        verse: 7,
        text: 'I will go and do',
        level: 0,
        correctCount: 0,
        incorrectCount: 0,
      });
    });

    it('should not add duplicate verses', () => {
      const { result } = renderHook(() => useMemorization());

      act(() => {
        result.current.addVerse({
          verseId: 'verse-1',
          book: 'I Nephi',
          chapter: 3,
          verse: 7,
          text: 'I will go and do',
        });
        result.current.addVerse({
          verseId: 'verse-1',
          book: 'I Nephi',
          chapter: 3,
          verse: 7,
          text: 'I will go and do',
        });
      });

      expect(result.current.verses).toHaveLength(1);
    });

    it('should persist verses to localStorage', () => {
      const { result } = renderHook(() => useMemorization());

      act(() => {
        result.current.addVerse({
          verseId: 'verse-1',
          book: 'I Nephi',
          chapter: 3,
          verse: 7,
          text: 'I will go and do',
        });
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith('coc-memorization', expect.any(String));
    });
  });

  describe('removeVerse', () => {
    it('should remove a verse from memorization', () => {
      const { result } = renderHook(() => useMemorization());

      act(() => {
        result.current.addVerse({
          verseId: 'verse-1',
          book: 'I Nephi',
          chapter: 3,
          verse: 7,
          text: 'I will go and do',
        });
      });

      expect(result.current.verses).toHaveLength(1);

      act(() => {
        result.current.removeVerse('verse-1');
      });

      expect(result.current.verses).toHaveLength(0);
    });

    it('should not error when removing non-existent verse', () => {
      const { result } = renderHook(() => useMemorization());

      act(() => {
        result.current.removeVerse('non-existent');
      });

      expect(result.current.verses).toHaveLength(0);
    });
  });

  describe('isMemorizing', () => {
    it('should return true for verses being memorized', () => {
      const { result } = renderHook(() => useMemorization());

      act(() => {
        result.current.addVerse({
          verseId: 'verse-1',
          book: 'I Nephi',
          chapter: 3,
          verse: 7,
          text: 'I will go and do',
        });
      });

      expect(result.current.isMemorizing('verse-1')).toBe(true);
    });

    it('should return false for verses not being memorized', () => {
      const { result } = renderHook(() => useMemorization());

      expect(result.current.isMemorizing('verse-1')).toBe(false);
    });
  });

  describe('getDueVerses', () => {
    it('should return verses due for review', () => {
      const { result } = renderHook(() => useMemorization());

      act(() => {
        result.current.addVerse({
          verseId: 'verse-1',
          book: 'I Nephi',
          chapter: 3,
          verse: 7,
          text: 'I will go and do',
        });
      });

      const dueVerses = result.current.getDueVerses();
      expect(dueVerses).toHaveLength(1);
    });

    it('should not return verses not yet due', () => {
      const futureTime = Date.now() + 86400000 * 7; // 7 days in future

      // Manually set up a verse with future review time
      localStorageMock.setItem(
        'coc-memorization',
        JSON.stringify([
          createMockMemorizationVerse({
            nextReviewAt: futureTime,
          }),
        ])
      );

      const { result: newResult } = renderHook(() => useMemorization());
      const dueVerses = newResult.current.getDueVerses();

      expect(dueVerses).toHaveLength(0);
    });

    it('should sort due verses by review time', () => {
      const now = Date.now();
      localStorageMock.setItem(
        'coc-memorization',
        JSON.stringify([
          createMockMemorizationVerse({
            verseId: 'verse-1',
            nextReviewAt: now - 1000,
          }),
          createMockMemorizationVerse({
            verseId: 'verse-2',
            id: 'mem-2',
            nextReviewAt: now - 5000,
          }),
        ])
      );

      const { result } = renderHook(() => useMemorization());
      const dueVerses = result.current.getDueVerses();

      expect(dueVerses[0].verseId).toBe('verse-2');
      expect(dueVerses[1].verseId).toBe('verse-1');
    });
  });

  describe('recordReview', () => {
    it('should increase level on correct answer', () => {
      const { result } = renderHook(() => useMemorization());

      act(() => {
        result.current.addVerse({
          verseId: 'verse-1',
          book: 'I Nephi',
          chapter: 3,
          verse: 7,
          text: 'I will go and do',
        });
      });

      expect(result.current.verses[0].level).toBe(0);

      act(() => {
        result.current.recordReview('verse-1', true);
      });

      expect(result.current.verses[0].level).toBe(1);
      expect(result.current.verses[0].correctCount).toBe(1);
    });

    it('should decrease level on incorrect answer', () => {
      localStorageMock.setItem(
        'coc-memorization',
        JSON.stringify([
          createMockMemorizationVerse({
            level: 3,
          }),
        ])
      );

      const { result } = renderHook(() => useMemorization());

      act(() => {
        result.current.recordReview('coc-bom-1908:I Nephi:3:7', false);
      });

      expect(result.current.verses[0].level).toBe(2);
      expect(result.current.verses[0].incorrectCount).toBe(1);
    });

    it('should not decrease level below 0', () => {
      const { result } = renderHook(() => useMemorization());

      act(() => {
        result.current.addVerse({
          verseId: 'verse-1',
          book: 'I Nephi',
          chapter: 3,
          verse: 7,
          text: 'I will go and do',
        });
      });

      act(() => {
        result.current.recordReview('verse-1', false);
      });

      expect(result.current.verses[0].level).toBe(0);
    });

    it('should not increase level above 5', () => {
      localStorageMock.setItem(
        'coc-memorization',
        JSON.stringify([
          createMockMemorizationVerse({
            level: 5,
          }),
        ])
      );

      const { result } = renderHook(() => useMemorization());

      act(() => {
        result.current.recordReview('coc-bom-1908:I Nephi:3:7', true);
      });

      expect(result.current.verses[0].level).toBe(5);
    });

    it('should update review timestamps', () => {
      const { result } = renderHook(() => useMemorization());
      const beforeReview = Date.now();

      act(() => {
        result.current.addVerse({
          verseId: 'verse-1',
          book: 'I Nephi',
          chapter: 3,
          verse: 7,
          text: 'I will go and do',
        });
      });

      act(() => {
        result.current.recordReview('verse-1', true);
      });

      expect(result.current.verses[0].lastReviewedAt).toBeGreaterThanOrEqual(beforeReview);
      expect(result.current.verses[0].nextReviewAt).toBeGreaterThan(Date.now());
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      localStorageMock.setItem(
        'coc-memorization',
        JSON.stringify([
          createMockMemorizationVerse({ level: 0, nextReviewAt: Date.now() - 1000 }),
          createMockMemorizationVerse({
            id: 'mem-2',
            verseId: 'verse-2',
            level: 2,
            nextReviewAt: Date.now() + 10000,
          }),
          createMockMemorizationVerse({
            id: 'mem-3',
            verseId: 'verse-3',
            level: 4,
            nextReviewAt: Date.now() + 10000,
          }),
        ])
      );

      const { result } = renderHook(() => useMemorization());
      const stats = result.current.getStats();

      expect(stats.total).toBe(3);
      expect(stats.new).toBe(1);
      expect(stats.learning).toBe(1);
      expect(stats.mastered).toBe(1);
      expect(stats.dueForReview).toBe(1);
    });

    it('should return zero stats for empty list', () => {
      const { result } = renderHook(() => useMemorization());
      const stats = result.current.getStats();

      expect(stats).toEqual({
        total: 0,
        mastered: 0,
        learning: 0,
        new: 0,
        dueForReview: 0,
      });
    });
  });

  describe('helper functions', () => {
    it('should return correct level labels', () => {
      const { result } = renderHook(() => useMemorization());

      expect(result.current.getLevelLabel(0)).toBe('New');
      expect(result.current.getLevelLabel(1)).toBe('Learning');
      expect(result.current.getLevelLabel(5)).toBe('Mastered');
    });

    it('should generate hints with blanks', () => {
      const { result } = renderHook(() => useMemorization());

      const text = 'I will go and do the things';
      const hint = result.current.generateHint(text, 0.5);

      expect(hint.text).toContain('_');
      expect(hint.blanks).toBeGreaterThan(0);
    });

    it('should generate first letter hints', () => {
      const { result } = renderHook(() => useMemorization());

      const text = 'Hello World';
      const hint = result.current.getFirstLetterHint(text);

      expect(hint).toMatch(/^H____ W____$/);
    });

    it('should format next review times', () => {
      const { result } = renderHook(() => useMemorization());

      const now = Date.now();
      expect(result.current.formatNextReview(now - 1000)).toBe('Now');
      expect(result.current.formatNextReview(now + 3600000 * 2)).toContain('hours');
      expect(result.current.formatNextReview(now + 86400000 * 2)).toContain('days');
    });
  });

  describe('localStorage persistence', () => {
    it('should load verses from localStorage on mount', () => {
      const mockVerses = [
        createMockMemorizationVerse(),
        createMockMemorizationVerse({ id: 'mem-2', verseId: 'verse-2' }),
      ];

      localStorageMock.setItem('coc-memorization', JSON.stringify(mockVerses));

      const { result } = renderHook(() => useMemorization());

      expect(result.current.verses).toHaveLength(2);
      expect(result.current.verses[0].verseId).toBe('coc-bom-1908:I Nephi:3:7');
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorageMock.setItem('coc-memorization', 'invalid json');

      const { result } = renderHook(() => useMemorization());

      expect(result.current.verses).toEqual([]);
    });
  });
});
