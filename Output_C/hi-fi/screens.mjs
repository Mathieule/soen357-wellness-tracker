/**
 * Output C high-fidelity screens, exported from the running prototype by
 * tools/screenshots/capture.mjs (390 × 844 unless a viewport is given).
 * Each scenario starts from empty storage on the welcome screen.
 */
const demo = (who) => async (page) => {
  await page.getByRole('button', { name: new RegExp(`^${who}`) }).click();
  await page.getByRole('heading', { level: 1, name: /^Hello/ }).waitFor();
};
const casual = demo('Sam Lee');
const training = demo('Alex Martin');
const performance = demo('Jordan Rivera');
const nav = (label) => async (page) => page.getByRole('navigation', { name: 'Main menu' }).getByRole('link', { name: label }).first().click();

const pick = async (page, text) => { await page.getByText(text, { exact: true }).click(); await page.waitForTimeout(450); };
async function newAccount(page) {
  await page.getByRole('radio', { name: 'Create account' }).check({ force: true });
  await page.getByLabel('Email').fill('nina@example.com');
  await page.getByLabel('Password').fill('Welcome123');
  await page.getByRole('button', { name: 'Create account' }).last().click();
  await page.getByLabel('First name').fill('Nina');
}
const cont = (page) => page.getByRole('button', { name: 'Continue' }).click();

export const scenarios = [
  { name: 'C01-welcome', fullPage: true, run: async () => {} },
  {
    name: 'C02-login-errors',
    run: async (page) => {
      await page.getByLabel('Email').fill('alex@example');
      await page.getByRole('button', { name: 'Log in' }).click();
    },
  },
  { name: 'C03-onboarding-persona', run: async (page) => { await newAccount(page); await cont(page); await page.getByText('Which describes you best?').waitFor(); } },
  {
    name: 'C04-onboarding-sessions',
    run: async (page) => {
      await newAccount(page);
      await cont(page);
      await pick(page, 'Regular training');
      await pick(page, 'Regular');
      await page.getByRole('button', { name: 'Increase Workouts per week' }).click();
    },
  },
  {
    name: 'C05-onboarding-error',
    run: async (page) => {
      await newAccount(page);
      await cont(page);
      await pick(page, 'Regular training');
      await pick(page, 'Regular');
      await cont(page);
      await cont(page);
    },
  },
  {
    name: 'C06-onboarding-goals-preview',
    fullPage: true,
    run: async (page) => {
      await newAccount(page);
      await cont(page);
      await pick(page, 'Regular training');
      await pick(page, 'Regular');
      await cont(page);
      await page.getByText('Workouts and activity').click();
      await page.getByText('Sleep', { exact: true }).click();
      await cont(page);
      await page.getByText('Build strength', { exact: true }).click();
    },
  },
  { name: 'C07-dashboard-casual', fullPage: true, run: casual },
  { name: 'C08-dashboard-training', fullPage: true, run: training },
  { name: 'C09-dashboard-performance', fullPage: true, run: performance },
  { name: 'C10-dashboard-customize', fullPage: true, run: async (page) => { await training(page); await page.getByRole('button', { name: 'Customize' }).click(); } },
  { name: 'C11-activity-casual', fullPage: true, run: async (page) => { await casual(page); await nav('Fitness')(page); } },
  { name: 'C12-training-training', fullPage: true, run: async (page) => { await training(page); await nav('Fitness')(page); } },
  { name: 'C13-training-performance', fullPage: true, run: async (page) => { await performance(page); await nav('Fitness')(page); } },
  { name: 'C14-workout-errors', run: async (page) => { await training(page); await nav('Fitness')(page); await page.getByRole('button', { name: 'Enter a new workout' }).click(); await page.getByRole('button', { name: 'Save workout' }).click(); } },
  { name: 'C15-calendar', run: async (page) => { await training(page); await nav('Fitness')(page); await page.getByRole('button', { name: 'Open' }).click(); } },
  { name: 'C16-sleep-training', fullPage: true, run: async (page) => { await training(page); await nav('Sleep')(page); } },
  { name: 'C17-sleep-sheet', run: async (page) => { await training(page); await nav('Sleep')(page); await page.getByRole('button', { name: 'Enter a new sleep log' }).click(); } },
  { name: 'C18-nutrition-performance', fullPage: true, run: async (page) => { await performance(page); await nav('Nutrition')(page); } },
  { name: 'C19-photo-prediction', run: async (page) => { await training(page); await nav('Nutrition')(page); await page.getByRole('button', { name: 'Scan photo' }).click(); await page.getByRole('button', { name: /Salmon dinner/ }).click(); await page.getByText('We think this is').waitFor(); } },
  { name: 'C20-photo-failed', run: async (page) => { await training(page); await nav('Nutrition')(page); await page.getByRole('button', { name: 'Scan photo' }).click(); await page.getByRole('button', { name: /Blurry photo/ }).click(); await page.getByRole('alert').waitFor(); } },
  { name: 'C21-meal-manual', run: async (page) => { await casual(page); await nav('Nutrition')(page); await page.getByRole('button', { name: 'Type it in' }).click(); } },
  { name: 'C22-settings', fullPage: true, run: async (page) => { await training(page); await page.getByRole('link', { name: 'Settings' }).first().click(); } },
  {
    name: 'C23-new-account-empty',
    fullPage: true,
    run: async (page) => {
      await newAccount(page);
      await cont(page);
      await pick(page, 'Casual user');
      await pick(page, 'Beginner');
      await cont(page);
      await page.getByText('Workouts and activity').click();
      await cont(page);
      await page.getByText('Stay healthy and active', { exact: true }).click();
      await page.getByRole('button', { name: 'Create my dashboard' }).click();
      await page.getByRole('heading', { level: 1, name: /^Hello/ }).waitFor();
    },
  },
  {
    name: 'C24-sync-failed',
    run: async (page) => {
      await page.evaluate(() => localStorage.setItem('wellness-output-c:failNextSync', 'true'));
      await page.reload();
      await training(page);
      await page.getByRole('alert').waitFor();
    },
  },
  { name: 'C25-desktop-dashboard', viewport: { width: 1280, height: 900 }, run: performance },
  { name: 'C26-large-text-mode', fullPage: true, run: async (page) => { await training(page); await page.getByRole('link', { name: 'Settings' }).first().click(); await page.getByRole('switch', { name: 'Large text and buttons' }).click(); await page.getByRole('link', { name: 'Return to the dashboard' }).click(); await page.getByRole('heading', { level: 1, name: /^Hello/ }).waitFor(); } },
  { name: 'C27-casual-more-data-prompt', run: casual },
];
