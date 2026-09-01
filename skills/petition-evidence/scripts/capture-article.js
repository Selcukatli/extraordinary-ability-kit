/**
 * Reusable Puppeteer script for capturing full-page article screenshots.
 *
 * Setup (one-time):
 *   cd /tmp/evidence-capture && npm install puppeteer
 *
 * Usage:
 *   cd /tmp/evidence-capture && node /path/to/capture-article.js
 *
 * Configure the ARTICLES array below with URLs and filenames,
 * then run. Screenshots are saved directly to resources/press/articles/.
 */

const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

// === CONFIGURE THESE ===

// Where captures land. Override with OUTPUT_DIR=... or pass as the last CLI arg.
const OUTPUT_DIR =
  process.env.OUTPUT_DIR ||
  (() => {
    throw new Error(
      "Set OUTPUT_DIR to your case workspace's capture directory, " +
        "e.g. OUTPUT_DIR=./resources/press/articles"
    );
  })();

const ARTICLES = [
  // Standard articles (live URLs)
  // { url: "https://example.com/article", filename: "publication-subject-year.png" },

  // Wayback Machine articles (dead/paywalled sites)
  // { url: "https://web.archive.org/web/20150101/https://example.com/old", filename: "pub-subject-year.png", isWayback: true },
];

// === CLEANUP SCRIPTS ===

const NUCLEAR_CLEANUP = `
(function() {
  var selectors = [
    '[id*="cookie"],[class*="cookie"],[id*="consent"],[class*="consent"]',
    '[id*="gdpr"],[class*="gdpr"],[id*="onetrust"],[class*="onetrust"]',
    '.cc-banner,.cc-window,#CybotCookiebotDialog',
    '[aria-label*="cookie"],[aria-label*="consent"]',
    '[id*="newsletter"],[class*="newsletter"]',
    '[id*="popup"],[class*="popup"],[id*="modal"],[class*="modal"]',
    '[id*="subscribe"],[class*="subscribe"],[id*="signup"],[class*="sign-up"]',
    '[class*="overlay"],[id*="overlay"],.tp-modal,.tp-backdrop,[data-testid*="modal"]',
    '[id*="ad-"],[id*="ad_"],[class*="ad-container"],[class*="ad-wrapper"],[class*="advertisement"]',
    'iframe[src*="doubleclick"],iframe[src*="googlesyndication"],[id*="google_ads"],.adsbygoogle,[data-ad],[data-ad-slot]',
    '[id*="intercom"],[class*="intercom"],[id*="drift"],[class*="drift"]',
    '[id*="hubspot"],[class*="hubspot-messages"],[id*="zendesk"],[class*="zendesk"]',
    '[id*="crisp"],[class*="crisp"],iframe[title*="chat"]',
    '[role="dialog"],[aria-modal="true"]',
    '[class*="promo"],[class*="Promo"]'
  ].join(',');
  document.querySelectorAll(selectors).forEach(function(el) { el.remove(); });

  // Remove high-z-index fixed/absolute overlays
  document.querySelectorAll('div,section,aside').forEach(function(el) {
    var s = window.getComputedStyle(el);
    var z = parseInt(s.zIndex) || 0;
    if ((s.position === 'fixed' || s.position === 'absolute') && z > 999) el.remove();
  });

  // Unstick headers/navs
  document.querySelectorAll('header,nav,[class*="sticky"],[class*="fixed"]').forEach(function(el) {
    var s = window.getComputedStyle(el);
    if (s.position === 'fixed' || s.position === 'sticky') el.style.position = 'relative';
  });

  document.body.style.overflow = 'auto';
  document.body.style.position = 'static';
  document.documentElement.style.overflow = 'auto';
  document.body.classList.remove('no-scroll', 'modal-open', 'overflow-hidden');
})();
`;

// === MAIN ===

(async () => {
  if (ARTICLES.length === 0) {
    console.log("No articles configured. Edit the ARTICLES array in this file.");
    process.exit(0);
  }

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const results = [];

  for (const article of ARTICLES) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    try {
      console.log(`\n  ${article.filename}`);
      console.log(`  URL: ${article.url}`);

      await page.goto(article.url, { waitUntil: "networkidle2", timeout: 45000 });
      const title = await page.title();
      console.log(`  Title: ${title}`);

      // Scroll to trigger lazy-loaded content
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let total = 0;
          const dist = 300;
          const t = setInterval(() => {
            window.scrollBy(0, dist);
            total += dist;
            if (total >= document.body.scrollHeight) {
              clearInterval(t);
              window.scrollTo(0, 0);
              resolve();
            }
          }, 100);
        });
      });
      await new Promise((r) => setTimeout(r, 2000));

      // Run cleanup twice (some popups load late)
      await page.evaluate(NUCLEAR_CLEANUP);
      await new Promise((r) => setTimeout(r, 1000));
      await page.evaluate(NUCLEAR_CLEANUP);

      // Remove Wayback Machine toolbar
      if (article.isWayback) {
        await page.evaluate(() => {
          document.querySelectorAll(
            "#wm-ipp-base,#wm-ipp-style,#wm-ipp,#wm-ipp-inside,#donato,#wm-btns,#wm-expand,#playback,#position,#wm-toolbar"
          ).forEach((el) => el.remove());
          document.querySelectorAll("div").forEach((div) => {
            if (div.id && div.id.startsWith("wm-")) div.remove();
          });
        });
      }

      // Viewport resize trick for sites where fullPage doesn't work
      const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
      const docHeight = await page.evaluate(() => document.documentElement.scrollHeight);
      if (docHeight <= 900 && bodyHeight > 900) {
        await page.setViewport({ width: 1440, height: bodyHeight });
        await new Promise((r) => setTimeout(r, 500));
      }

      const outputPath = path.join(OUTPUT_DIR, article.filename);
      await page.screenshot({ path: outputPath, fullPage: true });

      const stats = fs.statSync(outputPath);
      console.log(`  Saved (${(stats.size / 1024).toFixed(0)}KB)`);
      results.push({ success: true, filename: article.filename });
    } catch (err) {
      console.log(`  FAILED: ${err.message}`);
      results.push({ success: false, filename: article.filename, error: err.message });
    } finally {
      await page.close();
    }
  }

  await browser.close();

  // Summary
  const ok = results.filter((r) => r.success);
  const fail = results.filter((r) => !r.success);
  console.log(`\n=== ${ok.length} succeeded, ${fail.length} failed ===`);
  if (fail.length > 0) {
    fail.forEach((r) => console.log(`  FAILED: ${r.filename} — ${r.error}`));
  }
})();
