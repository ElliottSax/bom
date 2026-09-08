import { NextRequest, NextResponse } from 'next/server';
import { getModernSection, isModernSection } from '../../lib/dc-modern-sections';
import { logger } from '../../utils/logger';

const log = logger.scope('VersesAPI');

// Base URLs for scripture sources from centerplace.org
const CENTERPLACE_URLS = {
  bom: 'https://centerplace.org/hs/bm',
  ot: 'https://centerplace.org/hs/iv',
  nt: 'https://centerplace.org/hs/iv',
  dc: 'https://centerplace.org/hs/dc',
};

// Book of Mormon - RLDS 1908 structure
const RLDS_BOM_BOOKS = [
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
const IV_OT_BOOKS = [
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
const IV_NT_BOOKS = [
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

// D&C - Community of Christ (167 sections)
// Sections 1-144: fetched from centerplace.org (3-digit zero-padded format)
// Sections 145-167: embedded data (modern revelations not on centerplace.org)
const COC_DC_SECTIONS = Array.from({ length: 167 }, (_, i) => ({
  id: `section-${i + 1}`,
  name: `Section ${i + 1}`,
  slug: `section${String(i + 1).padStart(3, '0')}`,
  chapters: 1,
}));

type VolumeId = 'bom' | 'ot' | 'nt' | 'dc';

interface Verse {
  num: number;
  text: string;
  reference: string;
}

interface ChapterData {
  chapter: number;
  verses: Verse[];
}

interface BookData {
  chapters: ChapterData[];
}

function getBooksForVolume(volumeId: VolumeId) {
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

// Cache for parsed scripture data
const bookCache: Map<string, { data: BookData; time: number }> = new Map();
const CACHE_DURATION = 3600000; // 1 hour

function parseScriptureHTML(html: string, bookName: string, volumeId: VolumeId): BookData {
  const chapters: ChapterData[] = [];

  // Clean HTML - basic parsing
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

  // D&C sections don't have chapter markers - treat whole section as chapter 1
  if (volumeId === 'dc') {
    const verses: Verse[] = [];
    // Match verse patterns like "1a And..." or "1 And..."
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
          text: verseText.substring(0, 1000), // Limit verse length
          reference: `${bookName}:${verseMatch[1]}`,
        });
      }
    }

    // Fallback: split by sentence patterns if no verses found
    if (verses.length === 0) {
      const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.length > 20);
      sentences.slice(0, 50).forEach((sentence, i) => {
        verses.push({
          num: i + 1,
          text: sentence.trim(),
          reference: `${bookName}:${i + 1}`,
        });
      });
    }

    if (verses.length > 0) {
      chapters.push({ chapter: 1, verses });
    }
    return { chapters };
  }

  // For Bible and BoM: Find all chapter markers and their positions
  const chapterRegex = /Chapter\s+(\d+)/gi;
  const chapterMarkers: { num: number; pos: number }[] = [];
  let match;
  while ((match = chapterRegex.exec(text)) !== null) {
    chapterMarkers.push({ num: parseInt(match[1], 10), pos: match.index });
  }

  // Process each chapter section
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

    if (verses.length > 0) {
      chapters.push({
        chapter: chapterNum,
        verses,
      });
    }
  }

  return { chapters };
}

async function fetchBookData(
  volumeId: VolumeId,
  bookSlug: string,
  bookName: string
): Promise<BookData> {
  const cacheKey = `${volumeId}:${bookSlug}`;
  const cached = bookCache.get(cacheKey);

  if (cached && Date.now() - cached.time < CACHE_DURATION) {
    return cached.data;
  }

  // For D&C sections 145-165, use embedded data (not on centerplace.org)
  if (volumeId === 'dc') {
    const sectionMatch = bookName.match(/Section (\d+)/);
    if (sectionMatch) {
      const sectionNum = parseInt(sectionMatch[1], 10);
      if (isModernSection(sectionNum)) {
        const modernSection = getModernSection(sectionNum);
        if (modernSection) {
          const data = {
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
  const url = `${baseUrl}/${bookSlug}.htm`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Scripture-Study-App/1.0 (Community of Christ)',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${bookName}: ${response.status}`);
    }

    const html = await response.text();
    const data = parseScriptureHTML(html, bookName, volumeId);

    bookCache.set(cacheKey, { data, time: Date.now() });
    return data;
  } catch (error) {
    log.error(`Error fetching ${bookName} from ${url}`, error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const volumeParam = (searchParams.get('volume') || 'bom') as VolumeId;
  const bookParam = searchParams.get('book');
  const chapterParam = searchParams.get('chapter');

  // Validate volume
  const validVolumes: VolumeId[] = ['bom', 'ot', 'nt', 'dc'];
  const volumeId = validVolumes.includes(volumeParam) ? volumeParam : 'bom';
  const books = getBooksForVolume(volumeId);

  try {
    // If no book param, return list of books
    if (!bookParam) {
      const bookList = books.map((b) => ({
        id: b.id,
        name: b.name,
        chapters: b.chapters,
      }));
      return NextResponse.json({ books: bookList, volume: volumeId });
    }

    // Find the book
    const bookInfo = books.find(
      (b) =>
        b.id === bookParam.toLowerCase() ||
        b.name.toLowerCase() === bookParam.toLowerCase() ||
        b.slug === bookParam.toLowerCase()
    );

    if (!bookInfo) {
      return NextResponse.json({ error: 'Book not found', volume: volumeId }, { status: 404 });
    }

    // Fetch and parse the book data
    const bookData = await fetchBookData(volumeId, bookInfo.slug, bookInfo.name);

    // If no chapter, return chapter list
    if (!chapterParam) {
      const chapters = bookData.chapters.map((c) => ({
        number: c.chapter,
        verseCount: c.verses.length,
      }));
      return NextResponse.json({
        book: bookInfo.name,
        chapters,
        volume: volumeId,
      });
    }

    // Get specific chapter
    const chapterNum = parseInt(chapterParam, 10);
    const chapterData = bookData.chapters.find((c) => c.chapter === chapterNum);

    if (!chapterData) {
      // For volumes with data issues, return placeholder
      return NextResponse.json({
        book: bookInfo.name,
        chapter: chapterNum,
        verses: [
          {
            num: 1,
            text: `[Scripture text for ${bookInfo.name} Chapter ${chapterNum} - Loading from source...]`,
            reference: `${bookInfo.name} ${chapterNum}:1`,
          },
        ],
        volume: volumeId,
        note: 'Some texts may not be available in the online source.',
      });
    }

    return NextResponse.json({
      book: bookInfo.name,
      chapter: chapterNum,
      verses: chapterData.verses,
      volume: volumeId,
    });
  } catch (error) {
    log.error('Error fetching scripture data', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch scripture data',
        details: error instanceof Error ? error.message : 'Unknown error',
        volume: volumeId,
      },
      { status: 500 }
    );
  }
}
