#!/usr/bin/env python3
"""
Simple Scripture Import to Supabase
Uses Python's requests library and Supabase REST API
"""

import re
import json
import os
import sys
import time
try:
    import requests
except ImportError:
    print("❌ requests library not installed")
    print("Run: pip3 install requests")
    sys.exit(1)

# Load environment
def load_env():
    env = {}
    try:
        with open('.env.supabase', 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env[key] = value
    except FileNotFoundError:
        print("❌ .env.supabase not found")
        sys.exit(1)
    return env

env = load_env()
SUPABASE_URL = env.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = env.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Missing Supabase credentials")
    sys.exit(1)

API_URL = f"{SUPABASE_URL}/rest/v1/verses"
HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
}

def parse_sql_file(filepath):
    """Parse SQL INSERT statements and extract verse data"""
    verses = []
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all INSERT statements
    # Pattern matches: INSERT INTO verses (columns) VALUES (values);
    pattern = r"INSERT INTO verses\s*\([^)]+\)\s*VALUES\s*\(([^)]+)\)\s*ON CONFLICT"
    matches = re.finditer(pattern, content, re.IGNORECASE | re.DOTALL)

    for match in matches:
        values_str = match.group(1)
        values = []
        current = ''
        in_quote = False
        quote_char = None

        # Parse comma-separated values respecting quotes
        for i, char in enumerate(values_str):
            if char in ("'", '"') and not in_quote:
                in_quote = True
                quote_char = char
            elif char == quote_char and in_quote:
                # Check for escaped quote
                if i + 1 < len(values_str) and values_str[i + 1] == quote_char:
                    current += char
                    i += 1  # Skip next char
                else:
                    in_quote = False
                    quote_char = None
            elif char == ',' and not in_quote:
                values.append(current.strip().strip("'\""))
                current = ''
            else:
                current += char

        if current:
            values.append(current.strip().strip("'\""))

        # Create verse object
        # SQL format: id, editionId, book, chapter, verse, text, verseType (camelCase)
        # DB format: id, edition_id, book, chapter, verse, text, verse_type (snake_case)
        if len(values) >= 7:
            try:
                verse = {
                    'id': values[0],
                    'edition_id': values[1],  # Convert camelCase to snake_case
                    'book': values[2],
                    'chapter': int(values[3]) if values[3].isdigit() else 0,
                    'verse': int(values[4]) if values[4].isdigit() else 0,
                    'text': values[5].replace("''", "'"),
                    'verse_type': values[6] if len(values) > 6 else 'standard'  # Convert camelCase to snake_case
                }
                verses.append(verse)
            except (ValueError, IndexError) as e:
                # Skip malformed entries
                continue

    return verses

def batch_insert(verses, batch_size=50):
    """Insert verses in batches"""
    total = len(verses)
    batches = (total + batch_size - 1) // batch_size
    inserted = 0
    errors = 0

    print(f"\nInserting {total} verses in {batches} batches...")

    for i in range(0, total, batch_size):
        batch = verses[i:i+batch_size]
        batch_num = i // batch_size + 1

        try:
            response = requests.post(
                API_URL,
                headers=HEADERS,
                json=batch,
                timeout=30
            )

            if response.status_code in [200, 201]:
                inserted += len(batch)
                print(f"\rBatch {batch_num}/{batches} ✓ ({inserted}/{total})", end='', flush=True)
            elif response.status_code == 409:  # Conflict (duplicate)
                inserted += len(batch)
                print(f"\rBatch {batch_num}/{batches} ⚠️  (duplicates skipped)", end='', flush=True)
            else:
                errors += len(batch)
                print(f"\rBatch {batch_num}/{batches} ❌ (HTTP {response.status_code})", end='', flush=True)

            # Rate limit delay
            time.sleep(0.2)

        except requests.exceptions.RequestException as e:
            errors += len(batch)
            print(f"\rBatch {batch_num}/{batches} ❌ ({str(e)[:50]})", end='', flush=True)

    print()  # New line
    return inserted, errors

def main():
    print("==========================================")
    print("BOM Study Tools - Supabase Import")
    print("==========================================")
    print()
    print(f"📊 URL: {SUPABASE_URL}")
    print()

    # Test connection
    print("🔍 Testing API connection...")
    try:
        response = requests.get(
            f"{API_URL}?limit=1",
            headers={'apikey': SUPABASE_KEY},
            timeout=10
        )
        if response.status_code not in [200, 206]:
            print(f"❌ API connection failed (HTTP {response.status_code})")
            sys.exit(1)
        print("✅ API connection OK")
    except requests.exceptions.RequestException as e:
        print(f"❌ Connection error: {e}")
        sys.exit(1)

    print()

    # Parse SQL files
    print("📖 Parsing SQL files...")
    bom_path = '/tmp/supabase-import/bom.sql'
    dc_path = '/tmp/supabase-import/dc.sql'

    if not os.path.exists(bom_path) or not os.path.exists(dc_path):
        print("❌ SQL files not found")
        print(f"Expected: {bom_path} and {dc_path}")
        sys.exit(1)

    print("Parsing Book of Mormon...")
    bom_verses = parse_sql_file(bom_path)
    print(f"✅ Parsed {len(bom_verses)} BOM verses")

    print("Parsing Doctrine & Covenants...")
    dc_verses = parse_sql_file(dc_path)
    print(f"✅ Parsed {len(dc_verses)} D&C verses")

    print(f"📊 Total: {len(bom_verses) + len(dc_verses)} verses")

    # Import
    print()
    print("📚 Importing Book of Mormon...")
    bom_ins, bom_err = batch_insert(bom_verses)
    print(f"✅ Inserted: {bom_ins}")
    if bom_err > 0:
        print(f"⚠️  Errors: {bom_err}")

    print()
    print("📜 Importing Doctrine & Covenants...")
    dc_ins, dc_err = batch_insert(dc_verses)
    print(f"✅ Inserted: {dc_ins}")
    if dc_err > 0:
        print(f"⚠️  Errors: {dc_err}")

    # Verify
    print()
    print("🔍 Verifying import...")
    try:
        response = requests.get(
            f"{API_URL}?select=id&limit=0",
            headers={**HEADERS, 'Prefer': 'count=exact'},
            timeout=10
        )
        if 'content-range' in response.headers:
            total_count = response.headers['content-range'].split('/')[-1]
            print(f"📊 Total verses in database: {total_count}")
    except:
        print("⚠️  Could not verify count")

    print()
    print("==========================================")
    print("✅ Import Complete!")
    print("==========================================")

if __name__ == '__main__':
    main()
