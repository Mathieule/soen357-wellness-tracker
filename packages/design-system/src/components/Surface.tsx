/**
 * Layout building blocks: Card, SectionHeader, Pill, ListRow, StatTile,
 * EmptyState. Cards come in three roles only (hero / card / inset) so screens
 * keep a clear hierarchy instead of a wall of identical boxes.
 */
import { ChevronRight } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../cn';
import { CATEGORY, type Category } from './Icons';

export function Card({ hero, className, ...props }: ComponentProps<'section'> & { hero?: Category }) {
  return <section className={cn(hero ? CATEGORY[hero].hero : 'card', 'p-5', className)} {...props} />;
}

export function SectionHeader({ title, id, action, level = 2, subtitle }: { title: string; id?: string; action?: ReactNode; level?: 2 | 3; subtitle?: ReactNode }) {
  const H = level === 2 ? 'h2' : 'h3';
  return (
    <div className="mb-3 flex min-h-11 items-center justify-between gap-3">
      <div className="min-w-0">
        <H id={id} className={cn('m-0 font-bold', level === 2 ? 'text-xl' : 'text-lg')}>
          {title}
        </H>
        {subtitle && <p className="m-0 text-ink-soft">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Pill({ children, className, tone }: { children: ReactNode; className?: string; tone?: Category | 'neutral' }) {
  const bg = !tone || tone === 'neutral' ? 'bg-sunken' : CATEGORY[tone].tint;
  return <span className={cn('inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 text-base', bg, className)}>{children}</span>;
}

/** A tappable row inside a card list. */
export function ListRow({ title, meta, trailing, onClick, className }: { title: ReactNode; meta?: ReactNode; trailing?: ReactNode; onClick?: () => void; className?: string }) {
  const inner = (
    <>
      <span className="min-w-0 flex-1">
        <span className="block font-bold">{title}</span>
        {meta && <span className="block text-ink-soft">{meta}</span>}
      </span>
      {trailing}
      {onClick && <ChevronRight aria-hidden="true" className="size-5 shrink-0" />}
    </>
  );
  return onClick ? (
    <button type="button" onClick={onClick} className={cn('flex min-h-16 w-full cursor-pointer items-center gap-3 bg-transparent px-5 py-3 text-left text-base text-ink transition-colors hover:bg-surface-hi', className)}>
      {inner}
    </button>
  ) : (
    <div className={cn('flex min-h-16 items-center gap-3 px-5 py-3', className)}>{inner}</div>
  );
}

/** Rows in one rounded group, separated by hairlines. */
export function ListGroup({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <ul aria-label={label} className="card m-0 list-none divide-y divide-hair overflow-hidden p-0">
      {children}
    </ul>
  );
}

export function StatTile({ label, value, unit, sub, accent, progress, className }: { label: string; value: string; unit?: string; sub?: ReactNode; accent?: string; progress?: number; className?: string }) {
  return (
    <div className={cn('inset flex min-w-0 flex-col gap-1 p-3.5', className)}>
      <span className="text-ink-soft">{label}</span>
      <span className="text-2xl font-bold leading-none">
        {value}
        {unit && <span className="text-base font-normal"> {unit}</span>}
      </span>
      {progress !== undefined && (
        <span aria-hidden="true" className="mt-1 block h-1.5 overflow-hidden rounded-full bg-surface-hi">
          <span className="anim-grow-x block h-full rounded-full" style={{ width: `${Math.min(progress, 1) * 100}%`, background: accent }} />
        </span>
      )}
      {sub && <span className="text-ink-soft">{sub}</span>}
    </div>
  );
}

/** Trend chip: arrow + words, so direction is not shown by colour alone. */
export function Delta({ value, unit = '%', label = 'vs last week' }: { value: number; unit?: string; label?: string }) {
  const up = value >= 0;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-sunken px-2.5 py-0.5">
      <span aria-hidden="true">{up ? '↑' : '↓'}</span>
      <span>
        <span className="sr-only">{up ? 'Up' : 'Down'} </span>
        {Math.abs(value)}
        {unit} {label}
      </span>
    </span>
  );
}

const ILLUSTRATIONS: Record<Category | 'generic', ReactNode> = {
  fitness: (
    <g>
      <circle cx="60" cy="44" r="34" fill="var(--color-act-tint)" />
      <rect x="34" y="40" width="52" height="8" rx="4" fill="var(--color-act)" />
      <rect x="28" y="30" width="10" height="28" rx="4" fill="var(--color-ink)" />
      <rect x="82" y="30" width="10" height="28" rx="4" fill="var(--color-ink)" />
    </g>
  ),
  nutrition: (
    <g>
      <circle cx="60" cy="44" r="34" fill="var(--color-food-tint)" />
      <path d="M32 44h56a28 28 0 0 1-56 0z" fill="var(--color-ink)" />
      <path d="M48 32c0-6 6-6 6-12M60 32c0-6 6-6 6-12M72 32c0-6 6-6 6-12" stroke="var(--color-food)" strokeWidth="4" strokeLinecap="round" fill="none" />
    </g>
  ),
  sleep: (
    <g>
      <circle cx="60" cy="44" r="34" fill="var(--color-sleep-tint)" />
      <path d="M72 58a22 22 0 1 1-12-38 18 18 0 0 0 12 38z" fill="var(--color-ink)" />
      <circle cx="80" cy="26" r="3" fill="var(--color-sleep)" />
      <circle cx="88" cy="40" r="2" fill="var(--color-sleep)" />
    </g>
  ),
  generic: (
    <g>
      <circle cx="60" cy="44" r="34" fill="var(--color-surface-hi)" />
      <path d="M44 46l10 10 22-24" stroke="var(--color-ink)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </g>
  ),
};

/** Designed empty state: small illustration, one sentence, one action. */
export function EmptyState({ category = 'generic', title, children, action }: { category?: Category | 'generic'; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-8 text-center">
      <svg width="120" height="88" viewBox="0 0 120 88" aria-hidden="true">
        {ILLUSTRATIONS[category]}
      </svg>
      <h3 className="m-0 text-lg font-bold">{title}</h3>
      {children && <p className="m-0 max-w-[30ch] text-ink-soft">{children}</p>}
      {action}
    </div>
  );
}
