import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { type Volume, type Book, type Verse, type VolumeId } from '../lib/types';
import { CloseIcon, FireIcon } from './Icons';
import { useUserData } from '../contexts/UserDataContext';
import { fadeInUp, transitionFast } from '../lib/motion';

const SIDEBAR_TABS = ['books', 'bookmarks', 'notes', 'progress'] as const;

interface SidebarProps {
  sidebarOpen: boolean;
  activeTab: 'books' | 'bookmarks' | 'notes' | 'progress';
  setActiveTab: React.Dispatch<React.SetStateAction<'books' | 'bookmarks' | 'notes' | 'progress'>>;
  currentVolume: Volume;
  books: Book[];
  selectedBook: string | null;
  setSelectedBook: (bookId: string) => void;
  setSelectedChapter: React.Dispatch<React.SetStateAction<number | null>>;
  setVerses: React.Dispatch<React.SetStateAction<Verse[]>>;
  totalChapters: number;
  navigateToReference: (volumeId: VolumeId, book: string, chapter: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  sidebarOpen,
  activeTab,
  setActiveTab,
  currentVolume,
  books,
  selectedBook,
  setSelectedBook,
  setSelectedChapter,
  setVerses,
  totalChapters,
  navigateToReference,
}) => {
  const { bookmarks, notes, readingProgress, deleteNote } = useUserData();

  const chaptersReadInVolume = Object.keys(readingProgress.chaptersRead).filter((key) =>
    key.startsWith(`${currentVolume.id}:`)
  ).length;
  const completionPercentage = Math.round((chaptersReadInVolume / totalChapters) * 100);

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.aside
          key="sidebar"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="sidebar w-64 xl:w-72 flex flex-col flex-shrink-0 no-print"
        >
          <div className="flex border-b border-[var(--color-border-light)]">
            {SIDEBAR_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative flex-1 py-3 text-xs font-medium transition-colors ${activeTab === tab ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && (
                  <motion.span
                    layoutId="sidebar-tab-indicator"
                    className="absolute left-0 right-0 -bottom-px h-0.5 bg-[var(--color-accent)]"
                    transition={transitionFast}
                  />
                )}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'books' && (
              <div className="p-3">
                <div className="mb-3 px-2">
                  <p
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: currentVolume.color }}
                  >
                    {currentVolume.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    {currentVolume.description}
                  </p>
                </div>
                <nav className="space-y-0.5">
                  {books.map((book) => (
                    <button
                      key={book.id}
                      onClick={() => {
                        setSelectedBook(book.id);
                        setSelectedChapter(null);
                        setVerses([]);
                      }}
                      className={`sidebar-item w-full flex items-center justify-between text-left text-sm ${selectedBook === book.id ? 'sidebar-item--active' : ''}`}
                    >
                      <span className="truncate">{book.name}</span>
                      <span className="text-xs opacity-60 ml-2">{book.chapters}</span>
                    </button>
                  ))}
                </nav>
              </div>
            )}
            {activeTab === 'bookmarks' && (
              <div className="p-3">
                {bookmarks.length === 0 ? (
                  <div className="py-12 text-center text-[var(--color-text-tertiary)] text-sm">
                    No bookmarks
                  </div>
                ) : (
                  <div className="space-y-2">
                    {bookmarks
                      .sort((a, b) => b.createdAt - a.createdAt)
                      .map((bm) => (
                        <button
                          key={bm.id}
                          onClick={() => navigateToReference(bm.volumeId, bm.book, bm.chapter)}
                          className="w-full p-3 bg-[var(--color-bg-tertiary)] rounded-lg text-left hover:bg-[var(--color-border)]"
                        >
                          <p className="text-[var(--color-accent)] text-xs font-medium">
                            {bm.reference}
                          </p>
                          <p className="text-[var(--color-text-secondary)] text-xs mt-1 line-clamp-2">
                            {bm.text}
                          </p>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            )}
            {activeTab === 'notes' && (
              <div className="p-3">
                {notes.length === 0 ? (
                  <div className="py-12 text-center text-[var(--color-text-tertiary)] text-sm">
                    No notes
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notes
                      .sort((a, b) => b.updatedAt - a.updatedAt)
                      .map((n) => (
                        <div key={n.id} className="p-3 bg-[var(--color-bg-tertiary)] rounded-lg">
                          <div className="flex justify-between items-start">
                            <button
                              onClick={() => navigateToReference(n.volumeId, n.book, n.chapter)}
                              className="text-[var(--color-accent)] text-xs font-medium hover:underline"
                            >
                              {n.book} {n.chapter}:{n.verse}
                            </button>
                            <button
                              onClick={() => deleteNote(n.id)}
                              className="text-[var(--color-text-tertiary)] hover:text-red-500 text-xs p-1"
                            >
                              <CloseIcon />
                            </button>
                          </div>
                          <p className="text-[var(--color-text-secondary)] text-xs mt-2 line-clamp-3">
                            {n.content}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
            {activeTab === 'progress' && (
              <div className="p-3">
                <div className="bg-[var(--color-bg-tertiary)] rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">{currentVolume.shortName}</span>
                    <span className="text-lg font-bold" style={{ color: currentVolume.color }}>
                      {completionPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-[var(--color-border)] rounded-full h-2 mb-3">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${completionPercentage}%`,
                        backgroundColor: currentVolume.color,
                      }}
                    />
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {chaptersReadInVolume}/{totalChapters} chapters
                  </p>
                </div>
                <div className="bg-[var(--color-bg-tertiary)] rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-gold-600 dark:text-gold-300">
                      <FireIcon />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Streak</p>
                      <p className="text-2xl font-bold">{readingProgress.currentStreak} days</p>
                      <p className="text-xs text-[var(--color-text-tertiary)]">
                        Best: {readingProgress.longestStreak}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
