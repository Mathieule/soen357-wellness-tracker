/**
 * Output B low-fidelity wireframes (source). Build: npm run lofi
 * Changes from A (red dashed outline): sleep metrics, three personas with
 * more detail for performance users, pin / unpin / order on the dashboard,
 * Settings button top-right (Task 3 Output B), recommendations, adaptive
 * "more data?" question, rating 1–5, keyboard rules.
 */
import A from '../../Output_A/lo-fi/spec.mjs';
import { box, btn, chart, choice, dialog, img, input, list, nav, text, W } from '../../tools/lofi/dsl.mjs';

const full = W - 32;
const third = (W - 48) / 3;
const NAV_B = [
  { label: 'Home', to: 'Dashboard' },
  { label: 'Fitness', to: 'Fitness Metrics' },
  { label: 'Nutrition', to: 'Nutrition Metrics' },
  { label: 'Sleep', to: 'Sleep Metrics' },
];
const navB = (active) => nav(NAV_B, active, { changed: true, note: 'Sleep tab added; Profile moved to Settings button; ← / → move along the bar' });
const top = (title) => [btn(16, 20, 110, 44, '← Return', { to: 'Dashboard' }), btn(W - 126, 20, 110, 44, 'Settings', { to: 'Settings', changed: true }), img(16, 82, 48, 48, ''), text(76, 114, title, { size: 26, bold: true })];
const reA = (id) => A.screens.find((s) => s.id === id);

const screens = [
  { ...reA('A-L01'), id: 'B-L01', name: 'Create account / log in (3 demo personas)' },
  {
    id: 'B-L02',
    name: 'Questionnaire 1: persona (3 personas)',
    elements: [
      text(16, 40, 'Set up · question 1 of 2', { size: 14 }),
      text(16, 110, 'Which describes you best?', { size: 26, bold: true }),
      choice(16, 160, full, 'Casual user', { to: 'Question 2' }),
      choice(16, 228, full, 'Regular training', { changed: true, note: 'New middle persona' }),
      choice(16, 296, full, 'Performance athlete'),
      btn(16, 760, full, 56, 'Continue', { primary: true }),
    ],
  },
  { ...reA('A-L03'), id: 'B-L03', name: 'Questionnaire 2: fitness goals (+ "Sleep better")' },
  {
    id: 'B-L04',
    name: 'Dashboard · Casual (adaptive "more data?")',
    elements: [
      text(16, 72, 'Hello, Sam', { size: 26, bold: true }),
      btn(W - 126, 40, 110, 44, 'Settings', { changed: true, to: 'Settings' }),
      box(16, 90, full, 130, 'Do you want to see more data?', { changed: true, lines: ['"You logged 4 workouts in 2 weeks."'], note: 'Asked when logged data justifies it (adapts over time)' }),
      btn(16, 232, third, 70, 'Log workout', { changed: true, to: 'Workout form' }),
      btn(24 + third, 232, third, 70, 'Add meal', { changed: true, to: 'Photo sheet' }),
      btn(32 + 2 * third, 232, third, 70, 'Add sleep log', { changed: true, to: 'Sleep log form' }),
      box(16, 316, full, 180, "Today's workout + calorie goal", { to: 'Fitness Metrics' }),
      box(16, 510, full, 110, 'Sleep Metrics: 6 h 15 min', { changed: true, to: 'Sleep Metrics' }),
      box(16, 634, full, 120, 'Recommendations', { changed: true, lines: ['Aim for bed by 22:45', '1 workout left this week'] }),
      navB('Home'),
    ],
  },
  {
    id: 'B-L05',
    name: 'Dashboard · Performance (sleep detail)',
    elements: [
      text(16, 72, 'Hello, Jordan', { size: 26, bold: true }),
      btn(W - 136, 90, 120, 40, 'Customize', { changed: true, to: 'Customize mode' }),
      box(16, 140, full, 170, "Today's workout + calorie goal", { to: 'Fitness Metrics' }),
      box(16, 324, full, 150, 'Readiness (estimate from sleep + load)', { changed: true, to: 'Sleep Metrics' }),
      chart(16, 488, full, 140, 'Sleep Metrics: hypnogram', { changed: true, to: 'Sleep Metrics', note: 'More sleep detail for performance users' }),
      chart(16, 642, full, 110, 'Training load', { to: 'Fitness Metrics' }),
      navB('Home'),
    ],
  },
  {
    id: 'B-L06',
    name: 'Dashboard · Customize: pin, unpin, order',
    elements: [
      text(16, 60, 'Pin and order your metrics', { size: 22, bold: true }),
      btn(W - 106, 30, 90, 44, 'Done', { to: 'Dashboard', changed: true }),
      box(16, 100, full, 150, "Today's workout", { dashed: true }),
      btn(24, 200, third - 4, 40, '↑ Up', { changed: true }),
      btn(24 + third + 4, 200, third - 4, 40, '↓ Down', { changed: true }),
      btn(24 + 2 * third + 8, 200, third - 8, 40, 'Unpin', { changed: true, note: '"Unpin metric" (screen-reader label)' }),
      text(16, 300, 'Metrics you can pin', { bold: true }),
      list(16, 310, full, 3, '', { changed: true, note: '[Pin metric] buttons' }),
      btn(16, 560, full, 50, 'Reset to recommended'),
      navB('Home'),
    ],
    notes: ['Change from A: pinning moves from Profile to the dashboard (Task 2 changelog A → B).'],
  },
  {
    id: 'B-L07',
    name: 'Sleep Metrics (new)',
    elements: [
      ...top('Sleep Metrics'),
      btn(16, 150, full, 56, '+ Enter a new sleep log', { primary: true, changed: true, to: 'Sleep log form' }),
      box(16, 220, full, 220, 'Last night · 9 h 15 min', { changed: true, lines: ['Hypnogram (Performance) or duration only (Casual)'] }),
      box(16, 454, full, 44, 'Week | Month | Year', { changed: true }),
      chart(16, 506, full, 120, 'Hours of sleep', { changed: true }),
      list(16, 646, full, 1, 'Previous sleep logs', { changed: true, to: 'Sleep log detail' }),
      navB('Sleep'),
    ],
  },
  {
    id: 'B-L08',
    name: 'Enter a new sleep log (new)',
    elements: [
      ...top('Sleep Metrics'),
      dialog(110, 640, 'New sleep log', [
        input(16, 60, full - 32, 'Date you woke up'),
        input(16, 140, (full - 44) / 2, 'Bedtime'),
        input(28 + (full - 44) / 2, 140, (full - 44) / 2, 'Wake-up time'),
        box(16, 230, full - 32, 50, 'Total sleep: 8 h (live)'),
        btn(16, 560, (full - 44) / 2, 52, 'Cancel'),
        btn(28 + (full - 44) / 2, 560, (full - 44) / 2, 52, 'Save', { primary: true, to: 'Sleep + green message' }),
      ], { changed: true }),
    ],
  },
  {
    id: 'B-L09',
    name: 'Settings (top-right button): persona, rating',
    elements: [
      btn(16, 20, 110, 44, '← Return', { to: 'Dashboard' }),
      text(16, 108, 'Settings', { size: 28, bold: true }),
      box(16, 126, full, 170, 'Persona and goals (3 personas)', { changed: true, to: 'Confirm dialog' }),
      box(16, 310, full, 110, 'Personal information'),
      box(16, 434, full, 100, 'Daily goals (calorie, sleep)'),
      box(16, 548, full, 140, 'Rate the app ★★★★★', { changed: true, lines: ['Comment (optional) · [Send rating]'], note: 'Responding: satisfaction 1–5' }),
      navB(''),
    ],
    notes: ['The "Dashboard metrics" section of A is gone: pinning is on the dashboard now.'],
  },
];

