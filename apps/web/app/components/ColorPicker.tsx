'use client';

import { useState } from 'react';
import { Check, Plus } from 'lucide-react';

export interface HighlightColor {
  id: string;
  name: string;
  color: string;
  textColor?: string;
}

export const DEFAULT_COLORS: HighlightColor[] = [
  { id: 'yellow', name: 'Yellow', color: '#fef08a', textColor: '#854d0e' },
  { id: 'green', name: 'Green', color: '#bbf7d0', textColor: '#14532d' },
  { id: 'blue', name: 'Blue', color: '#bfdbfe', textColor: '#1e3a8a' },
  { id: 'purple', name: 'Purple', color: '#e9d5ff', textColor: '#581c87' },
  { id: 'pink', name: 'Pink', color: '#fbcfe8', textColor: '#831843' },
  { id: 'orange', name: 'Orange', color: '#fed7aa', textColor: '#7c2d12' },
];

interface ColorPickerProps {
  colors: HighlightColor[];
  selectedColor: string;
  onColorSelect: (colorId: string) => void;
  onAddCustomColor?: () => void;
  showAddButton?: boolean;
}

export function ColorPicker({
  colors,
  selectedColor,
  onColorSelect,
  onAddCustomColor,
  showAddButton = true,
}: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((color) => (
        <button
          key={color.id}
          onClick={() => onColorSelect(color.id)}
          className="group relative w-10 h-10 rounded-lg border-2 border-transparent hover:border-[var(--color-accent)] transition-all"
          style={{ backgroundColor: color.color }}
          title={color.name}
          aria-label={`Highlight with ${color.name}`}
        >
          {selectedColor === color.id && (
            <Check
              className="w-5 h-5 absolute inset-0 m-auto"
              style={{ color: color.textColor || '#000' }}
            />
          )}
        </button>
      ))}

      {showAddButton && onAddCustomColor && (
        <button
          onClick={onAddCustomColor}
          className="w-10 h-10 rounded-lg border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-secondary)] transition-all flex items-center justify-center"
          title="Add custom color"
          aria-label="Add custom color"
        >
          <Plus className="w-5 h-5 text-[var(--color-text-secondary)]" />
        </button>
      )}
    </div>
  );
}

interface CustomColorPickerProps {
  onSave: (color: HighlightColor) => void;
  onCancel: () => void;
}

export function CustomColorPicker({ onSave, onCancel }: CustomColorPickerProps) {
  const [colorName, setColorName] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#fef08a');
  const [textColor, setTextColor] = useState('#854d0e');

  const handleSave = () => {
    if (!colorName.trim()) {
      alert('Please enter a color name');
      return;
    }

    onSave({
      id: `custom-${Date.now()}`,
      name: colorName,
      color: backgroundColor,
      textColor,
    });
  };

  // Calculate contrast ratio for accessibility
  const getContrastRatio = (bg: string, fg: string): number => {
    const getLuminance = (hex: string): number => {
      const rgb = parseInt(hex.slice(1), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = (rgb >> 0) & 0xff;

      const [rs, gs, bs] = [r, g, b].map((c) => {
        c /= 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });

      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const l1 = getLuminance(bg);
    const l2 = getLuminance(fg);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };

  const contrastRatio = getContrastRatio(backgroundColor, textColor);
  const hasGoodContrast = contrastRatio >= 4.5; // WCAG AA standard

  return (
    <div className="p-6 bg-[var(--color-bg-secondary)] rounded-xl space-y-4">
      <h3 className="text-lg font-semibold">Create Custom Highlight Color</h3>

      {/* Color Name */}
      <div>
        <label className="block text-sm font-medium mb-2">Color Name</label>
        <input
          type="text"
          value={colorName}
          onChange={(e) => setColorName(e.target.value)}
          placeholder="e.g., Light Red"
          className="w-full px-3 py-2 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
        />
      </div>

      {/* Background Color */}
      <div>
        <label className="block text-sm font-medium mb-2">Background Color</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="w-16 h-10 rounded-lg border border-[var(--color-border)] cursor-pointer"
          />
          <input
            type="text"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            pattern="^#[0-9A-Fa-f]{6}$"
            placeholder="#fef08a"
            className="flex-1 px-3 py-2 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg font-mono text-sm"
          />
        </div>
      </div>

      {/* Text Color */}
      <div>
        <label className="block text-sm font-medium mb-2">Text Color</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="w-16 h-10 rounded-lg border border-[var(--color-border)] cursor-pointer"
          />
          <input
            type="text"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            pattern="^#[0-9A-Fa-f]{6}$"
            placeholder="#854d0e"
            className="flex-1 px-3 py-2 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg font-mono text-sm"
          />
        </div>
      </div>

      {/* Preview */}
      <div>
        <label className="block text-sm font-medium mb-2">Preview</label>
        <div
          className="p-4 rounded-lg text-center font-medium"
          style={{ backgroundColor, color: textColor }}
        >
          This is how your highlight will look
        </div>

        {/* Contrast Warning */}
        <div className="mt-2 text-xs">
          <span className={hasGoodContrast ? 'text-green-500' : 'text-orange-500'}>
            {hasGoodContrast
              ? `✓ Good contrast (${contrastRatio.toFixed(2)}:1)`
              : `⚠ Low contrast (${contrastRatio.toFixed(2)}:1) - Consider adjusting colors`}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSave}
          className="flex-1 px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg font-medium hover:opacity-90 transition"
        >
          Save Color
        </button>
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-[var(--color-bg-tertiary)] rounded-lg font-medium hover:bg-[var(--color-bg-primary)] transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
