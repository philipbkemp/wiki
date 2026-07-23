// squadchecker/check.js
//
// For each club:
//  1. Fetch entry.url and follow redirects. If the FINAL url doesn't match
//     entry.redirect, flag as FAIL immediately (redirect changed - season
//     rollover, URL restructure, etc.) and skip the player check.
//  2. Otherwise, parse the final page's HTML, select all elements matching
//     entry.selector, and compare the text found against entry.players.
//     Any mismatch in either direction (missing player, or an extra name on
//     the page not in our list) is a FAIL.
//
// NOTE: this only sees what's in the raw HTML response. If the site renders
// the squad list via client-side JS, the names won't be in the fetched HTML
// and this approach won't work - you'd need a headless browser instead.

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, 'squads.json');

const TIMEOUT_MS = 20000;
const USER_AGENT =
  'Mozilla/5.0 (compatible; SquadCheckerBot/1.0; +https://github.com/) Node.js';

// Minimum gap between two requests to the same hostname.
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

function normalizeUrl(url) {
  // Ignore trailing slash and query string differences when comparing.
  try {
    const u = new URL(url);
    u.hash = '';
    let s = u.origin + u.pathname;
    if (s.endsWith('/') && s.length > 1) s = s.slice(0, -1);
    return s;
  } catch {
    return url;
  }
}

function normalizeName(name) {
  return name.replace(/\s+/g, ' ').trim().toLowerCase();
}

async function checkClub(entry) {
  const reasons = [];

  let res;
  try {
    res = await fetchWithTimeout(entry.url, {
      method: 'GET',
      headers: { 'User-Agent': USER_AGENT },
      redirect: 'follow',
    });
  } catch (err) {
    return { status: 'FAIL', reasons: [`Request failed: ${err.message || 'network error'}`] };
  }

  if (!res.ok) {
    return { status: 'FAIL', reasons: [`HTTP ${res.status} fetching ${entry.url}`] };
  }

  // Step 1: redirect check
  const finalUrl = res.url; // fetch sets this to the final URL after following redirects
  if (normalizeUrl(finalUrl) !== normalizeUrl(entry.redirect)) {
    return {
      status: 'FAIL',
      reasons: [`Redirect mismatch: expected "${entry.redirect}", got "${finalUrl}"`],
    };
  }

  // Step 2: player list check (only runs if redirect matched)
  const html = await res.text();
  const $ = cheerio.load(html);

  const onPage = $(entry.selector)
    .map((_, el) => $(el).text())
    .get()
    .map((t) => t.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  const expectedSet = new Set(entry.players.map(normalizeName));
  const onPageSet = new Set(onPage.map(normalizeName));

  const missing = entry.players.filter((p) => !onPageSet.has(normalizeName(p)));
  const unexpected = onPage.filter((p) => !expectedSet.has(normalizeName(p)));

  if (missing.length > 0) {
    reasons.push(`Missing from page: ${missing.join(', ')}`);
  }
  if (unexpected.length > 0) {
    reasons.push(`Found on page but not in players list: ${unexpected.join(', ')}`);
  }
  if (onPage.length === 0) {
    reasons.push(`Selector "${entry.selector}" matched no elements - check it's still correct`);
  }

  return { status: reasons.length === 0 ? 'OKAY' : 'FAIL', reasons };
}

async function main() {
  const raw = await fs.readFile(DATA_PATH, 'utf-8');
  const entries = JSON.parse(raw);

  let lastHost = null;

  for (const entry of entries) {
    const host = hostOf(entry.url);
    if (host && host === lastHost) {
      await sleep(SAME_HOST_DELAY_MS);
    }
    lastHost = host;

    console.log(`Checking ${entry.club} (${entry.url}) ...`);
    const { status, reasons } = await checkClub(entry);

    entry.last_status = status;
    entry.last_check = today();

    console.log(`  -> ${status}`);
    for (const r of reasons) console.log(`     - ${r}`);
  }

  await fs.writeFile(DATA_PATH, JSON.stringify(entries, null, 2) + '\n', 'utf-8');
  console.log('squads.json updated.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});