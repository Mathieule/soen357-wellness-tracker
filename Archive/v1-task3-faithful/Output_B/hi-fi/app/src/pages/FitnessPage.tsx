/**
 * C11 Fitness menu (Output B).
 * Top: today's routine (C13, left) and today's activity (C14, right) with a
 * button that opens the activity calendar. Then the "Add exercise" button,
 * then the exercise log (C12, most recent first).
 * Output B: back button top-left, Settings top-right; Arrow Up on the main
 * action moves focus to the navigation bar.
 * Keyboard focus starts on the "Add exercise" button, then goes to the log.
 */
import { CalendarDays, ChevronRight, Dumbbell, Plus } from 'lucide-react';
import { useRef, useState } from 'react';
import { useUser } from '@shared/data/appData';
import { todaysRoutine } from '@shared/data/sample';
import { sortedWorkouts, todaysActivity } from '@shared/data/selectors';
import type { Workout } from '@shared/data/types';
import { formatDay, formatDuration } from '@shared/lib/dates';
import { Button } from '@shared/ui/button';
import { StatusMessage } from '@shared/ui/status';
import { ActivityCalendarDialog, AddExerciseDialog, WorkoutDetailDialog } from '@/components/FitnessDialogs';
import { Section } from '@/components/PageTitle';
import { TopBar } from '@/components/TopBar';
import { arrowUpToNav, useInitialFocus } from '@/lib/focus';

export function FitnessPage() {
  const { user, addWorkout } = useUser();
  const addRef = useRef<HTMLButtonElement>(null);
  const [adding, setAdding] = useState(false);
  const [calendar, setCalendar] = useState(false);
  const [detail, setDetail] = useState<Workout | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const routine = todaysRoutine(user.profile.persona);
  const act = todaysActivity(user);
  const log = sortedWorkouts(user);

  // B: focus the main action only when opened from a widget (see lib/focus.ts).
  useInitialFocus(addRef);

  return (
    <>
      <TopBar back title="Fitness Metrics" icon={<Dumbbell aria-hidden="true" className="size-7" />} />

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Section title="Today's routine">
          <ul className="m-0 mt-2 flex list-none flex-col gap-2 p-0">
            {routine.map((r) => (
              <li key={r.name}>
                <span className="font-bold">{r.name}</span>
                <br />
                {r.detail}
              </li>
            ))}
          </ul>
        </Section>
        <Section title="Today's activity">
          <dl className="m-0 mt-2 flex flex-col gap-2">
            <div>
              <dt>Steps</dt>
              <dd className="m-0 text-xl font-bold">{act.steps.toLocaleString('en-CA')}</dd>
            </div>
            <div>
              <dt>Active minutes</dt>
              <dd className="m-0 text-xl font-bold">{act.activeMin}</dd>
            </div>
            <div>
              <dt>Calories burned</dt>
              <dd className="m-0 text-xl font-bold">{act.caloriesKcal.toLocaleString('en-CA')} kcal</dd>
            </div>
          </dl>
          <Button variant="outline" className="mt-3 w-full" onClick={() => setCalendar(true)}>
            <CalendarDays aria-hidden="true" /> Calendar
          </Button>
        </Section>
      </div>

      <Button ref={addRef}
        onKeyDown={arrowUpToNav} variant="fitness" size="block" className="mt-5" onClick={() => setAdding(true)}>
        <Plus aria-hidden="true" /> Add exercise
      </Button>
      {status && (
        <StatusMessage kind="success" onDismiss={() => setStatus(null)} className="mt-3">
          {status}
        </StatusMessage>
      )}

      <section aria-labelledby="log-title" className="mt-6">
        <h2 id="log-title" className="m-0 text-xl font-bold">
          Exercise log
        </h2>
        <ul className="m-0 mt-3 flex list-none flex-col gap-3 p-0">
          {log.map((w) => (
            <li key={w.id}>
              <button
                type="button"
                onClick={() => setDetail(w)}
                className="flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-xl border-2 border-transparent bg-raised px-4 py-3 text-left text-base text-ink hover:border-line"
              >
                <span className="flex-1">
                  <span className="block font-bold">{w.name}</span>
                  {formatDay(w.date)} · {formatDuration(w.durationMin)} · {w.caloriesKcal} kcal
                </span>
                <ChevronRight aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <AddExerciseDialog
        open={adding}
        onOpenChange={setAdding}
        onSave={(w) => {
          addWorkout(w);
          setStatus(`Exercise saved: ${w.name}, ${formatDuration(w.durationMin)} on ${formatDay(w.date)}.`);
        }}
      />
      <WorkoutDetailDialog workout={detail} onClose={() => setDetail(null)} />
      <ActivityCalendarDialog open={calendar} onOpenChange={setCalendar} activity={user.activity} />
    </>
  );
}
