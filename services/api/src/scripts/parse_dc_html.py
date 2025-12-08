#!/usr/bin/env python3
"""
Parse Doctrine & Covenants HTML from Centerplace.org and create SQL INSERT statements
"""

import re
import sys
import html
import subprocess

def fetch_html(url):
    """Fetch HTML using curl"""
    result = subprocess.run(['curl', '-s', url], capture_output=True, text=True)
    return result.stdout

def parse_verses(html_content, section_num, edition_id='coc-dc-2017'):
    """Parse verses from HTML content"""
    verses = []

    # Find all verse paragraphs: <p class="Verse">D&C 11:1a text...</p>
    # D&C verses can have letter suffixes like "1a", "1b", "1c"
    verse_pattern = re.compile(r'<p class="Verse">D&C\s+\d+:(\d+)([a-z]*)\s+(.*?)</p>', re.DOTALL | re.IGNORECASE)

    verse_num = 1
    for match in verse_pattern.finditer(html_content):
        base_verse = int(match.group(1))
        suffix = match.group(2)
        text = match.group(3)

        # Clean up the text
        text = html.unescape(text)
        text = re.sub(r'<[^>]+>', '', text)  # Remove any remaining HTML tags
        text = text.strip()

        # Skip empty verses
        if not text or len(text) < 5:
            continue

        # Generate ID - include suffix if present
        verse_str = f"{base_verse}{suffix}"
        verse_id = f"{edition_id}:section-{section_num}-{verse_str}"

        verses.append({
            'id': verse_id,
            'editionId': edition_id,
            'book': 'Doctrine and Covenants',
            'chapter': section_num,
            'verse': verse_num,  # Sequential numbering
            'text': text,
            'verseType': 'standard'
        })

        verse_num += 1

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
    if len(sys.argv) < 2:
        print("Usage: python3 parse_dc_html.py <section_start> [section_end] [output_file]")
        print("Example: python3 parse_dc_html.py 11 20 import-dc-sections-11-20.sql")
        sys.exit(1)

    section_start = int(sys.argv[1])
    section_end = int(sys.argv[2]) if len(sys.argv) > 2 and sys.argv[2].isdigit() else section_start
    output_file = sys.argv[3] if len(sys.argv) > 3 else None

    all_verses = []

    for section_num in range(section_start, section_end + 1):
        url = f"https://www.centerplace.org/hs/dc/section{section_num:03d}.htm"

        print(f"Fetching D&C Section {section_num}...")
        html_content = fetch_html(url)

        print(f"Parsing verses...")
        verses = parse_verses(html_content, section_num)

        print(f"  Found {len(verses)} verses in Section {section_num}")
        all_verses.extend(verses)

    print(f"\nTotal: {len(all_verses)} verses from sections {section_start}-{section_end}")

    if all_verses:
        print(f"Creating SQL...")
        sql = create_sql_inserts(all_verses)

        if output_file:
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(sql)
            print(f"SQL written to {output_file}")
        else:
            print(sql)

if __name__ == '__main__':
    main()
