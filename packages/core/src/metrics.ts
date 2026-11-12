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

/* ------------------------------------------------------------------ */
/* Progress over week / month / year (Task 2: "Browsing progress charts */
/* from the past week, month, year"; "Graph summarizing previous calorie */
/* intake (month, week, year)").                                         */
/* ------------------------------------------------------------------ */

export type Range = 'week' | 'month' | 'year';
export type SeriesKind = 'calories' | 'minutes' | 'steps' | 'sleep';
export interface SeriesPoint {
  label: string;
  longLabel: string;
  value: number;
  isNow?: boolean;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function dayValue(u: UserData, kind: SeriesKind, d: string): number | null {
  if (kind === 'calories') {
    const ms = u.meals.filter((m) => m.date === d);
    return ms.length ? sum(ms.map((m) => m.calories)) : null;
  }
  if (kind === 'minutes') return minutesOn(u, d);
  if (kind === 'steps') return u.activity.find((a) => a.date === d)?.steps ?? null;
  const s = u.sleep.find((x) => x.date === d);
  return s ? Math.round(s.durationMin / 6) / 10 : null;
}

/**
 * week  → last 7 days, one value per day
 * month → last 30 days, one value per day
 * year  → last 12 months: total minutes per month, or the daily average
 *         (calories, steps, sleep hours) over the days that have data
 */
export function rangeSeries(u: UserData, kind: SeriesKind, range: Range): SeriesPoint[] {
  const t = today();
  if (range !== 'year') {
    return lastDays(range === 'week' ? 7 : 30, t).map((d) => ({
      label: range === 'week' ? dayLabel(d) : String(Number(d.slice(8))),
      longLabel: formatDay(d),
      value: dayValue(u, kind, d) ?? 0,
      isNow: d === t,
    }));
  }
  const [ty, tm] = t.split('-').map(Number);
  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date(ty, tm - 1 - (11 - i), 1);
    const y = date.getFullYear();
    const m = date.getMonth();
    const prefix = `${y}-${String(m + 1).padStart(2, '0')}`;
    const days = new Date(y, m + 1, 0).getDate();
    const vals: number[] = [];
    for (let d = 1; d <= days; d++) {
      const iso = `${prefix}-${String(d).padStart(2, '0')}`;
      if (iso > t) break;
      const v = dayValue(u, kind, iso);
      if (v !== null && (kind !== 'minutes' || v > 0)) vals.push(v);
    }
    const value = kind === 'minutes' ? sum(vals) : vals.length ? Math.round((avg(vals) * 10)) / 10 : 0;
    return { label: MONTHS[m], longLabel: `${MONTHS[m]} ${y}${kind === 'minutes' ? ' (total)' : ' (daily average)'}`, value: kind === 'sleep' ? value : Math.round(value), isNow: i === 11 };
  });
}

/* ------------------------------------------------------------------ */
/* Recommendations (Task 2 Output B concept), rule-based on logged data */
/* ------------------------------------------------------------------ */

export interface Recommendation {
  category: 'fitness' | 'nutrition' | 'sleep';
  text: string;
}

export function recommendations(u: UserData, opts: { sleep: boolean; plannedLeft: number; nextDay?: string }): Recommendation[] {
  const out: Recommendation[] = [];
  const g = u.profile.goals;
  const s = lastSleep(u);
  if (opts.sleep && s && s.durationMin < g.sleepMin * 0.85) {
    const wake = toMinutes(s.wakeTime);
    const bed = (wake - g.sleepMin + 1440 * 2) % 1440;
    out.push({ category: 'sleep', text: `You slept ${Math.floor(s.durationMin / 60)} h ${s.durationMin % 60} min. To reach ${g.sleepMin / 60} h, aim to be in bed by ${String(Math.floor(bed / 60)).padStart(2, '0')}:${String(bed % 60).padStart(2, '0')}.` });
  }
  const t = totals(mealsOn(u));
  const hour = new Date().getHours();
  if (t.calories > 0 && hour >= 14 && t.proteinG < g.proteinG * 0.5) out.push({ category: 'nutrition', text: `Protein is at ${t.proteinG} of ${g.proteinG} g today. A protein-rich snack would help.` });
  if (u.profile.fitnessGoals.includes('lose-weight') && t.calories > g.calories) out.push({ category: 'nutrition', text: `You are ${t.calories - g.calories} kcal over today's goal. A light dinner keeps you on track.` });
  const lb = loadBalance(u);
  if (lb.ratio > 1.3) out.push({ category: 'fitness', text: 'Your training load is well above your usual week. Keep the next session easy.' });
  else if (opts.plannedLeft > 0) out.push({ category: 'fitness', text: `${opts.plannedLeft} planned workout${opts.plannedLeft > 1 ? 's' : ''} left this week${opts.nextDay ? `; the next one is ${opts.nextDay}` : ''}.` });
  const a = activityOn(u);
  if (out.length < 3 && u.activity.length && a.steps < g.steps) out.push({ category: 'fitness', text: `${(g.steps - a.steps).toLocaleString('en-CA')} steps to reach your daily goal.` });
  return out.slice(0, 3);
}
