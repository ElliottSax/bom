// Community of Christ Scripture Library

import { type VolumeId, type Book, type Volume } from './types';

// Re-export types for convenience
export type { VolumeId, Book, Volume } from './types';

export const VOLUMES: Volume[] = [
  {
    id: 'bom',
    name: 'Book of Mormon',
    shortName: 'BoM',
    description: '1908 Authorized Edition',
    color: '#004D71', // brand dark navy (flagship volume)
  },
  {
    id: 'ot',
    name: 'Old Testament',
    shortName: 'OT',
    description: 'Inspired Version',
    color: '#1B6E76', // deep teal, bridging navy -> green
  },
  {
    id: 'nt',
    name: 'New Testament',
    shortName: 'NT',
    description: 'Inspired Version',
    color: '#2F7A4F', // muted forest green, bridging teal -> gold
  },
  {
    id: 'dc',
    name: 'Doctrine & Covenants',
    shortName: 'D&C',
    description: 'Community of Christ Edition',
    color: '#9C7A3C', // antique gold, echoing the brand gold accent
  },
];

// Book of Mormon - 1908 RLDS Edition (109 chapters total)
export const BOOK_OF_MORMON: Book[] = [
  { id: '1-nephi', name: '1 Nephi', shortName: '1 Ne.', chapters: 7, volumeId: 'bom' },
  { id: '2-nephi', name: '2 Nephi', shortName: '2 Ne.', chapters: 15, volumeId: 'bom' },
  { id: 'jacob', name: 'Jacob', shortName: 'Jacob', chapters: 5, volumeId: 'bom' },
  { id: 'enos', name: 'Enos', shortName: 'Enos', chapters: 1, volumeId: 'bom' },
  { id: 'jarom', name: 'Jarom', shortName: 'Jarom', chapters: 1, volumeId: 'bom' },
  { id: 'omni', name: 'Omni', shortName: 'Omni', chapters: 1, volumeId: 'bom' },
  {
    id: 'words-of-mormon',
    name: 'Words of Mormon',
    shortName: 'W of M',
    chapters: 1,
    volumeId: 'bom',
  },
  { id: 'mosiah', name: 'Mosiah', shortName: 'Mosiah', chapters: 13, volumeId: 'bom' },
  { id: 'alma', name: 'Alma', shortName: 'Alma', chapters: 30, volumeId: 'bom' },
  { id: 'helaman', name: 'Helaman', shortName: 'Hel.', chapters: 5, volumeId: 'bom' },
  { id: '3-nephi', name: '3 Nephi', shortName: '3 Ne.', chapters: 14, volumeId: 'bom' },
  { id: '4-nephi', name: '4 Nephi', shortName: '4 Ne.', chapters: 1, volumeId: 'bom' },
  { id: 'mormon', name: 'Mormon', shortName: 'Morm.', chapters: 4, volumeId: 'bom' },
  { id: 'ether', name: 'Ether', shortName: 'Ether', chapters: 6, volumeId: 'bom' },
  { id: 'moroni', name: 'Moroni', shortName: 'Moro.', chapters: 10, volumeId: 'bom' },
];

