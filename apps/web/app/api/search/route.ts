import { NextRequest, NextResponse } from 'next/server';

// Base URLs for scripture sources from centerplace.org
const CENTERPLACE_URLS = {
  bom: 'https://centerplace.org/hs/bm',
  ot: 'https://centerplace.org/hs/iv',
  nt: 'https://centerplace.org/hs/iv',
  dc: 'https://centerplace.org/hs/dc',
};

// Book structures for each volume
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
  { id: 'psalms', name: 'Psalms', slug: 'psalms' },
  { id: 'proverbs', name: 'Proverbs', slug: 'proverbs' },
  { id: 'isaiah', name: 'Isaiah', slug: 'isaiah' },
  { id: 'jeremiah', name: 'Jeremiah', slug: 'jeremiah' },
];

const IV_NT_BOOKS = [
  { id: 'matthew', name: 'Matthew', slug: 'matthew' },
  { id: 'mark', name: 'Mark', slug: 'mark' },
  { id: 'luke', name: 'Luke', slug: 'luke' },
  { id: 'john', name: 'John', slug: 'john' },
  { id: 'acts', name: 'Acts', slug: 'acts' },
  { id: 'romans', name: 'Romans', slug: 'romans' },
];

// D&C - most commonly searched sections
const COC_DC_SECTIONS = [
  { id: 'section-1', name: 'Section 1', slug: 'section1' },
  { id: 'section-4', name: 'Section 4', slug: 'section4' },
  { id: 'section-22', name: 'Section 22', slug: 'section22' },
  { id: 'section-85', name: 'Section 85', slug: 'section85' },
  { id: 'section-161', name: 'Section 161', slug: 'section161' },
  { id: 'section-162', name: 'Section 162', slug: 'section162' },
  { id: 'section-163', name: 'Section 163', slug: 'section163' },
  { id: 'section-164', name: 'Section 164', slug: 'section164' },
  { id: 'section-165', name: 'Section 165', slug: 'section165' },
];

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
    case 'bom': return RLDS_BOM_BOOKS;
    case 'ot': return IV_OT_BOOKS;
    case 'nt': return IV_NT_BOOKS;
    case 'dc': return COC_DC_SECTIONS;
    default: return RLDS_BOM_BOOKS;
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
    const verseMatches = text.matchAll(/(?:^|\s)(\d+[a-z]?)\s+([A-Z][^]*?)(?=\s+\d+[a-z]?\s+[A-Z]|$)/gi);
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
    try {
      const url = `${baseUrl}/${book.slug}.htm`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Scripture-Study-App/1.0 (Community of Christ)',
        },
      });

      if (!response.ok) {
        console.error(`Failed to fetch ${book.name}: ${response.status}`);
        return [];
      }

      const html = await response.text();
      return parseScriptureHTML(html, book.name, volumeId);
    } catch (error) {
      console.error(`Error fetching ${book.name}:`, error);
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
    const queryWords = query.split(/\s+/).filter(w => w.length >= 2);

    for (const verse of allVerses) {
      const textLower = verse.text.toLowerCase();

      // Check if all query words are present
      const allWordsFound = queryWords.every(word => textLower.includes(word));

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
    console.error('Search failed:', error);
    return NextResponse.json({ error: 'Search failed', volume: volumeId }, { status: 500 });
  }
}
