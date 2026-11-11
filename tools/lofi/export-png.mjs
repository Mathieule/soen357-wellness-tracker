/**
 * Exports every wireframe SVG of one iteration to PNG (for reports/slides).
 *   node tools/lofi/export-png.mjs Output_A
 * Writes Output_X/lo-fi/png/<id>.png and flow.png. Needs the same Chromium as
 * tools/screenshots/capture.mjs (CHROMIUM_PATH can override it).
 */
import { chromium } from 'playwright-core';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const dir = join(resolve(process.argv[2] ?? ''), 'lo-fi');
const outDir = join(dir, 'png');
mkdirSync(outDir, { recursive: true });
const def = join(homedir(), '.cache/ms-playwright/chromium-1140/chrome-linux/chrome');
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? (existsSync(def) ? def : undefined) });
const page = await browser.newPage({ deviceScaleFactor: 2 });
const files = [...readdirSync(join(dir, 'screens')).map((f) => join(dir, 'screens', f)), join(dir, 'flow.svg')];
for (const f of files.filter((f) => f.endsWith('.svg'))) {
  await page.goto(pathToFileURL(f).href);
  await (await page.$('svg')).screenshot({ path: join(outDir, f.split('/').pop().replace('.svg', '.png')) });
}
await browser.close();
console.log(`${files.length} PNG files written to ${outDir}`);
