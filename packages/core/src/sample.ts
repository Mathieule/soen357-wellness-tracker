/**
 * SAMPLE data for the three demo accounts. Nothing comes from a real person or
 * device. A seeded generator gives the same data on every load; dates are
 * relative to today so the prototype always looks current.
 * New accounts created in the prototype start EMPTY.
 */
import { addDays, minutesBetween, today, weekdayIndex } from './dates';
import { defaultTrainingDays, plannedSessionFor } from './program';
import type { Account, DayActivity, ExperienceId, FitnessGoal, Goals, Level, Meal, MealType, Profile, SleepSession, SleepStage, UserData, Workout } from './types';

export function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const between = (r: () => number, min: number, max: number) => Math.round(min + r() * (max - min));

export function uid(prefix = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Default daily goals for an experience and level. */
export function defaultGoals(experience: ExperienceId, level: Level, weightKg = 70, fitnessGoals: FitnessGoal[] = []): Goals {
  const active = { sedentary: 20, beginner: 30, regular: 45, athlete: 60 }[level];
  const steps = { casual: 7000, training: 9000, performance: 11000 }[experience];
  // Calorie goal: base per persona, adjusted by fitness goals. The user can change it in Profile.
  const calories = { casual: 2100, training: 2400, performance: 2800 }[experience] + (fitnessGoals.includes('lose-weight') ? -400 : 0) + (fitnessGoals.includes('build-strength') ? 250 : 0);
  const proteinPerKg = { casual: 1.0, training: 1.4, performance: 1.8 }[experience];
  const proteinG = Math.round(weightKg * proteinPerKg);
  const fatG = Math.round((calories * 0.28) / 9);
  const carbsG = Math.round((calories - proteinG * 4 - fatG * 9) / 4);
  return { steps, activeMin: active, calories, proteinG, carbsG, fatG, sleepMin: 480 };
}

/* ------------------------------------------------------------------ */
/* Foods (also used by the simulated photo recognition)                */
/* ------------------------------------------------------------------ */

export const FOOD_LIBRARY: Omit<Meal, 'id' | 'date' | 'time' | 'mealType' | 'source'>[] = [
  { name: 'Oatmeal with berries', calories: 340, proteinG: 11, carbsG: 58, fatG: 7 },
  { name: 'Greek yogurt and granola', calories: 310, proteinG: 19, carbsG: 38, fatG: 9 },
  { name: 'Eggs on toast', calories: 420, proteinG: 22, carbsG: 34, fatG: 20 },
  { name: 'Chicken salad', calories: 480, proteinG: 40, carbsG: 20, fatG: 25 },
  { name: 'Turkey sandwich', calories: 540, proteinG: 32, carbsG: 56, fatG: 18 },
  { name: 'Salmon, rice and broccoli', calories: 680, proteinG: 44, carbsG: 66, fatG: 24 },
  { name: 'Pasta with tomato sauce', calories: 620, proteinG: 20, carbsG: 102, fatG: 12 },
  { name: 'Veggie stir-fry with tofu', calories: 510, proteinG: 26, carbsG: 50, fatG: 22 },
  { name: 'Beef burrito bowl', calories: 760, proteinG: 42, carbsG: 84, fatG: 26 },
  { name: 'Apple', calories: 95, proteinG: 0, carbsG: 25, fatG: 0 },
  { name: 'Banana', calories: 105, proteinG: 1, carbsG: 27, fatG: 0 },
  { name: 'Protein shake', calories: 220, proteinG: 30, carbsG: 10, fatG: 4 },
  { name: 'Trail mix', calories: 260, proteinG: 7, carbsG: 22, fatG: 17 },
];

const MEAL_PLAN: [MealType, string, number[]][] = [
  ['Breakfast', '07:45', [0, 1, 2]],
  ['Lunch', '12:30', [3, 4, 7]],
  ['Snack', '15:45', [9, 10, 11, 12]],
  ['Dinner', '19:00', [5, 6, 7, 8]],
];

/* ------------------------------------------------------------------ */
/* Sleep                                                               */
/* ------------------------------------------------------------------ */

/** Plausible hypnogram: ~90 min cycles, more deep sleep early, more REM late. */
export function buildStages(durationMin: number, seed: number): SleepSession['stages'] {
  const r = rng(seed);
  const pts: SleepSession['stages'] = [{ minute: 0, stage: 'Awake' }];
  let m = between(r, 8, 18);
  let cycle = 0;
  while (m < durationMin - 10) {
    const early = cycle < 2;
    const seq: [SleepStage, number][] = [
      ['Light', between(r, 15, 30)],
      ['Deep', early ? between(r, 25, 40) : between(r, 5, 15)],
      ['Light', between(r, 10, 20)],
      ['REM', early ? between(r, 8, 15) : between(r, 20, 35)],
    ];
    if (r() < 0.3) seq.push(['Awake', between(r, 2, 6)]);
    for (const [stage, len] of seq) {
      if (m >= durationMin - 5) break;
      pts.push({ minute: m, stage });
      m += len;
    }
    cycle++;
  }
  pts.push({ minute: durationMin, stage: 'Awake' });
  return pts;
}

/* ------------------------------------------------------------------ */
/* Demo accounts                                                       */
/* ------------------------------------------------------------------ */

interface DemoSpec {
  account: Account;
  profile: Omit<Profile, 'goals' | 'trainingDays' | 'dashboard' | 'ratings'>;
  seed: number;
  steps: [number, number];
  bedtimes: [number, number]; // hours, 22–24
}

const DEMOS: DemoSpec[] = [
  {
    account: { email: 'sam@example.com', password: 'Demo1234' },
    profile: { name: 'Sam Lee', email: 'sam@example.com', age: 46, weightKg: 78, heightCm: 172, experience: 'casual', level: 'beginner', sessionsPerWeek: 2, interests: ['fitness', 'nutrition'], fitnessGoals: ['stay-healthy'] },
    seed: 11,
    steps: [3500, 9000],
    bedtimes: [22, 24],
  },
  {
    account: { email: 'alex@example.com', password: 'Demo1234' },
    profile: { name: 'Alex Martin', email: 'alex@example.com', age: 29, weightKg: 72, heightCm: 176, experience: 'training', level: 'regular', sessionsPerWeek: 4, interests: ['fitness', 'nutrition', 'sleep'], fitnessGoals: ['build-strength', 'endurance'] },
    seed: 23,
    steps: [6000, 12500],
    bedtimes: [22, 24],
  },
  {
    account: { email: 'jordan@example.com', password: 'Demo1234' },
    profile: { name: 'Jordan Rivera', email: 'jordan@example.com', age: 24, weightKg: 66, heightCm: 180, experience: 'performance', level: 'athlete', sessionsPerWeek: 6, interests: ['fitness', 'sleep', 'nutrition'], fitnessGoals: ['endurance', 'sleep-better'] },
    seed: 37,
    steps: [8500, 16000],
    bedtimes: [21, 23],
  },
];

export const DEMO_ACCOUNTS = DEMOS.map((d) => ({ ...d.account, name: d.profile.name, experience: d.profile.experience }));

export function newProfile(p: Omit<Profile, 'goals' | 'trainingDays' | 'dashboard' | 'ratings'>): Profile {
  return { ...p, trainingDays: defaultTrainingDays(p.sessionsPerWeek), dashboard: null, ratings: [], goals: defaultGoals(p.experience, p.level, p.weightKg, p.fitnessGoals) };
}

/** Sample history for a profile: workouts follow the plan, meals land near the goal. */
export function sampleHistory(profile: Profile, seed: number, steps: [number, number] = [5000, 11000], bedtimes: [number, number] = [22, 24]): Omit<UserData, 'profile'> {
  const r = rng(seed);
  const t = today();
  const workouts: Workout[] = [];
  const activity: DayActivity[] = [];
  const meals: Meal[] = [];
  const sleep: SleepSession[] = [];

  // One year of history so week / month / year charts are meaningful.
  for (let i = 0; i <= 365; i++) {
    const date = addDays(t, -i);
    const wd = weekdayIndex(date);
    // Activity
    const f = i === 0 ? 0.55 : 1;
    const s = Math.round(between(r, steps[0], steps[1]) * f);
    activity.push({ date, steps: s, activeMin: Math.round(between(r, 15, 80) * f), caloriesKcal: Math.round((1650 + s * 0.045) * f) });
    // Workouts on training days (skip ~1 in 8, never in the last 7 days)
    const slot = profile.trainingDays.indexOf(wd);
    if (i > 0 && slot >= 0 && !(i > 7 && r() < 0.13)) {
      const p = plannedSessionFor(profile, slot);
      const dur = Math.max(15, p.durationMin + between(r, -8, 10));
      const kpm = p.type === 'Cardio' ? 9 : p.type === 'Strength' ? 6 : 3.5;
      workouts.push({ id: `w-s-${i}`, date, time: `${String(between(r, 6, 19)).padStart(2, '0')}:${r() < 0.5 ? '00' : '30'}`, name: p.title, type: p.type, durationMin: dur, caloriesKcal: Math.round(dur * kpm), intensity: p.intensity, fromPlan: true });
    }
    // Meals near the calorie goal
    {
      const plan = i === 0 ? MEAL_PLAN.slice(0, 2) : MEAL_PLAN;
      let total = 0;
      for (const [mealType, time, options] of plan) {
        let food = FOOD_LIBRARY[options[between(r, 0, options.length - 1)]];
        // Larger portions for higher goals.
        const scale = profile.goals.calories / 2000;
        food = { ...food, calories: Math.round(food.calories * scale), proteinG: Math.round(food.proteinG * scale), carbsG: Math.round(food.carbsG * scale), fatG: Math.round(food.fatG * scale) };
        total += food.calories;
        meals.push({ id: `m-s-${i}-${mealType}`, date, time, mealType, source: 'manual', ...food });
      }
      void total;
    }
    // Sleep for the last 90 nights
    if (i <= 89) {
      const bh = between(r, bedtimes[0], bedtimes[1]);
      const bedtime = `${String(bh % 24).padStart(2, '0')}:${r() < 0.5 ? '00' : '30'}`;
      const wakeTime = `0${between(r, 6, 7)}:${r() < 0.5 ? '15' : '45'}`;
      const durationMin = minutesBetween(bedtime, wakeTime);
      sleep.push({ id: `s-s-${i}`, date, bedtime, wakeTime, durationMin, stages: buildStages(durationMin, seed * 100 + i) });
    }
  }
  return { workouts, activity, meals, sleep };
}

export function demoUsers(): { accounts: Account[]; users: Record<string, UserData> } {
  const users: Record<string, UserData> = {};
  for (const d of DEMOS) {
    const profile = newProfile(d.profile);
    users[d.account.email] = { profile, ...sampleHistory(profile, d.seed, d.steps, d.bedtimes) };
  }
  return { accounts: DEMOS.map((d) => d.account), users };
}
