#!/usr/bin/env tsx
/**
 * Test GraphQL resolvers with real database data
 */

import { PrismaClient } from '@prisma/client';
import { resolvers } from '../graphql/resolvers';

const prisma = new PrismaClient();

interface GraphQLContext {
  prisma: typeof prisma;
  user?: { userId: string };
}

const context: GraphQLContext = {
  prisma,
};

async function main() {
  console.log('\n📊 Testing GraphQL Resolvers\n');
  console.log('='.repeat(80));

  try {
    // Test 1: Get all scripture works
    console.log('\n1. Testing scriptureWorks query...');
    const works = await resolvers.Query.scriptureWorks(null, {}, context);
    console.log(`✓ Found ${works.length} scripture works:`);
    for (const w of works) {
      console.log(`  - ${w.name} (${w.abbreviation})`);
    }

    // Test 2: Get all editions
    console.log('\n2. Testing editions query...');
    const editions = await resolvers.Query.editions(null, {}, context);
    console.log(`✓ Found ${editions.length} editions:`);
    for (const e of editions) {
      console.log(`  - ${e.shortName}: ${e.name} (${e.year})`);
    }

    // Test 3: Get Book of Mormon editions
    console.log('\n3. Testing editions for Book of Mormon...');
    const bomEditions = await resolvers.Query.editions(
      null,
      { workId: 'book-of-mormon' },
      context
    );
    console.log(`✓ Found ${bomEditions.length} Book of Mormon editions:`);
    for (const e of bomEditions) {
      console.log(`  - ${e.shortName} (${e.versificationSystem})`);
    }

    // Test 4: Get verses from I Nephi Chapter 1
    console.log('\n4. Testing verses query (I Nephi 1, CoC edition)...');
    const verses = await resolvers.Query.verses(
      null,
      { book: 'I Nephi', chapter: 1, editionId: 'coc-bom-1908' },
      context
    );
    console.log(`✓ Found ${verses.length} verses in I Nephi 1 (CoC):`);
    for (const v of verses) {
      console.log(`  ${v.verse}. ${v.text.substring(0, 60)}...`);
    }

    // Test 5: Get specific verse
    console.log('\n5. Testing verseByReference query...');
    const verse = await resolvers.Query.verseByReference(
      null,
      { book: 'I Nephi', chapter: 1, verse: 1, editionId: 'coc-bom-1908' },
      context
    );
    console.log(`✓ Found verse:` );
    console.log(`  ID: ${verse.id}`);
    console.log(`  Edition: ${verse.edition.shortName}`);
    console.log(`  Text: ${verse.text.substring(0, 100)}...`);

    // Test 6: Test ScriptureWork field resolver
    console.log('\n6. Testing ScriptureWork.editions field resolver...');
    const bom = await resolvers.Query.scriptureWork(
      null,
      { id: 'book-of-mormon' },
      context
    );
    const bomEditionsField = await resolvers.ScriptureWork.editions(bom, {}, context);
    console.log(`✓ ScriptureWork "${bom.name}" has ${bomEditionsField.length} editions`);

    // Test 7: Test Edition.work field resolver
    console.log('\n7. Testing Edition.work field resolver...');
    const cocEdition = await resolvers.Query.edition(
      null,
      { id: 'coc-bom-1908' },
      context
    );
    const work = await resolvers.Edition.work(cocEdition, {}, context);
    console.log(`✓ Edition "${cocEdition.shortName}" belongs to work "${work.name}"`);

    // Test 8: Test verse equivalents (cross-edition mappings)
    console.log('\n8. Testing verseEquivalents query...');
    const mappings = await resolvers.Query.verseEquivalents(
      null,
      { verseId: 'coc-bom-1908:iii-nephi-5-8' },
      context
    );
    console.log(`✓ Found ${mappings.length} cross-edition mappings`);
    if (mappings.length > 0) {
      for (const m of mappings) {
        console.log(`  ${m.fromVerse.id} ↔ ${m.toVerse.id} (${m.mappingType})`);
      }
    }

    // Test 9: Test Verse field resolvers
    console.log('\n9. Testing Verse field resolvers...');
    const testVerse = verses[0];
    const verseEdition = await resolvers.Verse.edition(testVerse, {}, context);
    const verseEquivalents = await resolvers.Verse.equivalentVerses(testVerse, {}, context);
    console.log(`✓ Verse edition: ${verseEdition.shortName}`);
    console.log(`✓ Verse equivalents: ${verseEquivalents.length} mappings`);

    console.log('\n' + '='.repeat(80));
    console.log('✅ All GraphQL resolver tests passed!\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
