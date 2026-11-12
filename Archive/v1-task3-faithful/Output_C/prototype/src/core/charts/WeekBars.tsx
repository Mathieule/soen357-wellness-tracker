/**
 * Seven-day bar chart (one series) with a dashed goal line.
 * Follows the project dataviz rules: thin bars with rounded tops anchored to
 * the baseline, recessive grid, one colour for the single series (no legend
 * needed, the card title names it), a tooltip on hover/touch, and the same
 * numbers available as a screen-reader table.
 */
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export interface DayValue {
  label: string; // "Mon"
  longLabel: string; // "Monday, Nov 9"
  value: number;
  isToday?: boolean;
}

export function WeekBars({ data, goal, accent, unit, caption, height = 180 }: { data: DayValue[]; goal?: number; accent: string; unit: string; caption: string; height?: number }) {
  const fmt = (v: number) => v.toLocaleString('en-CA');
  // Scale includes the goal so the goal line is always visible.
  const max = Math.max(goal ?? 0, ...data.map((d) => d.value)) * 1.1;
  const tick = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : String(v));
  return (
    <figure className="m-0">
      <div aria-hidden="true" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -8 }} barCategoryGap="28%">
            <CartesianGrid stroke="#F2F0EF" strokeOpacity={0.1} vertical={false} />
            <XAxis dataKey="label" tick={{ fill: '#F2F0EF', fontSize: 16 }} axisLine={{ stroke: '#BDB5B3' }} tickLine={false} />
            <YAxis domain={[0, max]} tickCount={4} allowDecimals={false} tick={{ fill: '#F2F0EF', fontSize: 16 }} axisLine={false} tickLine={false} width={52} tickFormatter={tick} />
            <Tooltip
              cursor={{ fill: '#F2F0EF', fillOpacity: 0.06 }}
              contentStyle={{ background: '#4E4747', border: '2px solid #BDB5B3', borderRadius: 12, color: '#F2F0EF', fontSize: 16 }}
              labelFormatter={(_l, p) => (p?.[0]?.payload as DayValue | undefined)?.longLabel ?? ''}
              formatter={(v) => [`${fmt(Number(v))} ${unit}`, '']}
              separator=""
            />
            {goal !== undefined && <ReferenceLine y={goal} stroke="#F2F0EF" strokeDasharray="6 4" strokeOpacity={0.7} />}
            <Bar dataKey="value" fill={accent} radius={[4, 4, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {goal !== undefined && (
        <figcaption className="mt-2 flex items-center gap-2">
          <span aria-hidden="true" className="inline-block w-6 border-t-2 border-dashed border-ink/70" /> Goal: {fmt(goal)} {unit}
        </figcaption>
      )}
      <table className="sr-only">
        <caption>{caption}</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.longLabel}>
              <th scope="row">{d.longLabel}</th>
              <td>
                {fmt(d.value)} {unit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
