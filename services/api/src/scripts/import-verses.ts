#!/usr/bin/env tsx
/**
 * Bulk Verse Importer
 *
 * Imports scraped scripture verses from JSON files into the PostgreSQL database
 * using Prisma. Supports batch operations for performance.
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';

const prisma = new PrismaClient();

interface Verse {
  id: string;
  editionId: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  verseType: string;
}

const SCRAPED_DIR = path.join(__dirname, '../../prisma/seeds/scraped');
const BATCH_SIZE = 100; // Insert 100 verses at a time

/**
 * Load verses from a JSON file
 */
async function loadVersesFromFile(filename: string): Promise<Verse[]> {
  const filepath = path.join(SCRAPED_DIR, filename);

  try {
    const content = await fs.readFile(filepath, 'utf-8');
    const verses = JSON.parse(content);

    if (!Array.isArray(verses)) {
      throw new Error('JSON file must contain an array of verses');
    }

    return verses;
  } catch (error) {
    console.error(`Error loading file ${filename}:`, error);
    throw error;
  }
}

/**
 * Import verses in batches for better performance
 */
async function importVersesInBatches(verses: Verse[]): Promise<void> {
  const totalBatches = Math.ceil(verses.length / BATCH_SIZE);
  let imported = 0;
  let skipped = 0;

  console.log(`Importing ${verses.length} verses in ${totalBatches} batches...`);

  for (let i = 0; i < verses.length; i += BATCH_SIZE) {
    const batch = verses.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;

    try {
      // Use createMany with skipDuplicates to avoid errors on re-runs
      const result = await prisma.verse.createMany({
        data: batch,
        skipDuplicates: true,
      });

      imported += result.count;
      skipped += batch.length - result.count;

      console.log(`  ✓ Batch ${batchNum}/${totalBatches}: ${result.count} inserted, ${batch.length - result.count} skipped`);
    } catch (error) {
      console.error(`  ✗ Batch ${batchNum}/${totalBatches} failed:`, error);
      throw error;
    }
  }

  console.log(`\n✅ Import complete: ${imported} imported, ${skipped} skipped (duplicates)`);
}

/**
 * Verify edition exists before importing verses
 */
async function verifyEdition(editionId: string): Promise<boolean> {
  const edition = await prisma.edition.findUnique({
    where: { id: editionId },
  });

  if (!edition) {
    console.error(`❌ Edition '${editionId}' not found in database`);
    console.error(`Run 'npx prisma db seed' first to create editions`);
    return false;
  }

  console.log(`✓ Edition verified: ${edition.name}`);
  return true;
}

/**
 * Get stats for an edition
 */
async function getEditionStats(editionId: string): Promise<void> {
  const verseCount = await prisma.verse.count({
    where: { editionId },
  });

  const books = await prisma.verse.groupBy({
    by: ['book'],
    where: { editionId },
    _count: { book: true },
  });

  console.log(`\n📊 Edition Stats: ${editionId}`);
  console.log(`Total verses: ${verseCount}`);
  console.log(`Books: ${books.length}`);
  console.log('\nVerses per book:');
  books.forEach(b => {
    console.log(`  ${b.book}: ${b._count.book} verses`);
  });
}

/**
 * List available JSON files
 */
async function listAvailableFiles(): Promise<void> {
  try {
    const files = await fs.readdir(SCRAPED_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    console.log('\n📁 Available JSON files:');
    for (const file of jsonFiles) {
      const filepath = path.join(SCRAPED_DIR, file);
      const content = await fs.readFile(filepath, 'utf-8');
      const verses = JSON.parse(content);
      console.log(`  - ${file} (${verses.length} verses)`);
    }
  } catch (error) {
    console.log('\n📁 No scraped files found. Run a scraper first:');
    console.log('  - tsx scrape-coc-dc.ts 1 50');
    console.log('  - tsx scrape-coc-bom.ts');
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: tsx import-verses.ts <json-filename> [--stats]');
    console.log('\nExamples:');
    console.log('  tsx import-verses.ts coc-dc-sections-1-50.json');
    console.log('  tsx import-verses.ts coc-bom-complete.json');
    console.log('  tsx import-verses.ts coc-dc-sections-1-50.json --stats');
    console.log('\nOptions:');
    console.log('  --stats  Show edition statistics after import');
    await listAvailableFiles();
    process.exit(1);
  }

  const filename = args[0];
  const showStats = args.includes('--stats');

  console.log(`\n📥 Importing verses from ${filename}\n`);

  try {
    // Load verses
    const verses = await loadVersesFromFile(filename);
    console.log(`✓ Loaded ${verses.length} verses from file`);

    // Verify edition exists
    if (verses.length === 0) {
      console.error('❌ No verses to import');
      process.exit(1);
    }

    const editionId = verses[0].editionId;
    const editionExists = await verifyEdition(editionId);

    if (!editionExists) {
      process.exit(1);
    }

    // Import verses
    await importVersesInBatches(verses);

    // Show stats if requested
    if (showStats) {
      await getEditionStats(editionId);
    }

    console.log('\n✅ Import complete!');
  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
