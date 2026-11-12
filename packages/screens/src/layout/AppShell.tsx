/**
 * Signed-in layout.
 *  - Phones: content + bottom navigation bar (Task 3 C5).
 *  - From 1024 px: a side navigation rail replaces the bottom bar.
 * Navigation items come from the personalization engine:
 *   Output A: Home, Fitness, Nutrition, Profile (settings live in the bar)
 *   Output B: Home, Fitness, Nutrition, Sleep (Settings = top-right button)
 *   Output C: Home + the categories the user chose + "More" for the others
 * Pages slide in from the side of the new tab (C5); reduced motion removes it.
 */
import { Dumbbell, House, LayoutGrid, Settings, Soup, UserRound } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { useUser, type NavId } from '@core';
import { BrandMark, CATEGORY, cn, Sheet, ZzzIcon, type Category } from '@ds';
import { navArrowKeys } from '../lib/focus';

const PATH: Record<Category, string> = { fitness: '/fitness', nutrition: '/nutrition', sleep: '/sleep' };
export const PAGE_TITLE: Record<Category, string> = { fitness: 'Fitness Metrics', nutrition: 'Nutrition Metrics', sleep: 'Sleep Metrics' };

export function useNavItems() {
  const { experience, iteration } = useUser();
  return experience.nav.map((id: NavId) => {
    if (id === 'home') return { id, to: '/', label: 'Home', Icon: House };
    if (id === 'fitness') return { id, to: '/fitness', label: 'Fitness', Icon: Dumbbell };
    if (id === 'nutrition') return { id, to: '/nutrition', label: 'Nutrition', Icon: Soup };
    if (id === 'sleep') return { id, to: '/sleep', label: 'Sleep', Icon: ZzzIcon };
    if (id === 'settings') return { id, to: '/settings', label: iteration.settingsInNav ? 'Profile' : 'Settings', Icon: UserRound };
    return { id, to: '', label: 'More', Icon: LayoutGrid };
  });
}

const TITLES: Record<string, string> = { '/': 'Home', '/fitness': 'Fitness Metrics', '/nutrition': 'Nutrition Metrics', '/sleep': 'Sleep Metrics', '/settings': 'Profile and settings' };

export function AppShell() {
  const { pathname } = useLocation();
  const { iteration } = useUser();
  const items = useNavItems();
  const [more, setMore] = useState(false);
  const order = [...items.map((i) => i.to), '/settings'];
  const index = Math.max(0, order.indexOf(pathname));
  const prev = useRef(index);
  const anim = index === prev.current ? '' : index > prev.current ? 'anim-slide-right' : 'anim-slide-left';
  useEffect(() => {
    prev.current = index;
    document.title = `${TITLES[pathname] ?? 'Wellness Tracker'} · Wellness Tracker (${iteration.name})`;
    window.scrollTo(0, 0);
  }, [index, pathname, iteration.name]);

  return (
    <div className="min-h-dvh lg:flex">
      <SideNav items={items} onMore={() => setMore(true)} />
      <div className="min-w-0 flex-1">
        <main key={pathname} className={cn('mx-auto w-full max-w-[560px] px-4 pb-36 pt-[max(20px,env(safe-area-inset-top))] lg:max-w-[1040px] lg:px-10 lg:pb-16 lg:pt-10', anim)}>
          <Outlet />
        </main>
      </div>
      <BottomNav items={items} onMore={() => setMore(true)} />
      <MoreSheet open={more} onOpenChange={setMore} />
    </div>
  );
}

type Item = ReturnType<typeof useNavItems>[number];

