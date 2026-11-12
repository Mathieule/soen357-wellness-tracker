/**
 * C11–C14 Training / Activity page. The sections and their detail come from
 * the experience (useUser().experience.fitness):
 *   casual      → next session, today's activity, steps this week, history
 *   training    → weekly plan, activity, volume per week, calendar, history
 *   performance → plan, load trend, intensity mix, volume, activity, calendar, history
 * Main action "Add workout" (focus on arrival from a widget; ↑ → nav bar).
 */
import { CalendarDays, Plus } from 'lucide-react';
import { useRef, useState } from 'react';
import {
  activityOn, DAY_LONG, dayLabel, formatDay, formatDuration, formatLongDay, intensityMix, lastDays, loadBalance, nextSession, REST_DAY,
  relativeDay, sortedWorkouts, today, useUser, weekComparison, weekPlan, weekProgress, weeklyLoad, weeklyMinutes, type PlanDay, type Workout, type WorkoutType,
} from '@core';
import { BarsChart, Button, Card, CATEGORY, ChipGroup, Delta, EmptyState, ListGroup, ListRow, MonthCalendar, Pill, SectionHeader, Sheet, StatTile, TrendChart, WeekStrip, type StripDay } from '@ds';
import { TopBar } from '../layout/TopBar';
import { useMainAction } from '../lib/focus';
import { ProgressChart } from '../lib/ProgressChart';
import { WorkoutDetailSheet, WorkoutSheet, type WorkoutDraft } from './WorkoutSheets';

const ACCENT = CATEGORY.fitness.accent;

export function stripDays(plan: PlanDay[]): StripDay[] {
  return plan.map((d) => ({
    date: d.date,
    short: dayLabel(d.date),
    long: `${DAY_LONG[d.dayIndex]}, ${formatDay(d.date).split(', ')[1]}`,
    dayNumber: Number(d.date.slice(8)),
    isToday: d.isToday,
    detail: d.session?.title,
    state: d.session ? (d.logged.length ? 'done' : d.isPast ? 'missed' : 'planned') : d.logged.length ? 'extra' : 'rest',
  }));
}

export function FitnessScreen() {
  const { user, experience } = useUser();
  const addRef = useRef<HTMLButtonElement>(null);
  const [draft, setDraft] = useState<WorkoutDraft | null>(null);
  const [sheet, setSheet] = useState(false);
  const [detail, setDetail] = useState<Workout | null>(null);
  const mainKeys = useMainAction(addRef);

  const plan = weekPlan(user.profile, user.workouts);
  const open = (d: WorkoutDraft | null) => {
    setDraft(d);
    setSheet(true);
  };
  const logPlanned = (d: PlanDay) => d.session && open({ name: d.session.title, type: d.session.type, durationMin: d.session.durationMin, intensity: d.session.intensity, date: d.date, fromPlan: true });

  const sections: Record<string, React.ReactNode> = {
    nextSession: <NextSession key="n" plan={plan} onLog={logPlanned} />,
    plan: <PlanSection key="p" plan={plan} onLog={logPlanned} />,
    todayActivity: <TodayActivity key="a" />,
    stepsWeek: <StepsWeek key="s" />,
    progress: <ProgressChart key="pr" kind="minutes" title="Workout minutes" category="fitness" yearNote="Total minutes per month" />,
    summary: <Summary key="su" />,
    volumeWeeks: <VolumeWeeks key="v" />,
    load: <LoadSection key="l" />,
    intensity: <IntensitySection key="i" />,
    calendar: <CalendarSection key="c" onOpen={setDetail} />,
    history: <History key="h" onOpen={setDetail} onAdd={() => open(null)} />,
  };

  return (
    <>
      <TopBar
        title="Fitness Metrics"
        category="fitness"
        subtitle={experience.id === 'casual' ? 'Keep moving, one day at a time' : `${weekProgress(plan).done} of ${weekProgress(plan).planned} workouts done this week`}
      />
      <Button ref={addRef} onKeyDown={mainKeys} variant="fitness" size="lg" block className="mt-6" onClick={() => open(null)}>
        <Plus aria-hidden="true" /> Enter a new workout
      </Button>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">{experience.fitness.map((s) => sections[s])}</div>

      <WorkoutSheet open={sheet} onOpenChange={setSheet} draft={draft} />
      <WorkoutDetailSheet
        workout={detail}
        onClose={() => setDetail(null)}
        onEdit={(w) => {
          setDetail(null);
          open(w);
        }}
      />
    </>
  );
}

