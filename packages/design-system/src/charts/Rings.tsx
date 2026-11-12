/**
 * Circular indicators.
 *  - ProgressRing: full ring that fills to the goal.
 *  - ArcGauge: 270° gauge with tick marks (readiness, daily steps), inspired
 *    by the "My activity" arc of the fitness-ui-mobile reference.
 * Both are decorative (aria-hidden); the caller always writes the value and
 * the goal as text next to them, plus an sr-only percentage where useful.
 */
import type { ReactNode } from 'react';

export function ProgressRing({ value, goal, accent, size = 96, stroke = 10, children, track = 'var(--color-sunken)' }: { value: number; goal: number; accent: string; size?: number; stroke?: number; children?: ReactNode; track?: string }) {
  const r = (size - stroke) / 2;
  const len = 2 * Math.PI * r;
  const pct = goal > 0 ? Math.max(0, Math.min(value / goal, 1)) : 0;
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        {pct > 0 && (
          <circle
            className="anim-ring"
            style={{ ['--ring-len' as string]: `${len}` }}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={accent}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${len} ${len}`}
            strokeDashoffset={len * (1 - pct)}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        )}
      </svg>
      {children && <span className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</span>}
    </span>
  );
}

export function ArcGauge({ value, max, accent, size = 220, stroke = 16, children, ticks = 36 }: { value: number; max: number; accent: string; size?: number; stroke?: number; children?: ReactNode; ticks?: number }) {
  const r = (size - stroke) / 2 - 10;
  const c = size / 2;
  const sweep = 270;
  const arcLen = (2 * Math.PI * r * sweep) / 360;
  const pct = max > 0 ? Math.max(0, Math.min(value / max, 1)) : 0;
  // Start at 135° (bottom-left), go clockwise 270°.
  const start = 135;
  const polar = (deg: number, rad: number) => [c + rad * Math.cos((deg * Math.PI) / 180), c + rad * Math.sin((deg * Math.PI) / 180)];
  const [sx, sy] = polar(start, r);
  const [ex, ey] = polar(start + sweep, r);
  const d = `M ${sx} ${sy} A ${r} ${r} 0 1 1 ${ex} ${ey}`;
  const filledTicks = Math.round(pct * ticks);
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size * 0.86 }}>
      <svg width={size} height={size * 0.86} viewBox={`0 0 ${size} ${size * 0.86}`} aria-hidden="true">
        {/* Tick marks around the inside of the arc; the unfilled part stays visible as ticks. */}
        {Array.from({ length: ticks + 1 }, (_, i) => {
          const deg = start + (sweep * i) / ticks;
          const [x1, y1] = polar(deg, r - stroke / 2 - 7);
          const [x2, y2] = polar(deg, r - stroke / 2 - 13);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i < filledTicks ? accent : 'var(--color-ink)'} strokeOpacity={i < filledTicks ? 0.9 : 0.25} strokeWidth={2} strokeLinecap="round" />;
        })}
        <path d={d} fill="none" stroke="var(--color-sunken)" strokeWidth={stroke} strokeLinecap="round" />
        {pct > 0 && (
          <path
            className="anim-ring"
            style={{ ['--ring-len' as string]: `${arcLen}` }}
            d={d}
            fill="none"
            stroke={accent}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${arcLen} ${arcLen}`}
            strokeDashoffset={arcLen * (1 - pct)}
          />
        )}
      </svg>
      {children && <span className="absolute inset-0 flex flex-col items-center justify-center pb-4 text-center">{children}</span>}
    </span>
  );
}
