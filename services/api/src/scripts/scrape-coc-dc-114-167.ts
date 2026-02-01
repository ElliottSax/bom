/**
 * Scraper for Community of Christ D&C Sections 114-167
 * Source: Centerplace.org (public access)
 *
 * Usage: npx tsx src/scripts/scrape-coc-dc-114-167.ts
 */

import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import * as fs from 'fs/promises';
import * as path from 'path';

interface Verse {
  num: number;
  text: string;
}

interface Section {
  section: number;
  tradition: 'coc';
  prophet_received: string;
  date_received: string | null;
  conference_date: string | null;
  verses: Verse[];
  historical_context?: string;
}

// Historical context for each section
const SECTION_CONTEXTS: Record<number, {
  prophet: string;
  dateReceived?: string;
  conferenceDate?: string;
  context: string;
}> = {
  114: {
    prophet: 'Joseph Smith III',
    dateReceived: '1860-04-16',
    conferenceDate: '1860-04-06',
    context: 'First revelation to Joseph Smith III after accepting presidency. Addressed church organization and priesthood order after succession crisis.',
  },
  145: {
    prophet: 'W. Wallace Smith',
    dateReceived: '1958-10-08',
    conferenceDate: '1958-10-08',
    context: 'Released Israel A. Smith, called F. Henry Edwards and Maurice L. Draper to First Presidency. Called Roy A. Cheville as Presiding Patriarch.',
  },
  156: {
    prophet: 'Wallace B. Smith',
    dateReceived: '1984-04-03',
    conferenceDate: '1984-04-05',
    context: 'Authorized women\'s ordination to priesthood. Announced temple purposes. Led to schism of ~50,000 members who formed Restoration Branches. First women ordained 1985.',
  },
  163: {
    prophet: 'Stephen M. Veazey',
    dateReceived: '2007-03-28',
    conferenceDate: '2007-04-08',
    context: 'Enduring Principles revelation. Established core principles of Community of Christ identity, emphasizing Jesus Christ, worth of all persons, sacredness of creation, and responsible choices.',
  },
  164: {
    prophet: 'Stephen M. Veazey',
    dateReceived: '2010-03-28',
    conferenceDate: '2010-04-10',
    context: 'Temple dedication revelation. Provided guidance on temple purposes and worship, emphasizing peace, reconciliation, and healing ministries.',
  },
  165: {
    prophet: 'Stephen M. Veazey',
    dateReceived: '2016-03-28',
    conferenceDate: '2016-04-10',
    context: 'Called church to courageously make Jesus Christ the center of individual and community life. Emphasized sharing ministries and blessings of Community of Christ.',
  },
  // Note: There is no Section 167 as of 2026. Section 165 (2016) is the most recent.
};

