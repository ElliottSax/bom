import os
import requests

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

# Check if verses table exists
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/",
    headers={'apikey': SUPABASE_KEY}
)

print("API Endpoints:", response.json() if response.ok else response.status_code)

# Try to get schema
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/verses?limit=0",
    headers={'apikey': SUPABASE_KEY}
)

print("\nVerses table status:", response.status_code)
if not response.ok:
    print("Error:", response.text)
