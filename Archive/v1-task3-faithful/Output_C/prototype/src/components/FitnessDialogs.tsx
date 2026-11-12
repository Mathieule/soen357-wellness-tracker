/**
 * Fitness pop-ups:
 *  - AddExerciseDialog (C11 "pop-up box to add an exercise")
 *  - WorkoutDetailDialog (Task 2 "Detailed workout information")
 *  - ActivityCalendarDialog (C14 calendar of previous daily activity)
 */
import { useEffect, useState, type FormEvent } from 'react';
import { ActivityCalendar } from '@shared/charts/ActivityCalendar';
import type { DayActivity, Workout, WorkoutType } from '@shared/data/types';
import { formatDuration, formatLongDay, nowTime, today } from '@shared/lib/dates';
import { Button } from '@shared/ui/button';
import { Dialog } from '@shared/ui/dialog';
import { SelectField, TextAreaField, TextField } from '@shared/ui/field';
import { StatusMessage } from '@shared/ui/status';

const TYPES: WorkoutType[] = ['Strength', 'Cardio', 'Flexibility', 'Sport'];
const KCAL_PER_MIN: Record<WorkoutType, number> = { Strength: 6, Cardio: 8, Flexibility: 3, Sport: 7 };

type Errors = Partial<Record<'name' | 'date' | 'time' | 'duration' | 'calories', string>>;

export function AddExerciseDialog({
  open,
  onOpenChange,
  onSave,
  preset,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSave: (w: Omit<Workout, 'id'>) => void;
  /** C: pre-fills the form from a planned session ("Log this session"). */
  preset?: { name: string; type: WorkoutType; durationMin: number; date: string } | null;
}) {
  const empty = { name: '', type: 'Strength' as WorkoutType, date: today(), time: nowTime(), duration: '', calories: '', notes: '' };
  const [f, setF] = useState(empty);
  useEffect(() => {
    if (open && preset) setF({ ...empty, name: preset.name, type: preset.type, duration: String(preset.durationMin), date: preset.date });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, preset]);
  const [errors, setErrors] = useState<Errors>({});
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const close = (o: boolean) => {
    if (!o) {
      setF(empty);
      setErrors({});
    }
    onOpenChange(o);
  };

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    const e: Errors = {};
    if (!f.name.trim()) e.name = 'Enter the name of the exercise, for example "Morning run".';
    if (!f.date) e.date = 'Choose the date of the exercise.';
    else if (f.date > today()) e.date = 'The date cannot be in the future.';
    if (!f.time) e.time = 'Enter the start time.';
    const d = Number(f.duration);
    if (!f.duration) e.duration = 'Enter how many minutes the exercise took.';
    else if (!Number.isInteger(d) || d < 1 || d > 600) e.duration = 'Enter a whole number of minutes between 1 and 600.';
    const c = Number(f.calories);
    if (f.calories && (!Number.isInteger(c) || c < 0 || c > 5000)) e.calories = 'Enter a whole number between 0 and 5000, or leave it empty.';
    setErrors(e);
    if (Object.keys(e).length) return;
    onSave({
      name: f.name.trim(),
      type: f.type,
      date: f.date,
      time: f.time,
      durationMin: d,
      caloriesKcal: f.calories ? c : Math.round(d * KCAL_PER_MIN[f.type]),
      notes: f.notes.trim() || undefined,
    });
    close(false);
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={close}
      title="Add exercise"
      description="Fields marked required must be filled in."
      footer={
        <>
          <Button variant="outline" onClick={() => close(false)}>
            Cancel
          </Button>
          <Button type="submit" form="add-exercise-form" variant="fitness">
            Save exercise
          </Button>
        </>
      }
    >
      <form id="add-exercise-form" noValidate onSubmit={submit} className="flex flex-col gap-4">
        {hasErrors && <StatusMessage kind="error">The exercise was not saved. Fix the fields marked with an error.</StatusMessage>}
        <TextField label="Exercise name (required)" value={f.name} onChange={set('name')} error={errors.name} />
        <SelectField label="Type" value={f.type} onChange={set('type')}>
          {TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </SelectField>
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Date (required)" type="date" max={today()} value={f.date} onChange={set('date')} error={errors.date} />
          <TextField label="Start time (required)" type="time" value={f.time} onChange={set('time')} error={errors.time} />
        </div>
        <TextField
          label="Duration in minutes (required)"
          inputMode="numeric"
          value={f.duration}
          onChange={set('duration')}
          error={errors.duration}
        />
        <TextField
          label="Calories burned (optional)"
          hint="Leave empty to use an estimate."
          inputMode="numeric"
          value={f.calories}
          onChange={set('calories')}
          error={errors.calories}
        />
        <TextAreaField label="Notes (optional)" value={f.notes} onChange={set('notes')} />
      </form>
    </Dialog>
  );
}

export function WorkoutDetailDialog({ workout, onClose }: { workout: Workout | null; onClose: () => void }) {
  return (
    <Dialog
      open={!!workout}
      onOpenChange={(o) => !o && onClose()}
      title={workout?.name ?? ''}
      description={workout ? `${formatLongDay(workout.date)} at ${workout.time}` : undefined}
      footer={<Button variant="outline" onClick={onClose}>Close</Button>}
    >
      {workout && (
        <dl className="m-0 grid grid-cols-2 gap-4">
          <div>
            <dt>Type</dt>
            <dd className="m-0 text-xl font-bold">{workout.type}</dd>
          </div>
          <div>
            <dt>Duration</dt>
            <dd className="m-0 text-xl font-bold">{formatDuration(workout.durationMin)}</dd>
          </div>
          <div>
            <dt>Calories burned</dt>
            <dd className="m-0 text-xl font-bold">{workout.caloriesKcal} kcal</dd>
          </div>
          <div>
            <dt>Start time</dt>
            <dd className="m-0 text-xl font-bold">{workout.time}</dd>
          </div>
          {workout.notes && (
            <div className="col-span-2">
              <dt>Notes</dt>
              <dd className="m-0">{workout.notes}</dd>
            </div>
          )}
        </dl>
      )}
    </Dialog>
  );
}

export function ActivityCalendarDialog({
  open,
  onOpenChange,
  activity,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  activity: DayActivity[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Activity calendar" description="Choose a day to see its activity.">
      <ActivityCalendar activity={activity} />
    </Dialog>
  );
}
