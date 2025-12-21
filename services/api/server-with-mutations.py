#!/usr/bin/env python3
"""
Full-featured GraphQL API for BOM Study Tools
Includes: Search, User Features (highlights, notes), Mutations
"""

import http.server
import json
import urllib.parse
import psycopg2
from psycopg2.extras import RealDictCursor
import re
import uuid
from datetime import datetime

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

    # Extract various parameters
    patterns = {
        'editionId': r'editionId:\s*"([^"]+)"',
        'book': r'book:\s*"([^"]+)"',
        'chapter': r'chapter:\s*(\d+)',
        'verse': r'verse:\s*(\d+)',
        'limit': r'limit:\s*(\d+)',
        'query': r'query:\s*"([^"]+)"',
        'userId': r'userId:\s*"([^"]+)"',
        'verseId': r'verseId:\s*"([^"]+)"',
        'color': r'color:\s*"([^"]+)"',
        'content': r'content:\s*"([^"]+)"',
        'id': r'id:\s*"([^"]+)"',
        'tags': r'tags:\s*\[([^\]]+)\]'
    }

    for key, pattern in patterns.items():
        match = re.search(pattern, query_str)
        if match:
            if key in ['chapter', 'verse', 'limit']:
                params[key] = int(match.group(1))
            elif key == 'tags':
                # Parse array of tags
                tags_str = match.group(1)
                tags = re.findall(r'"([^"]+)"', tags_str)
                params[key] = tags
            else:
                params[key] = match.group(1)

    return params

