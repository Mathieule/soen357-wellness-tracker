/**
 * Page header used by every section page.
 *  - "Return" button top-left (Task 2: "return buttons until the user reaches
 *    the dashboard"; Task 3 Output B C22).
 *  - Settings button top-right (Output B and C). Output A keeps settings in
 *    the bottom bar ("Profile"), so the button is not shown there.
 *  - The page label in a large font, the same as the dashboard widget label
 *    (Task 2 "Labels": "Fitness Metrics" opens "Fitness Metrics").
 */
import { ArrowLeft, Settings } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { useStore } from '@core';
import { CategoryBadge, type Category } from '@ds';

const pill = 'inline-flex min-h-12 items-center gap-2 rounded-full bg-surface px-4 text-base text-ink no-underline transition-colors hover:bg-surface-hi';

export function TopBar({ title, category, subtitle, back = true, action }: { title: string; category?: Category; subtitle?: ReactNode; back?: boolean; action?: ReactNode }) {
  const { iteration } = useStore();
  return (
    <header className="anim-rise">
      <div className="flex min-h-12 items-center justify-between gap-3 lg:hidden">
        {back ? (
          <Link to="/" className={pill} aria-label="Return to the dashboard" data-back-button>
            <ArrowLeft aria-hidden="true" className="size-5" />
            <span aria-hidden="true">Return</span>
          </Link>
        ) : (
          <span />
        )}
        {!iteration.settingsInNav && (
          <Link to="/settings" className={pill} data-settings-button>
            <Settings aria-hidden="true" className="size-5" /> Settings
          </Link>
        )}
      </div>
      <div className="mt-5 flex items-center gap-3 lg:mt-0">
        {category && <CategoryBadge category={category} size={52} />}
        <div className="min-w-0 flex-1">
          <h1 className="m-0 text-3xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="m-0 mt-1 text-ink-soft">{subtitle}</p>}
        </div>
        {action}
      </div>
    </header>
  );
}
