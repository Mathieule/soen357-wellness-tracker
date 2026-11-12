/**
 * Keyboard focus rules (from Task 3 Output B, kept in C):
 *  - a page opened from a dashboard widget focuses its main action;
 *  - a page opened from the navigation bar keeps focus on the bar;
 *  - Arrow Up on a page's main action moves focus to the current nav item;
 *  - ← / → move along the navigation bar.
 */
import { useEffect, type KeyboardEvent, type RefObject } from 'react';
import { useLocation } from 'react-router';
import { useStore } from '@core';

export type Via = 'nav' | 'widget';

export function useInitialFocus(ref: RefObject<HTMLElement | null>) {
  const via = (useLocation().state as { via?: Via } | null)?.via;
  const { iteration } = useStore();
  useEffect(() => {
    // Output A (Task 3 C11/C15/C18): focus always starts on the main action.
    // Output B/C: only when opened from a widget; from the nav bar focus stays on the bar.
    if (iteration.keyboardRules ? via === 'widget' : true) ref.current?.focus();
    // On arrival only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** Main action of a section page: initial focus + (B/C) Arrow Up to the nav bar. */
export function useMainAction(ref: RefObject<HTMLElement | null>) {
  useInitialFocus(ref);
  const { iteration } = useStore();
  return iteration.keyboardRules ? arrowUpToNav : undefined;
}

export function focusCurrentNavItem() {
  const visible = [...document.querySelectorAll<HTMLElement>('[data-nav-item]')].filter((el) => el.offsetParent !== null);
  (visible.find((el) => el.getAttribute('aria-current') === 'page') ?? visible[0])?.focus();
}

export function arrowUpToNav(e: KeyboardEvent) {
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    focusCurrentNavItem();
  }
}

export function navArrowKeys(e: KeyboardEvent<HTMLElement>) {
  const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
  if (!keys.includes(e.key)) return;
  const items = [...e.currentTarget.querySelectorAll<HTMLElement>('[data-nav-item]')];
  const i = items.indexOf(document.activeElement as HTMLElement);
  if (i < 0) return;
  e.preventDefault();
  const forward = e.key === 'ArrowRight' || e.key === 'ArrowDown';
  items[(i + (forward ? 1 : -1) + items.length) % items.length].focus();
}
