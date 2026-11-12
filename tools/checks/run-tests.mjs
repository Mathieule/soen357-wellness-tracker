/**
 * Automated test run of the Output C prototype (Final_Testing).
 *
 *   npm run build && npm run test:c
 *
 * Serves Output_C/prototype/dist, drives headless Chromium (390 × 844 unless
 * a test says otherwise) and writes Final_Testing/test-results.md with the
 * table: Test ID | Action | Expected result | Actual result | Status | Issue ID.
 * These are scripted checks run by the developer/AI, NOT tests with users.
 * Issue IDs reference Final_Testing/fixes-c1.md (pass --issues to keep them).
 */
import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { extname, join, resolve } from 'node:path';

const root = resolve('.');
const dist = join(root, 'Output_C/prototype/dist');
if (!existsSync(join(dist, 'index.html'))) {
  console.error('Build first: npm run build');
  process.exit(1);
}
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const server = createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const f = join(dist, p === '/' ? 'index.html' : p);
  if (!f.startsWith(dist) || !existsSync(f)) return res.writeHead(404).end();
  res.writeHead(200, { 'Content-Type': TYPES[extname(f)] ?? 'application/octet-stream' });
  res.end(readFileSync(f));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const URL0 = `http://127.0.0.1:${server.address().port}/`;
const def = join(homedir(), '.cache/ms-playwright/chromium-1140/chrome-linux/chrome');
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? (existsSync(def) ? def : undefined) });
const AXE = readFileSync(join(root, 'node_modules/axe-core/axe.min.js'), 'utf8');

/* ---------------- helpers ---------------- */
async function fresh(viewport = { width: 390, height: 844 }) {
  const ctx = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  ctx.setDefaultTimeout(6000);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(URL0);
  return { page, ctx, errors };
}
const demo = async (page, who) => {
  await page.getByRole('button', { name: new RegExp(`^${who}`) }).click();
  await page.getByRole('heading', { level: 1, name: /^Hello/ }).waitFor();
};
const nav = (page, label) => page.getByRole('navigation', { name: 'Main menu' }).getByRole('link', { name: label }).first().click();
const alertText = async (page) => (await page.getByRole('alert').first().textContent())?.trim();
async function signUp(page, email = 'nina@example.com', pw = 'Welcome123') {
  await page.getByRole('radio', { name: 'Create account' }).check({ force: true });
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(pw);
  await page.getByRole('button', { name: 'Create account' }).last().click();
}
const pick = async (page, text) => { await page.getByText(text, { exact: true }).click(); await page.waitForTimeout(450); };
async function onboard(page, { persona = 'Regular training', level = 'Regular', plus = 0, data = ['Workouts and activity'], goal = 'Build strength' } = {}) {
  await page.getByLabel('First name').fill('Nina');
  const cont = () => page.getByRole('button', { name: 'Continue' }).click();
  await cont();
  await pick(page, persona); // auto-advance on click (Task 2)
  await pick(page, level);
  for (let i = 0; i < plus; i++) await page.getByRole('button', { name: 'Increase Workouts per week' }).click();
  await cont();
  for (const d of data) await page.getByText(d, { exact: true }).click();
  await cont();
  await page.getByText(goal, { exact: true }).click();
  await page.getByRole('button', { name: 'Create my dashboard' }).click();
  await page.getByRole('heading', { level: 1, name: /^Hello/ }).waitFor();
}
const moduleTitles = (page) => page.locator('[data-module-link]').allTextContents();

/* ---------------- test cases ---------------- */
const T = [];
const test = (id, action, expected, fn, issue = '') => T.push({ id, action, expected, fn, issue });

