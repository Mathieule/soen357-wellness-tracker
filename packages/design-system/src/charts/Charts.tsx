/**
 * Data charts drawn in SVG so they match the design system exactly.
 * Shared interaction model (BarsChart, TrendChart):
 *  - hover / touch shows a value bubble for the column under the pointer;
 *  - the chart is one tab stop; ← / → move the highlighted column, and the
 *    value is announced through a live region;
 *  - a visually hidden table gives every value to screen readers (AR14).
 * Single series per chart, so no legend box: the card title names it and a
 * dashed line marks the goal (labelled under the chart).
 */
import { useId, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '../cn';

export interface Point {
  label: string; // short axis label, e.g. "Mon"
  longLabel: string; // full label for tooltip / table
  value: number;
  /** Optional state shown by fill style (planned bars are outlined). */
  state?: 'done' | 'planned' | 'today' | 'future';
}

const fmt = (v: number) => v.toLocaleString('en-CA');

function useActive(n: number, initial = n - 1) {
  const [active, setActive] = useState<number | null>(null);
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    setActive((a) => {
      const cur = a ?? initial;
      return Math.max(0, Math.min(n - 1, cur + (e.key === 'ArrowRight' ? 1 : -1)));
    });
  };
  return { active, setActive, onKeyDown };
}

function niceMax(v: number) {
  if (v <= 0) return 10;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  const step = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((s) => n <= s) ?? 10;
  return step * p;
}
const tick = (v: number) => (v >= 1000 ? `${+(v / 1000).toFixed(1)}k` : String(Math.round(v)));

