import { NextRequest, NextResponse } from 'next/server';
import { getModernSection, isModernSection } from '../../lib/dc-modern-sections';
import { logger } from '../../utils/logger';

const log = logger.scope('SearchAPI');

// Base URLs for scripture sources from centerplace.org
const CENTERPLACE_URLS = {
  bom: 'https://centerplace.org/hs/bm',
  ot: 'https://centerplace.org/hs/iv',
  nt: 'https://centerplace.org/hs/iv',
  dc: 'https://centerplace.org/hs/dc',
};

// Book structures for each volume -- kept in sync with the full lists in
// ../verses/route.ts. This used to be its own much shorter, hand-picked
// subset of books/sections, which is why searches for anything outside a
// handful of D&C sections or a few Bible books silently found nothing.
const RLDS_BOM_BOOKS = [
  { id: '1-nephi', name: '1 Nephi', slug: '1nephi' },
  { id: '2-nephi', name: '2 Nephi', slug: '2nephi' },
  { id: 'jacob', name: 'Jacob', slug: 'jacob' },
  { id: 'enos', name: 'Enos', slug: 'enos' },
  { id: 'jarom', name: 'Jarom', slug: 'jarom' },
  { id: 'omni', name: 'Omni', slug: 'omni' },
  { id: 'words-of-mormon', name: 'Words of Mormon', slug: 'wordsofmormon' },
  { id: 'mosiah', name: 'Mosiah', slug: 'mosiah' },
  { id: 'alma', name: 'Alma', slug: 'alma' },
  { id: 'helaman', name: 'Helaman', slug: 'helaman' },
  { id: '3-nephi', name: '3 Nephi', slug: '3nephi' },
  { id: '4-nephi', name: '4 Nephi', slug: '4nephi' },
  { id: 'mormon', name: 'Mormon', slug: 'mormon' },
  { id: 'ether', name: 'Ether', slug: 'ether' },
  { id: 'moroni', name: 'Moroni', slug: 'moroni' },
];

const IV_OT_BOOKS = [
  { id: 'genesis', name: 'Genesis', slug: 'genesis' },
  { id: 'exodus', name: 'Exodus', slug: 'exodus' },
  { id: 'leviticus', name: 'Leviticus', slug: 'leviticus' },
  { id: 'numbers', name: 'Numbers', slug: 'numbers' },
  { id: 'deuteronomy', name: 'Deuteronomy', slug: 'deuteronomy' },
  { id: 'joshua', name: 'Joshua', slug: 'joshua' },
  { id: 'judges', name: 'Judges', slug: 'judges' },
  { id: 'ruth', name: 'Ruth', slug: 'ruth' },
  { id: '1-samuel', name: '1 Samuel', slug: '1samuel' },
  { id: '2-samuel', name: '2 Samuel', slug: '2samuel' },
  { id: '1-kings', name: '1 Kings', slug: '1kings' },
  { id: '2-kings', name: '2 Kings', slug: '2kings' },
  { id: '1-chronicles', name: '1 Chronicles', slug: '1chronicles' },
  { id: '2-chronicles', name: '2 Chronicles', slug: '2chronicles' },
  { id: 'ezra', name: 'Ezra', slug: 'ezra' },
  { id: 'nehemiah', name: 'Nehemiah', slug: 'nehemiah' },
  { id: 'esther', name: 'Esther', slug: 'esther' },
  { id: 'job', name: 'Job', slug: 'job' },
  { id: 'psalms', name: 'Psalms', slug: 'psalms' },
  { id: 'proverbs', name: 'Proverbs', slug: 'proverbs' },
  { id: 'ecclesiastes', name: 'Ecclesiastes', slug: 'ecclesiastes' },
  { id: 'song-of-solomon', name: 'Song of Solomon', slug: 'songofsol' },
  { id: 'isaiah', name: 'Isaiah', slug: 'isaiah' },
  { id: 'jeremiah', name: 'Jeremiah', slug: 'jeremiah' },
  { id: 'lamentations', name: 'Lamentations', slug: 'lamentations' },
  { id: 'ezekiel', name: 'Ezekiel', slug: 'ezekiel' },
  { id: 'daniel', name: 'Daniel', slug: 'daniel' },
  { id: 'hosea', name: 'Hosea', slug: 'hosea' },
  { id: 'joel', name: 'Joel', slug: 'joel' },
  { id: 'amos', name: 'Amos', slug: 'amos' },
  { id: 'obadiah', name: 'Obadiah', slug: 'obadiah' },
  { id: 'jonah', name: 'Jonah', slug: 'jonah' },
  { id: 'micah', name: 'Micah', slug: 'micah' },
  { id: 'nahum', name: 'Nahum', slug: 'nahum' },
  { id: 'habakkuk', name: 'Habakkuk', slug: 'habakkuk' },
  { id: 'zephaniah', name: 'Zephaniah', slug: 'zephaniah' },
  { id: 'haggai', name: 'Haggai', slug: 'haggai' },
  { id: 'zechariah', name: 'Zechariah', slug: 'zechariah' },
  { id: 'malachi', name: 'Malachi', slug: 'malachi' },
];

