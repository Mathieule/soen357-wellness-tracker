/**
 * Output B keyboard focus rules (Output B changelog, last item):
 *  - A menu opened from a dashboard widget puts focus on its main action
 *    (Add exercise / Add or edit sleep / Add food).
 *  - A menu opened from the navigation bar leaves focus on the navigation bar,
 *    so the user can keep moving between menus.
 *  - On the main action button, pressing Arrow Up moves focus to the
 *    navigation bar (the current menu's item).
 */
import { useEffect, type KeyboardEvent, type RefObject } from 'react';
import { useLocation } from 'react-router';

export type Via = 'nav' | 'widget';

export function useArrivedVia(): Via | undefined {
  return (useLocation().state as { via?: Via } | null)?.via;
}

/** Focuses `ref` on arrival, unless the page was opened from the navigation bar. */
export function useInitialFocus(ref: RefObject<HTMLElement | null>) {
  const via = useArrivedVia();
  useEffect(() => {
    if (via !== 'nav') ref.current?.focus();
    // Only on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function focusCurrentNavItem() {
  const current = document.querySelector<HTMLElement>('[data-nav-item][aria-current="page"]');
  (current ?? document.querySelector<HTMLElement>('[data-nav-item]'))?.focus();
}

/** onKeyDown handler: Arrow Up -> navigation bar. */
export function arrowUpToNav(e: KeyboardEvent) {
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    focusCurrentNavItem();
  }
}
