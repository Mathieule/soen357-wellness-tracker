/**
 * Signed-in layout: page content + bottom navigation bar (C5).
 * The page slides in from the left or right depending on where the new menu
 * sits in the navigation bar relative to the previous one (C5). The slide is
 * removed when the user asks for reduced motion (see theme.css).
 */
import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router';
import { NAV_ITEMS, NavBar } from './NavBar';

const TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/nutrition': 'Nutrition Metrics',
  '/fitness': 'Fitness Metrics',
  '/sleep': 'Sleep Metrics',
  '/settings': 'Settings',
};

export function AppShell() {
  const { pathname } = useLocation();
  // Settings is not in the bar any more: treat it as being to the right of every menu.
  const found = NAV_ITEMS.findIndex((i) => i.to === pathname);
  const index = found === -1 ? NAV_ITEMS.length : found;
  const prev = useRef(index);
  const direction = index >= prev.current ? 'slide-from-right' : 'slide-from-left';

  useEffect(() => {
    prev.current = index;
    document.title = `${TITLES[pathname] ?? 'Wellness Tracker'} – Wellness Tracker (Output C)`;
  }, [index, pathname]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col">
      <main key={pathname} className={`flex-1 px-4 pb-32 pt-6 ${index === prev.current ? '' : direction}`}>
        <Outlet />
      </main>
      <NavBar />
    </div>
  );
}
