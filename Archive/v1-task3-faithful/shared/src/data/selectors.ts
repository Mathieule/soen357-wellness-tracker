/** Read helpers that turn stored user data into what the screens show. */
import { today } from '../lib/dates';
import type { DayActivity, Meal, SleepSession, UserData, Workout } from './types';

export function todaysActivity(u: UserData): DayActivity {
  const t = today();
  return u.activity.find((a) => a.date === t) ?? { date: t, steps: 0, activeMin: 0, caloriesKcal: 0 };
}

export function mealsOn(u: UserData, date = today()): Meal[] {
  return u.meals.filter((m) => m.date === date).sort((a, b) => b.time.localeCompare(a.time));
}

export function totalsOf(meals: Meal[]) {
  return meals.reduce(
    (t, m) => ({
      calories: t.calories + m.calories,
      proteinG: t.proteinG + m.proteinG,
      carbsG: t.carbsG + m.carbsG,
      fatG: t.fatG + m.fatG,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  );
}

/** Most recent sleep session (normally last night). */
export function lastSleep(u: UserData): SleepSession | undefined {
  return [...u.sleep].sort((a, b) => b.date.localeCompare(a.date))[0];
}

export function sortedSleep(u: UserData): SleepSession[] {
  return [...u.sleep].sort((a, b) => b.date.localeCompare(a.date));
}

/** Exercise log, most recent first (C12). */
export function sortedWorkouts(u: UserData): Workout[] {
  return [...u.workouts].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
}
