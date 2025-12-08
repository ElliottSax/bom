#!/usr/bin/env tsx
/**
 * Scripture Scraper: Community of Christ Book of Mormon
 * Source: https://www.centerplace.org/hs/bm/
 *
 * Scrapes all 15 books (124 chapters total) from Centerplace.org and converts
 * to JSON format for import into the database.
 */

import * as https from 'https';
import * as fs from 'fs/promises';
import * as path from 'path';

interface Verse {
  id: string;
  editionId: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  verseType: string;
}

interface BookInfo {
  filename: string;
  displayName: string;
  chapters: number;
}

const EDITION_ID = 'coc-bom-1908';
const BASE_URL = 'https://www.centerplace.org/hs/bm/';
const OUTPUT_DIR = path.join(__dirname, '../../prisma/seeds/scraped');

// CoC Book of Mormon structure (original 1830 chapter divisions)
const BOOKS: BookInfo[] = [
  { filename: '1nephi.htm', displayName: 'I Nephi', chapters: 6 },
  { filename: '2nephi.htm', displayName: 'II Nephi', chapters: 11 },
  { filename: 'jacob.htm', displayName: 'Jacob', chapters: 7 },
  { filename: 'enos.htm', displayName: 'Enos', chapters: 1 },
  { filename: 'jarom.htm', displayName: 'Jarom', chapters: 1 },
  { filename: 'omni.htm', displayName: 'Omni', chapters: 1 },
  { filename: 'wofm.htm', displayName: 'Words of Mormon', chapters: 1 },
  { filename: 'mosiah.htm', displayName: 'Mosiah', chapters: 13 },
  { filename: 'alma.htm', displayName: 'Alma', chapters: 29 },
  { filename: 'helaman.htm', displayName: 'Helaman', chapters: 5 },
  { filename: '3nephi.htm', displayName: 'III Nephi', chapters: 14 },
  { filename: '4nephi.htm', displayName: 'IV Nephi', chapters: 1 },
  { filename: 'mormon.htm', displayName: 'Mormon', chapters: 9 },
  { filename: 'ether.htm', displayName: 'Ether', chapters: 15 },
  { filename: 'moroni.htm', displayName: 'Moroni', chapters: 10 },
];

/**
 * Fetch HTML content from a URL
 */
async function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    });
  });
}

/**
 * Parse Book of Mormon book HTML and extract verses
 *
 * Format: Plain text with chapter markers like "### Chapter 1"
 * Verses are numbered sequentially like "1:1", "1:2", etc.
 */
function parseBook(html: string, bookName: string): Verse[] {
  const verses: Verse[] = [];

  // Remove HTML tags to get plain text
  const bodyText = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ');

  // Split by chapter markers (### Chapter N)
  const chapterSections = bodyText.split(/###\s*Chapter\s+(\d+)/i);

  // Process each chapter (skip index 0 which is before first chapter)
  for (let i = 1; i < chapterSections.length; i += 2) {
    const chapterNum = parseInt(chapterSections[i], 10);
    const chapterText = chapterSections[i + 1];

    if (!chapterText) continue;

    // Extract verses using pattern: "chapter:verse text"
    // Example: "1:1 I, Nephi, having been born..."
    const versePattern = new RegExp(`${chapterNum}:(\\d+)\\s+([^${chapterNum}:]+?)(?=\\s*${chapterNum}:\\d+|$)`, 'gs');

    let match;
    while ((match = versePattern.exec(chapterText)) !== null) {
      const verseNum = parseInt(match[1], 10);
      const text = match[2].trim();

      // Skip empty verses
      if (!text || text.length < 5) continue;

      // Generate ID: "coc-bom-1908:i-nephi-1-1"
      const bookId = bookName.toLowerCase().replace(/\s+/g, '-');
      const id = `${EDITION_ID}:${bookId}-${chapterNum}-${verseNum}`;

      verses.push({
        id,
        editionId: EDITION_ID,
        book: bookName,
        chapter: chapterNum,
        verse: verseNum,
        text,
        verseType: 'standard',
      });
    }
  }

  return verses;
}

/**
 * Scrape a single book
 */
async function scrapeBook(bookInfo: BookInfo): Promise<Verse[]> {
  const url = `${BASE_URL}${bookInfo.filename}`;

  console.log(`Fetching ${bookInfo.displayName}...`);

  try {
    const html = await fetchUrl(url);
    const verses = parseBook(html, bookInfo.displayName);

    console.log(`  ✓ ${bookInfo.displayName}: ${verses.length} verses across ${bookInfo.chapters} chapters`);
    return verses;
  } catch (error) {
    console.error(`  ✗ ${bookInfo.displayName} failed:`, error);
    return [];
  }
}

/**
 * Scrape all books
 */
async function scrapeAllBooks(): Promise<Verse[]> {
  const allVerses: Verse[] = [];

  for (const book of BOOKS) {
    const verses = await scrapeBook(book);
    allVerses.push(...verses);

    // Rate limiting: wait 500ms between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return allVerses;
}

/**
 * Scrape specific books
 */
async function scrapeBooksByName(bookNames: string[]): Promise<Verse[]> {
  const allVerses: Verse[] = [];

  for (const bookName of bookNames) {
    const bookInfo = BOOKS.find(b =>
      b.displayName.toLowerCase() === bookName.toLowerCase() ||
      b.filename.replace('.htm', '') === bookName.toLowerCase().replace(/\s+/g, '')
    );

    if (!bookInfo) {
      console.error(`  ✗ Book not found: ${bookName}`);
      continue;
    }

    const verses = await scrapeBook(bookInfo);
    allVerses.push(...verses);

    // Rate limiting: wait 500ms between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return allVerses;
}

/**
 * Save verses to JSON file
 */
async function saveVerses(verses: Verse[], filename: string): Promise<void> {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const filepath = path.join(OUTPUT_DIR, filename);
  await fs.writeFile(filepath, JSON.stringify(verses, null, 2));
  console.log(`\n✓ Saved ${verses.length} verses to ${filename}`);
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);

  console.log(`\n📖 Scraping CoC Book of Mormon (1908 Edition)\n`);

  if (args.length === 0) {
    // Scrape all books
    console.log('Scraping all 15 books (124 chapters)...\n');
    const verses = await scrapeAllBooks();
    await saveVerses(verses, 'coc-bom-complete.json');

    console.log('\n✅ Scraping complete!');
    console.log(`Total verses: ${verses.length}`);
    console.log(`Books: ${BOOKS.length}`);
    console.log(`Next step: Run the import script to load into database`);
  } else {
    // Scrape specific books
    console.log(`Scraping books: ${args.join(', ')}\n`);
    const verses = await scrapeBooksByName(args);
    const filename = `coc-bom-${args.join('-').toLowerCase()}.json`;
    await saveVerses(verses, filename);

    console.log('\n✅ Scraping complete!');
    console.log(`Total verses: ${verses.length}`);
  }

  console.log('\nAvailable books:');
  BOOKS.forEach(b => console.log(`  - ${b.displayName} (${b.chapters} chapters)`));
}

main().catch(console.error);
