# Screenshot Standards Reference

Detailed standards, cleanup scripts, and site-specific notes for evidence screenshot collection.

## Quality Checklist

### Good Screenshot
- [ ] Headline/title clearly visible and fully rendered
- [ ] Publication name or logo visible
- [ ] Author byline visible (if article has one)
- [ ] Publication date visible
- [ ] Body text is readable (not cut off, not blurry)
- [ ] No overlays, popups, or banners obscuring content
- [ ] Page background is clean (no ad clutter around the article)
- [ ] Full width of article captured (no horizontal cropping of text)

### Bad Screenshot (needs recapture)
- Cookie consent banner covering content
- Newsletter modal blocking the article
- Paywall gate visible instead of article content
- Sticky header/nav covering the headline
- Ad overlay or interstitial blocking the view
- Chat widget covering article text
- Video autoplay overlay on top of text content
- Article text truncated or cut off

## Universal Cleanup JavaScript

### Nuclear Cleanup (All-in-One)

Run this before taking any screenshot. Handles the most common blockers across all sites:

```javascript
// Nuclear cleanup — removes cookie banners, popups, modals, ads, sticky elements, and restores scroll
(function() {
  // Remove cookie consent banners
  const cookieSelectors = [
    '[id*="cookie"]', '[class*="cookie"]',
    '[id*="consent"]', '[class*="consent"]',
    '[id*="gdpr"]', '[class*="gdpr"]',
    '[id*="onetrust"]', '[class*="onetrust"]',
    '.cc-banner', '.cc-window',
    '#CybotCookiebotDialog',
    '[aria-label*="cookie"]', '[aria-label*="consent"]'
  ];
  cookieSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => el.remove());
  });

  // Remove newsletter/signup popups and modals
  const popupSelectors = [
    '[id*="newsletter"]', '[class*="newsletter"]',
    '[id*="popup"]', '[class*="popup"]',
    '[id*="modal"]', '[class*="modal"]',
    '[id*="subscribe"]', '[class*="subscribe"]',
    '[id*="signup"]', '[class*="sign-up"]',
    '[class*="overlay"]', '[id*="overlay"]',
    '.tp-modal', '.tp-backdrop',  // Piano/Tinypass paywall
    '[data-testid*="modal"]'
  ];
  popupSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => el.remove());
  });

  // Remove ad containers
  const adSelectors = [
    '[id*="ad-"]', '[id*="ad_"]',
    '[class*="ad-container"]', '[class*="ad-wrapper"]',
    '[class*="advertisement"]',
    'iframe[src*="doubleclick"]',
    'iframe[src*="googlesyndication"]',
    '[id*="google_ads"]',
    '.adsbygoogle',
    '[data-ad]', '[data-ad-slot]'
  ];
  adSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => el.remove());
  });

  // Remove sticky headers/footers
  document.querySelectorAll('header, nav, [class*="sticky"], [class*="fixed"]').forEach(el => {
    const style = window.getComputedStyle(el);
    if (style.position === 'fixed' || style.position === 'sticky') {
      el.style.position = 'relative';
    }
  });

  // Remove chat widgets
  const chatSelectors = [
    '[id*="intercom"]', '[class*="intercom"]',
    '[id*="drift"]', '[class*="drift"]',
    '[id*="hubspot"]', '[class*="hubspot-messages"]',
    '[id*="zendesk"]', '[class*="zendesk"]',
    '[id*="crisp"]', '[class*="crisp"]',
    'iframe[title*="chat"]'
  ];
  chatSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => el.remove());
  });

  // Restore scroll on body/html
  document.body.style.overflow = 'auto';
  document.body.style.position = 'static';
  document.documentElement.style.overflow = 'auto';
  document.body.classList.remove('no-scroll', 'modal-open', 'overflow-hidden');
})();
```

### Individual Cleanup Snippets

#### Cookie Banners Only
```javascript
document.querySelectorAll('[id*="cookie"],[class*="cookie"],[id*="consent"],[class*="consent"],[id*="gdpr"],[class*="gdpr"],[id*="onetrust"],[class*="onetrust"],.cc-banner,.cc-window,#CybotCookiebotDialog').forEach(el => el.remove());
```

