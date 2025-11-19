'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Download, RefreshCw, Palette, Share2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockVerses, moodColors, type Verse } from '@/lib/mock-data';

type CardStyle = 'minimalist' | 'ornate' | 'modern' | 'gradient' | 'photographic';
type CardSize = 'instagram-post' | 'instagram-story' | 'twitter' | 'wallpaper';

interface VerseCardGeneratorProps {
  onBack: () => void;
}

export default function VerseCardGenerator({ onBack }: VerseCardGeneratorProps) {
  const [selectedVerse, setSelectedVerse] = useState(mockVerses[0]);
  const [cardStyle, setCardStyle] = useState<CardStyle>('gradient');
  const [cardSize, setCardSize] = useState<CardSize>('instagram-post');
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateCard();
  }, [selectedVerse, cardStyle, cardSize]);

  const generateCard = () => {
    setIsGenerating(true);
    setTimeout(() => {
      drawCard();
      setIsGenerating(false);
    }, 500);
  };

  const drawCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size based on format
    const sizes = {
      'instagram-post': { width: 1080, height: 1080 },
      'instagram-story': { width: 1080, height: 1920 },
      'twitter': { width: 1200, height: 675 },
      'wallpaper': { width: 1920, height: 1080 }
    };

    const { width, height } = sizes[cardSize];
    canvas.width = width;
    canvas.height = height;

    // Get mood colors
    const colors = selectedVerse.mood ? moodColors[selectedVerse.mood] : moodColors.hopeful;

    // Draw based on style
    switch (cardStyle) {
      case 'gradient':
        drawGradientStyle(ctx, width, height, colors);
        break;
      case 'minimalist':
        drawMinimalistStyle(ctx, width, height, colors);
        break;
      case 'ornate':
        drawOrnateStyle(ctx, width, height, colors);
        break;
      case 'modern':
        drawModernStyle(ctx, width, height, colors);
        break;
      case 'photographic':
        drawPhotographicStyle(ctx, width, height, colors);
        break;
    }

    // Add verse text
    drawVerseText(ctx, width, height, selectedVerse);
  };

  const drawGradientStyle = (ctx: CanvasRenderingContext2D, width: number, height: number, colors: any) => {
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, colors.primary);
    gradient.addColorStop(1, colors.secondary);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add subtle patterns
    ctx.globalAlpha = 0.1;
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 100 + 50;
      const circleGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      circleGradient.addColorStop(0, '#ffffff');
      circleGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = circleGradient;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    ctx.globalAlpha = 1;
  };

  const drawMinimalistStyle = (ctx: CanvasRenderingContext2D, width: number, height: number, colors: any) => {
    // Clean white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Accent line
    ctx.fillStyle = colors.primary;
    ctx.fillRect(width * 0.1, height * 0.3, 6, height * 0.4);
  };

  const drawOrnateStyle = (ctx: CanvasRenderingContext2D, width: number, height: number, colors: any) => {
    // Rich gradient
    const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, colors.primary);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.strokeRect(width * 0.08, height * 0.08, width * 0.84, height * 0.84);

    ctx.lineWidth = 2;
    ctx.strokeRect(width * 0.1, height * 0.1, width * 0.8, height * 0.8);

    // Corner decorations
    const cornerSize = 30;
    const corners = [
      [width * 0.1, height * 0.1],
      [width * 0.9, height * 0.1],
      [width * 0.1, height * 0.9],
      [width * 0.9, height * 0.9]
    ];

    ctx.fillStyle = colors.secondary;
    corners.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, cornerSize, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const drawModernStyle = (ctx: CanvasRenderingContext2D, width: number, height: number, colors: any) => {
    // Dark background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Geometric shapes
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = colors.primary;
    ctx.fillRect(width * 0.6, 0, width * 0.4, height * 0.5);

    ctx.fillStyle = colors.secondary;
    ctx.fillRect(0, height * 0.6, width * 0.3, height * 0.4);
    ctx.globalAlpha = 1;
  };

  const drawPhotographicStyle = (ctx: CanvasRenderingContext2D, width: number, height: number, colors: any) => {
    // Soft gradient background simulating photography
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(0.5, colors.primary + '20');
    gradient.addColorStop(1, '#f1f5f9');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Vignette effect
    const vignette = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 1.5);
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
  };

  const drawVerseText = (ctx: CanvasRenderingContext2D, width: number, height: number, verse: Verse) => {
    // Determine text color based on style
    const isLightBg = cardStyle === 'minimalist' || cardStyle === 'photographic';
    const textColor = isLightBg ? '#1a1a2e' : '#ffffff';
    const refColor = isLightBg ? '#666666' : '#cccccc';

    // Verse text
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Main text - word wrap
    const maxWidth = width * 0.7;
    const fontSize = Math.max(width * 0.035, 32);
    ctx.font = `${fontSize}px Georgia, serif`;

    const words = verse.text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine + word + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine !== '') {
        lines.push(currentLine);
        currentLine = word + ' ';
      } else {
        currentLine = testLine;
      }
    });
    lines.push(currentLine);

    // Draw text lines
    const lineHeight = fontSize * 1.5;
    const totalHeight = lines.length * lineHeight;
    const startY = (height - totalHeight) / 2;

    lines.forEach((line, i) => {
      ctx.fillText(line.trim(), width / 2, startY + i * lineHeight);
    });

    // Reference
    const refFontSize = Math.max(width * 0.025, 24);
    ctx.font = `600 ${refFontSize}px Inter, sans-serif`;
    ctx.fillStyle = refColor;
    ctx.fillText(verse.reference, width / 2, startY + totalHeight + lineHeight);

    // Logo/branding
    ctx.font = `${Math.max(width * 0.015, 16)}px Inter, sans-serif`;
    ctx.fillStyle = refColor;
    ctx.globalAlpha = 0.6;
    ctx.fillText('Community of Christ Study', width / 2, height * 0.92);
    ctx.globalAlpha = 1;
  };

  const downloadCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${selectedVerse.reference.replace(/\s+/g, '-')}-${cardStyle}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-red-50"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 px-6 py-4 glass shadow-sm"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/50 hover:bg-white/70 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <Palette className="w-6 h-6 text-orange-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Verse Card Generator
            </h1>
          </div>
          <button
            onClick={downloadCard}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700 transition-all"
          >
            <Download className="w-5 h-5" />
            Download
          </button>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto p-6 flex gap-6">
        {/* Controls Panel */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-96 flex-shrink-0 space-y-6"
        >
          {/* Verse Selection */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Verse
            </label>
            <select
              value={selectedVerse.id}
              onChange={(e) => {
                const verse = mockVerses.find(v => v.id === e.target.value);
                if (verse) setSelectedVerse(verse);
              }}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {mockVerses.map(v => (
                <option key={v.id} value={v.id}>
                  {v.reference}
                </option>
              ))}
            </select>
          </div>

          {/* Style Selection */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Card Style
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['gradient', 'minimalist', 'ornate', 'modern', 'photographic'] as CardStyle[]).map((style) => (
                <StyleButton
                  key={style}
                  style={style}
                  active={cardStyle === style}
                  onClick={() => setCardStyle(style)}
                />
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Card Size
            </label>
            <div className="space-y-2">
              {(['instagram-post', 'instagram-story', 'twitter', 'wallpaper'] as CardSize[]).map((size) => (
                <SizeButton
                  key={size}
                  size={size}
                  active={cardSize === size}
                  onClick={() => setCardSize(size)}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 space-y-3">
            <button
              onClick={generateCard}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 transition-all"
            >
              <RefreshCw className={cn("w-5 h-5", isGenerating && "animate-spin")} />
              Regenerate
            </button>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 transition-colors">
              <Share2 className="w-5 h-5" />
              Share
            </button>
          </div>
        </motion.div>

        {/* Preview */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex-1 flex items-center justify-center"
        >
          <div className="relative">
            <AnimatePresence mode="wait">
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-2xl z-10"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-orange-600 animate-spin" />
                    <span className="text-lg font-semibold">Generating...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <canvas
              ref={canvasRef}
              className="max-w-full h-auto rounded-2xl shadow-2xl"
              style={{ maxHeight: 'calc(100vh - 200px)' }}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function StyleButton({ style, active, onClick }: { style: CardStyle; active: boolean; onClick: () => void }) {
  const labels = {
    gradient: 'Gradient',
    minimalist: 'Minimalist',
    ornate: 'Ornate',
    modern: 'Modern',
    photographic: 'Photo'
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium",
        active
          ? "border-orange-600 bg-orange-50 text-orange-700"
          : "border-gray-200 bg-white hover:border-gray-300"
      )}
    >
      {labels[style]}
    </button>
  );
}

function SizeButton({ size, active, onClick }: { size: CardSize; active: boolean; onClick: () => void }) {
  const labels = {
    'instagram-post': 'Instagram Post (1:1)',
    'instagram-story': 'Instagram Story (9:16)',
    'twitter': 'Twitter (16:9)',
    'wallpaper': 'Wallpaper (16:9)'
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full px-4 py-2 rounded-lg text-left text-sm transition-all",
        active
          ? "bg-orange-600 text-white"
          : "bg-gray-100 hover:bg-gray-200 text-gray-800"
      )}
    >
      {labels[size]}
    </button>
  );
}
