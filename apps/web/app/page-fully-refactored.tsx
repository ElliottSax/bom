'use client';

import { useState, useRef } from 'react';
import { VOLUMES, getBooksForVolume, getTotalChapters } from './lib/scriptures';
import { VolumeId, Volume, Verse } from './lib/types';

// Hooks
import { useSettings } from './hooks/useSettings';
import { useUserData } from './hooks/useUserData';
import { useReadingProgress } from './hooks/useReadingProgress';
import { useVerseOperations } from './hooks/useVerseOperations';

// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { VolumeTabs } from './components/layout/VolumeTabs';
import { VolumeHomeScreen } from './components/VolumeHomeScreen';
import { BookChapterSelector } from './components/BookChapterSelector';
import { ChapterReader } from './components/ChapterReader';

// Modals
import { SettingsModal } from './components/modals/SettingsModal';
import { SearchModal } from './components/modals/SearchModal';
import { NoteEditorModal } from './components/modals/NoteEditorModal';
import { StudyPlanModal } from './components/modals/StudyPlanModal';
import { BackupModal } from './components/modals/BackupModal';
import { ResourcesModal } from './components/modals/ResourcesModal';

// Utils
import { exportUserData, importUserData } from './utils/data-backup';

export default function Home() {
  // ==================== HOOKS ====================
  const {
    volumeId,
    setVolumeId,
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

  const { bookmarks, setBookmarks, highlights, setHighlights, notes, setNotes } = useUserData();

  const {
    readingProgress,
    markChapterRead,
    isChapterRead,
    studyPlan,
    startStudyPlan,
    completeStudyPlanDay,
    endStudyPlan,
  } = useReadingProgress(volumeId);

  // ==================== LOCAL STATE ====================
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'books' | 'bookmarks' | 'notes' | 'progress'>('books');

  // Modal states
  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [showStudyPlanModal, setShowStudyPlanModal] = useState(false);
  const [showResourcesModal, setShowResourcesModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // Note editor state
  const [noteContent, setNoteContent] = useState('');
  const [editingNoteVerse, setEditingNoteVerse] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ==================== DERIVED VALUES ====================
  const currentVolume = VOLUMES.find(v => v.id === volumeId) as Volume;
  const books = getBooksForVolume(volumeId);
  const currentBook = books.find(b => b.id === selectedBook);
  const totalChapters = getTotalChapters(volumeId);
  const chaptersReadInVolume = Object.keys(readingProgress.chaptersRead).filter(key =>
    key.startsWith(`${volumeId}:`)
  ).length;
  const completionPercentage = Math.round((chaptersReadInVolume / totalChapters) * 100);

  // Verse operations
  const verseOps = useVerseOperations({
    volumeId,
    currentBook,
    selectedChapter,
    bookmarks,
    setBookmarks,
    highlights,
    setHighlights,
    notes,
    setNotes,
  });

  // ==================== EVENT HANDLERS ====================
  const handleVolumeChange = (newVolumeId: VolumeId) => {
    setVolumeId(newVolumeId);
    setSelectedBook(null);
    setSelectedChapter(null);
    setVerses([]);
  };

  const handleBookSelect = (bookId: string) => {
    setSelectedBook(bookId);
    setSelectedChapter(null);
    setVerses([]);
  };

  const handleChapterSelect = (chapter: number) => {
    setSelectedChapter(chapter);
    // Fetch verses - in a real implementation, this would use the useVerses hook
    // For now, keeping the existing fetch logic
    if (selectedBook) {
      setLoading(true);
      fetch(`/api/verses?volume=${volumeId}&book=${encodeURIComponent(selectedBook)}&chapter=${chapter}`)
        .then(res => res.json())
        .then(data => {
          setVerses(data.verses || []);
          setLoading(false);
        })
        .catch(() => {
          setVerses([]);
          setLoading(false);
        });
    }
  };

  const navigateToReference = (vid: VolumeId, bookName: string, chapter: number) => {
    const targetBooks = getBooksForVolume(vid);
    const targetBook = targetBooks.find(b => b.name === bookName);
    if (targetBook) {
      setVolumeId(vid);
      setSelectedBook(targetBook.id);
      setSelectedChapter(chapter);
    }
  };

  const openNoteEditor = (verse: Verse) => {
    const existingNote = verseOps.getNote(verse.num);
    setEditingNoteVerse(verse.num);
    setNoteContent(existingNote?.content || '');
    setShowNoteEditor(true);
  };

  const handleSaveNote = () => {
    if (editingNoteVerse && noteContent.trim()) {
      verseOps.saveNote(editingNoteVerse, noteContent);
    }
    setShowNoteEditor(false);
    setNoteContent('');
    setEditingNoteVerse(null);
  };

  const handleExportData = () => {
    exportUserData(
      bookmarks,
      highlights,
      notes,
      readingProgress,
      studyPlan,
      volumeId,
      fontSize,
      lineHeight,
      fontFamily,
      theme,
      showVerseNumbers
    );
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    importUserData(
      file,
      (data) => {
        setBookmarks(data.bookmarks);
        setHighlights(data.highlights);
        setNotes(data.notes);
        alert('Data imported successfully!');
      },
      (error) => alert(error)
    );

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePreviousChapter = () => {
    if (selectedChapter && selectedChapter > 1) {
      handleChapterSelect(selectedChapter - 1);
    }
  };

  const handleNextChapter = () => {
    if (selectedChapter && currentBook && selectedChapter < currentBook.chapters) {
      handleChapterSelect(selectedChapter + 1);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] flex flex-col transition-colors duration-200">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportData}
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

      {/* Modals */}
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
        onNavigate={navigateToReference}
      />

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

      <StudyPlanModal
        show={showStudyPlanModal}
        onClose={() => setShowStudyPlanModal(false)}
        studyPlan={studyPlan}
        onStartPlan={startStudyPlan}
        onCompleteDayComplete={completeStudyPlanDay}
        onEndPlan={endStudyPlan}
      />

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

      <ResourcesModal show={showResourcesModal} onClose={() => setShowResourcesModal(false)} />

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
          setVerses={setVerses}
          bookmarks={bookmarks}
          notes={notes}
          readingProgress={readingProgress}
          navigateToReference={navigateToReference}
          deleteNote={verseOps.deleteNote}
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
              onChapterSelect={handleChapterSelect}
              isChapterRead={(bookId, chapter) => isChapterRead(bookId, chapter)}
            />
          ) : (
            <ChapterReader
              currentBook={currentBook!}
              currentVolume={currentVolume}
              selectedChapter={selectedChapter}
              verses={verses}
              loading={loading}
              fontSize={fontSize}
              lineHeight={lineHeight}
              fontFamily={fontFamily}
              showVerseNumbers={showVerseNumbers}
              isChapterRead={isChapterRead(currentBook?.id || '', selectedChapter)}
              onBack={() => {
                setSelectedChapter(null);
                setVerses([]);
              }}
              onPreviousChapter={handlePreviousChapter}
              onNextChapter={handleNextChapter}
              onMarkChapterRead={() => markChapterRead(currentBook?.id || '', selectedChapter)}
              isBookmarked={verseOps.isBookmarked}
              toggleBookmark={verseOps.toggleBookmark}
              getHighlight={verseOps.getHighlight}
              setHighlightColor={verseOps.setHighlightColor}
              getNote={verseOps.getNote}
              openNoteEditor={openNoteEditor}
            />
          )}
        </main>
      </div>
    </div>
  );
}
