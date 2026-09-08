import { NextRequest, NextResponse } from 'next/server';
import { getBooksForVolume, fetchBookData, type VolumeId } from '../../lib/scripture-source';
import { logger } from '../../utils/logger';

const log = logger.scope('VersesAPI');

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const volumeParam = (searchParams.get('volume') || 'bom') as VolumeId;
  const bookParam = searchParams.get('book');
  const chapterParam = searchParams.get('chapter');

  const validVolumes: VolumeId[] = ['bom', 'ot', 'nt', 'dc'];
  const volumeId = validVolumes.includes(volumeParam) ? volumeParam : 'bom';
  const books = getBooksForVolume(volumeId);

  try {
    // If no book param, return list of books
    if (!bookParam) {
      const bookList = books.map((b) => ({ id: b.id, name: b.name, chapters: b.chapters }));
      return NextResponse.json({ books: bookList, volume: volumeId });
    }

    const bookInfo = books.find(
      (b) =>
        b.id === bookParam.toLowerCase() ||
        b.name.toLowerCase() === bookParam.toLowerCase() ||
        b.slug === bookParam.toLowerCase()
    );

    if (!bookInfo) {
      return NextResponse.json({ error: 'Book not found', volume: volumeId }, { status: 404 });
    }

    const bookData = await fetchBookData(volumeId, bookInfo);

    // If no chapter, return chapter list
    if (!chapterParam) {
      const chapters = bookData.chapters.map((c) => ({
        number: c.chapter,
        verseCount: c.verses.length,
      }));
      return NextResponse.json({ book: bookInfo.name, chapters, volume: volumeId });
    }

    const chapterNum = parseInt(chapterParam, 10);
    const chapterData = bookData.chapters.find((c) => c.chapter === chapterNum);

    if (!chapterData) {
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
