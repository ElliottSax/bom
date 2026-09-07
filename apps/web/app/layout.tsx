import type { Metadata, Viewport } from 'next';
import { Noto_Serif, Open_Sans } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const notoSerif = Noto_Serif({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-serif',
  weight: ['400', '500', '600', '700'],
});

// Community of Christ's world-church UI/sans font. The CSS variable keeps its
// original name (--font-inter) so downstream Tailwind config / components don't
// need a rename.
const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Scripture Study - Community of Christ',
  description:
    'Book of Mormon, Doctrine & Covenants, and Inspired Version study tools for Community of Christ',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0075C9' },
    { media: '(prefers-color-scheme: dark)', color: '#121212' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${notoSerif.variable} ${openSans.variable}`}
      suppressHydrationWarning
    >
      <head />
      <body className="min-h-screen">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('coc-theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
