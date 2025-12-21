#!/usr/bin/env python3
"""
Enhanced GraphQL API for BOM Study Tools with Search Functionality
"""

import http.server
import json
import urllib.parse
import psycopg2
from psycopg2.extras import RealDictCursor
import re

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'port': 5435,
    'database': 'bom_study_tools_dev',
    'user': 'postgres',
    'password': 'postgres'
}

def get_db_connection():
    """Get database connection"""
    return psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)

def parse_graphql_query(query_str):
    """Parse GraphQL query to extract parameters"""
    params = {}

    # Extract editionId
    edition_match = re.search(r'editionId:\s*"([^"]+)"', query_str)
    if edition_match:
        params['editionId'] = edition_match.group(1)

    # Extract book
    book_match = re.search(r'book:\s*"([^"]+)"', query_str)
    if book_match:
        params['book'] = book_match.group(1)

    # Extract chapter
    chapter_match = re.search(r'chapter:\s*(\d+)', query_str)
    if chapter_match:
        params['chapter'] = int(chapter_match.group(1))

    # Extract limit
    limit_match = re.search(r'limit:\s*(\d+)', query_str)
    if limit_match:
        params['limit'] = int(limit_match.group(1))

    # Extract search query
    search_match = re.search(r'query:\s*"([^"]+)"', query_str)
    if search_match:
        params['query'] = search_match.group(1)

    return params

def handle_graphql_query(query_str):
    """Handle GraphQL queries with search support"""

    # Health check
    if 'health' in query_str.lower():
        return {'data': {'health': 'OK'}}

    # Editions query
    if 'editions' in query_str.lower():
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT id, name, "shortName", language, year FROM editions ORDER BY name')
        editions = cur.fetchall()
        cur.close()
        conn.close()
        return {'data': {'editions': editions}}

    # Search query - full text search across verses
    if 'search(' in query_str.lower():
        params = parse_graphql_query(query_str)
        conn = get_db_connection()
        cur = conn.cursor()

        query = params.get('query', '')
        edition_id = params.get('editionId', 'coc-bom-1908')
        limit = params.get('limit', 50)

        if query:
            # Use PostgreSQL's full-text search capabilities
            sql = '''
                SELECT
                    id,
                    "editionId",
                    book,
                    chapter,
                    verse,
                    text,
                    ts_headline('english', text, plainto_tsquery('english', %s),
                               'StartSel=<mark>, StopSel=</mark>') as highlight
                FROM verses
                WHERE "editionId" = %s
                AND to_tsvector('english', text) @@ plainto_tsquery('english', %s)
                ORDER BY book, chapter, verse
                LIMIT %s
            '''
            cur.execute(sql, (query, edition_id, query, limit))
            results = cur.fetchall()
        else:
            results = []

        cur.close()
        conn.close()

        return {'data': {'search': {
            'results': results,
            'totalCount': len(results),
            'query': query,
            'editionId': edition_id
        }}}

    # Verses query with parameters
    if 'verses' in query_str.lower():
        params = parse_graphql_query(query_str)
        conn = get_db_connection()
        cur = conn.cursor()

        # Build dynamic query
        where_clauses = []
        query_params = []

        if params.get('editionId'):
            where_clauses.append('"editionId" = %s')
            query_params.append(params['editionId'])
        else:
            where_clauses.append('"editionId" = %s')
            query_params.append('coc-bom-1908')

        if params.get('book'):
            where_clauses.append('book = %s')
            query_params.append(params['book'])

        if params.get('chapter'):
            where_clauses.append('chapter = %s')
            query_params.append(params['chapter'])

        where_clause = ' AND '.join(where_clauses) if where_clauses else '1=1'
        limit = params.get('limit', 10)

        sql = f'''
            SELECT id, "editionId", book, chapter, verse, text, "verseType"
            FROM verses
            WHERE {where_clause}
            ORDER BY id, verse
            LIMIT %s
        '''
        query_params.append(limit)

        cur.execute(sql, query_params)
        verses = cur.fetchall()
        cur.close()
        conn.close()
        return {'data': {'verses': verses}}

    # Books query with statistics
    if 'books' in query_str.lower():
        params = parse_graphql_query(query_str)
        edition_id = params.get('editionId', 'coc-bom-1908')

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('''
            SELECT
                book,
                COUNT(*) as "verseCount",
                COUNT(DISTINCT chapter) as chapters,
                MIN(chapter) as "firstChapter",
                MAX(chapter) as "lastChapter"
            FROM verses
            WHERE "editionId" = %s
            GROUP BY book
            ORDER BY MIN(id)
        ''', (edition_id,))
        books = cur.fetchall()
        cur.close()
        conn.close()
        return {'data': {'books': books}}

    # Cross-reference query - find equivalent verses across editions
    if 'crossreferences' in query_str.lower() or 'equivalents' in query_str.lower():
        params = parse_graphql_query(query_str)
        conn = get_db_connection()
        cur = conn.cursor()

        verse_id = params.get('verseId')
        if not verse_id:
            # Try to construct from book/chapter/verse
            edition_id = params.get('editionId', 'coc-bom-1908')
            book = params.get('book', 'I Nephi')
            chapter = params.get('chapter', 1)
            verse = params.get('verse', 1)

            cur.execute('''
                SELECT id FROM verses
                WHERE "editionId" = %s AND book = %s AND chapter = %s AND verse = %s
                LIMIT 1
            ''', (edition_id, book, chapter, verse))
            result = cur.fetchone()
            if result:
                verse_id = result['id']

        if verse_id:
            # Find mappings
            sql = '''
                SELECT
                    vm."sourceVerseId",
                    vm."targetVerseId",
                    sv."editionId" as "sourceEdition",
                    sv.book as "sourceBook",
                    sv.chapter as "sourceChapter",
                    sv.verse as "sourceVerse",
                    sv.text as "sourceText",
                    tv."editionId" as "targetEdition",
                    tv.book as "targetBook",
                    tv.chapter as "targetChapter",
                    tv.verse as "targetVerse",
                    tv.text as "targetText"
                FROM verse_mappings vm
                JOIN verses sv ON vm."sourceVerseId" = sv.id
                JOIN verses tv ON vm."targetVerseId" = tv.id
                WHERE vm."sourceVerseId" = %s OR vm."targetVerseId" = %s
            '''
            cur.execute(sql, (verse_id, verse_id))
            mappings = cur.fetchall()
        else:
            mappings = []

        cur.close()
        conn.close()
        return {'data': {'crossReferences': mappings}}

    return {'data': None, 'errors': [{'message': 'Query not recognized'}]}

