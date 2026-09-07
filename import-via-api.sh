#!/bin/bash
# Import scripture data to Supabase using REST API
# No npm dependencies needed - uses curl

set -e

source .env.supabase

echo "=========================================="
echo "BOM Study Tools - API Import"
echo "=========================================="
echo ""

API_URL="${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/verses"
API_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY}"

# Test connection
echo "🔍 Testing API connection..."
response=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "apikey: $API_KEY" \
  -H "Authorization: Bearer $API_KEY" \
  "$API_URL?limit=1")

if [ "$response" != "200" ] && [ "$response" != "206" ]; then
  echo "❌ API connection failed (HTTP $response)"
  echo "Check your Supabase credentials"
  exit 1
fi

echo "✅ API connection OK"
echo ""

# Parse SQL and convert to JSON for API
echo "⚙️  Converting SQL to JSON..."

# This is a simplified parser - for production, use the Node.js version
# For now, let's create a Python script to do the heavy lifting

cat > /tmp/sql-to-json.py << 'PYTHON'
import re
import json
import sys

def parse_insert(sql_file):
    verses = []
    with open(sql_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all INSERT statements
    pattern = r"INSERT INTO verses\s*\([^)]+\)\s*VALUES\s*\(([^;]+)\);"
    matches = re.finditer(pattern, content, re.IGNORECASE | re.DOTALL)

    for match in matches:
        values_str = match.group(1)

        # Parse values (simplified)
        values = []
        current = ''
        in_quote = False
        quote_char = None

        for i, char in enumerate(values_str):
            if char in ("'", '"') and not in_quote:
                in_quote = True
                quote_char = char
            elif char == quote_char and in_quote:
                if i + 1 < len(values_str) and values_str[i + 1] == quote_char:
                    current += char
                    continue
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

        if len(values) >= 8:
            verse = {
                'volume_id': values[0],
                'book': values[1],
                'chapter': int(values[2]) if values[2].isdigit() else 0,
                'verse': int(values[3]) if values[3].isdigit() else 0,
                'text': values[4].replace("''", "'"),
                'reference': values[5],
                'testament': None if values[6] == 'NULL' else values[6],
                'category': None if values[7] == 'NULL' else values[7]
            }
            verses.append(verse)

    return verses

if __name__ == '__main__':
    sql_file = sys.argv[1]
    verses = parse_insert(sql_file)
    print(json.dumps(verses))
PYTHON

echo "📖 Parsing BOM SQL..."
python3 /tmp/sql-to-json.py /tmp/supabase-import/bom.sql > /tmp/bom-verses.json
bom_count=$(jq '. | length' /tmp/bom-verses.json)
echo "✅ Parsed $bom_count verses"

echo "📜 Parsing D&C SQL..."
python3 /tmp/sql-to-json.py /tmp/supabase-import/dc.sql > /tmp/dc-verses.json
dc_count=$(jq '. | length' /tmp/dc-verses.json)
echo "✅ Parsed $dc_count verses"

echo ""
echo "📊 Total verses to import: $((bom_count + dc_count))"
echo ""

# Function to batch import via API
import_batch() {
  local file=$1
  local batch_size=100
  local total=$(jq '. | length' "$file")
  local batches=$((total / batch_size + 1))

  echo "Importing $total verses in $batches batches..."

  for ((i=0; i<total; i+=batch_size)); do
    batch_num=$((i / batch_size + 1))

    # Extract batch
    batch=$(jq ".[$i:$((i+batch_size))]" "$file")

    # Send to API
    response=$(curl -s -w "\n%{http_code}" \
      -X POST \
      -H "Content-Type: application/json" \
      -H "apikey: $API_KEY" \
      -H "Authorization: Bearer $API_KEY" \
      -H "Prefer: return=minimal" \
      -d "$batch" \
      "$API_URL")

    http_code=$(echo "$response" | tail -n1)

    if [ "$http_code" = "201" ] || [ "$http_code" = "200" ]; then
      echo -ne "\rBatch $batch_num/$batches ✓"
    else
      echo ""
      echo "⚠️  Batch $batch_num failed (HTTP $http_code)"
      # Continue anyway - might be duplicates
    fi

    # Small delay to avoid rate limits
    sleep 0.2
  done

  echo ""
}

# Import BOM
echo "📚 Importing Book of Mormon..."
import_batch /tmp/bom-verses.json

# Import D&C
echo "📜 Importing Doctrine & Covenants..."
import_batch /tmp/dc-verses.json

echo ""
echo "✅ Import complete!"
echo ""
echo "🔍 Verifying..."
count_response=$(curl -s -H "apikey: $API_KEY" -H "Prefer: count=exact" "$API_URL?select=id&limit=0")
total_count=$(echo "$count_response" | jq -r '.count // 0')
echo "📊 Total verses in database: $total_count"
echo ""
echo "=========================================="
echo "✅ Done!"
echo "=========================================="
