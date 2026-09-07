import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CloseIcon, SearchIcon } from '../Icons';
import { SearchResult } from '../../lib/types';
import { VolumeId } from '../../lib/scriptures';
import { type Volume } from '../../lib/scriptures';
import { SearchResultSkeleton } from '../LoadingSkeleton';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { modalOverlay, modalContent, tapPress } from '../../lib/motion';

interface SearchModalProps {
  show: boolean;
  onClose: () => void;
  currentVolume: Volume;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: SearchResult[];
  searching: boolean;
  error?: Error | null;
  onNavigate: (volumeId: VolumeId, bookName: string, chapter: number) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  show,
  onClose,
  currentVolume,
  searchQuery,
  setSearchQuery,
  searchResults,
  searching,
  error,
  onNavigate,
}) => {
  const focusTrapRef = useFocusTrap(show);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (show) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [show, onClose]);

  const handleNavigate = (result: SearchResult) => {
    onNavigate(result.volumeId, result.book, result.chapter);
    onClose();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20"
          onClick={onClose}
          variants={modalOverlay}
          initial="hidden"
          animate="visible"
          exit="hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="search-title"
        >
          <motion.div
            ref={focusTrapRef}
            variants={modalContent}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-[var(--color-bg-primary)] rounded-2xl w-full max-w-2xl mx-4 shadow-2xl border border-[var(--color-border)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="relative">
                <input
                  id="search-title"
                  type="search"
                  placeholder={`Search ${currentVolume.name}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  aria-label={`Search ${currentVolume.name}`}
                  className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl pl-11 pr-11 py-3 text-lg focus:outline-none focus:border-[var(--color-accent)]"
                />
                <div
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
                  aria-hidden="true"
                >
                  <SearchIcon />
                </div>
                <motion.button
                  onClick={onClose}
                  whileTap={tapPress}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-[var(--color-bg-tertiary)] rounded-lg transition-colors"
                  aria-label="Close search"
                >
                  <CloseIcon />
                </motion.button>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {error ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
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
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Search failed. Please try again.
                  </p>
                </div>
              ) : searching ? (
                <div role="status" aria-label="Searching">
                  {Array.from({ length: 5 }, (_, i) => (
                    <SearchResultSkeleton key={i} />
                  ))}
                </div>
              ) : searchResults.length > 0 ? (
                <div className="divide-y divide-[var(--color-border-light)]">
                  {searchResults.map((result, i) => (
                    <button
                      key={i}
                      onClick={() => handleNavigate(result)}
                      className="w-full p-4 text-left hover:bg-[var(--color-bg-tertiary)] transition-colors"
                    >
                      <p className="text-[var(--color-accent)] font-medium text-sm">
                        {result.reference}
                      </p>
                      <p className="text-[var(--color-text-secondary)] text-sm mt-1 line-clamp-2">
                        {result.text}
                      </p>
                    </button>
                  ))}
                </div>
              ) : searchQuery.length >= 2 ? (
                <div className="p-8 text-center text-[var(--color-text-tertiary)]">
                  No results found
                </div>
              ) : (
                <div className="p-8 text-center text-[var(--color-text-tertiary)]">
                  Type to search scriptures
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
