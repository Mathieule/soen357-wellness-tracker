/**
 * C11 Fitness menu, Output C.
 * Kept from B: Back + Settings, Add exercise (main action, focus rules,
 * ↑ to nav bar), exercise log with detail pop-up, activity calendar.
 * NEW in C:
 *  - "This week" training plan: the number of planned sessions comes from the
 *    user's "sessions per week" answer; pick a day to see its session and
 *    log it in one tap ("Log this session" pre-fills the form).
 *  - Today's activity as tiles with progress toward the daily goals.
 *  - "Steps, last 7 days" bar chart with the goal line.
 *  - History grouped by day, with type filters and "Show more".
 */
import { CalendarDays, ChevronRight, Plus } from 'lucide-react';
import { useRef, useState } from 'react';
import { WeekBars } from '@shared/charts/WeekBars';
import { useUser } from '@shared/data/appData';
import { DAY_LONG, DAY_SHORT, REST_DAY, weekPlan, weekProgress } from '@shared/data/program';
import { sortedWorkouts, todaysActivity } from '@shared/data/selectors';
import type { Workout, WorkoutType } from '@shared/data/types';
import { addDays, formatDay, formatDuration, fromISODate, today } from '@shared/lib/dates';
import { Button } from '@shared/ui/button';
import { CATEGORY, FilterChips, SectionHeader, StatTile, dayHeading } from '@shared/ui/kit';
import { StatusMessage } from '@shared/ui/status';
import { ActivityCalendarDialog, AddExerciseDialog, WorkoutDetailDialog } from '@/components/FitnessDialogs';
import { TopBar } from '@/components/TopBar';
import { WeekStrip } from '@/components/WeekStrip';
import { arrowUpToNav, useInitialFocus } from '@/lib/focus';

type Filter = 'all' | WorkoutType;
const PAGE = 8;

