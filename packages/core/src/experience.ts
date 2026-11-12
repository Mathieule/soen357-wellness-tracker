/**
 * Personalization engine.
 *
 * ONE pure function turns (profile, iteration) into an Experience config.
 * Screens read the config (useUser().experience) instead of testing the
 * profile themselves, so every difference between personas, and between
 * Output A / B / C, is defined here.
 *
 * What the experience controls:
 *  - dashboard modules (visibility, order) and which can be pinned;
 *  - level of detail (simple / standard / advanced) of every section;
 *  - navigation items (Output A: Profile tab; Output C: unchosen categories
 *    go under "More");
 *  - sections shown on the Fitness, Sleep and Nutrition pages;
 *  - quick actions and wording.
 * Task 2: "the fitness group determines the dashboard"; "the dashboard
 * determines how much information the user is presented with"; Output B:
 * "the information the user enters is used to later adapt the dashboard"
 * (see shouldAskMoreData).
 */
import type { Iteration } from './iteration';
import type { ExperienceId, MetricId, ModuleId, Profile, UserData } from './types';

export type Detail = 'simple' | 'standard' | 'advanced';
export type FitnessSection = 'nextSession' | 'plan' | 'todayActivity' | 'progress' | 'summary' | 'stepsWeek' | 'volumeWeeks' | 'load' | 'intensity' | 'calendar' | 'history';
export type SleepSection = 'lastNight' | 'stages' | 'progress' | 'consistency' | 'log';
export type NutritionSection = 'today' | 'macros' | 'fuel' | 'meals' | 'progress' | 'history';
export type NavId = 'home' | 'fitness' | 'nutrition' | 'sleep' | 'more' | 'settings';

export interface Experience {
  id: ExperienceId;
  name: string;
  tagline: string;
  detail: Detail;
  modules: ModuleId[]; // default dashboard, in order
  pinnable: ModuleId[]; // everything the user may pin
  nav: NavId[];
  more: MetricId[]; // categories reachable from the "More" tab (Output C)
  fitness: FitnessSection[];
  sleep: SleepSection[];
  nutrition: NutritionSection[];
  quickActions: MetricId[];
}

export const EXPERIENCE_INFO: Record<ExperienceId, { name: string; tagline: string; description: string }> = {
  casual: { name: 'Casual', tagline: 'Stay active, keep it simple', description: 'Today\'s workout, calorie goal and daily steps. No advanced numbers.' },
  training: { name: 'Training', tagline: 'Organize and follow my training', description: 'Weekly schedule, today\'s session, volume and recovery first.' },
  performance: { name: 'Performance', tagline: 'Improve my performance', description: 'Detailed load, trends, sleep quality and nutrition targets.' },
};

export const MODULE_INFO: Record<ModuleId, { name: string; description: string; category: MetricId }> = {
  sessionHero: { name: "Today's workout", description: 'Workout planned for today and your calorie goal', category: 'fitness' },
  stepsHero: { name: 'Daily steps', description: 'Your steps today in one big gauge', category: 'fitness' },
  readinessHero: { name: 'Readiness', description: 'Estimated from your sleep and training', category: 'sleep' },
  weekPlan: { name: 'This week', description: 'Planned and completed workouts', category: 'fitness' },
  activity: { name: 'Fitness Metrics', description: 'Steps and active minutes', category: 'fitness' },
  nutrition: { name: 'Nutrition Metrics', description: 'Calories and macros today', category: 'nutrition' },
  sleep: { name: 'Sleep Metrics', description: 'Last night and sleep stages', category: 'sleep' },
  volume: { name: 'Training volume', description: 'Training minutes this week', category: 'fitness' },
  load: { name: 'Training load', description: 'Rolling 7-day trend', category: 'fitness' },
  recovery: { name: 'Recovery', description: 'Ready to train or take it easy', category: 'sleep' },
  tips: { name: 'Recommendations', description: 'Suggestions based on what you logged', category: 'fitness' },
};

