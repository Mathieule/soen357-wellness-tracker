/**
 * Output C low-fidelity wireframes (source). Build: npm run lofi
 * Gray boxes at 390 × 844. Numbered badges in the margin say where each
 * control leads (→) or annotate behaviour.
 */
import { box, btn, chart, choice, dialog, error, hr, img, input, list, nav, text, W } from '../../tools/lofi/dsl.mjs';

const full = W - 32;
const half = (W - 44) / 2;
const third = (W - 48) / 3;
const NAV_ALL = [
  { label: 'Home', to: 'Dashboard' },
  { label: 'Training', to: 'Training' },
  { label: 'Nutrition', to: 'Nutrition' },
  { label: 'Sleep', to: 'Sleep' },
];
const NAV_CASUAL = [
  { label: 'Home', to: 'Dashboard' },
  { label: 'Activity', to: 'Activity' },
  { label: 'Nutrition', to: 'Nutrition' },
  { label: 'More', to: '"More" sheet (Sleep)' },
];
const header = (name) => [
  text(16, 40, 'Thursday, November 12', { size: 14 }),
  text(16, 72, `Hello, ${name}`, { size: 26, bold: true }),
  box(16, 86, 150, 30, 'Sync status', { note: 'Simulated sync: syncing / up to date / failed + Retry' }),
  btn(W - 126, 30, 110, 44, 'Settings', { to: 'Settings' }),
];
const quick = (n) =>
  Array.from({ length: n }, (_, i) => btn(16 + i * (third + 8), 130, third, 70, ['Log workout', 'Add meal', 'Add night'][i], { to: ['Workout sheet', 'Photo sheet', 'Sleep sheet'][i] }));
const pageTop = (title) => [btn(16, 20, 100, 44, '← Home', { to: 'Dashboard' }), btn(W - 126, 20, 110, 44, 'Settings', { to: 'Settings' }), text(76, 112, title, { size: 28, bold: true }), img(16, 82, 48, 48, '')];

