import React from 'react';
import { ChevronLeftIcon, CheckIcon } from './Icons';
import { type Book, type Volume } from '../lib/types';

interface BookChapterSelectorProps {
  currentBook: Book;
  currentVolume: Volume;
  volumeId: string;
  onBack: () => void;
  onChapterSelect: (chapter: number) => void;
  isChapterRead: (bookId: string, chapter: number) => boolean;
}

export const BookChapterSelector: React.FC<BookChapterSelectorProps> = ({
  currentBook,
  currentVolume,
  volumeId,
  onBack,
  onChapterSelect,
  isChapterRead,
}) => {
  return (
    <div className="reading-container slide-in">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-lg">
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
        {Array.from({ length: currentBook.chapters }, (_, i) => i + 1).map((chapter) => {
          const isRead = isChapterRead(currentBook.id, chapter);

          return (
            <button
              key={chapter}
              onClick={() => onChapterSelect(chapter)}
              className={`aspect-square border rounded-xl flex items-center justify-center font-medium transition-colors relative ${
                isRead
                  ? 'border-[var(--color-accent)]/30'
                  : 'bg-[var(--color-bg-secondary)] hover:text-white border-[var(--color-border-light)]'
              }`}
              style={
                isRead
                  ? { backgroundColor: currentVolume.color + '20', color: currentVolume.color }
                  : undefined
              }
              onMouseEnter={(e) => {
                if (!isRead) {
                  e.currentTarget.style.backgroundColor = currentVolume.color;
                }
              }}
              onMouseLeave={(e) => {
                if (!isRead) {
                  e.currentTarget.style.backgroundColor = '';
                }
              }}
            >
              {chapter}
              {isRead && (
                <div
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: currentVolume.color }}
                >
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