// T1 Account setup
test('T1-01', 'Create account with "nina@example" and a valid password', 'Field error asks for a valid email; no account created', async ({ page }) => {
  await signUp(page, 'nina@example', 'Welcome123');
  return { ok: (await page.getByText('Enter an email like name@example.com.').count()) > 0 && page.url().includes('/auth'), actual: 'Email error shown, still on welcome screen' };
});
test('T1-02', 'Create account with password "short"', 'Password rule error', async ({ page }) => {
  await signUp(page, 'nina@example.com', 'short');
  return { ok: (await page.getByText('Use at least 8 characters, with a letter and a number.').count()) > 0, actual: 'Password error shown' };
});
test('T1-03', 'Create account with existing email alex@example.com', '"Account already exists" error', async ({ page }) => {
  await signUp(page, 'alex@example.com', 'Another123');
  const t = await alertText(page);
  return { ok: /already exists/.test(t ?? ''), actual: t };
});
test('T1-04', 'Questionnaire: press Continue on the persona question without answering', 'Error "Choose the profile that fits you to continue."; stays on the question', async ({ page }) => {
  await signUp(page);
  await page.getByLabel('First name').fill('Nina');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  return { ok: (await page.getByText('Choose the profile that fits you to continue.').count()) > 0, actual: 'Error shown on the persona question' };
});
test('T1-05', 'Questionnaire: no data type selected (step 5)', 'Error asks to choose at least one', async ({ page }) => {
  await signUp(page);
  await page.getByLabel('First name').fill('Nina');
  await page.getByRole('button', { name: 'Continue' }).click();
  await pick(page, 'Performance athlete');
  await pick(page, 'Beginner');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  return { ok: (await page.getByText('Choose at least one type of data to continue.').count()) > 0, actual: 'Error shown on step 5' };
});
test('T1-07', 'Questionnaire: fitness goals page before / after choosing a goal', '"Create my dashboard" hidden until at least one goal is chosen; persona question auto-advances on click', async ({ page }) => {
  await signUp(page);
  await page.getByLabel('First name').fill('Nina');
  await page.getByRole('button', { name: 'Continue' }).click();
  await pick(page, 'Casual user');
  const advanced = await page.getByText('How active are you today?').count();
  await pick(page, 'Beginner');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByText('Meals and calories', { exact: true }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  const before = await page.getByRole('button', { name: 'Create my dashboard' }).count();
  await page.getByText('Lose weight', { exact: true }).click();
  const after = await page.getByRole('button', { name: 'Create my dashboard' }).count();
  return { ok: advanced === 1 && before === 0 && after === 1, actual: `Auto-advanced: ${advanced === 1}; button before: ${before}, after: ${after}` };
});
test('T1-06', 'Complete questionnaire (Regular training, Regular, 5 workouts, workout data, Build strength)', 'Dashboard opens empty with "Get started"; plan has 5 sessions', async ({ page }) => {
  await signUp(page);
  await onboard(page, { plus: 2 });
  const gs = await page.getByRole('heading', { name: 'Get started' }).count();
  const chip = await page.getByText(/of 5 done/).first().textContent().catch(() => '');
  return { ok: gs === 1 && /of 5 done/.test(chip), actual: `Get started visible: ${gs === 1}; week chip "${chip}"` };
});

// T2 Find today's information
test('T2-01', 'Log in with alex@example.com and a wrong password', '"Email or password is incorrect" error', async ({ page }) => {
  await page.getByLabel('Email').fill('alex@example.com');
  await page.getByLabel('Password').fill('Wrong1234');
  await page.getByRole('button', { name: 'Log in' }).click();
  return { ok: /incorrect/.test((await alertText(page)) ?? ''), actual: await alertText(page) };
});
test('T2-02', 'Log in as Training demo; read the dashboard', "Top of the dashboard: today's workout and the day's calorie goal", async ({ page }) => {
  await demo(page, 'Alex Martin');
  const titles = await moduleTitles(page);
  const kcal = await page.getByText(/Calorie goal: [\d,]+ kcal/).count();
  return { ok: /workout/i.test(titles[0]) && kcal > 0, actual: `First module: ${titles[0]}; calorie goal shown: ${kcal > 0}` };
});
test('T2-03', 'Compare dashboards of the three demo profiles', 'All start with today\'s workout. Casual: steps, no Readiness/Load. Performance: Readiness and Load. Training: volume', async () => {
  const out = {};
  for (const who of ['Sam Lee', 'Alex Martin', 'Jordan Rivera']) {
    const { page, ctx } = await fresh();
    await demo(page, who);
    out[who] = await moduleTitles(page);
    await ctx.close();
  }
  const c = out['Sam Lee'], t = out['Alex Martin'], p = out['Jordan Rivera'];
  const ok = [c, t, p].every((x) => /workout/i.test(x[0])) && c.includes('Daily steps') && !c.includes('Readiness') && !c.includes('Training load') && p.includes('Readiness') && p.includes('Training load') && t.includes('Training volume');
  return { ok, actual: `Casual: ${c.join(', ')} | Training: ${t.join(', ')} | Performance: ${p.join(', ')}` };
});
test('T2-04', 'Turn on "Simulate a sync failure", log in again', 'Error with "Retry sync" button on the dashboard', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('wellness-output-c:failNextSync', 'true'));
  await page.reload();
  await demo(page, 'Alex Martin');
  await page.getByRole('alert').waitFor();
  return { ok: (await page.getByRole('button', { name: 'Retry sync' }).count()) === 1, actual: (await alertText(page))?.slice(0, 90) };
});

