/**
 * C4 Dashboard, Output C.
 * Kept from B: pin / unpin / reorder in "Customize dashboard", "More metrics",
 * Settings top-right, focus rules, ↓ / ↑ between widgets.
 * NEW in C (visual hierarchy):
 *  - Greeting header with the date.
 *  - "Today" card: one progress ring per PINNED metric (activity minutes,
 *    calories, sleep), each with its label and numbers written under it.
 *  - "This week" card: the training plan built from the number of sessions
 *    per week chosen by the user, with "n of m sessions done".
 *  - Widgets in a single column of cards.
 */
import { ArrowDown, ArrowUp, Check, ChevronRight, Pin, PinOff, Settings, SlidersHorizontal } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router';
import { useUser } from '@shared/data/appData';
import { weekPlan, weekProgress } from '@shared/data/program';
import { lastSleep, mealsOn, todaysActivity, totalsOf } from '@shared/data/selectors';
import type { MetricId } from '@shared/data/types';
import { formatDuration, formatLongDay, today } from '@shared/lib/dates';
import { useFlash } from '@shared/lib/useFlash';
import { Button } from '@shared/ui/button';
import { CATEGORY, ProgressRing, SectionHeader } from '@shared/ui/kit';
import { StatusMessage } from '@shared/ui/status';
import { WIDGETS } from '@/components/Widgets';
import { WeekStrip } from '@/components/WeekStrip';
import { focusCurrentNavItem, useInitialFocus } from '@/lib/focus';

const ALL: MetricId[] = ['fitness', 'nutrition', 'sleep'];