// Old Testament - Inspired Version (39 books)
export const OLD_TESTAMENT: Book[] = [
  { id: 'genesis', name: 'Genesis', shortName: 'Gen.', chapters: 50, volumeId: 'ot' },
  { id: 'exodus', name: 'Exodus', shortName: 'Ex.', chapters: 40, volumeId: 'ot' },
  { id: 'leviticus', name: 'Leviticus', shortName: 'Lev.', chapters: 27, volumeId: 'ot' },
  { id: 'numbers', name: 'Numbers', shortName: 'Num.', chapters: 36, volumeId: 'ot' },
  { id: 'deuteronomy', name: 'Deuteronomy', shortName: 'Deut.', chapters: 34, volumeId: 'ot' },
  { id: 'joshua', name: 'Joshua', shortName: 'Josh.', chapters: 24, volumeId: 'ot' },
  { id: 'judges', name: 'Judges', shortName: 'Judg.', chapters: 21, volumeId: 'ot' },
  { id: 'ruth', name: 'Ruth', shortName: 'Ruth', chapters: 4, volumeId: 'ot' },
  { id: '1-samuel', name: '1 Samuel', shortName: '1 Sam.', chapters: 31, volumeId: 'ot' },
  { id: '2-samuel', name: '2 Samuel', shortName: '2 Sam.', chapters: 24, volumeId: 'ot' },
  { id: '1-kings', name: '1 Kings', shortName: '1 Kgs.', chapters: 22, volumeId: 'ot' },
  { id: '2-kings', name: '2 Kings', shortName: '2 Kgs.', chapters: 25, volumeId: 'ot' },
  { id: '1-chronicles', name: '1 Chronicles', shortName: '1 Chr.', chapters: 29, volumeId: 'ot' },
  { id: '2-chronicles', name: '2 Chronicles', shortName: '2 Chr.', chapters: 36, volumeId: 'ot' },
  { id: 'ezra', name: 'Ezra', shortName: 'Ezra', chapters: 10, volumeId: 'ot' },
  { id: 'nehemiah', name: 'Nehemiah', shortName: 'Neh.', chapters: 13, volumeId: 'ot' },
  { id: 'esther', name: 'Esther', shortName: 'Esth.', chapters: 10, volumeId: 'ot' },
  { id: 'job', name: 'Job', shortName: 'Job', chapters: 42, volumeId: 'ot' },
  { id: 'psalms', name: 'Psalms', shortName: 'Ps.', chapters: 150, volumeId: 'ot' },
  { id: 'proverbs', name: 'Proverbs', shortName: 'Prov.', chapters: 31, volumeId: 'ot' },
  { id: 'ecclesiastes', name: 'Ecclesiastes', shortName: 'Eccl.', chapters: 12, volumeId: 'ot' },
  {
    id: 'song-of-solomon',
    name: 'Song of Solomon',
    shortName: 'Song',
    chapters: 8,
    volumeId: 'ot',
  },
  { id: 'isaiah', name: 'Isaiah', shortName: 'Isa.', chapters: 66, volumeId: 'ot' },
  { id: 'jeremiah', name: 'Jeremiah', shortName: 'Jer.', chapters: 52, volumeId: 'ot' },
  { id: 'lamentations', name: 'Lamentations', shortName: 'Lam.', chapters: 5, volumeId: 'ot' },
  { id: 'ezekiel', name: 'Ezekiel', shortName: 'Ezek.', chapters: 48, volumeId: 'ot' },
  { id: 'daniel', name: 'Daniel', shortName: 'Dan.', chapters: 12, volumeId: 'ot' },
  { id: 'hosea', name: 'Hosea', shortName: 'Hos.', chapters: 14, volumeId: 'ot' },
  { id: 'joel', name: 'Joel', shortName: 'Joel', chapters: 3, volumeId: 'ot' },
  { id: 'amos', name: 'Amos', shortName: 'Amos', chapters: 9, volumeId: 'ot' },
  { id: 'obadiah', name: 'Obadiah', shortName: 'Obad.', chapters: 1, volumeId: 'ot' },
  { id: 'jonah', name: 'Jonah', shortName: 'Jonah', chapters: 4, volumeId: 'ot' },
  { id: 'micah', name: 'Micah', shortName: 'Mic.', chapters: 7, volumeId: 'ot' },
  { id: 'nahum', name: 'Nahum', shortName: 'Nah.', chapters: 3, volumeId: 'ot' },
  { id: 'habakkuk', name: 'Habakkuk', shortName: 'Hab.', chapters: 3, volumeId: 'ot' },
  { id: 'zephaniah', name: 'Zephaniah', shortName: 'Zeph.', chapters: 3, volumeId: 'ot' },
  { id: 'haggai', name: 'Haggai', shortName: 'Hag.', chapters: 2, volumeId: 'ot' },
  { id: 'zechariah', name: 'Zechariah', shortName: 'Zech.', chapters: 14, volumeId: 'ot' },
  { id: 'malachi', name: 'Malachi', shortName: 'Mal.', chapters: 4, volumeId: 'ot' },
];

