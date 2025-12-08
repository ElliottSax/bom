#!/usr/bin/env tsx
/**
 * Scripture Scraper: Community of Christ Doctrine & Covenants
 * Source: https://www.centerplace.org/hs/dc/
 *
 * Scrapes sections 1-167 from Centerplace.org and converts to JSON format
 * for import into the database.
 */

import * as https from 'https';
import * as fs from 'fs/promises';
import * as path from 'path';

interface Verse {
  id: string;
  editionId: string;
  book: string;
  chapter: number; // section number for D&C
  verse: number;
  text: string;
  verseType: string;
}

const EDITION_ID = 'coc-dc-2017';
const BOOK_NAME = 'Doctrine and Covenants';
const BASE_URL = 'https://www.centerplace.org/hs/dc/';
const OUTPUT_DIR = path.join(__dirname, '../../prisma/seeds/scraped');

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
 * Parse D&C section HTML and extract verses
 *
 * Format example: "D&C 1:1a", "D&C 1:1b", "D&C 1:2"
 * CoC D&C uses letter suffixes (a, b, c) for verse subdivisions
 */
function parseSection(html: string, sectionNumber: number): Verse[] {
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

  // Regex to match verse references like "D&C 1:1a", "D&C 1:2", etc.
  // Pattern: D&C [section]:[verse][optional letter]
  const versePattern = new RegExp(
    `D&C\\s+${sectionNumber}:(\\d+)([a-z]?)\\s+([^D&C]+?)(?=\\s*D&C\\s+${sectionNumber}:|$)`,
    'gi'
  );

  let match;
  let verseCounter = 1;

  while ((match = versePattern.exec(bodyText)) !== null) {
    const verseNum = parseInt(match[1], 10);
    const suffix = match[2]; // 'a', 'b', 'c', etc.
    const text = match[3].trim();

    // Skip empty verses
    if (!text || text.length < 5) continue;

    // Generate ID: "coc-dc-2017:section-1-1"
    const id = `${EDITION_ID}:section-${sectionNumber}-${verseCounter}`;

    verses.push({
      id,
      editionId: EDITION_ID,
      book: BOOK_NAME,
      chapter: sectionNumber,
      verse: verseCounter,
      text,
      verseType: 'standard',
    });

    verseCounter++;
  }

  return verses;
}

/**
 * Scrape a single D&C section
 */
async function scrapeSection(sectionNumber: number): Promise<Verse[]> {
  const sectionStr = sectionNumber.toString().padStart(3, '0');
  const url = `${BASE_URL}section${sectionStr}.htm`;

  console.log(`Fetching Section ${sectionNumber}...`);

  try {
    const html = await fetchUrl(url);
    const verses = parseSection(html, sectionNumber);

    console.log(`  ✓ Section ${sectionNumber}: ${verses.length} verses`);
    return verses;
  } catch (error) {
    console.error(`  ✗ Section ${sectionNumber} failed:`, error);
    return [];
  }
}

/**
 * Scrape multiple sections
 */
async function scrapeSections(start: number, end: number): Promise<Verse[]> {
  const allVerses: Verse[] = [];

  for (let section = start; section <= end; section++) {
    const verses = await scrapeSection(section);
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

  if (args.length < 2) {
    console.log('Usage: tsx scrape-coc-dc.ts <start-section> <end-section>');
    console.log('Example: tsx scrape-coc-dc.ts 1 50');
    console.log('\nPriority sections:');
    console.log('  P0: 1-50   (Critical - Joseph Smith revelations)');
    console.log('  P1: 51-113 (Important - Joseph Smith revelations)');
    console.log('  P2: 114-167 (CoC-specific - later presidents)');
    process.exit(1);
  }

  const startSection = parseInt(args[0], 10);
  const endSection = parseInt(args[1], 10);

  if (isNaN(startSection) || isNaN(endSection)) {
    console.error('Error: Section numbers must be integers');
    process.exit(1);
  }

  if (startSection < 1 || endSection > 167 || startSection > endSection) {
    console.error('Error: Valid section range is 1-167, and start must be <= end');
    process.exit(1);
  }

  console.log(`\n📖 Scraping CoC D&C Sections ${startSection}-${endSection}\n`);

  const verses = await scrapeSections(startSection, endSection);
  const filename = `coc-dc-sections-${startSection}-${endSection}.json`;

  await saveVerses(verses, filename);

  console.log('\n✅ Scraping complete!');
  console.log(`Total verses: ${verses.length}`);
  console.log(`Next step: Run the import script to load into database`);
}

main().catch(console.error);
