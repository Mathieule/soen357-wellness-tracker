/**
 * Output B screens exported by tools/screenshots/capture.mjs.
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
  // Output B: settings moved from the navigation bar to the top-right button.
  if (label === 'Profile') return page.getByRole('link', { name: 'Settings' }).click();
  await page.getByRole('navigation', { name: 'Main menu' }).getByRole('link', { name: label }).click();
}

export const scenarios = [
  { name: 'B01-login', run: async () => {} },
  {
    name: 'B02-login-error',
    run: async (page) => {
      await page.getByLabel('Email').fill('demo@example.com');
      await page.getByLabel('Password').fill('wrongpass1');
      await page.getByRole('button', { name: 'Log in' }).click();
    },
  },
  {
    name: 'B03-signup-validation',
    run: async (page) => {
      await page.getByLabel('Email').fill('new-user@example');
      await page.getByLabel('Password').fill('short');
      await page.getByRole('button', { name: 'Create account' }).click();
    },
  },
  {
    name: 'B04-signup-email-exists',
    run: async (page) => {
      await page.getByLabel('Email').fill('demo@example.com');
      await page.getByLabel('Password').fill('Another123');
      await page.getByRole('button', { name: 'Create account' }).click();
    },
  },
  {
    name: 'B05-questionnaire-q1',
    run: async (page) => {
      await page.getByLabel('Email').fill('sam.lee@example.com');
      await page.getByLabel('Password').fill('Welcome123');
      await page.getByRole('button', { name: 'Create account' }).click();
      await page.getByText('How often do you exercise?').waitFor();
    },
  },
  {
    name: 'B06-questionnaire-q2',
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
    name: 'B07-questionnaire-q3-error',
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
  { name: 'B08-dashboard', fullPage: true, run: login },
  {
    name: 'B09-fitness',
    fullPage: true,
    run: async (page) => {
      await login(page);
      await goTo(page, 'Fitness');
    },
  },
  {
    name: 'B10-fitness-add-exercise-errors',
    run: async (page) => {
      await login(page);
      await goTo(page, 'Fitness');
      await page.getByRole('button', { name: 'Add exercise' }).click();
      await page.getByRole('button', { name: 'Save exercise' }).click();
    },
  },
  {
    name: 'B11-fitness-exercise-saved',
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
    name: 'B12-fitness-calendar',
    run: async (page) => {
      await login(page);
      await goTo(page, 'Fitness');
      await page.getByRole('button', { name: 'Calendar' }).click();
    },
  },
  {
    name: 'B13-fitness-workout-detail',
    run: async (page) => {
      await login(page);
      await goTo(page, 'Fitness');
      await page.getByRole('region', { name: 'Exercise log' }).getByRole('button').first().click();
    },
  },
  {
    name: 'B14-sleep',
    fullPage: true,
    run: async (page) => {
      await login(page);
      await goTo(page, 'Sleep');
    },
  },
  {
    name: 'B15-sleep-detail',
    run: async (page) => {
      await login(page);
      await goTo(page, 'Sleep');
      await page.getByRole('region', { name: 'Sleep log' }).getByRole('button').nth(1).click();
    },
  },
  {
    name: 'B16-sleep-edit',
    run: async (page) => {
      await login(page);
      await goTo(page, 'Sleep');
      await page.getByRole('button', { name: 'Add or edit sleep' }).click();
    },
  },
  {
    name: 'B17-nutrition',
    fullPage: true,
    run: async (page) => {
      await login(page);
      await goTo(page, 'Nutrition');
    },
  },
  {
    name: 'B18-nutrition-add-food',
    run: async (page) => {
      await login(page);
      await goTo(page, 'Nutrition');
      await page.getByRole('button', { name: 'Add food' }).click();
    },
  },
  {
    name: 'B19-nutrition-prediction',
    run: async (page) => {
      await login(page);
      await goTo(page, 'Nutrition');
      await page.getByRole('button', { name: 'Add food' }).click();
      await page.getByRole('button', { name: /Salmon dinner/ }).click();
      await page.getByText('We think this is').waitFor();
    },
  },
  {
    name: 'B20-nutrition-recognition-failed',
    run: async (page) => {
      await login(page);
      await goTo(page, 'Nutrition');
      await page.getByRole('button', { name: 'Add food' }).click();
      await page.getByRole('button', { name: /Blurry photo/ }).click();
      await page.getByRole('alert').waitFor();
    },
  },
  {
    name: 'B21-nutrition-nutrient-details',
    run: async (page) => {
      await login(page);
      await goTo(page, 'Nutrition');
      await page.getByRole('button', { name: 'Nutrient details' }).click();
    },
  },
  {
    name: 'B22-settings',
    fullPage: true,
    run: async (page) => {
      await login(page);
      await goTo(page, 'Profile');
    },
  },
  {
    name: 'B23-settings-confirm-persona',
    run: async (page) => {
      await login(page);
      await goTo(page, 'Profile');
      await page.getByText('Casual', { exact: true }).click();
      await page.getByRole('button', { name: 'Save fitness profile' }).click();
    },
  },
  {
    name: 'B24-settings-delete-confirm',
    run: async (page) => {
      await login(page);
      await goTo(page, 'Profile');
      await page.getByRole('button', { name: 'Delete account' }).click();
    },
  },
  /* ---- New in Output B ---- */
  {
    name: 'B25-dashboard-customize',
    fullPage: true,
    run: async (page) => {
      await login(page);
      await page.getByRole('button', { name: 'Customize dashboard' }).click();
    },
  },
  {
    name: 'B26-dashboard-reordered',
    run: async (page) => {
      await login(page);
      await page.getByRole('button', { name: 'Customize dashboard' }).click();
      await page.getByRole('button', { name: 'Move Sleep Metrics up' }).click();
      await page.getByRole('button', { name: 'Move Sleep Metrics up' }).click();
    },
  },
  {
    name: 'B27-dashboard-unpinned-more-metrics',
    fullPage: true,
    run: async (page) => {
      await login(page);
      await page.getByRole('button', { name: 'Customize dashboard' }).click();
      await page.getByRole('button', { name: 'Unpin Nutrition Metrics' }).click();
      await page.getByRole('button', { name: 'Done customizing' }).click();
    },
  },
  {
    name: 'B28-keyboard-arrow-up-to-nav',
    run: async (page) => {
      await login(page);
      await page.getByRole('link', { name: /Fitness Metrics/ }).click();
      await page.getByRole('button', { name: 'Add exercise' }).waitFor();
      await page.keyboard.press('ArrowUp');
    },
  },
  {
    name: 'B29-keyboard-focus-stays-on-nav',
    run: async (page) => {
      await login(page);
      await page.getByRole('navigation', { name: 'Main menu' }).getByRole('link', { name: 'Sleep' }).focus();
      await page.keyboard.press('Enter');
      await page.getByRole('heading', { name: 'Sleep Metrics' }).waitFor();
      await page.keyboard.press('ArrowLeft');
    },
  },
];
