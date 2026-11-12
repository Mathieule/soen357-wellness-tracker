/**
 * Output B low-fidelity wireframes (source). Build with:  npm run lofi
 *
 * Output B starts FROM Output A: this file imports the Output A wireframes
 * (read-only) and applies the Output B changelog as explicit patches.
 * Every changed or new element is flagged `changed: true`, which the
 * generator draws with a red dashed outline.
 */
import A, { dashboard as dashA, fitnessPage as fitA, nutritionPage as nutA, sleepPage as sleepA } from '../../Output_A/lo-fi/spec.mjs';
import { box, btn, dialog, hr, img, nav, success, text, W } from '../../tools/lofi/dsl.mjs';

const full = W - 32;
const half = (W - 44) / 2;

/** CHANGE 3: Profile removed from the navigation bar. */
export const NAV_B = [
  { label: 'Home', to: 'Dashboard' },
  { label: 'Nutrition', to: 'Nutrition Metrics' },
  { label: 'Fitness', to: 'Fitness Metrics' },
  { label: 'Sleep', to: 'Sleep Metrics' },
];
const navB = (active) => nav(NAV_B, active, { changed: true, note: '← / → move between items (B)' });

/** CHANGE 1 + 3: back button top-left, Settings button top-right. */
const topBar = (titleText, { back = true, settings = true } = {}) => [
  ...(back ? [btn(16, 16, 64, 64, '←', { id: 'back', changed: true, to: 'Dashboard' })] : []),
  text(back ? 92 : 16, back ? 56 : 58, titleText, { size: back ? 22 : 26, bold: true, id: 'title', max: 16 }),
  ...(settings ? [btn(W - 80, 16, 64, 64, '⚙', { id: 'settings', changed: true, to: 'Settings' })] : []),
];

/** Shifts elements down so the 64 px top bar fits. */
const shift = (els, dy) => els.map((e) => ({ ...e, y: e.y + dy }));
const without = (els, ...ids) => els.filter((e) => !ids.includes(e.id));

/** CHANGE 4: keyboard annotation on the main action of each sub-page. */
const withKeyboard = (els) =>
  els.map((e) =>
    e.id === 'add'
      ? { ...e, changed: true, note: 'From a widget: focus starts here. ↑ moves focus to the nav bar. From the nav bar: focus stays on the bar.' }
      : e,
  );

const subPage = (page, titleText) => [...topBar(titleText), ...withKeyboard(shift(without(page, 'title'), 20))];

const fitnessB = subPage(fitA, 'Fitness Metrics');
const sleepB = subPage(sleepA, 'Sleep Metrics');
const nutritionB = subPage(nutA, 'Nutrition Metrics');

const dashTop = [
  ...topBar('Today', { back: false }),
  text(16, 104, 'Hello, Alex. Wed, Nov 11.'),
  btn(16, 120, full, 48, 'Customize dashboard', { changed: true, primary: false, id: 'customize', to: 'Dashboard – customize' }),
];
const dashWidgets = shift(without(dashA, 'title', 'greeting', 'hint'), 70);

const reA = (id) => A.screens.find((s) => s.id === id);
/** Reuses an Output A pop-up screen on top of the patched Output B page. */
const popupOver = (aId, page, active) => ({
  elements: [...page, navB(active), ...reA(aId).elements.filter((e) => e.type === 'dialog')],
});