def handle_graphql_query(query_str):
    """Handle GraphQL queries and mutations"""

    # Health check
    if 'health' in query_str.lower():
        return {'data': {'health': 'OK'}}

    # ============ QUERIES ============

    # Editions query
    if 'editions' in query_str.lower() and 'mutation' not in query_str.lower():
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT id, name, "shortName", language, year FROM editions ORDER BY name')
        editions = cur.fetchall()
        cur.close()
        conn.close()
        return {'data': {'editions': editions}}

    # Search query
    if 'search(' in query_str.lower():
        params = parse_graphql_query(query_str)
        conn = get_db_connection()
        cur = conn.cursor()

        query = params.get('query', '')
        edition_id = params.get('editionId', 'coc-bom-1908')
        limit = params.get('limit', 50)

        if query:
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

    # User highlights query
    if 'highlights(' in query_str.lower() or 'userHighlights' in query_str.lower():
        params = parse_graphql_query(query_str)
        user_id = params.get('userId', 'demo-user')

        conn = get_db_connection()
        cur = conn.cursor()

        sql = '''
            SELECT
                h.id,
                h."userId",
                h."verseId",
                h.color,
                h."createdAt",
                v."editionId",
                v.book,
                v.chapter,
                v.verse,
                v.text
            FROM highlights h
            JOIN verses v ON h."verseId" = v.id
            WHERE h."userId" = %s
            ORDER BY v.book, v.chapter, v.verse
        '''
        cur.execute(sql, (user_id,))
        highlights = cur.fetchall()

        # Convert datetime to string
        for highlight in highlights:
            if highlight.get('createdAt'):
                highlight['createdAt'] = highlight['createdAt'].isoformat()

        cur.close()
        conn.close()
        return {'data': {'highlights': highlights}}

    # User notes query
    if 'notes(' in query_str.lower() or 'userNotes' in query_str.lower():
        params = parse_graphql_query(query_str)
        user_id = params.get('userId', 'demo-user')

        conn = get_db_connection()
        cur = conn.cursor()

        sql = '''
            SELECT
                n.id,
                n."userId",
                n."verseId",
                n.content,
                n.tags,
                n."createdAt",
                n."updatedAt",
                v."editionId",
                v.book,
                v.chapter,
                v.verse,
                v.text
            FROM notes n
            JOIN verses v ON n."verseId" = v.id
            WHERE n."userId" = %s
            ORDER BY n."createdAt" DESC
        '''
        cur.execute(sql, (user_id,))
        notes = cur.fetchall()

        # Convert datetime to string
        for note in notes:
            if note.get('createdAt'):
                note['createdAt'] = note['createdAt'].isoformat()
            if note.get('updatedAt'):
                note['updatedAt'] = note['updatedAt'].isoformat()

        cur.close()
        conn.close()
        return {'data': {'notes': notes}}

    # Verses query
    if 'verses' in query_str.lower() and 'mutation' not in query_str.lower():
        params = parse_graphql_query(query_str)
        conn = get_db_connection()
        cur = conn.cursor()

        where_clauses = []
        query_params = []

        edition_id = params.get('editionId', 'coc-bom-1908')
        where_clauses.append('"editionId" = %s')
        query_params.append(edition_id)

        if params.get('book'):
            where_clauses.append('book = %s')
            query_params.append(params['book'])

        if params.get('chapter'):
            where_clauses.append('chapter = %s')
            query_params.append(params['chapter'])

        where_clause = ' AND '.join(where_clauses)
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

    # Books query
    if 'books' in query_str.lower() and 'mutation' not in query_str.lower():
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

    # ============ MUTATIONS ============

    # Add highlight mutation
    if 'mutation' in query_str.lower() and 'addHighlight' in query_str:
        params = parse_graphql_query(query_str)
        user_id = params.get('userId', 'demo-user')
        verse_id = params.get('verseId')
        color = params.get('color', 'yellow')

        if not verse_id:
            return {'errors': [{'message': 'verseId is required'}]}

        conn = get_db_connection()
        cur = conn.cursor()

        # Generate unique ID
        highlight_id = f"highlight_{uuid.uuid4().hex[:8]}"

        try:
            # Insert or update highlight
            sql = '''
                INSERT INTO highlights (id, "userId", "verseId", color, "updatedAt")
                VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP)
                ON CONFLICT ("userId", "verseId")
                DO UPDATE SET color = EXCLUDED.color, "updatedAt" = CURRENT_TIMESTAMP
                RETURNING id, "userId", "verseId", color, "createdAt"
            '''
            cur.execute(sql, (highlight_id, user_id, verse_id, color))
            result = cur.fetchone()
            conn.commit()

            if result and result.get('createdAt'):
                result['createdAt'] = result['createdAt'].isoformat()

            cur.close()
            conn.close()
            return {'data': {'addHighlight': result}}

        except Exception as e:
            conn.rollback()
            cur.close()
            conn.close()
            return {'errors': [{'message': str(e)}]}

    # Remove highlight mutation
    if 'mutation' in query_str.lower() and 'removeHighlight' in query_str:
        params = parse_graphql_query(query_str)
        user_id = params.get('userId', 'demo-user')
        verse_id = params.get('verseId')

        if not verse_id:
            return {'errors': [{'message': 'verseId is required'}]}

        conn = get_db_connection()
        cur = conn.cursor()

        try:
            sql = 'DELETE FROM highlights WHERE "userId" = %s AND "verseId" = %s RETURNING id'
            cur.execute(sql, (user_id, verse_id))
            result = cur.fetchone()
            conn.commit()

            cur.close()
            conn.close()

            success = result is not None
            return {'data': {'removeHighlight': {'success': success}}}

        except Exception as e:
            conn.rollback()
            cur.close()
            conn.close()
            return {'errors': [{'message': str(e)}]}

    # Add note mutation
    if 'mutation' in query_str.lower() and 'addNote' in query_str:
        params = parse_graphql_query(query_str)
        user_id = params.get('userId', 'demo-user')
        verse_id = params.get('verseId')
        content = params.get('content')
        tags = params.get('tags', [])

        if not verse_id or not content:
            return {'errors': [{'message': 'verseId and content are required'}]}

        conn = get_db_connection()
        cur = conn.cursor()

        # Generate unique ID
        note_id = f"note_{uuid.uuid4().hex[:8]}"

        try:
            sql = '''
                INSERT INTO notes (id, "userId", "verseId", content, tags, "updatedAt")
                VALUES (%s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
                RETURNING id, "userId", "verseId", content, tags, "createdAt"
            '''
            cur.execute(sql, (note_id, user_id, verse_id, content, tags))
            result = cur.fetchone()
            conn.commit()

            if result and result.get('createdAt'):
                result['createdAt'] = result['createdAt'].isoformat()

            cur.close()
            conn.close()
            return {'data': {'addNote': result}}

        except Exception as e:
            conn.rollback()
            cur.close()
            conn.close()
            return {'errors': [{'message': str(e)}]}

    # Update note mutation
    if 'mutation' in query_str.lower() and 'updateNote' in query_str:
        params = parse_graphql_query(query_str)
        note_id = params.get('id')
        content = params.get('content')
        tags = params.get('tags')

        if not note_id:
            return {'errors': [{'message': 'Note ID is required'}]}

        conn = get_db_connection()
        cur = conn.cursor()

        try:
            if content and tags is not None:
                sql = '''
                    UPDATE notes
                    SET content = %s, tags = %s, "updatedAt" = CURRENT_TIMESTAMP
                    WHERE id = %s
                    RETURNING id, "userId", "verseId", content, tags, "updatedAt"
                '''
                cur.execute(sql, (content, tags, note_id))
            elif content:
                sql = '''
                    UPDATE notes
                    SET content = %s, "updatedAt" = CURRENT_TIMESTAMP
                    WHERE id = %s
                    RETURNING id, "userId", "verseId", content, tags, "updatedAt"
                '''
                cur.execute(sql, (content, note_id))
            elif tags is not None:
                sql = '''
                    UPDATE notes
                    SET tags = %s, "updatedAt" = CURRENT_TIMESTAMP
                    WHERE id = %s
                    RETURNING id, "userId", "verseId", content, tags, "updatedAt"
                '''
                cur.execute(sql, (tags, note_id))

            result = cur.fetchone()
            conn.commit()

            if result and result.get('updatedAt'):
                result['updatedAt'] = result['updatedAt'].isoformat()

            cur.close()
            conn.close()
            return {'data': {'updateNote': result}}

        except Exception as e:
            conn.rollback()
            cur.close()
            conn.close()
            return {'errors': [{'message': str(e)}]}

    # Delete note mutation
    if 'mutation' in query_str.lower() and 'deleteNote' in query_str:
        params = parse_graphql_query(query_str)
        note_id = params.get('id')

        if not note_id:
            return {'errors': [{'message': 'Note ID is required'}]}

        conn = get_db_connection()
        cur = conn.cursor()

        try:
            sql = 'DELETE FROM notes WHERE id = %s RETURNING id'
            cur.execute(sql, (note_id,))
            result = cur.fetchone()
            conn.commit()

            cur.close()
            conn.close()

            success = result is not None
            return {'data': {'deleteNote': {'success': success}}}

        except Exception as e:
            conn.rollback()
            cur.close()
            conn.close()
            return {'errors': [{'message': str(e)}]}

    return {'data': None, 'errors': [{'message': 'Query not recognized'}]}