export function DashboardPage() {
  const { user, updateProfile } = useUser();
  const [flash, setFlash] = useFlash();
  const [editing, setEditing] = useState(false);
  const refs = useRef<(HTMLAnchorElement | null)[]>([]);
  const firstWidget = useRef<HTMLAnchorElement | null>(null);
  const customizeRef = useRef<HTMLButtonElement>(null);
  const [refocus, setRefocus] = useState<string | null>(null);
  const pinned = user.profile.metrics;
  const unpinned = ALL.filter((m) => !pinned.includes(m));

  const plan = weekPlan(user.profile, user.workouts);
  const progress = weekProgress(plan);
  const act = todaysActivity(user);
  const eaten = totalsOf(mealsOn(user)).calories;
  const sleep = lastSleep(user);
  const g = user.goals;

  useInitialFocus(firstWidget);
  useEffect(() => {
    if (!refocus) return;
    const el = document.querySelector<HTMLButtonElement>(`[data-arrange="${refocus}"]:not(:disabled)`);
    (el ?? customizeRef.current)?.focus();
    setRefocus(null);
  }, [refocus]);

  const save = (metrics: MetricId[], text: string) => {
    updateProfile({ metrics });
    setFlash({ kind: 'success', text });
  };
  const move = (i: number, d: -1 | 1) => {
    const next = [...pinned];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    setRefocus(`${pinned[i]}-${d < 0 ? 'up' : 'down'}`);
    save(next, `${CATEGORY[pinned[i]].title} moved ${d < 0 ? 'up' : 'down'} to position ${i + d + 1} of ${pinned.length}.`);
  };
  const unpin = (m: MetricId) => (setRefocus('customize'), save(pinned.filter((x) => x !== m), `${CATEGORY[m].title} unpinned. You can pin it again under "More metrics".`));
  const pin = (m: MetricId) => (setRefocus('customize'), save([...pinned, m], `${CATEGORY[m].title} pinned to your dashboard.`));

  const onKey = (i: number) => (e: KeyboardEvent<HTMLAnchorElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = refs.current[i + 1];
      if (next) next.focus();
      else focusCurrentNavItem();
    } else if (e.key === 'ArrowUp' && i > 0) {
      e.preventDefault();
      refs.current[i - 1]?.focus();
    }
  };

  const rings: Record<MetricId, React.ReactNode> = {
    fitness: <ProgressRing key="f" value={act.activeMin} goal={g.activeMin ?? 45} accent={CATEGORY.fitness.accent} label="Active" display={`${act.activeMin} min`} unit={`of ${g.activeMin ?? 45} min`} size={88} />,
    nutrition: <ProgressRing key="n" value={eaten} goal={g.calories} accent={CATEGORY.nutrition.accent} label="Food" display={`${eaten.toLocaleString('en-CA')} kcal`} unit={`of ${g.calories.toLocaleString('en-CA')}`} size={88} />,
    sleep: (
      <ProgressRing key="s" value={sleep?.durationMin ?? 0} goal={g.sleepMin ?? 480} accent={CATEGORY.sleep.accent} label="Sleep" display={sleep ? formatDuration(sleep.durationMin) : 'No data'} unit={sleep ? `of ${formatDuration(g.sleepMin ?? 480)}` : undefined} size={88} />
    ),
  };

  return (
    <>
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="m-0 text-lg">{formatLongDay(today())}</p>
          <h1 className="m-0 mt-1 text-3xl font-bold leading-tight">Hello, {user.profile.name.split(' ')[0]}</h1>
        </div>
        <Link to="/settings" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-hairline bg-card px-4 text-ink no-underline hover:bg-card-hi" data-settings-button>
          <Settings aria-hidden="true" className="size-5" /> Settings
        </Link>
      </header>

      {flash && (
        <StatusMessage kind={flash.kind} onDismiss={() => setFlash(null)} className="mt-4">
          {flash.text}
        </StatusMessage>
      )}

      {pinned.length > 0 && (
        <section aria-labelledby="today-title" className="card mt-5 p-4">
          <h2 id="today-title" className="m-0 text-xl font-bold">
            Today
          </h2>
          <div className={`mt-4 grid gap-2 ${pinned.length === 1 ? 'grid-cols-1' : pinned.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {pinned.map((m) => rings[m])}
          </div>
        </section>
      )}

      {pinned.includes('fitness') && progress.planned > 0 && (
        <section aria-labelledby="week-title" className="card mt-4 p-4">
          <SectionHeader
            id="week-title"
            title="This week"
            action={
              <span className="rounded-full bg-fit-tint px-3 py-1 font-bold">
                {progress.done} of {progress.planned} sessions
              </span>
            }
          />
          <WeekStrip plan={plan} />
        </section>
      )}

      <div className="mt-6">
        <SectionHeader
          title="Your metrics"
          action={
            <Button ref={customizeRef} variant={editing ? 'primary' : 'outline'} aria-pressed={editing} onClick={() => setEditing(!editing)} className="rounded-full">
              {editing ? <Check aria-hidden="true" /> : <SlidersHorizontal aria-hidden="true" />}
              {editing ? 'Done' : 'Customize'}
            </Button>
          }
        />
        {pinned.length === 0 ? (
          <p className="card m-0 p-4">No metrics are pinned. Pin a metric under "More metrics" below.</p>
        ) : (
          <ol className="m-0 flex list-none flex-col gap-4 p-0">
            {pinned.map((m, i) => {
              const W = WIDGETS[m];
              return (
                <li key={m} className={editing ? 'rounded-[24px] border-2 border-dashed border-line p-2' : ''}>
                  <W
                    user={user}
                    ref={(el) => {
                      refs.current[i] = el;
                      if (i === 0) firstWidget.current = el;
                    }}
                    onKeyDown={onKey(i)}
                  />
                  {editing && (
                    <div className="mt-2 grid grid-cols-3 gap-2" role="group" aria-label={`Arrange ${CATEGORY[m].title}`}>
                      <Button variant="secondary" data-arrange={`${m}-up`} onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${CATEGORY[m].title} up`}>
                        <ArrowUp aria-hidden="true" /> Up
                      </Button>
                      <Button variant="secondary" data-arrange={`${m}-down`} onClick={() => move(i, 1)} disabled={i === pinned.length - 1} aria-label={`Move ${CATEGORY[m].title} down`}>
                        <ArrowDown aria-hidden="true" /> Down
                      </Button>
                      <Button variant="secondary" onClick={() => unpin(m)} aria-label={`Unpin ${CATEGORY[m].title}`}>
                        <PinOff aria-hidden="true" /> Unpin
                      </Button>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {unpinned.length > 0 && (
        <section aria-labelledby="more-metrics" className="mt-8">
          <SectionHeader id="more-metrics" title="More metrics" />
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {unpinned.map((m) => (
              <li key={m} className="card flex items-center gap-2 p-2">
                <Link to={CATEGORY[m].path} state={{ via: 'widget' }} className="flex min-h-12 flex-1 items-center gap-2 rounded-xl px-2 font-bold text-ink no-underline">
                  {CATEGORY[m].title} <ChevronRight aria-hidden="true" className="size-5" />
                </Link>
                <Button onClick={() => pin(m)} aria-label={`Pin ${CATEGORY[m].title} to dashboard`} className="rounded-full">
                  <Pin aria-hidden="true" /> Pin
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
