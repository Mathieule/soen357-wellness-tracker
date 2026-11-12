/**
 * Empty-account onboarding card. New accounts start empty, so instead of a
 * dashboard full of zeros the user sees a short checklist of first actions.
 * Each item is checked (icon + "Done" text) once completed; the card hides
 * itself when everything is done.
 */
import { Check } from 'lucide-react';
import { Link } from 'react-router';
import { useUser } from '@core';
import { cn } from '@ds';

export function GetStarted({ onWorkout, onMeal, onNight }: { onWorkout: () => void; onMeal: () => void; onNight: () => void }) {
  const { user } = useUser();
  const items = [
    { label: 'Connect a device', hint: 'Imports your steps (simulated)', done: !!user.profile.device, to: '/settings' },
    { label: 'Log your first workout', hint: 'Or log today\'s planned session', done: user.workouts.length > 0, run: onWorkout },
    { label: 'Add your first meal', hint: 'Scan a photo or type it in', done: user.meals.length > 0, run: onMeal },
    { label: 'Add last night\'s sleep', hint: 'Bedtime and wake-up time', done: user.sleep.length > 0, run: onNight },
  ];
  const left = items.filter((i) => !i.done).length;
  if (left === 0 || (user.workouts.length > 5 && user.meals.length > 5)) return null;
  const row = 'flex min-h-16 w-full items-center gap-4 rounded-2xl bg-sunken px-4 py-3 text-left text-base text-ink no-underline';
  return (
    <section aria-labelledby="gs-title" className="card anim-rise mt-6 p-5">
      <h2 id="gs-title" className="m-0 text-xl font-bold">
        Get started
      </h2>
      <p className="m-0 mt-1 text-ink-soft">
        {left} of {items.length} steps left. Your dashboard fills up as you add data.
      </p>
      <ul className="m-0 mt-4 grid list-none gap-2 p-0">
        {items.map((it) => {
          const body = (
            <>
              <span aria-hidden="true" className={cn('flex size-8 shrink-0 items-center justify-center rounded-full border-2', it.done ? 'border-food bg-food text-on-ink' : 'border-line/60')}>
                {it.done && <Check className="size-4" strokeWidth={3.5} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className={cn('block font-bold', it.done && 'line-through decoration-2')}>{it.label}</span>
                <span className="block text-ink-soft">{it.done ? 'Done' : it.hint}</span>
              </span>
            </>
          );
          return (
            <li key={it.label}>
              {it.done ? (
                <div className={row}>{body}</div>
              ) : it.to ? (
                <Link to={it.to} className={cn(row, 'hover:bg-surface-hi')}>
                  {body}
                </Link>
              ) : (
                <button type="button" onClick={it.run} className={cn(row, 'cursor-pointer hover:bg-surface-hi')}>
                  {body}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