// T3 Detailed data, pin and reorder
test('T3-01', 'Training demo: open "Sleep Metrics" from its dashboard module title', 'Sleep Metrics opens with the same label; focus on "Enter a new sleep log"', async ({ page }) => {
  await demo(page, 'Alex Martin');
  await page.locator('[data-module-link]', { hasText: 'Sleep Metrics' }).click();
  await page.getByRole('heading', { level: 1, name: 'Sleep Metrics' }).waitFor();
  const f = await page.evaluate(() => document.activeElement?.textContent?.trim());
  return { ok: /Enter a new sleep log/.test(f ?? ''), actual: `Focused: "${f}"` };
});
test('T3-02', 'Customize: move "This week" up, then reload', 'Order changes, success message, order kept after reload', async ({ page }) => {
  await demo(page, 'Alex Martin');
  const before = await moduleTitles(page);
  await page.getByRole('button', { name: 'Customize' }).click();
  await page.getByRole('button', { name: 'Move This week up' }).click();
  const msg = await page.getByRole('status').filter({ hasText: 'moved' }).first().textContent();
  await page.reload();
  await page.getByRole('heading', { level: 1, name: /^Hello/ }).waitFor();
  const after = await moduleTitles(page);
  return { ok: after[0] === 'This week' && before[0] !== 'This week', actual: `Before: ${before.slice(0, 2).join(', ')} → after reload: ${after.slice(0, 2).join(', ')}; message "${msg?.trim()}"` };
});
test('T3-03', 'Customize: remove "Recovery", then add "Training load"', 'Recovery gone; Training load added at the end', async ({ page }) => {
  await demo(page, 'Alex Martin');
  await page.getByRole('button', { name: 'Customize' }).click();
  await page.getByRole('button', { name: 'Unpin metric: Recovery' }).click();
  await page.getByRole('button', { name: 'Pin metric: Training load' }).click();
  const t = await moduleTitles(page);
  return { ok: !t.includes('Recovery') && t[t.length - 1] === 'Training load', actual: t.join(', ') };
});
test('T3-04', 'Training page: open the history calendar and pick a past day', 'Month grid; selected day shows steps and workouts', async ({ page }) => {
  await demo(page, 'Alex Martin');
  await nav(page, 'Fitness');
  await page.getByRole('button', { name: 'Open' }).click();
  await page.getByRole('button', { name: 'Previous month' }).click();
  await page.locator('[data-date]').filter({ hasText: /^15$/ }).first().click();
  const panel = await page.getByRole('dialog').locator('.inset').last().textContent();
  return { ok: /steps/.test(panel ?? ''), actual: panel?.trim().slice(0, 90) };
});
test('T3-05', 'Casual demo (Sleep not chosen): open Sleep Metrics', 'Sleep is under "More" and opens from there', async ({ page }) => {
  await demo(page, 'Sam Lee');
  const tabs = await page.getByRole('navigation', { name: 'Main menu' }).first().locator('[data-nav-item]').allTextContents();
  await page.getByRole('navigation', { name: 'Main menu' }).first().getByRole('button', { name: 'More' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Sleep Metrics' }).click();
  await page.getByRole('heading', { level: 1, name: 'Sleep Metrics' }).waitFor();
  return { ok: !tabs.join().includes('Sleep'), actual: `Tabs: ${tabs.join(', ')}; Sleep opened from More` };
});

// T4 Preferences
test('T4-01', 'Settings: change name to "Alex M." and confirm', 'Confirmation dialog, success message, greeting updated', async ({ page }) => {
  await demo(page, 'Alex Martin');
  await page.getByRole('link', { name: 'Settings' }).first().click();
  await page.getByLabel('Name', { exact: true }).fill('Alex M.');
  await page.getByRole('button', { name: 'Save personal information' }).click();
  await page.getByRole('button', { name: 'Yes, save' }).click();
  await page.getByRole('link', { name: 'Return to the dashboard' }).click();
  await page.getByRole('heading', { level: 1, name: /^Hello/ }).waitFor();
  const h = await page.getByRole('heading', { level: 1 }).textContent();
  return { ok: h === 'Hello, Alex', actual: `Greeting "${h}" (first name of "Alex M.")` };
});
test('T4-02', 'Settings: switch Training → Performance, cancel once, then confirm', 'Cancel keeps Training; confirm adds Readiness to the dashboard', async ({ page }) => {
  await demo(page, 'Alex Martin');
  await page.getByRole('link', { name: 'Settings' }).first().click();
  await page.getByText('Performance: Improve my performance').click();
  await page.getByRole('button', { name: 'Save persona and lifestyle' }).click();
  await page.getByRole('button', { name: 'Cancel' }).click();
  const still = await page.getByText('Training persona').count();
  await page.getByRole('button', { name: 'Save persona and lifestyle' }).click();
  await page.getByRole('button', { name: 'Yes, apply' }).click();
  await page.getByRole('link', { name: 'Return to the dashboard' }).click();
  const t = await moduleTitles(page);
  return { ok: still > 0 && t.includes('Readiness'), actual: `After cancel still Training: ${still > 0}; after confirm modules: ${t.slice(0, 3).join(', ')}` };
});
test('T4-03', 'Settings: 5 sessions but only 4 training days selected', 'Error "Choose exactly 5 training days"', async ({ page }) => {
  await demo(page, 'Alex Martin');
  await page.getByRole('link', { name: 'Settings' }).first().click();
  await page.getByRole('button', { name: 'Increase Workouts per week' }).click();
  // the stepper auto-adds a day; remove one to make it invalid
  await page.getByRole('group', { name: 'Training days' }).getByRole('button', { pressed: true }).first().click();
  await page.getByRole('button', { name: 'Save persona and lifestyle' }).click();
  return { ok: (await page.getByText(/Choose exactly 5 training days/).count()) > 0, actual: 'Error shown' };
});
test('T4-04', 'Rate the app: send without stars, then with 4 stars', 'Error first; then "You rated the app 4 out of 5"', async ({ page }) => {
  await demo(page, 'Alex Martin');
  await page.getByRole('link', { name: 'Settings' }).first().click();
  await page.getByRole('button', { name: 'Send rating' }).click();
  const err = await page.getByText('Choose a rating from 1 to 5 stars.').count();
  await page.getByLabel('4 stars, Good').check({ force: true });
  await page.getByRole('button', { name: 'Send rating' }).click();
  const ok2 = await page.getByText('You rated the app 4 out of 5').count();
  return { ok: err > 0 && ok2 > 0, actual: `Error shown: ${err > 0}; thank-you shown: ${ok2 > 0}` };
});
test('T4-05', 'New empty account: connect a simulated device', 'Success message; steps appear; "Connect a device" checked in Get started', async ({ page }) => {
  await signUp(page);
  await onboard(page, { persona: 'Casual user', level: 'Beginner', goal: 'Stay healthy and active' });
  await page.getByRole('link', { name: 'Settings' }).first().click();
  await page.getByRole('button', { name: 'Connect device' }).click();
  await page.getByText(/connected\. 14 days of steps imported/).waitFor({ timeout: 8000 });
  await page.getByRole('link', { name: 'Return to the dashboard' }).click();
  const steps = await page.getByText(/of 7,000 steps/).first().textContent();
  return { ok: (await page.getByText('Done', { exact: true }).count()) > 0, actual: `Gauge: ${steps?.trim()}; first Get started item done` };
});
test('T4-06', 'Delete account (cancel, then confirm), log in again', 'Cancel keeps account; confirm returns to welcome; login fails', async ({ page }) => {
  await demo(page, 'Sam Lee');
  await page.getByRole('link', { name: 'Settings' }).first().click();
  await page.getByRole('button', { name: 'Delete account' }).click();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.getByRole('button', { name: 'Delete account' }).click();
  await page.getByRole('button', { name: 'Delete my account' }).click();
  await page.getByLabel('Email').fill('sam@example.com');
  await page.getByLabel('Password').fill('Demo1234');
  await page.getByRole('button', { name: 'Log in' }).click();
  return { ok: /incorrect/.test((await alertText(page)) ?? ''), actual: 'Back on welcome; login refused' };
});

// Extra: forms, recognition, editing
test('X-01', 'Add workout: save empty, then valid "Evening swim 40 min"', 'Errors first; then success message and workout in history', async ({ page }) => {
  await demo(page, 'Alex Martin');
  await nav(page, 'Fitness');
  await page.getByRole('button', { name: 'Enter a new workout' }).click();
  await page.getByRole('button', { name: 'Save workout' }).click();
  const err = await page.getByText('The workout was not saved.', { exact: false }).count();
  await page.getByLabel('Workout name').fill('Evening swim');
  await page.getByLabel('Duration (minutes)').fill('40');
  await page.getByRole('button', { name: 'Save workout' }).click();
  await page.getByRole('status').filter({ hasText: 'Evening swim' }).waitFor();
  const inList = await page.getByRole('button', { name: /Evening swim/ }).count();
  return { ok: err > 0 && inList > 0, actual: `Errors shown: ${err > 0}; in history: ${inList > 0}` };
});
test('X-02', 'Open a workout, edit duration to 70, then delete it', 'Updated message; delete asks to confirm; workout removed', async ({ page }) => {
  await demo(page, 'Alex Martin');
  await nav(page, 'Fitness');
  const first = page.getByRole('region', { name: 'Previous workouts' }).getByRole('button').filter({ hasText: 'min' }).first();
  const name = (await first.locator('span.font-bold').first().textContent())?.trim();
  const before = await page.getByRole('region', { name: 'Previous workouts' }).getByRole('button').filter({ hasText: 'min' }).count();
  await first.click();
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByLabel('Duration (minutes)').fill('70');
  await page.getByRole('button', { name: 'Save changes' }).click();
  const upd = await page.getByRole('status').filter({ hasText: 'Workout updated' }).count();
  await page.getByRole('region', { name: 'Previous workouts' }).getByRole('button').filter({ hasText: '1 h 10 min' }).first().click();
  await page.getByRole('button', { name: 'Delete' }).click();
  await page.getByRole('button', { name: 'Delete workout' }).click();
  return { ok: upd > 0, actual: `"${name}" updated to 1 h 10 min, then deleted (confirmation shown)` };
});
test('X-03', 'Photo recognition with the "Blurry photo" sample', 'Error message + "Take another photo" + "Enter it manually"', async ({ page }) => {
  await demo(page, 'Alex Martin');
  await nav(page, 'Nutrition');
  await page.getByRole('button', { name: 'Scan photo' }).click();
  await page.getByRole('button', { name: /Blurry photo/ }).click();
  await page.getByRole('alert').waitFor();
  const a = await page.getByRole('button', { name: 'Take another photo' }).count();
  const b = await page.getByRole('button', { name: 'Enter it manually' }).count();
  return { ok: a === 1 && b === 1, actual: (await alertText(page))?.slice(0, 80) };
});
test('X-04', 'Photo: Salmon sample → Confirm; then another photo → Cancel', 'Confirm adds the meal with message; Cancel adds nothing', async ({ page }) => {
  await demo(page, 'Alex Martin');
  await nav(page, 'Nutrition');
  const count = () => page.getByRole('region', { name: "Today's meals" }).getByRole('button').filter({ hasText: 'kcal' }).count();
  await page.getByRole('heading', { name: "Today's meals" }).waitFor();
  await page.waitForTimeout(300);
  const n0 = await count();
  await page.getByRole('button', { name: 'Scan photo' }).click();
  await page.getByRole('button', { name: /Salmon dinner/ }).click();
  await page.getByRole('button', { name: 'Confirm and save' }).click();
  const n1 = await count();
  await page.getByRole('button', { name: 'Scan photo' }).click();
  await page.getByRole('button', { name: /Oatmeal bowl/ }).click();
  await page.getByText('We think this is').waitFor();
  await page.getByRole('button', { name: 'Cancel' }).click().catch(() => page.keyboard.press('Escape'));
  await page.keyboard.press('Escape');
  const n2 = await count();
  return { ok: n1 === n0 + 1 && n2 === n1, actual: `Meals: ${n0} → ${n1} after confirm → ${n2} after cancel` };
});
test('X-05', 'Photo: Salmon sample → Edit → change calories to 600 → Save', 'Meal saved with 600 kcal (edited prediction)', async ({ page }) => {
  await demo(page, 'Alex Martin');
  await nav(page, 'Nutrition');
  await page.getByRole('button', { name: 'Scan photo' }).click();
  await page.getByRole('button', { name: /Salmon dinner/ }).click();
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByLabel('Calories (kcal)').fill('600');
  await page.getByRole('button', { name: 'Save food' }).click();
  const ok = await page.getByRole('button', { name: /Salmon, rice and broccoli.*600 kcal/ }).count();
  return { ok: ok > 0, actual: ok ? 'Saved as 600 kcal, marked "from photo"' : 'Not found' };
});
test('X-06', 'Manual meal with no calories, then fixed', 'Error on calories; then saved', async ({ page }) => {
  await demo(page, 'Sam Lee');
  await nav(page, 'Nutrition');
  await page.getByRole('button', { name: 'Type it in' }).click();
  await page.getByLabel('What did you eat?').fill('Soup');
  await page.getByRole('button', { name: 'Save food' }).click();
  const err = await page.getByText('Enter the calories.').count();
  await page.getByLabel('Calories (kcal)').fill('250');
  await page.getByRole('button', { name: 'Save food' }).click();
  return { ok: err > 0 && (await page.getByRole('button', { name: /Soup/ }).count()) > 0, actual: `Calories error: ${err > 0}; Soup saved` };
});
test('X-07', 'Sleep: edit last night, bedtime 22:15', '"Sleep updated" message; value kept after reload', async ({ page }) => {
  await demo(page, 'Alex Martin');
  await nav(page, 'Sleep');
  await page.getByRole('region', { name: 'Previous sleep logs' }).getByRole('button').first().click();
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByLabel('Bedtime', { exact: true }).fill('22:15');
  await page.getByRole('button', { name: 'Save night' }).click();
  const msg = await page.getByRole('status').filter({ hasText: 'Sleep updated' }).count();
  await page.reload();
  await page.getByRole('heading', { level: 1, name: 'Sleep Metrics' }).waitFor();
  return { ok: msg > 0 && (await page.getByText(/22:15–/).count()) > 0, actual: `Updated message: ${msg > 0}; 22:15 shown after reload` };
});
test('X-08', 'Sleep: wake-up time equal to bedtime + 30 min', 'Error "Sleep must last between 1 and 16 hours"', async ({ page }) => {
  await demo(page, 'Alex Martin');
  await nav(page, 'Sleep');
  await page.getByRole('button', { name: 'Enter a new sleep log' }).click();
  await page.getByLabel('Bedtime', { exact: true }).fill('23:00');
  await page.getByLabel('Wake-up time').fill('23:30');
  await page.getByRole('button', { name: 'Save night' }).click();
  return { ok: (await page.getByText(/between 1 and 16 hours/).count()) > 0, actual: 'Error shown' };
});

// Keyboard
test('K-01', 'Keyboard: open Training from a module, press ↑ on "Add workout"', 'Focus moves to the current nav item', async ({ page }) => {
  await demo(page, 'Alex Martin');
  await page.locator('[data-module-link]').first().click();
  await page.getByRole('button', { name: 'Enter a new workout' }).focus();
  await page.keyboard.press('ArrowUp');
  const f = await page.evaluate(() => (document.activeElement?.hasAttribute('data-nav-item') ? document.activeElement.textContent : 'not nav'));
  return { ok: f?.includes('Fitness'), actual: `Focused: ${f}` };
});
test('K-02', 'Keyboard: on dashboard press ↓ twice from the first module title; ← / → on nav', 'Moves module by module; arrows move along the nav bar', async ({ page }) => {
  await demo(page, 'Alex Martin');
  await page.locator('[data-module-link]').first().focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  const third = await page.evaluate(() => document.activeElement?.textContent);
  await page.getByRole('navigation', { name: 'Main menu' }).locator('[data-nav-item]').first().focus();
  await page.keyboard.press('ArrowRight');
  const n = await page.evaluate(() => document.activeElement?.textContent);
  return { ok: (await moduleTitles(page))[2] === third && /Fitness/.test(n ?? ''), actual: `After ↓↓: ${third}; after →: ${n}` };
});
test('K-03', 'Keyboard: open a sheet, press Escape', 'Sheet closes and focus returns to the opener', async ({ page }) => {
  await demo(page, 'Alex Martin');
  await nav(page, 'Nutrition');
  const btn = page.getByRole('button', { name: 'Type it in' });
  await btn.focus();
  await page.keyboard.press('Enter');
  await page.getByRole('dialog').waitFor();
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').waitFor({ state: 'detached' });
  const f = await page.evaluate(() => document.activeElement?.textContent?.trim());
  return { ok: /Type it in/.test(f ?? ''), actual: `Focus back on "${f}"` };
});

// Responsive, targets, text size, axe
const PAGES = [['Home', null], ['Fitness', 'Fitness'], ['Nutrition', 'Nutrition'], ['Sleep', 'Sleep'], ['Settings', 'SETTINGS']];
async function eachPage(page, fn) {
  const out = [];
  for (const [name, target] of PAGES) {
    if (target === 'SETTINGS') await page.getByRole('link', { name: 'Settings' }).first().click();
    else if (target) await nav(page, target);
    await page.waitForTimeout(150);
    out.push([name, await fn()]);
    if (target) await page.goto(URL0 + '#/');
  }
  return out;
}
test('R-01', 'No horizontal scrolling at 360, 390 and 412 px on the 5 main pages (Performance demo)', 'scrollWidth ≤ viewport width everywhere', async () => {
  const bad = [];
  for (const w of [360, 390, 412]) {
    const { page, ctx } = await fresh({ width: w, height: 800 });
    await demo(page, 'Jordan Rivera');
    const r = await eachPage(page, () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth));
    r.filter(([, d]) => d > 0).forEach(([n, d]) => bad.push(`${n}@${w}px (+${d})`));
    await ctx.close();
  }
  return { ok: bad.length === 0, actual: bad.length ? bad.join(', ') : 'No overflow (15 checks)' };
});
test('R-02', 'Desktop 1280 px', 'Side navigation visible, bottom bar hidden', async () => {
  const { page, ctx } = await fresh({ width: 1280, height: 900 });
  await demo(page, 'Jordan Rivera');
  const navs = await page.getByRole('navigation', { name: 'Main menu' }).evaluateAll((els) => els.map((e) => e.offsetParent !== null));
  await ctx.close();
  return { ok: navs.filter(Boolean).length === 1, actual: `Visible menus: ${navs.filter(Boolean).length} of ${navs.length}` };
});
test('N-01', 'Casual demo: answer "Yes, show more" to "Do you want to see more data?"', 'Question shown (based on logged workouts); after Yes, more modules appear', async ({ page }) => {
  await demo(page, 'Sam Lee');
  const q = await page.getByRole('heading', { name: 'Do you want to see more data?' }).count();
  const before = await moduleTitles(page);
  await page.getByRole('button', { name: 'Yes, show more' }).click();
  const after = await moduleTitles(page);
  return { ok: q === 1 && after.length > before.length && after.includes('This week'), actual: `Prompt: ${q === 1}; modules ${before.length} → ${after.length} (${after.join(', ')})` };
});
test('N-02', 'Nutrition Metrics: calorie intake chart, choose Year', '12 monthly values (week / month / year progress charts)', async ({ page }) => {
  await demo(page, 'Alex Martin');
  await nav(page, 'Nutrition');
  await page.getByRole('radio', { name: 'Year' }).first().check({ force: true });
  const rows = await page.locator('table caption', { hasText: 'Calorie intake, past year' }).locator('xpath=..').locator('tr').count();
  return { ok: rows === 12, actual: `${rows} rows in the year table` };
});
test('N-03', 'Settings: turn on "Large text and buttons"', 'Root text grows to 20 px, labels bold; setting kept after reload', async ({ page }) => {
  await demo(page, 'Alex Martin');
  await page.getByRole('link', { name: 'Settings' }).first().click();
  await page.getByRole('switch', { name: 'Large text and buttons' }).click();
  await page.reload();
  await page.getByRole('heading', { level: 1 }).first().waitFor();
  const fs = await page.evaluate(() => getComputedStyle(document.documentElement).fontSize);
  const fw = await page.evaluate(() => getComputedStyle(document.querySelector('label')).fontWeight);
  return { ok: fs === '20px' && Number(fw) >= 700, actual: `html font-size ${fs}; label weight ${fw}` };
});
test('N-04', 'Manual meal: quantity 0, then 2 servings', 'Quantity error; then saved with "2 servings"', async ({ page }) => {
  await demo(page, 'Sam Lee');
  await nav(page, 'Nutrition');
  await page.getByRole('button', { name: 'Type it in' }).click();
  await page.getByLabel('What did you eat?').fill('Rice bowl');
  await page.getByLabel('Quantity (servings)').fill('0');
  await page.getByLabel('Calories (kcal)').fill('500');
  await page.getByRole('button', { name: 'Save food' }).click();
  const err = await page.getByText(/Enter a quantity between/).count();
  await page.getByLabel('Quantity (servings)').fill('2');
  await page.getByRole('button', { name: 'Save food' }).click();
  const ok = await page.getByRole('button', { name: /Rice bowl.*2 servings/ }).count();
  return { ok: err > 0 && ok > 0, actual: `Error: ${err > 0}; saved with 2 servings: ${ok > 0}` };
});
test('N-05', 'Training demo: dashboard recommendations', 'A "Recommendations" module with at least one suggestion', async ({ page }) => {
  await demo(page, 'Alex Martin');
  const items = await page.getByRole('region', { name: 'Recommendations' }).locator('li').count();
  return { ok: items > 0, actual: `${items} suggestion(s)` };
});
test('R-03', 'Sleep page at 390 px: "Last night" duration and sleep-log times', 'Duration on one line; no time range split over two lines (C1-02, C1-03)', async ({ page }) => {
  await demo(page, 'Alex Martin');
  await nav(page, 'Sleep');
  const h = await page.getByRole('region', { name: 'Last night' }).locator('p.text-4xl').evaluate((e) => e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight || '40'));
  const lines = await page.getByRole('region', { name: 'Previous sleep logs' }).getByRole('button').first().locator('span span').nth(1).evaluate((e) => Math.round(e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight)));
  return { ok: h < 1.5 && lines === 1, actual: `Duration lines: ${h.toFixed(1)}; log meta lines: ${lines}` };
});
test('A-01', 'Touch targets: every visible button / link / input ≥ 44 × 44 px (5 pages)', 'No smaller target', async ({ page }) => {
  await demo(page, 'Alex Martin');
  const r = await eachPage(page, () =>
    page.evaluate(() =>
      [...document.querySelectorAll('button, a[href], input:not(.sr-only):not([type=hidden]), select, [role=switch]')]
        .filter((e) => e.offsetParent !== null && !e.classList.contains('sr-only'))
        .map((e) => ({ e, r: e.getBoundingClientRect() }))
        .filter(({ r }) => r.width > 0 && (r.width < 44 || r.height < 44))
        .map(({ e, r }) => `${(e.getAttribute('aria-label') || e.textContent || e.tagName).trim().slice(0, 24)} ${Math.round(r.width)}×${Math.round(r.height)}`),
    ),
  );
  const bad = r.flatMap(([n, l]) => l.map((x) => `${n}: ${x}`));
  return { ok: bad.length === 0, actual: bad.length ? bad.slice(0, 6).join('; ') + (bad.length > 6 ? ` … (+${bad.length - 6})` : '') : 'All targets ≥ 44 px' };
});
test('A-02', 'Text size: no visible text below 16 px (5 pages)', 'Smallest computed font-size ≥ 16 px', async ({ page }) => {
  await demo(page, 'Jordan Rivera');
  const r = await eachPage(page, () =>
    page.evaluate(() => {
      let min = 99;
      let where = '';
      const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (walk.nextNode()) {
        const n = walk.currentNode;
        const el = n.parentElement;
        if (!el || !n.textContent.trim() || el.closest('.sr-only') || el.offsetParent === null) continue;
        const fs = parseFloat(getComputedStyle(el).fontSize);
        if (fs < min) { min = fs; where = n.textContent.trim().slice(0, 20); }
      }
      // SVG chart text
      document.querySelectorAll('svg text').forEach((t) => { const fs = parseFloat(t.getAttribute('font-size') || '16'); if (fs < min) { min = fs; where = 'svg: ' + t.textContent; } });
      return { min, where };
    }),
  );
  const worst = r.reduce((a, [n, v]) => (v.min < a.min ? { ...v, n } : a), { min: 99 });
  return { ok: worst.min >= 16, actual: `Smallest: ${worst.min}px${worst.min < 16 ? ` on ${worst.n} ("${worst.where}")` : ''}` };
});
test('A-03', 'axe-core (WCAG 2.1 A/AA rules) on welcome + 5 pages of each demo profile', 'No serious or critical violations', async () => {
  const found = {};
  const runAxe = async (page, label) => {
    await page.addScriptTag({ content: AXE });
    const res = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, sample: v.nodes[0]?.target?.join(' ') })));
    res.filter((v) => v.impact === 'serious' || v.impact === 'critical').forEach((v) => { found[v.id] = found[v.id] ?? { ...v, where: [] }; found[v.id].where.push(label); });
  };
  for (const who of ['Sam Lee', 'Alex Martin', 'Jordan Rivera']) {
    const { page, ctx } = await fresh();
    await page.waitForTimeout(200);
    if (who === 'Sam Lee') await runAxe(page, 'Welcome');
    await demo(page, who);
    await page.waitForTimeout(1500);
    for (const [name, target] of PAGES) {
      if (target === 'SETTINGS') await page.getByRole('link', { name: 'Settings' }).first().click();
      else if (target) await nav(page, target).catch(() => {});
      await page.waitForTimeout(400);
      await runAxe(page, `${who.split(' ')[0]}/${name}`);
      if (target) await page.goto(URL0 + '#/');
    }
    await ctx.close();
  }
  const list = Object.values(found);
  return { ok: list.length === 0, actual: list.length ? list.map((v) => `${v.id} (${v.impact}) on ${v.where.slice(0, 3).join(', ')}${v.where.length > 3 ? '…' : ''} e.g. ${v.sample}`).join('; ') : 'No serious/critical violations on 16 page views', details: list };
});

