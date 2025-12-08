#!/usr/bin/env python3
"""
Parse Book of Mormon HTML from Centerplace.org and create SQL INSERT statements
"""

import re
import sys
import html
import subprocess

def fetch_html(url):
    """Fetch HTML using curl"""
    result = subprocess.run(['curl', '-s', url], capture_output=True, text=True)
    return result.stdout

def parse_verses(html_content, book_name, edition_id='coc-bom-1908'):
    """Parse verses from HTML content"""
    verses = []

    # Find all verse paragraphs: <p class="Verse">1:1 text...</p>
    verse_pattern = re.compile(r'<p class="Verse">(\d+):(\d+)\s+(.*?)</p>', re.DOTALL)

    for match in verse_pattern.finditer(html_content):
        chapter = int(match.group(1))
        verse = int(match.group(2))
        text = match.group(3)

        # Clean up the text
        text = html.unescape(text)
        text = re.sub(r'<[^>]+>', '', text)  # Remove any remaining HTML tags
        text = text.strip()

        # Skip empty verses
        if not text or len(text) < 5:
            continue

        # Generate ID
        book_id = book_name.lower().replace(' ', '-')
        verse_id = f"{edition_id}:{book_id}-{chapter}-{verse}"

        verses.append({
            'id': verse_id,
            'editionId': edition_id,
            'book': book_name,
            'chapter': chapter,
            'verse': verse,
            'text': text,
            'verseType': 'standard'
        })

    return verses

def create_sql_inserts(verses):
    """Create SQL INSERT statements"""
    sql_lines = []

    for v in verses:
        # Escape single quotes in text
        text_escaped = v['text'].replace("'", "''")

        sql = f"""INSERT INTO verses (id, "editionId", book, chapter, verse, text, "verseType")
VALUES ('{v['id']}', '{v['editionId']}', '{v['book']}', {v['chapter']}, {v['verse']}, '{text_escaped}', '{v['verseType']}')
ON CONFLICT (id) DO NOTHING;"""
        sql_lines.append(sql)

    return '\n'.join(sql_lines)

def main():
    if len(sys.argv) < 3:
        print("Usage: python3 parse_bom_html.py <book_url> <book_name> [output_file]")
        print("Example: python3 parse_bom_html.py https://www.centerplace.org/hs/bm/mormon.htm Mormon")
        sys.exit(1)

    url = sys.argv[1]
    book_name = sys.argv[2]
    output_file = sys.argv[3] if len(sys.argv) > 3 else None

    print(f"Fetching {book_name}...")
    html_content = fetch_html(url)

    print(f"Parsing verses...")
    verses = parse_verses(html_content, book_name)

    print(f"Found {len(verses)} verses")

    if verses:
        print(f"Chapter range: {min(v['chapter'] for v in verses)} - {max(v['chapter'] for v in verses)}")
        print(f"Total chapters: {len(set(v['chapter'] for v in verses))}")

    print(f"Creating SQL...")
    sql = create_sql_inserts(verses)

    if output_file:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(sql)
        print(f"SQL written to {output_file}")
    else:
        print(sql)

if __name__ == '__main__':
    main()
