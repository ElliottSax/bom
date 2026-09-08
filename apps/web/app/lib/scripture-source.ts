// Shared centerplace.org fetch/parse logic for the scripture APIs
// (verses, search, pdf). Used to live as three near-identical, silently
// drifting copies -- search's own book lists were missing most of the OT/NT
// and 158 of 167 D&C sections, which is why searches for anything outside a
// handful of books used to come back empty. Single source of truth now.
import { getModernSection, isModernSection } from './dc-modern-sections';
import { logger } from '../utils/logger';

const log = logger.scope('ScriptureSource');

export type VolumeId = 'bom' | 'ot' | 'nt' | 'dc';

export interface BookInfo {
  id: string;
  name: string;
  slug: string;
  chapters: number;
}

export interface Verse {
  num: number;
  text: string;
  reference: string;
}

export interface ChapterData {
  chapter: number;
  verses: Verse[];
}

export interface BookData {
  chapters: ChapterData[];
}

const CENTERPLACE_URLS: Record<VolumeId, string> = {
  bom: 'https://centerplace.org/hs/bm',
  ot: 'https://centerplace.org/hs/iv',
  nt: 'https://centerplace.org/hs/iv',
  dc: 'https://centerplace.org/hs/dc',
};

// Book of Mormon - RLDS 1908 Authorized Edition structure
const RLDS_BOM_BOOKS: BookInfo[] = [
  { id: '1-nephi', name: '1 Nephi', slug: '1nephi', chapters: 7 },
  { id: '2-nephi', name: '2 Nephi', slug: '2nephi', chapters: 15 },
  { id: 'jacob', name: 'Jacob', slug: 'jacob', chapters: 5 },
  { id: 'enos', name: 'Enos', slug: 'enos', chapters: 1 },
  { id: 'jarom', name: 'Jarom', slug: 'jarom', chapters: 1 },
  { id: 'omni', name: 'Omni', slug: 'omni', chapters: 1 },
  { id: 'words-of-mormon', name: 'Words of Mormon', slug: 'wordsofmormon', chapters: 1 },
  { id: 'mosiah', name: 'Mosiah', slug: 'mosiah', chapters: 13 },
  { id: 'alma', name: 'Alma', slug: 'alma', chapters: 30 },
  { id: 'helaman', name: 'Helaman', slug: 'helaman', chapters: 5 },
  { id: '3-nephi', name: '3 Nephi', slug: '3nephi', chapters: 14 },
  { id: '4-nephi', name: '4 Nephi', slug: '4nephi', chapters: 1 },
  { id: 'mormon', name: 'Mormon', slug: 'mormon', chapters: 4 },
  { id: 'ether', name: 'Ether', slug: 'ether', chapters: 6 },
  { id: 'moroni', name: 'Moroni', slug: 'moroni', chapters: 10 },
];

// Old Testament - Inspired Version structure
const IV_OT_BOOKS: BookInfo[] = [
  { id: 'genesis', name: 'Genesis', slug: 'genesis', chapters: 50 },
  { id: 'exodus', name: 'Exodus', slug: 'exodus', chapters: 40 },
  { id: 'leviticus', name: 'Leviticus', slug: 'leviticus', chapters: 27 },
  { id: 'numbers', name: 'Numbers', slug: 'numbers', chapters: 36 },
  { id: 'deuteronomy', name: 'Deuteronomy', slug: 'deuteronomy', chapters: 34 },
  { id: 'joshua', name: 'Joshua', slug: 'joshua', chapters: 24 },
  { id: 'judges', name: 'Judges', slug: 'judges', chapters: 21 },
  { id: 'ruth', name: 'Ruth', slug: 'ruth', chapters: 4 },
  { id: '1-samuel', name: '1 Samuel', slug: '1samuel', chapters: 31 },
  { id: '2-samuel', name: '2 Samuel', slug: '2samuel', chapters: 24 },
  { id: '1-kings', name: '1 Kings', slug: '1kings', chapters: 22 },
  { id: '2-kings', name: '2 Kings', slug: '2kings', chapters: 25 },
  { id: '1-chronicles', name: '1 Chronicles', slug: '1chronicles', chapters: 29 },
  { id: '2-chronicles', name: '2 Chronicles', slug: '2chronicles', chapters: 36 },
  { id: 'ezra', name: 'Ezra', slug: 'ezra', chapters: 10 },
  { id: 'nehemiah', name: 'Nehemiah', slug: 'nehemiah', chapters: 13 },
  { id: 'esther', name: 'Esther', slug: 'esther', chapters: 10 },
  { id: 'job', name: 'Job', slug: 'job', chapters: 42 },
  { id: 'psalms', name: 'Psalms', slug: 'psalms', chapters: 150 },
  { id: 'proverbs', name: 'Proverbs', slug: 'proverbs', chapters: 31 },
  { id: 'ecclesiastes', name: 'Ecclesiastes', slug: 'ecclesiastes', chapters: 12 },
  { id: 'song-of-solomon', name: 'Song of Solomon', slug: 'songofsol', chapters: 8 },
  { id: 'isaiah', name: 'Isaiah', slug: 'isaiah', chapters: 66 },
  { id: 'jeremiah', name: 'Jeremiah', slug: 'jeremiah', chapters: 52 },
  { id: 'lamentations', name: 'Lamentations', slug: 'lamentations', chapters: 5 },
  { id: 'ezekiel', name: 'Ezekiel', slug: 'ezekiel', chapters: 48 },
  { id: 'daniel', name: 'Daniel', slug: 'daniel', chapters: 12 },
  { id: 'hosea', name: 'Hosea', slug: 'hosea', chapters: 14 },
  { id: 'joel', name: 'Joel', slug: 'joel', chapters: 3 },
  { id: 'amos', name: 'Amos', slug: 'amos', chapters: 9 },
  { id: 'obadiah', name: 'Obadiah', slug: 'obadiah', chapters: 1 },
  { id: 'jonah', name: 'Jonah', slug: 'jonah', chapters: 4 },
  { id: 'micah', name: 'Micah', slug: 'micah', chapters: 7 },
  { id: 'nahum', name: 'Nahum', slug: 'nahum', chapters: 3 },
  { id: 'habakkuk', name: 'Habakkuk', slug: 'habakkuk', chapters: 3 },
  { id: 'zephaniah', name: 'Zephaniah', slug: 'zephaniah', chapters: 3 },
  { id: 'haggai', name: 'Haggai', slug: 'haggai', chapters: 2 },
  { id: 'zechariah', name: 'Zechariah', slug: 'zechariah', chapters: 14 },
  { id: 'malachi', name: 'Malachi', slug: 'malachi', chapters: 4 },
];

