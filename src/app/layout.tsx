import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
});

const merriweather = Merriweather({
  weight: ['300', '400', '700'],
  subsets: ["latin"],
  variable: '--font-merriweather',
});

export const metadata: Metadata = {
  title: "Community of Christ Scripture Study",
  description: "A visually stunning, AI-powered platform for studying Community of Christ scriptures",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${merriweather.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
