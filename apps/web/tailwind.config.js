/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-noto-serif)', 'Georgia', 'Times New Roman', 'serif'],
        sans: ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        accent: 'var(--color-accent)',
        'accent-light': 'var(--color-accent-light)',
        gold: 'var(--color-gold)',
        'gold-light': 'var(--color-gold-light)',
      },
    },
  },
  plugins: [],
};
