'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, Maximize2, Minimize2, Type, Moon, Sun, Bookmark, Copy, Check, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockVerses, type Verse } from '@/lib/mock-data';
import { useToast } from '@/components/ui/Toast';

interface ImmersiveReaderProps {
  onBack: () => void;
}

export default function ImmersiveReader({ onBack }: ImmersiveReaderProps) {
  const [focusedVerse, setFocusedVerse] = useState<string | null>(null);
  const [readingMode, setReadingMode] = useState<'normal' | 'focus' | 'immersive'>('normal');
  const [fontSize, setFontSize] = useState(18);
  const [darkMode, setDarkMode] = useState(false);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [copiedVerse, setCopiedVerse] = useState<string | null>(null);
  const { scrollYProgress } = useScroll();
  const { addToast } = useToast();

  // Sample verses for demonstration
  const verses = mockVerses.filter(v => v.scripture === 'book-of-mormon').slice(0, 5);

  // Load bookmarks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('bookmarks');
    if (saved) {
      setBookmarks(new Set(JSON.parse(saved)));
    }
  }, []);

  // Save bookmarks to localStorage
  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify(Array.from(bookmarks)));
  }, [bookmarks]);

  // Toggle bookmark
  const toggleBookmark = (verseId: string) => {
    setBookmarks(prev => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(verseId)) {
        newBookmarks.delete(verseId);
        addToast('Bookmark removed', 'info');
      } else {
        newBookmarks.add(verseId);
        addToast('Verse bookmarked!', 'success');
      }
      return newBookmarks;
    });
  };

  // Copy verse to clipboard
  const copyVerse = async (verse: Verse) => {
    const text = `${verse.text}\n\n— ${verse.reference}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedVerse(verse.id);
      addToast('Verse copied to clipboard!', 'success');
      setTimeout(() => setCopiedVerse(null), 2000);
    } catch (err) {
      addToast('Failed to copy verse', 'error');
    }
  };

  // Background gradient based on scroll
  const background1 = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    darkMode
      ? ['#1a1a2e', '#16213e', '#0f3460']
      : ['#e0f2fe', '#fce7f3', '#f3e8ff']
  );

  const background2 = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    darkMode
      ? ['#16213e', '#0f3460', '#1a1a2e']
      : ['#fce7f3', '#f3e8ff', '#e0f2fe']
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "min-h-screen relative overflow-hidden transition-colors duration-500",
        darkMode ? "bg-slate-900" : "bg-white"
      )}
    >
      {/* Animated Background */}
      <motion.div
        className="fixed inset-0 -z-10"
        style={{
          background: useTransform(
            [background1, background2],
            ([bg1, bg2]) => `linear-gradient(135deg, ${bg1} 0%, ${bg2} 100%)`
          )
        }}
      />

      {/* Floating Particles */}
      {readingMode === 'immersive' && <ParticleField darkMode={darkMode} />}

      {/* Header Controls */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 px-6 py-4 glass",
          readingMode === 'immersive' && "opacity-0 hover:opacity-100 transition-opacity"
        )}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-3">
            {/* Dark Mode */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              title="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Font Size */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/20">
              <Type className="w-5 h-5" />
              <input
                type="range"
                min="14"
                max="28"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-24"
              />
              <span className="text-sm">{fontSize}px</span>
            </div>

            {/* Reading Modes */}
            <div className="flex gap-1 p-1 rounded-lg bg-white/20">
              <ModeButton
                active={readingMode === 'normal'}
                onClick={() => setReadingMode('normal')}
                title="Normal"
              >
                Normal
              </ModeButton>
              <ModeButton
                active={readingMode === 'focus'}
                onClick={() => setReadingMode('focus')}
                title="Focus Mode"
              >
                Focus
              </ModeButton>
              <ModeButton
                active={readingMode === 'immersive'}
                onClick={() => setReadingMode('immersive')}
                title="Immersive"
              >
                <Maximize2 className="w-4 h-4" />
              </ModeButton>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 origin-left z-50"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Scripture Content */}
      <div className="max-w-4xl mx-auto px-8 py-32">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "text-4xl font-bold mb-12 text-center",
            darkMode ? "text-white" : "text-gray-900"
          )}
        >
          Book of Mormon
        </motion.h2>

        {verses.map((verse, index) => (
          <VerseBlock
            key={verse.id}
            verse={verse}
            index={index}
            fontSize={fontSize}
            darkMode={darkMode}
            readingMode={readingMode}
            isFocused={focusedVerse === verse.id}
            isBookmarked={bookmarks.has(verse.id)}
            isCopied={copiedVerse === verse.id}
            onFocus={() => setFocusedVerse(verse.id)}
            onToggleBookmark={() => toggleBookmark(verse.id)}
            onCopy={() => copyVerse(verse)}
          />
        ))}
      </div>

      {/* Scroll Hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 text-sm opacity-50"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          ↓ Scroll to explore ↓
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

interface VerseBlockProps {
  verse: Verse;
  index: number;
  fontSize: number;
  darkMode: boolean;
  readingMode: 'normal' | 'focus' | 'immersive';
  isFocused: boolean;
  isBookmarked: boolean;
  isCopied: boolean;
  onFocus: () => void;
  onToggleBookmark: () => void;
  onCopy: () => void;
}

function VerseBlock({ verse, index, fontSize, darkMode, readingMode, isFocused, isBookmarked, isCopied, onFocus, onToggleBookmark, onCopy }: VerseBlockProps) {
  const shouldBlur = readingMode === 'focus' && !isFocused;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onClick={onFocus}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        "mb-12 transition-all duration-500 cursor-pointer group",
        shouldBlur && "opacity-30 blur-sm scale-95",
        isFocused && readingMode === 'focus' && "scale-105 opacity-100 blur-0"
      )}
    >
      {/* Verse Reference */}
      <motion.div
        className={cn(
          "text-sm font-semibold mb-2",
          darkMode ? "text-blue-400" : "text-blue-600"
        )}
        whileHover={{ x: 5 }}
      >
        {verse.reference}
      </motion.div>

      {/* Verse Text */}
      <div className="relative group">
        <motion.p
          className={cn(
            "font-serif leading-relaxed",
            darkMode ? "text-gray-200" : "text-gray-800"
          )}
          style={{ fontSize: `${fontSize}px` }}
          whileHover={{ letterSpacing: "0.02em" }}
          transition={{ duration: 0.3 }}
        >
          <span className={cn(
            "verse-number text-sm mr-2 select-none",
            darkMode ? "text-gray-500" : "text-gray-400"
          )}>
            {verse.verse}
          </span>
          {verse.text}
        </motion.p>

        {/* Action Buttons - Appear on hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 mt-3"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCopy}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  darkMode
                    ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                )}
                title="Copy verse"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onToggleBookmark}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  isBookmarked
                    ? darkMode
                      ? "bg-blue-900 text-blue-300"
                      : "bg-blue-100 text-blue-700"
                    : darkMode
                    ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                )}
                title={isBookmarked ? "Remove bookmark" : "Bookmark verse"}
              >
                <Bookmark
                  className={cn("w-4 h-4", isBookmarked && "fill-current")}
                />
                <span>{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Theme Tags */}
        {verse.themes && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 mt-4"
          >
            {verse.themes.map((theme) => (
              <span
                key={theme}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium",
                  darkMode
                    ? "bg-blue-900/30 text-blue-300"
                    : "bg-blue-100 text-blue-700"
                )}
              >
                {theme}
              </span>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function ModeButton({ active, onClick, title, children }: any) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
        active
          ? "bg-white/40 shadow-sm"
          : "hover:bg-white/20"
      )}
    >
      {children}
    </button>
  );
}

function ParticleField({ darkMode }: { darkMode: boolean }) {
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 4 + Math.random() * 3,
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={cn(
            "absolute w-1 h-1 rounded-full",
            darkMode ? "bg-blue-400/30" : "bg-blue-600/20"
          )}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