// New Testament - Inspired Version structure
const IV_NT_BOOKS: BookInfo[] = [
  { id: 'matthew', name: 'Matthew', slug: 'matthew', chapters: 28 },
  { id: 'mark', name: 'Mark', slug: 'mark', chapters: 16 },
  { id: 'luke', name: 'Luke', slug: 'luke', chapters: 24 },
  { id: 'john', name: 'John', slug: 'john', chapters: 21 },
  { id: 'acts', name: 'Acts', slug: 'acts', chapters: 28 },
  { id: 'romans', name: 'Romans', slug: 'romans', chapters: 16 },
  { id: '1-corinthians', name: '1 Corinthians', slug: '1corinthians', chapters: 16 },
  { id: '2-corinthians', name: '2 Corinthians', slug: '2corinthians', chapters: 13 },
  { id: 'galatians', name: 'Galatians', slug: 'galatians', chapters: 6 },
  { id: 'ephesians', name: 'Ephesians', slug: 'ephesians', chapters: 6 },
  { id: 'philippians', name: 'Philippians', slug: 'philippians', chapters: 4 },
  { id: 'colossians', name: 'Colossians', slug: 'colossians', chapters: 4 },
  { id: '1-thessalonians', name: '1 Thessalonians', slug: '1thessalonians', chapters: 5 },
  { id: '2-thessalonians', name: '2 Thessalonians', slug: '2thessalonians', chapters: 3 },
  { id: '1-timothy', name: '1 Timothy', slug: '1timothy', chapters: 6 },
  { id: '2-timothy', name: '2 Timothy', slug: '2timothy', chapters: 4 },
  { id: 'titus', name: 'Titus', slug: 'titus', chapters: 3 },
  { id: 'philemon', name: 'Philemon', slug: 'philemon', chapters: 1 },
  { id: 'hebrews', name: 'Hebrews', slug: 'hebrews', chapters: 13 },
  { id: 'james', name: 'James', slug: 'james', chapters: 5 },
  { id: '1-peter', name: '1 Peter', slug: '1peter', chapters: 5 },
  { id: '2-peter', name: '2 Peter', slug: '2peter', chapters: 3 },
  { id: '1-john', name: '1 John', slug: '1john', chapters: 5 },
  { id: '2-john', name: '2 John', slug: '2john', chapters: 1 },
  { id: '3-john', name: '3 John', slug: '3john', chapters: 1 },
  { id: 'jude', name: 'Jude', slug: 'jude', chapters: 1 },
  { id: 'revelation', name: 'Revelation', slug: 'revelation', chapters: 22 },
];

// D&C - Community of Christ (167 sections). Sections 1-144 are fetched from
// centerplace.org (3-digit zero-padded slug); 145-167 are modern revelations
// not published there, so they come from the embedded dc-modern-sections data.
const COC_DC_SECTIONS: BookInfo[] = Array.from({ length: 167 }, (_, i) => ({
  id: `section-${i + 1}`,
  name: `Section ${i + 1}`,
  slug: `section${String(i + 1).padStart(3, '0')}`,
  chapters: 1,
}));

export function getBooksForVolume(volumeId: VolumeId): BookInfo[] {
  switch (volumeId) {
    case 'bom':
      return RLDS_BOM_BOOKS;
    case 'ot':
      return IV_OT_BOOKS;
    case 'nt':
      return IV_NT_BOOKS;
    case 'dc':
      return COC_DC_SECTIONS;
    default:
      return RLDS_BOM_BOOKS;
  }
}

