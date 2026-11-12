/**
 * Large page label. Task 2 ("Labels"): the page opened from a widget shows the
 * same label as the widget, in a large font, at the top.
 */
import type { ReactNode } from 'react';

export function PageTitle({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return (
    <h1 className="m-0 flex items-center gap-3 text-3xl font-bold">
      {icon}
      {children}
    </h1>
  );
}

/** Card-like section with a heading. */
export function Section({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) {
  const id = `sec-${title.toLowerCase().replace(/[^a-z]+/g, '-')}`;
  return (
    <section aria-labelledby={id} className={`rounded-[var(--radius-card)] bg-raised p-4 ${className}`}>
      <h2 id={id} className="m-0 text-xl font-bold">
        {title}
      </h2>
      {children}
    </section>
  );
}
