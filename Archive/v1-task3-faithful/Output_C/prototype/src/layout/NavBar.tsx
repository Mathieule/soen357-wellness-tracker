/**
 * C5 Navigation bar (Output C). Same items and keyboard rules as Output B
 * (← / → between items, { via: 'nav' } keeps focus on the bar).
 * CHANGED in C (visual only): dark bar with a hairline top border; the active
 * item gets a light pill behind its icon, bold text and an underline, so the
 * current page is shown by shape and weight, not colour alone.
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
  items[(i + (e.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length].focus();
}

export function NavBar() {
  return (
    <nav aria-label="Main menu" onKeyDown={onArrow} className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-sunken pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto flex max-w-[480px] list-none justify-around p-0 px-2 py-1.5">
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end
              state={{ via: 'nav' }}
              data-nav-item
              className={({ isActive }) =>
                cn(
                  'group mx-auto flex min-h-16 w-full max-w-24 flex-col items-center justify-center gap-1 rounded-2xl text-base text-ink no-underline',
                  isActive ? 'font-bold' : 'hover:bg-card',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span aria-hidden="true" className={cn('flex h-8 w-14 items-center justify-center rounded-full', isActive && 'bg-ink/20')}>
                    <Icon className="size-6" strokeWidth={isActive ? 2.5 : 2} />
                  </span>
                  <span className={cn(isActive && 'underline decoration-2 underline-offset-4')}>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
