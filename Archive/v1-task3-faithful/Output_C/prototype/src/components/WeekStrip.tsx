/**
 * C: weekly training program strip (Mon → Sun).
 * Each day shows its state with a SHAPE as well as colour (AR1):
 *   ✓ filled circle = session done · ring = session planned ·
 *   dashed ring = planned but missed · small dot = rest day.
 * Interactive mode: days are toggle buttons (aria-pressed) to show a day's
 * session; ← / → move between days.
 */
import { Check } from 'lucide-react';
import type { KeyboardEvent } from 'react';
import { DAY_LONG, DAY_SHORT, type PlanDay } from '@shared/data/program';
import { formatDay } from '@shared/lib/dates';
import { cn } from '@shared/lib/cn';

export function dayStatus(d: PlanDay): 'done' | 'planned' | 'missed' | 'rest' | 'extra' {
  if (!d.session) return d.logged ? 'extra' : 'rest';
  if (d.logged) return 'done';
  return d.isPast ? 'missed' : 'planned';
}

const STATUS_TEXT = { done: 'done', planned: 'planned', missed: 'missed', rest: 'rest day', extra: 'rest day, extra workout logged' };

function Marker({ d }: { d: PlanDay }) {
  const s = dayStatus(d);
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-9 items-center justify-center rounded-full',
        (s === 'done' || s === 'extra') && 'bg-fit-accent text-sunken',
        s === 'planned' && 'border-[3px] border-fit-accent',
        s === 'missed' && 'border-[3px] border-dashed border-fit-accent/80',
      )}
    >
      {(s === 'done' || s === 'extra') && <Check className="size-5" strokeWidth={3} />}
      {s === 'rest' && <span className="size-2 rounded-full bg-ink/60" />}
    </span>
  );
}

export function WeekStrip({ plan, selected, onSelect }: { plan: PlanDay[]; selected?: number; onSelect?: (i: number) => void }) {
  const interactive = !!onSelect;
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!onSelect || selected === undefined) return;
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const next = (selected + (e.key === 'ArrowRight' ? 1 : -1) + 7) % 7;
    onSelect(next);
    (e.currentTarget.querySelectorAll('button')[next] as HTMLButtonElement | undefined)?.focus();
  };
  return (
    <div>
      <div className="grid grid-cols-7 gap-[3px]" role={interactive ? 'group' : 'list'} aria-label="This week's training plan" onKeyDown={onKey}>
        {plan.map((d, i) => {
          const label = `${DAY_LONG[d.dayIndex]}, ${formatDay(d.date)}${d.isToday ? ' (today)' : ''}: ${d.session ? d.session.title + ', ' : ''}${STATUS_TEXT[dayStatus(d)]}`;
          const content = (
            <>
              <span className={cn('text-base', d.isToday && 'font-bold underline decoration-2 underline-offset-4')}>{DAY_SHORT[d.dayIndex]}</span>
              <Marker d={d} />
            </>
          );
          return interactive ? (
            <button
              key={d.date}
              type="button"
              aria-pressed={selected === i}
              aria-label={label}
              tabIndex={selected === i ? 0 : -1}
              onClick={() => onSelect!(i)}
              className={cn(
                'flex min-h-[76px] min-w-11 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 text-ink',
                selected === i ? 'border-ink bg-card-hi' : 'border-transparent bg-transparent',
              )}
            >
              {content}
            </button>
          ) : (
            <div key={d.date} role="listitem" aria-label={label} className="flex min-h-[72px] flex-col items-center justify-center gap-1.5">
              {content}
            </div>
          );
        })}
      </div>
      <ul className="m-0 mt-3 flex list-none flex-wrap gap-x-4 gap-y-1 p-0" aria-label="Legend">
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="flex size-5 items-center justify-center rounded-full bg-fit-accent text-sunken">
            <Check className="size-3.5" strokeWidth={3} />
          </span>
          Done
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-5 rounded-full border-[3px] border-fit-accent" /> Planned
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-5 rounded-full border-[3px] border-dashed border-fit-accent/80" /> Missed
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2 rounded-full bg-ink/60" /> Rest
        </li>
      </ul>
    </div>
  );
}