async function scrapeCoCSection(sectionNum: number): Promise<Section | null> {
  // Centerplace.org uses different URL formats for different section ranges
  // Sections 114-144: /hs/dc/sectionXXX.htm
  // Sections 145-159: /library/study/dc/rdc-XXX.htm
  const url = sectionNum <= 144
    ? `https://www.centerplace.org/hs/dc/section${sectionNum}.htm`
    : `https://www.centerplace.org/library/study/dc/rdc-${sectionNum}.htm`;

  try {
    console.log(`Scraping section ${sectionNum}...`);
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Failed to fetch section ${sectionNum}: ${response.status}`);
      return null;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract verses - Centerplace uses different formats for different sections
    const verses: Verse[] = [];

    // Parse paragraphs with verse markers
    $('p').each((i, elem) => {
      const text = $(elem).text().trim();

      // Try different verse marker formats:
      // Format 1: "D&C 114:1a Text here" (used in /hs/dc/ pages)
      // Format 2: "[Sec 156:1a] Text here" (used in /library/study/dc/ pages)
      let verseMatch = text.match(/^(?:D&C|Sec)\s+\d+:(\d+)[a-z]?\s+(.+)$/);
      if (!verseMatch) {
        verseMatch = text.match(/^\[(?:Sec|D&C)\s+\d+:(\d+)[a-z]?\]\s*(.+)$/);
      }

      if (verseMatch) {
        const num = parseInt(verseMatch[1]);
        const verseText = verseMatch[2].trim();

        // Check if we already have this verse number (e.g., 1a, 1b are both verse 1)
        const existingVerse = verses.find(v => v.num === num);
        if (existingVerse) {
          // Append to existing verse
          existingVerse.text += ' ' + verseText;
        } else {
          verses.push({ num, text: verseText });
        }
      }
    });

    // If no verses found, skip this section
    if (verses.length === 0) {
      console.log(`No verses found for section ${sectionNum}`);
      return null;
    }

    const context = SECTION_CONTEXTS[sectionNum];

    return {
      section: sectionNum,
      tradition: 'coc',
      prophet_received: context?.prophet || 'Unknown',
      date_received: context?.dateReceived || null,
      conference_date: context?.conferenceDate || null,
      verses,
      historical_context: context?.context,
    };
  } catch (error) {
    console.error(`Error scraping section ${sectionNum}:`, error);
    return null;
  }
}

async function scrapeAllCoCSections(): Promise<Section[]> {
  const sections: Section[] = [];

  // Scrape sections 114-159 (centerplace.org only has up to 159)
  // Sections 160-165 need to be sourced from official CoC website or added manually
  for (let sectionNum = 114; sectionNum <= 159; sectionNum++) {
    const section = await scrapeCoCSection(sectionNum);
    if (section && section.verses.length > 0) {
      sections.push(section);
      console.log(`✓ Section ${sectionNum}: ${section.verses.length} verses`);
    } else {
      console.log(`✗ Section ${sectionNum}: No verses found`);
    }

    // Be nice to the server
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return sections;
}

async function generateSQL(sections: Section[]): Promise<string> {
  let sql = `-- Community of Christ D&C Sections 114-167
-- Scraped from Centerplace.org on ${new Date().toISOString()}
--
-- Usage:
--   psql -d bom_study_tools_dev -f import-coc-dc-sections.sql

BEGIN;

-- Add tradition column if it doesn't exist
ALTER TABLE doctrine_covenants_verses ADD COLUMN IF NOT EXISTS tradition VARCHAR(10) DEFAULT 'shared';
ALTER TABLE doctrine_covenants_verses ADD COLUMN IF NOT EXISTS prophet_received VARCHAR(100);
ALTER TABLE doctrine_covenants_verses ADD COLUMN IF NOT EXISTS date_received DATE;
ALTER TABLE doctrine_covenants_verses ADD COLUMN IF NOT EXISTS conference_date DATE;

-- Insert CoC-specific sections
`;

  sections.forEach(section => {
    section.verses.forEach(verse => {
      const text = verse.text.replace(/'/g, "''"); // Escape single quotes
      const dateReceived = section.date_received ? `'${section.date_received}'` : 'NULL';
      const conferenceDate = section.conference_date ? `'${section.conference_date}'` : 'NULL';

      sql += `INSERT INTO doctrine_covenants_verses (section, verse, text, tradition, prophet_received, date_received, conference_date)
VALUES (${section.section}, ${verse.num}, '${text}', 'coc', '${section.prophet_received}', ${dateReceived}, ${conferenceDate});
`;
    });
  });

  sql += `
COMMIT;

-- Summary
SELECT
  COUNT(*) as total_coc_verses,
  MIN(section) as first_section,
  MAX(section) as last_section
FROM doctrine_covenants_verses
WHERE tradition = 'coc';
`;

  return sql;
}

async function generateJSON(sections: Section[]): Promise<string> {
  return JSON.stringify(sections, null, 2);
}

// Main execution
async function main() {
  console.log('Starting CoC D&C Scraper (Sections 114-167)...\n');

  const sections = await scrapeAllCoCSections();

  console.log(`\n✓ Successfully scraped ${sections.length} sections`);
  console.log(`  Total verses: ${sections.reduce((sum, s) => sum + s.verses.length, 0)}`);

  // Save as JSON
  const jsonOutput = await generateJSON(sections);
  const jsonPath = path.join(__dirname, '../../prisma/seeds/coc-dc-sections-114-167.json');
  await fs.writeFile(jsonPath, jsonOutput);
  console.log(`\n✓ Saved JSON: ${jsonPath}`);

  // Generate SQL
  const sqlOutput = await generateSQL(sections);
  const sqlPath = path.join(__dirname, '../../prisma/seeds/import-coc-dc-sections.sql');
  await fs.writeFile(sqlPath, sqlOutput);
  console.log(`✓ Saved SQL: ${sqlPath}`);

  console.log('\nNext steps:');
  console.log('  1. Review the generated files');
  console.log('  2. Run: psql -d bom_study_tools_dev -f prisma/seeds/import-coc-dc-sections.sql');
  console.log('  3. Verify: SELECT COUNT(*) FROM doctrine_covenants_verses WHERE tradition = \'coc\';');
}

main().catch(console.error);