export default {
  title: 'Output B – Revised design',
  intro: 'Changes from Output A are outlined in red: sleep metrics, three personas with more detail for performance users, pin / unpin / order on the dashboard, Settings top-right with the Task 3 Output B keyboard rules, recommendations, the adaptive "more data?" question and the 1–5 rating.',
  screens,
  flow: {
    title: 'Output B – navigation flow (red = changed)',
    nodes: [
      { id: 'auth', label: 'Create account / log in', x: 20, y: 200 },
      { id: 'q', label: 'Q1 persona → Q2 goals', x: 230, y: 60 },
      { id: 'dash', label: 'Dashboard', x: 460, y: 220 },
      { id: 'cust', label: 'Customize: pin / unpin / order', x: 700, y: 60, changed: true },
      { id: 'set', label: 'Settings (persona, rating)', x: 700, y: 220, changed: true },
      { id: 'fit', label: 'Fitness Metrics', x: 230, y: 400 },
      { id: 'nut', label: 'Nutrition Metrics', x: 460, y: 440 },
      { id: 'slp', label: 'Sleep Metrics', x: 690, y: 400, changed: true },
      { id: 'slpd', label: 'New sleep log · previous log', x: 690, y: 560, changed: true },
    ],
    edges: [
      { from: 'auth', to: 'q', label: 'Create account' },
      { from: 'q', to: 'dash', label: 'Create my dashboard' },
      { from: 'auth', to: 'dash', label: 'Log in' },
      { from: 'dash', to: 'cust', both: true, changed: true },
      { from: 'dash', to: 'set', both: true, changed: true, label: 'Settings / Return' },
      { from: 'dash', to: 'fit', both: true },
      { from: 'dash', to: 'nut', both: true },
      { from: 'dash', to: 'slp', both: true, changed: true },
      { from: 'slp', to: 'slpd', both: true, changed: true },
    ],
    legend: 'Bottom bar: Home, Fitness, Nutrition, Sleep. Settings is the top-right button. Workout and meal screens are the same as Output A.',
  },
};