const screens = [
  {
    id: 'C-L01',
    name: 'Welcome · log in / create account (C1)',
    elements: [
      img(16, 40, 56, 56, 'logo'),
      text(16, 130, 'Wellness Tracker', { size: 30, bold: true }),
      text(16, 160, 'Training, food and sleep in one calm place.', { size: 15 }),
      box(16, 185, full, 48, 'Log in | Create account (segmented)', { note: 'Switches the form mode' }),
      input(16, 260, full, 'Email'),
      input(16, 340, full, 'Password'),
      btn(16, 420, full, 56, 'Log in / Create account', { primary: true, to: 'Dashboard or Questionnaire' }),
      text(16, 510, 'Try a demo profile', { bold: true }),
      list(16, 520, full, 3, '', { to: 'Dashboard (Casual / Training / Performance)' }),
      text(16, 760, 'Educational prototype notice', { size: 13 }),
    ],
    notes: ['Errors: invalid email, weak password, wrong credentials, email already used (inline + summary).'],
  },
  {
    id: 'C-L02',
    name: 'Questionnaire · goal (sets the experience)',
    elements: [
      text(16, 40, 'Set up · 2 of 6', { size: 14 }),
      box(16, 52, full, 8, '', { fill: '#999' }),
      text(16, 110, 'What brings you here?', { size: 26, bold: true }),
      text(16, 140, 'This shapes your dashboard.', { size: 14 }),
      choice(16, 170, full, 'Stay active, keep it simple → Casual', { note: 'One answer; focus starts on first answer' }),
      choice(16, 238, full, 'Organize my training → Training', { checked: true }),
      choice(16, 306, full, 'Improve my performance → Performance'),
      error(16, 400, full, 'Choose what brings you here to continue.', { note: 'Shown when Continue is pressed with no answer' }),
      btn(16, 760, 110, 56, 'Back', { to: 'Previous question' }),
      btn(140, 760, full - 124, 56, 'Continue', { primary: true, to: 'Level question' }),
    ],
    notes: ['Steps: 1 name · 2 goal · 3 level (sedentary → experienced) · 4 sessions per week · 5 data that matters · 6 preview.'],
  },
  {
    id: 'C-L03',
    name: 'Questionnaire · sessions per week → weekly plan',
    elements: [
      text(16, 40, 'Set up · 4 of 6', { size: 14 }),
      text(16, 100, 'How many sessions per week?', { size: 24, bold: true }),
      btn(16, 150, 52, 52, '−'),
      box(80, 150, full - 128, 52, '4', { note: 'Stepper 0–7' }),
      btn(W - 68, 150, 52, 52, '+'),
      box(16, 230, full, 150, 'Your week: M T W T F S S', { lines: ['● ● ○ ● ○ ● ○  (training / rest)', 'Rest days in between; editable later'], note: 'Live preview of the plan' }),
      btn(140, 760, full - 124, 56, 'Continue', { primary: true, to: 'Data question' }),
    ],
  },
  {
    id: 'C-L04',
    name: 'Questionnaire · preview of "your experience"',
    elements: [
      text(16, 90, 'Your experience: Training', { size: 24, bold: true }),
      box(16, 120, full, 260, 'Your dashboard will show', { lines: ["1 Today's session", '2 This week', '3 Training volume', '4 Recovery', '5 Nutrition · 6 Sleep'], note: 'Built by the personalization engine' }),
      box(16, 395, full, 110, 'Your plan', { lines: ['4 sessions · Regular level', 'Tabs: Home, Training, Nutrition, Sleep'] }),
      text(16, 540, 'Account starts empty.', { size: 14 }),
      btn(140, 760, full - 124, 56, 'Create my dashboard', { primary: true, to: 'Dashboard (empty account)' }),
    ],
  },
  {
    id: 'C-L05',
    name: 'Dashboard · Casual',
    elements: [
      ...header('Sam'),
      ...quick(2),
      text(16, 236, 'Today · Casual view', { bold: true }),
      btn(W - 136, 214, 120, 40, 'Customize', { to: 'Customize mode' }),
      chart(16, 266, full, 250, '270° gauge: steps of goal + one sentence', { to: 'Activity', note: 'Hero = daily steps' }),
      box(16, 530, full, 120, 'Next session · tomorrow', { lines: ['Brisk walk · 30 min · Easy'], to: 'Activity' }),
      box(16, 664, full, 90, 'Nutrition: 893 of 2,100 kcal', { to: 'Nutrition' }),
      nav(NAV_CASUAL, 'Home', { note: 'Sleep not chosen → under More' }),
    ],
    notes: ['Simple: one number per card, no advanced metrics.'],
  },
  {
    id: 'C-L06',
    name: 'Dashboard · Training',
    elements: [
      ...header('Alex'),
      ...quick(3),
      text(16, 236, 'Today · Training view', { bold: true }),
      box(16, 260, full, 200, "Today's session (hero)", { lines: ['Mobility and core', '45 min · 3 exercises · Easy'], to: 'Training' }),
      btn(32, 395, full - 32, 50, 'Log session', { primary: true, to: 'Workout sheet (pre-filled)' }),
      box(16, 474, full, 110, 'This week · 2 of 4 done', { lines: ['● ● ○ ◯ ○ ◯ ○'], to: 'Training' }),
      chart(16, 598, full, 150, 'Training volume: done vs planned', { to: 'Training' }),
      nav(NAV_ALL, 'Home'),
    ],
    notes: ['Then Recovery, Nutrition (macros), Sleep (stages) below.'],
  },
  {
    id: 'C-L07',
    name: 'Dashboard · Performance',
    elements: [
      ...header('Jordan'),
      ...quick(3),
      box(16, 236, full, 220, 'Readiness (estimate)', { lines: ['98 / 100 · Good', 'Sleep ▬▬▬  Load ▬▬▬  Routine ▬▬'], to: 'Sleep', note: 'Score from logged sleep + load + routine' }),
      box(16, 470, full, 130, 'Key session', { lines: ['Full-body strength · 60 min · Hard'], to: 'Training' }),
      chart(16, 614, full, 140, 'Training load, rolling 7 days (+ vs previous)', { to: 'Training' }),
      nav(NAV_ALL, 'Home'),
    ],
    notes: ['Then Sleep (hypnogram), Nutrition (macros), This week, Activity (vs last week).'],
  },
  {
    id: 'C-L08',
    name: 'Dashboard · Customize mode (pin, unpin, reorder)',
    elements: [
      text(16, 60, 'Customize your dashboard', { size: 22, bold: true }),
      btn(W - 106, 30, 90, 44, 'Done', { to: 'Dashboard' }),
      box(16, 100, full, 150, "Today's session", { dashed: true }),
      btn(24, 200, third - 4, 40, '↑ Up (off)'),
      btn(24 + third + 4, 200, third - 4, 40, '↓ Down', { note: 'Move one place; focus stays on the button' }),
      btn(24 + 2 * third + 8, 200, third - 8, 40, 'Remove'),
      box(16, 265, full, 130, 'This week', { dashed: true }),
      text(16, 440, 'Add to dashboard', { bold: true }),
      list(16, 450, full, 3, '', { note: 'Modules allowed for this experience' }),
      btn(16, 690, full, 50, 'Reset to recommended', { to: 'Default layout' }),
      nav(NAV_ALL, 'Home'),
    ],
  },
  {
    id: 'C-L09',
    name: 'Training page (Training experience)',
    elements: [
      ...pageTop('Training'),
      btn(16, 150, full, 56, '+ Add workout', { primary: true, to: 'Workout sheet', note: 'Focus here from a widget; ↑ → nav bar' }),
      box(16, 220, full, 260, 'This week', { lines: ['Day strip (select a day)', 'Selected day: session + exercises', '[Log this session]'], to: 'Workout sheet (pre-filled)' }),
      box(16, 494, full, 100, "Today's activity: steps · active · burned"),
      chart(16, 608, full, 140, 'Training minutes per week + goal', {}),
      nav(NAV_ALL, 'Training'),
    ],
    notes: ['Then History calendar (sheet) and Workout history with type filters. Performance adds Load and Intensity; Casual shows Next session, steps chart and recent workouts.'],
  },
  {
    id: 'C-L10',
    name: 'Workout sheet · add / edit / log planned',
    elements: [
      ...pageTop('Training'),
      dialog(110, 734, 'Add a workout', [
        input(16, 60, full - 32, 'Workout name'),
        text(16, 150, 'Type: [Strength] [Cardio] [Mobility] [Sport]', { size: 14 }),
        input(16, 180, (full - 44) / 2, 'Date'),
        input(28 + (full - 44) / 2, 180, (full - 44) / 2, 'Start time'),
        input(16, 260, full - 32, 'Duration (minutes)'),
        box(16, 335, full - 32, 44, 'Easy | Moderate | Hard'),
        input(16, 410, full - 32, 'Calories (optional)'),
        error(16, 490, full - 32, 'Fix the fields marked with an error', { note: 'Per-field + summary errors' }),
        btn(16, 650, (full - 44) / 2, 52, 'Cancel', { to: 'Training' }),
        btn(28 + (full - 44) / 2, 650, (full - 44) / 2, 52, 'Save workout', { primary: true, to: 'Training + toast' }),
      ]),
    ],
    notes: ['Workout detail sheet: Edit (same form) and Delete (confirmation).'],
  },
  {
    id: 'C-L11',
    name: 'Sleep page',
    elements: [
      ...pageTop('Sleep'),
      btn(16, 150, full, 56, '+ Add or edit a night', { primary: true, to: 'Sleep sheet' }),
      box(16, 220, full, 250, 'Last night (hero)', { lines: ['8 h 45 min · Great night', '23:00 to 07:45'] }),
      chart(32, 300, full - 32, 150, 'Hypnogram: 4 rows (shades of blue)', { note: 'Stage names on the axis; tooltip-free, values in text' }),
      box(16, 484, full, 120, 'Sleep stages: bar + % per stage'),
      chart(16, 618, full, 130, 'Last 7 nights + goal'),
      nav(NAV_ALL, 'Sleep'),
    ],
    notes: ['Then bedtime regularity, trend (Performance) and the sleep log (tap → detail with Edit / Delete).'],
  },
  {
    id: 'C-L12',
    name: 'Nutrition page',
    elements: [
      ...pageTop('Nutrition'),
      btn(16, 150, half, 56, 'Scan photo', { primary: true, to: 'Photo sheet' }),
      btn(28 + half, 150, half, 56, 'Type it in', { to: 'Manual entry sheet' }),
      box(16, 222, full, 170, 'Today (hero)', { lines: ['Ring 1,232 kcal · 1,568 left', 'P · C · F'] }),
      box(16, 406, full, 120, 'Macros (bars / rings)'),
      list(16, 545, full, 3, "Today's meals (by meal)", { to: 'Meal detail (Edit / Delete)' }),
      nav(NAV_ALL, 'Nutrition'),
    ],
    notes: ['Empty meal slot: "Nothing yet · Add dinner". Then Calories last 7 days and Previous days (history sheet). Performance adds "Fuel for today".'],
  },
  {
    id: 'C-L13',
    name: 'Photo sheet · prediction / failure (simulated)',
    elements: [
      ...pageTop('Nutrition'),
      dialog(60, 784, 'Scan your food', [
        img(110, 50, 140, 90, 'photo'),
        text(16, 175, 'We think this is: Salmon, rice and broccoli', { bold: true, max: 40 }),
        box(16, 200, full - 32, 120, '680 kcal · P 44 · C 66 · F 24'),
        text(16, 350, 'Meal: [Breakfast] [Lunch] [Snack] [Dinner]', { size: 14 }),
        btn(16, 380, (full - 44) / 2, 48, 'Retake', { to: 'Take photo' }),
        btn(28 + (full - 44) / 2, 380, (full - 44) / 2, 48, 'Edit', { to: 'Check the values sheet' }),
        btn(16, 440, full - 32, 52, 'Confirm and save', { primary: true, to: 'Nutrition + toast' }),
        hr(520, { w: full - 32 }),
        text(16, 550, 'If recognition fails:', { bold: true }),
        error(16, 565, full - 32, 'We could not recognize the food in this photo.'),
        btn(16, 630, full - 32, 48, 'Take another photo', { to: 'Take photo' }),
        btn(16, 688, full - 32, 48, 'Enter it manually', { to: 'Manual entry sheet' }),
      ]),
    ],
  },
  {
    id: 'C-L14',
    name: 'Settings',
    elements: [
      btn(16, 20, 100, 44, '← Home', { to: 'Dashboard' }),
      text(16, 112, 'Settings', { size: 28, bold: true }),
      img(16, 130, 64, 64, 'avatar'),
      box(16, 210, full, 170, 'Your experience', { lines: ['Casual / Training / Performance', 'Level · sessions · days · data'], to: 'Confirm with preview', note: 'Confirm dialog lists the new dashboard' }),
      box(16, 392, full, 80, 'Personal information', { to: 'Confirm "Save?"' }),
      box(16, 484, full, 80, 'Daily goals'),
      box(16, 576, full, 80, 'Smart device (simulated)', { to: 'Connect / Sync now / Disconnect' }),
      box(16, 668, full, 80, 'Rate the app ★★★★★', { note: '1–5 + optional comment' }),
      nav(NAV_ALL, ''),
    ],
    notes: ['Then Prototype tools (simulate sync failure, sample data, reset) and Account (Log out, Delete account → "Are you sure?").'],
  },
  {
    id: 'C-L15',
    name: 'New account · empty states',
    elements: [
      ...header('Nina'),
      btn(16, 130, full, 64, 'Log workout', { to: 'Workout sheet' }),
      box(16, 210, full, 300, 'Get started (4 steps)', { lines: ['○ Connect a device', '○ Log your first workout', '○ Add your first meal', "○ Add last night's sleep"], note: 'Each step opens the right action; checked when done' }),
      chart(16, 525, full, 230, 'Steps gauge at 0 + "Connect a device…"'),
      nav(NAV_CASUAL, 'Home'),
    ],
    notes: ['Every list (workouts, meals, sleep) has a designed empty state with one action.'],
  },
];

