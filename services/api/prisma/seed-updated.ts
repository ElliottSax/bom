/**
 * Database Seed Script - Community of Christ Edition
 * Populates the database with CoC scripture editions and sample data
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Community of Christ database seed...\n');

  // Clean existing data (development only!)
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Cleaning existing data...');
    await prisma.sessionEvent.deleteMany();
    await prisma.searchQuery.deleteMany();
    await prisma.aIInteraction.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.discussion.deleteMany();
    await prisma.groupMember.deleteMany();
    await prisma.group.deleteMany();
    await prisma.memoryCard.deleteMany();
    await prisma.studyStreak.deleteMany();
    await prisma.readingProgress.deleteMany();
    await prisma.crossReference.deleteMany();
    await prisma.note.deleteMany();
    await prisma.highlight.deleteMany();
    await prisma.verseMapping.deleteMany();
    await prisma.verse.deleteMany();
    await prisma.edition.deleteMany();
    await prisma.scriptureWork.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.userPreferences.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Cleaned existing data\n');
  }

  // ============================================================================
  // Seed Scripture Works
  // ============================================================================
  console.log('📚 Seeding scripture works...');

  const works = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'seeds/scripture-works.json'), 'utf8')
  );

  for (const work of works) {
    await prisma.scriptureWork.create({ data: work });
  }

  console.log(`✅ Seeded ${works.length} scripture works\n`);

  // ============================================================================
  // Seed Editions
  // ============================================================================
  console.log('📖 Seeding scripture editions...');

  const editions = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'seeds/coc-editions.json'), 'utf8')
  );

  for (const edition of editions) {
    await prisma.edition.create({ data: edition });
  }

  console.log(`✅ Seeded ${editions.length} scripture editions\n`);

  // ============================================================================
  // Seed Scripture Verses (CoC Book of Mormon)
  // ============================================================================
  console.log('📖 Seeding Community of Christ Book of Mormon verses...');

  const cocVerses = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'seeds/coc-bom-sample-verses.json'), 'utf8')
  );

  for (const verse of cocVerses) {
    await prisma.verse.create({ data: verse });
  }

  console.log(`✅ Seeded ${cocVerses.length} CoC Book of Mormon verses\n`);

  // ============================================================================
  // Seed LDS Book of Mormon verses (for cross-reference testing)
  // ============================================================================
  console.log('📖 Seeding sample LDS Book of Mormon verses...');

  const ldsVerses = [
    {
      id: 'lds-bom-2013:1-nephi-3-7',
      editionId: 'lds-bom-2013',
      book: '1 Nephi',
      chapter: 3,
      verse: 7,
      text: 'And it came to pass that I, Nephi, said unto my father: I will go and do the things which the Lord hath commanded, for I know that the Lord giveth no commandments unto the children of men, save he shall prepare a way for them that they may accomplish the thing which he commandeth them.',
      verseType: 'standard',
    },
    {
      id: 'lds-bom-2013:3-nephi-11-7',
      editionId: 'lds-bom-2013',
      book: '3 Nephi',
      chapter: 11,
      verse: 7,
      text: 'Behold my Beloved Son, in whom I am well pleased, in whom I have glorified my name—hear ye him.',
      verseType: 'standard',
    },
  ];

  for (const verse of ldsVerses) {
    await prisma.verse.create({ data: verse });
  }

  console.log(`✅ Seeded ${ldsVerses.length} LDS Book of Mormon verses\n`);

  // ============================================================================
  // Seed Verse Mappings (CoC ↔ LDS)
  // ============================================================================
  console.log('🔗 Seeding verse mappings (CoC ↔ LDS)...');

  const verseMappings = [
    {
      fromVerseId: 'coc-bom-1908:1-nephi-1-1',
      toVerseId: 'lds-bom-2013:1-nephi-3-7',
      mappingType: 'exact',
      confidence: 1.0,
      verified: true,
      notes: '1 Nephi 3:7 is the same in both editions - chapters align',
    },
    {
      fromVerseId: 'coc-bom-1908:iii-nephi-5-8',
      toVerseId: 'lds-bom-2013:3-nephi-11-7',
      mappingType: 'exact',
      confidence: 1.0,
      verified: true,
      notes: 'CoC III Nephi 5:8 corresponds to LDS 3 Nephi 11:7 - different chapter divisions',
    },
  ];

  for (const mapping of verseMappings) {
    await prisma.verseMapping.create({ data: mapping });
  }

  console.log(`✅ Seeded ${verseMappings.length} verse mappings\n`);

  // ============================================================================
  // Seed Test Users
  // ============================================================================
  console.log('👤 Seeding test users...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.create({
    data: {
      email: 'nephi@cofchrist.org',
      password: hashedPassword,
      displayName: 'Nephi (CoC Member)',
      preferences: {
        create: {
          language: 'en',
          fontSize: 'medium',
          theme: 'light',
          notificationsEnabled: true,
          semanticSearchEnabled: true,
          chatbotEnabled: true,
          autoSuggestionsEnabled: true,
        },
      },
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'alma@cofchrist.org',
      password: hashedPassword,
      displayName: 'Alma (CoC Member)',
      preferences: {
        create: {
          language: 'en',
          fontSize: 'large',
          theme: 'dark',
          notificationsEnabled: true,
          dailyReminderTime: '07:00',
          semanticSearchEnabled: true,
          chatbotEnabled: true,
          autoSuggestionsEnabled: false,
        },
      },
    },
  });

  console.log('✅ Seeded 2 test users');
  console.log('   - nephi@cofchrist.org (password: password123)');
  console.log('   - alma@cofchrist.org (password: password123)\n');

  // ============================================================================
  // Seed User Study Data
  // ============================================================================
  console.log('✨ Seeding user study data...');

  // Highlights (using CoC verses)
  await prisma.highlight.create({
    data: {
      userId: user1.id,
      verseId: 'coc-bom-1908:1-nephi-1-1',
      color: 'yellow',
    },
  });

  await prisma.highlight.create({
    data: {
      userId: user1.id,
      verseId: 'coc-bom-1908:moroni-10-4',
      color: 'blue',
    },
  });

  // Notes
  await prisma.note.create({
    data: {
      userId: user1.id,
      verseId: 'coc-bom-1908:1-nephi-1-1',
      content: 'This is my life motto. The Lord always provides a way when we are obedient.',
      tags: ['obedience', 'faith', 'personal-favorite'],
    },
  });

  await prisma.note.create({
    data: {
      userId: user2.id,
      verseId: 'coc-bom-1908:moroni-10-4',
      content: 'The invitation to ask God with sincere heart. Beautiful promise!',
      tags: ['prayer', 'testimony'],
    },
  });

  // Reading Progress (using CoC book names)
  await prisma.readingProgress.create({
    data: {
      userId: user1.id,
      book: 'I Nephi',
      chapter: 1,
      verse: 3,
      percentage: 5.0,
    },
  });

  // Study Streak
  await prisma.studyStreak.create({
    data: {
      userId: user1.id,
      currentStreak: 7,
      longestStreak: 30,
      lastStudyDate: new Date(),
    },
  });

  // Memory Cards
  await prisma.memoryCard.create({
    data: {
      userId: user1.id,
      verseId: 'coc-bom-1908:moroni-10-4',
      easeFactor: 2.5,
      interval: 3,
      repetition: 2,
      nextReview: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      lastReviewed: new Date(),
      totalReviews: 5,
      correctReviews: 4,
    },
  });

  console.log('✅ Seeded user study data (highlights, notes, progress, streaks)\n');

  // ============================================================================
  // Seed Cross References
  // ============================================================================
  console.log('🔗 Seeding cross references...');

  await prisma.crossReference.create({
    data: {
      fromVerseId: 'coc-bom-1908:1-nephi-1-1',
      toVerseId: 'coc-bom-1908:moroni-10-4',
      type: 'official',
      confidence: 1.0,
    },
  });

  console.log('✅ Seeded cross references\n');

  // ============================================================================
  // Seed Group Study Features
  // ============================================================================
  console.log('👥 Seeding group study features...');

  const group = await prisma.group.create({
    data: {
      name: 'Community of Christ Book of Mormon Study',
      description: 'Studying the Book of Mormon together using the CoC edition',
      isPrivate: false,
    },
  });

  await prisma.groupMember.create({
    data: {
      groupId: group.id,
      userId: user1.id,
      role: 'admin',
    },
  });

  await prisma.groupMember.create({
    data: {
      groupId: group.id,
      userId: user2.id,
      role: 'member',
    },
  });

  const discussion = await prisma.discussion.create({
    data: {
      groupId: group.id,
      verseId: 'coc-bom-1908:moroni-10-4',
      title: 'How do we ask with "real intent"?',
      content: 'Let\'s discuss what Moroni means by asking with real intent and sincere heart.',
      authorId: user1.id,
    },
  });

  await prisma.comment.create({
    data: {
      discussionId: discussion.id,
      authorId: user2.id,
      content: 'I think it means we must be prepared to accept the answer, whatever it may be.',
    },
  });

  console.log('✅ Seeded group study data\n');

  // ============================================================================
  // Seed Notifications
  // ============================================================================
  console.log('🔔 Seeding notifications...');

  await prisma.notification.create({
    data: {
      userId: user1.id,
      type: 'streak_milestone',
      title: '7-Day Streak! 🔥',
      body: 'Congratulations! You\'ve studied for 7 days in a row.',
      isRead: false,
    },
  });

  console.log('✅ Seeded notifications\n');

  // ============================================================================
  // Summary
  // ============================================================================
  console.log('🎉 Database seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - ${works.length} scripture works (BoM, D&C, Bible)`);
  console.log(`   - ${editions.length} editions (CoC & LDS)`);
  console.log(`   - ${cocVerses.length} CoC Book of Mormon verses`);
  console.log(`   - ${ldsVerses.length} LDS Book of Mormon verses`);
  console.log(`   - ${verseMappings.length} verse mappings (CoC ↔ LDS)`);
  console.log('   - 2 test users (Community of Christ members)');
  console.log('   - 2 highlights');
  console.log('   - 2 notes');
  console.log('   - 1 reading progress record');
  console.log('   - 1 study streak');
  console.log('   - 1 memory card');
  console.log('   - 1 cross reference');
  console.log('   - 1 group with 2 members');
  console.log('   - 1 discussion with 1 comment');
  console.log('   - 1 notification\n');
  console.log('🔑 Test credentials:');
  console.log('   Email: nephi@cofchrist.org');
  console.log('   Password: password123\n');
  console.log('📖 Editions seeded:');
  console.log('   - CoC Book of Mormon (1908) - Original chapters');
  console.log('   - LDS Book of Mormon (2013) - Pratt versification');
  console.log('   - CoC D&C (2017) - 167 sections');
  console.log('   - LDS D&C (2013) - 138 sections');
  console.log('   - Inspired Version Bible (1867)');
  console.log('   - NRSV (1989)\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