export function FitnessPage() {
  const { user, addWorkout } = useUser();
  const addRef = useRef<HTMLButtonElement>(null);
  const plan = weekPlan(user.profile, user.workouts);
  const progress = weekProgress(plan);
  const todayIndex = plan.findIndex((d) => d.isToday);
  const [selected, setSelected] = useState(todayIndex);
  const [adding, setAdding] = useState(false);
  const [preset, setPreset] = useState<{ name: string; type: WorkoutType; durationMin: number; date: string } | null>(null);
  const [calendar, setCalendar] = useState(false);
  const [detail, setDetail] = useState<Workout | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [shown, setShown] = useState(PAGE);
  const act = todaysActivity(user);
  const g = user.goals;
  const day = plan[selected];

  useInitialFocus(addRef);

  const t = today();
  const steps = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(t, i - 6);
    const a = user.activity.find((x) => x.date === date);
    const d = fromISODate(date);
    return { label: DAY_SHORT[(d.getDay() + 6) % 7], longLabel: formatDay(date), value: a?.steps ?? 0, isToday: date === t };
  });

  const log = sortedWorkouts(user).filter((w) => filter === 'all' || w.type === filter);
  const visible = log.slice(0, shown);
  const groups: { heading: string; items: Workout[] }[] = [];
  for (const w of visible) {
    const h = dayHeading(w.date, t, addDays(t, -1), formatDay);
    const last = groups[groups.length - 1];
    if (last?.heading === h) last.items.push(w);
    else groups.push({ heading: h, items: [w] });
  }

  return (
    <>
      <TopBar back title="Fitness Metrics" metric="fitness" />

      <Button ref={addRef} onKeyDown={arrowUpToNav} variant="fitness" size="block" className="mt-5 rounded-2xl" onClick={() => (setPreset(null), setAdding(true))}>
        <Plus aria-hidden="true" /> Add exercise
      </Button>
      {status && (
        <StatusMessage kind="success" onDismiss={() => setStatus(null)} className="mt-3">
          {status}
        </StatusMessage>
      )}

      <section aria-labelledby="plan-title" className="card mt-5 p-4">
        <SectionHeader
          id="plan-title"
          title="This week"
          action={
            <span className="rounded-full bg-fit-tint px-3 py-1 font-bold">
              {progress.done} of {progress.planned} sessions
            </span>
          }
        />
        <WeekStrip plan={plan} selected={selected} onSelect={setSelected} />
        <div className="mt-4 rounded-2xl bg-sunken p-4" aria-live="polite">
          <h3 className="m-0 text-lg font-bold">
            {DAY_LONG[day.dayIndex]}
            {day.isToday && ' (today)'}: {day.session ? day.session.title : 'Rest day'}
          </h3>
          {day.session && (
            <p className="m-0 mt-1">
              {day.session.durationMin} min · {day.session.kind}
              {day.logged && ' · ✓ Done'}
            </p>
          )}
          <ul className="m-0 mt-2 list-none p-0">
            {(day.session?.items ?? REST_DAY).map((r) => (
              <li key={r.name} className="flex justify-between gap-3 border-t border-hairline py-2 first:border-t-0">
                <span className="font-bold">{r.name}</span>
                <span className="text-right">{r.detail}</span>
              </li>
            ))}
          </ul>
          {day.session && !day.logged && (day.isToday || day.isPast) && (
            <Button
              variant="outline"
              className="mt-3 w-full rounded-full"
              onClick={() => {
                setPreset({ name: day.session!.title, type: day.session!.kind, durationMin: day.session!.durationMin, date: day.date });
                setAdding(true);
              }}
            >
              Log this session
            </Button>
          )}
        </div>
      </section>

      <section aria-labelledby="activity-title" className="card mt-4 p-4">
        <SectionHeader
          id="activity-title"
          title="Today's activity"
          action={
            <Button variant="outline" className="rounded-full" onClick={() => setCalendar(true)}>
              <CalendarDays aria-hidden="true" /> Calendar
            </Button>
          }
        />
        <div className="grid grid-cols-3 gap-2">
          <StatTile label="Steps" value={act.steps} goal={g.steps} accent={CATEGORY.fitness.accent} />
          <StatTile label="Active" value={act.activeMin} unit="min" goal={g.activeMin} accent={CATEGORY.fitness.accent} />
          <StatTile label="Burned" value={act.caloriesKcal} unit="kcal" />
        </div>
      </section>

      <section aria-labelledby="steps-title" className="card mt-4 p-4">
        <SectionHeader id="steps-title" title="Steps, last 7 days" />
        <WeekBars data={steps} goal={g.steps} accent={CATEGORY.fitness.accent} unit="steps" caption="Steps per day for the last 7 days" />
      </section>

      <section aria-labelledby="log-title" className="mt-6">
        <SectionHeader id="log-title" title="Exercise history" />
        <FilterChips<Filter>
          label="Filter by type"
          value={filter}
          onChange={(v) => (setFilter(v), setShown(PAGE))}
          options={[
            { value: 'all', label: 'All' },
            { value: 'Strength', label: 'Strength' },
            { value: 'Cardio', label: 'Cardio' },
            { value: 'Flexibility', label: 'Mobility' },
            { value: 'Sport', label: 'Sport' },
          ]}
        />
        {groups.length === 0 ? (
          <p className="card mt-3 p-4">No exercises of this type yet.</p>
        ) : (
          groups.map((grp) => (
            <div key={grp.heading} className="mt-4">
              <h3 className="m-0 mb-2 text-lg font-bold">{grp.heading}</h3>
              <ul className="card m-0 list-none overflow-hidden p-0">
                {grp.items.map((w) => (
                  <li key={w.id} className="border-t border-hairline first:border-t-0">
                    <button type="button" onClick={() => setDetail(w)} className="flex min-h-14 w-full cursor-pointer items-center gap-3 bg-transparent px-4 py-3 text-left text-base text-ink hover:bg-card-hi">
                      <span className="flex-1">
                        <span className="block font-bold">{w.name}</span>
                        {w.type} · {formatDuration(w.durationMin)} · {w.caloriesKcal} kcal
                      </span>
                      <ChevronRight aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
        {log.length > shown && (
          <Button variant="outline" className="mt-4 w-full rounded-full" onClick={() => setShown(shown + PAGE)}>
            Show more ({log.length - shown} left)
          </Button>
        )}
      </section>

      <AddExerciseDialog
        open={adding}
        preset={preset}
        onOpenChange={setAdding}
        onSave={(w) => {
          addWorkout(w);
          setStatus(`Exercise saved: ${w.name}, ${formatDuration(w.durationMin)} on ${formatDay(w.date)}.`);
        }}
      />
      <WorkoutDetailDialog workout={detail} onClose={() => setDetail(null)} />
      <ActivityCalendarDialog open={calendar} onOpenChange={setCalendar} activity={user.activity} />
    </>
  );
}
