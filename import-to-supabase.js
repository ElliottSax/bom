#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires -- standalone CommonJS Node script, not part of the app bundle */
/**
 * Programmatic Scripture Data Import to Supabase
 * Parses SQL INSERT statements and uses Supabase client to insert data
 */

const fs = require('fs');
require('dotenv').config({ path: '.env.supabase' });

// Check if @supabase/supabase-js is installed
let createClient;
try {
  createClient = require('@supabase/supabase-js').createClient;
} catch (e) {
  console.error('❌ @supabase/supabase-js not installed');
  console.error('Run: npm install @supabase/supabase-js');
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Parse SQL INSERT statements
function _parseInserts(sql) {
  const verses = [];

  // Match INSERT INTO verses statements
  const insertRegex = /INSERT INTO verses\s*\([^)]+\)\s*VALUES\s*\(([^;]+)\);/gi;
  let match;

  while ((match = insertRegex.exec(sql)) !== null) {
    const values = match[1];

    // Parse the values (this is simplified - may need refinement for complex data)
    const valueMatches = values.match(/(?:'(?:[^']|'')*'|[^,]+)/g);

    if (valueMatches && valueMatches.length >= 8) {
      const verse = {
        volume_id: valueMatches[0]?.replace(/'/g, '') || '',
        book: valueMatches[1]?.replace(/'/g, '') || '',
        chapter: parseInt(valueMatches[2]) || 0,
        verse: parseInt(valueMatches[3]) || 0,
        text: valueMatches[4]?.replace(/^'|'$/g, '').replace(/''/g, "'") || '',
        reference: valueMatches[5]?.replace(/'/g, '') || '',
        testament: valueMatches[6]?.replace(/'/g, '') || null,
        category: valueMatches[7]?.replace(/'/g, '') || null,
      };

      verses.push(verse);
    }
  }

  return verses;
}

// Better SQL parser using regex for VALUES clauses
function parseInsertsBetter(sql) {
  const verses = [];

  // Split by semicolons to get individual INSERT statements
  const statements = sql.split(/;\s*\n/);

  for (const stmt of statements) {
    if (!stmt.includes('INSERT INTO verses')) continue;

    // Extract the VALUES part
    const valuesMatch = stmt.match(/VALUES\s*\((.*)\)/i);
    if (!valuesMatch) continue;

    const valueString = valuesMatch[1];

    // Parse individual values (handling quoted strings)
    const values = [];
    let current = '';
    let inQuote = false;
    let quoteChar = null;

    for (let i = 0; i < valueString.length; i++) {
      const char = valueString[i];
      const nextChar = valueString[i + 1];

      if ((char === "'" || char === '"') && !inQuote) {
        inQuote = true;
        quoteChar = char;
        continue;
      } else if (char === quoteChar && inQuote) {
        if (nextChar === quoteChar) {
          // Escaped quote
          current += char;
          i++;
          continue;
        } else {
          inQuote = false;
          quoteChar = null;
          continue;
        }
      } else if (char === ',' && !inQuote) {
        values.push(current.trim());
        current = '';
        continue;
      }

      current += char;
    }
    if (current) values.push(current.trim());

    if (values.length >= 8) {
      verses.push({
        volume_id: values[0].replace(/'/g, ''),
        book: values[1].replace(/'/g, ''),
        chapter: parseInt(values[2]) || 0,
        verse: parseInt(values[3]) || 0,
        text: values[4].replace(/^'|'$/g, '').replace(/''/g, "'"),
        reference: values[5].replace(/'/g, ''),
        testament: values[6] === 'NULL' ? null : values[6].replace(/'/g, ''),
        category: values[7] === 'NULL' ? null : values[7].replace(/'/g, ''),
      });
    }
  }

  return verses;
}

// Batch insert with retry logic
async function batchInsert(verses, batchSize = 100) {
  console.log(`\nInserting ${verses.length} verses in batches of ${batchSize}...`);

  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < verses.length; i += batchSize) {
    const batch = verses.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(verses.length / batchSize);

    process.stdout.write(
      `\rBatch ${batchNum}/${totalBatches} (${i + batch.length}/${verses.length})...`
    );

    try {
      const { data: _data, error } = await supabase.from('verses').insert(batch).select();

      if (error) {
        // Try to continue with duplicates (they might already exist)
        if (error.message?.includes('duplicate') || error.code === '23505') {
          // Duplicate key, skip
          inserted += batch.length;
        } else {
          console.error(`\n❌ Error in batch ${batchNum}:`, error.message);
          errors += batch.length;
        }
      } else {
        inserted += batch.length;
      }

      // Small delay to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (err) {
      console.error(`\n❌ Exception in batch ${batchNum}:`, err.message);
      errors += batch.length;
    }
  }

  console.log('\n');
  return { inserted, errors };
}

async function main() {
  console.log('==========================================');
  console.log('BOM Study Tools - Supabase Import');
  console.log('==========================================');
  console.log('');
  console.log('📊 Configuration:');
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Project: ${process.env.SUPABASE_PROJECT_REF}`);
  console.log('');

  // Check if verses table exists
  console.log('🔍 Checking database connection...');
  const { data: _testData, error: testError } = await supabase
    .from('verses')
    .select('count', { count: 'exact', head: true });

  if (testError) {
    console.error('❌ Cannot connect to verses table');
    console.error('Error:', testError.message);
    console.log('');
    console.log('Make sure:');
    console.log('1. Database schema has been migrated');
    console.log('2. verses table exists');
    console.log('3. RLS policies allow INSERT');
    console.log('');
    process.exit(1);
  }

  console.log('✅ Database connection OK');
  console.log('');

  // Read SQL files
  console.log('📖 Reading SQL files...');
  const bomPath = '/tmp/supabase-import/bom.sql';
  const dcPath = '/tmp/supabase-import/dc.sql';

  if (!fs.existsSync(bomPath) || !fs.existsSync(dcPath)) {
    console.error('❌ SQL files not found');
    console.error('Expected:');
    console.error(`  - ${bomPath}`);
    console.error(`  - ${dcPath}`);
    console.log('');
    console.log('Run the SQL combination script first');
    process.exit(1);
  }

  const bomSql = fs.readFileSync(bomPath, 'utf8');
  const dcSql = fs.readFileSync(dcPath, 'utf8');

  console.log(`✅ BOM SQL: ${(bomSql.length / 1024 / 1024).toFixed(2)}MB`);
  console.log(`✅ D&C SQL: ${(dcSql.length / 1024 / 1024).toFixed(2)}MB`);
  console.log('');

  // Parse SQL
  console.log('⚙️  Parsing SQL INSERT statements...');
  const bomVerses = parseInsertsBetter(bomSql);
  const dcVerses = parseInsertsBetter(dcSql);

  console.log(`✅ Parsed ${bomVerses.length} Book of Mormon verses`);
  console.log(`✅ Parsed ${dcVerses.length} D&C verses`);
  console.log(`📊 Total: ${bomVerses.length + dcVerses.length} verses`);
  console.log('');

  // Import Book of Mormon
  console.log('📚 Importing Book of Mormon...');
  const bomResult = await batchInsert(bomVerses);
  console.log(`✅ Inserted: ${bomResult.inserted}`);
  if (bomResult.errors > 0) {
    console.log(`⚠️  Errors: ${bomResult.errors}`);
  }

  // Import D&C
  console.log('📜 Importing Doctrine & Covenants...');
  const dcResult = await batchInsert(dcVerses);
  console.log(`✅ Inserted: ${dcResult.inserted}`);
  if (dcResult.errors > 0) {
    console.log(`⚠️  Errors: ${dcResult.errors}`);
  }

  // Final count
  console.log('');
  console.log('🔍 Verifying import...');
  const { count } = await supabase.from('verses').select('*', { count: 'exact', head: true });

  console.log(`📊 Total verses in database: ${count}`);
  console.log('');
  console.log('==========================================');
  console.log('✅ Import Complete!');
  console.log('==========================================');
}

main().catch((err) => {
  console.error('');
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
