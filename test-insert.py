import os
import requests
import json

# Load env
env = {}
with open('.env.supabase', 'r') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            key, value = line.split('=', 1)
            env[key] = value

SUPABASE_URL = env.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = env.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')

# Test single insert
test_verse = {
    'id': 'test-verse-1',
    'editionId': 'coc-bom-1908',
    'book': 'Test Book',
    'chapter': 1,
    'verse': 1,
    'text': 'Test verse text',
    'verseType': 'standard'
}

response = requests.post(
    f"{SUPABASE_URL}/rest/v1/verses",
    headers={
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    },
    json=[test_verse]
)

print(f"Status: {response.status_code}")
print(f"Response: {response.text}")

if response.ok:
    print("\n✅ Insert works!")
else:
    print("\n❌ Insert failed")
    print(f"Error details: {response.json() if response.text else 'No details'}")
