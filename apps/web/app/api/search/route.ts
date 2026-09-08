import { NextRequest, NextResponse } from 'next/server';
import { fetchVolumeData, type VolumeId } from '../../lib/scripture-source';
import { logger } from '../../utils/logger';

const log = logger.scope('SearchAPI');

interface SearchResult {
  volumeId: VolumeId;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string;
  score: number;
}

// Cache flattened, searchable verses per volume (fetchVolumeData already
// caches each book's raw fetch, this just avoids re-flattening every query).
const cachedScriptures: Map<VolumeId, { data: Omit<SearchResult, 'score'>[]; time: number }> =
  new Map();
const CACHE_DURATION = 3600000; // 1 hour

async function getAllScripturesForVolume(
  volumeId: VolumeId
): Promise<Omit<SearchResult, 'score'>[]> {
  const cached = cachedScriptures.get(volumeId);
  if (cached && Date.now() - cached.time < CACHE_DURATION) {
    return cached.data;
  }

  const volumeData = await fetchVolumeData(volumeId);
  const allVerses: Omit<SearchResult, 'score'>[] = [];

  for (const { book, data } of volumeData) {
    for (const chapter of data.chapters) {
      for (const verse of chapter.verses) {
        allVerses.push({
          volumeId,
          book: book.name,
          chapter: chapter.chapter,
          verse: verse.num,
          text: verse.text.substring(0, 500),
          reference: verse.reference,
        });
      }
    }
  }

  cachedScriptures.set(volumeId, { data: allVerses, time: Date.now() });
  return allVerses;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toLowerCase() || '';
  const volumeParam = (searchParams.get('volume') || 'bom') as VolumeId;
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  const validVolumes: VolumeId[] = ['bom', 'ot', 'nt', 'dc'];
  const volumeId = validVolumes.includes(volumeParam) ? volumeParam : 'bom';

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [], query, volume: volumeId });
  }

  try {
    const allVerses = await getAllScripturesForVolume(volumeId);
    const results: SearchResult[] = [];
    const queryWords = query.split(/\s+/).filter((w) => w.length >= 2);

    for (const verse of allVerses) {
      const textLower = verse.text.toLowerCase();
      const allWordsFound = queryWords.every((word) => textLower.includes(word));

      if (allWordsFound || textLower.includes(query)) {
        results.push({ ...verse, score: textLower.includes(query) ? 2 : 1 });
        if (results.length >= limit * 2) break;
      }
    }

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
