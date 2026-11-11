/**
 * C5 Navigation bar (Output A). Light gray bar at the bottom of the screen.
 * Each menu has a large simple image and a text label under it:
 * house = dashboard, bowl = nutrition, dumbbell = fitness, Zs = sleep.
 * Output A also keeps the profile / settings menu in this bar.
 *
 * The icons are decorative (aria-hidden) because the visible text label is
 * the accessible name; announcing both would repeat the same word.
 */
import { Dumbbell, House, Soup, UserRound } from 'lucide-react';
import { NavLink } from 'react-router';
import { ZzzIcon } from '@shared/icons/ZzzIcon';
import { cn } from '@shared/lib/cn';

export const NAV_ITEMS = [
  { to: '/', label: 'Home', Icon: House },
  { to: '/nutrition', label: 'Nutrition', Icon: Soup },
  { to: '/fitness', label: 'Fitness', Icon: Dumbbell },
  { to: '/sleep', label: 'Sleep', Icon: ZzzIcon },
  { to: '/profile', label: 'Profile', Icon: UserRound },
] as const;

export function NavBar() {
  return (
    <nav aria-label="Main menu" className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-line/60 bg-nav pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto flex max-w-[480px] list-none justify-around p-0 py-1">
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end
              data-nav-item
              className={({ isActive }) =>
                cn(
                  'mx-auto flex min-h-16 w-full max-w-20 flex-col items-center justify-center gap-0.5 rounded-xl text-base text-ink no-underline',
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