export default {
  title: 'Output C – Final design',
  intro:
    'Wireframes of the final prototype at 390 × 844. The same app produces three dashboards (Casual, Training, Performance) from the questionnaire answers. Numbered badges show where each control leads (→) or explain behaviour.',
  screens,
  flow: {
    title: 'Output C – navigation flow',
    nodes: [
      { id: 'auth', label: 'Welcome / log in', x: 20, y: 200 },
      { id: 'q', label: 'Questionnaire (6 steps + preview)', x: 230, y: 60 },
      { id: 'dash', label: 'Dashboard (Casual / Training / Performance)', x: 460, y: 200 },
      { id: 'cust', label: 'Customize', x: 700, y: 60 },
      { id: 'set', label: 'Settings', x: 700, y: 200 },
      { id: 'more', label: '"More" sheet', x: 700, y: 340 },
      { id: 'fit', label: 'Training / Activity', x: 230, y: 380 },
      { id: 'sleep', label: 'Sleep', x: 460, y: 420 },
      { id: 'nut', label: 'Nutrition', x: 690, y: 480 },
      { id: 'fitd', label: 'Workout sheet · detail · calendar', x: 230, y: 560 },
      { id: 'sleepd', label: 'Night sheet · detail', x: 460, y: 600 },
      { id: 'nutd', label: 'Photo · manual · meal · day', x: 690, y: 640 },
    ],
    edges: [
      { from: 'auth', to: 'q', label: 'Create account' },
      { from: 'q', to: 'dash', label: 'Create my dashboard' },
      { from: 'auth', to: 'dash', label: 'Log in / demo' },
      { from: 'dash', to: 'cust', both: true },
      { from: 'dash', to: 'set', both: true, label: 'Settings / Back' },
      { from: 'dash', to: 'more', both: true },
      { from: 'dash', to: 'fit', both: true, label: 'module · tab · Back' },
      { from: 'dash', to: 'sleep', both: true },
      { from: 'dash', to: 'nut', both: true },
      { from: 'fit', to: 'fitd', both: true },
      { from: 'sleep', to: 'sleepd', both: true },
      { from: 'nut', to: 'nutd', both: true },
    ],
    legend: 'Tabs: Home + the categories chosen in the questionnaire (others under "More"). Quick actions on the dashboard open the sheets directly. Settings: top-right button (side rail on large screens).',
  },
};
