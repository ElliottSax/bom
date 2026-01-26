'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { useVerses } from './hooks/useVerses';
import { useSearch } from './hooks/useSearch';
import {
  VOLUMES,
  getBooksForVolume,
  getTotalChapters,
  COC_RESOURCES,
  STUDY_PLANS,
  type Volume,
} from './lib/scriptures';
import {
  type Verse,
  type Bookmark,
  type Highlight,
  type Note,
  type SearchResult,
  type ReadingProgress,
  type StudyPlanProgress,
  type UserData,
  type Theme,
  type FontFamily,
  type VolumeId,
  type Book,
  HIGHLIGHT_COLORS,
} from './lib/types';

import {
  MenuIcon,
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SettingsIcon,
  SunIcon,
  MoonIcon,
  BookmarkIcon,
  NoteIcon,
  CloseIcon,
  DownloadIcon,
  UploadIcon,
  CalendarIcon,
  BookOpenIcon,
  CheckIcon,
  FireIcon,
  ExternalLinkIcon,
} from './components/Icons';

import Header from './components/Header';
import { SettingsProvider } from '../contexts/SettingsContext';
import { UserDataContextProvider } from '../contexts/UserDataContext';

export default function Home() {
  const [volumeId, setVolumeId] = useLocalStorage<VolumeId>('coc-volumeId', 'bom');
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);






  const [showSettings, setShowSettings] = useState(false);








  const [showStudyPlanModal, setShowStudyPlanModal] = useState(false);
  const [showResourcesModal, setShowResourcesModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);

  const [activeTab, setActiveTab] = useState<'books' | 'bookmarks' | 'notes' | 'progress'>('books');

  const [showSearch, setShowSearch] = useState(false);








  const currentVolume = VOLUMES.find(v => v.id === volumeId) as Volume;
  const books = getBooksForVolume(volumeId);
  const currentBook = books.find(b => b.id === selectedBook);
  const totalChapters = getTotalChapters(volumeId);





  













































  return (
    <SettingsProvider>
      <UserDataContextProvider currentVolumeId={volumeId}>
        <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] flex flex-col transition-colors duration-200">



      <Header
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        currentVolume={currentVolume}
        setShowStudyPlanModal={setShowStudyPlanModal}
        setShowResourcesModal={setShowResourcesModal}
        setShowBackupModal={setShowBackupModal}
        setShowSettings={setShowSettings}
        setShowSearch={setShowSearch}
      />

      {/* Volume Tabs */}
      <div className="no-print border-b border-[var(--color-border-light)] bg-[var(--color-bg-secondary)]">
        <div className="flex overflow-x-auto">
          {VOLUMES.map(vol => (
            <button key={vol.id} onClick={() => { setVolumeId(vol.id); setSelectedBook(null); setSelectedChapter(null); setVerses([]); }}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${volumeId === vol.id ? 'border-current' : 'border-transparent text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'}`}
              style={{ color: volumeId === vol.id ? vol.color : undefined }}>
              {vol.shortName}
            </button>
          ))}
        </div>
      </div>

      <SettingsPanel
        showSettings={showSettings}
        setShowSettings={setShowSettings}
      />

      <StudyPlanModal
        showStudyPlanModal={showStudyPlanModal}
        setShowStudyPlanModal={setShowStudyPlanModal}
      />


      <ResourcesModal
        showResourcesModal={showResourcesModal}
        setShowResourcesModal={setShowResourcesModal}
        COC_RESOURCES={COC_RESOURCES}
      />


      <BackupModal
        showBackupModal={showBackupModal}
        setShowBackupModal={setShowBackupModal}
        currentVolumeId={volumeId}
      />


      <SearchModal
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentVolume={currentVolume}
        searching={searching}
        searchResults={searchResults}
        volumeId={volumeId}
      />


      <NoteEditorModal
        currentBook={currentBook}
        selectedChapter={selectedChapter}
      />


      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
            <Sidebar
            sidebarOpen={sidebarOpen}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            currentVolume={currentVolume}
            books={books}
            selectedBook={selectedBook}
            setSelectedBook={setSelectedBook}
            setSelectedChapter={setSelectedChapter}
            totalChapters={totalChapters}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[var(--color-bg-primary)]">
          {!selectedBook ? (
            <div className="h-full flex flex-col items-center justify-center p-8">
              <div className="max-w-xl text-center">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg" style={{ backgroundColor: currentVolume.color }}><svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h12a2 2 0 012 2v14l-8-4-8 4V6a2 2 0 012-2z" /></svg></div>
                <h2 className="book-title mb-2">{currentVolume.name}</h2>
                <p className="font-medium mb-1" style={{ color: currentVolume.color }}>{currentVolume.description}</p>
                <p className="text-[var(--color-text-tertiary)] text-sm mb-6">Community of Christ</p>
                <div className="flex justify-center gap-6 mb-6">
                  <div className="text-center"><p className="text-2xl font-bold" style={{ color: currentVolume.color }}>{completionPercentage}%</p><p className="text-xs text-[var(--color-text-tertiary)]">Complete</p></div>
                  <div className="text-center"><p className="text-2xl font-bold text-[var(--color-text-secondary)]">{books.length}</p><p className="text-xs text-[var(--color-text-tertiary)]">{volumeId === 'dc' ? 'Sections' : 'Books'}</p></div>
                  {readingProgress.currentStreak > 0 && <div className="text-center"><p className="text-2xl font-bold text-orange-500 flex items-center justify-center gap-1"><FireIcon /> {readingProgress.currentStreak}</p><p className="text-xs text-[var(--color-text-tertiary)]">Streak</p></div>}
                </div>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => setShowSearch(true)} className="px-6 py-3 text-white font-semibold rounded-xl hover:opacity-90 transition shadow-lg" style={{ backgroundColor: currentVolume.color }}>Search {currentVolume.shortName}</button>
                  {!studyPlan && <button onClick={() => setShowStudyPlanModal(true)} className="px-6 py-3 bg-[var(--color-bg-tertiary)] font-semibold rounded-xl hover:bg-[var(--color-border)] transition">Start a Plan</button>}
                </div>
              </div>
            </div>
          ) : !selectedChapter ? (
            <ChapterGrid
              currentBook={currentBook}
              currentVolume={currentVolume}
              setSelectedBook={setSelectedBook}
              setSelectedChapter={setSelectedChapter}
              volumeId={volumeId}
            />
                    ) : (
                      <VerseView
                        currentBook={currentBook}
                        selectedChapter={selectedChapter}
                        currentVolume={currentVolume}
                        setSelectedChapter={setSelectedChapter}
                        setVerses={setVerses}
                        loading={loading}
                        verses={verses}
                        selectedVerse={selectedVerse}
                        setSelectedVerse={setSelectedVerse}
                      />          )}
        </main>
      </div>
    </UserDataContextProvider>
    </SettingsProvider>
  );
}
