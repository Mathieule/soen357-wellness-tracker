/**
 * C4 Dashboard (Output A). Widgets in a grid (C6) taking the top of the screen:
 * fitness first, then nutrition, then sleep. Only the metrics the user chose in
 * the questionnaire are shown; showing / hiding and ordering is done in
 * Profile and Settings in Output A.
 *
 * Keyboard: focus starts on the first widget. Arrow Down / Up moves through
 * the widget list; Arrow Down on the last widget goes to the navigation bar.
 */
import { useEffect, useRef, type KeyboardEvent } from 'react';
import { useUser } from '@shared/data/appData';
import { formatLongDay, today } from '@shared/lib/dates';
import { useFlash } from '@shared/lib/useFlash';
import { StatusMessage } from '@shared/ui/status';
import { WIDGETS } from '@/components/Widgets';

export function DashboardPage() {
  const { user } = useUser();
  const [flash, setFlash] = useFlash();
  const refs = useRef<(HTMLAnchorElement | null)[]>([]);
  const metrics = user.profile.metrics;

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const onKey = (i: number) => (e: KeyboardEvent<HTMLAnchorElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = refs.current[i + 1];
      if (next) next.focus();
      else document.querySelector<HTMLElement>('[data-nav-item]')?.focus();
    } else if (e.key === 'ArrowUp' && i > 0) {
      e.preventDefault();
      refs.current[i - 1]?.focus();
    }
  };

  return (
    <>
      <h1 className="m-0 text-3xl font-bold">Today</h1>
      <p className="m-0 mt-1 text-lg">
        Hello, {user.profile.name}. {formatLongDay(today())}.
      </p>

      {flash && (
        <StatusMessage kind={flash.kind} onDismiss={() => setFlash(null)} className="mt-4">
          {flash.text}
        </StatusMessage>
      )}

      <h2 className="sr-only">Your metrics</h2>
      {metrics.length === 0 ? (
        <p className="mt-6">No metrics are shown. Choose metrics in Profile and Settings.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4">
          {metrics.map((m, i) => {
            const W = WIDGETS[m];
            return (
              <W
                key={m}
                user={user}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                onKeyDown={onKey(i)}
                // The fitness widget spans the full width; the others are squares side by side.
                className={m === 'fitness' || metrics.length === 1 ? 'col-span-2' : 'min-h-44'}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