function ChartShell({ title, unit, points, active, onKeyDown, children, goal, footnote }: { title: string; unit: string; points: Point[]; active: number | null; onKeyDown: (e: KeyboardEvent) => void; children: ReactNode; goal?: number; footnote?: ReactNode }) {
  const id = useId();
  const a = active !== null ? points[active] : null;
  return (
    <figure className="m-0">
      <div
        tabIndex={0}
        role="group"
        aria-label={`${title} chart. Use left and right arrow keys to read each value.`}
        aria-describedby={`${id}-live`}
        onKeyDown={onKeyDown}
        className="rounded-xl"
      >
        {children}
      </div>
      <p id={`${id}-live`} aria-live="polite" className="sr-only">
        {a ? `${a.longLabel}: ${fmt(a.value)} ${unit}` : ''}
      </p>
      {(goal !== undefined || footnote) && (
        <figcaption className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-ink-soft">
          {goal !== undefined && (
            <span className="flex items-center gap-2">
              <span aria-hidden="true" className="inline-block w-6 border-t-2 border-dashed border-ink/70" />
              Goal {fmt(goal)} {unit}
            </span>
          )}
          {footnote}
        </figcaption>
      )}
      <table className="sr-only">
        <caption>{title}</caption>
        <tbody>
          {points.map((p) => (
            <tr key={p.longLabel}>
              <th scope="row">{p.longLabel}</th>
              <td>
                {fmt(p.value)} {unit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

/** Bubble placed above the active column. */
function Bubble({ x, y, text, width }: { x: number; y: number; text: string; width: number }) {
  const w = Math.max(64, text.length * 8.6 + 20);
  const left = Math.max(0, Math.min(width - w, x - w / 2));
  return (
    <g aria-hidden="true" pointerEvents="none">
      <rect x={left} y={Math.max(0, y - 40)} width={w} height={30} rx={15} fill="var(--color-ink)" />
      <text x={left + w / 2} y={Math.max(0, y - 40) + 20} textAnchor="middle" fontSize={16} fontWeight={700} fill="var(--color-on-ink)" fontFamily="Arial">
        {text}
      </text>
    </g>
  );
}

export function BarsChart({ points, accent, unit, title, goal, height = 190, footnote }: { points: Point[]; accent: string; unit: string; title: string; goal?: number; height?: number; footnote?: ReactNode }) {
  const W = 340;
  const padL = 40;
  const padB = 28;
  const padT = 44;
  const plotH = height - padB - padT;
  const max = niceMax(Math.max(goal ?? 0, ...points.map((p) => p.value)) * 1.05);
  const colW = (W - padL) / points.length;
  const barW = Math.min(30, colW * 0.56);
  const y = (v: number) => padT + plotH - (v / max) * plotH;
  const { active, setActive, onKeyDown } = useActive(points.length);
  return (
    <ChartShell title={title} unit={unit} points={points} active={active} onKeyDown={onKeyDown} goal={goal} footnote={footnote}>
      <svg viewBox={`0 0 ${W} ${height}`} className="block h-auto w-full touch-pan-y" aria-hidden="true" onPointerLeave={() => setActive(null)}>
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <line x1={padL} x2={W} y1={y(max * f)} y2={y(max * f)} stroke="var(--color-ink)" strokeOpacity={0.08} />
            <text x={padL - 8} y={y(max * f) + 5} textAnchor="end" fontSize={16} fill="var(--color-ink-soft)" fontFamily="Arial">
              {tick(max * f)}
            </text>
          </g>
        ))}
        {goal !== undefined && <line x1={padL} x2={W} y1={y(goal)} y2={y(goal)} stroke="var(--color-ink)" strokeOpacity={0.7} strokeDasharray="6 5" strokeWidth={1.5} />}
        {points.map((p, i) => {
          const cx = padL + colW * i + colW / 2;
          const h = Math.max(p.value > 0 ? 4 : 0, (p.value / max) * plotH);
          const planned = p.state === 'planned' || p.state === 'future';
          const isActive = active === i;
          return (
            <g key={p.longLabel} onPointerEnter={() => setActive(i)} onPointerDown={() => setActive(i)}>
              <rect x={padL + colW * i} y={padT - 10} width={colW} height={plotH + 10} fill={isActive ? 'var(--color-ink)' : 'transparent'} fillOpacity={isActive ? 0.06 : 0} rx={10} />
              {planned ? (
                <rect x={cx - barW / 2 + 1} y={y(p.value) + 1} width={barW - 2} height={Math.max(0, h - 2)} rx={6} fill="none" stroke={accent} strokeWidth={2} strokeDasharray="4 3" />
              ) : (
                <rect className="anim-bar" style={{ animationDelay: `${i * 40}ms` }} x={cx - barW / 2} y={y(p.value)} width={barW} height={h} rx={6} fill={accent} fillOpacity={isActive || active === null ? 1 : 0.55} />
              )}
              <text x={cx} y={height - 6} textAnchor="middle" fontSize={16} fill="var(--color-ink)" fontWeight={p.state === 'today' ? 700 : 400} fontFamily="Arial">
                {p.label}
              </text>
            </g>
          );
        })}
        {active !== null && <Bubble x={padL + colW * active + colW / 2} y={y(points[active].value)} text={`${fmt(points[active].value)} ${unit}`} width={W} />}
      </svg>
    </ChartShell>
  );
}

/** Smooth area line with a highlighted point and band (fitness-ui-mobile inspired). */
export function TrendChart({ points, accent, unit, title, goal, height = 200, footnote }: { points: Point[]; accent: string; unit: string; title: string; goal?: number; height?: number; footnote?: ReactNode }) {
  const W = 340;
  const padL = 44;
  const padR = 26;
  const padB = 28;
  const padT = 46;
  const plotH = height - padB - padT;
  const max = niceMax(Math.max(goal ?? 0, ...points.map((p) => p.value)) * 1.05);
  const step = (W - padL - padR - 6) / Math.max(1, points.length - 1);
  const xs = points.map((_, i) => padL + 6 + i * step);
  const ys = points.map((p) => padT + plotH - (p.value / max) * plotH);
  const gradId = useId().replace(/:/g, '');
  const { active, setActive, onKeyDown } = useActive(points.length);
  // Catmull-Rom → Bézier for a smooth curve.
  let d = `M ${xs[0]} ${ys[0]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const x0 = xs[i - 1] ?? xs[i];
    const y0 = ys[i - 1] ?? ys[i];
    const x3 = xs[i + 2] ?? xs[i + 1];
    const y3 = ys[i + 2] ?? ys[i + 1];
    const c1x = xs[i] + (xs[i + 1] - x0) / 6;
    const c1y = ys[i] + (ys[i + 1] - y0) / 6;
    const c2x = xs[i + 1] - (x3 - xs[i]) / 6;
    const c2y = ys[i + 1] - (y3 - ys[i]) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${xs[i + 1]} ${ys[i + 1]}`;
  }
  const area = `${d} L ${xs[xs.length - 1]} ${padT + plotH} L ${xs[0]} ${padT + plotH} Z`;
  const shown = active ?? points.length - 1;
  const labelEvery = points.length > 8 ? Math.ceil(points.length / 6) : 1;
  return (
    <ChartShell title={title} unit={unit} points={points} active={active} onKeyDown={onKeyDown} goal={goal} footnote={footnote}>
      <svg viewBox={`0 0 ${W} ${height}`} className="block h-auto w-full touch-pan-y" aria-hidden="true" onPointerLeave={() => setActive(null)}>
        <defs>
          <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity={0.35} />
            <stop offset="100%" stopColor={accent} stopOpacity={0} />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <line x1={padL} x2={W} y1={padT + plotH - f * plotH} y2={padT + plotH - f * plotH} stroke="var(--color-ink)" strokeOpacity={0.08} />
            <text x={padL - 8} y={padT + plotH - f * plotH + 5} textAnchor="end" fontSize={16} fill="var(--color-ink-soft)" fontFamily="Arial">
              {tick(max * f)}
            </text>
          </g>
        ))}
        {goal !== undefined && <line x1={padL} x2={W} y1={padT + plotH - (goal / max) * plotH} y2={padT + plotH - (goal / max) * plotH} stroke="var(--color-ink)" strokeOpacity={0.7} strokeDasharray="6 5" strokeWidth={1.5} />}
        <rect x={xs[shown] - 14} y={padT - 8} width={28} height={plotH + 8} rx={10} fill="var(--color-ink)" fillOpacity={0.07} />
        <path d={area} fill={`url(#${gradId})`} />
        <path d={d} fill="none" stroke={accent} strokeWidth={2.5} strokeLinecap="round" />
        {points.map((p, i) => (
          <g key={p.longLabel}>
            <rect x={xs[i] - step / 2} y={0} width={step} height={height} fill="transparent" onPointerEnter={() => setActive(i)} onPointerDown={() => setActive(i)} />
            {i % labelEvery === 0 || i === points.length - 1 ? (
              <text x={xs[i]} y={height - 6} textAnchor="middle" fontSize={16} fill="var(--color-ink)" fontFamily="Arial">
                {p.label}
              </text>
            ) : null}
          </g>
        ))}
        <circle cx={xs[shown]} cy={ys[shown]} r={7} fill="var(--color-ground)" stroke={accent} strokeWidth={3} />
        <Bubble x={xs[shown]} y={ys[shown]} text={`${fmt(points[shown].value)} ${unit}`} width={W} />
      </svg>
    </ChartShell>
  );
}

