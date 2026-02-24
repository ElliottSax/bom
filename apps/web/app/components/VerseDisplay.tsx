import React from 'react';
import { Verse, Highlight, Note } from '../lib/types';
import { BookmarkIcon, NoteIcon } from './Icons';
import { HIGHLIGHT_COLORS } from '../lib/types';
import { ShareVerseButton } from './ShareButton';

interface VerseDisplayProps {
  verse: Verse;
  isBookmarked: boolean;
  highlight: Highlight | undefined;
  note: Note | undefined;
  isSelected: boolean;
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  showVerseNumbers: boolean;
  bookName?: string;
  chapter?: number;
  onVerseClick: () => void;
  onToggleBookmark: () => void;
  onOpenNoteEditor: () => void;
  onSetHighlightColor: (color: string) => void;
}

const VerseDisplayComponent: React.FC<VerseDisplayProps> = ({
  verse,
  isBookmarked,
  highlight,
  note,
  isSelected,
  fontSize,
  lineHeight,
  fontFamily,
  showVerseNumbers,
  bookName,
  chapter,
  onVerseClick,
  onToggleBookmark,
  onOpenNoteEditor,
  onSetHighlightColor,
}) => {
  const reference = bookName && chapter ? `${bookName} ${chapter}:${verse.num}` : `Verse ${verse.num}`;
  return (
    <div>
      <div
        onClick={onVerseClick}
        className={`group py-2 px-3 -mx-3 rounded-lg transition cursor-pointer ${
          isSelected ? 'bg-[var(--color-bg-tertiary)]' : 'hover:bg-[var(--color-bg-secondary)]'
        } ${highlight ? highlight.color : ''}`}
      >
        <p
          className={fontFamily === 'serif' ? 'scripture-text' : 'scripture-text scripture-text--sans'}
          style={{ fontSize: `${fontSize}px`, lineHeight }}
        >
          {showVerseNumbers && <span className="verse-number">{verse.num}</span>}
          {verse.text}
        </p>

        {note && (
          <div className="mt-2 p-3 bg-[var(--color-gold)]/10 rounded-lg text-sm text-[var(--color-gold)] border-l-2 border-[var(--color-gold)]">
            {note.content}
          </div>
        )}

        {isBookmarked && (
          <div className="flex items-center gap-2 mt-1 opacity-60">
            <BookmarkIcon filled />
          </div>
        )}
      </div>

      {isSelected && (
        <div className="mt-2 mb-4 p-4 bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border-light)] flex flex-wrap gap-2 items-center slide-in">
          <button
            onClick={onToggleBookmark}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
              isBookmarked ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-bg-tertiary)]'
            }`}
          >
            <BookmarkIcon filled={isBookmarked} /> {isBookmarked ? 'Saved' : 'Save'}
          </button>

          <button
            onClick={onOpenNoteEditor}
            className="flex items-center gap-2 px-3 py-2 bg-[var(--color-bg-tertiary)] rounded-lg text-sm font-medium"
          >
            <NoteIcon /> {note ? 'Edit' : 'Note'}
          </button>

          <ShareVerseButton
            verse={verse.text}
            reference={reference}
            variant="secondary"
            size="sm"
          />

          <div className="flex items-center gap-1 ml-auto">
            <span className="text-xs text-[var(--color-text-tertiary)] mr-2">Highlight:</span>
            {HIGHLIGHT_COLORS.map((c) => (
              <button
                key={c.name}
                onClick={() => onSetHighlightColor(c.className)}
                className={`w-6 h-6 rounded-full transition hover:scale-110 ${c.className} ${
                  highlight?.color === c.className ? 'ring-2 ring-[var(--color-accent)] ring-offset-2' : ''
                }`}
                title={c.name}
              />
            ))}
            {highlight && (
              <button
                onClick={() => onSetHighlightColor('')}
                className="w-6 h-6 rounded-full border border-[var(--color-border)] text-xs flex items-center justify-center ml-1"
              >
                ×
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Memoize to prevent unnecessary re-renders when parent re-renders
export const VerseDisplay = React.memo(VerseDisplayComponent);
