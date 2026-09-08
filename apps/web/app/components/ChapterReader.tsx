import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Verse, Highlight, Note, Volume, Book } from '../lib/types';
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon } from './Icons';
import { VerseDisplay } from './VerseDisplay';
import { VerseSkeleton } from './LoadingSkeleton';
import { fadeIn, fadeInUp, transitionDefault, tapPress } from '../lib/motion';
import { useCrossReferences } from '../hooks/useCrossReferences';

// The cross-reference dataset was authored against the Book of Mormon's traditional
// Roman-numeral book names (e.g. "I Nephi"), while this app's book list uses Arabic
// numerals ("1 Nephi"). Bridge just that naming difference here rather than touching
// either the dataset or the book list.
const CROSS_REF_BOOK_NAME: Record<string, string> = {
  '1 Nephi': 'I Nephi',
  '2 Nephi': 'II Nephi',
  '3 Nephi': 'III Nephi',
  '4 Nephi': 'IV Nephi',
};

interface ChapterReaderProps {
  currentBook: Book;
  currentVolume: Volume;
  selectedChapter: number;
  verses: Verse[];
  loading: boolean;
  error?: Error | null;
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  showVerseNumbers: boolean;
  isChapterRead: boolean;
  isFirstChapter: boolean;
  isLastChapter: boolean;
  onBack: () => void;
  onPreviousChapter: () => void;
  onNextChapter: () => void;
  onMarkChapterRead: () => void;
  isBookmarked: (verseNum: number) => boolean;
  toggleBookmark: (verse: Verse) => void;
  getHighlight: (verseNum: number) => Highlight | undefined;
  setHighlightColor: (verseNum: number, color: string) => void;
  getNote: (verseNum: number) => Note | undefined;
  openNoteEditor: (verse: Verse) => void;
}

