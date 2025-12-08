#!/usr/bin/env python3
"""
Test API queries directly using PostgreSQL
Bypasses the need to run the full GraphQL server
"""

import subprocess
import json

def run_query(sql):
    """Run SQL query and return results"""
    cmd = [
        'docker', 'exec', 'pod_postgres',
        'psql', '-U', 'pod_user', '-d', 'bom_study_tools',
        '-t', '-A', '-F', '|', '-c', sql
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.stdout.strip()

def run_json_query(sql):
    """Run SQL query and return JSON results"""
    cmd = [
        'docker', 'exec', 'pod_postgres',
        'psql', '-U', 'pod_user', '-d', 'bom_study_tools',
        '-t', '-A', '-c', sql
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    lines = result.stdout.strip().split('\n')
    return [json.loads(line) for line in lines if line]

def main():
    print('\n🧪 Testing API Queries with Full Dataset\n')
    print('=' * 60)

    # Test 1: Get database statistics
    print('\n1️⃣  DATABASE STATISTICS')
    print('-' * 60)

    total_verses = run_query('SELECT COUNT(*) FROM verses;')
    total_editions = run_query('SELECT COUNT(*) FROM editions;')
    total_works = run_query('SELECT COUNT(*) FROM "scriptureWorks";')

    print(f'Total verses: {int(total_verses):,}')
    print(f'Total editions: {total_editions}')
    print(f'Total works: {total_works}')

    # Test 2: Get verses by edition
    print('\n2️⃣  VERSES BY EDITION')
    print('-' * 60)

    result = run_query('''
        SELECT e.name, COUNT(v.id) as verse_count
        FROM editions e
        LEFT JOIN verses v ON e.id = v."editionId"
        GROUP BY e.id, e.name
        ORDER BY verse_count DESC;
    ''')

    for line in result.split('\n'):
        if line:
            parts = line.split('|')
            if len(parts) == 2:
                name, count = parts
                print(f'{name}: {int(count):,} verses')

    # Test 3: Get Book of Mormon books
    print('\n3️⃣  BOOK OF MORMON BOOKS')
    print('-' * 60)

    result = run_query('''
        SELECT book, COUNT(*) as verse_count, COUNT(DISTINCT chapter) as chapters
        FROM verses
        WHERE "editionId" = 'coc-bom-1908'
        GROUP BY book
        ORDER BY book;
    ''')

    for line in result.split('\n'):
        if line:
            parts = line.split('|')
            if len(parts) == 3:
                book, verses, chapters = parts
                print(f'{book}: {int(verses):,} verses across {chapters} chapters')

    # Test 4: Get sample verses from I Nephi Chapter 1
    print('\n4️⃣  SAMPLE VERSES - I Nephi Chapter 1 (verses 1-5)')
    print('-' * 60)

    result = run_query('''
        SELECT verse, text
        FROM verses
        WHERE "editionId" = 'coc-bom-1908'
          AND book = 'I Nephi'
          AND chapter = 1
          AND verse <= 5
        ORDER BY verse;
    ''')

    for line in result.split('\n'):
        if line:
            parts = line.split('|', 1)
            if len(parts) == 2:
                verse, text = parts
                preview = text[:80] + '...' if len(text) > 80 else text
                print(f'{verse}. {preview}')

    # Test 5: Get D&C sections
    print('\n5️⃣  DOCTRINE & COVENANTS SECTIONS')
    print('-' * 60)

    section_count = run_query('''
        SELECT COUNT(DISTINCT chapter)
        FROM verses
        WHERE "editionId" = 'coc-dc-2017';
    ''')

    section_range = run_query('''
        SELECT MIN(chapter), MAX(chapter)
        FROM verses
        WHERE "editionId" = 'coc-dc-2017';
    ''')

    print(f'Total D&C sections: {section_count}')
    parts = section_range.split('|')
    if len(parts) == 2:
        print(f'Section range: {parts[0]} - {parts[1]}')

    print('Sample sections with verse counts:')
    result = run_query('''
        SELECT chapter, COUNT(*) as verse_count
        FROM verses
        WHERE "editionId" = 'coc-dc-2017'
        GROUP BY chapter
        ORDER BY chapter
        LIMIT 10;
    ''')

    for line in result.split('\n'):
        if line:
            parts = line.split('|')
            if len(parts) == 2:
                section, count = parts
                print(f'  Section {section}: {count} verses')

    # Test 6: Test verse lookup
    print('\n6️⃣  SAMPLE VERSE LOOKUP')
    print('-' * 60)

    result = run_query('''
        SELECT v.book, v.chapter, v.verse, v.text, e.name, e."versificationSystem"
        FROM verses v
        JOIN editions e ON v."editionId" = e.id
        WHERE v."editionId" = 'coc-bom-1908'
          AND v.book = 'I Nephi'
          AND v.chapter = 1
          AND v.verse = 1
        LIMIT 1;
    ''')

    parts = result.split('|')
    if len(parts) == 6:
        book, chapter, verse, text, edition_name, versification = parts
        print(f'Edition: {edition_name} ({versification})')
        print(f'Reference: {book} {chapter}:{verse}')
        print(f'Text: "{text[:100]}..."')

    # Test 7: Get edition details
    print('\n7️⃣  EDITION DETAILS')
    print('-' * 60)

    result = run_query('''
        SELECT
            e.name,
            e.year,
            e.publisher,
            e."versificationSystem",
            e."isPrimary",
            COUNT(v.id) as verse_count,
            w.name as work_name
        FROM editions e
        LEFT JOIN verses v ON e.id = v."editionId"
        LEFT JOIN "scriptureWorks" w ON e."workId" = w.id
        GROUP BY e.id, e.name, e.year, e.publisher, e."versificationSystem", e."isPrimary", w.name
        ORDER BY verse_count DESC;
    ''')

    for line in result.split('\n'):
        if line:
            parts = line.split('|')
            if len(parts) == 7:
                name, year, publisher, versification, is_primary, verse_count, work_name = parts
                print(f'\n{name} ({year})')
                print(f'  Work: {work_name}')
                print(f'  Publisher: {publisher}')
                print(f'  Versification: {versification}')
                print(f'  Verses: {int(verse_count):,}')
                print(f'  Primary: {"Yes" if is_primary == "t" else "No"}')

    # Test 8: Performance test - large query
    print('\n8️⃣  PERFORMANCE TEST - Query large book (Alma)')
    print('-' * 60)

    import time
    start_time = time.time()

    alma_count = run_query('''
        SELECT COUNT(*)
        FROM verses
        WHERE "editionId" = 'coc-bom-1908'
          AND book = 'Alma';
    ''')

    end_time = time.time()
    duration_ms = int((end_time - start_time) * 1000)

    print(f'Counted {int(alma_count):,} verses in {duration_ms}ms')

    # Test 9: Chapter statistics
    print('\n9️⃣  CHAPTER STATISTICS')
    print('-' * 60)

    result = run_query('''
        SELECT
            COUNT(DISTINCT book) as total_books,
            COUNT(DISTINCT CONCAT(book, '-', chapter)) as total_chapters,
            AVG(verse) as avg_verses_per_chapter
        FROM verses
        WHERE "editionId" = 'coc-bom-1908';
    ''')

    parts = result.split('|')
    if len(parts) == 3:
        total_books, total_chapters, avg_verses = parts
        print(f'Total books: {total_books}')
        print(f'Total chapters: {total_chapters}')
        print(f'Average verses per chapter: {float(avg_verses):.1f}')

    print('\n' + '=' * 60)
    print('✅ All tests completed successfully!')
    print('=' * 60 + '\n')

if __name__ == '__main__':
    main()