function parseScriptureHTML(html: string, bookName: string, volumeId: VolumeId): BookData {
  const chapters: ChapterData[] = [];

  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

  // D&C sections don't have chapter markers -- treat the whole section as chapter 1
  if (volumeId === 'dc') {
    const verses: Verse[] = [];
    const verseMatches = text.matchAll(
      /(?:^|\s)(\d+[a-z]?)\s+([A-Z][^]*?)(?=\s+\d+[a-z]?\s+[A-Z]|$)/gi
    );
    let verseNum = 0;

    for (const verseMatch of verseMatches) {
      verseNum++;
      const verseText = verseMatch[2].trim();
      if (verseText && verseText.length > 10) {
        verses.push({
          num: verseNum,
          text: verseText.substring(0, 1000),
          reference: `${bookName}:${verseMatch[1]}`,
        });
      }
    }

    if (verses.length === 0) {
      const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.length > 20);
      sentences.slice(0, 50).forEach((sentence, i) => {
        verses.push({ num: i + 1, text: sentence.trim(), reference: `${bookName}:${i + 1}` });
      });
    }

    if (verses.length > 0) chapters.push({ chapter: 1, verses });
    return { chapters };
  }

  // Bible and BoM: find all chapter markers and their positions
  const chapterRegex = /Chapter\s+(\d+)/gi;
  const chapterMarkers: { num: number; pos: number }[] = [];
  let match;
  while ((match = chapterRegex.exec(text)) !== null) {
    chapterMarkers.push({ num: parseInt(match[1], 10), pos: match.index });
  }

  for (let i = 0; i < chapterMarkers.length; i++) {
    const startPos = chapterMarkers[i].pos;
    const endPos = i < chapterMarkers.length - 1 ? chapterMarkers[i + 1].pos : text.length;
    const chapterText = text.slice(startPos, endPos);
    const chapterNum = chapterMarkers[i].num;

    const verses: Verse[] = [];
    const verseMatches = chapterText.matchAll(/(\d+):(\d+)\s+([^]*?)(?=\d+:\d+|$)/gi);

    for (const verseMatch of verseMatches) {
      const verseChapter = parseInt(verseMatch[1], 10);
      const verseNum = parseInt(verseMatch[2], 10);
      const verseText = verseMatch[3].trim();

      if (verseChapter === chapterNum && verseText) {
        verses.push({
          num: verseNum,
          text: verseText,
          reference: `${bookName} ${chapterNum}:${verseNum}`,
        });
      }
    }

    if (verses.length > 0) chapters.push({ chapter: chapterNum, verses });
  }

  return { chapters };
}

const bookCache: Map<string, { data: BookData; time: number }> = new Map();
const CACHE_DURATION = 3600000; // 1 hour

export async function fetchBookData(volumeId: VolumeId, book: BookInfo): Promise<BookData> {
  const cacheKey = `${volumeId}:${book.slug}`;
  const cached = bookCache.get(cacheKey);
  if (cached && Date.now() - cached.time < CACHE_DURATION) {
    return cached.data;
  }

  // D&C sections 145-167 are modern revelations not published on
  // centerplace.org -- use the embedded dataset instead.
  if (volumeId === 'dc') {
    const sectionMatch = book.name.match(/Section (\d+)/);
    if (sectionMatch) {
      const sectionNum = parseInt(sectionMatch[1], 10);
      if (isModernSection(sectionNum)) {
        const modernSection = getModernSection(sectionNum);
        if (modernSection) {
          const data: BookData = {
            chapters: [
              {
                chapter: 1,
                verses: modernSection.verses.map((v) => ({
                  num: v.num,
                  text: v.text,
                  reference: `D&C ${sectionNum}:${v.num}`,
                })),
              },
            ],
          };
          bookCache.set(cacheKey, { data, time: Date.now() });
          return data;
        }
      }
    }
  }

  const baseUrl = CENTERPLACE_URLS[volumeId];
  const url = `${baseUrl}/${book.slug}.htm`;

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Scripture-Study-App/1.0 (Community of Christ)' },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${book.name}: ${response.status}`);
    }

    const html = await response.text();
    const data = parseScriptureHTML(html, book.name, volumeId);
    bookCache.set(cacheKey, { data, time: Date.now() });
    return data;
  } catch (error) {
    log.error(`Error fetching ${book.name} from ${url}`, error);
    throw error;
  }
}

// Fetches every book in a volume in parallel. Failures on individual books
// resolve to an empty chapter list rather than rejecting the whole volume.
export async function fetchVolumeData(
  volumeId: VolumeId
): Promise<{ book: BookInfo; data: BookData }[]> {
  const books = getBooksForVolume(volumeId);
  return Promise.all(
    books.map(async (book) => {
      try {
        return { book, data: await fetchBookData(volumeId, book) };
      } catch {
        return { book, data: { chapters: [] } };
      }
    })
  );
}
