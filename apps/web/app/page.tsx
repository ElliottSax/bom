'use client';

import { useState, useMemo, useCallback, useEffect, lazy, Suspense } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { useVerses } from './hooks/useVerses';
import { useSearch } from './hooks/useSearch';
import { useAchievements } from './hooks/useAchievements';
import { useChallenges } from './hooks/useChallenges';
import { useMemorization } from './hooks/useMemorization';
import { useWordStudy } from './hooks/useWordStudy';
import { useKeyboardShortcuts, COMMON_SHORTCUTS } from './hooks/useKeyboardShortcuts';
import { VOLUMES, getBooksForVolume, getTotalChapters } from './lib/scriptures';
import { type VolumeId } from './lib/types';

// Contexts
import { useSettings } from './contexts/SettingsContext';
import { useUserData } from './contexts/UserDataContext';
import { useCourseProgress } from './contexts/CourseProgressContext';
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
import { AchievementNotificationContainer } from './components/AchievementNotificationContainer';
import { NotificationPromptModal } from './components/NotificationSettings';

// Lazy load modals for better initial load performance
const SettingsModal = lazy(() => import('./components/modals/SettingsModal').then(m => ({ default: m.SettingsModal })));
const SearchModal = lazy(() => import('./components/modals/SearchModal').then(m => ({ default: m.SearchModal })));
const NoteEditorModal = lazy(() => import('./components/modals/NoteEditorModal').then(m => ({ default: m.NoteEditorModal })));
const StudyPlanModal = lazy(() => import('./components/modals/StudyPlanModal').then(m => ({ default: m.StudyPlanModal })));
const BackupModal = lazy(() => import('./components/modals/BackupModal').then(m => ({ default: m.BackupModal })));
const ResourcesModal = lazy(() => import('./components/modals/ResourcesModal').then(m => ({ default: m.ResourcesModal })));
const CoCResourcesModal = lazy(() => import('./components/modals/CoCResourcesModal').then(m => ({ default: m.CoCResourcesModal })));
const AboutCoCModal = lazy(() => import('./components/modals/AboutCoCModal').then(m => ({ default: m.AboutCoCModal })));
const CoursesModal = lazy(() => import('./components/modals/CoursesModal').then(m => ({ default: m.CoursesModal })));
const WordStudyModal = lazy(() => import('./components/modals/WordStudyModal').then(m => ({ default: m.WordStudyModal })));
const ReadingGoalsModal = lazy(() => import('./components/modals/ReadingGoalsModal').then(m => ({ default: m.ReadingGoalsModal })));
const MemorizationModal = lazy(() => import('./components/modals/MemorizationModal').then(m => ({ default: m.MemorizationModal })));
const AchievementsModal = lazy(() => import('./components/modals/AchievementsModal').then(m => ({ default: m.AchievementsModal })));
const StreakCelebration = lazy(() => import('./components/StreakCelebration').then(m => ({ default: m.StreakCelebration })));
const ChallengesModal = lazy(() => import('./components/modals/ChallengesModal').then(m => ({ default: m.ChallengesModal })));
const KeyboardShortcutsModal = lazy(() => import('./components/modals/KeyboardShortcutsModal').then(m => ({ default: m.KeyboardShortcutsModal })));

