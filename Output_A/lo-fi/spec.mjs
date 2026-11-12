/**
 * Output A low-fidelity wireframes (source). Build: npm run lofi
 * Based on Task 2 Output A: two personas (casual / performance), calorie and
 * workout tracking, pin metrics in settings, week / month / year charts,
 * "Do you want to see more data?", return buttons, labels.
 */
import { box, btn, chart, choice, dialog, error, hr, img, input, list, nav, text, W } from '../../tools/lofi/dsl.mjs';

const full = W - 32;
const half = (W - 44) / 2;
export const NAV_A = [
  { label: 'Home', to: 'Dashboard' },
  { label: 'Fitness', to: 'Fitness Metrics' },
  { label: 'Nutrition', to: 'Nutrition Metrics' },
  { label: 'Profile', to: 'Profile (settings)' },
];
const top = (title) => [btn(16, 20, 110, 44, '← Return', { to: 'Dashboard' }), img(16, 82, 48, 48, ''), text(76, 114, title, { size: 26, bold: true })];
const ranges = (y) => box(16, y, full, 44, 'Week | Month | Year', { note: 'Progress charts: week, month, year' });

const screens = [
  {
    id: 'A-L01',
    name: 'Create account / log in',
    elements: [
      img(16, 40, 56, 56, 'logo'),
      text(16, 130, 'Wellness Tracker', { size: 30, bold: true }),
      box(16, 160, full, 48, 'Log in | Create account'),
      input(16, 240, full, 'Email'),
      input(16, 320, full, 'Password'),
      btn(16, 400, full, 56, 'Create account', { primary: true, to: 'Questionnaire (persona)' }),
      error(16, 475, full, 'Email already used / password too short', { note: 'Red message; user can try again' }),
      list(16, 560, full, 2, 'Demo profiles (Casual, Performance)', { to: 'Dashboard' }),
    ],
  },
  {
    id: 'A-L02',
    name: 'Questionnaire 1: persona (one question per page)',
    elements: [
      text(16, 40, 'Set up · question 1 of 2', { size: 14 }),
      box(16, 52, full, 8, '', { fill: '#999' }),
      text(16, 110, 'Which describes you best?', { size: 26, bold: true }),
      choice(16, 160, full, 'Casual user', { to: 'Question 2 (shown after choosing)', note: 'Tap = next question' }),
      choice(16, 228, full, 'Performance athlete'),
      error(16, 320, full, 'Choose the profile that fits you to continue.', { note: 'Continue without answer' }),
      btn(16, 760, full, 56, 'Continue', { primary: true, to: 'Question 2' }),
    ],
  },
  {
    id: 'A-L03',
    name: 'Questionnaire 2: fitness goals',
    elements: [
      text(16, 40, 'Set up · question 2 of 2', { size: 14 }),
      text(16, 110, 'What are your fitness goals?', { size: 26, bold: true }),
      choice(16, 160, full, 'Lose weight', { multi: true, checked: true }),
      choice(16, 228, full, 'Build strength', { multi: true }),
      choice(16, 296, full, 'Improve endurance', { multi: true }),
      choice(16, 364, full, 'Stay healthy and active', { multi: true }),
      btn(16, 760, 110, 56, 'Back', { to: 'Question 1' }),
      btn(140, 760, full - 124, 56, 'Create my dashboard', { primary: true, to: 'Dashboard', note: 'Only appears once ≥ 1 goal is chosen' }),
    ],
  },
  {
    id: 'A-L04',
    name: 'Dashboard · Casual (with "more data?" question)',
    elements: [
      text(16, 40, 'Thursday, November 12', { size: 14 }),
      text(16, 72, 'Hello, Sam', { size: 26, bold: true }),
      box(16, 90, full, 150, 'Do you want to see more data?', { lines: ['[No, thanks]   [Yes, show more]'], note: 'Responding: asked at the start (A)' }),
      box(16, 256, full, 200, "Today's workout", { lines: ['Brisk walk · 30 min', 'Calorie goal: 2,100 kcal · 893 eaten'], to: 'Fitness Metrics', note: 'Top: workout + calorie goal (set by user)' }),
      chart(16, 470, full, 170, 'Daily steps gauge', { to: 'Fitness Metrics' }),
      box(16, 654, full, 100, 'Nutrition Metrics: 893 of 2,100 kcal', { to: 'Nutrition Metrics' }),
      nav(NAV_A, 'Home'),
    ],
  },
  {
    id: 'A-L05',
    name: 'Dashboard · Performance (more detail)',
    elements: [
      text(16, 72, 'Hello, Jordan', { size: 26, bold: true }),
      btn(W - 156, 90, 140, 40, 'Pin metrics', { to: 'Profile → Dashboard metrics' }),
      box(16, 140, full, 200, "Today's workout", { lines: ['Full-body strength · 60 min · Hard', 'Calorie goal: 2,800 kcal'], to: 'Fitness Metrics' }),
      chart(16, 354, full, 150, 'Training load, rolling 7 days', { to: 'Fitness Metrics' }),
      box(16, 518, full, 120, 'Nutrition Metrics: kcal + protein / carbs / fat', { to: 'Nutrition Metrics' }),
      box(16, 652, full, 100, 'This week: 3 of 5 workouts', { to: 'Fitness Metrics' }),
      nav(NAV_A, 'Home'),
    ],
  },
  {
    id: 'A-L06',
    name: 'Fitness Metrics (workout summary + history)',
    elements: [
      ...top('Fitness Metrics'),
      btn(16, 150, full, 56, '+ Enter a new workout', { primary: true, to: 'Workout form', note: 'Focus starts here' }),
      box(16, 220, full, 150, 'This week (plan)', { lines: ['Day strip · selected day: exercises'] }),
      box(16, 384, full, 90, 'This month: workouts · time · average'),
      ranges(488),
      chart(16, 540, full, 120, 'Workout minutes'),
      list(16, 680, full, 1, 'Previous workouts', { to: 'Workout detail' }),
      nav(NAV_A, 'Fitness'),
    ],
  },
  {
    id: 'A-L07',
    name: 'Enter a new workout',
    elements: [
      ...top('Fitness Metrics'),
      dialog(110, 734, 'Add a workout', [
        input(16, 60, full - 32, 'Workout name (exercises)'),
        text(16, 150, 'Type: Strength · Cardio · Mobility · Sport', { size: 14 }),
        input(16, 180, (full - 44) / 2, 'Date'),
        input(28 + (full - 44) / 2, 180, (full - 44) / 2, 'Start time'),
        input(16, 260, full - 32, 'Duration (minutes) = time taken'),
        box(16, 335, full - 32, 44, 'Easy | Moderate | Hard'),
        error(16, 410, full - 32, 'Fix the fields marked with an error'),
        btn(16, 650, (full - 44) / 2, 52, 'Cancel', { to: 'Fitness Metrics' }),
        btn(28 + (full - 44) / 2, 650, (full - 44) / 2, 52, 'Save workout', { primary: true, to: 'Fitness + green message' }),
      ]),
    ],
  },
  {
    id: 'A-L08',
    name: 'Viewing a previous workout',
    elements: [
      ...top('Fitness Metrics'),
      dialog(250, 420, 'Leg day · Thu, Nov 5', [box(16, 60, full - 32, 200, 'Type · Duration · Intensity · Calories'), btn(16, 330, full - 32, 52, 'Return', { to: 'Fitness Metrics' })]),
    ],
  },
  {
    id: 'A-L09',
    name: 'Nutrition Metrics',
    elements: [
      ...top('Nutrition Metrics'),
      btn(16, 150, half, 56, 'Scan photo', { primary: true, to: 'Photo recognition (simulated)' }),
      btn(28 + half, 150, half, 56, 'Type it in', { to: 'Meal form (items, quantity)' }),
      box(16, 222, full, 150, 'Today: calorie ring · kcal left'),
      list(16, 390, full, 2, "Today's meals", { to: 'Meal detail' }),
      ranges(560),
      chart(16, 612, full, 140, 'Calorie intake (week / month / year)'),
      nav(NAV_A, 'Nutrition'),
    ],
    notes: ['Then "Previous meals" by day (history).'],
  },
  {
    id: 'A-L10',
    name: 'Enter a new meal (items, quantity)',
    elements: [
      ...top('Nutrition Metrics'),
      dialog(110, 734, 'Enter food manually', [
        input(16, 60, full - 32, 'What did you eat?'),
        text(16, 150, 'Meal: Breakfast · Lunch · Snack · Dinner', { size: 14 }),
        input(16, 180, full - 32, 'Quantity (servings)', { note: 'Task 2: items eaten, quantity' }),
        input(16, 260, full - 32, 'Calories (kcal)'),
        input(16, 340, (full - 48) / 3, 'Protein'),
        input(24 + (full - 48) / 3, 340, (full - 48) / 3, 'Carbs'),
        input(32 + (2 * (full - 48)) / 3, 340, (full - 48) / 3, 'Fat'),
        btn(16, 650, (full - 44) / 2, 52, 'Cancel'),
        btn(28 + (full - 44) / 2, 650, (full - 44) / 2, 52, 'Save food', { primary: true, to: 'Nutrition + green message' }),
      ]),
    ],
  },
  {
    id: 'A-L11',
    name: 'Profile: user info, persona, pin metrics (settings)',
    elements: [
      btn(16, 20, 110, 44, '← Return', { to: 'Dashboard' }),
      text(16, 108, 'Profile', { size: 28, bold: true }),
      box(16, 126, full, 150, 'Persona and goals', { lines: ['○ Casual  ● Performance', 'Goals chips · [Save persona]'], to: 'Confirm "Change your persona?"' }),
      box(16, 290, full, 210, 'Dashboard metrics', { lines: ["1. Today's workout  ↑ ↓ [Unpin metric]", '2. Training load  ↑ ↓ [Unpin metric]', 'Not pinned: Daily steps [Pin metric]'], note: 'Manipulating: pin metrics in settings (A)' }),
      box(16, 514, full, 110, 'Personal information', { lines: ['Name · Age · Weight · Height'], to: 'Confirm "Save?"' }),
      box(16, 638, full, 110, 'Daily goals (calorie goal)'),
      nav(NAV_A, 'Profile'),
    ],
    notes: ['Then Display ("Show more data"), Prototype tools, Log out, Delete account ("Are you sure?").'],
  },
  {
    id: 'A-L12',
    name: 'Confirmation: change persona',
    elements: [
      text(16, 108, 'Profile', { size: 28, bold: true }),
      nav(NAV_A, 'Profile'),
      dialog(220, 420, 'Change your persona to Casual?', [
        text(16, 70, 'Your dashboard will show:', {}),
        list(16, 80, full - 32, 2, ''),
        btn(16, 330, (full - 44) / 2, 52, 'Cancel', { to: 'Profile unchanged', note: 'Focus starts on Cancel' }),
        btn(28 + (full - 44) / 2, 330, (full - 44) / 2, 52, 'Yes, change it', { primary: true, to: 'Dashboard updated' }),
      ]),
    ],
  },
];

