/**
 * Output A low-fidelity wireframes (source). Build with:  npm run lofi
 * Follows Task 3 Output A (components C1–C21) and the Task 2 screen hierarchy.
 */
import { box, btn, chart, choice, dialog, error, hr, img, input, list, nav, success, text, title, W } from '../../tools/lofi/dsl.mjs';

export const NAV_A = [
  { label: 'Home', to: 'Dashboard' },
  { label: 'Nutrition', to: 'Nutrition Metrics' },
  { label: 'Fitness', to: 'Fitness Metrics' },
  { label: 'Sleep', to: 'Sleep Metrics' },
  { label: 'Profile', to: 'Profile & settings' },
];

const full = W - 32;
const half = (W - 44) / 2;

export const fitnessPage = [
  title('Fitness Metrics'),
  box(16, 80, half, 230, "Today's routine", { id: 'routine', lines: ['Warm-up 10 min', 'Intervals 6 × 800 m', 'Cool-down 10 min'], note: 'C13 routine (left)' }),
  box(28 + half, 80, half, 230, "Today's activity", { id: 'activity', lines: ['Steps 4,730', 'Active min 26', 'Burned 1,052 kcal'], note: 'C14 activity (right half)' }),
  btn(40 + half, 255, half - 24, 44, 'Calendar', { id: 'calendar', to: 'Activity calendar pop-up' }),
  btn(16, 330, full, 56, '+ Add exercise (red)', { id: 'add', primary: true, to: 'Add exercise pop-up', note: 'Keyboard focus starts here' }),
  list(16, 420, full, 5, 'Exercise log (newest first)', { id: 'log', to: 'Workout detail pop-up' }),
];

export const sleepPage = [
  title('Sleep Metrics'),
  box(16, 80, full, 270, 'Last night  7 h 45 min', { id: 'last' }),
  chart(32, 130, full - 32, 150, 'Sleep stages line graph (shades of blue)', { id: 'graph', note: 'C17 graph, stage names on axis' }),
  text(32, 310, 'Deep 1h43 · Light 3h49 · REM 2h03 · Awake 10m', { size: 13, id: 'totals' }),
  btn(16, 370, full, 56, '+ Add or edit sleep', { id: 'add', primary: true, to: 'Add / edit sleep pop-up', note: 'Keyboard focus starts here' }),
  list(16, 460, full, 4, 'Sleep log', { id: 'log', to: 'Sleep detail pop-up' }),
];

export const nutritionPage = [
  title('Nutrition Metrics'),
  box(16, 80, full, 200, "Today's goals", { id: 'goals' }),
  chart(32, 116, 110, 110, 'ring', { id: 'ring' }),
  text(160, 150, '770 kcal of 2,800 kcal goal · 2,030 left', { size: 15, max: 22, id: 'kcal' }),
  btn(32, 228, full - 32, 40, 'Nutrient details', { id: 'details', to: 'Nutrient details pop-up', note: 'C18 in-depth nutrient data' }),
  btn(16, 300, full, 56, '+ Add food (light green bar)', { id: 'add', primary: true, to: 'Add food pop-up', note: 'C21; keyboard focus starts here' }),
  list(16, 390, full, 5, "Today's food log", { id: 'log', to: 'Meal detail pop-up' }),
];

export const dashboard = [
  title('Today'),
  text(16, 84, 'Hello, Alex. Wednesday, November 11.', { id: 'greeting' }),
  box(16, 110, full, 250, 'Fitness widget (top half gray)', {
    id: 'w-fitness',
    lines: ["Today's routine: warm-up, intervals…", "Today's activity: 4,730 steps · 26 min"],
    to: 'Fitness Metrics',
    note: 'Focus starts here; ↓ moves down the widgets',
  }),
  box(16, 290, full, 70, 'Fitness Metrics  (bottom half red)  ›', { id: 'w-fitness-bar', fill: '#c9c9c9' }),
  box(16, 380, half, 180, 'Nutrition (green)', { id: 'w-nutrition', lines: ['770', 'of 2,800 kcal'], to: 'Nutrition Metrics' }),
  box(28 + half, 380, half, 180, 'Sleep (blue)', { id: 'w-sleep', lines: ['7 h 45 min', 'last night'], to: 'Sleep Metrics' }),
  text(16, 600, 'Only metrics chosen in the questionnaire are shown. Order and visibility are changed in Profile & settings.', { size: 13, max: 48, id: 'hint' }),
];

