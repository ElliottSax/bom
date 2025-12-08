#!/usr/bin/env tsx
/**
 * Test script to fetch and examine HTML structure
 */

import * as https from 'https';

async function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    });
  });
}

async function main() {
  const url = 'https://www.centerplace.org/hs/dc/section001.htm';
  console.log(`Fetching: ${url}\n`);

  const html = await fetchUrl(url);

  console.log('Raw HTML (first 2000 chars):');
  console.log('='.repeat(80));
  console.log(html.substring(0, 2000));
  console.log('='.repeat(80));

  // Try to extract verses
  const plainText = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ');

  console.log('\n\nPlain text (first 2000 chars):');
  console.log('='.repeat(80));
  console.log(plainText.substring(0, 2000));
  console.log('='.repeat(80));

  // Try regex
  const pattern = /D&C\s+1:(\d+)([a-z]?)\s+([^D&C]+?)(?=\s*D&C\s+1:|\s*$)/gi;
  const matches = [];
  let match;

  while ((match = pattern.exec(plainText)) !== null && matches.length < 5) {
    matches.push({
      verse: match[1],
      suffix: match[2],
      text: match[3].substring(0, 100) + '...'
    });
  }

  console.log('\n\nFirst 5 regex matches:');
  console.log('='.repeat(80));
  console.log(JSON.stringify(matches, null, 2));
}

main().catch(console.error);
