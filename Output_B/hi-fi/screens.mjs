/** Output B high-fidelity screens (390 × 844 unless stated). */
import { demo, nav, settings, signUp } from '../../tools/screenshots/helpers.mjs';
const casual = demo('Sam Lee');
const training = demo('Alex Martin');
const perf = demo('Jordan Rivera');

export const scenarios = [
  { name: 'B01-welcome', fullPage: true, run: async () => {} },
  { name: 'B02-questionnaire-persona', run: async (page) => { await signUp(page); await page.getByText('Which describes you best?').waitFor(); } },
  { name: 'B03-dashboard-casual-adaptive', fullPage: true, run: casual },
  { name: 'B04-dashboard-training', fullPage: true, run: training },
  { name: 'B05-dashboard-performance', fullPage: true, run: perf },
  { name: 'B06-dashboard-customize', fullPage: true, run: async (page) => { await training(page); await page.getByRole('button', { name: 'Customize' }).click(); } },
  { name: 'B07-fitness-training', fullPage: true, run: async (page) => { await training(page); await nav('Fitness')(page); } },
  { name: 'B08-sleep-performance', fullPage: true, run: async (page) => { await perf(page); await nav('Sleep')(page); } },
  { name: 'B09-sleep-casual', fullPage: true, run: async (page) => { await casual(page); await nav('Sleep')(page); } },
  { name: 'B10-sleep-log-sheet', run: async (page) => { await training(page); await nav('Sleep')(page); await page.getByRole('button', { name: 'Enter a new sleep log' }).click(); } },
  { name: 'B11-sleep-month', run: async (page) => { await perf(page); await nav('Sleep')(page); await page.getByRole('radio', { name: 'Month' }).check({ force: true }); await page.getByRole('heading', { name: 'Hours of sleep' }).scrollIntoViewIfNeeded(); } },
  { name: 'B12-nutrition-training', fullPage: true, run: async (page) => { await training(page); await nav('Nutrition')(page); } },
  { name: 'B13-settings', fullPage: true, run: async (page) => { await training(page); await settings(page); } },
  { name: 'B14-keyboard-arrow-up-to-nav', run: async (page) => { await training(page); await page.locator('[data-module-link]').first().click(); await page.getByRole('button', { name: 'Enter a new workout' }).waitFor(); await page.keyboard.press('ArrowUp'); } },
];