const screens = [
  {
    id: 'A-L01',
    name: 'Sign up / log in (C1)',
    elements: [
      text(16, 90, 'Welcome to Wellness Tracker', { size: 24, bold: true }),
      text(16, 130, 'Log in, or create a new account to get started.'),
      input(16, 190, full, 'Email', { note: 'Focus starts in Email, then Password' }),
      input(16, 280, full, 'Password'),
      text(16, 360, 'At least 8 characters, with a letter and a number.', { size: 13 }),
      btn(16, 390, full, 56, 'Log in', { primary: true, to: 'Dashboard' }),
      btn(16, 460, full, 56, 'Create account', { to: 'Questionnaire Q1' }),
      error(16, 540, full, 'email or password is incorrect / email already used', { note: 'Shown on wrong login or existing email' }),
      box(16, 620, full, 80, 'Prototype note: demo account', { dashed: true }),
    ],
    notes: ['Already logged-in users skip this page and land on the dashboard.'],
  },
  {
    id: 'A-L02',
    name: 'Questionnaire, one question per page (C2)',
    elements: [
      text(16, 52, 'Set up your profile · Question 1 of 3', { size: 15 }),
      box(16, 66, full, 10, '', { fill: '#999' }),
      text(16, 130, 'How often do you exercise?', { size: 22, bold: true }),
      hr(160, { note: 'Horizontal bar separates question and answers' }),
      choice(16, 180, full, 'Rarely or never', { note: 'Focus starts on the first answer' }),
      choice(16, 248, full, '1 to 2 times a week', { checked: true }),
      choice(16, 316, full, '3 to 4 times a week'),
      choice(16, 384, full, '5 or more times a week'),
      text(16, 470, 'Answers are 16 px apart.', { size: 13 }),
      btn(16, 760, full, 56, 'Next', { primary: true, to: 'Questionnaire Q2 / Q3' }),
    ],
    notes: ['Q2: "Which best describes your needs?" Casual / Performance (one answer).'],
  },
  {
    id: 'A-L03',
    name: 'Questionnaire Q3 with error (C2)',
    elements: [
      text(16, 52, 'Set up your profile · Question 3 of 3', { size: 15 }),
      box(16, 66, full, 10, '', { fill: '#555' }),
      text(16, 130, 'What data is important to you? (choose at least one)', { size: 20, bold: true, max: 30 }),
      hr(190),
      choice(16, 210, full, 'Fitness and activity', { multi: true }),
      choice(16, 278, full, 'Nutrition', { multi: true }),
      choice(16, 346, full, 'Sleep', { multi: true }),
      error(16, 420, full, 'Choose at least one type of data.', { note: 'Shown when Create is pressed with nothing selected' }),
      btn(16, 760, 110, 56, 'Back', { to: 'Questionnaire Q2' }),
      btn(140, 760, full - 124, 56, 'Create my dashboard', { primary: true, to: 'Dashboard' }),
    ],
  },
  { id: 'A-L04', name: 'Dashboard (C4, C6–C10)', elements: [...dashboard, nav(NAV_A, 'Home')] },
  { id: 'A-L05', name: 'Fitness Metrics (C11–C14)', elements: [...fitnessPage, nav(NAV_A, 'Fitness')] },
  {
    id: 'A-L06',
    name: 'Add exercise pop-up (C11)',
    elements: [
      ...fitnessPage,
      nav(NAV_A, 'Fitness'),
      dialog(70, 700, 'Add exercise', [
        input(16, 60, full - 32, 'Exercise name (required)'),
        input(16, 140, full - 32, 'Type'),
        input(16, 220, (full - 44) / 2, 'Date'),
        input(28 + (full - 44) / 2, 220, (full - 44) / 2, 'Start time'),
        input(16, 300, full - 32, 'Duration in minutes (required)'),
        input(16, 380, full - 32, 'Calories burned (optional)'),
        error(16, 460, full - 32, 'Fix the fields marked with an error', { note: 'Field + summary errors' }),
        btn(16, 620, (full - 44) / 2, 52, 'Cancel', { to: 'Fitness Metrics' }),
        btn(28 + (full - 44) / 2, 620, (full - 44) / 2, 52, 'Save exercise', { primary: true, to: 'Fitness + success message' }),
      ]),
    ],
  },
  {
    id: 'A-L07',
    name: 'Activity calendar pop-up (C14)',
    elements: [
      ...fitnessPage,
      nav(NAV_A, 'Fitness'),
      dialog(110, 620, 'Activity calendar', [
        btn(16, 60, 48, 44, '‹'),
        text(130, 88, 'November 2026', { bold: true }),
        btn(full - 64, 60, 48, 44, '›'),
        box(16, 120, full - 32, 270, 'Month grid: day buttons, dot = data', { note: 'Arrow keys move between days' }),
        box(16, 410, full - 32, 120, 'Selected day', { lines: ['Steps · Active min · Burned kcal'] }),
      ]),
    ],
  },
  {
    id: 'A-L08',
    name: 'Workout detail pop-up',
    elements: [
      ...fitnessPage,
      nav(NAV_A, 'Fitness'),
      dialog(220, 380, 'Leg day · Thu, Nov 5', [
        box(16, 60, full - 32, 200, 'Type · Duration · Calories · Start time · Notes'),
        btn(16, 300, full - 32, 52, 'Close', { to: 'Fitness Metrics' }),
      ]),
    ],
  },
  { id: 'A-L09', name: 'Sleep Metrics (C15–C17)', elements: [...sleepPage, nav(NAV_A, 'Sleep')] },
  {
    id: 'A-L10',
    name: 'Sleep detail and add / edit sleep pop-ups (C15, C16)',
    elements: [
      ...sleepPage,
      nav(NAV_A, 'Sleep'),
      dialog(110, 560, 'Add sleep / Edit sleep', [
        input(16, 60, full - 32, 'Date you woke up'),
        input(16, 140, (full - 44) / 2, 'Bedtime'),
        input(28 + (full - 44) / 2, 140, (full - 44) / 2, 'Wake-up time'),
        text(16, 240, 'Total sleep: 8 h (updates while typing)', { size: 14 }),
        text(16, 270, 'Note: sleep stages are estimated (simulated).', { size: 13 }),
        box(16, 300, full - 32, 60, 'Info: replaces the sleep already saved for this date', { dashed: true }),
        btn(16, 480, (full - 44) / 2, 52, 'Cancel'),
        btn(28 + (full - 44) / 2, 480, (full - 44) / 2, 52, 'Save sleep', { primary: true, to: 'Sleep + success message' }),
      ]),
    ],
    notes: ['Tapping a sleep log row opens "Sleep on <date>" with the stage graph and an "Edit sleep" button that opens this form.'],
  },
  { id: 'A-L11', name: 'Nutrition Metrics (C18–C20)', elements: [...nutritionPage, nav(NAV_A, 'Nutrition')] },
  {
    id: 'A-L12',
    name: 'Add food: take photo (C21)',
    elements: [
      ...nutritionPage,
      nav(NAV_A, 'Nutrition'),
      dialog(80, 600, 'Add food', [
        box(16, 60, full - 32, 60, 'Note: recognition is simulated', { dashed: true }),
        btn(16, 140, full - 32, 56, 'Take or choose a photo', { primary: true, to: 'Prediction or error' }),
        text(16, 230, 'Or use a sample photo', { bold: true }),
        img(16, 250, 100, 80, 'Salmon'),
        img(126, 250, 100, 80, 'Oatmeal'),
        img(236, 250, 90, 80, 'Blurry'),
        text(16, 400, '"Looking at your photo…" while analysing', { size: 14 }),
        btn(16, 520, full - 32, 52, 'Cancel', { to: 'Nutrition Metrics' }),
      ]),
    ],
  },
  {
    id: 'A-L13',
    name: 'Add food: prediction / recognition failed (C21)',
    elements: [
      ...nutritionPage,
      nav(NAV_A, 'Nutrition'),
      dialog(60, 720, 'Add food', [
        img(110, 50, 140, 90, 'photo'),
        text(16, 180, 'We think this is: Salmon, rice and broccoli', { bold: true }),
        box(16, 200, full - 32, 120, '640 kcal · P 42 g · C 62 g · F 22 g'),
        input(16, 340, full - 32, 'Meal'),
        btn(16, 430, (full - 44) / 2, 52, 'Retake photo', { to: 'Take photo' }),
        btn(28 + (full - 44) / 2, 430, (full - 44) / 2, 52, 'Confirm and save', { primary: true, to: 'Nutrition + success' }),
        hr(510, { w: full - 32 }),
        text(16, 540, 'If recognition fails:', { bold: true }),
        error(16, 560, full - 32, 'We could not recognize the food in this photo.'),
        btn(16, 630, full - 32, 52, 'Take another photo', { to: 'Take photo' }),
      ]),
    ],
  },
  {
    id: 'A-L14',
    name: 'Profile & settings (C3), in the navigation bar',
    elements: [
      img(145, 40, 100, 100, 'profile picture'),
      text(150, 182, 'Alex Martin', { bold: true }),
      hr(190, { note: 'Bar under picture and name' }),
      box(16, 205, full, 170, 'Personal information', { lines: ['Name · Age · Weight · Height', '[Save personal information]'], to: 'Confirm dialog' }),
      box(16, 385, full, 120, 'Fitness profile', { lines: ['Casual / Performance · Exercise frequency', '[Save fitness profile]'], to: 'Confirm "Change profile?"' }),
      box(16, 515, full, 150, 'Dashboard widgets', { lines: ['[x] Fitness  ↑ ↓', '[x] Nutrition ↑ ↓', '[x] Sleep  ↑ ↓'], note: 'Pin/hide + order live here in A' }),
      hr(690),
      btn(16, 700, full, 50, 'Delete account (red)', { to: '"Are you sure?" dialog' }),
      nav(NAV_A, 'Profile'),
    ],
    notes: ['"Log out" sits above the lower bar. Every save asks for confirmation, then shows a success message.'],
  },
  {
    id: 'A-L15',
    name: '"Are you sure?" delete confirmation (C3)',
    elements: [
      img(145, 40, 100, 100, 'profile picture'),
      hr(190),
      nav(NAV_A, 'Profile'),
      dialog(260, 280, 'Are you sure?', [
        text(16, 70, 'Your account and all your saved data will be deleted. This cannot be undone.', { max: 36 }),
        btn(16, 190, (full - 44) / 2, 52, 'Cancel', { note: 'Focus starts on Cancel', to: 'Profile' }),
        btn(28 + (full - 44) / 2, 190, (full - 44) / 2, 52, 'Delete my account', { primary: true, to: 'Sign up / log in' }),
      ]),
    ],
  },
];

