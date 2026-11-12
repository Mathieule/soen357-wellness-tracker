/**
 * C4 Dashboard (T2: find today's information; T3: pin and reorder metrics).
 *  - Header: date, greeting, Settings button (B/C), data-sync status (C).
 *  - "Do you want to see more data?" (Task 2, Responding): A asks casual users
 *    from the start; B/C ask when the logged data shows more activity.
 *  - Quick actions (B/C) and "Get started" for empty accounts (C).
 *  - Modules chosen by the personalization engine, or the user's pins. The
 *    first module is today's workout with the day's calorie goal (Task 2).
 *  - B/C: "Customize" on the dashboard: Move up / down, "Unpin metric",
 *    "Pin metric", reset. Output A pins metrics in Profile instead.
 * Keyboard: focus starts on the first module title (unless opened from the
 * nav bar in B/C); ↓ / ↑ move between module titles; ↓ on the last one goes
 * to the navigation bar.
 */
import { ArrowDown, ArrowUp, Check, Dumbbell, Loader2, Moon, Pin, PinOff, RefreshCw, RotateCcw, Settings, SlidersHorizontal, Soup } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Link, useLocation } from 'react-router';
import { addDays, dashboardModules, formatLongDay, MODULE_INFO, shouldAskMoreData, today, useUser, type MetricId, type ModuleId, type PlanDay } from '@core';
import { Button, CategoryBadge, InlineStatus, SectionHeader, useToast } from '@ds';
import { WorkoutSheet, type WorkoutDraft } from '../fitness/WorkoutSheets';
import { focusCurrentNavItem } from '../lib/focus';
import { MealSheet, PhotoSheet, type MealDraft } from '../nutrition/MealSheets';
import { SleepSheet } from '../sleep/SleepScreen';
import { GetStarted } from './GetStarted';
import { MODULES } from './Modules';