const IV_NT_BOOKS = [
  { id: 'matthew', name: 'Matthew', slug: 'matthew' },
  { id: 'mark', name: 'Mark', slug: 'mark' },
  { id: 'luke', name: 'Luke', slug: 'luke' },
  { id: 'john', name: 'John', slug: 'john' },
  { id: 'acts', name: 'Acts', slug: 'acts' },
  { id: 'romans', name: 'Romans', slug: 'romans' },
  { id: '1-corinthians', name: '1 Corinthians', slug: '1corinthians' },
  { id: '2-corinthians', name: '2 Corinthians', slug: '2corinthians' },
  { id: 'galatians', name: 'Galatians', slug: 'galatians' },
  { id: 'ephesians', name: 'Ephesians', slug: 'ephesians' },
  { id: 'philippians', name: 'Philippians', slug: 'philippians' },
  { id: 'colossians', name: 'Colossians', slug: 'colossians' },
  { id: '1-thessalonians', name: '1 Thessalonians', slug: '1thessalonians' },
  { id: '2-thessalonians', name: '2 Thessalonians', slug: '2thessalonians' },
  { id: '1-timothy', name: '1 Timothy', slug: '1timothy' },
  { id: '2-timothy', name: '2 Timothy', slug: '2timothy' },
  { id: 'titus', name: 'Titus', slug: 'titus' },
  { id: 'philemon', name: 'Philemon', slug: 'philemon' },
  { id: 'hebrews', name: 'Hebrews', slug: 'hebrews' },
  { id: 'james', name: 'James', slug: 'james' },
  { id: '1-peter', name: '1 Peter', slug: '1peter' },
  { id: '2-peter', name: '2 Peter', slug: '2peter' },
  { id: '1-john', name: '1 John', slug: '1john' },
  { id: '2-john', name: '2 John', slug: '2john' },
  { id: '3-john', name: '3 John', slug: '3john' },
  { id: 'jude', name: 'Jude', slug: 'jude' },
  { id: 'revelation', name: 'Revelation', slug: 'revelation' },
];

// D&C - Community of Christ (167 sections). Sections 1-144 are fetched from
// centerplace.org; 145-167 come from the embedded dc-modern-sections data
// (see getAllScripturesForVolume below), same split as ../verses/route.ts.
const COC_DC_SECTIONS = Array.from({ length: 167 }, (_, i) => ({
  id: `section-${i + 1}`,
  name: `Section ${i + 1}`,
  slug: `section${String(i + 1).padStart(3, '0')}`,
}));

type VolumeId = 'bom' | 'ot' | 'nt' | 'dc';

interface SearchVerse {
  volumeId: VolumeId;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string;
}

