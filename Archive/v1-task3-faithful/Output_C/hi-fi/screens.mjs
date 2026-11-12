/**
 * Output C screens exported by tools/screenshots/capture.mjs.
 * Each scenario starts from empty storage on the login page.
 */
const DEMO = { email: 'demo@example.com', password: 'Demo1234' };

async function login(page) {
  await page.getByLabel('Email').fill(DEMO.email);
  await page.getByLabel('Password').fill(DEMO.password);
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.getByRole('heading', { level: 1 }).waitFor();
}

async function goTo(page, label) {
  await page.getByRole('navigation', { name: 'Main menu' }).getByRole('link', { name: label }).click();
}

export const scenarios = [
  { name: 'C-preview-01-dashboard', fullPage: true, run: login },
  {
    name: 'C-preview-02-fitness',
    fullPage: true,
    run: async (page) => {
      await login(page);
      await goTo(page, 'Fitness');
    },
  },
  {
    name: 'C-preview-03-fitness-day-selected',
    run: async (page) => {
      await login(page);
      await goTo(page, 'Fitness');
      await page.getByRole('button', { name: /^Monday/ }).click();
      await page.getByRole('heading', { name: /^Monday/ }).scrollIntoViewIfNeeded();
    },
  },
  {
    name: 'C-preview-04-nutrition',
    fullPage: true,
    run: async (page) => {
      await login(page);
      await goTo(page, 'Nutrition');
    },
  },
  {
    name: 'C-preview-05-nutrition-manual',
    run: async (page) => {
      await login(page);
      await goTo(page, 'Nutrition');
      await page.getByRole('button', { name: 'Enter manually' }).click();
    },
  },
  {
    name: 'C-preview-06-nutrition-prediction-edit',
    run: async (page) => {
      await login(page);
      await goTo(page, 'Nutrition');
      await page.getByRole('button', { name: 'Scan a photo' }).click();
      await page.getByRole('button', { name: /Salmon dinner/ }).click();
      await page.getByText('We think this is').waitFor();
    },
  },
];
