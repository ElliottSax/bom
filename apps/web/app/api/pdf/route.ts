import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { fetchVolumeData, type VolumeId } from '../../lib/scripture-source';
import { logger } from '../../utils/logger';

const log = logger.scope('PdfAPI');

// Generating the full Book of Mormon or D&C means fetching every chapter
// from centerplace.org (fetchVolumeData caches per-book afterward), which
// can be slow on a cold cache -- give this route more room than the default.
export const maxDuration = 60;

const VOLUME_TITLES: Record<string, string> = {
  bom: 'The Book of Mormon',
  dc: 'Doctrine and Covenants',
};

const VOLUME_SUBTITLES: Record<string, string> = {
  bom: '1908 Authorized (RLDS) Edition',
  dc: 'Community of Christ Edition',
};

const PAGE_WIDTH = 612; // US Letter
const PAGE_HEIGHT = 792;
const MARGIN = 56;
const BODY_SIZE = 10.5;
const LINE_HEIGHT = BODY_SIZE * 1.4;

// pdf-lib's standard fonts only support WinAnsi -- swap the handful of
// smart-quote/dash characters HTML parsing leaves behind and drop the rest,
// rather than letting an unsupported code point crash the whole export.
function sanitizeForPdf(text: string): string {
  return (
    text
      .replace(/[‘’]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/[–—]/g, '-')
      .replace(/…/g, '...')
      // eslint-disable-next-line no-control-regex -- intentionally keep the WinAnsi range
      .replace(/[^\x00-\xFF]/g, '')
  );
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const volumeParam = (searchParams.get('volume') || 'bom') as VolumeId;

  if (volumeParam !== 'bom' && volumeParam !== 'dc') {
    return NextResponse.json({ error: 'Only "bom" and "dc" PDFs are available' }, { status: 400 });
  }

  try {
    const volumeData = await fetchVolumeData(volumeParam);

    const doc = await PDFDocument.create();
    doc.setTitle(VOLUME_TITLES[volumeParam]);
    doc.setSubject(VOLUME_SUBTITLES[volumeParam]);
    doc.setProducer('Community of Christ Scripture Study');

    const bodyFont = await doc.embedFont(StandardFonts.TimesRoman);
    const boldFont = await doc.embedFont(StandardFonts.TimesRomanBold);
    const contentWidth = PAGE_WIDTH - MARGIN * 2;

    let page: PDFPage = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    let y = PAGE_HEIGHT - MARGIN;

    const newPage = () => {
      page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    };

    const ensureRoom = (needed: number) => {
      if (y - needed < MARGIN) newPage();
    };

    // Title page
    page.drawText(VOLUME_TITLES[volumeParam], {
      x: MARGIN,
      y: PAGE_HEIGHT / 2 + 40,
      size: 28,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    page.drawText(VOLUME_SUBTITLES[volumeParam], {
      x: MARGIN,
      y: PAGE_HEIGHT / 2 + 10,
      size: 14,
      font: bodyFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    page.drawText('Community of Christ Scripture Study', {
      x: MARGIN,
      y: PAGE_HEIGHT / 2 - 20,
      size: 10,
      font: bodyFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    newPage();

    for (const { book, data } of volumeData) {
      if (data.chapters.length === 0) continue;

      ensureRoom(LINE_HEIGHT * 3);
      page.drawText(sanitizeForPdf(book.name), {
        x: MARGIN,
        y,
        size: 16,
        font: boldFont,
      });
      y -= LINE_HEIGHT * 2;

      for (const chapter of data.chapters) {
        // D&C sections are a single "chapter" already labeled by the section
        // name above, so skip the redundant "Chapter 1" heading there.
        if (volumeParam === 'bom') {
          ensureRoom(LINE_HEIGHT * 2);
          page.drawText(`Chapter ${chapter.chapter}`, {
            x: MARGIN,
            y,
            size: 12,
            font: boldFont,
          });
          y -= LINE_HEIGHT * 1.5;
        }

        for (const verse of chapter.verses) {
          const verseText = sanitizeForPdf(`${verse.num} ${verse.text}`);
          const lines = wrapText(verseText, bodyFont, BODY_SIZE, contentWidth);

          ensureRoom(LINE_HEIGHT * lines.length);
          for (const line of lines) {
            page.drawText(line, { x: MARGIN, y, size: BODY_SIZE, font: bodyFont });
            y -= LINE_HEIGHT;
          }
          y -= LINE_HEIGHT * 0.3;
        }
      }

      y -= LINE_HEIGHT;
    }

    const pdfBytes = await doc.save();
    const filename = volumeParam === 'bom' ? 'book-of-mormon.pdf' : 'doctrine-and-covenants.pdf';

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    log.error('PDF generation failed', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
