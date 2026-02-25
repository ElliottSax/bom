# Scripture Data Import - Final Step

All code is complete! Just need to import the scripture data (11,509 verses).

## Quick Import (2 minutes)

### Option A: All-in-One SQL File (Easiest)

1. Open Supabase SQL Editor:
   ```
   https://supabase.com/dashboard/project/pxcnvcagyvoafytwvngr/sql/new
   ```

2. Copy the entire contents of `complete-import.sql` (2 MB file in this directory)

3. Paste into SQL Editor and click **RUN**

4. Done! The SQL file will:
   - Create temporary INSERT policies
   - Import 8,409 Book of Mormon verses
   - Import 3,100 Doctrine & Covenants verses
   - Remove temporary policies
   - Secure the data

### Option B: Python Script (Recommended for large imports)

1. First, enable INSERT permissions by running this SQL in the editor:
   ```sql
   CREATE POLICY "temp_allow_verse_insert"
     ON verses FOR INSERT
     WITH CHECK (true);

   CREATE POLICY "temp_allow_cross_ref_insert"
     ON cross_references FOR INSERT
     WITH CHECK (true);
   ```

2. Run the Python import script:
   ```bash
   python3 import-simple.py
   ```

3. After import completes, remove the temporary policies:
   ```sql
   DROP POLICY "temp_allow_verse_insert" ON verses;
   DROP POLICY "temp_allow_cross_ref_insert" ON cross_references;
   ```

## Verify Import

```bash
# Check verse count via API
curl "https://pxcnvcagyvoafytwvngr.supabase.co/rest/v1/verses?select=id&limit=0" \
  -H "apikey: $(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.supabase | cut -d= -f2)" \
  -H "Prefer: count=exact"
```

Expected: `content-range: 0-0/11509`

## After Import

Deploy the web app to Vercel:
```bash
cd apps/web
vercel --prod
```

Visit your live app! 🎉

## Troubleshooting

**SQL Editor times out?**
- Use Option B (Python script) instead
- Imports in batches with progress

**Still getting 401 errors?**
- Make sure you ran the policy creation SQL first
- Check that you're logged into the correct Supabase project

**Import succeeds but verse count is 0?**
- Check for SQL errors in the SQL Editor output
- May need to check edition_id foreign key constraints

## Files

- `complete-import.sql` - All-in-one SQL file (2 MB)
- `import-simple.py` - Python import script with progress
- `/tmp/supabase-import/bom.sql` - Book of Mormon only
- `/tmp/supabase-import/dc.sql` - Doctrine & Covenants only