class GraphQLHandler(http.server.BaseHTTPRequestHandler):
    """HTTP handler for GraphQL with enhanced capabilities"""

    def do_GET(self):
        """Handle GET requests"""
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'healthy'}).encode())
            return

        # Enhanced GraphQL Playground HTML
        if self.path == '/' or self.path == '/graphql':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            html = '''
<!DOCTYPE html>
<html>
<head>
    <title>BOM Study Tools GraphQL</title>
    <style>
        body { font-family: sans-serif; padding: 20px; }
        h1 { color: #333; }
        textarea { width: 100%; min-height: 200px; font-family: monospace; }
        button { padding: 10px 20px; background: #4CAF50; color: white; border: none; cursor: pointer; }
        button:hover { background: #45a049; }
        #result { background: #f4f4f4; padding: 10px; margin-top: 20px; white-space: pre-wrap; }
        .examples { background: #f9f9f9; padding: 10px; margin: 10px 0; border-left: 3px solid #4CAF50; }
        .example-title { font-weight: bold; color: #333; }
    </style>
</head>
<body>
    <h1>📖 BOM Study Tools GraphQL API (Enhanced)</h1>
    <p>Enter your GraphQL query below:</p>

    <div class="examples">
        <div class="example-title">Example Queries:</div>
        <pre>
# Search for verses containing "faith"
{ search(query: "faith", editionId: "coc-bom-1908", limit: 10) {
    results { book chapter verse text highlight }
    totalCount
}}

# Get all editions
{ editions { id name shortName year }}

# Get books with statistics
{ books(editionId: "coc-bom-1908") {
    book verseCount chapters firstChapter lastChapter
}}

# Get specific verses
{ verses(editionId: "coc-bom-1908", book: "I Nephi", chapter: 1, limit: 5) {
    verse text
}}

# Find cross-references (if available)
{ crossReferences(editionId: "coc-bom-1908", book: "III Nephi", chapter: 5, verse: 8) {
    targetEdition targetBook targetChapter targetVerse
}}
        </pre>
    </div>

    <textarea id="query">{ editions { id name shortName year }}</textarea>
    <br><br>
    <button onclick="executeQuery()">Execute Query</button>
    <div id="result"></div>

    <script>
        async function executeQuery() {
            const query = document.getElementById('query').value;
            const result = document.getElementById('result');

            try {
                const response = await fetch('/graphql', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query })
                });

                const data = await response.json();
                result.textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                result.textContent = 'Error: ' + error.message;
            }
        }
    </script>
</body>
</html>
            '''
            self.wfile.write(html.encode())
            return

        self.send_response(404)
        self.end_headers()

    def do_POST(self):
        """Handle POST requests"""
        if self.path == '/graphql':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)

            try:
                data = json.loads(post_data.decode('utf-8'))
                query = data.get('query', '')
                result = handle_graphql_query(query)
            except Exception as e:
                result = {'errors': [{'message': str(e)}]}

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())
            return

        self.send_response(404)
        self.end_headers()

    def do_OPTIONS(self):
        """Handle OPTIONS requests for CORS"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def log_message(self, format, *args):
        """Custom logging"""
        return  # Suppress default logging for cleaner output

if __name__ == '__main__':
    PORT = 4001
    server = http.server.HTTPServer(('localhost', PORT), GraphQLHandler)
    print(f'🚀 Enhanced GraphQL server running at http://localhost:{PORT}/graphql')
    print(f'📖 Features: Full-text search, cross-references, dynamic queries')
    print('Press Ctrl+C to stop')

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n👋 Server stopped')