// New Testament - Inspired Version (27 books)
export const NEW_TESTAMENT: Book[] = [
  { id: 'matthew', name: 'Matthew', shortName: 'Matt.', chapters: 28, volumeId: 'nt' },
  { id: 'mark', name: 'Mark', shortName: 'Mark', chapters: 16, volumeId: 'nt' },
  { id: 'luke', name: 'Luke', shortName: 'Luke', chapters: 24, volumeId: 'nt' },
  { id: 'john', name: 'John', shortName: 'John', chapters: 21, volumeId: 'nt' },
  { id: 'acts', name: 'Acts', shortName: 'Acts', chapters: 28, volumeId: 'nt' },
  { id: 'romans', name: 'Romans', shortName: 'Rom.', chapters: 16, volumeId: 'nt' },
  { id: '1-corinthians', name: '1 Corinthians', shortName: '1 Cor.', chapters: 16, volumeId: 'nt' },
  { id: '2-corinthians', name: '2 Corinthians', shortName: '2 Cor.', chapters: 13, volumeId: 'nt' },
  { id: 'galatians', name: 'Galatians', shortName: 'Gal.', chapters: 6, volumeId: 'nt' },
  { id: 'ephesians', name: 'Ephesians', shortName: 'Eph.', chapters: 6, volumeId: 'nt' },
  { id: 'philippians', name: 'Philippians', shortName: 'Philip.', chapters: 4, volumeId: 'nt' },
  { id: 'colossians', name: 'Colossians', shortName: 'Col.', chapters: 4, volumeId: 'nt' },
  {
    id: '1-thessalonians',
    name: '1 Thessalonians',
    shortName: '1 Thes.',
    chapters: 5,
    volumeId: 'nt',
  },
  {
    id: '2-thessalonians',
    name: '2 Thessalonians',
    shortName: '2 Thes.',
    chapters: 3,
    volumeId: 'nt',
  },
  { id: '1-timothy', name: '1 Timothy', shortName: '1 Tim.', chapters: 6, volumeId: 'nt' },
  { id: '2-timothy', name: '2 Timothy', shortName: '2 Tim.', chapters: 4, volumeId: 'nt' },
  { id: 'titus', name: 'Titus', shortName: 'Titus', chapters: 3, volumeId: 'nt' },
  { id: 'philemon', name: 'Philemon', shortName: 'Philem.', chapters: 1, volumeId: 'nt' },
  { id: 'hebrews', name: 'Hebrews', shortName: 'Heb.', chapters: 13, volumeId: 'nt' },
  { id: 'james', name: 'James', shortName: 'James', chapters: 5, volumeId: 'nt' },
  { id: '1-peter', name: '1 Peter', shortName: '1 Pet.', chapters: 5, volumeId: 'nt' },
  { id: '2-peter', name: '2 Peter', shortName: '2 Pet.', chapters: 3, volumeId: 'nt' },
  { id: '1-john', name: '1 John', shortName: '1 Jn.', chapters: 5, volumeId: 'nt' },
  { id: '2-john', name: '2 John', shortName: '2 Jn.', chapters: 1, volumeId: 'nt' },
  { id: '3-john', name: '3 John', shortName: '3 Jn.', chapters: 1, volumeId: 'nt' },
  { id: 'jude', name: 'Jude', shortName: 'Jude', chapters: 1, volumeId: 'nt' },
  { id: 'revelation', name: 'Revelation', shortName: 'Rev.', chapters: 22, volumeId: 'nt' },
];

// Doctrine & Covenants - Community of Christ Edition (167 sections)
// Sections 1-144: fetched from centerplace.org
// Sections 145-167: embedded data (modern revelations)
export const DOCTRINE_AND_COVENANTS: Book[] = Array.from({ length: 167 }, (_, i) => ({
  id: `section-${i + 1}`,
  name: `Section ${i + 1}`,
  shortName: `D&C ${i + 1}`,
  chapters: 1, // Each section is treated as one "chapter"
  volumeId: 'dc' as VolumeId,
}));

// Helper to get all books for a volume
export function getBooksForVolume(volumeId: VolumeId): Book[] {
  switch (volumeId) {
    case 'bom':
      return BOOK_OF_MORMON;
    case 'ot':
      return OLD_TESTAMENT;
    case 'nt':
      return NEW_TESTAMENT;
    case 'dc':
      return DOCTRINE_AND_COVENANTS;
    default:
      return [];
  }
}

// Get total chapters for a volume
export function getTotalChapters(volumeId: VolumeId): number {
  return getBooksForVolume(volumeId).reduce((sum, book) => sum + book.chapters, 0);
}

// All scriptures combined
export const ALL_BOOKS: Book[] = [
  ...BOOK_OF_MORMON,
  ...OLD_TESTAMENT,
  ...NEW_TESTAMENT,
  ...DOCTRINE_AND_COVENANTS,
];

