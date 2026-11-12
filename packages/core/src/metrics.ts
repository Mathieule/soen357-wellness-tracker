/**
 * Read-only calculations used by the screens. All derived from data the user
 * logged (or sample data). "Readiness" is a simple documented formula on that
 * data, shown as an ESTIMATE; no real biometric measurement is involved.
 */
import { addDays, DAY_SHORT, formatDay, minutesBetween, today, toMinutes, weekdayIndex, weekStart } from './dates';
import type { DayActivity, Meal, SleepSession, SleepStage, UserData, Workout, WorkoutType } from './types';

export function activityOn(u: UserData, date = today()): DayActivity {
  return u.activity.find((a) => a.date === date) ?? { date, steps: 0, activeMin: 0, caloriesKcal: 0 };
}

export function mealsOn(u: UserData, date = today()): Meal[] {
  return u.meals.filter((m) => m.date === date).sort((a, b) => a.time.localeCompare(b.time));
}

export function totals(meals: Meal[]) {
  return meals.reduce((t, m) => ({ calories: t.calories + m.calories, proteinG: t.proteinG + m.proteinG, carbsG: t.carbsG + m.carbsG, fatG: t.fatG + m.fatG }), { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 });
}

export function sortedSleep(u: UserData): SleepSession[] {
  return [...u.sleep].sort((a, b) => b.date.localeCompare(a.date));
}

export function lastSleep(u: UserData): SleepSession | undefined {
  return sortedSleep(u)[0];
}

export function sortedWorkouts(u: UserData): Workout[] {
  return [...u.workouts].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
}