export const ChapterReader: React.FC<ChapterReaderProps> = ({
  currentBook,
  currentVolume,
  selectedChapter,
  verses,
  loading,
  error,
  fontSize,
  lineHeight,
  fontFamily,
  showVerseNumbers,
  isChapterRead,
  isFirstChapter,
  isLastChapter,
  onBack,
  onPreviousChapter,
  onNextChapter,
  onMarkChapterRead,
  isBookmarked,
  toggleBookmark,
  getHighlight,
  setHighlightColor,
  getNote,
  openNoteEditor,
}) => {
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);

  // Cross-references only exist for the Book of Mormon side of the dataset.
  const { getChapterCrossReferences } = useCrossReferences();
  const chapterCrossReferences = useMemo(() => {
    if (currentVolume.id !== 'bom') return null;
    const crossRefBookName = CROSS_REF_BOOK_NAME[currentBook.name] ?? currentBook.name;
    return getChapterCrossReferences('coc-bom-1908', crossRefBookName, selectedChapter);
  }, [currentVolume.id, currentBook.name, selectedChapter, getChapterCrossReferences]);

  return (
    <motion.div className="reading-container" variants={fadeIn} initial="hidden" animate="visible">
      {/* Chapter Header */}
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-[var(--color-bg-primary)] py-4 -mx-6 px-6 z-10 border-b border-[var(--color-border-light)]">
        <div className="flex items-center gap-3">
          <motion.button
            onClick={onBack}
            whileTap={tapPress}
            className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-lg transition-colors"
          >
            <ChevronLeftIcon />
          </motion.button>
          <div>
            <h2 className="text-xl font-medium" style={{ fontFamily: 'var(--font-serif)' }}>
              {currentBook.name} {selectedChapter}
            </h2>
            <p className="text-xs text-[var(--color-text-tertiary)]">{currentVolume.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isChapterRead && (
            <motion.button
              onClick={onMarkChapterRead}
              whileTap={tapPress}
              className="flex items-center gap-1 px-3 py-1.5 text-white rounded-lg text-sm"
              style={{ backgroundColor: currentVolume.color }}
            >
              <CheckIcon /> Mark Read
            </motion.button>
          )}

          <div className="flex items-center gap-1 bg-[var(--color-bg-secondary)] rounded-lg p-1 border border-[var(--color-border-light)]">
            <motion.button
              onClick={onPreviousChapter}
              disabled={isFirstChapter}
              whileTap={isFirstChapter ? undefined : tapPress}
              className="p-1.5 hover:bg-[var(--color-bg-tertiary)] rounded disabled:opacity-30 transition-colors"
            >
              <ChevronLeftIcon />
            </motion.button>
            <span className="text-xs text-[var(--color-text-tertiary)] min-w-[40px] text-center">
              {selectedChapter}/{currentBook.chapters}
            </span>
            <motion.button
              onClick={onNextChapter}
              disabled={isLastChapter}
              whileTap={isLastChapter ? undefined : tapPress}
              className="p-1.5 hover:bg-[var(--color-bg-tertiary)] rounded disabled:opacity-30 transition-colors"
            >
              <ChevronRightIcon />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Verses -- cross-fades on chapter change so navigation feels continuous */}
      <AnimatePresence mode="wait">
        {error ? (
          <motion.div
            key="error"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={transitionDefault}
            className="py-12 px-6 text-center"
          >
            <div className="max-w-md mx-auto">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                Failed to Load Verses
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                {error.message || 'An error occurred while loading the chapter.'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Retry
              </button>
            </div>
          </motion.div>
        ) : loading ? (
          <div className="space-y-4" role="status" aria-label="Loading verses">
            {Array.from({ length: 10 }, (_, i) => (
              <VerseSkeleton key={i} />
            ))}
          </div>
        ) : (
          <motion.div
            key={selectedChapter}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={transitionDefault}
            className="space-y-4"
          >
            {verses.map((verse) => (
              <VerseDisplay
                key={verse.num}
                verse={verse}
                isBookmarked={isBookmarked(verse.num)}
                highlight={getHighlight(verse.num)}
                note={getNote(verse.num)}
                isSelected={selectedVerse === verse.num}
                fontSize={fontSize}
                lineHeight={lineHeight}
                fontFamily={fontFamily}
                showVerseNumbers={showVerseNumbers}
                crossReferences={chapterCrossReferences?.get(verse.num)}
                bookName={currentBook.name}
                chapter={selectedChapter}
                onVerseClick={() =>
                  setSelectedVerse(selectedVerse === verse.num ? null : verse.num)
                }
                onToggleBookmark={() => toggleBookmark(verse)}
                onOpenNoteEditor={() => openNoteEditor(verse)}
                onSetHighlightColor={(color) => setHighlightColor(verse.num, color)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Navigation */}
      {verses.length > 0 && (
        <div className="flex justify-between items-center mt-12 pt-6 border-t border-[var(--color-border-light)]">
          <motion.button
            onClick={onPreviousChapter}
            disabled={isFirstChapter}
            whileTap={isFirstChapter ? undefined : tapPress}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-bg-secondary)] rounded-lg disabled:opacity-30 text-sm"
          >
            <ChevronLeftIcon /> Prev
          </motion.button>

          {!isChapterRead ? (
            <motion.button
              onClick={onMarkChapterRead}
              whileTap={tapPress}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm"
              style={{ backgroundColor: currentVolume.color }}
            >
              <CheckIcon /> Mark Read
            </motion.button>
          ) : (
            <span
              className="flex items-center gap-1 text-sm"
              style={{ color: currentVolume.color }}
            >
              <CheckIcon /> Done
            </span>
          )}

          <motion.button
            onClick={onNextChapter}
            disabled={isLastChapter}
            whileTap={isLastChapter ? undefined : tapPress}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-bg-secondary)] rounded-lg disabled:opacity-30 text-sm"
          >
            Next <ChevronRightIcon />
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};
