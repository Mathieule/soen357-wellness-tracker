/**
 * Calendar visuals (inspired by Skulpt's week row and results calendar).
 *  - WeekStrip: Mon→Sun with the date number in a circle whose style shows the
 *    plan state (filled = done, ring = planned, dashed = missed, plain = rest).
 *  - MonthCalendar: month grid with filled circles on active days; arrow keys
 *    move by day / week. Every state is also in the accessible name (AR1).
 */
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { cn } from '../cn';

export type DayState = 'done' | 'planned' | 'missed' | 'rest' | 'extra';
export interface StripDay {
  date: string; // yyyy-mm-dd
  short: string; // Mon
  long: string; // Monday, Nov 9
  dayNumber: number;
  state: DayState;
  isToday: boolean;
  detail?: string; // e.g. session title
}

const STATE_TEXT: Record<DayState, string> = { done: 'done', planned: 'planned', missed: 'missed', rest: 'rest day', extra: 'extra workout' };

function Dot({ d, accent, size = 40 }: { d: StripDay; accent: string; size?: number }) {
  const filled = d.state === 'done' || d.state === 'extra';
  return (
    <span
      aria-hidden="true"
      className={cn('flex items-center justify-center rounded-full text-base font-bold', d.state === 'missed' && 'border-[2.5px] border-dashed', d.state === 'planned' && 'border-[2.5px]', d.state === 'rest' && 'bg-sunken')}
      style={{ width: size, height: size, background: filled ? accent : undefined, color: filled ? 'var(--color-on-ink)' : undefined, borderColor: d.state === 'missed' || d.state === 'planned' ? accent : undefined }}
    >
      {d.dayNumber}
    </span>
  );
}