function HomeContent() {
  // ==================== CONTEXTS ====================
  const {
    theme,
    cycleTheme: _cycleTheme, // used by Header via its own useSettings
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
    deleteNote: _deleteNote,
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

  const { courseProgress, quizScores } = useCourseProgress();
  const memorization = useMemorization();
  const wordStudy = useWordStudy();

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
  const [showCoCResources, setShowCoCResources] = useState(false);
  const [showAboutCoC, setShowAboutCoC] = useState(false);
  const [showCourses, setShowCourses] = useState(false);
  const [showWordStudy, setShowWordStudy] = useState(false);
  const [showReadingGoals, setShowReadingGoals] = useState(false);
  const [showMemorization, setShowMemorization] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [celebratingStreak, setCelebratingStreak] = useState(0);
  const [showChallenges, setShowChallenges] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

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

  // Calculate chapters read this month for challenges
  const chaptersReadThisMonth = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    return Object.keys(readingProgress.chaptersRead).filter(key => {
      const timestamp = readingProgress.chaptersRead[key];
      if (!timestamp) return false;

      const readDate = new Date(timestamp);
      return readDate.getMonth() === thisMonth && readDate.getFullYear() === thisYear;
    }).length;
  }, [readingProgress.chaptersRead]);

  const completionPercentage = useMemo(() =>
    Math.round((chaptersReadInVolume / totalChapters) * 100),
    [chaptersReadInVolume, totalChapters]
  );

  // ==================== ACHIEVEMENTS ====================
  const achievementUserData = useMemo(() => {
    // Count completed courses
    const completedCoursesCount = Object.values(courseProgress).filter(
      course => course.completed === true
    ).length;

    // Calculate books completed (estimate from chapters read)
    const booksCompletedCount = Math.floor(Object.keys(readingProgress.chaptersRead).length / 7);

    // Calculate days active (unique days with reading activity)
    const daysActiveCount = Object.values(readingProgress.chaptersRead).reduce((uniqueDays, timestamp) => {
      const dateKey = new Date(timestamp).toDateString();
      uniqueDays.add(dateKey);
      return uniqueDays;
    }, new Set()).size;

    // Count passed quizzes
    const quizzesPassed = Object.values(quizScores).filter(quiz => quiz.passed).length;

    // Get memorization stats
    const memorizationStats = memorization.getStats();

    // Check time-based reading patterns
    const timestamps = Object.values(readingProgress.chaptersRead);

    // Early bird: any reading before 6 AM
    const hasEarlyMorningReading = timestamps.some(timestamp => {
      const date = new Date(timestamp);
      const hour = date.getHours();
      return hour < 6;
    });

    // Night owl: any reading after 10 PM
    const hasLateNightReading = timestamps.some(timestamp => {
      const date = new Date(timestamp);
      const hour = date.getHours();
      return hour >= 22; // 10 PM = 22:00
    });

    // Weekend warrior: reading on both Saturday and Sunday in the same weekend
    const weekendReadings = new Map<string, Set<number>>(); // weekKey -> Set of day numbers (0=Sun, 6=Sat)
    timestamps.forEach(timestamp => {
      const date = new Date(timestamp);
      const day = date.getDay();
      if (day === 0 || day === 6) { // Sunday or Saturday
        // Get the week key (use Sunday as week start for grouping)
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // Go to Sunday
        weekStart.setHours(0, 0, 0, 0);
        const weekKey = weekStart.toISOString();

        if (!weekendReadings.has(weekKey)) {
          weekendReadings.set(weekKey, new Set());
        }
        weekendReadings.get(weekKey)!.add(day);
      }
    });

    // Check if any weekend has both Saturday (6) and Sunday (0)
    const hasWeekendWarriorPattern = Array.from(weekendReadings.values()).some(
      days => days.has(0) && days.has(6)
    );

    return {
      chaptersRead: Object.keys(readingProgress.chaptersRead).length,
      booksCompleted: booksCompletedCount,
      currentStreak: readingProgress.currentStreak,
      longestStreak: readingProgress.longestStreak,
      notesWritten: notes.length,
      highlightsMade: highlights.length,
      bookmarksCreated: bookmarks.length,
      coursesCompleted: completedCoursesCount,
      quizzesPassed: quizzesPassed,
      totalScore: completedCoursesCount * 100 + Object.keys(readingProgress.chaptersRead).length * 10,
      daysActive: daysActiveCount,
      wordStudiesCompleted: wordStudy.getCompletedCount(),
      memorizationsCompleted: memorizationStats.mastered,
      readingGoalsAchieved: studyPlan && studyPlan.completedDays.length > 0 ? 1 : 0,
      hasEarlyMorningReading,
      hasLateNightReading,
      hasWeekendWarriorPattern,
    };
  }, [readingProgress, notes.length, highlights.length, bookmarks.length, studyPlan, courseProgress, quizScores, memorization, wordStudy]);

  const {
    unlockedAchievements,
    lockedAchievements,
    newAchievements,
    totalPoints,
    completionPercentage: achievementCompletion,
    markAsViewed,
  } = useAchievements(achievementUserData);

  // ==================== CHALLENGES ====================
  const {
    getActiveChallenges,
    getAvailableChallenges,
    getCompletedChallenges,
    recommended: recommendedChallenges,
    joinChallenge,
  } = useChallenges(readingProgress.currentStreak, chaptersReadThisMonth);

  const activeChallenges = getActiveChallenges();
  const availableChallenges = getAvailableChallenges();
  const completedChallenges = getCompletedChallenges();

  // ==================== STREAK CELEBRATION ====================
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const milestones = [7, 30, 100, 365];
    const currentStreak = readingProgress.currentStreak;

    if (milestones.includes(currentStreak)) {
      // Check if we've already celebrated this milestone
      const lastCelebrated = parseInt(localStorage.getItem('coc-lastCelebratedStreak') || '0');

      if (currentStreak > lastCelebrated) {
        setCelebratingStreak(currentStreak);
        setShowStreakCelebration(true);
        localStorage.setItem('coc-lastCelebratedStreak', currentStreak.toString());
      }
    }
  }, [readingProgress.currentStreak]);

  // ==================== NOTIFICATION PROMPT ====================
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Show notification prompt after 3-day streak if not already prompted
    const currentStreak = readingProgress.currentStreak;
    const hasPromptedBefore = localStorage.getItem('coc-notificationPrompted');

    if (currentStreak >= 3 && !hasPromptedBefore) {
      // Check if notifications are supported and not already granted
      if ('Notification' in window && Notification.permission === 'default') {
        let isMounted = true;

        // Delay prompt by 2 seconds to not overwhelm user
        const timer = setTimeout(() => {
          if (isMounted && typeof window !== 'undefined') {
            setShowNotificationPrompt(true);
            localStorage.setItem('coc-notificationPrompted', 'true');
          }
        }, 2000);

        return () => {
          isMounted = false;
          clearTimeout(timer);
        };
      }
    }
  }, [readingProgress.currentStreak]);

  // ==================== KEYBOARD SHORTCUTS ====================
  useKeyboardShortcuts({
    shortcuts: [
      { key: 'k', ctrlKey: true, description: 'Open search', action: () => setShowSearch(true) },
      { key: ',', ctrlKey: true, description: 'Open settings', action: () => setShowSettings(true) },
      { key: '?', shiftKey: true, description: 'Show shortcuts', action: () => setShowKeyboardShortcuts(true) },
      { key: 's', altKey: true, description: 'Toggle sidebar', action: () => setSidebarOpen(prev => !prev) },
      { key: 'd', ctrlKey: true, description: 'Toggle dark mode', action: () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        localStorage.setItem('coc-theme', newTheme);
      }},
    ],
    enabled: true,
  });

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
        setShowStudyPlanModal={setShowStudyPlanModal}
        setShowResourcesModal={setShowResourcesModal}
        setShowBackupModal={setShowBackupModal}
        setShowSettings={setShowSettings}
        setShowSearch={setShowSearch}
        setShowCoCResources={setShowCoCResources}
        setShowAboutCoC={setShowAboutCoC}
        setShowCourses={setShowCourses}
        setShowWordStudy={setShowWordStudy}
        setShowReadingGoals={setShowReadingGoals}
        setShowMemorization={setShowMemorization}
        setShowAchievements={setShowAchievements}
        setShowChallenges={setShowChallenges}
      />

      <VolumeTabs volumeId={volumeId} onVolumeChange={handleVolumeChange} />

      {/* Modals - Lazy loaded for better performance */}
      <ErrorBoundary>
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
              if (typeof window !== 'undefined') {
                localStorage.removeItem('coc-studyPlan');
                // Small delay to ensure localStorage is updated
                setTimeout(() => window.location.reload(), 100);
              }
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

        {showCoCResources && (
          <CoCResourcesModal onClose={() => setShowCoCResources(false)} />
        )}

        {showAboutCoC && (
          <AboutCoCModal onClose={() => setShowAboutCoC(false)} />
        )}

        {showCourses && (
          <CoursesModal show={showCourses} onClose={() => setShowCourses(false)} />
        )}

        {showWordStudy && (
          <WordStudyModal
            show={showWordStudy}
            onClose={() => setShowWordStudy(false)}
            volumeId={volumeId}
            onNavigate={navigateToReference}
          />
        )}

        {showReadingGoals && (
          <ReadingGoalsModal show={showReadingGoals} onClose={() => setShowReadingGoals(false)} />
        )}

        {showMemorization && (
          <MemorizationModal show={showMemorization} onClose={() => setShowMemorization(false)} />
        )}

        {showAchievements && (
          <AchievementsModal
            show={showAchievements}
            onClose={() => setShowAchievements(false)}
            unlockedAchievements={unlockedAchievements}
            lockedAchievements={lockedAchievements}
            totalPoints={totalPoints}
            completionPercentage={achievementCompletion}
            userData={achievementUserData}
          />
        )}

        {showChallenges && (
          <ChallengesModal
            show={showChallenges}
            onClose={() => setShowChallenges(false)}
            activeChallenges={activeChallenges}
            availableChallenges={availableChallenges}
            completedChallenges={completedChallenges}
            recommendedChallenges={recommendedChallenges}
            onJoinChallenge={joinChallenge}
          />
        )}

        {showKeyboardShortcuts && (
          <KeyboardShortcutsModal
            isOpen={showKeyboardShortcuts}
            onClose={() => setShowKeyboardShortcuts(false)}
            shortcuts={[
              { key: 'k', ctrlKey: true, description: 'Open search' },
              { key: ',', ctrlKey: true, description: 'Open settings' },
              { key: '?', shiftKey: true, description: 'Show keyboard shortcuts' },
              { key: 's', altKey: true, description: 'Toggle sidebar' },
              { key: 'd', ctrlKey: true, description: 'Toggle dark mode' },
            ]}
          />
        )}
        </Suspense>
      </ErrorBoundary>

      {/* Achievement Notifications */}
      <AchievementNotificationContainer
        achievements={newAchievements}
        onDismiss={markAsViewed}
      />

      {/* Streak Celebration */}
      {showStreakCelebration && celebratingStreak > 0 && (
        <Suspense fallback={null}>
          <StreakCelebration
            streak={celebratingStreak}
            onClose={() => setShowStreakCelebration(false)}
          />
        </Suspense>
      )}

      {/* Notification Prompt */}
      {showNotificationPrompt && (
        <NotificationPromptModal
          onClose={() => setShowNotificationPrompt(false)}
        />
      )}

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
          totalChapters={totalChapters}
          navigateToReference={navigateToReference}
        />

        <main className="flex-1 overflow-y-auto bg-[var(--color-bg-primary)]">
          {!selectedBook ? (
            <VolumeHomeScreen
              currentVolume={currentVolume}
              volumeId={volumeId}
              completionPercentage={completionPercentage}
              booksCount={books.length}
              currentStreak={readingProgress.currentStreak}
              chaptersRead={chaptersReadInVolume}
              totalChapters={totalChapters}
              onSearchClick={() => setShowSearch(true)}
              onStudyPlanClick={() => setShowStudyPlanModal(true)}
              hasStudyPlan={!!studyPlan}
            />
          ) : !selectedChapter && currentBook ? (
            <BookChapterSelector
              currentBook={currentBook}
              currentVolume={currentVolume}
              volumeId={volumeId}
              onBack={() => setSelectedBook(null)}
              onChapterSelect={setSelectedChapter}
              isChapterRead={isChapterRead}
            />
          ) : currentBook ? (
            <ChapterReader
              currentBook={currentBook}
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
          ) : null}
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
