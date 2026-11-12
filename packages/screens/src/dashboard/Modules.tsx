/**
 * Dashboard modules. Each module is one self-contained card; which ones are
 * shown, in what order, and how detailed they are, comes from the
 * personalization engine (experience.modules / detail) and the user's pins.
 * Module titles are links to the matching section (keyboard: ↓ / ↑ move
 * between module titles, see Dashboard).
 */
import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import {
  activityOn, DAY_LONG, formatDuration, lastSleep, loadBalance, mealsOn, MODULE_INFO, nextSession, readiness, recommendations, stageTotals, today, totals, useUser, weekComparison, weekPlan, weekProgress,
  weeklyLoad, addDays, type ModuleId, type PlanDay,
} from '@core';
import { ArcGauge, BarsChart, Button, CATEGORY, CategoryBadge, Delta, Hypnogram, Pill, ProgressRing, StageBar, TrendChart, WeekStrip, type Category } from '@ds';
import { stripDays } from '../fitness/FitnessScreen';
import { quality } from '../sleep/SleepScreen';

const PATH: Record<Category, string> = { fitness: '/fitness', nutrition: '/nutrition', sleep: '/sleep' };

function ModuleCard({ id, hero, children, action, className = '', title }: { id: ModuleId; hero?: boolean; children: ReactNode; action?: ReactNode; className?: string; title?: string }) {
  const info = MODULE_INFO[id];
  const cat = info.category;
  return (
    <section aria-labelledby={`mod-${id}`} className={`${hero ? CATEGORY[cat].hero : 'card'} p-5 ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 id={`mod-${id}`} className="m-0 text-lg font-bold">
          <Link to={PATH[cat]} state={{ via: 'widget' }} data-module-link className="-m-2 inline-flex min-h-11 items-center gap-1 rounded-xl p-2 text-ink no-underline hover:underline">
            {title ?? info.name}
            <ChevronRight aria-hidden="true" className="size-5" />
          </Link>
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Calorie goal for today (set by the user in Profile), shown with today's workout. */
function CalorieGoalRow() {
  const { user } = useUser();
  const eaten = totals(mealsOn(user)).calories;
  const goal = user.profile.goals.calories;
  return (
    <Link to="/nutrition" state={{ via: 'widget' }} className="mt-4 flex min-h-14 items-center gap-3 rounded-2xl bg-sunken px-4 py-2 text-ink no-underline hover:bg-surface-hi">
      <CategoryBadge category="nutrition" size={36} />
      <span className="min-w-0 flex-1">
        <span className="block font-bold">Calorie goal: {goal.toLocaleString('en-CA')} kcal</span>
        <span className="block text-ink-soft">
          {eaten.toLocaleString('en-CA')} eaten · {Math.max(0, goal - eaten).toLocaleString('en-CA')} left
        </span>
      </span>
      <ChevronRight aria-hidden="true" className="size-5" />
    </Link>
  );
}

/** Recommendations (Output B/C): rule-based suggestions from the logged data. */
export function TipsModule() {
  const { user, iteration } = useUser();
  const plan = weekPlan(user.profile, user.workouts);
  const left = plan.filter((d) => d.session && !d.logged.length && !d.isPast).length;
  const n = nextSession(plan);
  const tips = recommendations(user, { sleep: iteration.sleep, plannedLeft: left, nextDay: n ? (n.isToday ? 'today' : DAY_LONG[n.dayIndex]) : undefined });
  return (
    <ModuleCard id="tips">
      {tips.length === 0 ? (
        <p className="m-0">Nothing to suggest right now. Keep logging and suggestions will appear here.</p>
      ) : (
        <ul className="m-0 grid list-none gap-3 p-0">
          {tips.map((t) => (
            <li key={t.text} className="flex items-start gap-3">
              <CategoryBadge category={t.category} size={36} />
              <span className="pt-1.5">{t.text}</span>
            </li>
          ))}
        </ul>
      )}
    </ModuleCard>
  );
}

export function StepsHero() {
  const { user } = useUser();
  const a = activityOn(user);
  const g = user.profile.goals.steps;
  const left = Math.max(0, g - a.steps);
  return (
    <ModuleCard id="stepsHero" hero>
      <div className="flex flex-col items-center text-center">
        <ArcGauge value={a.steps} max={g} accent={CATEGORY.fitness.accent} size={232}>
          <span className="text-4xl font-bold leading-none">{a.steps.toLocaleString('en-CA')}</span>
          <span className="mt-1">of {g.toLocaleString('en-CA')} steps</span>
        </ArcGauge>
        <p className="m-0 -mt-2 text-lg">{user.activity.length === 0 ? 'Connect a device in Settings to count your steps (simulated).' : left === 0 ? 'Goal reached. Great work today!' : `${left.toLocaleString('en-CA')} steps to go. A short walk will do it.`}</p>
      </div>
    </ModuleCard>
  );
}

export function SessionHero({ onLog }: { onLog: (d: PlanDay) => void }) {
  const { user, experience } = useUser();
  const plan = weekPlan(user.profile, user.workouts);
  const todayDay = plan.find((d) => d.isToday)!;
  const n = todayDay.session ? todayDay : nextSession(plan);
  const s = n?.session;
  const label = !n ? 'No session planned' : n.isToday ? (experience.id === 'performance' ? 'Key session' : 'Planned for today') : `Next up · ${n.date === addDays(today(), 1) ? 'tomorrow' : new Date(n.date + 'T12:00').toLocaleDateString('en-CA', { weekday: 'long' })}`;
  return (
    <ModuleCard id="sessionHero" hero title={n?.isToday ? "Today's workout" : 'Next workout'}>
      <p className="m-0">{label}</p>
      {s ? (
        <>
          <p className="m-0 mt-1 text-3xl font-bold leading-tight">{s.title}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Pill>{s.durationMin} min</Pill>
            <Pill>{s.exercises.length} exercises</Pill>
            <Pill>{s.intensity[0].toUpperCase() + s.intensity.slice(1)}</Pill>
            {n!.logged.length > 0 && <Pill tone="nutrition">✓ Done</Pill>}
          </div>
          {experience.detail !== 'simple' && <p className="m-0 mt-3">{s.focus}</p>}
          {n!.isToday && !n!.logged.length && (
            <Button className="mt-4" block size="lg" onClick={() => onLog(n!)}>
              Log session
            </Button>
          )}
        </>
      ) : (
        <p className="m-0 mt-1 text-lg">Rest and move lightly. You can plan workouts in Settings.</p>
      )}
      {/* Task 2: the top of the dashboard shows today's workout AND the day's calorie goal. */}
      <CalorieGoalRow />
    </ModuleCard>
  );
}

export function ReadinessHero() {
  const { user } = useUser();
  const t = today();
  const past = user.profile.trainingDays.length;
  const done14 = new Set(user.workouts.filter((w) => w.date >= addDays(t, -14) && w.date < t && w.fromPlan).map((w) => w.date)).size;
  const r = readiness(user, past * 2, done14);
  return (
    <ModuleCard id="readinessHero" hero action={<Pill>Estimate</Pill>}>
      {r ? (
        <div className="flex items-center gap-5">
          <ProgressRing value={r.score} goal={100} accent={CATEGORY.sleep.accent} size={120} stroke={12}>
            <span className="text-4xl font-bold leading-none">{r.score}</span>
            <span>/ 100</span>
          </ProgressRing>
          <div className="min-w-0 flex-1">
            <p className="m-0 text-2xl font-bold">{r.label}</p>
            <p className="m-0 mt-1">{r.advice}</p>
          </div>
        </div>
      ) : (
        <p className="m-0 text-lg">Log a few nights and workouts to get your readiness estimate.</p>
      )}
      {r && (
        <ul className="m-0 mt-4 grid list-none gap-2.5 p-0">
          {(
            [
              ['Sleep', r.factors.sleep, CATEGORY.sleep.accent],
              ['Load balance', r.factors.load, CATEGORY.fitness.accent],
              ['Routine', r.factors.routine, 'var(--color-ink)'],
            ] as const
          ).map(([k, v, c]) => (
            <li key={k} className="flex items-center gap-3">
              <span className="w-32 shrink-0">{k}</span>
              <span aria-hidden="true" className="h-2.5 flex-1 overflow-hidden rounded-full bg-sunken">
                <span className="anim-grow-x block h-full rounded-full" style={{ width: `${v}%`, background: c }} />
              </span>
              <span className="w-10 text-right font-bold">{v}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="m-0 mt-3">Estimated from your logged sleep and training; not a medical measurement.</p>
    </ModuleCard>
  );
}

export function WeekPlanModule() {
  const { user } = useUser();
  const plan = weekPlan(user.profile, user.workouts);
  const p = weekProgress(plan);
  return (
    <ModuleCard id="weekPlan" action={<Pill tone="fitness">{p.done} of {p.planned} done</Pill>}>
      <WeekStrip days={stripDays(plan)} accent={CATEGORY.fitness.accent} legend={false} />
    </ModuleCard>
  );
}

export function ActivityModule() {
  const { user, experience } = useUser();
  const a = activityOn(user);
  const g = user.profile.goals;
  const c = weekComparison(user);
  return (
    <ModuleCard id="activity" action={experience.detail === 'advanced' ? <Delta value={c.steps.delta} /> : undefined}>
      {user.activity.length === 0 ? (
        <p className="m-0">No activity data yet. Connect a device in Settings (simulated).</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              ['Steps', a.steps, g.steps, ''],
              ['Active', a.activeMin, g.activeMin, ' min'],
            ] as const
          ).map(([k, v, goal, u]) => (
            <div key={k} className="flex items-center gap-3">
              <ProgressRing value={v} goal={goal} accent={CATEGORY.fitness.accent} size={56} stroke={7} />
              <div>
                <p className="m-0 text-ink-soft">{k}</p>
                <p className="m-0 text-xl font-bold">
                  {v.toLocaleString('en-CA')}
                  {u}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </ModuleCard>
  );
}

export function NutritionModule() {
  const { user, experience } = useUser();
  const t = totals(mealsOn(user));
  const g = user.profile.goals;
  return (
    <ModuleCard id="nutrition">
      <p className="m-0 text-3xl font-bold leading-none">
        {t.calories.toLocaleString('en-CA')} <span className="text-base font-normal text-ink-soft">of {g.calories.toLocaleString('en-CA')} kcal</span>
      </p>
      <div aria-hidden="true" className="mt-3 h-2.5 overflow-hidden rounded-full bg-sunken">
        <div className="anim-grow-x h-full rounded-full bg-food" style={{ width: `${Math.min(t.calories / g.calories, 1) * 100}%` }} />
      </div>
      {experience.detail === 'simple' ? (
        <p className="m-0 mt-3">{mealsOn(user).length === 0 ? 'No meals added today.' : `${mealsOn(user).length} item${mealsOn(user).length > 1 ? 's' : ''} today.`}</p>
      ) : (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {(
            [
              ['Protein', t.proteinG, g.proteinG],
              ['Carbs', t.carbsG, g.carbsG],
              ['Fat', t.fatG, g.fatG],
            ] as const
          ).map(([k, v, goal]) => (
            <div key={k} className="inset p-3">
              <p className="m-0 text-ink-soft">{k}</p>
              <p className="m-0 text-xl font-bold leading-tight">{v} g</p>
              <p className="m-0 text-ink-soft">of {goal}</p>
            </div>
          ))}
        </div>
      )}
    </ModuleCard>
  );
}

export function SleepModule() {
  const { user, experience } = useUser();
  const s = lastSleep(user);
  const g = user.profile.goals.sleepMin;
  return (
    <ModuleCard id="sleep" action={s ? <Pill tone="sleep">{quality(s.durationMin, g)}</Pill> : undefined}>
      {s ? (
        <>
          <p className="m-0 text-3xl font-bold leading-none">{formatDuration(s.durationMin)}</p>
          <p className="m-0 mt-1 text-ink-soft">
            {s.bedtime} to {s.wakeTime}
          </p>
          {experience.detail === 'standard' && <div className="mt-4"><StageBar totals={stageTotals(s)} /></div>}
          {experience.detail === 'advanced' && <div className="mt-4"><Hypnogram stages={s.stages} durationMin={s.durationMin} bedtime={s.bedtime} height={140} /></div>}
        </>
      ) : (
        <p className="m-0">No sleep recorded yet.</p>
      )}
    </ModuleCard>
  );
}

export function VolumeModule() {
  const { user } = useUser();
  const plan = weekPlan(user.profile, user.workouts);
  const pts = plan.map((d) => {
    const done = d.logged.reduce((s, w) => s + w.durationMin, 0);
    return { label: stripDays([d])[0].short, longLabel: d.date, value: done || (d.session && !d.isPast ? d.session.durationMin : 0), state: done ? (d.isToday ? ('today' as const) : ('done' as const)) : d.session && !d.isPast ? ('planned' as const) : undefined };
  });
  const total = plan.reduce((s, d) => s + d.logged.reduce((a, w) => a + w.durationMin, 0), 0);
  const target = plan.reduce((s, d) => s + (d.session?.durationMin ?? 0), 0);
  return (
    <ModuleCard id="volume" action={<span className="font-bold">{total} / {target} min</span>}>
      <BarsChart points={pts} accent={CATEGORY.fitness.accent} unit="min" title="Training minutes this week" height={150} footnote={<span>Solid bars done, dashed bars planned</span>} />
    </ModuleCard>
  );
}

export function LoadModule() {
  const { user } = useUser();
  const w = weeklyLoad(user, 6);
  const last = w[w.length - 1].load;
  const prev = w[w.length - 2].load;
  return (
    <ModuleCard id="load" action={<Delta value={prev ? Math.round(((last - prev) / prev) * 100) : 0} label="vs previous 7 days" />}>
      <TrendChart points={w.map((x, i) => ({ label: i === w.length - 1 ? 'Now' : (x.label.split(' ')[1] ?? x.label), longLabel: `7 days to ${x.weekEnd}`, value: x.load }))} accent={CATEGORY.fitness.accent} unit="pts" title="Training load, rolling 7 days" height={170} footnote={<span>Each point: 7 days ending that date</span>} />
    </ModuleCard>
  );
}

export function RecoveryModule() {
  const { user } = useUser();
  const s = lastSleep(user);
  const lb = loadBalance(user);
  const g = user.profile.goals.sleepMin;
  const good = !!s && s.durationMin >= g * 0.85 && (lb.ratio === 0 || lb.ratio <= 1.3);
  return (
    <ModuleCard id="recovery">
      <p className="m-0 text-2xl font-bold">{!s ? 'No data yet' : good ? 'Ready to train' : 'Take it easier'}</p>
      <p className="m-0 mt-1">{!s ? 'Add your sleep to see recovery.' : `Slept ${formatDuration(s.durationMin)} · ${lb.ratio > 1.3 ? 'training load is high this week' : 'training load is in your usual range'}.`}</p>
    </ModuleCard>
  );
}

export const MODULES: Record<ModuleId, (p: { onLog: (d: PlanDay) => void }) => ReactNode> = {
  stepsHero: () => <StepsHero />,
  sessionHero: ({ onLog }) => <SessionHero onLog={onLog} />,
  readinessHero: () => <ReadinessHero />,
  weekPlan: () => <WeekPlanModule />,
  activity: () => <ActivityModule />,
  nutrition: () => <NutritionModule />,
  sleep: () => <SleepModule />,
  volume: () => <VolumeModule />,
  load: () => <LoadModule />,
  recovery: () => <RecoveryModule />,
  tips: () => <TipsModule />,
};
