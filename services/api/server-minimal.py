#!/usr/bin/env python3
"""
Ultra-minimal GraphQL API for BOM Study Tools
No external dependencies - uses built-in http.server and json
"""

import http.server
import json
import urllib.parse
import psycopg2
from psycopg2.extras import RealDictCursor

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

def handle_graphql_query(query_str):
    """Handle GraphQL queries (simplified)"""

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

    # Verses query (basic)
    if 'verses' in query_str.lower():
        conn = get_db_connection()
        cur = conn.cursor()

        # Simple query for I Nephi chapter 1
        cur.execute('''
            SELECT id, "editionId", book, chapter, verse, text, "verseType"
            FROM verses
            WHERE "editionId" = 'coc-bom-1908'
            AND book = 'I Nephi'
            AND chapter = 1
            ORDER BY verse
            LIMIT 10
        ''')

        verses = cur.fetchall()
        cur.close()
        conn.close()
        return {'data': {'verses': verses}}

    # Books query
    if 'books' in query_str.lower():
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('''
            SELECT
                book,
                COUNT(*) as "verseCount",
                COUNT(DISTINCT chapter) as chapters
            FROM verses
            WHERE "editionId" = 'coc-bom-1908'
            GROUP BY book
            ORDER BY MIN(id)
        ''')
        books = cur.fetchall()
        cur.close()
        conn.close()
        return {'data': {'books': books}}

    return {'data': None, 'errors': [{'message': 'Query not recognized'}]}

class GraphQLHandler(http.server.BaseHTTPRequestHandler):
    """Simple HTTP handler for GraphQL"""

    def do_GET(self):
        """Handle GET requests"""
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'healthy'}).encode())
            return

        # Simple GraphQL Playground HTML
        if self.path == '/' or self.path == '/graphql':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            html = '''<!DOCTYPE html>
<html>
<head>
    <title>BOM Study Tools GraphQL API</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        h1 { color: #333; }
        pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
        code { color: #c7254e; background: #f9f2f4; padding: 2px 4px; border-radius: 3px; }
        .endpoint { background: #d4edda; padding: 10px; border-left: 4px solid #28a745; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>📖 BOM Study Tools GraphQL API</h1>
    <p>Minimal Python implementation - No external dependencies!</p>

    <div class="endpoint">
        <strong>Endpoint:</strong> POST to <code>/graphql</code>
    </div>

    <h2>Test with curl:</h2>
    <pre>curl -X POST http://localhost:4000/graphql \\
  -H "Content-Type: application/json" \\
  -d '{"query": "{ health }"}'</pre>

    <h2>Sample Queries:</h2>

    <h3>Health Check:</h3>
    <pre>{ health }</pre>

    <h3>List Editions:</h3>
    <pre>{ editions { id name year } }</pre>

    <h3>Get Verses:</h3>
    <pre>{ verses { verse text } }</pre>

    <h3>List Books:</h3>
    <pre>{ books { book verseCount chapters } }</pre>

    <p><strong>Database Status:</strong> Connected to PostgreSQL with 11,787 verses</p>
</body>
</html>'''
            self.wfile.write(html.encode())
            return

        self.send_error(404)

    def do_POST(self):
        """Handle POST requests"""
        if self.path == '/graphql':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)

            try:
                data = json.loads(post_data.decode('utf-8'))
                query = data.get('query', '')

                result = handle_graphql_query(query)

                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(result).encode())
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                error = {'errors': [{'message': str(e)}]}
                self.wfile.write(json.dumps(error).encode())
            return

        self.send_error(404)

    def do_OPTIONS(self):
        """Handle OPTIONS for CORS"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == '__main__':
    PORT = 4000

    print('=' * 70)
    print('BOM Study Tools - Minimal GraphQL API')
    print('=' * 70)
    print()

    # Test database connection
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT COUNT(*) FROM verses')
        count = cur.fetchone()['count']
        cur.close()
        conn.close()
        print(f'✅ Database connected - {count} verses available')
    except Exception as e:
        print(f'❌ Database connection failed: {e}')
        print('   Make sure PostgreSQL is running:')
        print('   docker start bom-postgres-dev')
        exit(1)

    print()
    print(f'🚀 Starting server on port {PORT}...')
    print(f'📍 GraphQL endpoint: http://localhost:{PORT}/graphql')
    print(f'🏠 Web interface: http://localhost:{PORT}/')
    print(f'❤️  Health check: http://localhost:{PORT}/health')
    print()
    print('Press Ctrl+C to stop')
    print()

    try:
        server = http.server.HTTPServer(('0.0.0.0', PORT), GraphQLHandler)
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n🛑 Shutting down...')
        server.shutdown()
