/**
 * Icons and category identity. Lucide icons (as in the shadcn template) plus a
 * custom "Zzz" sleep mark. Category colour is always paired with a written
 * name somewhere next to the icon (AR1), so icons are decorative here.
 */
import { Dumbbell, Footprints, Soup, type LucideIcon } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { cn } from '../cn';

export function ZzzIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={24} height={24} {...props}>
      <path d="M3 11h6l-6 8h6" />
      <path d="M12 5h5l-5 6h5" />
      <path d="M18 2h3l-3 4h3" />
    </svg>
  );
}

export type Category = 'fitness' | 'nutrition' | 'sleep';
type Icon = LucideIcon | ComponentType<SVGProps<SVGSVGElement>>;

export const CATEGORY: Record<Category, { name: string; accent: string; tint: string; deep: string; hero: string; Icon: Icon }> = {
  fitness: { name: 'Training', accent: 'var(--color-act)', tint: 'bg-act-tint', deep: 'bg-act-deep', hero: 'hero-act', Icon: Dumbbell },
  nutrition: { name: 'Nutrition', accent: 'var(--color-food)', tint: 'bg-food-tint', deep: 'bg-food-deep', hero: 'hero-food', Icon: Soup },
  sleep: { name: 'Sleep', accent: 'var(--color-sleep)', tint: 'bg-sleep-tint', deep: 'bg-sleep-deep', hero: 'hero-sleep', Icon: ZzzIcon },
};

export const StepsIcon = Footprints;

/** Category icon in a tinted circle (decorative). */
export function CategoryBadge({ category, size = 40, className }: { category: Category; size?: number; className?: string }) {
  const c = CATEGORY[category];
  return (
    <span aria-hidden="true" className={cn('inline-flex shrink-0 items-center justify-center rounded-full', c.tint, className)} style={{ width: size, height: size }}>
      <c.Icon style={{ color: c.accent, width: size * 0.52, height: size * 0.52 }} strokeWidth={2.2} />
    </span>
  );
}

/** Initials avatar exposed as an image with alt text (AR6). */
export function Avatar({ name, size = 72 }: { name: string; size?: number }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
  return (
    <span
      role="img"
      aria-label={`Profile picture of ${name}`}
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sleep-deep to-act-deep font-bold text-ink"
      style={{ width: size, height: size, fontSize: Math.max(16, size / 2.6) }}
    >
      <span aria-hidden="true">{initials}</span>
    </span>
  );
}

/** App mark: three arcs in the category colours (decorative). */
export function BrandMark({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" aria-hidden="true">
      <circle cx="28" cy="28" r="24" fill="none" stroke="var(--color-act)" strokeWidth="5" strokeLinecap="round" strokeDasharray="44 151" transform="rotate(-90 28 28)" />
      <circle cx="28" cy="28" r="24" fill="none" stroke="var(--color-food)" strokeWidth="5" strokeLinecap="round" strokeDasharray="38 151" transform="rotate(30 28 28)" />
      <circle cx="28" cy="28" r="24" fill="none" stroke="var(--color-sleep)" strokeWidth="5" strokeLinecap="round" strokeDasharray="38 151" transform="rotate(150 28 28)" />
      <circle cx="28" cy="28" r="7" fill="var(--color-ink)" />
    </svg>
  );
}
