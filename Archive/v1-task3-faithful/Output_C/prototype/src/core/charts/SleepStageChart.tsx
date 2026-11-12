/**
 * Sleep quality graph (Task 3, C17): a line graph of the sleep stages through
 * the night, drawn in shades of blue. A single series, so no legend box: the
 * stage names are written on the y axis and the minutes per stage are listed
 * as text under the graph (never colour alone, AR1). A text summary is also
 * given to screen readers.
 */
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { stageTotals } from '../data/sample';
import type { SleepSession, SleepStage } from '../data/types';
import { formatDuration } from '../lib/dates';

const STAGE_ORDER: SleepStage[] = ['Deep', 'Light', 'REM', 'Awake'];
const STAGE_SHADE: Record<SleepStage, string> = {
  Deep: '#7FB3F0',
  Light: '#9CCBFF',
  REM: '#C9E2FF',
  Awake: '#F2F0EF',
};

function clock(bedtime: string, minute: number) {
  const [h, m] = bedtime.split(':').map(Number);
  const t = (h * 60 + m + minute) % (24 * 60);
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}

export function sleepSummary(session: SleepSession): string {
  const totals = stageTotals(session);
  return `Slept ${formatDuration(session.durationMin)}, from ${session.bedtime} to ${session.wakeTime}. ${STAGE_ORDER.map(
    (s) => `${s}: ${formatDuration(totals[s])}`,
  ).join(', ')}.`;
}

export function SleepStageChart({ session, height = 200 }: { session: SleepSession; height?: number }) {
  const data = session.stages.map((p) => ({ minute: p.minute, level: STAGE_ORDER.indexOf(p.stage), stage: p.stage }));
  const totals = stageTotals(session);
  const hourTicks: number[] = [];
  for (let m = 60; m < session.durationMin; m += 120) hourTicks.push(m);

  return (
    <figure className="m-0">
      <p className="sr-only">{sleepSummary(session)}</p>
      <div aria-hidden="true" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="#F2F0EF" strokeOpacity={0.15} vertical={false} />
            <XAxis
              dataKey="minute"
              type="number"
              domain={[0, session.durationMin]}
              ticks={hourTicks}
              tickFormatter={(m: number) => clock(session.bedtime, m)}
              tick={{ fill: '#F2F0EF', fontSize: 16 }}
              stroke="#BDB5B3"
            />
            <YAxis
              dataKey="level"
              type="number"
              domain={[0, 3]}
              ticks={[0, 1, 2, 3]}
              tickFormatter={(v: number) => STAGE_ORDER[v] ?? ''}
              tick={{ fill: '#F2F0EF', fontSize: 16 }}
              width={62}
              stroke="#BDB5B3"
            />
            <Tooltip
              cursor={{ stroke: '#F2F0EF', strokeOpacity: 0.5 }}
              contentStyle={{ background: '#4E4747', border: '2px solid #BDB5B3', borderRadius: 12, color: '#F2F0EF', fontSize: 16 }}
              labelFormatter={(m) => clock(session.bedtime, Number(m))}
              formatter={(_v, _n, item) => [String((item as { payload: { stage: string } }).payload.stage), 'Stage']}
            />
            <Line type="stepAfter" dataKey="level" stroke="#9CCBFF" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <figcaption>
        <ul className="m-0 mt-3 grid list-none grid-cols-2 gap-2 p-0">
          {STAGE_ORDER.map((s) => (
            <li key={s} className="flex items-center gap-2 text-base">
              <span aria-hidden="true" className="inline-block h-3 w-6 rounded-sm" style={{ background: STAGE_SHADE[s] }} />
              {s}: {formatDuration(totals[s])}
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}