function BottomNav({ items, onMore }: { items: Item[]; onMore: () => void }) {
  const { iteration } = useUser();
  return (
    <nav aria-label="Main menu" onKeyDown={iteration.keyboardRules ? navArrowKeys : undefined} className="fixed inset-x-0 bottom-0 z-40 border-t border-hair bg-sunken/95 pb-[max(8px,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
      <ul className="mx-auto flex max-w-[560px] list-none p-0 px-2 pt-2">
        {items.map((it) => (
          <li key={it.id} className="flex-1">
            {it.id === 'more' ? (
              <button type="button" data-nav-item onClick={onMore} className="mx-auto flex min-h-16 w-full max-w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl bg-transparent text-base text-ink">
                <span aria-hidden="true" className="flex h-8 w-14 items-center justify-center rounded-full">
                  <it.Icon className="size-6" />
                </span>
                {it.label}
              </button>
            ) : (
              <NavLink to={it.to} end state={{ via: 'nav' }} data-nav-item className={({ isActive }) => cn('mx-auto flex min-h-16 w-full max-w-24 flex-col items-center justify-center gap-1 rounded-2xl text-base text-ink no-underline', isActive && 'font-bold')}>
                {({ isActive }) => (
                  <>
                    <span aria-hidden="true" className={cn('flex h-8 w-14 items-center justify-center rounded-full transition-colors', isActive && 'bg-ink text-on-ink')}>
                      <it.Icon className="size-6" strokeWidth={isActive ? 2.4 : 2} />
                    </span>
                    <span className={cn(isActive && 'underline decoration-2 underline-offset-4')}>{it.label}</span>
                  </>
                )}
              </NavLink>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

function SideNav({ items, onMore }: { items: Item[]; onMore: () => void }) {
  const { user, iteration } = useUser();
  return (
    <nav aria-label="Main menu" onKeyDown={iteration.keyboardRules ? navArrowKeys : undefined} className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-2 border-r border-hair bg-sunken px-4 py-8 lg:flex">
      <div className="mb-6 flex items-center gap-3 px-2">
        <BrandMark size={40} />
        <span className="text-lg font-bold">Wellness Tracker</span>
      </div>
      {items.map((it) =>
        it.id === 'more' ? (
          <button key={it.id} type="button" data-nav-item onClick={onMore} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-full bg-transparent px-4 text-base text-ink hover:bg-surface">
            <it.Icon aria-hidden="true" className="size-5" /> {it.label}
          </button>
        ) : (
          <NavLink key={it.id} to={it.to} end state={{ via: 'nav' }} data-nav-item className={({ isActive }) => cn('flex min-h-12 items-center gap-3 rounded-full px-4 text-base text-ink no-underline', isActive ? 'bg-ink font-bold text-on-ink' : 'hover:bg-surface')}>
            <it.Icon aria-hidden="true" className="size-5" /> {it.label}
          </NavLink>
        ),
      )}
      {!iteration.settingsInNav && (
        <NavLink to="/settings" className={({ isActive }) => cn('mt-auto flex min-h-12 items-center gap-3 rounded-full px-4 text-base text-ink no-underline', isActive ? 'bg-ink font-bold text-on-ink' : 'hover:bg-surface')}>
          <Settings aria-hidden="true" className="size-5" /> Settings
        </NavLink>
      )}
      <p className={cn('m-0 px-4 text-ink-soft', iteration.settingsInNav && 'mt-auto')}>
        {user.profile.name} · {iteration.name}
      </p>
    </nav>
  );
}

/** "More" tab (Output C): categories the user did not mark as important stay one tap away. */
function MoreSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { experience } = useUser();
  const navigate = useNavigate();
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="More" description="Sections you did not mark as important. You can change this in Settings.">
      <ul className="m-0 grid list-none gap-3 p-0">
        {experience.more.map((c: Category) => {
          const C = CATEGORY[c];
          return (
            <li key={c}>
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  navigate(PATH[c], { state: { via: 'widget' } });
                }}
                className={cn('flex min-h-16 w-full cursor-pointer items-center gap-4 rounded-[18px] px-4 text-left text-lg font-bold text-ink', C.hero)}
              >
                <C.Icon aria-hidden="true" className="size-6" style={{ color: C.accent }} /> {PAGE_TITLE[c]}
              </button>
            </li>
          );
        })}
      </ul>
    </Sheet>
  );
}
