/**
 * Workout sheets:
 *  - WorkoutSheet: add or edit a workout (C11 "pop-up box to add an exercise").
 *    Can be pre-filled from the weekly plan ("Log this session").
 *  - WorkoutDetailSheet: details of a past workout (Task 2), with Edit and
 *    Delete (confirmation), so mistakes can be fixed.
 */
import { Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { formatDuration, formatLongDay, nowTime, today, useUser, type Intensity, type Workout, type WorkoutType } from '@core';
import { Button, ChipGroup, ConfirmDialog, InlineStatus, Segmented, Sheet, TextAreaField, TextField, useToast } from '@ds';

const TYPES: WorkoutType[] = ['Strength', 'Cardio', 'Mobility', 'Sport'];
const KCAL: Record<WorkoutType, number> = { Strength: 6, Cardio: 9, Mobility: 3.5, Sport: 8 };

export type WorkoutDraft = Partial<Omit<Workout, 'id'>> & { id?: string };

export function WorkoutSheet({ open, onOpenChange, draft }: { open: boolean; onOpenChange: (o: boolean) => void; draft?: WorkoutDraft | null }) {
  const { saveWorkout } = useUser();
  const toast = useToast();
  const blank = { name: '', type: 'Strength' as WorkoutType, date: today(), time: nowTime(), duration: '', calories: '', intensity: 'moderate' as Intensity, notes: '' };
  const [f, setF] = useState(blank);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const editing = !!draft?.id;

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setF({
      name: draft?.name ?? '',
      type: draft?.type ?? 'Strength',
      date: draft?.date ?? today(),
      time: draft?.time ?? nowTime(),
      duration: draft?.durationMin ? String(draft.durationMin) : '',
      calories: draft?.id && draft.caloriesKcal ? String(draft.caloriesKcal) : '',
      intensity: draft?.intensity ?? 'moderate',
      notes: draft?.notes ?? '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, draft]);

  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    const d = Number(f.duration);
    const c = Number(f.calories);
    const e: Record<string, string | undefined> = {
      name: f.name.trim() ? undefined : 'Enter a name, for example "Morning run".',
      date: !f.date ? 'Choose the date.' : f.date > today() ? 'The date cannot be in the future.' : undefined,
      time: f.time ? undefined : 'Enter the start time.',
      duration: !f.duration ? 'Enter how many minutes it took.' : !Number.isInteger(d) || d < 1 || d > 600 ? 'Enter a whole number of minutes between 1 and 600.' : undefined,
      calories: f.calories && (!Number.isInteger(c) || c < 0 || c > 5000) ? 'Enter a whole number between 0 and 5000, or leave it empty.' : undefined,
    };
    setErrors(e);
    if (Object.values(e).some(Boolean)) return;
    const r = saveWorkout({ id: draft?.id, name: f.name.trim(), type: f.type, date: f.date, time: f.time, durationMin: d, caloriesKcal: f.calories ? c : Math.round(d * KCAL[f.type]), intensity: f.intensity, notes: f.notes.trim() || undefined, fromPlan: draft?.fromPlan });
    toast('success', `${r === 'updated' ? 'Workout updated' : 'Workout saved'}: ${f.name.trim()}, ${formatDuration(d)}.`);
    onOpenChange(false);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? 'Edit workout' : draft?.fromPlan ? 'Log this session' : 'Add a workout'}
      description="Name and duration are required."
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="workout-form" variant="fitness">
            {editing ? 'Save changes' : 'Save workout'}
          </Button>
        </>
      }
    >
      <form id="workout-form" noValidate onSubmit={submit} className="flex flex-col gap-5">
        {Object.values(errors).some(Boolean) && <InlineStatus kind="error">The workout was not saved. Fix the fields marked with an error.</InlineStatus>}
        <TextField label="Workout name" value={f.name} onChange={set('name')} error={errors.name} />
        <div className="flex flex-col gap-2">
          <span className="font-bold" id="type-label">
            Type
          </span>
          <ChipGroup label="Type" value={[f.type]} onChange={(v) => setF({ ...f, type: v[0] })} options={TYPES.map((t) => ({ value: t, label: t }))} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Date" type="date" max={today()} value={f.date} onChange={set('date')} error={errors.date} />
          <TextField label="Start time" type="time" value={f.time} onChange={set('time')} error={errors.time} />
        </div>
        <TextField label="Duration (minutes)" inputMode="numeric" value={f.duration} onChange={set('duration')} error={errors.duration} />
        <div className="flex flex-col gap-2">
          <span className="font-bold">How hard was it?</span>
          <Segmented label="Intensity" value={f.intensity} onChange={(v) => setF({ ...f, intensity: v })} options={[{ value: 'easy', label: 'Easy' }, { value: 'moderate', label: 'Moderate' }, { value: 'hard', label: 'Hard' }]} />
        </div>
        <TextField label="Calories burned (optional)" hint="Leave empty to use an estimate." inputMode="numeric" value={f.calories} onChange={set('calories')} error={errors.calories} />
        <TextAreaField label="Notes (optional)" value={f.notes} onChange={set('notes')} />
      </form>
    </Sheet>
  );
}

export function WorkoutDetailSheet({ workout, onClose, onEdit }: { workout: Workout | null; onClose: () => void; onEdit: (w: Workout) => void }) {
  const { deleteWorkout, iteration } = useUser();
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <Sheet
        open={!!workout && !confirm}
        onOpenChange={(o) => !o && onClose()}
        title={workout?.name ?? ''}
        description={workout ? `${formatLongDay(workout.date)} at ${workout.time}` : undefined}
        footer={
          workout &&
          (iteration.editDelete ? (
            <>
              <Button variant="secondary" onClick={() => setConfirm(true)}>
                <Trash2 aria-hidden="true" /> Delete
              </Button>
              <Button onClick={() => onEdit(workout)}>
                <Pencil aria-hidden="true" /> Edit
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={onClose}>
              Return
            </Button>
          ))
        }
      >
        {workout && (
          <dl className="m-0 grid grid-cols-2 gap-3">
            {[
              ['Type', workout.type],
              ['Duration', formatDuration(workout.durationMin)],
              ['Intensity', workout.intensity[0].toUpperCase() + workout.intensity.slice(1)],
              ['Calories', `${workout.caloriesKcal} kcal`],
            ].map(([k, v]) => (
              <div key={k} className="inset p-4">
                <dt className="text-ink-soft">{k}</dt>
                <dd className="m-0 mt-1 text-xl font-bold">{v}</dd>
              </div>
            ))}
            {workout.notes && (
              <div className="inset col-span-2 p-4">
                <dt className="text-ink-soft">Notes</dt>
                <dd className="m-0 mt-1">{workout.notes}</dd>
              </div>
            )}
          </dl>
        )}
      </Sheet>
      <ConfirmDialog
        open={confirm}
        title="Delete this workout?"
        confirmLabel="Delete workout"
        danger
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          if (workout) {
            deleteWorkout(workout.id);
            toast('success', `Workout deleted: ${workout.name}.`);
          }
          setConfirm(false);
          onClose();
        }}
      >
        {workout?.name} on {workout ? formatLongDay(workout.date) : ''} will be removed. This cannot be undone.
      </ConfirmDialog>
    </>
  );
}