#### Popups and Modals Only
```javascript
document.querySelectorAll('[id*="popup"],[class*="popup"],[id*="modal"],[class*="modal"],[class*="overlay"],[id*="overlay"],[id*="newsletter"],[class*="newsletter"]').forEach(el => el.remove());
document.body.style.overflow = 'auto';
document.body.style.position = 'static';
document.documentElement.style.overflow = 'auto';
```

#### Ads Only
```javascript
document.querySelectorAll('[id*="ad-"],[id*="ad_"],[class*="ad-container"],[class*="advertisement"],.adsbygoogle,[data-ad],[data-ad-slot]').forEach(el => el.remove());
```

#### Unstick Fixed Elements
```javascript
document.querySelectorAll('*').forEach(el => {
  const style = window.getComputedStyle(el);
  if (style.position === 'fixed' || style.position === 'sticky') {
    el.style.position = 'relative';
  }
});
```

## Site-Specific Notes

### Adweek (adweek.com)
- **Cookie banner:** Yes, large GDPR banner. Nuclear cleanup handles it.
- **Newsletter popup:** Appears after ~5 seconds. Nuclear cleanup handles it.
- **Video ads:** Auto-playing video ads in sidebar. Remove with ad cleanup.
- **Tip:** Run nuclear cleanup, wait 2 seconds, run again (popup may load late).

### AlleyWatch (alleywatch.com)
- **Newsletter popup:** Modal with X button at top-right corner.
- **Handling:** Nuclear cleanup usually works. If not, target `[class*="pum-overlay"]` or click the X button.

### Webrazzi (webrazzi.com)
- **Language:** Turkish. Content is valid evidence (translations done separately).
- **Cookie consent:** Standard EU cookie banner. Nuclear cleanup handles it.
- **Tag pages:** Webrazzi keeps per-person tag pages at `/etiket/{applicant-slug}`. Capture the full tag listing — it documents the volume of coverage in one exhibit.

### TechCrunch (techcrunch.com)
- **Paywall:** Old articles (pre-2023) may be behind a metered paywall.
- **Handling:** Try incognito mode first. If still blocked, try Wayback Machine. Many pre-2020 articles are freely accessible.
- **Extra:** Rapid API redesign means old URL structures may redirect. Check the URL resolves before screenshotting.

### GigaOm (gigaom.com)
- **Status:** Defunct/relaunched as a paywall-only analyst site.
- **Live site:** Shows a sign-in modal ("Create a Free GigaOm Account") that blocks all content. **Cannot use live site.**
- **Handling:** Must use Wayback Machine. Best snapshot: `https://web.archive.org/web/20150101000000/https://gigaom.com/...`
- **Note:** Wayback version has old/plain layout but content is fully readable. Remove Wayback toolbar after capture.

### PerformanceIN (performancein.com)
- **Status:** Rebranded to "Hello Partner" (hellopartner.com). Old URLs redirect to Hello Partner homepage.
- **Live site:** Redirects — shows wrong page entirely. **Cannot use live site.**
- **Handling:** Must use Wayback Machine. URL pattern: `https://web.archive.org/web/20160801000000/https://performancein.com/news/...`
- **Note:** Wayback version renders cleanly with full article content.

### Marketing Dive (marketingdive.com)
- **Cookie banner:** Industry Dive cookie consent. Nuclear cleanup handles it.
- **Popup modal:** "CMO Summit" promo popup appears over article content. Requires high-z-index modal removal (see script above).
- **Full-page capture bug:** `document.documentElement.scrollHeight` returns viewport height, not full page. Must use the viewport resize trick (resize viewport to `document.body.scrollHeight` before capturing).

### Inverse (inverse.com)
- **Quote overlays:** Large pull-quotes that appear as overlays are **editorial design**, NOT popups. Do NOT remove them.
- **Layout:** Bustle Digital Group publication. Generally clean after cookie/ad removal.
- **Note:** Full feature profiles run long — capture as multi-screenshot or PDF rather than one tall image.

