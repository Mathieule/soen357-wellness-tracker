/**
 * Dashboard widgets (C7–C10). Each widget is a rounded square that takes the
 * user to its menu when tapped. Every widget shows its label in words, so the
 * colour (red / green / blue) is never the only way to tell them apart (AR1).
 * Performance users see more detail than casual users (Task 2 concept).
 */
import { ChevronRight, Dumbbell, Soup } from 'lucide-react';
import { forwardRef, type KeyboardEventHandler } from 'react';
import { Link } from 'react-router';
import { lastSleep, mealsOn, todaysActivity, totalsOf } from '@shared/data/selectors';
import { stageTotals, todaysRoutine } from '@shared/data/sample';
import type { MetricId, UserData } from '@shared/data/types';
import { ZzzIcon } from '@shared/icons/ZzzIcon';
import { formatDuration } from '@shared/lib/dates';
import { cn } from '@shared/lib/cn';

interface WidgetProps {
  user: UserData;
  onKeyDown?: KeyboardEventHandler<HTMLAnchorElement>;
  className?: string;
}

const base =
  'block overflow-hidden rounded-[var(--radius-card)] text-ink no-underline min-h-11 border-2 border-transparent hover:border-line';

/** C8: top half light gray with today's routine and activity, bottom half red. */
export const FitnessWidget = forwardRef<HTMLAnchorElement, WidgetProps>(function FitnessWidget({ user, onKeyDown, className }, ref) {
  const routine = todaysRoutine(user.profile.persona);
  const act = todaysActivity(user);
  const detailed = user.profile.persona === 'performance';
  return (
    <Link ref={ref} to="/fitness" onKeyDown={onKeyDown} className={cn(base, className)} data-widget="fitness">
      <div className="bg-raised p-4">
        <h3 className="m-0 text-base font-bold">Today's routine</h3>
        <ul className="m-0 mt-1 list-disc pl-5">
          {routine.slice(0, detailed ? 4 : 2).map((r) => (
            <li key={r.name}>
              {r.name}: {r.detail}
            </li>
          ))}
        </ul>
        <h3 className="m-0 mt-3 text-base font-bold">Today's activity</h3>
        <p className="m-0 mt-1">
          {act.steps.toLocaleString('en-CA')} steps · {act.activeMin} active min
          {detailed && <> · {act.caloriesKcal.toLocaleString('en-CA')} kcal burned</>}
        </p>
      </div>
      <div className="flex min-h-14 items-center gap-3 bg-fit px-4 py-3">
        <Dumbbell aria-hidden="true" className="size-7" />
        <span className="flex-1 text-xl font-bold">Fitness Metrics</span>
        <ChevronRight aria-hidden="true" />
      </div>
    </Link>
  );
});

/** C10: light green nutrition widget (deep green surface so the text keeps 5.6:1). */
export const NutritionWidget = forwardRef<HTMLAnchorElement, WidgetProps>(function NutritionWidget({ user, onKeyDown, className }, ref) {
  const t = totalsOf(mealsOn(user));
  const detailed = user.profile.persona === 'performance';
  return (
    <Link ref={ref} to="/nutrition" onKeyDown={onKeyDown} className={cn(base, 'bg-food p-4', className)} data-widget="nutrition">
      <span className="flex items-center gap-2 text-xl font-bold">
        <Soup aria-hidden="true" className="size-7" /> Nutrition
      </span>
      <p className="m-0 mt-2 text-2xl font-bold">{t.calories.toLocaleString('en-CA')}</p>
      <p className="m-0">of {user.goals.calories.toLocaleString('en-CA')} kcal goal</p>
      {detailed && (
        <p className="m-0 mt-2">
          Protein {t.proteinG} g · Carbs {t.carbsG} g · Fat {t.fatG} g
        </p>
      )}
    </Link>
  );
});

/** C9: blue sleep widget with last night's sleep. */
export const SleepWidget = forwardRef<HTMLAnchorElement, WidgetProps>(function SleepWidget({ user, onKeyDown, className }, ref) {
  const s = lastSleep(user);
  const detailed = user.profile.persona === 'performance';
  const totals = s ? stageTotals(s) : null;
  return (
    <Link ref={ref} to="/sleep" onKeyDown={onKeyDown} className={cn(base, 'bg-sleep p-4', className)} data-widget="sleep">
      <span className="flex items-center gap-2 text-xl font-bold">
        <ZzzIcon aria-hidden="true" className="size-7" /> Sleep
      </span>
      {s ? (
        <>
          <p className="m-0 mt-2 text-2xl font-bold">{formatDuration(s.durationMin)}</p>
          <p className="m-0">
            last night, {s.bedtime} to {s.wakeTime}
          </p>
          {detailed && totals && (
            <p className="m-0 mt-2">
              Deep {formatDuration(totals.Deep)} · REM {formatDuration(totals.REM)}
            </p>
          )}
        </>
      ) : (
        <p className="m-0 mt-2">No sleep recorded yet.</p>
      )}
    </Link>
  );
});

export const WIDGETS: Record<MetricId, typeof FitnessWidget> = {
  fitness: FitnessWidget,
  nutrition: NutritionWidget,
  sleep: SleepWidget,
};