interface SearchResult extends SearchVerse {
  score: number;
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

// Cache for all scripture data per volume
const cachedScriptures: Map<VolumeId, { data: SearchVerse[]; time: number }> = new Map();
const CACHE_DURATION = 3600000; // 1 hour

function parseScriptureHTML(html: string, bookName: string, volumeId: VolumeId): SearchVerse[] {
  const results: SearchVerse[] = [];

  // Clean HTML
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

  // D&C sections use different verse format
  if (volumeId === 'dc') {
    const verseMatches = text.matchAll(
      /(?:^|\s)(\d+[a-z]?)\s+([A-Z][^]*?)(?=\s+\d+[a-z]?\s+[A-Z]|$)/gi
    );
    let verseNum = 0;

    for (const verseMatch of verseMatches) {
      verseNum++;
      const verseText = verseMatch[2].trim();
      if (verseText && verseText.length > 10) {
        results.push({
          volumeId,
          book: bookName,
          chapter: 1,
          verse: verseNum,
          text: verseText.substring(0, 500),
          reference: `${bookName}:${verseMatch[1]}`,
        });
      }
    }
    return results;
  }

  // Find chapter markers for BoM and Bible
  const chapterRegex = /Chapter\s+(\d+)/gi;
  const chapterMarkers: { num: number; pos: number }[] = [];
  let match;
  while ((match = chapterRegex.exec(text)) !== null) {
    chapterMarkers.push({ num: parseInt(match[1], 10), pos: match.index });
  }

  // Process each chapter
  for (let i = 0; i < chapterMarkers.length; i++) {
    const startPos = chapterMarkers[i].pos;
    const endPos = i < chapterMarkers.length - 1 ? chapterMarkers[i + 1].pos : text.length;
    const chapterText = text.slice(startPos, endPos);
    const chapterNum = chapterMarkers[i].num;

    const verseMatches = chapterText.matchAll(/(\d+):(\d+)\s+([^]*?)(?=\d+:\d+|$)/gi);

    for (const verseMatch of verseMatches) {
      const verseChapter = parseInt(verseMatch[1], 10);
      const verseNum = parseInt(verseMatch[2], 10);
      const verseText = verseMatch[3].trim();

      if (verseChapter === chapterNum && verseText) {
        results.push({
          volumeId,
          book: bookName,
          chapter: chapterNum,
          verse: verseNum,
          text: verseText,
          reference: `${bookName} ${chapterNum}:${verseNum}`,
        });
      }
    }
  }

  return results;
}

async function getAllScripturesForVolume(volumeId: VolumeId): Promise<SearchVerse[]> {
  const cached = cachedScriptures.get(volumeId);
  if (cached && Date.now() - cached.time < CACHE_DURATION) {
    return cached.data;
  }

  const allVerses: SearchVerse[] = [];
  const books = getBooksForVolume(volumeId);
  const baseUrl = CENTERPLACE_URLS[volumeId];

  // Fetch books in parallel (limit concurrency)
  const fetchPromises = books.map(async (book) => {
    // D&C sections 145-167 are modern revelations not published on
    // centerplace.org -- use the same embedded dataset the reader uses
    // instead of fetching a section page that doesn't exist.
    if (volumeId === 'dc') {
      const sectionMatch = book.name.match(/Section (\d+)/);
      const sectionNum = sectionMatch ? parseInt(sectionMatch[1], 10) : NaN;
      if (isModernSection(sectionNum)) {
        const modernSection = getModernSection(sectionNum);
        if (!modernSection) return [];
        return modernSection.verses
          .filter((v) => v.text && v.text.length > 10)
          .map((v) => ({
            volumeId,
            book: book.name,
            chapter: 1,
            verse: v.num,
            text: v.text.substring(0, 500),
            reference: `D&C ${sectionNum}:${v.num}`,
          }));
      }
    }

    try {
      const url = `${baseUrl}/${book.slug}.htm`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Scripture-Study-App/1.0 (Community of Christ)',
        },
      });

      if (!response.ok) {
        log.error(`Failed to fetch ${book.name}: ${response.status}`);
        return [];
      }

      const html = await response.text();
      return parseScriptureHTML(html, book.name, volumeId);
    } catch (error) {
      log.error(`Error fetching ${book.name}`, error);
      return [];
    }
  });

  const results = await Promise.all(fetchPromises);
  for (const bookVerses of results) {
    allVerses.push(...bookVerses);
  }

  cachedScriptures.set(volumeId, { data: allVerses, time: Date.now() });
  return allVerses;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toLowerCase() || '';
  const volumeParam = (searchParams.get('volume') || 'bom') as VolumeId;
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  // Validate volume
  const validVolumes: VolumeId[] = ['bom', 'ot', 'nt', 'dc'];
  const volumeId = validVolumes.includes(volumeParam) ? volumeParam : 'bom';

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [], query, volume: volumeId });
  }

  try {
    const allVerses = await getAllScripturesForVolume(volumeId);
    const results: SearchResult[] = [];

    // Search with simple relevance scoring
    const queryWords = query.split(/\s+/).filter((w) => w.length >= 2);

    for (const verse of allVerses) {
      const textLower = verse.text.toLowerCase();

      // Check if all query words are present
      const allWordsFound = queryWords.every((word) => textLower.includes(word));

      if (allWordsFound || textLower.includes(query)) {
        results.push({
          ...verse,
          // Score: exact phrase match scores higher
          score: textLower.includes(query) ? 2 : 1,
        });
        if (results.length >= limit * 2) break; // Get extra for sorting
      }
    }

    // Sort by score and limit
    results.sort((a, b) => b.score - a.score);
    const finalResults = results.slice(0, limit).map(({ score: _score, ...rest }) => rest);

    return NextResponse.json({
      results: finalResults,
      query,
      count: finalResults.length,
      volume: volumeId,
    });
  } catch (error) {
    log.error('Search failed', error);
    return NextResponse.json({ error: 'Search failed', volume: volumeId }, { status: 500 });
  }
}
