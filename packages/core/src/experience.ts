/**
 * Personalization engine.
 *
 * ONE pure function turns the user's profile into an Experience config.
 * Screens read the config (useExperience) instead of testing the profile
 * themselves, so every difference between Casual, Training and Performance
 * is defined here, in one place, and changes everywhere when the user edits
 * their preferences in Settings.
 *
 * What the experience controls:
 *  - dashboard modules (visibility, order, hero) and which can be pinned;
 *  - level of detail (simple / standard / advanced) of every section;
 *  - navigation tabs (categories the user did not choose go under "More");
 *  - sections shown on the Training, Sleep and Nutrition pages;
 *  - quick actions and wording.
 */
import type { ExperienceId, MetricId, ModuleId, Profile } from './types';

export type Detail = 'simple' | 'standard' | 'advanced';
export type FitnessSection = 'nextSession' | 'plan' | 'todayActivity' | 'stepsWeek' | 'volumeWeeks' | 'load' | 'intensity' | 'calendar' | 'history';
export type SleepSection = 'lastNight' | 'stages' | 'weekDurations' | 'consistency' | 'trend' | 'log';
export type NutritionSection = 'today' | 'macros' | 'fuel' | 'meals' | 'week' | 'history';
export type NavId = 'home' | 'fitness' | 'nutrition' | 'sleep' | 'more';

export interface Experience {
  id: ExperienceId;
  name: string;
  tagline: string;
  detail: Detail;
  /** Label of the training area: casual users "Activity", others "Training". */
  fitnessLabel: string;
  modules: ModuleId[]; // default dashboard, in order
  pinnable: ModuleId[]; // everything the user may pin
  nav: NavId[];
  more: MetricId[]; // categories reachable from the "More" tab
  fitness: FitnessSection[];
  sleep: SleepSection[];
  nutrition: NutritionSection[];
  quickActions: MetricId[];
}

export const EXPERIENCE_INFO: Record<ExperienceId, { name: string; tagline: string; description: string }> = {
  casual: { name: 'Casual', tagline: 'Stay active, keep it simple', description: 'Daily steps, a light plan and the essentials. No advanced numbers.' },
  training: { name: 'Training', tagline: 'Organize and follow my training', description: 'Your weekly schedule, today\'s session, volume and recovery first.' },
  performance: { name: 'Performance', tagline: 'Improve my performance', description: 'Detailed load, trends, sleep quality and nutrition targets.' },
};

export const MODULE_INFO: Record<ModuleId, { name: string; description: string; category: MetricId }> = {
  stepsHero: { name: 'Daily steps', description: 'Your steps today in one big ring', category: 'fitness' },
  sessionHero: { name: "Today's session", description: 'The workout planned for today', category: 'fitness' },
  readinessHero: { name: 'Readiness', description: 'Estimated from your sleep and training', category: 'sleep' },
  weekPlan: { name: 'This week', description: 'Planned and completed sessions', category: 'fitness' },
  activity: { name: 'Activity', description: 'Steps and active minutes', category: 'fitness' },
  nutrition: { name: 'Nutrition', description: 'Calories and macros today', category: 'nutrition' },
  sleep: { name: 'Sleep', description: 'Last night and sleep stages', category: 'sleep' },
  volume: { name: 'Training volume', description: 'Training minutes this week', category: 'fitness' },
  load: { name: 'Training load', description: 'Four-week trend', category: 'fitness' },
  recovery: { name: 'Recovery', description: 'Ready to train or take it easy', category: 'sleep' },
};

const DEFAULTS: Record<ExperienceId, { modules: ModuleId[]; pinnable: ModuleId[]; detail: Detail; fitness: FitnessSection[]; sleep: SleepSection[]; nutrition: NutritionSection[] }> = {
  casual: {
    detail: 'simple',
    modules: ['stepsHero', 'sessionHero', 'nutrition', 'sleep'],
    pinnable: ['stepsHero', 'sessionHero', 'weekPlan', 'activity', 'nutrition', 'sleep'],
    fitness: ['nextSession', 'todayActivity', 'stepsWeek', 'history'],
    sleep: ['lastNight', 'weekDurations', 'log'],
    nutrition: ['today', 'meals', 'history'],
  },
  training: {
    detail: 'standard',
    modules: ['sessionHero', 'weekPlan', 'volume', 'recovery', 'nutrition', 'sleep'],
    pinnable: ['sessionHero', 'stepsHero', 'weekPlan', 'volume', 'recovery', 'activity', 'nutrition', 'sleep', 'load'],
    fitness: ['plan', 'todayActivity', 'volumeWeeks', 'calendar', 'history'],
    sleep: ['lastNight', 'stages', 'weekDurations', 'consistency', 'log'],
    nutrition: ['today', 'macros', 'meals', 'week', 'history'],
  },
  performance: {
    detail: 'advanced',
    modules: ['readinessHero', 'sessionHero', 'load', 'sleep', 'nutrition', 'weekPlan', 'activity'],
    pinnable: ['readinessHero', 'sessionHero', 'stepsHero', 'load', 'volume', 'recovery', 'weekPlan', 'activity', 'nutrition', 'sleep'],
    fitness: ['plan', 'load', 'intensity', 'volumeWeeks', 'todayActivity', 'calendar', 'history'],
    sleep: ['lastNight', 'stages', 'trend', 'consistency', 'weekDurations', 'log'],
    nutrition: ['today', 'macros', 'fuel', 'meals', 'week', 'history'],
  },
};

const ALL: MetricId[] = ['fitness', 'nutrition', 'sleep'];

export function buildExperience(p: Profile): Experience {
  const d = DEFAULTS[p.experience];
  const interests = p.interests.length ? p.interests : ALL;
  // Modules of categories the user did not choose are not shown by default
  // (except heroes, which summarise the day), but they can still be pinned.
  const relevant = (m: ModuleId) => m.endsWith('Hero') || interests.includes(MODULE_INFO[m].category);
  const more = ALL.filter((c) => !interests.includes(c));
  const nav: NavId[] = ['home', ...(['fitness', 'nutrition', 'sleep'] as MetricId[]).filter((c) => interests.includes(c)), ...(more.length ? (['more'] as NavId[]) : [])];
  return {
    id: p.experience,
    name: EXPERIENCE_INFO[p.experience].name,
    tagline: EXPERIENCE_INFO[p.experience].tagline,
    detail: d.detail,
    fitnessLabel: p.experience === 'casual' ? 'Activity' : 'Training',
    modules: d.modules.filter(relevant),
    pinnable: d.pinnable,
    nav,
    more,
    fitness: d.fitness,
    sleep: d.sleep,
    nutrition: d.nutrition,
    quickActions: interests,
  };
}

/** Modules actually shown: the user's pins if any, otherwise the defaults. */
export function dashboardModules(p: Profile, e: Experience): ModuleId[] {
  return (p.dashboard ?? e.modules).filter((m) => e.pinnable.includes(m));
}