export type Stage = 'Awake' | 'REM' | 'Light' | 'Deep';
export const STAGE_ORDER: Stage[] = ['Awake', 'REM', 'Light', 'Deep'];
export const STAGE_COLOR: Record<Stage, string> = { Awake: '#F2F0EF', REM: '#C9E2FF', Light: '#9CCBFF', Deep: '#7FB3F0' };

/** Sleep stages through the night: one row per stage, blocks in shades of blue (C17). */
export function Hypnogram({ stages, durationMin, bedtime, height = 168 }: { stages: { minute: number; stage: Stage }[]; durationMin: number; bedtime: string; height?: number }) {
  const W = 340;
  const padL = 64;
  const padB = 26;
  const rowH = (height - padB) / 4;
  const x = (m: number) => padL + (m / durationMin) * (W - padL - 4);
  const clock = (m: number) => {
    const [h, mm] = bedtime.split(':').map(Number);
    const t = (h * 60 + mm + m) % 1440;
    return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
  };
  // Ticks on even round hours (00:00, 02:00, …), kept clear of the edges.
  const [bh, bm] = bedtime.split(':').map(Number);
  let first = (60 - bm) % 60;
  if ((bh + (bm > 0 ? 1 : 0)) % 2 !== 0) first += 60;
  const ticks: number[] = [];
  for (let m = first; m <= durationMin; m += 120) if (x(m) > padL + 22 && x(m) < W - 24) ticks.push(m);
  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="block h-auto w-full" aria-hidden="true">
      {STAGE_ORDER.map((s, i) => (
        <g key={s}>
          <rect x={padL} y={i * rowH + 2} width={W - padL - 4} height={rowH - 4} rx={6} fill="var(--color-ink)" fillOpacity={0.04} />
          <text x={padL - 10} y={i * rowH + rowH / 2 + 5} textAnchor="end" fontSize={16} fill="var(--color-ink)" fontFamily="Arial">
            {s}
          </text>
        </g>
      ))}
      {stages.slice(0, -1).map((p, i) => {
        const next = stages[i + 1].minute;
        const row = STAGE_ORDER.indexOf(p.stage);
        return <rect key={i} x={x(p.minute)} y={row * rowH + 4} width={Math.max(1.5, x(next) - x(p.minute) - 0.5)} height={rowH - 8} rx={3} fill={STAGE_COLOR[p.stage]} />;
      })}
      {ticks.map((m) => (
        <text key={m} x={x(m)} y={height - 4} textAnchor="middle" fontSize={16} fill="var(--color-ink-soft)" fontFamily="Arial">
          {clock(m)}
        </text>
      ))}
    </svg>
  );
}

/** Horizontal stacked bar of stage minutes with written values underneath. */
export function StageBar({ totals }: { totals: Record<Stage, number> }) {
  const sum = STAGE_ORDER.reduce((s, k) => s + totals[k], 0) || 1;
  const order: Stage[] = ['Deep', 'Light', 'REM', 'Awake'];
  return (
    <div>
      <div aria-hidden="true" className="flex h-3 gap-[3px] overflow-hidden rounded-full">
        {order.map((k) => (
          <span key={k} className="anim-grow-x block h-full first:rounded-l-full last:rounded-r-full" style={{ flex: totals[k] / sum, background: STAGE_COLOR[k] }} />
        ))}
      </div>
      <ul className="m-0 mt-3 grid list-none grid-cols-2 gap-x-4 gap-y-2 p-0">
        {order.map((k) => (
          <li key={k} className="flex items-center gap-2">
            <span aria-hidden="true" className={cn('inline-block size-3 rounded-full')} style={{ background: STAGE_COLOR[k] }} />
            <span>
              {k} <strong>{Math.round((totals[k] / sum) * 100)}%</strong>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
