/**
 * Output C visual kit: small building blocks used by every screen so that
 * cards, headings, numbers and progress look the same everywhere (AR12).
 * Colour always comes with a word or an icon (AR1); accent colours are only
 * used for icons and graphics, never for text.
 */
import { Dumbbell, Soup, type LucideIcon } from 'lucide-react';
import type { ComponentType, ReactNode, SVGProps } from 'react';
import type { MetricId } from '../data/types';
import { ZzzIcon } from '../icons/ZzzIcon';
import { cn } from '../lib/cn';

type IconType = LucideIcon | ComponentType<SVGProps<SVGSVGElement>>;

export const CATEGORY: Record<MetricId, { label: string; title: string; accent: string; tint: string; surface: string; Icon: IconType; path: string }> = {
  fitness: { label: 'Activity', title: 'Fitness Metrics', accent: '#FF9E94', tint: 'bg-fit-tint', surface: 'bg-fit', Icon: Dumbbell, path: '/fitness' },
  nutrition: { label: 'Food', title: 'Nutrition Metrics', accent: '#7FD98A', tint: 'bg-food-tint', surface: 'bg-food', Icon: Soup, path: '/nutrition' },
  sleep: { label: 'Sleep', title: 'Sleep Metrics', accent: '#9CCBFF', tint: 'bg-sleep-tint', surface: 'bg-sleep', Icon: ZzzIcon, path: '/sleep' },
};

/** Category icon in a tinted circle. Decorative: the category name is always written next to it. */
export function IconBadge({ metric, size = 44 }: { metric: MetricId; size?: number }) {
  const c = CATEGORY[metric];
  return (
    <span aria-hidden="true" className={cn('inline-flex shrink-0 items-center justify-center rounded-full', c.tint)} style={{ width: size, height: size }}>
      <c.Icon style={{ color: c.accent, width: size * 0.55, height: size * 0.55 }} />
    </span>
  );
}

export function SectionHeader({ title, action, id }: { title: string; action?: ReactNode; id?: string }) {
  return (
    <div className="mb-3 flex min-h-11 items-center justify-between gap-3">
      <h2 id={id} className="m-0 text-xl font-bold">
        {title}
      </h2>
      {action}
    </div>
  );
}

/**
 * Progress ring with its label and value written underneath. The ring itself
 * is aria-hidden; the text (and an sr-only percentage) carries the meaning.
 */
export function ProgressRing({
  value,
  goal,
  accent,
  label,
  display,
  unit,
  size = 96,
  stroke = 10,
}: {
  value: number;
  goal: number;
  accent: string;
  label: string;
  display: string;
  unit?: string;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = goal > 0 ? Math.min(value / goal, 1) : 0;
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#3A3434" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={accent}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${c * pct} ${c}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-lg font-bold">
          {Math.round(pct * 100)}%
        </span>
      </div>
      <div>
        <p className="m-0 font-bold">{label}</p>
        <p className="m-0">
          {display}
          <span className="sr-only">, {Math.round(pct * 100)} percent of goal</span>
        </p>
        {unit && <p className="m-0">{unit}</p>}
      </div>
    </div>
  );
}

/** Big number with label and optional progress bar. */
export function StatTile({ label, value, unit, goal, accent, className }: { label: string; value: number; unit?: string; goal?: number; accent?: string; className?: string }) {
  const pct = goal ? Math.min(value / goal, 1) : null;
  return (
    <div className={cn('rounded-2xl bg-sunken p-3', className)}>
      <p className="m-0">{label}</p>
      <p className="m-0 mt-1 text-xl font-bold leading-tight">
        {value.toLocaleString('en-CA')}
        {unit && <span className="text-base font-normal"> {unit}</span>}
      </p>
      {pct !== null && (
        <>
          <div aria-hidden="true" className="mt-2 h-1.5 overflow-hidden rounded-full bg-card-hi">
            <div className="h-full rounded-full" style={{ width: `${pct * 100}%`, background: accent }} />
          </div>
          <p className="m-0 mt-1">of {goal!.toLocaleString('en-CA')}</p>
        </>
      )}
    </div>
  );
}

/** Single-choice row of chips (filters). Uses aria-pressed toggle buttons. */
export function FilterChips<T extends string>({ label, options, value, onChange }: { label: string; options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            className={cn(
              'inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border-2 px-4 text-base text-ink',
              on ? 'border-ink bg-ink/15 font-bold' : 'border-hairline bg-card',
            )}
          >
            {on && <span aria-hidden="true">✓</span>}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Groups a dated list under "Today", "Yesterday", "Mon, Nov 9"… */
export function dayHeading(iso: string, todayIso: string, yesterdayIso: string, format: (iso: string) => string) {
  if (iso === todayIso) return 'Today';
  if (iso === yesterdayIso) return 'Yesterday';
  return format(iso);
}
