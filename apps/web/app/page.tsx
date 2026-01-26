'use client';

import { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { useVerses } from './hooks/useVerses';
import { useSearch } from './hooks/useSearch';
import { VOLUMES, getBooksForVolume, getTotalChapters } from './lib/scriptures';
import { type VolumeId } from './lib/types';

// Contexts
import { useSettings } from './contexts/SettingsContext';
import { useUserData } from './contexts/UserDataContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { UserDataContextProvider } from './contexts/UserDataContext';
import { ToastProvider } from './contexts/ToastContext';

// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { VolumeTabs } from './components/layout/VolumeTabs';
import { VolumeHomeScreen } from './components/VolumeHomeScreen';
import { BookChapterSelector } from './components/BookChapterSelector';
import { ChapterReader } from './components/ChapterReader';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy load modals for better initial load performance
const SettingsModal = lazy(() => import('./components/modals/SettingsModal').then(m => ({ default: m.SettingsModal })));
const SearchModal = lazy(() => import('./components/modals/SearchModal').then(m => ({ default: m.SearchModal })));
const NoteEditorModal = lazy(() => import('./components/modals/NoteEditorModal').then(m => ({ default: m.NoteEditorModal })));
const StudyPlanModal = lazy(() => import('./components/modals/StudyPlanModal').then(m => ({ default: m.StudyPlanModal })));
const BackupModal = lazy(() => import('./components/modals/BackupModal').then(m => ({ default: m.BackupModal })));
const ResourcesModal = lazy(() => import('./components/modals/ResourcesModal').then(m => ({ default: m.ResourcesModal })));

function HomeContent() {
  // ==================== CONTEXTS ====================
  const {
    theme,
    cycleTheme,
    fontSize,
    setFontSize,
    lineHeight,
    setLineHeight,
    fontFamily,
    setFontFamily,
    showVerseNumbers,
    setShowVerseNumbers,
  } = useSettings();

  const {
    bookmarks,
    highlights,
    notes,
    readingProgress,
    studyPlan,
    fileInputRef,
    markChapterRead,
    isChapterRead,
    isBookmarked,
    toggleBookmark,
    getHighlight,
    setHighlightColor,
    getNote,
    deleteNote,
    openNoteEditor,
    startStudyPlan,
    completeStudyPlanDay,
    exportData,
    importData,
    showNoteEditor,
    setShowNoteEditor,
    noteContent,
    setNoteContent,
    editingNoteVerse,
    saveNote,
  } = useUserData();

  // ==================== LOCAL STATE ====================
  const [volumeId, setVolumeId] = useLocalStorage<VolumeId>('coc-volumeId', 'bom');
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'books' | 'bookmarks' | 'notes' | 'progress'>('books');

  // Modal states
  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showStudyPlanModal, setShowStudyPlanModal] = useState(false);
  const [showResourcesModal, setShowResourcesModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // ==================== DATA FETCHING ====================
  const { data: verses = [], isLoading, error: versesError } = useVerses(volumeId, selectedBook, selectedChapter);
  const { data: searchResults = [], isLoading: searching, error: searchError } = useSearch(searchQuery, volumeId, 30);

  // ==================== DERIVED VALUES ====================
  const currentVolume = useMemo(() => {
    const volume = VOLUMES.find(v => v.id === volumeId);
    return volume || VOLUMES[0]; // Fallback to first volume
  }, [volumeId]);

  const books = useMemo(() => getBooksForVolume(volumeId), [volumeId]);

  const currentBook = useMemo(() =>
    books.find(b => b.id === selectedBook),
    [books, selectedBook]
  );

  const totalChapters = useMemo(() => getTotalChapters(volumeId), [volumeId]);

  const chaptersReadInVolume = useMemo(() =>
    Object.keys(readingProgress.chaptersRead).filter(key =>
      key.startsWith(`${volumeId}:`)
    ).length,
    [readingProgress.chaptersRead, volumeId]
  );

  const completionPercentage = useMemo(() =>
    Math.round((chaptersReadInVolume / totalChapters) * 100),
    [chaptersReadInVolume, totalChapters]
  );

  // ==================== EVENT HANDLERS ====================
  const handleVolumeChange = useCallback((newVolumeId: VolumeId) => {
    setVolumeId(newVolumeId);
    setSelectedBook(null);
    setSelectedChapter(null);
  }, [setVolumeId]);

  const handleBookSelect = useCallback((bookId: string) => {
    setSelectedBook(bookId);
    setSelectedChapter(null);
  }, []);

  const navigateToReference = useCallback((vid: VolumeId, bookName: string, chapter: number) => {
    const targetBooks = getBooksForVolume(vid);
    const targetBook = targetBooks.find(b => b.name === bookName);
    if (targetBook) {
      setVolumeId(vid);
      setSelectedBook(targetBook.id);
      setSelectedChapter(chapter);
      setShowSearch(false);
      setSearchQuery('');
    }
  }, [setVolumeId]);

  const handlePreviousChapter = useCallback(() => {
    if (selectedChapter && selectedChapter > 1) {
      setSelectedChapter(selectedChapter - 1);
    }
  }, [selectedChapter]);

  const handleNextChapter = useCallback(() => {
    if (selectedChapter && currentBook && selectedChapter < currentBook.chapters) {
      setSelectedChapter(selectedChapter + 1);
    }
  }, [selectedChapter, currentBook]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleExportData = useCallback(() => {
    exportData({
      volumeId,
      fontSize,
      lineHeight,
      fontFamily,
      theme,
      showVerseNumbers,
    });
  }, [exportData, volumeId, fontSize, lineHeight, fontFamily, theme, showVerseNumbers]);

  const handleSaveNote = useCallback(() => {
    saveNote(currentBook?.name, selectedChapter, editingNoteVerse, noteContent);
  }, [saveNote, currentBook, selectedChapter, editingNoteVerse, noteContent]);

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] flex flex-col transition-colors duration-200">
      <input
        type="file"
        ref={fileInputRef}
        onChange={importData}
        accept=".json"
        className="hidden"
      />

      <Header
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        currentVolume={currentVolume}
        readingProgress={readingProgress}
        setShowStudyPlanModal={setShowStudyPlanModal}
        setShowResourcesModal={setShowResourcesModal}
        setShowBackupModal={setShowBackupModal}
        cycleTheme={cycleTheme}
        theme={theme}
        setShowSettings={setShowSettings}
        showSettings={showSettings}
        setShowSearch={setShowSearch}
      />

      <VolumeTabs volumeId={volumeId} onVolumeChange={handleVolumeChange} />

      {/* Modals - Lazy loaded for better performance */}
      <Suspense fallback={null}>
        {showSettings && (
          <SettingsModal
            show={showSettings}
            onClose={() => setShowSettings(false)}
            fontSize={fontSize}
            setFontSize={setFontSize}
            lineHeight={lineHeight}
            setLineHeight={setLineHeight}
            fontFamily={fontFamily}
            setFontFamily={setFontFamily}
            showVerseNumbers={showVerseNumbers}
            setShowVerseNumbers={setShowVerseNumbers}
          />
        )}

        {showSearch && (
          <SearchModal
            show={showSearch}
            onClose={() => {
              setShowSearch(false);
              clearSearch();
            }}
            currentVolume={currentVolume}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchResults={searchResults}
            searching={searching}
            error={searchError}
            onNavigate={navigateToReference}
          />
        )}

        {showNoteEditor && (
          <NoteEditorModal
            show={showNoteEditor}
            onClose={() => setShowNoteEditor(false)}
            bookName={currentBook?.name || ''}
            chapter={selectedChapter || 0}
            verse={editingNoteVerse || 0}
            content={noteContent}
            setContent={setNoteContent}
            onSave={handleSaveNote}
          />
        )}

        {showStudyPlanModal && (
          <StudyPlanModal
            show={showStudyPlanModal}
            onClose={() => setShowStudyPlanModal(false)}
            studyPlan={studyPlan}
            onStartPlan={startStudyPlan}
            onCompleteDayComplete={completeStudyPlanDay}
            onEndPlan={() => {
              localStorage.removeItem('coc-studyPlan');
              window.location.reload();
            }}
          />
        )}

        {showBackupModal && (
          <BackupModal
            show={showBackupModal}
            onClose={() => setShowBackupModal(false)}
            bookmarksCount={bookmarks.length}
            highlightsCount={highlights.length}
            notesCount={notes.length}
            chaptersReadCount={Object.keys(readingProgress.chaptersRead).length}
            onExport={handleExportData}
            onImport={() => fileInputRef.current?.click()}
          />
        )}

        {showResourcesModal && (
          <ResourcesModal show={showResourcesModal} onClose={() => setShowResourcesModal(false)} />
        )}
      </Suspense>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          sidebarOpen={sidebarOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentVolume={currentVolume}
          books={books}
          selectedBook={selectedBook}
          setSelectedBook={handleBookSelect}
          setSelectedChapter={setSelectedChapter}
          setVerses={() => {}} // Not needed with React Query
          bookmarks={bookmarks}
          notes={notes}
          readingProgress={readingProgress}
          navigateToReference={navigateToReference}
          deleteNote={deleteNote}
          totalChapters={totalChapters}
          chaptersReadInVolume={chaptersReadInVolume}
          completionPercentage={completionPercentage}
        />

        <main className="flex-1 overflow-y-auto bg-[var(--color-bg-primary)]">
          {!selectedBook ? (
            <VolumeHomeScreen
              currentVolume={currentVolume}
              volumeId={volumeId}
              completionPercentage={completionPercentage}
              booksCount={books.length}
              currentStreak={readingProgress.currentStreak}
              onSearchClick={() => setShowSearch(true)}
              onStudyPlanClick={() => setShowStudyPlanModal(true)}
              hasStudyPlan={!!studyPlan}
            />
          ) : !selectedChapter ? (
            <BookChapterSelector
              currentBook={currentBook!}
              currentVolume={currentVolume}
              volumeId={volumeId}
              onBack={() => setSelectedBook(null)}
              onChapterSelect={setSelectedChapter}
              isChapterRead={isChapterRead}
            />
          ) : (
            <ChapterReader
              currentBook={currentBook!}
              currentVolume={currentVolume}
              selectedChapter={selectedChapter}
              verses={verses}
              loading={isLoading}
              error={versesError}
              fontSize={fontSize}
              lineHeight={lineHeight}
              fontFamily={fontFamily}
              showVerseNumbers={showVerseNumbers}
              isChapterRead={isChapterRead(currentBook?.id || '', selectedChapter)}
              onBack={() => setSelectedChapter(null)}
              onPreviousChapter={handlePreviousChapter}
              onNextChapter={handleNextChapter}
              onMarkChapterRead={() => markChapterRead(currentBook?.id || '', selectedChapter)}
              isBookmarked={(verseNum) => isBookmarked(verseNum, currentBook?.name, selectedChapter)}
              toggleBookmark={(verse) => toggleBookmark(verse, currentBook?.name, selectedChapter)}
              getHighlight={(verseNum) => getHighlight(verseNum, currentBook?.name, selectedChapter)}
              setHighlightColor={(verseNum, color) => setHighlightColor(verseNum, color, currentBook?.name, selectedChapter)}
              getNote={(verseNum) => getNote(verseNum, currentBook?.name, selectedChapter)}
              openNoteEditor={(verse) => openNoteEditor(verse, currentBook?.name, selectedChapter)}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default function Home() {
  const [volumeId] = useLocalStorage<VolumeId>('coc-volumeId', 'bom');

  return (
    <ErrorBoundary>
      <ToastProvider>
        <SettingsProvider>
          <UserDataContextProvider currentVolumeId={volumeId}>
            <HomeContent />
          </UserDataContextProvider>
        </SettingsProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
