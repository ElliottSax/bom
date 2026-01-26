import React from 'react';
import { type Book, type Volume, type Verse, HIGHLIGHT_COLORS } from '../lib/types';
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, BookmarkIcon, NoteIcon } from './Icons';
import { useSettings } from '../contexts/SettingsContext';
import { useUserData } from '../contexts/UserDataContext';

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
  const { isBookmarked, toggleBookmark, getHighlight, setHighlightColor, getNote, openNoteEditor, markChapterRead, isChapterRead } = useUserData();
  return (
    <div className="reading-container slide-in">
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-[var(--color-bg-primary)] py-4 -mx-6 px-6 z-10 border-b border-[var(--color-border-light)]">
        <div className="flex items-center gap-3">
          <button onClick={() => { setSelectedChapter(null); setVerses([]); }} className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-lg">
            <ChevronLeftIcon />
          </button>
          <div>
            <h2 className="text-xl font-medium" style={{ fontFamily: 'var(--font-serif)' }}>{currentBook?.name} {selectedChapter}</h2>
            <p className="text-xs text-[var(--color-text-tertiary)]">{currentVolume.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isChapterRead(currentBook?.id || '', selectedChapter || 0) && (
            <button onClick={() => markChapterRead(currentBook?.id || '', selectedChapter || 0)} className="flex items-center gap-1 px-3 py-1.5 text-white rounded-lg text-sm" style={{ backgroundColor: currentVolume.color }}>
              <CheckIcon /> Mark Read
            </button>
          )}
          <div className="flex items-center gap-1 bg-[var(--color-bg-secondary)] rounded-lg p-1 border border-[var(--color-border-light)]">
            <button onClick={() => setSelectedChapter(Math.max(1, (selectedChapter || 1) - 1))} disabled={selectedChapter === 1} className="p-1.5 hover:bg-[var(--color-bg-tertiary)] rounded disabled:opacity-30">
              <ChevronLeftIcon />
            </button>
            <span className="text-xs text-[var(--color-text-tertiary)] min-w-[40px] text-center">{selectedChapter}/{currentBook?.chapters}</span>
            <button onClick={() => setSelectedChapter(Math.min((currentBook?.chapters || 1), (selectedChapter || 1) + 1))} disabled={selectedChapter === currentBook?.chapters} className="p-1.5 hover:bg-[var(--color-bg-tertiary)] rounded disabled:opacity-30">
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent" style={{ borderColor: currentVolume.color }} />
        </div>
      ) : (
        <div className="space-y-4">
          {verses.map(verse => {
            const hl = getHighlight(verse.num), nt = getNote(verse.num), bm = isBookmarked(verse.num);
            return (
              <div key={verse.num}>
                <div onClick={() => setSelectedVerse(selectedVerse === verse.num ? null : verse.num)} className={`group py-2 px-3 -mx-3 rounded-lg transition cursor-pointer ${selectedVerse === verse.num ? 'bg-[var(--color-bg-tertiary)]' : 'hover:bg-[var(--color-bg-secondary)]'} ${hl ? hl.color : ''}`}>
                  <p className={fontFamily === 'serif' ? 'scripture-text' : 'scripture-text scripture-text--sans'} style={{ fontSize: `${fontSize}px`, lineHeight }}>{showVerseNumbers && <span className="verse-number">{verse.num}</span>}{verse.text}</p>
                  {nt && <div className="mt-2 p-3 bg-[var(--color-gold)]/10 rounded-lg text-sm text-[var(--color-gold)] border-l-2 border-[var(--color-gold)]">{nt.content}</div>}
                  {bm && <div className="flex items-center gap-2 mt-1 opacity-60"><BookmarkIcon filled /></div>}
                </div>
                {selectedVerse === verse.num && (
                  <div className="mt-2 mb-4 p-4 bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border-light)] flex flex-wrap gap-2 items-center slide-in">
                    <button onClick={() => toggleBookmark(verse)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${bm ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-bg-tertiary)]'}`}>
                      <BookmarkIcon filled={bm} /> {bm ? 'Saved' : 'Save'}
                    </button>
                    <button onClick={() => openNoteEditor(verse)} className="flex items-center gap-2 px-3 py-2 bg-[var(--color-bg-tertiary)] rounded-lg text-sm font-medium">
                      <NoteIcon /> {nt ? 'Edit' : 'Note'}
                    </button>
                    <div className="flex items-center gap-1 ml-auto">
                      <span className="text-xs text-[var(--color-text-tertiary)] mr-2">Highlight:</span>
                      {HIGHLIGHT_COLORS.map(c => (
                        <button key={c.name} onClick={() => setHighlightColor(verse.num, c.className)} className={`w-6 h-6 rounded-full transition hover:scale-110 ${c.className} ${hl?.color === c.className ? 'ring-2 ring-[var(--color-accent)] ring-offset-2' : ''}`} title={c.name} />
                      ))}
                      {hl && (
                        <button onClick={() => setHighlightColor(verse.num, '')} className="w-6 h-6 rounded-full border border-[var(--color-border)] text-xs flex items-center justify-center ml-1">
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {verses.length > 0 && (
        <div className="flex justify-between items-center mt-12 pt-6 border-t border-[var(--color-border-light)]">
          <button onClick={() => setSelectedChapter(Math.max(1, (selectedChapter || 1) - 1))} disabled={selectedChapter === 1} className="flex items-center gap-2 px-4 py-2 bg-[var(--color-bg-secondary)] rounded-lg disabled:opacity-30 text-sm">
            <ChevronLeftIcon /> Prev
          </button>
          {!isChapterRead(currentBook?.id || '', selectedChapter || 0) ? (
            <button onClick={() => markChapterRead(currentBook?.id || '', selectedChapter || 0)} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm" style={{ backgroundColor: currentVolume.color }}>
              <CheckIcon /> Mark Read
            </button>
          ) : (
            <span className="flex items-center gap-1 text-sm" style={{ color: currentVolume.color }}>
              <CheckIcon /> Done
            </span>
          )}
          <button onClick={() => setSelectedChapter(Math.min((currentBook?.chapters || 1), (selectedChapter || 1) + 1))} disabled={selectedChapter === currentBook?.chapters} className="flex items-center gap-2 px-4 py-2 bg-[var(--color-bg-secondary)] rounded-lg disabled:opacity-30 text-sm">
            Next <ChevronRightIcon />
          </button>
        </div>
      )}
    </div>
  );
};

export default VerseView;
