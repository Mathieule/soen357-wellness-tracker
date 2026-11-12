/**
 * Realistic SAMPLE data. Nothing here comes from a real person or a real device.
 * A seeded random generator makes the data identical on every load, and all
 * dates are relative to "today", so the prototype always looks current.
 */
import { addDays, fromISODate, minutesBetween, today } from '../lib/dates';
import type {
  DayActivity,
  Meal,
  MealType,
  NutritionGoals,
  Persona,
  Profile,
  RoutineItem,
  SleepSession,
  SleepStage,
  SleepStagePoint,
  UserData,
  Workout,
  WorkoutType,
} from './types';

/** mulberry32: tiny deterministic PRNG. */
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const between = (r: () => number, min: number, max: number) =>
  Math.round(min + r() * (max - min));

export function uid(prefix = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/* ------------------------------------------------------------------ */
/* Fitness                                                             */
/* ------------------------------------------------------------------ */

const WORKOUT_LIBRARY: { name: string; type: WorkoutType; kcalPerMin: number }[] = [
  { name: 'Upper body strength', type: 'Strength', kcalPerMin: 6 },
  { name: 'Leg day', type: 'Strength', kcalPerMin: 7 },
  { name: 'Morning run', type: 'Cardio', kcalPerMin: 10 },
  { name: 'Cycling', type: 'Cardio', kcalPerMin: 8 },
  { name: 'Brisk walk', type: 'Cardio', kcalPerMin: 4 },
  { name: 'Yoga', type: 'Flexibility', kcalPerMin: 3 },
  { name: 'Swimming', type: 'Cardio', kcalPerMin: 9 },
  { name: 'Basketball', type: 'Sport', kcalPerMin: 8 },
];

export function sampleActivity(days = 60): DayActivity[] {
  const r = rng(11);
  const t = today();
  return Array.from({ length: days }, (_, i) => {
    const date = addDays(t, -i);
    // Today is only partly done, so its numbers are lower.
    const factor = i === 0 ? 0.55 : 1;
    const steps = Math.round(between(r, 4200, 12800) * factor);
    return {
      date,
      steps,
      activeMin: Math.round(between(r, 18, 75) * factor),
      caloriesKcal: Math.round((1700 + steps * 0.045) * factor),
    };
  });
}

/**
 * C: sample workouts follow the user's training days (0 = Monday), with
 * about one session in seven skipped, so the weekly plan looks realistic.
 */
export function sampleWorkouts(trainingDays: number[] = [0, 2, 4]): Workout[] {
  const r = rng(7);
  const t = today();
  const list: Workout[] = [];
  for (let i = 1; i <= 28; i++) {
    const date = addDays(t, -i);
    const weekday = (fromISODate(date).getDay() + 6) % 7;
    // Skip ~1 in 7 sessions, but never in the last 7 days (keeps the demo week tidy).
    if (!trainingDays.includes(weekday) || (i > 7 && r() < 0.15)) continue;
    const w = WORKOUT_LIBRARY[between(r, 0, WORKOUT_LIBRARY.length - 1)];
    const durationMin = between(r, 25, 65);
    list.push({
      id: `w-sample-${i}`,
      date,
      time: `${String(between(r, 6, 19)).padStart(2, '0')}:${r() < 0.5 ? '00' : '30'}`,
      name: w.name,
      type: w.type,
      durationMin,
      caloriesKcal: Math.round(durationMin * w.kcalPerMin),
    });
  }
  return list;
}

/** Today's planned routine. Performance users get a more demanding plan. */
export function todaysRoutine(persona: Persona, isoDate = today()): RoutineItem[] {
  const weekday = fromISODate(isoDate).getDay();
  const strength = weekday % 2 === 0;
  if (persona === 'performance') {
    return strength
      ? [
          { name: 'Warm-up', detail: '10 min easy bike' },
          { name: 'Back squat', detail: '5 sets × 5 reps' },
          { name: 'Romanian deadlift', detail: '4 sets × 8 reps' },
          { name: 'Walking lunges', detail: '3 sets × 12 reps' },
        ]
      : [
          { name: 'Warm-up', detail: '10 min jog' },
          { name: 'Intervals', detail: '6 × 800 m at 5 km pace' },
          { name: 'Cool-down', detail: '10 min easy jog' },
        ];
  }
  return strength
    ? [
        { name: 'Walk', detail: '20 min at a comfortable pace' },
        { name: 'Bodyweight squats', detail: '2 sets × 10 reps' },
        { name: 'Stretching', detail: '10 min' },
      ]
    : [
        { name: 'Walk', detail: '30 min' },
        { name: 'Stretching', detail: '10 min' },
      ];
}

/* ------------------------------------------------------------------ */
/* Nutrition                                                           */
/* ------------------------------------------------------------------ */

/** Food "database" used by the simulated photo recognition and the sample log. */
export const FOOD_LIBRARY: Omit<Meal, 'id' | 'date' | 'time' | 'mealType' | 'source'>[] = [
  { name: 'Oatmeal with berries', calories: 320, proteinG: 10, carbsG: 54, fatG: 7 },
  { name: 'Greek yogurt and granola', calories: 280, proteinG: 17, carbsG: 34, fatG: 8 },
  { name: 'Chicken salad', calories: 450, proteinG: 38, carbsG: 18, fatG: 24 },
  { name: 'Turkey sandwich', calories: 520, proteinG: 30, carbsG: 55, fatG: 18 },
  { name: 'Salmon, rice and broccoli', calories: 640, proteinG: 42, carbsG: 62, fatG: 22 },
  { name: 'Pasta with tomato sauce', calories: 590, proteinG: 19, carbsG: 98, fatG: 12 },
  { name: 'Apple', calories: 95, proteinG: 0, carbsG: 25, fatG: 0 },
  { name: 'Banana', calories: 105, proteinG: 1, carbsG: 27, fatG: 0 },
  { name: 'Protein shake', calories: 210, proteinG: 30, carbsG: 9, fatG: 4 },
  { name: 'Veggie stir-fry with tofu', calories: 480, proteinG: 24, carbsG: 46, fatG: 21 },
];

export function sampleMeals(): Meal[] {
  const r = rng(23);
  const t = today();
  const meals: Meal[] = [];
  const plan: [MealType, string, number[]][] = [
    ['Breakfast', '08:00', [0, 1]],
    ['Lunch', '12:30', [2, 3, 9]],
    ['Snack', '15:30', [6, 7, 8]],
    ['Dinner', '19:00', [4, 5, 9]],
  ];
  for (let i = 0; i <= 13; i++) {
    const date = addDays(t, -i);
    // Today: only breakfast and lunch are logged so far.
    const todaysPlan = i === 0 ? plan.slice(0, 2) : plan;
    for (const [mealType, time, options] of todaysPlan) {
      const food = FOOD_LIBRARY[options[between(r, 0, options.length - 1)]];
      meals.push({ id: `m-sample-${i}-${mealType}`, date, time, mealType, source: 'manual', ...food });
    }
  }
  return meals;
}

export function defaultGoals(persona: Persona): NutritionGoals {
  return persona === 'performance'
    ? { calories: 2800, proteinG: 160, carbsG: 330, fatG: 85, steps: 10000, activeMin: 60, sleepMin: 480 }
    : { calories: 2100, proteinG: 90, carbsG: 250, fatG: 70, steps: 7000, activeMin: 30, sleepMin: 480 };
}

/* ------------------------------------------------------------------ */
/* Sleep                                                               */
/* ------------------------------------------------------------------ */

/**
 * Builds a plausible hypnogram: ~90 min cycles, more deep sleep early in the
 * night and more REM later, with short awakenings.
 */
export function buildStages(durationMin: number, seed: number): SleepStagePoint[] {
  const r = rng(seed);
  const points: SleepStagePoint[] = [{ minute: 0, stage: 'Awake' }];
  let minute = between(r, 8, 18); // time to fall asleep
  let cycle = 0;
  while (minute < durationMin - 10) {
    const early = cycle < 2;
    const seq: [SleepStage, number][] = [
      ['Light', between(r, 15, 30)],
      ['Deep', early ? between(r, 25, 40) : between(r, 5, 15)],
      ['Light', between(r, 10, 20)],
      ['REM', early ? between(r, 8, 15) : between(r, 20, 35)],
    ];
    if (r() < 0.3) seq.push(['Awake', between(r, 2, 6)]);
    for (const [stage, len] of seq) {
      if (minute >= durationMin - 5) break;
      points.push({ minute, stage });
      minute += len;
    }
    cycle++;
  }
  points.push({ minute: durationMin, stage: 'Awake' });
  return points;
}

export function sampleSleep(nights = 14): SleepSession[] {
  const r = rng(31);
  const t = today();
  return Array.from({ length: nights }, (_, i) => {
    const bedH = between(r, 22, 24);
    const bedM = r() < 0.5 ? 0 : 30;
    const bedtime = `${String(bedH % 24).padStart(2, '0')}:${bedM === 0 ? '00' : '30'}`;
    const wakeTime = `0${between(r, 6, 7)}:${r() < 0.5 ? '15' : '45'}`;
    const durationMin = minutesBetween(bedtime, wakeTime);
    return {
      id: `s-sample-${i}`,
      date: addDays(t, -i),
      bedtime,
      wakeTime,
      durationMin,
      stages: buildStages(durationMin, 100 + i),
    };
  });
}

/** Minutes spent in each stage, computed from the hypnogram. */
export function stageTotals(session: SleepSession): Record<SleepStage, number> {
  const totals: Record<SleepStage, number> = { Awake: 0, REM: 0, Light: 0, Deep: 0 };
  const s = session.stages;
  for (let i = 0; i < s.length - 1; i++) totals[s[i].stage] += s[i + 1].minute - s[i].minute;
  return totals;
}

/* ------------------------------------------------------------------ */
/* Seed                                                                */
/* ------------------------------------------------------------------ */

/** Simulated pre-existing account so the "log in" and "email already used" paths can be tried. */
export const DEMO_ACCOUNT = { email: 'demo@example.com', password: 'Demo1234' };

export const DEMO_PROFILE: Profile = {
  name: 'Alex Martin',
  email: DEMO_ACCOUNT.email,
  age: 29,
  weightKg: 72,
  heightCm: 176,
  frequency: '3-4',
  level: 'regular',
  sessionsPerWeek: 4,
  trainingDays: [0, 1, 3, 5],
  persona: 'performance',
  metrics: ['fitness', 'nutrition', 'sleep'],
};

/** Full sample history for a profile (used for the demo account and new sign-ups). */
export function seedUserData(profile: Profile): UserData {
  return {
    profile,
    workouts: sampleWorkouts(profile.trainingDays),
    activity: sampleActivity(),
    meals: sampleMeals(),
    sleep: sampleSleep(),
    goals: defaultGoals(profile.persona),
  };
}