function SessionBody({ d, onLog }: { d: PlanDay; onLog: (d: PlanDay) => void }) {
  const s = d.session;
  return (
    <div>
      {s ? (
        <>
          <div className="flex flex-wrap gap-2">
            <Pill>{s.durationMin} min</Pill>
            <Pill>{s.type}</Pill>
            <Pill>{s.intensity[0].toUpperCase() + s.intensity.slice(1)}</Pill>
            {d.logged.length > 0 && <Pill tone="nutrition">✓ Done</Pill>}
          </div>
          <ul className="m-0 mt-4 list-none divide-y divide-hair p-0">
            {s.exercises.map((x) => (
              <li key={x.name} className="flex justify-between gap-4 py-2.5">
                <span className="font-bold">{x.name}</span>
                <span className="text-right">{x.detail}</span>
              </li>
            ))}
          </ul>
          <p className="m-0 mt-3">{s.focus}</p>
          {!d.logged.length && (d.isToday || d.isPast) && (
            <Button className="mt-4" block onClick={() => onLog(d)}>
              Log this session
            </Button>
          )}
        </>
      ) : (
        <ul className="m-0 list-none divide-y divide-hair p-0">
          {REST_DAY.map((x) => (
            <li key={x.name} className="flex justify-between gap-4 py-2.5">
              <span className="font-bold">{x.name}</span>
              <span className="text-right">{x.detail}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NextSession({ plan, onLog }: { plan: PlanDay[]; onLog: (d: PlanDay) => void }) {
  const n = nextSession(plan);
  if (!n) return <EmptyState category="fitness" title="No session planned this week">Daily movement still counts. Change your sessions per week in Settings.</EmptyState>;
  return (
    <Card hero="fitness" aria-labelledby="next-title" className="lg:col-span-2">
      <p className="m-0 font-bold">{n.isToday ? 'Today' : DAY_LONG[n.dayIndex]}</p>
      <h2 id="next-title" className="m-0 mb-4 mt-1 text-2xl font-bold">
        {n.session!.title}
      </h2>
      <SessionBody d={n} onLog={onLog} />
    </Card>
  );
}

function PlanSection({ plan, onLog }: { plan: PlanDay[]; onLog: (d: PlanDay) => void }) {
  const [sel, setSel] = useState(Math.max(0, plan.findIndex((d) => d.isToday)));
  const d = plan[sel];
  const p = weekProgress(plan);
  return (
    <Card aria-labelledby="plan-title" className="lg:col-span-2">
      <SectionHeader id="plan-title" title="This week" action={<Pill tone="fitness">{p.done} of {p.planned} done</Pill>} />
      <WeekStrip days={stripDays(plan)} accent={ACCENT} selected={sel} onSelect={setSel} />
      <div className="inset mt-4 p-4" aria-live="polite">
        <h3 className="m-0 mb-3 text-lg font-bold">
          {relativeDay(d.date)}: {d.session ? d.session.title : 'Rest day'}
        </h3>
        <SessionBody d={d} onLog={onLog} />
      </div>
    </Card>
  );
}

function TodayActivity() {
  const { user, experience } = useUser();
  const a = activityOn(user);
  const g = user.profile.goals;
  const c = weekComparison(user);
  if (!user.activity.length) return <EmptyState category="fitness" title="No activity data yet">Connect a device in Settings (simulated) to see your steps and active minutes.</EmptyState>;
  return (
    <Card aria-labelledby="act-title">
      <SectionHeader id="act-title" title="Today's activity" subtitle={experience.detail === 'advanced' ? <Delta value={c.steps.delta} label="steps vs last week" /> : undefined} />
      <div className={`grid gap-2 ${experience.detail === 'simple' ? 'grid-cols-2' : 'grid-cols-3'}`}>
        <StatTile label="Steps" value={a.steps.toLocaleString('en-CA')} progress={a.steps / g.steps} accent={ACCENT} sub={`of ${g.steps.toLocaleString('en-CA')}`} />
        <StatTile label="Active" value={String(a.activeMin)} unit="min" progress={a.activeMin / g.activeMin} accent={ACCENT} sub={`of ${g.activeMin}`} />
        {experience.detail !== 'simple' && <StatTile label="Burned" value={a.caloriesKcal.toLocaleString('en-CA')} unit="kcal" />}
      </div>
    </Card>
  );
}

/** "Page summarizing workouts" (Task 2): this month at a glance. */
function Summary() {
  const { user, experience } = useUser();
  const t = today();
  const monthStart = t.slice(0, 8) + '01';
  const ws = user.workouts.filter((w) => w.date >= monthStart && w.date <= t);
  const minutes = ws.reduce((s, w) => s + w.durationMin, 0);
  const kcal = ws.reduce((s, w) => s + w.caloriesKcal, 0);
  const byType = ws.reduce<Record<string, number>>((m, w) => ((m[w.type] = (m[w.type] ?? 0) + 1), m), {});
  const top = Object.entries(byType).sort((a, b) => b[1] - a[1])[0]?.[0];
  return (
    <Card aria-labelledby="sum-title">
      <SectionHeader id="sum-title" title="This month" />
      {ws.length === 0 ? (
        <p className="m-0">No workouts this month yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <StatTile label="Workouts" value={String(ws.length)} />
          <StatTile label="Time" value={formatDuration(minutes)} />
          {experience.detail !== 'simple' && <StatTile label="Average" value={String(Math.round(minutes / ws.length))} unit="min" />}
          {experience.detail !== 'simple' && <StatTile label="Burned" value={kcal.toLocaleString('en-CA')} unit="kcal" sub={top ? `Most: ${top}` : undefined} />}
        </div>
      )}
    </Card>
  );
}

function StepsWeek() {
  const { user } = useUser();
  if (!user.activity.length) return null;
  const pts = lastDays(7).map((d) => ({ label: dayLabel(d), longLabel: formatLongDay(d), value: activityOn(user, d).steps, state: d === today() ? ('today' as const) : undefined }));
  return (
    <Card aria-labelledby="steps-title">
      <SectionHeader id="steps-title" title="Steps, last 7 days" />
      <BarsChart points={pts} accent={ACCENT} unit="steps" title="Steps, last 7 days" goal={user.profile.goals.steps} />
    </Card>
  );
}

function VolumeWeeks() {
  const { user } = useUser();
  const weeks = weeklyMinutes(user, 6);
  const target = user.profile.sessionsPerWeek * ({ sedentary: 20, beginner: 30, regular: 45, athlete: 60 }[user.profile.level]);
  const c = weekComparison(user);
  return (
    <Card aria-labelledby="vol-title">
      <SectionHeader id="vol-title" title="Training minutes per week" subtitle={<Delta value={c.minutes.delta} label="last 7 days vs previous" />} />
      <BarsChart points={weeks.map((w, i) => ({ label: i === weeks.length - 1 ? 'Now' : w.label.split(' ')[1] ?? w.label, longLabel: `Week of ${formatDay(w.weekStart)}`, value: w.minutes, state: i === weeks.length - 1 ? 'today' : undefined }))} accent={ACCENT} unit="min" title="Training minutes per week" goal={target || undefined} />
    </Card>
  );
}

function LoadSection() {
  const { user } = useUser();
  const weeks = weeklyLoad(user, 8);
  const lb = loadBalance(user);
  const zone = lb.ratio === 0 ? 'Not enough data yet' : lb.ratio < 0.8 ? 'Below your usual load' : lb.ratio <= 1.3 ? 'In your usual range' : 'Well above your usual load';
  return (
    <Card aria-labelledby="load-title" className="lg:col-span-2">
      <SectionHeader id="load-title" title="Training load" subtitle="Minutes × intensity (easy 1, moderate 1.6, hard 2.3)" />
      <div className="mb-4 grid grid-cols-2 gap-2">
        <StatTile label="Last 7 days" value={lb.acute.toLocaleString('en-CA')} unit="pts" />
        <StatTile label="Usual week" value={lb.chronic.toLocaleString('en-CA')} unit="pts" sub={zone} />
      </div>
      <TrendChart points={weeks.map((w) => ({ label: w.label === 'Now' ? 'Now' : (w.label.split(' ')[1] ?? w.label), longLabel: `7 days to ${formatDay(w.weekEnd)}`, value: w.load }))} accent={ACCENT} unit="pts" title="Training load, rolling 7 days" footnote={<span>Each point: the 7 days ending that date</span>} />
    </Card>
  );
}

function IntensitySection() {
  const { user } = useUser();
  const m = intensityMix(user);
  const total = m.easy + m.moderate + m.hard || 1;
  const rows: [string, number, number][] = [
    ['Easy', m.easy, 0.45],
    ['Moderate', m.moderate, 0.75],
    ['Hard', m.hard, 1],
  ];
  return (
    <Card aria-labelledby="int-title">
      <SectionHeader id="int-title" title="Intensity, last 4 weeks" />
      <ul className="m-0 grid list-none gap-4 p-0">
        {rows.map(([k, v, o]) => (
          <li key={k}>
            <div className="flex justify-between">
              <span className="font-bold">{k}</span>
              <span>
                {formatDuration(v)} · {Math.round((v / total) * 100)}%
              </span>
            </div>
            <div aria-hidden="true" className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-sunken">
              <div className="anim-grow-x h-full rounded-full" style={{ width: `${(v / total) * 100}%`, background: ACCENT, opacity: o }} />
            </div>
          </li>
        ))}
      </ul>
      <p className="m-0 mt-4 text-ink-soft">Most endurance plans keep about 80 % of time easy.</p>
    </Card>
  );
}

function CalendarSection({ onOpen }: { onOpen: (w: Workout) => void }) {
  const { user } = useUser();
  const [sel, setSel] = useState(today());
  const [open, setOpen] = useState(false);
  const ws = user.workouts.filter((w) => w.date === sel);
  const a = user.activity.find((x) => x.date === sel);
  return (
    <Card aria-labelledby="cal-title">
      <SectionHeader id="cal-title" title="History calendar" action={<Button variant="secondary" size="sm" onClick={() => setOpen(true)}><CalendarDays aria-hidden="true" /> Open</Button>} />
      <p className="m-0 text-ink-soft">See every day you trained, and the activity of any past day.</p>
      <Sheet open={open} onOpenChange={setOpen} title="Activity calendar" description="Choose a day to see its activity and workouts.">
        <MonthCalendar
          today={today()}
          selected={sel}
          onSelect={setSel}
          accent={ACCENT}
          level={(d) => (user.workouts.some((w) => w.date === d) ? 2 : user.activity.some((x) => x.date === d) ? 1 : 0)}
          describe={(d) => {
            const n = user.workouts.filter((w) => w.date === d).length;
            const st = user.activity.find((x) => x.date === d)?.steps;
            return `${formatLongDay(d)}${n ? `, ${n} workout${n > 1 ? 's' : ''}` : ''}${st ? `, ${st.toLocaleString('en-CA')} steps` : ', no data'}`;
          }}
        />
        <div className="inset mt-4 p-4" aria-live="polite">
          <h3 className="m-0 text-lg font-bold">{formatLongDay(sel)}</h3>
          <p className="m-0 mt-1">{a ? `${a.steps.toLocaleString('en-CA')} steps · ${a.activeMin} active min · ${a.caloriesKcal.toLocaleString('en-CA')} kcal` : 'No activity recorded.'}</p>
          {ws.map((w) => (
            <button key={w.id} type="button" onClick={() => (setOpen(false), onOpen(w))} className="mt-3 flex min-h-12 w-full cursor-pointer items-center justify-between rounded-xl bg-surface px-4 text-left text-ink">
              <span className="font-bold">{w.name}</span>
              <span>{formatDuration(w.durationMin)}</span>
            </button>
          ))}
        </div>
      </Sheet>
    </Card>
  );
}

type Filter = 'all' | WorkoutType;
function History({ onOpen, onAdd }: { onOpen: (w: Workout) => void; onAdd: () => void }) {
  const { user, experience } = useUser();
  const [filter, setFilter] = useState<Filter[]>(['all']);
  const [shown, setShown] = useState(experience.detail === 'simple' ? 5 : 8);
  const all = sortedWorkouts(user);
  const list = all.filter((w) => filter[0] === 'all' || w.type === filter[0]);
  const groups: { h: string; items: Workout[] }[] = [];
  for (const w of list.slice(0, shown)) {
    const h = relativeDay(w.date);
    const last = groups[groups.length - 1];
    if (last?.h === h) last.items.push(w);
    else groups.push({ h, items: [w] });
  }
  return (
    <section aria-labelledby="hist-title" className="lg:col-span-2">
      <SectionHeader id="hist-title" title="Previous workouts" subtitle="Tap a workout to see its details." />
      {all.length === 0 ? (
        <EmptyState category="fitness" title="No workouts yet" action={<Button variant="fitness" onClick={onAdd}><Plus aria-hidden="true" /> Add your first workout</Button>}>
          Logged workouts appear here, newest first.
        </EmptyState>
      ) : (
        <>
          {experience.detail !== 'simple' && (
            <div className="mb-4">
              <ChipGroup label="Filter by type" value={filter} onChange={(v) => (setFilter(v), setShown(8))} options={[{ value: 'all', label: 'All' }, ...(['Strength', 'Cardio', 'Mobility', 'Sport'] as WorkoutType[]).map((t) => ({ value: t, label: t }))]} />
            </div>
          )}
          {groups.length === 0 && <p className="card m-0 p-5">No {filter[0].toString().toLowerCase()} workouts yet.</p>}
          <div className="grid gap-4">
            {groups.map((g) => (
              <div key={g.h}>
                <h3 className="m-0 mb-2 text-lg font-bold">{g.h}</h3>
                <ListGroup>
                  {g.items.map((w) => (
                    <li key={w.id}>
                      <ListRow title={w.name} meta={`${w.type} · ${formatDuration(w.durationMin)} · ${w.caloriesKcal} kcal`} onClick={() => onOpen(w)} />
                    </li>
                  ))}
                </ListGroup>
              </div>
            ))}
          </div>
          {list.length > shown && (
            <Button variant="outline" block className="mt-4" onClick={() => setShown(shown + 8)}>
              Show more ({list.length - shown} left)
            </Button>
          )}
        </>
      )}
    </section>
  );
}

