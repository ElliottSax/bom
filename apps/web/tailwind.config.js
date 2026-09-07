/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-noto-serif)', 'Georgia', 'Times New Roman', 'serif'],
        sans: ['var(--font-inter)', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        // `accent`/`accent-light` (DEFAULT/light) are theme-aware — they flip with the
        // CSS custom properties in globals.css, so use bg-accent / text-accent-light for
        // anything that must adapt between light and dark mode (links, focus rings, buttons).
        // The numeric 50-900 stops are the fixed Community of Christ blue scale (anchored
        // on the real brand hexes 0075C9 / 004D71 / 0B2D3F) for when a component needs the
        // exact brand color regardless of theme, e.g. bg-accent-600, text-accent-900.
        accent: {
          DEFAULT: 'var(--color-accent)',
          light: 'var(--color-accent-light)',
          50: '#EAF3FB',
          100: '#CDE4F5',
          200: '#9BC8EB',
          300: '#69ADE1',
          400: '#3391D4',
          500: '#0075C9', // primary brand blue
          600: '#0068B0',
          700: '#004D71', // brand dark navy
          800: '#073A52',
          900: '#0B2D3F', // brand near-black navy (darkest)
        },
        // Same pattern for the gold/tan accent family (real brand hexes C5A96E / FFF4D8).
        // Use sparingly per brand guidance — highlights, dividers, badges, not primary actions.
        gold: {
          DEFAULT: 'var(--color-gold)',
          light: 'var(--color-gold-light)',
          50: '#FFF9EE',
          100: '#FFF4D8', // brand cream
          200: '#F0E2BE',
          300: '#DED0A4',
          400: '#D6C399',
          500: '#C5A96E', // brand gold accent
          600: '#B3945A',
          700: '#9C7A3C',
          800: '#7D6230',
          900: '#5E4A24',
        },
      },
    },
  },
  plugins: [],
};
