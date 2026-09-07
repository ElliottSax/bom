import React from 'react';
import { motion } from 'motion/react';
import { type Book, type Volume, type VolumeId } from '../lib/types';
import { ChevronLeftIcon, CheckIcon } from './Icons';
import { useUserData } from '../contexts/UserDataContext';
import { fadeIn, tapPress, transitionFast } from '../lib/motion';

interface ChapterGridProps {
  currentBook: Book | undefined;
  currentVolume: Volume;
  setSelectedBook: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedChapter: React.Dispatch<React.SetStateAction<number | null>>;
  volumeId: VolumeId;
}

const ChapterGrid: React.FC<ChapterGridProps> = ({
  currentBook,
  currentVolume,
  setSelectedBook,
  setSelectedChapter,
  volumeId,
}) => {
  const { isChapterRead } = useUserData();
  if (!currentBook) return null; // Should not happen if rendering is conditional on selectedBook

  return (
    <motion.div className="reading-container" variants={fadeIn} initial="hidden" animate="visible">
      <div className="flex items-center gap-4 mb-8">
        <motion.button
          onClick={() => setSelectedBook(null)}
          whileTap={tapPress}
          className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-lg transition-colors"
        >
          <ChevronLeftIcon />
        </motion.button>
        <div>
          <h2 className="chapter-heading border-0 pb-0 mb-0">{currentBook.name}</h2>
          <p className="text-[var(--color-text-tertiary)] text-sm">
            {currentBook.chapters} {volumeId === 'dc' ? 'paragraphs' : 'chapters'}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-8 gap-2">
        {Array.from({ length: currentBook.chapters || 0 }, (_, i) => i + 1).map((ch) => {
          const read = isChapterRead(currentBook.id || '', ch);
          return (
            <motion.button
              key={ch}
              onClick={() => setSelectedChapter(ch)}
              whileHover={
                read ? { scale: 1.04 } : { backgroundColor: currentVolume.color, scale: 1.04 }
              }
              whileTap={tapPress}
              transition={transitionFast}
              className={`aspect-square border rounded-xl flex items-center justify-center font-medium relative ${
                read
                  ? 'border-[var(--color-accent)]/30'
                  : 'bg-[var(--color-bg-secondary)] hover:text-white border-[var(--color-border-light)]'
              }`}
              style={
                read
                  ? { backgroundColor: currentVolume.color + '20', color: currentVolume.color }
                  : undefined
              }
            >
              {ch}
              {read && (
                <div
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: currentVolume.color }}
                >
                  <CheckIcon />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ChapterGrid;
