// docs/linkchecker/check.js
//
// Reads docs/linkchecker/urls.json, checks each entry, and writes results back.
//
// Rule: if an entry has an "archive" field, we check THAT url instead of
// "url", and write the result to archive_status/archive_check. Otherwise we
// check "url" and write to last_status/last_check.

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, 'urls.json');

const TIMEOUT_MS = 15000;
const USER_AGENT =
  'Mozilla/5.0 (compatible; LinkCheckerBot/1.0; +https://github.com/) Node.js';

// Minimum gap between two requests to the SAME hostname. Keeps us polite to
// sites that share a domain across many entries and avoids tripping bot/
// rate-limit protection (which would otherwise look like a "broken" link).
const SAME_HOST_DELAY_MS = 1500;

function today() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hostOf(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

// Try HEAD first (cheaper); some servers don't support it properly
// (405, or lie about status), so fall back to GET if HEAD looks unreliable.
async function checkUrl(url) {
  const headers = { 'User-Agent': USER_AGENT };

  try {
    const headRes = await fetchWithTimeout(url, { method: 'HEAD', headers, redirect: 'follow' });
    if (headRes.status !== 405 && headRes.status !== 501) {
      return statusLabel(headRes.status);
    }
  } catch {
    // fall through to GET
  }

  try {
    const getRes = await fetchWithTimeout(url, { method: 'GET', headers, redirect: 'follow' });
    return statusLabel(getRes.status);
  } catch (err) {
    return `ERROR: ${err.message || 'network error'}`;
  }
}

function statusLabel(httpStatus) {
  if (httpStatus === 404) return '404';
  if (httpStatus === 429) return 'RATE_LIMITED'; // don't treat as broken - we got throttled, not a real 404
  if (httpStatus >= 200 && httpStatus < 400) return 'OKAY';
  return `ERROR: HTTP ${httpStatus}`;
}

async function main() {
  const raw = await fs.readFile(DATA_PATH, 'utf-8');
  const entries = JSON.parse(raw);

  let lastHost = null;

  for (const entry of entries) {
    const target = entry.archive || entry.url;
    const host = hostOf(target);

    // Only pause when we're about to hit the same host again back-to-back;
    // no need to slow down when moving to a different domain.
    if (host && host === lastHost) {
      await sleep(SAME_HOST_DELAY_MS);
    }
    lastHost = host;

    console.log(`Checking ${entry.archive ? '(archive) ' : ''}${target} ...`);

    const status = await checkUrl(target);

    if (entry.archive) {
      entry.archive_status = status;
      entry.archive_check = today();
    } else {
      entry.last_status = status;
      entry.last_check = today();
    }

    console.log(`  -> ${status}`);
  }

  await fs.writeFile(DATA_PATH, JSON.stringify(entries, null, 2) + '\n', 'utf-8');
  console.log('urls.json updated.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});