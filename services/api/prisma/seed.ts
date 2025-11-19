/**
 * Database Seed Script
 * Populates the database with initial data for development
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

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
    await prisma.refreshToken.deleteMany();
    await prisma.userPreferences.deleteMany();
    await prisma.user.deleteMany();
    await prisma.verse.deleteMany();
    console.log('✅ Cleaned existing data\n');
  }

  // ============================================================================
  // Seed Scripture Verses
  // ============================================================================
  console.log('📖 Seeding scripture verses...');

  // Sample verses from 1 Nephi chapter 3
  const verses = [
    {
      id: '1-nephi-3-1',
      book: '1-nephi',
      chapter: 3,
      verse: 1,
      text: 'And it came to pass that I, Nephi, returned from speaking with the Lord, to the tent of my father.',
      language: 'en',
    },
    {
      id: '1-nephi-3-2',
      book: '1-nephi',
      chapter: 3,
      verse: 2,
      text: 'And it came to pass that he spake unto me, saying: Behold I have dreamed a dream, in the which the Lord hath commanded me that thou and thy brethren shall return to Jerusalem.',
      language: 'en',
    },
    {
      id: '1-nephi-3-3',
      book: '1-nephi',
      chapter: 3,
      verse: 3,
      text: 'For behold, Laban hath the record of the Jews and also a genealogy of my forefathers, and they are engraven upon plates of brass.',
      language: 'en',
    },
    {
      id: '1-nephi-3-4',
      book: '1-nephi',
      chapter: 3,
      verse: 4,
      text: 'Wherefore, the Lord hath commanded me that thou and thy brothers should go unto the house of Laban, and seek the records, and bring them down hither into the wilderness.',
      language: 'en',
    },
    {
      id: '1-nephi-3-5',
      book: '1-nephi',
      chapter: 3,
      verse: 5,
      text: 'And now, behold thy brothers murmur, saying it is a hard thing which I have required of them; but behold I have not required it of them, but it is a commandment of the Lord.',
      language: 'en',
    },
    {
      id: '1-nephi-3-6',
      book: '1-nephi',
      chapter: 3,
      verse: 6,
      text: 'Therefore go, my son, and thou shalt be favored of the Lord, because thou hast not murmured.',
      language: 'en',
    },
    {
      id: '1-nephi-3-7',
      book: '1-nephi',
      chapter: 3,
      verse: 7,
      text: 'And it came to pass that I, Nephi, said unto my father: I will go and do the things which the Lord hath commanded, for I know that the Lord giveth no commandments unto the children of men, save he shall prepare a way for them that they may accomplish the thing which he commandeth them.',
      language: 'en',
    },
    // Alma 32:28 (faith as a seed - for semantic search testing)
    {
      id: 'alma-32-28',
      book: 'alma',
      chapter: 32,
      verse: 28,
      text: 'Now, we will compare the word unto a seed. Now, if ye give place, that a seed may be planted in your heart, behold, if it be a true seed, or a good seed, if ye do not cast it out by your unbelief, that ye will resist the Spirit of the Lord, behold, it will begin to swell within your breasts; and when you feel these swelling motions, ye will begin to say within yourselves—It must needs be that this is a good seed, or that the word is good, for it beginneth to enlarge my soul; yea, it beginneth to enlighten my understanding, yea, it beginneth to be delicious to me.',
      language: 'en',
    },
    // Moroni 10:4-5 (prayer about the Book of Mormon)
    {
      id: 'moroni-10-4',
      book: 'moroni',
      chapter: 10,
      verse: 4,
      text: 'And when ye shall receive these things, I would exhort you that ye would ask God, the Eternal Father, in the name of Christ, if these things are not true; and if ye shall ask with a sincere heart, with real intent, having faith in Christ, he will manifest the truth of it unto you, by the power of the Holy Ghost.',
      language: 'en',
    },
    {
      id: 'moroni-10-5',
      book: 'moroni',
      chapter: 10,
      verse: 5,
      text: 'And by the power of the Holy Ghost ye may know the truth of all things.',
      language: 'en',
    },
  ];

  for (const verse of verses) {
    await prisma.verse.create({ data: verse });
  }

  console.log(`✅ Seeded ${verses.length} scripture verses\n`);

  // ============================================================================
  // Seed Test Users
  // ============================================================================
  console.log('👤 Seeding test users...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.create({
    data: {
      email: 'nephi@example.com',
      password: hashedPassword,
      displayName: 'Nephi',
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
      email: 'alma@example.com',
      password: hashedPassword,
      displayName: 'Alma',
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
  console.log('   - nephi@example.com (password: password123)');
  console.log('   - alma@example.com (password: password123)\n');

  // ============================================================================
  // Seed User Study Data
  // ============================================================================
  console.log('✨ Seeding user study data...');

  // Highlights
  await prisma.highlight.create({
    data: {
      userId: user1.id,
      verseId: '1-nephi-3-7',
      color: 'yellow',
    },
  });

  await prisma.highlight.create({
    data: {
      userId: user1.id,
      verseId: 'alma-32-28',
      color: 'blue',
    },
  });

  // Notes
  await prisma.note.create({
    data: {
      userId: user1.id,
      verseId: '1-nephi-3-7',
      content: 'This is my life motto. The Lord always provides a way when we are obedient.',
      tags: ['obedience', 'faith', 'personal-favorite'],
    },
  });

  await prisma.note.create({
    data: {
      userId: user2.id,
      verseId: 'alma-32-28',
      content: 'Beautiful metaphor about faith growing like a seed. Experiment upon the word.',
      tags: ['faith', 'metaphor'],
    },
  });

  // Reading Progress
  await prisma.readingProgress.create({
    data: {
      userId: user1.id,
      book: '1-nephi',
      chapter: 3,
      verse: 7,
      percentage: 23.3,
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
      verseId: '1-nephi-3-7',
      easeFactor: 2.5,
      interval: 3,
      repetition: 2,
      nextReview: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
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
      fromVerseId: '1-nephi-3-7',
      toVerseId: 'alma-32-28',
      type: 'ai_suggested',
      confidence: 0.85,
    },
  });

  await prisma.crossReference.create({
    data: {
      fromVerseId: 'alma-32-28',
      toVerseId: 'moroni-10-4',
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
      name: 'Book of Mormon Study Group',
      description: 'A community for studying the Book of Mormon together',
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
      verseId: '1-nephi-3-7',
      title: 'What does "I will go and do" mean to you?',
      content: 'Let\'s discuss how this verse applies to our modern lives.',
      authorId: user1.id,
    },
  });

  await prisma.comment.create({
    data: {
      discussionId: discussion.id,
      authorId: user2.id,
      content: 'I think it means we should trust in the Lord even when things seem difficult.',
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

  await prisma.notification.create({
    data: {
      userId: user1.id,
      type: 'daily_reminder',
      title: 'Time to study!',
      body: 'Don\'t forget to read today. Keep your streak alive!',
      isRead: true,
    },
  });

  console.log('✅ Seeded notifications\n');

  // ============================================================================
  // Summary
  // ============================================================================
  console.log('🎉 Database seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - ${verses.length} scripture verses`);
  console.log('   - 2 test users');
  console.log('   - 2 highlights');
  console.log('   - 2 notes');
  console.log('   - 1 reading progress record');
  console.log('   - 1 study streak');
  console.log('   - 1 memory card');
  console.log('   - 2 cross references');
  console.log('   - 1 group with 2 members');
  console.log('   - 1 discussion with 1 comment');
  console.log('   - 2 notifications\n');
  console.log('🔑 Test credentials:');
  console.log('   Email: nephi@example.com');
  console.log('   Password: password123\n');
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
