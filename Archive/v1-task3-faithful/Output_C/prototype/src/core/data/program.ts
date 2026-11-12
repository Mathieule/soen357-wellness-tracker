/**
 * C: weekly training program built from the questionnaire answers.
 *
 *  - sessionsPerWeek (0–7) decides HOW MANY sessions are planned.
 *  - trainingDays decides WHICH days (spread evenly by default).
 *  - level (sedentary → athlete) decides how long and how hard each session is.
 *  - persona (casual / performance) picks simpler or more technical exercises.
 *
 * A planned session counts as done when a workout is logged on that day.
 * This is a rule-based plan written for the prototype, not coaching advice.
 */
import { addDays, fromISODate, today } from '../lib/dates';
import type { Level, Persona, Profile, RoutineItem, Workout, WorkoutType } from './types';

export const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const DAY_LONG = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const LEVEL_LABEL: Record<Level, string> = {
  sedentary: 'Sedentary',
  beginner: 'Beginner',
  regular: 'Regular',
  athlete: 'Experienced athlete',
};

/** Evenly spread default training days for n sessions per week (0 = Monday). */
export function defaultTrainingDays(n: number): number[] {
  const table: Record<number, number[]> = {
    0: [],
    1: [2],
    2: [1, 4],
    3: [0, 2, 4],
    4: [0, 1, 3, 5],
    5: [0, 1, 2, 4, 5],
    6: [0, 1, 2, 3, 4, 5],
    7: [0, 1, 2, 3, 4, 5, 6],
  };
  return table[Math.max(0, Math.min(7, Math.round(n)))];
}

/** Older profiles (A/B data model) only have `frequency`; map it to a number. */
export function sessionsOf(p: Profile): number {
  if (typeof p.sessionsPerWeek === 'number') return p.sessionsPerWeek;
  return { rarely: 1, '1-2': 2, '3-4': 3, '5+': 5 }[p.frequency];
}

export function trainingDaysOf(p: Profile): number[] {
  return p.trainingDays && p.trainingDays.length === sessionsOf(p) ? p.trainingDays : defaultTrainingDays(sessionsOf(p));
}

export function levelOf(p: Profile): Level {
  return p.level ?? (p.persona === 'performance' ? 'regular' : 'beginner');
}

const MINUTES: Record<Level, number> = { sedentary: 20, beginner: 30, regular: 45, athlete: 60 };

interface Template {
  kind: WorkoutType;
  title: string;
  items: (level: Level, persona: Persona) => RoutineItem[];
}

const reps = (level: Level) => ({ sedentary: '2 × 8', beginner: '3 × 10', regular: '4 × 8', athlete: '5 × 5' })[level];

const TEMPLATES: Template[] = [
  {
    kind: 'Strength',
    title: 'Full-body strength',
    items: (l, p) =>
      p === 'performance'
        ? [
            { name: 'Warm-up', detail: '8 min easy bike' },
            { name: 'Back squat', detail: `${reps(l)} reps` },
            { name: 'Bench press', detail: `${reps(l)} reps` },
            { name: 'Romanian deadlift', detail: `${reps(l)} reps` },
          ]
        : [
            { name: 'Warm-up', detail: '5 min marching on the spot' },
            { name: 'Chair squats', detail: `${reps(l)} reps` },
            { name: 'Wall push-ups', detail: `${reps(l)} reps` },
            { name: 'Stretching', detail: '5 min' },
          ],
  },
  {
    kind: 'Cardio',
    title: 'Cardio',
    items: (l, p) =>
      p === 'performance' && (l === 'regular' || l === 'athlete')
        ? [
            { name: 'Warm-up', detail: '10 min jog' },
            { name: 'Intervals', detail: l === 'athlete' ? '8 × 800 m at 5 km pace' : '6 × 400 m fast, 200 m easy' },
            { name: 'Cool-down', detail: '10 min easy jog' },
          ]
        : [
            { name: 'Brisk walk', detail: `${MINUTES[l] - 5} min` },
            { name: 'Stretching', detail: '5 min' },
          ],
  },
  {
    kind: 'Flexibility',
    title: 'Mobility and core',
    items: (l) => [
      { name: 'Yoga flow', detail: `${Math.round(MINUTES[l] * 0.6)} min` },
      { name: 'Plank', detail: l === 'sedentary' ? '3 × 15 s' : l === 'athlete' ? '3 × 60 s' : '3 × 30 s' },
      { name: 'Breathing', detail: '3 min' },
    ],
  },
];

export interface PlannedSession {
  title: string;
  kind: WorkoutType;
  durationMin: number;
  items: RoutineItem[];
}

export interface PlanDay {
  date: string;
  /** 0 = Monday */
  dayIndex: number;
  session: PlannedSession | null;
  /** A workout was logged that day. */
  logged: boolean;
  isToday: boolean;
  isPast: boolean;
}

/** Monday of the week that contains `iso`. */
export function weekStart(iso: string): string {
  const day = (fromISODate(iso).getDay() + 6) % 7; // Monday = 0
  return addDays(iso, -day);
}

export function weekPlan(profile: Profile, workouts: Workout[], ref = today()): PlanDay[] {
  const days = trainingDaysOf(profile);
  const level = levelOf(profile);
  const start = weekStart(ref);
  const t = today();
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i);
    const slot = days.indexOf(i);
    let session: PlannedSession | null = null;
    if (slot >= 0) {
      const tpl = TEMPLATES[slot % TEMPLATES.length];
      session = { title: tpl.title, kind: tpl.kind, durationMin: MINUTES[level], items: tpl.items(level, profile.persona) };
    }
    return {
      date,
      dayIndex: i,
      session,
      logged: workouts.some((w) => w.date === date),
      isToday: date === t,
      isPast: date < t,
    };
  });
}

/** Suggestion shown on rest days. */
export const REST_DAY: RoutineItem[] = [
  { name: 'Rest day', detail: 'Recovery is part of the plan.' },
  { name: 'Optional', detail: '20 min easy walk' },
];

export function weekProgress(plan: PlanDay[]) {
  const planned = plan.filter((d) => d.session).length;
  const done = plan.filter((d) => d.session && d.logged).length;
  return { planned, done };
}
