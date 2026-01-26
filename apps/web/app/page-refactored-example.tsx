'use client';

import { useState, useRef } from 'react';
import { VOLUMES, getBooksForVolume, getTotalChapters, type Volume, type Book } from './lib/scriptures';
import { VolumeId } from './lib/scriptures';
import { Verse } from './lib/types';

// Hooks
import { useSettings } from './hooks/useSettings';
import { useUserData } from './hooks/useUserData';
import { useReadingProgress } from './hooks/useReadingProgress';
import { useVerseOperations } from './hooks/useVerseOperations';
import { useSearch } from './hooks/useSearch';

// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { VolumeTabs } from './components/layout/VolumeTabs';

// Modals
import { SettingsModal } from './components/modals/SettingsModal';
import { SearchModal } from './components/modals/SearchModal';
import { NoteEditorModal } from './components/modals/NoteEditorModal';
import { StudyPlanModal } from './components/modals/StudyPlanModal';
import { BackupModal } from './components/modals/BackupModal';
import { ResourcesModal } from './components/modals/ResourcesModal';

// Utils
import { exportUserData, importUserData } from './utils/data-backup';

// Import the existing ChapterGrid and main content rendering
// (These would also be extracted into separate components in a complete refactor)
import ChapterGrid from './components/ChapterGrid';

export default function Home() {
  // Settings Hook
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

  // User Data Hook
  const { bookmarks, setBookmarks, highlights, setHighlights, notes, setNotes } = useUserData();

  // Reading Progress Hook
  const {
    readingProgress,
    markChapterRead,
    isChapterRead,
    studyPlan,
    startStudyPlan,
    completeStudyPlanDay,
    endStudyPlan,
  } = useReadingProgress(volumeId);

  // Search Hook
  const { searchQuery, setSearchQuery, searchResults, searching, clearSearch } = useSearch(volumeId);

  // Local UI State
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'books' | 'bookmarks' | 'notes' | 'progress'>('books');

  // Modal States
  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [showStudyPlanModal, setShowStudyPlanModal] = useState(false);
  const [showResourcesModal, setShowResourcesModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);

  // Note Editor State
  const [noteContent, setNoteContent] = useState('');
  const [editingNoteVerse, setEditingNoteVerse] = useState<number | null>(null);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived values
  const currentVolume = VOLUMES.find(v => v.id === volumeId) as Volume;
  const books = getBooksForVolume(volumeId);
  const currentBook = books.find(b => b.id === selectedBook);
  const totalChapters = getTotalChapters(volumeId);
  const chaptersReadInVolume = Object.keys(readingProgress.chaptersRead).filter(key =>
    key.startsWith(`${volumeId}:`)
  ).length;
  const completionPercentage = Math.round((chaptersReadInVolume / totalChapters) * 100);

  // Verse Operations Hook
  const { isBookmarked, toggleBookmark, getHighlight, setHighlightColor, getNote, saveNote, deleteNote } =
    useVerseOperations({
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

  // Event Handlers
  const handleVolumeChange = (newVolumeId: VolumeId) => {
    setVolumeId(newVolumeId);
    setSelectedBook(null);
    setSelectedChapter(null);
    setVerses([]);
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
    const existingNote = getNote(verse.num);
    setEditingNoteVerse(verse.num);
    setNoteContent(existingNote?.content || '');
    setShowNoteEditor(true);
  };

  const handleSaveNote = () => {
    if (editingNoteVerse && noteContent.trim()) {
      saveNote(editingNoteVerse, noteContent);
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
        // ... set other imported data
        alert('Data imported successfully!');
      },
      (error) => {
        alert(error);
      }
    );

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          sidebarOpen={sidebarOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentVolume={currentVolume}
          books={books}
          selectedBook={selectedBook}
          setSelectedBook={setSelectedBook}
          setSelectedChapter={setSelectedChapter}
          setVerses={setVerses}
          bookmarks={bookmarks}
          notes={notes}
          readingProgress={readingProgress}
          navigateToReference={navigateToReference}
          deleteNote={deleteNote}
          totalChapters={totalChapters}
          chaptersReadInVolume={chaptersReadInVolume}
          completionPercentage={completionPercentage}
        />

        {/* Main Content - Would also be extracted in a complete refactor */}
        <main className="flex-1 overflow-y-auto bg-[var(--color-bg-primary)]">
          {/* Existing main content rendering logic here */}
          {/* This would also be componentized in a full refactor: */}
          {/* - VolumeHomeScreen */}
          {/* - BookChapterSelector */}
          {/* - ChapterReader */}
          {/* etc. */}
        </main>
      </div>
    </div>
  );
}
