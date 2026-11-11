/**
 * Tiny vocabulary for low-fidelity wireframes. Every helper returns a plain
 * object; tools/lofi/build.mjs turns them into SVG. Coordinates are in the
 * 390 x 844 phone frame (the primary design viewport).
 *
 * Common options on any element:
 *   id      – name used by later iterations to replace / remove the element
 *   to      – destination screen; drawn as a navigation arrow in the margin
 *   changed – highlighted as "changed in this iteration" (dashed outline)
 *   note    – short annotation drawn in the margin
 */
export const W = 390;
export const H = 844;

export const box = (x, y, w, h, label = '', o = {}) => ({ type: 'box', x, y, w, h, label, ...o });
export const text = (x, y, label, o = {}) => ({ type: 'text', x, y, label, ...o });
export const title = (label, o = {}) => text(16, 52, label, { size: 26, bold: true, id: 'title', ...o });
export const btn = (x, y, w, h, label, o = {}) => ({ type: 'btn', x, y, w, h, label, ...o });
export const input = (x, y, w, label, o = {}) => ({ type: 'input', x, y, w, label, ...o });
export const img = (x, y, w, h, label = 'image', o = {}) => ({ type: 'img', x, y, w, h, label, ...o });
export const chart = (x, y, w, h, label = 'graph', o = {}) => ({ type: 'chart', x, y, w, h, label, ...o });
export const hr = (y, o = {}) => ({ type: 'hr', x: 16, y, w: W - 32, ...o });
export const list = (x, y, w, rows, label, o = {}) => ({ type: 'list', x, y, w, rows, label, rowH: 52, ...o });
export const choice = (x, y, w, label, o = {}) => ({ type: 'choice', x, y, w, h: 52, label, ...o });
export const error = (x, y, w, label, o = {}) => ({ type: 'msg', x, y, w, h: 48, label: `(!) Error: ${label}`, ...o });
export const success = (x, y, w, label, o = {}) => ({ type: 'msg', x, y, w, h: 48, label: `(ok) Success: ${label}`, ...o });

/** Pop-up window drawn over a dimmed screen. */
export const dialog = (y, h, label, children, o = {}) => ({ type: 'dialog', x: 16, y, w: W - 32, h, label, children, ...o });

/** Bottom navigation bar. items: [{ label, to }] */
export const nav = (items, active, o = {}) => ({ type: 'nav', items, active, id: 'nav', ...o });