const screens = [
  { ...reA('A-L01'), id: 'B-L01', name: 'Sign up / log in (unchanged)' },
  { ...reA('A-L02'), id: 'B-L02', name: 'Questionnaire (unchanged)' },
  { ...reA('A-L03'), id: 'B-L03', name: 'Questionnaire Q3 with error (unchanged)' },
  {
    id: 'B-L04',
    name: 'Dashboard: Settings top-right, Customize button',
    elements: [
      ...dashTop,
      ...dashWidgets.map((e) => (e.id === 'w-fitness' ? { ...e, note: 'From log in / widget: focus starts here. From nav bar: stays on bar.' } : e)),
      navB('Home'),
    ],
  },
  {
    id: 'B-L05',
    name: 'Dashboard – customize: pin, unpin, reorder (NEW)',
    elements: [
      ...topBar('Today', { back: false }),
      btn(16, 100, full, 48, '✓ Done customizing', { changed: true, primary: true, to: 'Dashboard' }),
      box(16, 165, full, 170, 'Fitness widget', { dashed: true, lines: ["Today's routine · Today's activity"] }),
      btn(24, 280, 104, 44, '↑ Up (off)', { changed: true }),
      btn(136, 280, 104, 44, '↓ Down', { changed: true, note: 'Move the widget one place; buttons work by keyboard and screen reader' }),
      btn(248, 280, 112, 44, 'Unpin', { changed: true, to: 'More metrics list' }),
      box(16, 350, full, 150, 'Nutrition widget', { dashed: true, lines: ['770 of 2,800 kcal'] }),
      btn(24, 445, 104, 44, '↑ Up', { changed: true }),
      btn(136, 445, 104, 44, '↓ Down', { changed: true }),
      btn(248, 445, 112, 44, 'Unpin', { changed: true }),
      box(16, 515, full, 150, 'Sleep widget', { dashed: true, lines: ['7 h 45 min last night'] }),
      btn(24, 610, 104, 44, '↑ Up', { changed: true }),
      btn(136, 610, 104, 44, '↓ Down (off)', { changed: true }),
      btn(248, 610, 112, 44, 'Unpin', { changed: true }),
      success(16, 690, full, 'Sleep Metrics moved up to position 2 of 3.', { changed: true }),
      navB('Home'),
    ],
    notes: ['Edit mode shows one widget per row so the controls fit at 390 px. Changes are saved immediately and confirmed with a message.'],
  },
  {
    id: 'B-L06',
    name: 'Dashboard with an unpinned metric – "More metrics" (NEW)',
    elements: [
      ...dashTop,
      success(16, 180, full, 'Nutrition Metrics unpinned.', { changed: true }),
      box(16, 245, full, 220, 'Fitness widget', { lines: ["Today's routine · Today's activity"], to: 'Fitness Metrics' }),
      box(16, 480, half, 150, 'Sleep widget', { to: 'Sleep Metrics' }),
      text(16, 668, 'More metrics', { bold: true, changed: true, size: 18 }),
      box(16, 680, full, 64, 'Nutrition Metrics ›', { changed: true, to: 'Nutrition Metrics' }),
      btn(W - 120, 688, 96, 48, 'Pin', { changed: true, primary: true, note: 'Pins it back at the end of the dashboard' }),
      navB('Home'),
    ],
    notes: ['Task 2, T3 flow: "View additional metrics" → "Sleep Metrics" → "Pin to home screen" now happens on the dashboard.'],
  },
  { id: 'B-L07', name: 'Fitness Metrics with back + settings buttons', elements: [...fitnessB, navB('Fitness')] },
  { id: 'B-L08', name: 'Add exercise pop-up (unchanged pop-up)', ...popupOver('A-L06', fitnessB, 'Fitness') },
  { id: 'B-L09', name: 'Activity calendar pop-up (unchanged pop-up)', ...popupOver('A-L07', fitnessB, 'Fitness') },
  { id: 'B-L10', name: 'Sleep Metrics with back + settings buttons', elements: [...sleepB, navB('Sleep')] },
  { id: 'B-L11', name: 'Add / edit sleep pop-up (unchanged pop-up)', ...popupOver('A-L10', sleepB, 'Sleep') },
  { id: 'B-L12', name: 'Nutrition Metrics with back + settings buttons', elements: [...nutritionB, navB('Nutrition')] },
  { id: 'B-L13', name: 'Add food: take photo (unchanged pop-up)', ...popupOver('A-L12', nutritionB, 'Nutrition') },
  { id: 'B-L14', name: 'Add food: prediction / failure (unchanged pop-up)', ...popupOver('A-L13', nutritionB, 'Nutrition') },
  {
    id: 'B-L15',
    name: 'Settings (opened from top-right button)',
    elements: [
      ...topBar('Settings', { settings: false }),
      img(145, 100, 100, 100, 'profile picture'),
      text(150, 236, 'Alex Martin', { bold: true }),
      hr(250),
      box(16, 265, full, 150, 'Personal information', { lines: ['Name · Age · Weight · Height', '[Save personal information]'], to: 'Confirm dialog' }),
      box(16, 425, full, 120, 'Fitness profile', { lines: ['Casual / Performance · Exercise frequency', '[Save fitness profile]'], to: 'Confirm "Change profile?"' }),
      box(16, 555, full, 70, 'Dashboard widgets section removed', { changed: true, dashed: true, lines: ['Hint: use "Customize dashboard"'] }),
      hr(645),
      btn(16, 660, full, 50, 'Delete account (red)', { to: '"Are you sure?" dialog' }),
      navB(''),
    ],
    notes: ['No nav bar item is highlighted on Settings; the back button returns to the dashboard.'],
  },
  {
    id: 'B-L16',
    name: '"Are you sure?" delete confirmation (unchanged)',
    elements: [...topBar('Settings', { settings: false }), navB(''), ...reA('A-L15').elements.filter((e) => e.type === 'dialog')],
  },
];