### GamesBeat / VentureBeat (venturebeat.com)
- **Paywall:** Some articles behind registration wall.
- **Handling:** We already have PDFs for these articles. Use existing PDFs rather than re-screenshotting.

### Crunchbase News (news.crunchbase.com)
- **Clean:** Generally no overlays. Standard article layout.

### Pocket Gamer (pocketgamer.biz)
- **Cookie banner:** Yes. Nuclear cleanup handles it.
- **Layout:** Clean business article format.
- **URL restructuring:** PocketGamer has restructured URLs. Old slug-only links now 404. The current form is `/news/{id}/{slug}/`. Use Google `site:pocketgamer.biz` search to find current URLs before attempting capture.

### Cheddar (cheddar.com)
- **Video content:** Primary content is video. Screenshot the video page/episode listing, not a video frame.

### Wamda (wamda.com)
- **Region:** MENA-focused tech publication.
- **Generally clean:** Minimal overlays. Standard screenshot process.

## Screenshot vs. PDF Decision

| Scenario | Choose | Reason |
|----------|--------|--------|
| Article fits in 1-3 viewport scrolls | **PNG screenshot** | Quick capture, easy to verify |
| Article is 4+ viewport scrolls | **PDF** | Captures full text without stitching |
| Article has important images throughout | **PNG screenshot** | Better image fidelity |
| Article is behind soft paywall but viewable | **PDF** | Save full content before meter resets |
| Video/podcast episode page | **PNG screenshot** | Just need the page showing the episode |
| Foreign language article needing translation | **PNG + MD** | Screenshot of original + separate translation markdown |

## shot-scraper Capture (Preferred Method)

shot-scraper (by Simon Willison) is a CLI tool built on Playwright that produces reliable full-page screenshots saved directly to disk. One command, no boilerplate.

### Setup (One-Time)

```bash
pipx install shot-scraper && shot-scraper install
```

### Single Article Capture

```bash
shot-scraper 'https://example.com/article' \
  -w 1200 \
  --wait 3000 \
  --javascript 'CLEANUP_JS_HERE' \
  -o /path/to/resources/press/company/articles/publication-subject-year.png
```

**Key flags:**
- Full page is the default — omit `--height` to capture the entire page
- `-w 1200` — article-friendly width (use 1200-1440)
- `--wait 3000` — wait ms for dynamic content before capture
- `--javascript '...'` — run cleanup JS before screenshot (inline or from file)
- `-o path` — output file path (saves directly to target location)
- `--retina` — 2x resolution for high-quality evidence (optional, larger files)

### Nuclear Cleanup as shot-scraper JavaScript

Pass the cleanup script inline. **Important:** keep it as a single expression or IIFE to avoid breaking shot-scraper's JS execution. The script below is the minified version of the Nuclear Cleanup script from the section above:

```bash
shot-scraper 'URL_HERE' \
  -w 1200 \
  --wait 3000 \
  --javascript '
    document.querySelectorAll("[id*=cookie],[class*=cookie],[id*=consent],[class*=consent],[id*=gdpr],[class*=gdpr],[id*=onetrust],[class*=onetrust],.cc-banner,.cc-window,#CybotCookiebotDialog,[id*=newsletter],[class*=newsletter],[id*=popup],[class*=popup],[id*=modal],[class*=modal],[class*=overlay],[id*=overlay],.tp-modal,.tp-backdrop,[id*=ad-],[id*=ad_],[class*=ad-container],[class*=advertisement],.adsbygoogle,[data-ad],[data-ad-slot],[id*=intercom],[class*=intercom],[id*=drift],[class*=drift]").forEach(e=>e.remove());
    document.querySelectorAll("*").forEach(e=>{const s=getComputedStyle(e);if(s.position==="fixed"||s.position==="sticky")e.style.position="relative"});
    document.body.style.overflow="auto";document.documentElement.style.overflow="auto";
  ' \
  -o /path/to/output.png
```