export default {
  title: 'Output A – Initial design',
  intro:
    'Gray-box wireframes at 390 × 844 for every essential screen of the initial design (Task 3 Output A). Arrows in the right margin show where each control leads; dotted lines are annotations. Pop-ups are drawn over the dimmed page they open from.',
  screens,
  flow: {
    title: 'Output A – navigation flow',
    nodes: [
      { id: 'auth', label: 'Sign up / log in', x: 20, y: 200 },
      { id: 'q', label: 'Questionnaire (3 pages)', x: 230, y: 70 },
      { id: 'dash', label: 'Dashboard', x: 460, y: 200 },
      { id: 'profile', label: 'Profile & settings', x: 460, y: 60 },
      { id: 'confirm', label: 'Confirm / Are you sure?', x: 700, y: 60 },
      { id: 'fit', label: 'Fitness Metrics', x: 230, y: 360 },
      { id: 'sleep', label: 'Sleep Metrics', x: 460, y: 360 },
      { id: 'nut', label: 'Nutrition Metrics', x: 690, y: 360 },
      { id: 'fitd', label: 'Add exercise / workout detail / calendar', x: 230, y: 500 },
      { id: 'sleepd', label: 'Add-edit sleep / sleep detail', x: 460, y: 500 },
      { id: 'nutd', label: 'Add food (photo) / meal detail', x: 690, y: 500 },
    ],
    edges: [
      { from: 'auth', to: 'q', label: 'Create account' },
      { from: 'q', to: 'dash', label: 'Create my dashboard' },
      { from: 'auth', to: 'dash', label: 'Log in' },
      { from: 'dash', to: 'profile', both: true, label: 'nav bar' },
      { from: 'profile', to: 'confirm', both: true },
      { from: 'dash', to: 'fit', both: true, label: 'widget / nav' },
      { from: 'dash', to: 'sleep', both: true },
      { from: 'dash', to: 'nut', both: true },
      { from: 'fit', to: 'fitd', both: true, label: 'pop-up' },
      { from: 'sleep', to: 'sleepd', both: true },
      { from: 'nut', to: 'nutd', both: true },
    ],
    legend: 'Output A: the bottom navigation bar (Home, Nutrition, Fitness, Sleep, Profile) links all main pages; there is no back button on sub-pages.',
  },
};
