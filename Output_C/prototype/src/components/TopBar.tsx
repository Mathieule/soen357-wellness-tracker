/**
 * Output C top bar (keeps the Output B behaviour: Back top-left on menus,
 * Settings top-right).
 * CHANGED in C: two rows. Row 1 holds the Back and Settings buttons, each with
 * a visible text label; row 2 holds the large page title with its category
 * icon. This fixes B-P2 (the title wrapped between two 64 px buttons).
 */
import { ArrowLeft, Settings } from 'lucide-react';
import { Link } from 'react-router';
import type { MetricId } from '@shared/data/types';
import { IconBadge } from '@shared/ui/kit';

const pill =
  'inline-flex min-h-12 items-center gap-2 rounded-full border border-hairline bg-card px-4 text-base text-ink no-underline hover:bg-card-hi';

export function TopBar({ title, metric, back = false, showSettings = true }: { title: string; metric?: MetricId; back?: boolean; showSettings?: boolean }) {
  return (
    <header>
      <div className="flex min-h-12 items-center justify-between gap-3">
        {back ? (
          <Link to="/" className={pill} aria-label="Back to dashboard" data-back-button>
            <ArrowLeft aria-hidden="true" className="size-5" />
            <span aria-hidden="true">Dashboard</span>
          </Link>
        ) : (
          <span />
        )}
        {showSettings && (
          <Link to="/settings" className={pill} data-settings-button>
            <Settings aria-hidden="true" className="size-5" />
            Settings
          </Link>
        )}
      </div>
      <h1 className="m-0 mt-4 flex items-center gap-3 text-2xl font-bold">
        {metric && <IconBadge metric={metric} size={48} />}
        {title}
      </h1>
    </header>
  );
}
