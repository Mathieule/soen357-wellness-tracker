/**
 * Weekly training program built from the questionnaire answers.
 *  - sessionsPerWeek (0–7) decides HOW MANY sessions are planned;
 *  - trainingDays decides WHICH days (spread evenly by default);
 *  - level decides how long and how hard each session is;
 *  - experience picks simple activities (casual) or technical training.
 * A planned session counts as done when a workout is logged that day.
 * Rule-based content written for the prototype; not coaching advice.
 */
import { addDays, today, weekStart } from './dates';
import type { ExperienceId, Intensity, Level, Profile, Workout, WorkoutType } from './types';

export interface Exercise {
  name: string;
  detail: string;
}

export interface PlannedSession {
  title: string;
  type: WorkoutType;
  durationMin: number;
  intensity: Intensity;
  exercises: Exercise[];
  /** Short coaching note shown with the session. */
  focus: string;
}

export interface PlanDay {
  date: string;
  dayIndex: number; // 0 = Monday
  session: PlannedSession | null;
  logged: Workout[];
  isToday: boolean;
  isPast: boolean;
}

export const LEVEL_LABEL: Record<Level, string> = {
  sedentary: 'Sedentary',
  beginner: 'Beginner',
  regular: 'Regular',
  athlete: 'Experienced athlete',
};

export function defaultTrainingDays(n: number): number[] {
  const table: Record<number, number[]> = { 0: [], 1: [2], 2: [1, 4], 3: [0, 2, 4], 4: [0, 1, 3, 5], 5: [0, 1, 2, 4, 5], 6: [0, 1, 2, 3, 4, 5], 7: [0, 1, 2, 3, 4, 5, 6] };
  return table[Math.max(0, Math.min(7, Math.round(n)))];
}

const MINUTES: Record<Level, number> = { sedentary: 20, beginner: 30, regular: 45, athlete: 60 };
const SETS: Record<Level, string> = { sedentary: '2 × 8', beginner: '3 × 10', regular: '4 × 8', athlete: '5 × 5' };

type Template = (l: Level, e: ExperienceId) => Omit<PlannedSession, 'durationMin'>;

const STRENGTH: Template = (l, e) =>
  e === 'casual'
    ? {
        title: 'Strength basics',
        type: 'Strength',
        intensity: 'easy',
        focus: 'Move slowly and keep good form.',
        exercises: [
          { name: 'Warm-up', detail: '5 min marching' },
          { name: 'Chair squats', detail: `${SETS[l]} reps` },
          { name: 'Wall push-ups', detail: `${SETS[l]} reps` },
          { name: 'Stretching', detail: '5 min' },
        ],
      }
    : {
        title: 'Full-body strength',
        type: 'Strength',
        intensity: l === 'athlete' ? 'hard' : 'moderate',
        focus: e === 'performance' ? 'Leave 1–2 reps in reserve on the last set.' : 'Add a little weight when all sets feel easy.',
        exercises: [
          { name: 'Warm-up', detail: '8 min easy bike' },
          { name: 'Back squat', detail: `${SETS[l]} reps` },
          { name: 'Bench press', detail: `${SETS[l]} reps` },
          { name: 'Romanian deadlift', detail: `${SETS[l]} reps` },
          ...(e === 'performance' ? [{ name: 'Pull-ups', detail: '4 × max' }] : []),
        ],
      };

const CARDIO: Template = (l, e) =>
  e === 'casual' || l === 'sedentary' || l === 'beginner'
    ? {
        title: 'Brisk walk',
        type: 'Cardio',
        intensity: 'easy',
        focus: 'You should still be able to talk.',
        exercises: [
          { name: 'Brisk walk', detail: `${MINUTES[l] - 5} min` },
          { name: 'Stretching', detail: '5 min' },
        ],
      }
    : {
        title: e === 'performance' ? 'Intervals' : 'Steady run',
        type: 'Cardio',
        intensity: e === 'performance' ? 'hard' : 'moderate',
        focus: e === 'performance' ? 'Hold 5 km pace on each repeat; jog the recoveries.' : 'Keep a pace you could hold for an hour.',
        exercises:
          e === 'performance'
            ? [
                { name: 'Warm-up', detail: '12 min easy + 4 strides' },
                { name: 'Intervals', detail: l === 'athlete' ? '6 × 800 m, 2 min jog' : '6 × 400 m, 90 s jog' },
                { name: 'Cool-down', detail: '10 min easy' },
              ]
            : [
                { name: 'Warm-up', detail: '5 min walk' },
                { name: 'Run', detail: `${MINUTES[l] - 10} min easy` },
                { name: 'Cool-down', detail: '5 min walk' },
              ],
      };

const MOBILITY: Template = (l) => ({
  title: 'Mobility and core',
  type: 'Mobility',
  intensity: 'easy',
  focus: 'Breathe slowly; this session helps recovery.',
  exercises: [
    { name: 'Yoga flow', detail: `${Math.round(MINUTES[l] * 0.6)} min` },
    { name: 'Plank', detail: l === 'sedentary' ? '3 × 15 s' : l === 'athlete' ? '3 × 60 s' : '3 × 30 s' },
    { name: 'Breathing', detail: '3 min' },
  ],
});

const ROTATION: Template[] = [STRENGTH, CARDIO, MOBILITY];

export function plannedSessionFor(profile: Profile, slot: number): PlannedSession {
  const t = ROTATION[slot % ROTATION.length](profile.level, profile.experience);
  return { ...t, durationMin: MINUTES[profile.level] };
}

export function weekPlan(profile: Profile, workouts: Workout[], ref = today()): PlanDay[] {
  const start = weekStart(ref);
  const t = today();
  const days = profile.trainingDays.length === profile.sessionsPerWeek ? profile.trainingDays : defaultTrainingDays(profile.sessionsPerWeek);
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i);
    const slot = days.indexOf(i);
    return {
      date,
      dayIndex: i,
      session: slot >= 0 ? plannedSessionFor(profile, slot) : null,
      logged: workouts.filter((w) => w.date === date),
      isToday: date === t,
      isPast: date < t,
    };
  });
}

export function weekProgress(plan: PlanDay[]) {
  return { planned: plan.filter((d) => d.session).length, done: plan.filter((d) => d.session && d.logged.length > 0).length };
}

/** Today's session, or the next planned one this week (or null). */
export function nextSession(plan: PlanDay[]): PlanDay | null {
  return plan.find((d) => d.session && !d.isPast && !(d.isToday && d.logged.length)) ?? null;
}

export const REST_DAY: Exercise[] = [
  { name: 'Rest day', detail: 'Recovery is part of the plan' },
  { name: 'Optional', detail: '20 min easy walk' },
];
