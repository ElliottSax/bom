#!/usr/bin/env python3
"""
Direct test of search functionality
"""

import psycopg2
import re

# Test the query extraction
test_query = '{ searchVerses(query: "faith") { text } }'
print(f"Test query: {test_query}")

# Check if search is in query
if 'searchverses' in test_query.lower():
    print("Found searchverses in query")

    # Extract query parameter
    query_match = re.search(r'query:\s*"([^"]*)"', test_query)
    if query_match:
        search_term = query_match.group(1)
        print(f"Extracted search term: '{search_term}'")
    else:
        print("No query match found")
        search_term = None

# Test database search
if search_term:
    try:
        conn = psycopg2.connect(
            dbname='bom_study_tools_dev',
            user='postgres',
            password='postgres',
            host='localhost',
            port='5435'
        )
        cur = conn.cursor()

        # Build and execute query
        sql = '''
            SELECT id, "editionId", book, chapter, verse, text
            FROM verses
            WHERE LOWER(text) LIKE LOWER(%s)
            LIMIT 5
        '''

        param = f'%{search_term}%'
        print(f"SQL parameter: {param}")

        cur.execute(sql, (param,))
        results = cur.fetchall()

        print(f"\nFound {len(results)} results")

        for row in results:
            verse_id, edition, book, chapter, verse_num, text = row
            has_term = search_term.lower() in text.lower()
            print(f"  {book} {chapter}:{verse_num} - Contains '{search_term}': {has_term}")
            if has_term:
                # Find the position of the term
                idx = text.lower().find(search_term.lower())
                snippet = text[max(0, idx-20):min(len(text), idx+30)]
                print(f"    '...{snippet}...'")

        cur.close()
        conn.close()

    except Exception as e:
        print(f"Database error: {e}")