// squadchecker/squad-check.js
//
// For each club:
//  1. Load entry.url in a real (headless) browser and wait a couple of
//     seconds for the page's own JS to run - some sites navigate to a new
//     URL client-side after a short delay, rather than via an HTTP redirect,
//     so a plain fetch() would never see it. If the URL after the wait
//     doesn't match entry.redirect, flag as FAIL and skip the player check.
//  2. Otherwise, read all elements matching entry.selector and compare the
//     text found against entry.players. Any mismatch in either direction
//     (missing player, or an extra name on the page not in our list) is FAIL.

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, 'squads.json');

const NAV_TIMEOUT_MS = 20000;
const POST_LOAD_WAIT_MS = 2000; // give the page's own JS time to trigger its URL change
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

async function checkClub(entry, browser) {
  const reasons = [];
  const context = await browser.newContext({ userAgent: USER_AGENT });
  const page = await context.newPage();

  try {
    let res;
    try {
      res = await page.goto(entry.url, {
        waitUntil: 'domcontentloaded',
        timeout: NAV_TIMEOUT_MS,
      });
    } catch (err) {
      return { status: 'FAIL', reasons: [`Navigation failed: ${err.message || 'unknown error'}`] };
    }

    if (res && !res.ok()) {
      return { status: 'FAIL', reasons: [`HTTP ${res.status()} fetching ${entry.url}`] };
    }

    // Give the page's own JS time to fire its delayed navigation.
    await page.waitForTimeout(POST_LOAD_WAIT_MS);

    // Step 1: URL check, read AFTER the wait so a JS-triggered navigation has happened
    const finalUrl = page.url();
    if (normalizeUrl(finalUrl) !== normalizeUrl(entry.redirect)) {
      return {
        status: 'FAIL',
        reasons: [`Redirect mismatch: expected "${entry.redirect}", got "${finalUrl}"`],
      };
    }

    // Step 2: player list check (only runs if the URL matched)
    const onPage = (await page.$$eval(entry.selector, (els) => els.map((el) => el.textContent)))
      .map((t) => (t || '').replace(/\s+/g, ' ').trim())
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
  } finally {
    await context.close();
  }
}

async function main() {
  const raw = await fs.readFile(DATA_PATH, 'utf-8');
  const entries = JSON.parse(raw);

  const browser = await chromium.launch();
  let lastHost = null;

  try {
    for (const entry of entries) {
      const host = hostOf(entry.url);
      if (host && host === lastHost) {
        await sleep(SAME_HOST_DELAY_MS);
      }
      lastHost = host;

      console.log(`Checking ${entry.club} (${entry.url}) ...`);
      const { status, reasons } = await checkClub(entry, browser);

      entry.last_status = status;
      entry.last_check = today();
      entry.last_reason = reasons.length > 0 ? reasons.join('; ') : null;

      console.log(`  -> ${status}`);
      for (const r of reasons) console.log(`     - ${r}`);
    }
  } finally {
    await browser.close();
  }

  await fs.writeFile(DATA_PATH, JSON.stringify(entries, null, 2) + '\n', 'utf-8');
  console.log('squads.json updated.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});