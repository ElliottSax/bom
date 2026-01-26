import React from 'react';
import { type Book } from '../lib/types';
import { CloseIcon } from './Icons';
import { useUserData } from '../contexts/UserDataContext';

interface NoteEditorModalProps {
  currentBook: Book | undefined;
  selectedChapter: number | null;
}

const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  currentBook,
  selectedChapter,
}) => {
  const { showNoteEditor, setShowNoteEditor, editingNoteVerse, noteContent, setNoteContent, saveNote } = useUserData();
  if (!showNoteEditor) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in">
      <div className="bg-[var(--color-bg-primary)] rounded-2xl w-full max-w-lg shadow-2xl border border-[var(--color-border)]">
        <div className="p-4 border-b border-[var(--color-border-light)] flex justify-between items-center">
          <div>
            <h3 className="font-semibold">Note</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">{currentBook?.name} {selectedChapter}:{editingNoteVerse}</p>
          </div>
          <button onClick={() => setShowNoteEditor(false)} className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-lg">
            <CloseIcon />
          </button>
        </div>
        <div className="p-4">
          <textarea
            value={noteContent}
            onChange={e => setNoteContent(e.target.value)}
            placeholder="Write your thoughts..."
            className="w-full h-40 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl p-4 focus:outline-none focus:border-[var(--color-accent)] resize-none"
            autoFocus
          />
        </div>
        <div className="p-4 border-t border-[var(--color-border-light)] flex justify-end gap-2">
          <button onClick={() => setShowNoteEditor(false)} className="px-4 py-2 text-[var(--color-text-secondary)]">Cancel</button>
          <button onClick={saveNote} className="px-5 py-2 bg-[var(--color-accent)] text-white font-medium rounded-lg">Save</button>
        </div>
      </div>
    </div>
  );
};

export default NoteEditorModal;