// Community of Christ Resources
export const COC_RESOURCES = [
  {
    category: 'Official Curriculum',
    items: [
      {
        name: 'Community of Christ Lessons',
        url: 'https://www.heraldhouse.org/collections/cofc-lessons',
        description: 'Weekly lessons following the Revised Common Lectionary',
      },
      {
        name: 'Herald House Scripture Resources',
        url: 'https://www.heraldhouse.org/collections/scripture',
        description: 'Official scripture study materials',
      },
    ],
  },
  {
    category: 'Scripture Study',
    items: [
      {
        name: 'Book of Mormon Resources',
        url: 'https://www.heraldhouse.org/collections/scripture-study-book-of-mormon',
        description: 'Commentaries and study guides',
      },
      {
        name: 'Inspired Version Online',
        url: 'https://www.centerplace.org/hs/iv/default.htm',
        description: 'Read the Inspired Version online',
      },
      {
        name: 'D&C Commentary',
        url: 'https://www.heraldhouse.org/collections/scripture',
        description: 'Doctrine & Covenants resources',
      },
    ],
  },
  {
    category: 'Enduring Principles',
    items: [
      { name: 'Grace and Generosity', description: "God's grace is generous and unconditional" },
      { name: 'Sacredness of Creation', description: 'All creation has value and purpose' },
      { name: 'Continuing Revelation', description: 'God continues to reveal divine will' },
      { name: 'Worth of All Persons', description: 'Every person has inestimable worth' },
      { name: 'All Are Called', description: "All are called to share Christ's mission" },
      { name: 'Responsible Choices', description: 'We are free to choose our response to God' },
      { name: 'Pursuit of Peace (Shalom)', description: 'God calls us to seek peace and justice' },
      { name: 'Unity in Diversity', description: 'Community of Christ embraces diversity' },
      { name: 'Blessings of Community', description: 'Life is meant to be lived in community' },
    ],
  },
];

// Flat, in-order (book, chapter) list for a volume, used to split a study
// plan's total chapters evenly across its days. "bible-365" spans both
// testaments, since it's described as a combined Inspired Version read-through.
function getFlatChaptersForPlan(volumeId: VolumeId): { book: Book; chapter: number }[] {
  const books =
    volumeId === 'ot' ? [...OLD_TESTAMENT, ...NEW_TESTAMENT] : getBooksForVolume(volumeId);
  const flat: { book: Book; chapter: number }[] = [];
  for (const book of books) {
    for (let chapter = 1; chapter <= book.chapters; chapter++) {
      flat.push({ book, chapter });
    }
  }
  return flat;
}

export interface ReadingAssignment {
  entries: { book: Book; chapter: number }[];
  label: string;
}

// What to actually read on a given day of a plan -- evenly divides the
// volume's chapters across the plan's day count so every plan has a real,
// bounded daily assignment instead of just an abstract day counter.
export function getReadingPlanDay(planId: string, day: number): ReadingAssignment | null {
  const plan = STUDY_PLANS.find((p) => p.id === planId);
  if (!plan) return null;

  const flat = getFlatChaptersForPlan(plan.volumeId);
  const total = flat.length;
  const clampedDay = Math.min(Math.max(day, 1), plan.days);
  const startIdx = Math.floor(((clampedDay - 1) * total) / plan.days);
  const endIdx = Math.max(startIdx + 1, Math.floor((clampedDay * total) / plan.days));
  const entries = flat.slice(startIdx, endIdx);

  if (entries.length === 0) return { entries: [], label: 'No reading assigned' };

  const first = entries[0];
  const last = entries[entries.length - 1];
  const label =
    first.book.id === last.book.id
      ? first.chapter === last.chapter
        ? `${first.book.name} ${first.chapter}`
        : `${first.book.name} ${first.chapter}-${last.chapter}`
      : `${first.book.name} ${first.chapter} - ${last.book.name} ${last.chapter}`;

  return { entries, label };
}

// Study Plans - adjusted for different volumes
export const STUDY_PLANS = [
  {
    id: 'bom-30',
    name: 'Book of Mormon in 30 Days',
    description: 'Intensive reading of the Book of Mormon',
    volumeId: 'bom' as VolumeId,
    days: 30,
  },
  {
    id: 'bom-90',
    name: 'Book of Mormon in 90 Days',
    description: 'Balanced 3-month Book of Mormon study',
    volumeId: 'bom' as VolumeId,
    days: 90,
  },
  {
    id: 'nt-30',
    name: 'New Testament in 30 Days',
    description: 'Read through the Gospels and Epistles',
    volumeId: 'nt' as VolumeId,
    days: 30,
  },
  {
    id: 'nt-90',
    name: 'New Testament in 90 Days',
    description: 'Deep study of the New Testament',
    volumeId: 'nt' as VolumeId,
    days: 90,
  },
  {
    id: 'dc-60',
    name: 'D&C in 60 Days',
    description: 'Study the Doctrine & Covenants',
    volumeId: 'dc' as VolumeId,
    days: 60,
  },
  {
    id: 'bible-365',
    name: 'Inspired Version in 1 Year',
    description: 'Read the entire Inspired Version Bible',
    volumeId: 'ot' as VolumeId, // Combined OT+NT
    days: 365,
  },
];
