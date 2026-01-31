import React from 'react';
import { type Volume, type SearchResult, type VolumeId } from '../lib/types';
import { SearchIcon } from './Icons';

interface SearchModalProps {
  showSearch: boolean;
  setShowSearch: React.Dispatch<React.SetStateAction<boolean>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  currentVolume: Volume;
  searching: boolean;
  searchResults: SearchResult[];
  volumeId?: VolumeId; // Optional - not currently used
  navigateToReference: (volumeId: VolumeId, book: string, chapter: number) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({
  showSearch,
  setShowSearch,
  searchQuery,
  setSearchQuery,
  currentVolume,
  searching,
  searchResults,
  navigateToReference,
}) => {
  if (!showSearch) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 fade-in" onClick={() => { setShowSearch(false); setSearchQuery(''); }}>
      <div className="bg-[var(--color-bg-primary)] rounded-2xl w-full max-w-2xl mx-4 shadow-2xl border border-[var(--color-border)] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-4">
          <div className="relative">
            <input
              type="search"
              placeholder={`Search ${currentVolume.name}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl px-4 py-3 pl-11 text-lg focus:outline-none focus:border-[var(--color-accent)]"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]">
              <SearchIcon />
            </div>
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {searching ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full mx-auto" />
            </div>
          ) : searchResults.length > 0 ? (
            <div className="divide-y divide-[var(--color-border-light)]">
              {searchResults.map((r, i) => (
                <button key={i} onClick={() => navigateToReference(r.volumeId, r.book, r.chapter)} className="w-full p-4 text-left hover:bg-[var(--color-bg-tertiary)]">
                  <p className="text-[var(--color-accent)] font-medium text-sm">{r.reference}</p>
                  <p className="text-[var(--color-text-secondary)] text-sm mt-1 line-clamp-2">{r.text}</p>
                </button>
              ))}
            </div>
          ) : searchQuery.length >= 2 ? (
            <div className="p-8 text-center text-[var(--color-text-tertiary)]">No results</div>
          ) : (
            <div className="p-8 text-center text-[var(--color-text-tertiary)]">Type to search</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;