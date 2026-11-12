/**
 * Calendar of previous daily activity (Task 3, C14: "a button that opens a
 * calendar to see all previous daily activity").
 *
 * Keyboard: Tab enters the grid on the selected day; arrow keys move by one
 * day (left/right) or one week (up/down); Enter/Space selects. Days with
 * stored activity are marked with a dot AND described in the accessible name.
 */
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { DayActivity } from '../data/types';
import { addDays, formatLongDay, fromISODate, toISODate, today } from '../lib/dates';
import { cn } from '../lib/cn';
import { Button } from '../ui/button';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function ActivityCalendar({ activity }: { activity: DayActivity[] }) {
  const byDate = new Map(activity.map((a) => [a.date, a]));
  const t = today();
  const [selected, setSelected] = useState(t);
  const [month, setMonth] = useState(() => {
    const d = fromISODate(t);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const focusAfterMove = useRef(false);
  const gridRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    if (!focusAfterMove.current) return;
    focusAfterMove.current = false;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${selected}"]`)?.focus();
  }, [selected, month]);

  const first = month;
  const startOffset = first.getDay();
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells: (string | null)[] = [
    ...Array<null>(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => toISODate(new Date(first.getFullYear(), first.getMonth(), i + 1))),
  ];
  while (cells.length % 7) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));

  const changeMonth = (delta: number) => setMonth(new Date(first.getFullYear(), first.getMonth() + delta, 1));
  const isNextDisabled = first.getFullYear() === fromISODate(t).getFullYear() && first.getMonth() === fromISODate(t).getMonth();

  const move = (delta: number) => {
    const next = addDays(selected, delta);
    if (next > t) return;
    const d = fromISODate(next);
    focusAfterMove.current = true;
    setSelected(next);
    if (d.getMonth() !== first.getMonth() || d.getFullYear() !== first.getFullYear()) {
      setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const map: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (e.key in map) {
      e.preventDefault();
      move(map[e.key]);
    }
  };

  const sel = byDate.get(selected);
  const monthLabel = first.toLocaleDateString('en-CA', { month: 'long', year: 'numeric' });
  // Roving tab stop: the selected day if it is shown, otherwise the first enabled day.
  const tabStop = cells.includes(selected) ? selected : cells.find((c) => c && c <= t);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <Button variant="outline" size="icon" onClick={() => changeMonth(-1)} aria-label="Previous month">
          <ChevronLeft aria-hidden="true" />
        </Button>
        <h3 className="m-0 text-lg font-bold" aria-live="polite">
          {monthLabel}
        </h3>
        <Button variant="outline" size="icon" onClick={() => changeMonth(1)} aria-label="Next month" disabled={isNextDisabled}>
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
      <table ref={gridRef} className="w-full border-separate border-spacing-[3px]" onKeyDown={onKeyDown}>
        <caption className="sr-only">Daily activity for {monthLabel}. Use the arrow keys to move between days.</caption>
        <thead>
          <tr>
            {WEEKDAYS.map((d) => (
              <th key={d} scope="col" className="p-0 text-base font-normal">
                <abbr title={d} className="no-underline">
                  {d[0]}
                </abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((w, i) => (
            <tr key={i}>
              {w.map((date, j) => {
                if (!date) return <td key={j} />;
                const future = date > t;
                const a = byDate.get(date);
                const isSel = date === selected;
                const label = `${formatLongDay(date)}${a ? `, ${a.steps.toLocaleString('en-CA')} steps` : ', no data'}${isSel ? ', selected' : ''}`;
                return (
                  <td key={j} className="p-0">
                    <button
                      type="button"
                      data-date={date}
                      disabled={future}
                      tabIndex={date === tabStop ? 0 : -1}
                      aria-label={label}
                      aria-pressed={isSel}
                      onClick={() => setSelected(date)}
                      className={cn(
                        'relative flex h-11 w-full min-w-11 cursor-pointer flex-col items-center justify-center rounded-lg border-2 text-base text-ink disabled:cursor-not-allowed disabled:opacity-50',
                        isSel ? 'border-ink bg-fit font-bold' : 'border-transparent bg-raised',
                        date === t && !isSel && 'border-line',
                      )}
                    >
                      {fromISODate(date).getDate()}
                      {a && <span aria-hidden="true" className="absolute bottom-1 size-1.5 rounded-full bg-fit-accent" />}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <section aria-live="polite" className="mt-4 rounded-xl bg-raised p-4">
        <h3 className="m-0 text-lg font-bold">{formatLongDay(selected)}</h3>
        {sel ? (
          <dl className="m-0 mt-2 grid grid-cols-3 gap-2 text-base">
            <div>
              <dt>Steps</dt>
              <dd className="m-0 text-xl font-bold">{sel.steps.toLocaleString('en-CA')}</dd>
            </div>
            <div>
              <dt>Active</dt>
              <dd className="m-0 text-xl font-bold">{sel.activeMin} min</dd>
            </div>
            <div>
              <dt>Burned</dt>
              <dd className="m-0 text-xl font-bold">{sel.caloriesKcal.toLocaleString('en-CA')} kcal</dd>
            </div>
          </dl>
        ) : (
          <p className="m-0 mt-2">No activity was recorded on this day.</p>
        )}
      </section>
    </div>
  );
}