export function WeekStrip({ days, accent, selected, onSelect, legend = true }: { days: StripDay[]; accent: string; selected?: number; onSelect?: (i: number) => void; legend?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const onKey = (e: KeyboardEvent) => {
    if (!onSelect || selected === undefined || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
    e.preventDefault();
    const n = (selected + (e.key === 'ArrowRight' ? 1 : -1) + days.length) % days.length;
    onSelect(n);
    ref.current?.querySelectorAll<HTMLButtonElement>('button')[n]?.focus();
  };
  return (
    <div>
      <div ref={ref} onKeyDown={onKey} className="grid grid-cols-7 gap-1" role={onSelect ? 'group' : 'list'} aria-label="Training week">
        {days.map((d, i) => {
          const name = `${d.long}${d.isToday ? ', today' : ''}: ${d.detail ? d.detail + ', ' : ''}${STATE_TEXT[d.state]}`;
          const body = (
            <>
              <span className={cn('text-base', d.isToday ? 'font-bold' : 'text-ink-soft')}>{d.short}</span>
              <Dot d={d} accent={accent} />
              <span aria-hidden="true" className={cn('h-1 w-5 rounded-full', d.isToday ? 'bg-ink' : 'bg-transparent')} />
            </>
          );
          return onSelect ? (
            <button
              key={d.date}
              type="button"
              aria-label={name}
              aria-pressed={selected === i}
              tabIndex={selected === i ? 0 : -1}
              onClick={() => onSelect(i)}
              className={cn('flex min-h-[88px] min-w-11 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 bg-transparent text-ink transition-colors', selected === i ? 'border-ink bg-surface-hi' : 'border-transparent hover:bg-surface-hi')}
            >
              {body}
            </button>
          ) : (
            <div key={d.date} role="listitem" aria-label={name} className="flex min-h-[84px] flex-col items-center justify-center gap-1.5">
              {body}
            </div>
          );
        })}
      </div>
      {legend && (
        <ul aria-label="Legend" className="m-0 mt-3 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 text-ink-soft">
          <li className="flex items-center gap-1.5">
            <span aria-hidden="true" className="size-4 rounded-full" style={{ background: accent }} /> Done
          </li>
          <li className="flex items-center gap-1.5">
            <span aria-hidden="true" className="size-4 rounded-full border-[2.5px]" style={{ borderColor: accent }} /> Planned
          </li>
          <li className="flex items-center gap-1.5">
            <span aria-hidden="true" className="size-4 rounded-full border-[2.5px] border-dashed" style={{ borderColor: accent }} /> Missed
          </li>
          <li className="flex items-center gap-1.5">
            <span aria-hidden="true" className="size-4 rounded-full bg-sunken" /> Rest
          </li>
        </ul>
      )}
    </div>
  );
}

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const parse = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/** Month grid. `level(date)` returns 0 (nothing), 1 (activity only) or 2 (workout). */
export function MonthCalendar({ today, selected, onSelect, level, describe, accent }: { today: string; selected: string; onSelect: (d: string) => void; level: (d: string) => 0 | 1 | 2; describe: (d: string) => string; accent: string }) {
  const [month, setMonth] = useState(() => {
    const d = parse(selected);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const grid = useRef<HTMLTableElement>(null);
  const moved = useRef(false);
  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    grid.current?.querySelector<HTMLButtonElement>(`[data-date="${selected}"]`)?.focus();
  }, [selected, month]);

  const offset = (month.getDay() + 6) % 7;
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (string | null)[] = [...Array<null>(offset).fill(null), ...Array.from({ length: days }, (_, i) => iso(new Date(month.getFullYear(), month.getMonth(), i + 1)))];
  while (cells.length % 7) cells.push(null);
  const rows = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
  const label = month.toLocaleDateString('en-CA', { month: 'long', year: 'numeric' });
  const t = parse(today);
  const atCurrent = month.getFullYear() === t.getFullYear() && month.getMonth() === t.getMonth();
  const tabStop = cells.includes(selected) ? selected : cells.find((c) => c && c <= today);

  const move = (delta: number) => {
    const d = parse(selected);
    d.setDate(d.getDate() + delta);
    const next = iso(d);
    if (next > today) return;
    moved.current = true;
    onSelect(next);
    if (d.getMonth() !== month.getMonth() || d.getFullYear() !== month.getFullYear()) setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
  };
  const onKey = (e: KeyboardEvent) => {
    const map: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (e.key in map) {
      e.preventDefault();
      move(map[e.key]);
    }
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Previous month" className="inline-flex size-12 cursor-pointer items-center justify-center rounded-full bg-surface-hi text-ink">
          <ChevronLeft aria-hidden="true" className="size-5" />
        </button>
        <h3 className="m-0 text-lg font-bold" aria-live="polite">
          {label}
        </h3>
        <button type="button" disabled={atCurrent} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month" className="inline-flex size-12 cursor-pointer items-center justify-center rounded-full bg-surface-hi text-ink disabled:cursor-not-allowed disabled:bg-transparent disabled:ring-2 disabled:ring-hair">
          <ChevronRight aria-hidden="true" className="size-5" />
        </button>
      </div>
      <table ref={grid} onKeyDown={onKey} className="w-full border-separate border-spacing-y-1.5">
        <caption className="sr-only">{label}. Use the arrow keys to move between days.</caption>
        <thead>
          <tr>
            {WEEKDAYS.map((d, i) => (
              <th key={i} scope="col" className="p-0 font-normal text-ink-soft">
                <abbr title={WEEKDAY_NAMES[i]} className="no-underline">
                  {d}
                </abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((d, j) => {
                if (!d) return <td key={j} />;
                const lv = level(d);
                const future = d > today;
                const sel = d === selected;
                return (
                  <td key={j} className="p-0 text-center">
                    <button
                      type="button"
                      data-date={d}
                      disabled={future}
                      tabIndex={d === tabStop ? 0 : -1}
                      aria-pressed={sel}
                      aria-label={`${describe(d)}${sel ? ', selected' : ''}`}
                      onClick={() => onSelect(d)}
                      className={cn(
                        'mx-auto flex size-11 cursor-pointer items-center justify-center rounded-full border-2 text-base transition-colors disabled:cursor-not-allowed disabled:border-transparent',
                        sel ? 'border-ink' : 'border-transparent',
                        lv === 0 && !future && 'bg-transparent text-ink',
                        lv === 1 && 'bg-surface-hi text-ink',
                        d === today && 'font-bold underline underline-offset-4',
                      )}
                      style={lv === 2 ? { background: accent, color: 'var(--color-on-ink)', fontWeight: 700 } : undefined}
                    >
                      {/* future days keep full-contrast text; only the circle is absent */}
                      {parse(d).getDate()}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <ul aria-label="Legend" className="m-0 mt-2 flex list-none flex-wrap gap-x-4 p-0 text-ink-soft">
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-4 rounded-full" style={{ background: accent }} /> Workout
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-4 rounded-full bg-surface-hi" /> Activity only
        </li>
      </ul>
    </div>
  );
}
