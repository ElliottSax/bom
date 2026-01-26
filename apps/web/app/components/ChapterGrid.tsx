import React from 'react';
import { type Book, type Volume, type VolumeId } from '../lib/types';
import { ChevronLeftIcon, CheckIcon } from './Icons';
import { useUserData } from '../../contexts/UserDataContext';

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
    <div className="reading-container slide-in">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setSelectedBook(null)} className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-lg">
          <ChevronLeftIcon />
        </button>
        <div>
          <h2 className="chapter-heading border-0 pb-0 mb-0">{currentBook.name}</h2>
          <p className="text-[var(--color-text-tertiary)] text-sm">
            {currentBook.chapters} {volumeId === 'dc' ? 'paragraphs' : 'chapters'}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-8 gap-2">
        {Array.from({ length: currentBook.chapters || 0 }, (_, i) => i + 1).map(ch => {
          const read = isChapterRead(currentBook.id || '', ch);
          return (
            <button
              key={ch}
              onClick={() => setSelectedChapter(ch)}
              className={`aspect-square border rounded-xl flex items-center justify-center font-medium transition-colors relative ${
                read ? 'border-[var(--color-accent)]/30' : 'bg-[var(--color-bg-secondary)] hover:text-white border-[var(--color-border-light)]'
              }`}
              style={read ? { backgroundColor: currentVolume.color + '20', color: currentVolume.color } : undefined}
              onMouseEnter={e => !read && (e.currentTarget.style.backgroundColor = currentVolume.color)}
              onMouseLeave={e => !read && (e.currentTarget.style.backgroundColor = '')}
            >
              {ch}
              {read && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: currentVolume.color }}>
                  <CheckIcon />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ChapterGrid;
