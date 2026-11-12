/** Output A high-fidelity screens (390 × 844 unless stated). */
import { demo, nav, settings, signUp, shortQuestionnaire } from '../../tools/screenshots/helpers.mjs';
const casual = demo('Sam Lee');
const perf = demo('Jordan Rivera');

export const scenarios = [
  { name: 'A01-welcome', fullPage: true, run: async () => {} },
  { name: 'A02-questionnaire-persona', run: async (page) => { await signUp(page); await page.getByText('Which describes you best?').waitFor(); } },
  { name: 'A03-questionnaire-goals-empty', run: async (page) => { await signUp(page); await page.getByText('Casual user', { exact: true }).click(); await page.getByText('What are your fitness goals?').waitFor(); } },
  { name: 'A04-questionnaire-goals-chosen', run: async (page) => { await signUp(page); await shortQuestionnaire(page, 'Casual user', ['Lose weight', 'Stay healthy and active']); } },
  { name: 'A05-dashboard-casual-more-data', fullPage: true, run: casual },
  { name: 'A06-dashboard-performance', fullPage: true, run: perf },
  { name: 'A07-dashboard-casual-after-yes', fullPage: true, run: async (page) => { await casual(page); await page.getByRole('button', { name: 'Yes, show more' }).click(); } },
  { name: 'A08-fitness-casual', fullPage: true, run: async (page) => { await casual(page); await nav('Fitness')(page); } },
  { name: 'A09-fitness-performance', fullPage: true, run: async (page) => { await perf(page); await nav('Fitness')(page); } },
  { name: 'A10-workout-errors', run: async (page) => { await perf(page); await nav('Fitness')(page); await page.getByRole('button', { name: 'Enter a new workout' }).click(); await page.getByRole('button', { name: 'Save workout' }).click(); } },
  { name: 'A11-workout-detail', run: async (page) => { await perf(page); await nav('Fitness')(page); await page.getByRole('region', { name: 'Previous workouts' }).getByRole('button').filter({ hasText: 'min' }).first().click(); } },
  { name: 'A12-nutrition-performance', fullPage: true, run: async (page) => { await perf(page); await nav('Nutrition')(page); } },
  { name: 'A13-calories-year', run: async (page) => { await perf(page); await nav('Nutrition')(page); await page.getByRole('radio', { name: 'Year' }).check({ force: true }); await page.getByRole('heading', { name: 'Calorie intake' }).scrollIntoViewIfNeeded(); } },
  { name: 'A14-photo-prediction', run: async (page) => { await casual(page); await nav('Nutrition')(page); await page.getByRole('button', { name: 'Scan photo' }).click(); await page.getByRole('button', { name: /Salmon dinner/ }).click(); await page.getByText('We think this is').waitFor(); } },
  { name: 'A15-photo-failed', run: async (page) => { await casual(page); await nav('Nutrition')(page); await page.getByRole('button', { name: 'Scan photo' }).click(); await page.getByRole('button', { name: /Blurry photo/ }).click(); await page.getByRole('alert').waitFor(); } },
  { name: 'A16-meal-quantity', run: async (page) => { await casual(page); await nav('Nutrition')(page); await page.getByRole('button', { name: 'Type it in' }).click(); } },
  { name: 'A17-profile', fullPage: true, run: async (page) => { await perf(page); await settings(page); } },
  { name: 'A18-profile-persona-confirm', run: async (page) => { await perf(page); await settings(page); await page.getByText('Casual: Stay active, keep it simple').click(); await page.getByRole('button', { name: 'Save persona', exact: true }).click(); } },
  { name: 'A19-delete-confirm', run: async (page) => { await perf(page); await settings(page); await page.getByRole('button', { name: 'Delete account' }).click(); } },
  { name: 'A20-desktop', viewport: { width: 1280, height: 900 }, run: perf },
];