const DEFAULTS: Record<ExperienceId, { modules: ModuleId[]; more: ModuleId[]; pinnable: ModuleId[]; detail: Detail; fitness: FitnessSection[]; sleep: SleepSection[]; nutrition: NutritionSection[] }> = {
  casual: {
    detail: 'simple',
    modules: ['sessionHero', 'stepsHero', 'nutrition', 'sleep', 'tips'],
    more: ['weekPlan', 'activity'],
    pinnable: ['sessionHero', 'stepsHero', 'weekPlan', 'activity', 'nutrition', 'sleep', 'tips'],
    fitness: ['nextSession', 'todayActivity', 'progress', 'history'],
    sleep: ['lastNight', 'progress', 'log'],
    nutrition: ['today', 'meals', 'progress', 'history'],
  },
  training: {
    detail: 'standard',
    modules: ['sessionHero', 'weekPlan', 'volume', 'recovery', 'nutrition', 'sleep', 'tips'],
    more: ['load', 'activity'],
    pinnable: ['sessionHero', 'stepsHero', 'weekPlan', 'volume', 'recovery', 'activity', 'nutrition', 'sleep', 'load', 'tips'],
    fitness: ['plan', 'summary', 'todayActivity', 'progress', 'calendar', 'history'],
    sleep: ['lastNight', 'stages', 'progress', 'consistency', 'log'],
    nutrition: ['today', 'macros', 'meals', 'progress', 'history'],
  },
  performance: {
    detail: 'advanced',
    modules: ['sessionHero', 'readinessHero', 'load', 'sleep', 'nutrition', 'weekPlan', 'activity', 'tips'],
    more: ['volume', 'recovery'],
    pinnable: ['sessionHero', 'readinessHero', 'stepsHero', 'load', 'volume', 'recovery', 'weekPlan', 'activity', 'nutrition', 'sleep', 'tips'],
    fitness: ['plan', 'summary', 'load', 'intensity', 'progress', 'todayActivity', 'calendar', 'history'],
    sleep: ['lastNight', 'stages', 'progress', 'consistency', 'log'],
    nutrition: ['today', 'macros', 'fuel', 'meals', 'progress', 'history'],
  },
};

const ALL: MetricId[] = ['fitness', 'nutrition', 'sleep'];
const BUMP: Record<Detail, Detail> = { simple: 'standard', standard: 'advanced', advanced: 'advanced' };

export function buildExperience(p: Profile, it: Iteration): Experience {
  const d = DEFAULTS[p.experience];
  const allowed = ALL.filter((c) => c !== 'sleep' || it.sleep);
  const allowedModule = (m: ModuleId) => allowed.includes(MODULE_INFO[m].category) && (m !== 'tips' || it.recommendations);
  // Output C: categories the user did not choose go under "More". A/B: every category has a tab.
  const interests = it.personaEditor === 'full' && p.interests.length ? p.interests.filter((c) => allowed.includes(c)) : allowed;
  const relevant = (m: ModuleId) => m.endsWith('Hero') || m === 'tips' || interests.includes(MODULE_INFO[m].category);
  // "Yes, show me more data": one more level of detail and extra modules.
  const more = p.moreData === true;
  const modules = [...d.modules, ...(more ? d.more : [])].filter((m) => allowedModule(m) && relevant(m));
  const moreCats = allowed.filter((c) => !interests.includes(c));
  const nav: NavId[] = ['home', ...(['fitness', 'nutrition', 'sleep'] as MetricId[]).filter((c) => interests.includes(c)), ...(moreCats.length ? (['more'] as NavId[]) : []), ...(it.settingsInNav ? (['settings'] as NavId[]) : [])];
  return {
    id: p.experience,
    name: EXPERIENCE_INFO[p.experience].name,
    tagline: EXPERIENCE_INFO[p.experience].tagline,
    detail: more ? BUMP[d.detail] : d.detail,
    modules,
    pinnable: d.pinnable.filter(allowedModule),
    nav,
    more: moreCats,
    fitness: more && p.experience === 'casual' ? ['nextSession', 'summary', 'todayActivity', 'progress', 'calendar', 'history'] : d.fitness,
    sleep: it.sleep ? d.sleep : [],
    nutrition: more && p.experience === 'casual' ? ['today', 'macros', 'meals', 'progress', 'history'] : d.nutrition,
    quickActions: interests,
  };
}

/** Modules actually shown: the user's pins if any, otherwise the defaults. */
export function dashboardModules(p: Profile, e: Experience): ModuleId[] {
  return (p.dashboard ?? e.modules).filter((m) => e.pinnable.includes(m));
}

/**
 * "Do you want to see more data?" (Task 2, Responding).
 *  - Output A: asked to casual users from the start.
 *  - Output B/C: asked when the logged data shows the user is doing more
 *    (≥ 4 workouts in 14 days or ≥ 10 meals in 7 days): the app adapts over time.
 */
export function shouldAskMoreData(u: UserData, it: Iteration, today: string, daysAgo: (n: number) => string): { ask: boolean; reason: string } {
  if (u.profile.experience !== 'casual' || u.profile.moreData !== undefined) return { ask: false, reason: '' };
  if (it.moreDataPrompt === 'start') return { ask: true, reason: 'You can see more numbers about your workouts and meals.' };
  const w = u.workouts.filter((x) => x.date >= daysAgo(13) && x.date <= today).length;
  const m = u.meals.filter((x) => x.date >= daysAgo(6) && x.date <= today).length;
  if (w >= 4) return { ask: true, reason: `You logged ${w} workouts in the last 2 weeks.` };
  if (m >= 10) return { ask: true, reason: `You logged ${m} meals this week.` };
  return { ask: false, reason: '' };
}
