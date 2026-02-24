'use client';

import React, { useState, useMemo } from 'react';
import { CloseIcon, CheckIcon } from '../Icons';
import { useMemorization } from '../../hooks/useMemorization';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface MemorizationModalProps {
  show: boolean;
  onClose: () => void;
}

type ViewMode = 'list' | 'practice';

export const MemorizationModal: React.FC<MemorizationModalProps> = ({ show, onClose }) => {
  const focusTrapRef = useFocusTrap(show);
  const {
    verses, getDueVerses, recordReview, getStats,
    getLevelLabel, getLevelColor, formatNextReview,
    generateHint, getFirstLetterHint, removeVerse,
  } = useMemorization();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [hintLevel, setHintLevel] = useState(0); // 0=none, 1=first-letter, 2=partial

  const stats = getStats();
  const dueVerses = useMemo(() => getDueVerses(), [getDueVerses]);

  if (!show) return null;

  const currentVerse = dueVerses[currentIndex];

  const handleAnswer = (correct: boolean) => {
    if (!currentVerse) return;
    recordReview(currentVerse.verseId, correct);
    setShowAnswer(false);
    setHintLevel(0);
    if (currentIndex < dueVerses.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setViewMode('list');
      setCurrentIndex(0);
    }
  };

  const startPractice = () => {
    if (dueVerses.length === 0) return;
    setCurrentIndex(0);
    setShowAnswer(false);
    setHintLevel(0);
    setViewMode('practice');
  };

  const getHintText = (): string => {
    if (!currentVerse) return '';
    if (hintLevel === 1) return getFirstLetterHint(currentVerse.text);
    if (hintLevel === 2) return generateHint(currentVerse.text, 0.4).text;
    return '';
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center fade-in" onClick={onClose} role="dialog" aria-modal="true">
      <div ref={focusTrapRef} className="bg-[var(--color-bg-primary)] rounded-2xl w-full max-w-2xl mx-4 shadow-2xl border border-[var(--color-border)] overflow-hidden max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b border-[var(--color-border-light)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">
              {viewMode === 'practice' ? 'Practice' : 'Verse Memorization'}
            </h2>
            {viewMode === 'practice' && (
              <span className="text-sm text-[var(--color-text-tertiary)]">
                {currentIndex + 1} / {dueVerses.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {viewMode === 'practice' && (
              <button onClick={() => { setViewMode('list'); setShowAnswer(false); setHintLevel(0); }}
                className="px-3 py-1.5 text-sm bg-[var(--color-bg-tertiary)] rounded-lg">
                Back to List
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)]"><CloseIcon /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {viewMode === 'list' ? (
            <div className="p-4">
              {/* Stats */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="bg-[var(--color-bg-secondary)] rounded-xl p-3 text-center border border-[var(--color-border-light)]">
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">Total</p>
                </div>
                <div className="bg-[var(--color-bg-secondary)] rounded-xl p-3 text-center border border-[var(--color-border-light)]">
                  <p className="text-2xl font-bold text-green-500">{stats.mastered}</p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">Mastered</p>
                </div>
                <div className="bg-[var(--color-bg-secondary)] rounded-xl p-3 text-center border border-[var(--color-border-light)]">
                  <p className="text-2xl font-bold text-blue-500">{stats.learning}</p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">Learning</p>
                </div>
                <div className="bg-[var(--color-bg-secondary)] rounded-xl p-3 text-center border border-[var(--color-border-light)]">
                  <p className="text-2xl font-bold text-orange-500">{stats.dueForReview}</p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">Due</p>
                </div>
              </div>

              {/* Practice button */}
              {dueVerses.length > 0 && (
                <button onClick={startPractice}
                  className="w-full mb-6 px-6 py-3 bg-[var(--color-accent)] text-white rounded-xl font-semibold hover:opacity-90 transition">
                  Practice {dueVerses.length} Due Verse{dueVerses.length !== 1 ? 's' : ''}
                </button>
              )}

              {/* Verse List */}
              {verses.length > 0 ? (
                <div className="space-y-2">
                  {verses.map(v => (
                    <div key={v.id} className="flex items-center justify-between p-3 bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border-light)]">
                      <div className="flex-1 min-w-0 mr-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{v.book} {v.chapter}:{v.verse}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: getLevelColor(v.level) }}>
                            {getLevelLabel(v.level)}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--color-text-secondary)] line-clamp-1">{v.text}</p>
                        <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                          Next review: {formatNextReview(v.nextReviewAt)}
                        </p>
                      </div>
                      <button onClick={() => removeVerse(v.verseId)} className="text-xs text-red-500 hover:text-red-600 shrink-0">Remove</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">&#129504;</div>
                  <p className="text-[var(--color-text-secondary)] text-sm">No verses to memorize yet</p>
                  <p className="text-[var(--color-text-tertiary)] text-xs mt-1">
                    Long-press a verse while reading to add it for memorization
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Practice Mode */
            <div className="p-6">
              {currentVerse ? (
                <div>
                  <div className="text-center mb-6">
                    <span className="text-sm font-medium" style={{ color: 'var(--color-accent)' }}>
                      {currentVerse.book} {currentVerse.chapter}:{currentVerse.verse}
                    </span>
                    <span className="text-xs ml-2 px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: getLevelColor(currentVerse.level) }}>
                      {getLevelLabel(currentVerse.level)}
                    </span>
                  </div>

                  {!showAnswer ? (
                    <div>
                      <div className="bg-[var(--color-bg-secondary)] rounded-xl p-6 mb-4 text-center border border-[var(--color-border-light)]">
                        <p className="text-lg font-medium mb-2">Can you recite this verse?</p>
                        {hintLevel > 0 && (
                          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mt-4 font-mono">
                            {getHintText()}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 justify-center mb-4">
                        {hintLevel < 2 && (
                          <button onClick={() => setHintLevel(prev => prev + 1)}
                            className="px-4 py-2 bg-[var(--color-bg-tertiary)] rounded-lg text-sm hover:bg-[var(--color-border)] transition">
                            {hintLevel === 0 ? 'Show First Letters' : 'Show More Hints'}
                          </button>
                        )}
                        <button onClick={() => setShowAnswer(true)}
                          className="px-6 py-2 bg-[var(--color-accent)] text-white rounded-lg text-sm font-medium hover:opacity-90">
                          Show Answer
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="bg-[var(--color-bg-secondary)] rounded-xl p-6 mb-6 border border-[var(--color-border-light)]">
                        <p className="text-sm leading-relaxed">{currentVerse.text}</p>
                      </div>
                      <p className="text-center text-sm text-[var(--color-text-secondary)] mb-4">How did you do?</p>
                      <div className="flex gap-3 justify-center">
                        <button onClick={() => handleAnswer(false)}
                          className="px-6 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition">
                          Needs Work
                        </button>
                        <button onClick={() => handleAnswer(true)}
                          className="px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition flex items-center gap-2">
                          <CheckIcon /> Got It
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">&#127881;</div>
                  <p className="font-medium">All caught up!</p>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1">No more verses due for review</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
