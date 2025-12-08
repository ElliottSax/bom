#!/usr/bin/env tsx
/**
 * Test API queries directly using Prisma
 * Bypasses the need to run the full GraphQL server
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://pod_user:pod_secure_password@localhost:5434/bom_study_tools'
    }
  }
});

async function main() {
  console.log('\n🧪 Testing API Queries with Full Dataset\n');
  console.log('='.repeat(60));

  // Test 1: Get database statistics
  console.log('\n1️⃣ DATABASE STATISTICS');
  console.log('-'.repeat(60));

  const totalVerses = await prisma.verse.count();
  const totalEditions = await prisma.edition.count();
  const totalWorks = await prisma.scriptureWork.count();

  console.log(`Total verses: ${totalVerses.toLocaleString()}`);
  console.log(`Total editions: ${totalEditions}`);
  console.log(`Total works: ${totalWorks}`);

  // Test 2: Get verses by edition
  console.log('\n2️⃣ VERSES BY EDITION');
  console.log('-'.repeat(60));

  const versesByEdition = await prisma.verse.groupBy({
    by: ['editionId'],
    _count: {
      id: true
    }
  });

  for (const group of versesByEdition) {
    const edition = await prisma.edition.findUnique({
      where: { id: group.editionId },
      select: { name: true }
    });
    console.log(`${edition?.name}: ${group._count.id.toLocaleString()} verses`);
  }

  // Test 3: Get Book of Mormon books
  console.log('\n3️⃣ BOOK OF MORMON BOOKS');
  console.log('-'.repeat(60));

  const bomBooks = await prisma.verse.groupBy({
    by: ['book'],
    where: {
      editionId: 'coc-bom-1908'
    },
    _count: {
      id: true
    }
  });

  for (const book of bomBooks) {
    console.log(`${book.book}: ${book._count.id} verses`);
  }

  // Test 4: Get sample verses from I Nephi Chapter 1
  console.log('\n4️⃣ SAMPLE VERSES - I Nephi Chapter 1 (verses 1-5)');
  console.log('-'.repeat(60));

  const sampleVerses = await prisma.verse.findMany({
    where: {
      editionId: 'coc-bom-1908',
      book: 'I Nephi',
      chapter: 1,
      verse: {
        lte: 5
      }
    },
    orderBy: {
      verse: 'asc'
    }
  });

  for (const v of sampleVerses) {
    const preview = v.text.length > 80 ? v.text.substring(0, 80) + '...' : v.text;
    console.log(`${v.verse}. ${preview}`);
  }

  // Test 5: Get D&C sections
  console.log('\n5️⃣ DOCTRINE & COVENANTS SECTIONS');
  console.log('-'.repeat(60));

  const dcSections = await prisma.verse.groupBy({
    by: ['chapter'],
    where: {
      editionId: 'coc-dc-2017'
    },
    _count: {
      id: true
    },
    orderBy: {
      chapter: 'asc'
    }
  });

  console.log(`Total D&C sections: ${dcSections.length}`);
  console.log(`Section range: ${dcSections[0]?.chapter} - ${dcSections[dcSections.length - 1]?.chapter}`);
  console.log(`Sample sections with verse counts:`);

  for (let i = 0; i < Math.min(10, dcSections.length); i++) {
    const section = dcSections[i];
    console.log(`  Section ${section.chapter}: ${section._count.id} verses`);
  }

  // Test 6: Test cross-edition verse lookup
  console.log('\n6️⃣ CROSS-EDITION VERSE LOOKUP');
  console.log('-'.repeat(60));

  const cocVerse = await prisma.verse.findFirst({
    where: {
      editionId: 'coc-bom-1908',
      book: 'I Nephi',
      chapter: 1,
      verse: 1
    },
    include: {
      edition: {
        select: {
          name: true,
          versificationSystem: true
        }
      }
    }
  });

  if (cocVerse) {
    console.log(`CoC Edition (${cocVerse.edition.versificationSystem}):`);
    console.log(`  ${cocVerse.book} ${cocVerse.chapter}:${cocVerse.verse}`);
    console.log(`  "${cocVerse.text.substring(0, 100)}..."`);
  }

  // Test 7: Get edition details
  console.log('\n7️⃣ EDITION DETAILS');
  console.log('-'.repeat(60));

  const editions = await prisma.edition.findMany({
    include: {
      work: {
        select: {
          name: true
        }
      },
      _count: {
        select: {
          verses: true
        }
      }
    },
    orderBy: {
      verses: {
        _count: 'desc'
      }
    }
  });

  for (const edition of editions) {
    console.log(`\n${edition.name} (${edition.year})`);
    console.log(`  Work: ${edition.work.name}`);
    console.log(`  Publisher: ${edition.publisher}`);
    console.log(`  Versification: ${edition.versificationSystem}`);
    console.log(`  Verses: ${edition._count.verses.toLocaleString()}`);
    console.log(`  Primary: ${edition.isPrimary ? 'Yes' : 'No'}`);
  }

  // Test 8: Performance test - large query
  console.log('\n8️⃣ PERFORMANCE TEST - Query large book (Alma)');
  console.log('-'.repeat(60));

  const startTime = Date.now();
  const almaVerses = await prisma.verse.count({
    where: {
      editionId: 'coc-bom-1908',
      book: 'Alma'
    }
  });
  const endTime = Date.now();

  console.log(`Counted ${almaVerses.toLocaleString()} verses in ${endTime - startTime}ms`);

  console.log('\n' + '='.repeat(60));
  console.log('✅ All tests completed successfully!');
  console.log('='.repeat(60) + '\n');
}

main()
  .catch((e) => {
    console.error('❌ Error running tests:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
