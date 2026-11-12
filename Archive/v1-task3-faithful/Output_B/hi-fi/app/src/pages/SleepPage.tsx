/**
 * C15 Sleep menu (Output B). Graph of last night's sleep (C17) at the top,
 * the "Add or edit sleep" button, then the sleep log (C16).
 * Output B: back button top-left, Settings top-right; Arrow Up on the main
 * action moves focus to the navigation bar.
 * Keyboard focus starts on the add sleep button, then goes through the log.
 */
import { ChevronRight, Plus } from 'lucide-react';
import { useRef, useState } from 'react';
import { SleepStageChart } from '@shared/charts/SleepStageChart';
import { useUser } from '@shared/data/appData';
import { sortedSleep } from '@shared/data/selectors';
import type { SleepSession } from '@shared/data/types';
import { ZzzIcon } from '@shared/icons/ZzzIcon';
import { formatDay, formatDuration } from '@shared/lib/dates';
import { Button } from '@shared/ui/button';
import { StatusMessage } from '@shared/ui/status';
import { Section } from '@/components/PageTitle';
import { TopBar } from '@/components/TopBar';
import { arrowUpToNav, useInitialFocus } from '@/lib/focus';
import { SleepDetailDialog, SleepFormDialog } from '@/components/SleepDialogs';

export function SleepPage() {
  const { user, saveSleep } = useUser();
  const addRef = useRef<HTMLButtonElement>(null);
  const log = sortedSleep(user);
  const last = log[0];
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SleepSession | null>(null);
  const [detail, setDetail] = useState<SleepSession | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  // B: focus the main action only when opened from a widget (see lib/focus.ts).
  useInitialFocus(addRef);

  return (
    <>
      <TopBar back title="Sleep Metrics" icon={<ZzzIcon aria-hidden="true" className="size-7" />} />

      <Section title="Last night" className="mt-5">
        {last ? (
          <>
            <p className="m-0 mt-1">
              <span className="text-2xl font-bold">{formatDuration(last.durationMin)}</span> · {last.bedtime} to {last.wakeTime}
            </p>
            <div className="mt-3">
              <SleepStageChart session={last} />
            </div>
          </>
        ) : (
          <p className="m-0 mt-2">No sleep recorded yet.</p>
        )}
      </Section>

      <Button
        ref={addRef}
        onKeyDown={arrowUpToNav}
        size="block"
        className="mt-5"
        onClick={() => {
          setEditing(null);
          setFormOpen(true);
        }}
      >
        <Plus aria-hidden="true" /> Add or edit sleep
      </Button>
      {status && (
        <StatusMessage kind="success" onDismiss={() => setStatus(null)} className="mt-3">
          {status}
        </StatusMessage>
      )}

      <section aria-labelledby="sleep-log-title" className="mt-6">
        <h2 id="sleep-log-title" className="m-0 text-xl font-bold">
          Sleep log
        </h2>
        <ul className="m-0 mt-3 flex list-none flex-col gap-3 p-0">
          {log.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setDetail(s)}
                className="flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-xl border-2 border-transparent bg-raised px-4 py-3 text-left text-base text-ink hover:border-line"
              >
                <span className="flex-1">
                  <span className="block font-bold">{formatDay(s.date)}</span>
                  {formatDuration(s.durationMin)} · {s.bedtime} to {s.wakeTime}
                </span>
                <ChevronRight aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <SleepDetailDialog
        session={detail}
        onClose={() => setDetail(null)}
        onEdit={(s) => {
          setDetail(null);
          setEditing(s);
          setFormOpen(true);
        }}
      />
      <SleepFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={editing}
        existingDates={log.map((s) => s.date)}
        onSave={(s) => {
          const result = saveSleep(s);
          setStatus(
            `Sleep ${result === 'updated' ? 'updated' : 'added'} for ${formatDay(s.date)}: ${formatDuration(s.durationMin)}.`,
          );
        }}
      />
    </>
  );
}