/* ---------------- run ---------------- */
const only = process.argv.find((a) => a.startsWith('--only='))?.slice(7);
const issues = JSON.parse(existsSync('Final_Testing/issues.json') ? readFileSync('Final_Testing/issues.json', 'utf8') : '{}');
const rows = [];
const details = {};
for (const t of T.filter((t) => !only || t.id.startsWith(only))) {
  const { page, ctx, errors } = await fresh();
  let res;
  try {
    res = await t.fn({ page });
    if (errors.length) res = { ok: false, actual: `${res.actual} · page error: ${errors[0]}` };
  } catch (e) {
    res = { ok: false, actual: `Script error: ${e.message.split('\n')[0]}` };
  }
  await ctx.close();
  if (res.details) details[t.id] = res.details;
  rows.push({ ...t, ok: res.ok, actual: String(res.actual ?? '').replace(/\|/g, '/').replace(/\s+/g, ' ') });
  console.log(`${res.ok ? '✓' : '✗'} ${t.id} ${res.ok ? '' : res.actual}`);
}
await browser.close();
server.close();

mkdirSync('Final_Testing', { recursive: true });
const date = new Date().toISOString().slice(0, 10);
const md = `# Test results – Output C

Run: ${date}, ${process.argv.includes('--label') ? process.argv[process.argv.indexOf('--label') + 1] : 'automated run'}.
Generated by \`tools/checks/run-tests.mjs\` on the production build, headless Chromium 130, 390 × 844 (unless stated), reduced motion.
These are scripted checks by the project team (with AI assistance), **not** tests with participants.

**${rows.filter((r) => r.ok).length} passed · ${rows.filter((r) => !r.ok).length} failed** out of ${rows.length}.

| Test ID | Action | Expected result | Actual result | Status | Issue ID |
|---|---|---|---|---|---|
${rows.map((r) => `| ${r.id} | ${r.action} | ${r.expected} | ${r.actual} | ${r.ok ? 'Pass' : '**Fail**'} | ${issues[r.id] ?? ''} |`).join('\n')}
`;
const out = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : 'Final_Testing/test-results.md';
writeFileSync(out, md);
if (Object.keys(details).length) writeFileSync(out.replace('.md', '-details.json'), JSON.stringify(details, null, 2));
console.log(`\nWritten ${out}`);
process.exit(rows.some((r) => !r.ok) ? 1 : 0);