class GraphQLHandler(http.server.BaseHTTPRequestHandler):
    """HTTP handler for full-featured GraphQL"""

    def do_GET(self):
        """Handle GET requests"""
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'healthy'}).encode())
            return

        # GraphQL Playground with mutations
        if self.path == '/' or self.path == '/graphql':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            html = '''
<!DOCTYPE html>
<html>
<head>
    <title>BOM Study Tools GraphQL - Full Featured</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; background: #f5f5f5; }
        h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        .container { max-width: 1200px; margin: 0 auto; }
        textarea { width: 100%; min-height: 300px; font-family: 'Monaco', 'Menlo', monospace; border: 1px solid #ddd; padding: 10px; }
        button { padding: 12px 24px; background: #3498db; color: white; border: none; cursor: pointer; font-size: 16px; border-radius: 4px; }
        button:hover { background: #2980b9; }
        #result { background: white; padding: 15px; margin-top: 20px; white-space: pre-wrap; border: 1px solid #ddd; border-radius: 4px; font-family: monospace; }
        .examples { background: white; padding: 15px; margin: 20px 0; border-left: 4px solid #3498db; border-radius: 4px; }
        .example-title { font-weight: bold; color: #2c3e50; margin-bottom: 10px; }
        .feature-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px; margin: 20px 0; }
        .feature { background: white; padding: 10px; border-radius: 4px; border: 1px solid #e0e0e0; }
        .feature-title { font-weight: bold; color: #3498db; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📖 BOM Study Tools GraphQL API</h1>
        <p><strong>Full-Featured API with Search, User Features, and Mutations</strong></p>

        <div class="feature-list">
            <div class="feature">
                <div class="feature-title">🔍 Search</div>
                Full-text search with highlighting
            </div>
            <div class="feature">
                <div class="feature-title">🎨 Highlights</div>
                Add/remove verse highlights
            </div>
            <div class="feature">
                <div class="feature-title">📝 Notes</div>
                Create, update, delete notes
            </div>
            <div class="feature">
                <div class="feature-title">📚 Editions</div>
                Multiple scripture editions
            </div>
            <div class="feature">
                <div class="feature-title">🏷️ Tags</div>
                Organize notes with tags
            </div>
            <div class="feature">
                <div class="feature-title">👤 User Data</div>
                Personal study features
            </div>
        </div>

        <div class="examples">
            <div class="example-title">Example Queries & Mutations:</div>
            <pre>
# 🔍 Search for verses
{ search(query: "faith", editionId: "coc-bom-1908", limit: 5) {
    results { book chapter verse text highlight }
    totalCount
}}

# 📖 Get verses
{ verses(editionId: "coc-bom-1908", book: "Alma", chapter: 5, limit: 10) {
    id verse text
}}

# 🎨 Get user highlights
{ highlights(userId: "demo-user") {
    id verseId color book chapter verse text
}}

# 📝 Get user notes
{ notes(userId: "demo-user") {
    id verseId content tags book chapter verse createdAt
}}

# === MUTATIONS ===

# 🎨 Add highlight
mutation {
  addHighlight(userId: "demo-user", verseId: "coc-bom-1908:alma-5-1", color: "yellow") {
    id verseId color
  }
}

# 📝 Add note
mutation {
  addNote(
    userId: "demo-user",
    verseId: "coc-bom-1908:alma-5-1",
    content: "Powerful verse about faith",
    tags: ["faith", "testimony"]
  ) {
    id content tags createdAt
  }
}

# ✏️ Update note
mutation {
  updateNote(id: "note_12345", content: "Updated content", tags: ["faith"]) {
    id content tags updatedAt
  }
}

# 🗑️ Delete note
mutation {
  deleteNote(id: "note_12345") {
    success
  }
}

# ❌ Remove highlight
mutation {
  removeHighlight(userId: "demo-user", verseId: "coc-bom-1908:alma-5-1") {
    success
  }
}
            </pre>
        </div>

        <textarea id="query">{ editions { id name shortName year }}</textarea>
        <br><br>
        <button onclick="executeQuery()">Execute Query</button>
        <div id="result"></div>
    </div>

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

                // Highlight errors in red
                if (data.errors) {
                    result.style.color = '#e74c3c';
                } else {
                    result.style.color = '#2c3e50';
                }
            } catch (error) {
                result.textContent = 'Error: ' + error.message;
                result.style.color = '#e74c3c';
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
        return  # Suppress default logging

if __name__ == '__main__':
    PORT = 4002
    server = http.server.HTTPServer(('localhost', PORT), GraphQLHandler)
    print(f'🚀 Full-Featured GraphQL server running at http://localhost:{PORT}/graphql')
    print(f'📖 Features:')
    print(f'  • Full-text search with highlighting')
    print(f'  • User highlights (add/remove)')
    print(f'  • Notes with tags (CRUD operations)')
    print(f'  • Multiple scripture editions')
    print(f'  • GraphQL mutations')
    print('Press Ctrl+C to stop')

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n👋 Server stopped')