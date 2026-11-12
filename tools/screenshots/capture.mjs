/**
 * Exports the high-fidelity screens of one iteration as PNG files.
 *
 *   node tools/screenshots/capture.mjs Output_A
 *
 * It serves the BUILT app (Output_X/hi-fi/app/dist, run the build first) on a
 * temporary local HTTP server (module scripts do not load from file://), opens it in headless Chromium at 390 x 844 (the primary design viewport),
 * runs every scenario listed in Output_X/hi-fi/screens.mjs and saves
 * Output_X/hi-fi/screens/<name>.png.
 *
 * Uses playwright-core with an already-installed Chromium. Set CHROMIUM_PATH
 * to point at another Chrome/Chromium binary if needed.
 */
import { chromium } from 'playwright-core';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname } from 'node:path';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const output = process.argv[2];
if (!output) {
  console.error('Usage: node tools/screenshots/capture.mjs <Output_A|Output_B|...>');
  process.exit(1);
}
const root = resolve(output);
// Output C keeps its app in Output_C/prototype; A and B in Output_X/hi-fi/app.
const appDir = existsSync(join(root, 'prototype/index.html')) ? join(root, 'prototype') : join(root, 'hi-fi/app');
const dist = join(appDir, 'dist/index.html');
if (!existsSync(dist)) {
  console.error(`Build not found: ${dist}. Run the build first.`);
  process.exit(1);
}
const outDir = join(root, 'hi-fi/screens');
mkdirSync(outDir, { recursive: true });

const defaultChromium = join(homedir(), '.cache/ms-playwright/chromium-1140/chrome-linux/chrome');
const executablePath = process.env.CHROMIUM_PATH ?? (existsSync(defaultChromium) ? defaultChromium : undefined);

const { scenarios } = await import(pathToFileURL(join(root, 'hi-fi/screens.mjs')).href);
const distDir = join(appDir, 'dist');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png' };
const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = join(distDir, path === '/' ? 'index.html' : path);
  if (!file.startsWith(distDir) || !existsSync(file)) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const appUrl = `http://127.0.0.1:${server.address().port}/`;

const browser = await chromium.launch({ executablePath });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  reducedMotion: 'reduce',
});
// Fail fast instead of waiting 30 s when a locator does not match.
context.setDefaultTimeout(8000);

const failures = [];
for (const s of scenarios) {
  const page = await context.newPage();
  try {
    await page.goto(appUrl);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    if (s.viewport) await page.setViewportSize(s.viewport);
    await s.run(page, appUrl);
    if (s.fullPage) {
      // A fixed bottom bar would be drawn in the middle of a full-page image:
      // place it after the content instead (capture only, the app is unchanged).
      await page.evaluate(() => document.querySelectorAll('[aria-live="polite"]').forEach((e) => { if (getComputedStyle(e).position === 'fixed') e.style.display = 'none'; }));
      await page.addStyleTag({ content: 'nav[aria-label="Main menu"]{position:static!important} div[aria-live="polite"].fixed{display:none!important}' });
    }
    await page.waitForTimeout(1600); // let animations and the simulated sync finish
    await page.screenshot({ path: join(outDir, `${s.name}.png`), fullPage: !!s.fullPage });
    console.log(`✓ ${s.name}`);
  } catch (err) {
    failures.push(s.name);
    console.error(`✗ ${s.name}: ${err.message.split('\n').slice(0, 12).join('\n   ')}`);
  } finally {
    await page.close();
  }
}
await browser.close();
server.close();

// Gallery page next to the PNG files.
const gallery = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${output} – high-fidelity screens</title>
<style>body{font-family:Arial,sans-serif;background:#2b2727;color:#F2F0EF;margin:0;padding:24px}h1{margin-top:0}
.grid{display:flex;flex-wrap:wrap;gap:24px}figure{margin:0;width:300px}img{width:300px;height:auto;border:1px solid #777;border-radius:12px}
figcaption{font-size:16px;margin-top:6px}a{color:#9CCBFF}</style></head><body>
<h1>${output.replace('_', ' ')} – high-fidelity screens (390 × 844)</h1>
<p>Exported from the running prototype by tools/screenshots/capture.mjs. Full-page images show the bottom bar after the content.</p>
<div class="grid">${scenarios
  .filter((s) => !failures.includes(s.name))
  .map((s) => `<figure><a href="screens/${s.name}.png"><img src="screens/${s.name}.png" alt="Screen ${s.name}"></a><figcaption>${s.name}</figcaption></figure>`)
  .join('')}</div></body></html>`;
writeFileSync(join(root, 'hi-fi/index.html'), gallery);
if (failures.length) {
  console.error(`${failures.length} screen(s) failed: ${failures.join(', ')}`);
  process.exit(1);
}