export default {
  title: 'Output B – Revised design',
  intro:
    'Output B starts from the Output A wireframes and applies the Output B changelog. Red dashed outlines mark what changed: back button (top-left), Settings button (top-right) instead of the Profile nav item, pin / unpin / reorder on the dashboard, and the keyboard rules (↑ from the main action to the nav bar; focus stays on the nav bar when it was used).',
  screens,
  flow: {
    title: 'Output B – navigation flow (red = changed)',
    nodes: [
      { id: 'auth', label: 'Sign up / log in', x: 20, y: 220 },
      { id: 'q', label: 'Questionnaire (3 pages)', x: 230, y: 70 },
      { id: 'dash', label: 'Dashboard', x: 460, y: 220 },
      { id: 'cust', label: 'Customize: pin / unpin / reorder', x: 230, y: 360, changed: true },
      { id: 'settings', label: 'Settings (top-right button)', x: 460, y: 70, changed: true },
      { id: 'confirm', label: 'Confirm / Are you sure?', x: 700, y: 70 },
      { id: 'fit', label: 'Fitness Metrics', x: 460, y: 400 },
      { id: 'sleep', label: 'Sleep Metrics', x: 690, y: 400 },
      { id: 'nut', label: 'Nutrition Metrics', x: 690, y: 240 },
      { id: 'fitd', label: 'Add exercise / workout detail / calendar', x: 460, y: 560 },
      { id: 'sleepd', label: 'Add-edit sleep / sleep detail', x: 690, y: 560 },
      { id: 'nutd', label: 'Add food (photo) / meal detail', x: 920, y: 240 },
    ],
    edges: [
      { from: 'auth', to: 'q', label: 'Create account' },
      { from: 'q', to: 'dash', label: 'Create my dashboard' },
      { from: 'auth', to: 'dash', label: 'Log in' },
      { from: 'dash', to: 'settings', both: true, changed: true, label: 'Settings / Back' },
      { from: 'settings', to: 'confirm', both: true },
      { from: 'dash', to: 'cust', both: true, changed: true, label: 'Customize / Done' },
      { from: 'dash', to: 'fit', both: true, changed: true, label: 'widget · Back' },
      { from: 'dash', to: 'sleep', both: true, changed: true },
      { from: 'dash', to: 'nut', both: true, changed: true },
      { from: 'fit', to: 'fitd', both: true },
      { from: 'sleep', to: 'sleepd', both: true },
      { from: 'nut', to: 'nutd', both: true },
    ],
    legend: 'Output B: nav bar = Home, Nutrition, Fitness, Sleep. Each sub-page has a Back button to the dashboard and a Settings button; Settings left the nav bar.',
  },
};
