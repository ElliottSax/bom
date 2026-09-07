import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { type Book, type Volume, type Verse, HIGHLIGHT_COLORS } from '../lib/types';
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, BookmarkIcon, NoteIcon } from './Icons';
import { useSettings } from '../contexts/SettingsContext';
import { useUserData } from '../contexts/UserDataContext';
import { fadeIn, fadeInUp, transitionDefault, transitionFast, tapPress } from '../lib/motion';

interface VerseViewProps {
  currentBook: Book | undefined;
  selectedChapter: number | null;
  currentVolume: Volume;
  setSelectedChapter: React.Dispatch<React.SetStateAction<number | null>>;
  setVerses: React.Dispatch<React.SetStateAction<Verse[]>>;
  loading: boolean;
  verses: Verse[];
  selectedVerse: number | null;
  setSelectedVerse: React.Dispatch<React.SetStateAction<number | null>>;
}

const VerseView: React.FC<VerseViewProps> = ({
  currentBook,
  selectedChapter,
  currentVolume,
  setSelectedChapter,
  setVerses,
  loading,
  verses,
  selectedVerse,
  setSelectedVerse,
}) => {
  const { fontSize, lineHeight, fontFamily, showVerseNumbers } = useSettings();
  const {
    isBookmarked,
    toggleBookmark,
    getHighlight,
    setHighlightColor,
    getNote,
    openNoteEditor,
    markChapterRead,
    isChapterRead,
  } = useUserData();
  return (
    <motion.div className="reading-container" variants={fadeIn} initial="hidden" animate="visible">
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-[var(--color-bg-primary)] py-4 -mx-6 px-6 z-10 border-b border-[var(--color-border-light)]">
        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => {
              setSelectedChapter(null);
              setVerses([]);
            }}
            whileTap={tapPress}
            className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-lg transition-colors"
          >
            <ChevronLeftIcon />
          </motion.button>
          <div>
            <h2 className="text-xl font-medium" style={{ fontFamily: 'var(--font-serif)' }}>
              {currentBook?.name} {selectedChapter}
            </h2>
            <p className="text-xs text-[var(--color-text-tertiary)]">{currentVolume.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isChapterRead(currentBook?.id || '', selectedChapter || 0) && (
            <motion.button
              onClick={() => markChapterRead(currentBook?.id || '', selectedChapter || 0)}
              whileTap={tapPress}
              className="flex items-center gap-1 px-3 py-1.5 text-white rounded-lg text-sm"
              style={{ backgroundColor: currentVolume.color }}
            >
              <CheckIcon /> Mark Read
            </motion.button>
          )}
          <div className="flex items-center gap-1 bg-[var(--color-bg-secondary)] rounded-lg p-1 border border-[var(--color-border-light)]">
            <motion.button
              onClick={() => setSelectedChapter(Math.max(1, (selectedChapter || 1) - 1))}
              disabled={selectedChapter === 1}
              whileTap={selectedChapter === 1 ? undefined : tapPress}
              className="p-1.5 hover:bg-[var(--color-bg-tertiary)] rounded disabled:opacity-30 transition-colors"
            >
              <ChevronLeftIcon />
            </motion.button>
            <span className="text-xs text-[var(--color-text-tertiary)] min-w-[40px] text-center">
              {selectedChapter}/{currentBook?.chapters}
            </span>
            <motion.button
              onClick={() =>
                setSelectedChapter(Math.min(currentBook?.chapters || 1, (selectedChapter || 1) + 1))
              }
              disabled={selectedChapter === currentBook?.chapters}
              whileTap={selectedChapter === currentBook?.chapters ? undefined : tapPress}
              className="p-1.5 hover:bg-[var(--color-bg-tertiary)] rounded disabled:opacity-30 transition-colors"
            >
              <ChevronRightIcon />
            </motion.button>
          </div>
        </div>
      </div>
      <AnimatePresence mode="wait">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div
              className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent"
              style={{ borderColor: currentVolume.color }}
            />
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
            {verses.map((verse) => {
              const hl = getHighlight(verse.num),
                nt = getNote(verse.num),
                bm = isBookmarked(verse.num);
              return (
                <div key={verse.num}>
                  <div
                    onClick={() => setSelectedVerse(selectedVerse === verse.num ? null : verse.num)}
                    className={`group py-2 px-3 -mx-3 rounded-lg transition cursor-pointer ${selectedVerse === verse.num ? 'bg-[var(--color-bg-tertiary)]' : 'hover:bg-[var(--color-bg-secondary)]'} ${hl ? hl.color : ''}`}
                  >
                    <p
                      className={
                        fontFamily === 'serif'
                          ? 'scripture-text'
                          : 'scripture-text scripture-text--sans'
                      }
                      style={{ fontSize: `${fontSize}px`, lineHeight }}
                    >
                      {showVerseNumbers && <span className="verse-number">{verse.num}</span>}
                      {verse.text}
                    </p>
                    {nt && (
                      <div className="mt-2 p-3 bg-[var(--color-gold)]/10 rounded-lg text-sm text-[var(--color-gold)] border-l-2 border-[var(--color-gold)]">
                        {nt.content}
                      </div>
                    )}
                    {bm && (
                      <div className="flex items-center gap-2 mt-1 opacity-60">
                        <BookmarkIcon filled />
                      </div>
                    )}
                  </div>
                  <AnimatePresence>
                    {selectedVerse === verse.num && (
                      <motion.div
                        key="verse-actions"
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        transition={transitionFast}
                        className="mt-2 mb-4 p-4 bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border-light)] flex flex-wrap gap-2 items-center"
                      >
                        <motion.button
                          onClick={() => toggleBookmark(verse)}
                          whileTap={tapPress}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${bm ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-bg-tertiary)]'}`}
                        >
                          <BookmarkIcon filled={bm} /> {bm ? 'Saved' : 'Save'}
                        </motion.button>
                        <motion.button
                          onClick={() => openNoteEditor(verse)}
                          whileTap={tapPress}
                          className="flex items-center gap-2 px-3 py-2 bg-[var(--color-bg-tertiary)] rounded-lg text-sm font-medium"
                        >
                          <NoteIcon /> {nt ? 'Edit' : 'Note'}
                        </motion.button>
                        <div className="flex items-center gap-1 ml-auto">
                          <span className="text-xs text-[var(--color-text-tertiary)] mr-2">
                            Highlight:
                          </span>
                          {HIGHLIGHT_COLORS.map((c) => (
                            <motion.button
                              key={c.name}
                              onClick={() => setHighlightColor(verse.num, c.className)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={tapPress}
                              transition={transitionFast}
                              className={`w-6 h-6 rounded-full ${c.className} ${hl?.color === c.className ? 'ring-2 ring-[var(--color-accent)] ring-offset-2' : ''}`}
                              title={c.name}
                            />
                          ))}
                          {hl && (
                            <motion.button
                              onClick={() => setHighlightColor(verse.num, '')}
                              whileTap={tapPress}
                              className="w-6 h-6 rounded-full border border-[var(--color-border)] text-xs flex items-center justify-center ml-1"
                            >
                              ×
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
      {verses.length > 0 && (
        <div className="flex justify-between items-center mt-12 pt-6 border-t border-[var(--color-border-light)]">
          <motion.button
            onClick={() => setSelectedChapter(Math.max(1, (selectedChapter || 1) - 1))}
            disabled={selectedChapter === 1}
            whileTap={selectedChapter === 1 ? undefined : tapPress}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-bg-secondary)] rounded-lg disabled:opacity-30 text-sm"
          >
            <ChevronLeftIcon /> Prev
          </motion.button>
          {!isChapterRead(currentBook?.id || '', selectedChapter || 0) ? (
            <motion.button
              onClick={() => markChapterRead(currentBook?.id || '', selectedChapter || 0)}
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
            onClick={() =>
              setSelectedChapter(Math.min(currentBook?.chapters || 1, (selectedChapter || 1) + 1))
            }
            disabled={selectedChapter === currentBook?.chapters}
            whileTap={selectedChapter === currentBook?.chapters ? undefined : tapPress}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-bg-secondary)] rounded-lg disabled:opacity-30 text-sm"
          >
            Next <ChevronRightIcon />
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};

export default VerseView;