export function stageTotals(s: SleepSession): Record<SleepStage, number> {
  const t: Record<SleepStage, number> = { Awake: 0, REM: 0, Light: 0, Deep: 0 };
  for (let i = 0; i < s.stages.length - 1; i++) t[s.stages[i].stage] += s.stages[i + 1].minute - s.stages[i].minute;
  return t;
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const avg = (xs: number[]) => (xs.length ? sum(xs) / xs.length : 0);
const pct = (now: number, before: number) => (before > 0 ? Math.round(((now - before) / before) * 100) : 0);

/** Last n days ending today, oldest first. */
export function lastDays(n: number, ref = today()): string[] {
  return Array.from({ length: n }, (_, i) => addDays(ref, i - (n - 1)));
}

export const dayLabel = (iso: string) => DAY_SHORT[weekdayIndex(iso)];

export function minutesOn(u: UserData, date: string) {
  return sum(u.workouts.filter((w) => w.date === date).map((w) => w.durationMin));
}

/** Training minutes per week for the last n weeks (oldest first). */
export function weeklyMinutes(u: UserData, n = 6) {
  const start = weekStart(today());
  return Array.from({ length: n }, (_, i) => {
    const ws = addDays(start, -7 * (n - 1 - i));
    const minutes = sum(Array.from({ length: 7 }, (_, d) => minutesOn(u, addDays(ws, d))));
    return { weekStart: ws, minutes, label: i === n - 1 ? 'This wk' : formatDay(ws).split(', ')[1] };
  });
}

const INTENSITY_FACTOR = { easy: 1, moderate: 1.6, hard: 2.3 };

/** Training load (minutes × intensity) over rolling 7-day windows ending today, -7 d, … (oldest first). */
export function weeklyLoad(u: UserData, n = 4) {
  return Array.from({ length: n }, (_, i) => {
    const we = addDays(today(), -7 * (n - 1 - i));
    const ws = addDays(we, -6);
    const load = Math.round(sum(u.workouts.filter((w) => w.date >= ws && w.date <= we).map((w) => w.durationMin * INTENSITY_FACTOR[w.intensity])));
    return { weekStart: ws, weekEnd: we, load, label: i === n - 1 ? 'Now' : formatDay(we).split(', ')[1] };
  });
}

/** Rolling 7-day load vs average of the previous 28 days (acute : chronic). */
export function loadBalance(u: UserData) {
  const t = today();
  const loadBetween = (from: string, to: string) => sum(u.workouts.filter((w) => w.date >= from && w.date <= to).map((w) => w.durationMin * INTENSITY_FACTOR[w.intensity]));
  const acute = loadBetween(addDays(t, -6), t);
  const chronic = loadBetween(addDays(t, -34), addDays(t, -7)) / 4;
  const ratio = chronic > 0 ? acute / chronic : 0;
  return { acute: Math.round(acute), chronic: Math.round(chronic), ratio: Math.round(ratio * 100) / 100 };
}

export function intensityMix(u: UserData, days = 28) {
  const from = addDays(today(), -(days - 1));
  const ws = u.workouts.filter((w) => w.date >= from);
  const by = (k: 'easy' | 'moderate' | 'hard') => sum(ws.filter((w) => w.intensity === k).map((w) => w.durationMin));
  return { easy: by('easy'), moderate: by('moderate'), hard: by('hard') };
}

export function typeMix(u: UserData, days = 28): Record<WorkoutType, number> {
  const from = addDays(today(), -(days - 1));
  const r: Record<WorkoutType, number> = { Strength: 0, Cardio: 0, Mobility: 0, Sport: 0 };
  u.workouts.filter((w) => w.date >= from).forEach((w) => (r[w.type] += w.durationMin));
  return r;
}

/** Comparisons with the previous 7 days. */
export function weekComparison(u: UserData) {
  const t = today();
  const cur = lastDays(7, t);
  const prev = lastDays(7, addDays(t, -7));
  const steps = (ds: string[]) => avg(ds.map((d) => activityOn(u, d).steps));
  const mins = (ds: string[]) => sum(ds.map((d) => minutesOn(u, d)));
  const sleepAvg = (ds: string[]) => avg(u.sleep.filter((s) => ds.includes(s.date)).map((s) => s.durationMin));
  return {
    steps: { now: Math.round(steps(cur)), delta: pct(steps(cur), steps(prev)) },
    minutes: { now: mins(cur), delta: pct(mins(cur), mins(prev)) },
    sleep: { now: Math.round(sleepAvg(cur)), delta: pct(sleepAvg(cur), sleepAvg(prev)) },
  };
}

/** Bedtime spread over the last 7 nights in minutes (lower = more regular). */
export function sleepConsistency(u: UserData) {
  const nights = sortedSleep(u).slice(0, 7);
  if (nights.length < 3) return null;
  // Minutes after 18:00 so 23:30 and 00:30 are close.
  const xs = nights.map((n) => (toMinutes(n.bedtime) + 1440 - 1080) % 1440);
  const mean = avg(xs);
  const sd = Math.sqrt(avg(xs.map((x) => (x - mean) ** 2)));
  const label = sd <= 30 ? 'Very regular' : sd <= 60 ? 'Fairly regular' : 'Irregular';
  const m = Math.round(mean + 1080) % 1440;
  return { spreadMin: Math.round(sd), label, avgBedtime: `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}` };
}

export interface Readiness {
  score: number;
  label: 'Good' | 'Moderate' | 'Take it easy';
  factors: { sleep: number; load: number; routine: number };
  advice: string;
}

/**
 * Readiness (ESTIMATE, 0–100) =
 *   45 % sleep (last night vs goal) + 35 % load balance (7-day vs 4-week
 *   average; 0.8–1.3 is best) + 20 % routine (planned sessions done in the
 *   last 14 days). Returns null without enough data.
 */
export function readiness(u: UserData, plannedPast14: number, donePast14: number): Readiness | null {
  const s = lastSleep(u);
  const lb = loadBalance(u);
  if (!s || lb.chronic === 0) return null;
  const sleep = Math.round(Math.min(1, s.durationMin / u.profile.goals.sleepMin) * 100);
  const r = lb.ratio;
  const load = Math.round(r >= 0.8 && r <= 1.3 ? 100 : r < 0.8 ? 60 + (r / 0.8) * 40 : Math.max(20, 100 - (r - 1.3) * 120));
  const routine = plannedPast14 ? Math.round((donePast14 / plannedPast14) * 100) : 70;
  const score = Math.round(sleep * 0.45 + load * 0.35 + routine * 0.2);
  const label = score >= 75 ? 'Good' : score >= 55 ? 'Moderate' : 'Take it easy';
  const advice = label === 'Good' ? 'Good day for your key session.' : label === 'Moderate' ? 'Train, but keep the intensity in check.' : 'Prefer an easy session or rest today.';
  return { score, label, factors: { sleep, load, routine }, advice };
}

export function sleepMinutes(u: UserData, dates: string[]) {
  return dates.map((d) => u.sleep.find((s) => s.date === d)?.durationMin ?? 0);
}

export { minutesBetween };
