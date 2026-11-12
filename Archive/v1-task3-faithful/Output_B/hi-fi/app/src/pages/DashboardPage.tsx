/**
 * C4 Dashboard (Output B).
 *
 * CHANGED in B (Output B changelog):
 *  - Widgets can be pinned, unpinned and reordered directly from the
 *    dashboard ("Customize dashboard"), instead of in user settings.
 *    Unpinned metrics are listed under "More metrics", where they can be
 *    opened or pinned again (Task 2, T3 flow: "View additional metrics" ->
 *    "Sleep Metrics" -> "Pin to home screen").
 *  - Reordering uses "Move up" / "Move down" buttons, so it works with a
 *    keyboard, a screen reader or a single tap (no drag-and-drop needed).
 *  - A Settings button sits in the top-right corner.
 *  - If the dashboard was opened from the navigation bar, focus stays on the
 *    bar; otherwise it starts on the first widget.
 * Kept from A: Arrow Down / Up moves through the widgets; Arrow Down on the
 * last widget goes to the navigation bar.
 */
import { ArrowDown, ArrowUp, Check, ChevronRight, Pin, PinOff, SlidersHorizontal } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router';
import { useUser } from '@shared/data/appData';
import type { MetricId } from '@shared/data/types';
import { formatLongDay, today } from '@shared/lib/dates';
import { useFlash } from '@shared/lib/useFlash';
import { Button } from '@shared/ui/button';
import { StatusMessage } from '@shared/ui/status';
import { WIDGETS } from '@/components/Widgets';
import { TopBar } from '@/components/TopBar';
import { focusCurrentNavItem, useInitialFocus } from '@/lib/focus';

const ALL: MetricId[] = ['fitness', 'nutrition', 'sleep'];
const LABEL: Record<MetricId, string> = { fitness: 'Fitness Metrics', nutrition: 'Nutrition Metrics', sleep: 'Sleep Metrics' };
const PATH: Record<MetricId, string> = { fitness: '/fitness', nutrition: '/nutrition', sleep: '/sleep' };

export function DashboardPage() {
  const { user, updateProfile } = useUser();
  const [flash, setFlash] = useFlash();
  const [editing, setEditing] = useState(false);
  const refs = useRef<(HTMLAnchorElement | null)[]>([]);
  const customizeRef = useRef<HTMLButtonElement>(null);
  // After a change, keep keyboard focus on a sensible control (reordering moves DOM nodes).
  const [refocus, setRefocus] = useState<string | null>(null);
  const firstWidget = useRef<HTMLAnchorElement | null>(null);
  const pinned = user.profile.metrics;
  const unpinned = ALL.filter((m) => !pinned.includes(m));

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
    save(next, `${LABEL[pinned[i]]} moved ${d < 0 ? 'up' : 'down'} to position ${i + d + 1} of ${pinned.length}.`);
  };
  const unpin = (m: MetricId) => (setRefocus('customize'), save(pinned.filter((x) => x !== m), `${LABEL[m]} unpinned. You can pin it again under "More metrics".`));
  const pin = (m: MetricId) => (setRefocus('customize'), save([...pinned, m], `${LABEL[m]} pinned to your dashboard.`));

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

  return (
    <>
      <TopBar title="Today" />
      <p className="m-0 mt-1 text-lg">
        Hello, {user.profile.name}. {formatLongDay(today())}.
      </p>

      <Button
        ref={customizeRef}
        variant={editing ? 'primary' : 'outline'}
        className="mt-4 w-full"
        aria-pressed={editing}
        onClick={() => setEditing(!editing)}
      >
        {editing ? <Check aria-hidden="true" /> : <SlidersHorizontal aria-hidden="true" />}
        {editing ? 'Done customizing' : 'Customize dashboard'}
      </Button>

      {flash && (
        <StatusMessage kind={flash.kind} onDismiss={() => setFlash(null)} className="mt-4">
          {flash.text}
        </StatusMessage>
      )}

      <h2 className="sr-only">Pinned metrics</h2>
      {pinned.length === 0 ? (
        <p className="mt-6 rounded-xl bg-raised p-4">No metrics are pinned. Pin a metric under "More metrics" below.</p>
      ) : editing ? (
        // Edit mode: one column, each widget followed by its controls.
        <ol className="m-0 mt-6 flex list-none flex-col gap-4 p-0">
          {pinned.map((m, i) => {
            const W = WIDGETS[m];
            return (
              <li key={m} className="rounded-[var(--radius-card)] border-2 border-dashed border-line p-2">
                <W user={user} />
                <div className="mt-2 grid grid-cols-3 gap-2" role="group" aria-label={`Arrange ${LABEL[m]}`}>
                  <Button variant="secondary" data-arrange={`${m}-up`} onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${LABEL[m]} up`}>
                    <ArrowUp aria-hidden="true" /> Up
                  </Button>
                  <Button variant="secondary" data-arrange={`${m}-down`} onClick={() => move(i, 1)} disabled={i === pinned.length - 1} aria-label={`Move ${LABEL[m]} down`}>
                    <ArrowDown aria-hidden="true" /> Down
                  </Button>
                  <Button variant="secondary" onClick={() => unpin(m)} aria-label={`Unpin ${LABEL[m]}`}>
                    <PinOff aria-hidden="true" /> Unpin
                  </Button>
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4">
          {pinned.map((m, i) => {
            const W = WIDGETS[m];
            return (
              <W
                key={m}
                user={user}
                ref={(el) => {
                  refs.current[i] = el;
                  if (i === 0) firstWidget.current = el;
                }}
                onKeyDown={onKey(i)}
                className={m === 'fitness' || pinned.length === 1 ? 'col-span-2' : 'min-h-44'}
              />
            );
          })}
        </div>
      )}

      {unpinned.length > 0 && (
        <section aria-labelledby="more-metrics" className="mt-8">
          <h2 id="more-metrics" className="m-0 text-xl font-bold">
            More metrics
          </h2>
          <p className="m-0 mt-1">These metrics are not pinned to your dashboard.</p>
          <ul className="m-0 mt-3 flex list-none flex-col gap-3 p-0">
            {unpinned.map((m) => (
              <li key={m} className="flex items-center gap-2 rounded-xl bg-raised p-2">
                <Link
                  to={PATH[m]}
                  state={{ via: 'widget' }}
                  className="flex min-h-12 flex-1 items-center gap-2 rounded-lg px-2 font-bold text-ink no-underline"
                >
                  {LABEL[m]} <ChevronRight aria-hidden="true" className="size-5" />
                </Link>
                <Button variant="primary" onClick={() => pin(m)} aria-label={`Pin ${LABEL[m]} to dashboard`}>
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