export default {
  title: 'Output A – Initial design',
  intro: 'Task 2 Output A: two personas (casual user, performance athlete), calorie and workout tracking, metrics pinned from the Profile (settings), progress charts for the past week, month and year, and the "Do you want to see more data?" question. Numbered badges show where each control leads.',
  screens,
  flow: {
    title: 'Output A – navigation flow',
    nodes: [
      { id: 'auth', label: 'Create account / log in', x: 20, y: 200 },
      { id: 'q1', label: 'Q1 persona', x: 230, y: 60 },
      { id: 'q2', label: 'Q2 fitness goals', x: 460, y: 60 },
      { id: 'dash', label: 'Dashboard (Casual / Performance)', x: 460, y: 220 },
      { id: 'prof', label: 'Profile: info, persona, pin metrics', x: 700, y: 220 },
      { id: 'fit', label: 'Fitness Metrics', x: 300, y: 400 },
      { id: 'nut', label: 'Nutrition Metrics', x: 620, y: 400 },
      { id: 'fitd', label: 'New workout · previous workout', x: 300, y: 560 },
      { id: 'nutd', label: 'New meal · photo · past meal', x: 620, y: 560 },
    ],
    edges: [
      { from: 'auth', to: 'q1', label: 'Create account' },
      { from: 'q1', to: 'q2', both: true, label: 'answer / Back' },
      { from: 'q2', to: 'dash', label: 'Create my dashboard' },
      { from: 'auth', to: 'dash', label: 'Log in' },
      { from: 'dash', to: 'prof', both: true, label: 'Profile tab' },
      { from: 'dash', to: 'fit', both: true, label: 'widget · Return' },
      { from: 'dash', to: 'nut', both: true },
      { from: 'fit', to: 'fitd', both: true },
      { from: 'nut', to: 'nutd', both: true },
    ],
    legend: 'Bottom bar: Home, Fitness, Nutrition, Profile. Every metrics page has a Return button to the dashboard.',
  },
};