### Batch Capture

For multiple articles, use a bash loop:

```bash
#!/bin/bash
DEST="${DEST:?set DEST to the resources/press directory of your case workspace}"
CLEANUP='document.querySelectorAll("[id*=cookie],[class*=cookie],[id*=consent],[class*=consent],[id*=popup],[class*=popup],[id*=modal],[class*=modal],[class*=overlay],.tp-modal,.tp-backdrop,[class*=advertisement],.adsbygoogle").forEach(e=>e.remove());document.querySelectorAll("*").forEach(e=>{const s=getComputedStyle(e);if(s.position==="fixed"||s.position==="sticky")e.style.position="relative"});document.body.style.overflow="auto";document.documentElement.style.overflow="auto";'

shot-scraper 'https://example.com/article1' -w 1200 --wait 3000 --javascript "$CLEANUP" -o "$DEST/company/articles/pub-subject-2020.png"
shot-scraper 'https://example.com/article2' -w 1200 --wait 3000 --javascript "$CLEANUP" -o "$DEST/company/articles/pub-subject-2021.png"
```

### Wayback Machine Captures

For archived pages, add Wayback toolbar removal to the cleanup JS:

```bash
shot-scraper 'https://web.archive.org/web/20160801/https://example.com/old-article' \
  -w 1200 \
  --wait 5000 \
  --javascript '
    document.querySelectorAll("#wm-ipp-base,#wm-ipp-style,#wm-ipp,#wm-ipp-inside,#donato,#wm-btns,#wm-expand,#playback,#position,#wm-toolbar").forEach(e=>e.remove());
    document.querySelectorAll("div").forEach(d=>{if(d.id&&d.id.startsWith("wm-"))d.remove()});
    document.querySelectorAll("[id*=cookie],[class*=cookie],[id*=consent],[class*=popup],[class*=modal],[class*=overlay],.tp-modal,.tp-backdrop,[class*=advertisement]").forEach(e=>e.remove());
    document.querySelectorAll("*").forEach(e=>{const s=getComputedStyle(e);if(s.position==="fixed"||s.position==="sticky")e.style.position="relative"});
    document.body.style.overflow="auto";document.documentElement.style.overflow="auto";
  ' \
  -o /path/to/output.png
```

### CSS Selector Capture

To capture just the article element (excluding sidebar, footer, etc.):

```bash
shot-scraper 'URL_HERE' \
  -w 1200 \
  --wait 3000 \
  -s 'article' \
  --javascript 'CLEANUP_JS' \
  -o /path/to/output.png
```

### High-Z-Index Modal Removal

For stubborn modals not caught by class/ID selectors, add to the cleanup JS:

```javascript
document.querySelectorAll('[role="dialog"],[aria-modal="true"]').forEach(e=>e.remove());
document.querySelectorAll('div,section,aside').forEach(e=>{const s=getComputedStyle(e);const z=parseInt(s.zIndex)||0;if((s.position==="fixed"||s.position==="absolute")&&z>999)e.remove()});
```

### Gotchas

- **Aggressive JS cleanup can break pages.** If the screenshot comes back tiny (viewport-sized) or blank, the cleanup JS removed structural elements. Use gentler cleanup or the `-s 'article'` selector approach instead.
- **Some sites block headless browsers.** Try `--user-agent 'Mozilla/5.0 ...'` with a real browser UA string.
- **Lazy-loaded content** may not render. Increase `--wait` to 5000-8000ms for heavy sites.

## Chrome MCP Tools (Alternative Method)

Use Chrome MCP browser tools **only for interactive debugging** — when you need to visually inspect a page before deciding capture strategy. Note: Chrome MCP screenshots are **viewport-only** (not full-page) and require manual steps to save to disk.

1. Load tools via `ToolSearch: "select:mcp__claude-in-chrome__navigate"` etc.
2. Navigate, clean up with `javascript_tool`, and take a screenshot with `computer`
3. The screenshot stays in the conversation — it is NOT saved to disk automatically
4. Once you understand the page layout, switch to shot-scraper for the actual capture