export function Dashboard() {
  const { user, experience, iteration, sync, syncNow, setDashboard } = useUser();
  const toast = useToast();
  const location = useLocation();
  const [editing, setEditing] = useState(false);
  const [workout, setWorkout] = useState<{ open: boolean; draft: WorkoutDraft | null }>({ open: false, draft: null });
  const [photo, setPhoto] = useState(false);
  const [meal, setMeal] = useState<{ open: boolean; draft: MealDraft | null }>({ open: false, draft: null });
  const [night, setNight] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const [refocus, setRefocus] = useState<string | null>(null);
  const modules = dashboardModules(user.profile, experience);
  const addable = experience.pinnable.filter((m) => !modules.includes(m));
  const canCustomize = iteration.pinning === 'dashboard';

  useEffect(() => {
    const via = (location.state as { via?: string } | null)?.via;
    if (!(iteration.keyboardRules && via === 'nav')) listRef.current?.querySelector<HTMLElement>('[data-module-link]')?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!refocus) return;
    (document.querySelector<HTMLElement>(`[data-arrange="${refocus}"]:not(:disabled)`) ?? document.querySelector<HTMLElement>('[data-customize]'))?.focus();
    setRefocus(null);
  }, [refocus]);

  const save = (next: ModuleId[], text: string) => {
    setDashboard(next);
    toast('success', text);
  };
  const move = (i: number, d: -1 | 1) => {
    const next = [...modules];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    setRefocus(`${modules[i]}-${d < 0 ? 'up' : 'down'}`);
    save(next, `${MODULE_INFO[modules[i]].name} moved to position ${i + d + 1} of ${modules.length}.`);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const links = [...(listRef.current?.querySelectorAll<HTMLElement>('[data-module-link]') ?? [])];
    const i = links.indexOf(document.activeElement as HTMLElement);
    if (i < 0) return;
    e.preventDefault();
    if (e.key === 'ArrowDown') (links[i + 1] ? links[i + 1].focus() : focusCurrentNavItem());
    else links[i - 1]?.focus();
  };

  const logPlanned = (d: PlanDay) => d.session && setWorkout({ open: true, draft: { name: d.session.title, type: d.session.type, durationMin: d.session.durationMin, intensity: d.session.intensity, date: d.date, fromPlan: true } });
  const quick: Record<MetricId, { label: string; Icon: typeof Dumbbell; run: () => void }> = {
    fitness: { label: 'Log workout', Icon: Dumbbell, run: () => setWorkout({ open: true, draft: null }) },
    nutrition: { label: 'Add meal', Icon: Soup, run: () => setPhoto(true) },
    sleep: { label: 'Add sleep log', Icon: Moon, run: () => setNight(true) },
  };
  const first = user.profile.name.split(' ')[0];

  return (
    <>
      <header className="anim-rise flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="m-0 text-ink-soft">{formatLongDay(today())}</p>
          <h1 className="m-0 mt-1 text-3xl font-bold tracking-tight">Hello, {first}</h1>
          {iteration.device && <SyncChip />}
        </div>
        {!iteration.settingsInNav && (
          <Link to="/settings" className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full bg-surface px-4 text-ink no-underline hover:bg-surface-hi lg:hidden" data-settings-button>
            <Settings aria-hidden="true" className="size-5" /> Settings
          </Link>
        )}
      </header>

      {iteration.device && sync.state === 'failed' && (
        <InlineStatus
          kind="error"
          className="mt-4"
          action={
            <Button size="sm" variant="primary" onClick={async () => { const r = await syncNow(); toast(r.ok ? 'success' : 'error', r.ok ? 'Data synced.' : 'Sync failed again. Check Settings.'); }}>
              <RefreshCw aria-hidden="true" /> Retry sync
            </Button>
          }
        >
          {sync.error} The numbers below may not be up to date.
        </InlineStatus>
      )}

      <MoreDataPrompt />

      {iteration.quickActions && (
        <div className={`mt-5 grid gap-2 ${experience.quickActions.length === 3 ? 'grid-cols-3' : experience.quickActions.length === 2 ? 'grid-cols-2' : 'grid-cols-1'} lg:max-w-[560px]`} role="group" aria-label="Quick actions">
          {experience.quickActions.map((c) => {
            const q = quick[c];
            return (
              <button key={c} type="button" onClick={q.run} className={`flex cursor-pointer items-center justify-center gap-2 rounded-[20px] bg-surface px-2 py-3 text-center text-base text-ink transition-[background-color,transform] duration-150 hover:bg-surface-hi active:scale-[0.97] ${experience.quickActions.length === 1 ? 'min-h-16 flex-row' : 'min-h-[88px] flex-col'}`}>
                <CategoryBadge category={c} size={40} />
                <span>{q.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {iteration.emptyAccounts && <GetStarted onWorkout={() => setWorkout({ open: true, draft: null })} onMeal={() => setPhoto(true)} onNight={() => setNight(true)} />}

      <div className="mt-6">
        <SectionHeader
          title={editing ? 'Pin and order your metrics' : 'Today'}
          subtitle={editing ? 'Changes are saved right away.' : `${experience.name} view`}
          action={
            canCustomize ? (
              <Button data-customize variant={editing ? 'primary' : 'secondary'} size="sm" aria-pressed={editing} onClick={() => setEditing(!editing)}>
                {editing ? <Check aria-hidden="true" /> : <SlidersHorizontal aria-hidden="true" />}
                {editing ? 'Done' : 'Customize'}
              </Button>
            ) : (
              <Link to="/settings" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-surface-hi px-4 text-ink no-underline">
                <Pin aria-hidden="true" className="size-5" /> Pin metrics
              </Link>
            )
          }
        />
        {modules.length === 0 && <InlineStatus kind="info">No metric is pinned. {canCustomize ? 'Pin metrics below, or reset to the recommended layout.' : 'Pin metrics in Profile.'}</InlineStatus>}
        <div ref={listRef} onKeyDown={onKey} className="grid gap-4 lg:grid-cols-2">
          {modules.map((m, i) => (
            <div key={m} className={`${i === 0 || m.endsWith('Hero') ? 'lg:col-span-2' : ''} ${editing ? 'rounded-[26px] border-2 border-dashed border-line/60 p-2' : ''}`}>
              {MODULES[m]({ onLog: logPlanned })}
              {editing && (
                <div className="mt-2 grid grid-cols-3 gap-2" role="group" aria-label={`Arrange ${MODULE_INFO[m].name}`}>
                  <Button variant="secondary" size="sm" data-arrange={`${m}-up`} disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Move ${MODULE_INFO[m].name} up`}>
                    <ArrowUp aria-hidden="true" /> Up
                  </Button>
                  <Button variant="secondary" size="sm" data-arrange={`${m}-down`} disabled={i === modules.length - 1} onClick={() => move(i, 1)} aria-label={`Move ${MODULE_INFO[m].name} down`}>
                    <ArrowDown aria-hidden="true" /> Down
                  </Button>
                  <Button variant="secondary" size="sm" className="px-2" onClick={() => (setRefocus('customize'), save(modules.filter((x) => x !== m), `${MODULE_INFO[m].name} unpinned.`))} aria-label={`Unpin metric: ${MODULE_INFO[m].name}`}>
                    <PinOff aria-hidden="true" /> Unpin
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {editing && (
          <section aria-labelledby="add-mod" className="mt-6">
            <SectionHeader id="add-mod" title="Metrics you can pin" level={3} />
            {addable.length === 0 ? (
              <p className="m-0 text-ink-soft">Every metric is already pinned.</p>
            ) : (
              <ul className="m-0 grid list-none gap-2 p-0">
                {addable.map((m) => (
                  <li key={m} className="card flex items-center gap-3 p-3 pl-4">
                    <CategoryBadge category={MODULE_INFO[m].category} size={36} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold">{MODULE_INFO[m].name}</span>
                      <span className="block text-ink-soft">{MODULE_INFO[m].description}</span>
                    </span>
                    <Button size="sm" onClick={() => (setRefocus('customize'), save([...modules, m], `${MODULE_INFO[m].name} pinned to your dashboard.`))} aria-label={`Pin metric: ${MODULE_INFO[m].name}`}>
                      <Pin aria-hidden="true" /> Pin metric
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <Button variant="outline" block className="mt-4" onClick={() => (setDashboard(null), toast('success', `Dashboard reset to the recommended ${experience.name} layout.`))}>
              <RotateCcw aria-hidden="true" /> Reset to recommended
            </Button>
          </section>
        )}
      </div>

      <WorkoutSheet open={workout.open} draft={workout.draft} onOpenChange={(o) => setWorkout({ open: o, draft: o ? workout.draft : null })} />
      <PhotoSheet open={photo} onOpenChange={setPhoto} onManual={(d) => setMeal({ open: true, draft: d ?? null })} />
      <MealSheet open={meal.open} draft={meal.draft} onOpenChange={(o) => setMeal({ open: o, draft: o ? meal.draft : null })} />
      {iteration.sleep && <SleepSheet open={night} edit={null} onOpenChange={setNight} />}
    </>
  );
}

/** Task 2 "Responding": the app asks if the user wants to be presented with more data. */
function MoreDataPrompt() {
  const { user, iteration, updateProfile } = useUser();
  const toast = useToast();
  const q = shouldAskMoreData(user, iteration, today(), (n) => addDays(today(), -n));
  if (!q.ask) return null;
  return (
    <section aria-labelledby="more-data" className="hero-sleep anim-rise mt-5 p-5">
      <h2 id="more-data" className="m-0 text-xl font-bold">
        Do you want to see more data?
      </h2>
      <p className="m-0 mt-1">{q.reason} We can show more detail: weekly plan, activity numbers and macros.</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={() => (updateProfile({ moreData: false }), toast('success', 'OK, your dashboard stays simple. You can change this in Settings.'))}>
          No, thanks
        </Button>
        <Button onClick={() => (updateProfile({ moreData: true, dashboard: null }), toast('success', 'More data is now shown on your dashboard and pages.'))}>
          Yes, show more
        </Button>
      </div>
    </section>
  );
}

function SyncChip() {
  const { sync, user } = useUser();
  const text = sync.state === 'syncing' ? 'Checking your data…' : sync.state === 'failed' ? 'Sync failed' : sync.state === 'synced' ? `Up to date${user.profile.device ? ` · ${user.profile.device.name.replace(' (simulated)', '')}` : ''}` : user.profile.device ? 'Not synced yet' : 'No device connected';
  return (
    <p className="m-0 mt-2 inline-flex items-center gap-2 rounded-full bg-sunken px-3 py-1" aria-live="polite">
      {sync.state === 'syncing' ? <Loader2 aria-hidden="true" className="size-4 motion-safe:animate-spin" /> : <span aria-hidden="true" className={`size-2.5 rounded-full ${sync.state === 'failed' ? 'bg-act' : sync.state === 'synced' ? 'bg-food' : 'bg-ink-soft'}`} />}
      {text}
      <span className="sr-only"> (simulated)</span>
    </p>
  );
}
