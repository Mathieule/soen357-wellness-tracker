/**
 * Output B top bar.
 *  - C22 Back button (NEW in B): light gray arrow in the top-left corner,
 *    same size as the navigation bar buttons. Shown on the fitness, sleep and
 *    nutrition menus (and on Settings, which no longer has a nav bar item).
 *    Not shown on the dashboard.
 *  - Settings button (NEW in B): top-right corner, replaces the Profile item
 *    that Output A had in the navigation bar.
 * Both buttons show a short text label under the icon, like the nav bar.
 */
import { ArrowLeft, Settings } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { cn } from '@shared/lib/cn';

const corner =
  'flex min-h-16 w-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl bg-nav text-base text-ink no-underline hover:brightness-110';

export function TopBar({ title, icon, back = false, showSettings = true }: { title: string; icon?: ReactNode; back?: boolean; showSettings?: boolean }) {
  return (
    <header className="flex items-center gap-3">
      {back && (
        <Link to="/" className={corner} aria-label="Back to dashboard" data-back-button>
          <ArrowLeft aria-hidden="true" className="size-7" />
          <span aria-hidden="true">Back</span>
        </Link>
      )}
      <h1 className={cn('m-0 flex min-w-0 flex-1 items-center gap-2 text-3xl font-bold', back && 'text-2xl')}>
        {icon}
        {title}
      </h1>
      {showSettings && (
        <Link to="/settings" className={corner} aria-label="Settings" data-settings-button>
          <Settings aria-hidden="true" className="size-7" />
          <span aria-hidden="true">Settings</span>
        </Link>
      )}
    </header>
  );
}
