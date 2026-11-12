/**
 * C5 Navigation bar (Output B).
 * CHANGED in B:
 *  - The Profile / settings item was removed; settings are now opened with
 *    the button in the top-right corner (see TopBar).
 *  - Arrow Left / Arrow Right move focus between the menu items, and links
 *    pass { via: 'nav' } so the opened menu keeps focus on the bar.
 *
 * The icons are decorative (aria-hidden) because the visible text label is
 * the accessible name; announcing both would repeat the same word.
 */
import { Dumbbell, House, Soup } from 'lucide-react';
import type { KeyboardEvent } from 'react';
import { NavLink } from 'react-router';
import { ZzzIcon } from '@shared/icons/ZzzIcon';
import { cn } from '@shared/lib/cn';

export const NAV_ITEMS = [
  { to: '/', label: 'Home', Icon: House },
  { to: '/nutrition', label: 'Nutrition', Icon: Soup },
  { to: '/fitness', label: 'Fitness', Icon: Dumbbell },
  { to: '/sleep', label: 'Sleep', Icon: ZzzIcon },
] as const;

function onArrow(e: KeyboardEvent<HTMLElement>) {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
  const items = [...document.querySelectorAll<HTMLElement>('[data-nav-item]')];
  const i = items.indexOf(e.target as HTMLElement);
  if (i < 0) return;
  e.preventDefault();
  const next = (i + (e.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length;
  items[next].focus();
}

export function NavBar() {
  return (
    <nav aria-label="Main menu" onKeyDown={onArrow} className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-line/60 bg-nav pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto flex max-w-[480px] list-none justify-around p-0 py-1">
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end
              state={{ via: 'nav' }}
              data-nav-item
              className={({ isActive }) =>
                cn(
                  'mx-auto flex min-h-16 w-full max-w-24 flex-col items-center justify-center gap-0.5 rounded-xl text-base text-ink no-underline',
                  isActive ? 'bg-bg font-bold underline decoration-2 underline-offset-4' : 'hover:bg-raised',
                )
              }
            >
              <Icon aria-hidden="true" className="size-7" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
