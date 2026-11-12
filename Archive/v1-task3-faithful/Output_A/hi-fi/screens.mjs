/**
 * Output A screens exported by tools/screenshots/capture.mjs.
 * Each scenario starts from empty storage on the login page.
 */
const DEMO = { email: 'demo@example.com', password: 'Demo1234' };

async function login(page) {
  await page.getByLabel('Email').fill(DEMO.email);
  await page.getByLabel('Password', { exact: false }).first().fill(DEMO.password);
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.getByRole('heading', { name: 'Today', exact: true, level: 1 }).waitFor();
}

async function goTo(page, label) {
  await page.getByRole('navigation', { name: 'Main menu' }).getByRole('link', { name: label }).click();
}

export const scenarios = [
  { name: 'A01-login', run: async () => {} },
  {
    name: 'A02-login-error',
    run: async (page) => {
      await page.getByLabel('Email').fill('demo@example.com');
      await page.getByLabel('Password').fill('wrongpass1');
      await page.getByRole('button', { name: 'Log in' }).click();
    },
  },
  {
    name: 'A03-signup-validation',
    run: async (page) => {
      await page.getByLabel('Email').fill('new-user@example');
      await page.getByLabel('Password').fill('short');
      await page.getByRole('button', { name: 'Create account' }).click();
    },
  },
  {
    name: 'A04-signup-email-exists',
    run: async (page) => {
      await page.getByLabel('Email').fill('demo@example.com');
      await page.getByLabel('Password').fill('Another123');
      await page.getByRole('button', { name: 'Create account' }).click();
    },
  },
  {
    name: 'A05-questionnaire-q1',
    run: async (page) => {
      await page.getByLabel('Email').fill('sam.lee@example.com');
      await page.getByLabel('Password').fill('Welcome123');
      await page.getByRole('button', { name: 'Create account' }).click();
      await page.getByText('How often do you exercise?').waitFor();
    },
  },
  {
    name: 'A06-questionnaire-q2',
    run: async (page) => {
      await page.getByLabel('Email').fill('sam.lee@example.com');
      await page.getByLabel('Password').fill('Welcome123');
      await page.getByRole('button', { name: 'Create account' }).click();
      await page.getByText('1 to 2 times a week').click();
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByText('Casual', { exact: true }).click();
    },
  },
  {
    name: 'A07-questionnaire-q3-error',
    run: async (page) => {
      await page.getByLabel('Email').fill('sam.lee@example.com');
      await page.getByLabel('Password').fill('Welcome123');
      await page.getByRole('button', { name: 'Create account' }).click();
      await page.getByText('1 to 2 times a week').click();
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByText('Casual', { exact: true }).click();
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Create my dashboard' }).click();
    },
  },
  { name: 'A08-dashboard', fullPage: true, run: login },
  {
    name: 'A09-fitness',
    fullPage: true,
    run: async (page) => {
      await login(page);
      await goTo(page, 'Fitness');
    },
  },
  {
    name: 'A10-fitness-add-exercise-errors',
    run: async (page) => {
      await login(page);
      await goTo(page, 'Fitness');
      await page.getByRole('button', { name: 'Add exercise' }).click();
      await page.getByRole('button', { name: 'Save exercise' }).click();
    },
  },
  {
    name: 'A11-fitness-exercise-saved',
    run: async (page) => {
      await login(page);
      await goTo(page, 'Fitness');
      await page.getByRole('button', { name: 'Add exercise' }).click();
      await page.getByLabel('Exercise name (required)').fill('Evening swim');
      await page.getByLabel('Type').selectOption('Cardio');
      await page.getByLabel('Duration in minutes (required)').fill('40');
      await page.getByRole('button', { name: 'Save exercise' }).click();
      await page.getByRole('status').waitFor();
    },
  },
  {
    name: 'A12-fitness-calendar',
    run: async (page) => {
      await login(page);
      await goTo(page, 'Fitness');
      await page.getByRole('button', { name: 'Calendar' }).click();
    },
  },
  {
    name: 'A13-fitness-workout-detail',
    run: async (page) => {
      await login(page);
      await goTo(page, 'Fitness');
      await page.getByRole('region', { name: 'Exercise log' }).getByRole('button').first().click();
    },
  },
  {
    name: 'A14-sleep',
    fullPage: true,
    run: async (page) => {
      await login(page);
      await goTo(page, 'Sleep');
    },
  },
  {
    name: 'A15-sleep-detail',
    run: async (page) => {
      await login(page);
      await goTo(page, 'Sleep');
      await page.getByRole('region', { name: 'Sleep log' }).getByRole('button').nth(1).click();
    },
  },
  {
    name: 'A16-sleep-edit',
    run: async (page) => {
      await login(page);
      await goTo(page, 'Sleep');
      await page.getByRole('button', { name: 'Add or edit sleep' }).click();
    },
  },
  {
    name: 'A17-nutrition',
    fullPage: true,
    run: async (page) => {
      await login(page);
      await goTo(page, 'Nutrition');
    },
  },
  {
    name: 'A18-nutrition-add-food',
    run: async (page) => {
      await login(page);
      await goTo(page, 'Nutrition');
      await page.getByRole('button', { name: 'Add food' }).click();
    },
  },
  {
    name: 'A19-nutrition-prediction',
    run: async (page) => {
      await login(page);
      await goTo(page, 'Nutrition');
      await page.getByRole('button', { name: 'Add food' }).click();
      await page.getByRole('button', { name: /Salmon dinner/ }).click();
      await page.getByText('We think this is').waitFor();
    },
  },
  {
    name: 'A20-nutrition-recognition-failed',
    run: async (page) => {
      await login(page);
      await goTo(page, 'Nutrition');
      await page.getByRole('button', { name: 'Add food' }).click();
      await page.getByRole('button', { name: /Blurry photo/ }).click();
      await page.getByRole('alert').waitFor();
    },
  },
  {
    name: 'A21-nutrition-nutrient-details',
    run: async (page) => {
      await login(page);
      await goTo(page, 'Nutrition');
      await page.getByRole('button', { name: 'Nutrient details' }).click();
    },
  },
  {
    name: 'A22-profile',
    fullPage: true,
    run: async (page) => {
      await login(page);
      await goTo(page, 'Profile');
    },
  },
  {
    name: 'A23-profile-confirm-persona',
    run: async (page) => {
      await login(page);
      await goTo(page, 'Profile');
      await page.getByText('Casual', { exact: true }).click();
      await page.getByRole('button', { name: 'Save fitness profile' }).click();
    },
  },
  {
    name: 'A24-profile-delete-confirm',
    run: async (page) => {
      await login(page);
      await goTo(page, 'Profile');
      await page.getByRole('button', { name: 'Delete account' }).click();
    },
  },
];
