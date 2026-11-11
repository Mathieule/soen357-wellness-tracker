/**
 * Dashboard widgets (C7–C10), Output C visual design.
 * Same behaviour as B (each widget is one link to its menu, carries
 * { via: 'widget' }, persona decides how much detail is shown), new look:
 * full-width cards with a category badge, a headline number and a short
 * detail line. One column only, which fixes B-P1 (lonely half-width widget).
 */
import { ChevronRight } from 'lucide-react';
import { forwardRef, type KeyboardEventHandler, type ReactNode } from 'react';
import { Link } from 'react-router';
import { REST_DAY, weekPlan } from '@shared/data/program';
import { stageTotals } from '@shared/data/sample';
import { lastSleep, mealsOn, totalsOf } from '@shared/data/selectors';
import type { MetricId, UserData } from '@shared/data/types';
import { formatDuration } from '@shared/lib/dates';
import { cn } from '@shared/lib/cn';
import { CATEGORY, IconBadge } from '@shared/ui/kit';

interface WidgetProps {
  user: UserData;
  onKeyDown?: KeyboardEventHandler<HTMLAnchorElement>;
  className?: string;
}

const Shell = forwardRef<HTMLAnchorElement, WidgetProps & { metric: MetricId; children: ReactNode; subtitle: string }>(function Shell(
  { metric, onKeyDown, className, children, subtitle },
  ref,
) {
  const c = CATEGORY[metric];
  return (
    <Link
      ref={ref}
      to={c.path}
      state={{ via: 'widget' }}
      onKeyDown={onKeyDown}
      data-widget={metric}
      className={cn('card block p-4 text-ink no-underline hover:bg-card-hi', className)}
    >
      <div className="flex items-center gap-3">
        <IconBadge metric={metric} />
        <div className="min-w-0 flex-1">
          <h3 className="m-0 text-lg font-bold">{c.title}</h3>
          <p className="m-0">{subtitle}</p>
        </div>
        <ChevronRight aria-hidden="true" className="size-6 shrink-0" />
      </div>
      <div className="mt-3">{children}</div>
    </Link>
  );
});

export const FitnessWidget = forwardRef<HTMLAnchorElement, WidgetProps>(function FitnessWidget(props, ref) {
  const { user } = props;
  const today = weekPlan(user.profile, user.workouts).find((d) => d.isToday)!;
  const s = today.session;
  const detailed = user.profile.persona === 'performance';
  const items = s ? s.items : REST_DAY;
  return (
    <Shell ref={ref} metric="fitness" subtitle={s ? `Today: ${s.title}` : 'Today: rest day'} {...props}>
      {s && (
        <p className="m-0 text-2xl font-bold leading-tight">
          {s.durationMin} <span className="text-base font-normal">min · {s.kind}</span>
          {today.logged && <span className="ml-2 rounded-full bg-fit px-2 py-0.5 align-middle text-base font-normal">✓ Done</span>}
        </p>
      )}
      <ul className="m-0 mt-2 list-none p-0">
        {items.slice(0, detailed ? 4 : 2).map((r) => (
          <li key={r.name} className="flex justify-between gap-3 border-t border-hairline py-1.5 first:border-t-0">
            <span>{r.name}</span>
            <span className="text-right">{r.detail}</span>
          </li>
        ))}
      </ul>
    </Shell>
  );
});

export const NutritionWidget = forwardRef<HTMLAnchorElement, WidgetProps>(function NutritionWidget(props, ref) {
  const { user } = props;
  const t = totalsOf(mealsOn(user));
  const left = Math.max(user.goals.calories - t.calories, 0);
  const detailed = user.profile.persona === 'performance';
  const pct = Math.min(t.calories / user.goals.calories, 1);
  return (
    <Shell ref={ref} metric="nutrition" subtitle={`${left.toLocaleString('en-CA')} kcal left today`} {...props}>
      <p className="m-0 text-2xl font-bold leading-tight">
        {t.calories.toLocaleString('en-CA')} <span className="text-base font-normal">of {user.goals.calories.toLocaleString('en-CA')} kcal</span>
      </p>
      <div aria-hidden="true" className="mt-2 h-2 overflow-hidden rounded-full bg-sunken">
        <div className="h-full rounded-full bg-food-accent" style={{ width: `${pct * 100}%` }} />
      </div>
      {detailed && (
        <p className="m-0 mt-2">
          Protein {t.proteinG} g · Carbs {t.carbsG} g · Fat {t.fatG} g
        </p>
      )}
    </Shell>
  );
});

const STAGE_COLOURS = { Deep: '#7FB3F0', Light: '#9CCBFF', REM: '#C9E2FF', Awake: '#F2F0EF' } as const;

export const SleepWidget = forwardRef<HTMLAnchorElement, WidgetProps>(function SleepWidget(props, ref) {
  const { user } = props;
  const s = lastSleep(user);
  const detailed = user.profile.persona === 'performance';
  const totals = s ? stageTotals(s) : null;
  return (
    <Shell ref={ref} metric="sleep" subtitle={s ? `Last night, ${s.bedtime} to ${s.wakeTime}` : 'No sleep recorded yet'} {...props}>
      {s && totals ? (
        <>
          <p className="m-0 text-2xl font-bold leading-tight">{formatDuration(s.durationMin)}</p>
          {detailed && (
            <>
              {/* Stage proportions: decorative bar, the minutes are written below. */}
              <div aria-hidden="true" className="mt-2 flex h-2 gap-[2px] overflow-hidden rounded-full">
                {(['Deep', 'Light', 'REM', 'Awake'] as const).map((k) => (
                  <div key={k} style={{ flex: totals[k], background: STAGE_COLOURS[k] }} />
                ))}
              </div>
              <p className="m-0 mt-2">
                Deep {formatDuration(totals.Deep)} · REM {formatDuration(totals.REM)} · Light {formatDuration(totals.Light)}
              </p>
            </>
          )}
        </>
      ) : (
        <p className="m-0">Add last night's sleep to see it here.</p>
      )}
    </Shell>
  );
});

export const WIDGETS: Record<MetricId, typeof FitnessWidget> = {
  fitness: FitnessWidget,
  nutrition: NutritionWidget,
  sleep: SleepWidget,
};
