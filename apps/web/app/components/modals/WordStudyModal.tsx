'use client';

import React, { useState, useEffect } from 'react';
import { CloseIcon, SearchIcon } from '../Icons';
import { useWordStudy } from '../../hooks/useWordStudy';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { type VolumeId } from '../../lib/types';

interface WordStudyModalProps {
  show: boolean;
  onClose: () => void;
  volumeId: VolumeId;
  onNavigate: (volumeId: VolumeId, bookName: string, chapter: number) => void;
}

export const WordStudyModal: React.FC<WordStudyModalProps> = ({
  show,
  onClose,
  volumeId,
  onNavigate,
}) => {
  const focusTrapRef = useFocusTrap(show);
  const { loading, error, result, studyWord, highlightWord, clearResult } = useWordStudy();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (show) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [show, onClose]);

  if (!show) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      studyWord(query.trim(), volumeId);
    }
  };

  const handleClose = () => {
    clearResult();
    setQuery('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-16 fade-in" onClick={handleClose} role="dialog" aria-modal="true">
      <div ref={focusTrapRef} className="bg-[var(--color-bg-primary)] rounded-2xl w-full max-w-3xl mx-4 shadow-2xl border border-[var(--color-border)] overflow-hidden max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b border-[var(--color-border-light)] flex items-center justify-between">
          <h2 className="text-lg font-semibold">Word Study / Concordance</h2>
          <button onClick={handleClose} className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)]"><CloseIcon /></button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="p-4 border-b border-[var(--color-border-light)]">
          <div className="relative">
            <input
              type="text"
              placeholder="Enter a word to study..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
              className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl px-4 py-3 pl-11 focus:outline-none focus:border-[var(--color-accent)]"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"><SearchIcon /></div>
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-[var(--color-accent)] text-white rounded-lg text-sm font-medium hover:opacity-90">
              Search
            </button>
          </div>
        </form>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-sm text-[var(--color-text-secondary)]">Searching scriptures...</p>
            </div>
          )}

          {error && (
            <div className="p-8 text-center text-red-500 text-sm">{error}</div>
          )}

          {result && !loading && (
            <div>
              {/* Summary */}
              <div className="p-4 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border-light)]">
                <div className="flex items-center gap-4 flex-wrap">
                  <div>
                    <span className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>
                      {result.totalOccurrences}
                    </span>
                    <span className="text-sm text-[var(--color-text-secondary)] ml-2">
                      occurrences of &ldquo;{result.word}&rdquo;
                    </span>
                  </div>
                </div>

                {/* By Book breakdown */}
                {result.byBook.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {result.byBook.slice(0, 10).map(({ book, count }) => (
                      <span key={book} className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--color-bg-tertiary)] rounded-lg text-xs">
                        <span className="font-medium">{book}</span>
                        <span className="text-[var(--color-text-tertiary)]">({count})</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Occurrences list */}
              <div className="divide-y divide-[var(--color-border-light)]">
                {result.occurrences.map((occ, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      onNavigate(occ.volumeId, occ.book, occ.chapter);
                      handleClose();
                    }}
                    className="w-full p-4 text-left hover:bg-[var(--color-bg-tertiary)] transition-colors"
                  >
                    <p className="text-[var(--color-accent)] font-medium text-sm mb-1">
                      {occ.reference}
                    </p>
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                      {highlightWord(occ.text, result.word).map((part, j) => (
                        <span key={j} className={part.isHighlighted ? 'bg-yellow-200 dark:bg-yellow-900/50 font-semibold text-[var(--color-text-primary)]' : ''}>
                          {part.text}
                        </span>
                      ))}
                    </p>
                  </button>
                ))}
              </div>

              {result.totalOccurrences === 0 && (
                <div className="p-8 text-center text-[var(--color-text-tertiary)]">
                  No occurrences found for &ldquo;{result.word}&rdquo;
                </div>
              )}
            </div>
          )}

          {!result && !loading && !error && (
            <div className="p-8 text-center">
              <div className="text-4xl mb-3">&#128214;</div>
              <p className="text-[var(--color-text-secondary)] text-sm">
                Search for any word to find all its occurrences across the scriptures.
              </p>
              <p className="text-[var(--color-text-tertiary)] text-xs mt-2">
                Try: faith, repentance, baptism, charity, hope
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
