import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  MenuIcon,
  SearchIcon,
  SettingsIcon,
  SunIcon,
  MoonIcon,
  DownloadIcon,
  CalendarIcon,
  BookOpenIcon,
  FireIcon,
  InfoIcon,
  LibraryIcon,
  AcademicCapIcon,
} from './Icons';
import { type Volume } from '../lib/types';
import { useSettings } from '../contexts/SettingsContext';
import { useUserData } from '../contexts/UserDataContext';
import { fadeIn, tapPress } from '../lib/motion';

const iconButtonClass =
  'p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-accent)] transition-colors';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  currentVolume: Volume;
  setShowStudyPlanModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowResourcesModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowBackupModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSearch: React.Dispatch<React.SetStateAction<boolean>>;
  setShowCoCResources: React.Dispatch<React.SetStateAction<boolean>>;
  setShowAboutCoC: React.Dispatch<React.SetStateAction<boolean>>;
  setShowCourses: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header: React.FC<HeaderProps> = ({
  sidebarOpen,
  setSidebarOpen,
  currentVolume,
  setShowStudyPlanModal,
  setShowResourcesModal,
  setShowBackupModal,
  setShowSettings,
  setShowSearch,
  setShowCoCResources,
  setShowAboutCoC,
  setShowCourses,
}) => {
  const { theme, cycleTheme } = useSettings();
  const { readingProgress } = useUserData();
  return (
    <header className="app-header no-print sticky top-0 z-40 bg-[var(--color-bg-primary)] border-b border-[var(--color-border-light)]">
      <div className="w-full flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={tapPress}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={iconButtonClass}
          >
            <MenuIcon />
          </motion.button>
          <div className="flex items-center gap-3">
            {/* Plain <img>, not next/image: this SVG can't be optimized by Next's image
                pipeline since next.config.js doesn't set images.dangerouslyAllowSVG */}
            <img src="/images/logo.svg" alt="Community of Christ" className="h-7 w-auto" />
            <div className="hidden sm:flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: currentVolume.color }}
                aria-hidden="true"
              />
              <h1 className="text-sm font-semibold">Scripture Study</h1>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {readingProgress.currentStreak > 0 && (
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-gold-100 dark:bg-gold-900/40 rounded-lg text-gold-700 dark:text-gold-300 mr-2">
              <FireIcon />
              <span className="text-sm font-medium">{readingProgress.currentStreak}</span>
            </div>
          )}
          <motion.button
            whileTap={tapPress}
            onClick={() => setShowCourses(true)}
            className={iconButtonClass}
            title="CoC Courses"
          >
            <AcademicCapIcon />
          </motion.button>
          <motion.button
            whileTap={tapPress}
            onClick={() => setShowAboutCoC(true)}
            className={iconButtonClass}
            title="About Community of Christ"
          >
            <InfoIcon />
          </motion.button>
          <motion.button
            whileTap={tapPress}
            onClick={() => setShowCoCResources(true)}
            className={iconButtonClass}
            title="CoC Resources"
          >
            <LibraryIcon />
          </motion.button>
          <motion.button
            whileTap={tapPress}
            onClick={() => setShowStudyPlanModal(true)}
            className={iconButtonClass}
            title="Study Plans"
          >
            <CalendarIcon />
          </motion.button>
          <motion.button
            whileTap={tapPress}
            onClick={() => setShowResourcesModal(true)}
            className={iconButtonClass}
            title="Resources"
          >
            <BookOpenIcon />
          </motion.button>
          <motion.button
            whileTap={tapPress}
            onClick={() => setShowBackupModal(true)}
            className={iconButtonClass}
            title="Backup"
          >
            <DownloadIcon />
          </motion.button>
          <motion.button
            whileTap={tapPress}
            onClick={cycleTheme}
            className={iconButtonClass}
            title={`Theme: ${theme}`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="inline-flex"
              >
                {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
              </motion.span>
            </AnimatePresence>
          </motion.button>
          <motion.button
            whileTap={tapPress}
            onClick={() => setShowSettings((prev) => !prev)}
            className={iconButtonClass}
          >
            <SettingsIcon />
          </motion.button>
          <motion.button
            whileTap={tapPress}
            onClick={() => setShowSearch(true)}
            className={iconButtonClass}
          >
            <SearchIcon />
          </motion.button>
        </div>
      </div>
    </header>
  );
};

export default Header;
