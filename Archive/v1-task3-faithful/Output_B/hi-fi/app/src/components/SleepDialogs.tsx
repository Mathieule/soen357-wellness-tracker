/**
 * Sleep pop-ups:
 *  - SleepFormDialog: add or edit the sleep hours of a day (C15).
 *  - SleepDetailDialog: tapping a log entry opens its sleep graph (C16).
 *
 * SIMULATED: when sleep is entered by hand, the sleep stages are estimated
 * with the sample-data generator (there is no real sleep sensor).
 */
import { useEffect, useState, type FormEvent } from 'react';
import { SleepStageChart } from '@shared/charts/SleepStageChart';
import { buildStages } from '@shared/data/sample';
import type { SleepSession } from '@shared/data/types';
import { formatDay, formatDuration, formatLongDay, minutesBetween, today } from '@shared/lib/dates';
import { Button } from '@shared/ui/button';
import { Dialog } from '@shared/ui/dialog';
import { TextField } from '@shared/ui/field';
import { StatusMessage } from '@shared/ui/status';

type Errors = Partial<Record<'date' | 'bedtime' | 'wakeTime', string>>;

export function SleepFormDialog({
  open,
  onOpenChange,
  initial,
  existingDates,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  /** Session to edit, or null to add a new one. */
  initial: SleepSession | null;
  existingDates: string[];
  onSave: (s: Omit<SleepSession, 'id'>) => void;
}) {
  const blank = { date: today(), bedtime: '23:00', wakeTime: '07:00' };
  const [f, setF] = useState(blank);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (open) {
      setF(initial ? { date: initial.date, bedtime: initial.bedtime, wakeTime: initial.wakeTime } : blank);
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const duration = f.bedtime && f.wakeTime ? minutesBetween(f.bedtime, f.wakeTime) : 0;
  const replaces = !initial && existingDates.includes(f.date);

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    const e: Errors = {};
    if (!f.date) e.date = 'Choose the date you woke up.';
    else if (f.date > today()) e.date = 'The date cannot be in the future.';
    if (!f.bedtime) e.bedtime = 'Enter the time you went to bed.';
    if (!f.wakeTime) e.wakeTime = 'Enter the time you woke up.';
    if (f.bedtime && f.wakeTime && (duration < 60 || duration > 16 * 60))
      e.wakeTime = 'Sleep must last between 1 and 16 hours. Check the bedtime and wake-up time.';
    setErrors(e);
    if (Object.keys(e).length) return;
    onSave({
      date: f.date,
      bedtime: f.bedtime,
      wakeTime: f.wakeTime,
      durationMin: duration,
      stages: buildStages(duration, Number(f.date.replaceAll('-', '')) + duration),
    });
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={initial ? 'Edit sleep' : 'Add sleep'}
      description="Enter when you went to bed and when you woke up."
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="sleep-form">
            Save sleep
          </Button>
        </>
      }
    >
      <form id="sleep-form" noValidate onSubmit={submit} className="flex flex-col gap-4">
        {Object.keys(errors).length > 0 && (
          <StatusMessage kind="error">The sleep was not saved. Fix the fields marked with an error.</StatusMessage>
        )}
        <TextField
          label="Date you woke up"
          type="date"
          max={today()}
          value={f.date}
          onChange={set('date')}
          error={errors.date}
          disabled={!!initial}
          hint={initial ? 'The date cannot be changed when editing.' : undefined}
        />
        {replaces && (
          <StatusMessage kind="info">You already have sleep saved for {formatDay(f.date)}. Saving will replace it.</StatusMessage>
        )}
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Bedtime" type="time" value={f.bedtime} onChange={set('bedtime')} error={errors.bedtime} />
          <TextField label="Wake-up time" type="time" value={f.wakeTime} onChange={set('wakeTime')} error={errors.wakeTime} />
        </div>
        <p className="m-0" aria-live="polite">
          Total sleep: <strong>{duration ? formatDuration(duration) : '–'}</strong>
        </p>
        <p className="m-0">Sleep stages will be estimated (simulated, no sleep sensor).</p>
      </form>
    </Dialog>
  );
}

export function SleepDetailDialog({
  session,
  onClose,
  onEdit,
}: {
  session: SleepSession | null;
  onClose: () => void;
  onEdit: (s: SleepSession) => void;
}) {
  return (
    <Dialog
      open={!!session}
      onOpenChange={(o) => !o && onClose()}
      title={session ? `Sleep on ${formatLongDay(session.date)}` : ''}
      description={session ? `${formatDuration(session.durationMin)}, ${session.bedtime} to ${session.wakeTime}` : undefined}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {session && <Button onClick={() => onEdit(session)}>Edit sleep</Button>}
        </>
      }
    >
      {session && <SleepStageChart session={session} />}
    </Dialog>
  );
}
