/**
 * Nutrition sheets.
 *  - PhotoSheet (C21): take/choose a photo → SIMULATED recognition →
 *    prediction to confirm, edit or retake. Failure: clear error with
 *    "Take another photo" and "Enter it manually".
 *  - MealSheet: manual entry, editing a prediction, or editing a saved meal.
 *  - MealDetailSheet: nutrients of one meal, with Edit and Delete.
 *  - DaySheet: the meals of a previous day (history).
 */
import { Camera, ImageUp, Loader2, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { useEffect, useId, useState, type FormEvent } from 'react';
import { formatLongDay, nowTime, recognizeFood, SAMPLE_PHOTOS, today, totals, useUser, type FoodPrediction, type Meal, type MealType, type PhotoInput } from '@core';
import { Button, buttonVariants, ChipGroup, cn, ConfirmDialog, InlineStatus, Sheet, TextField, useToast } from '@ds';
import { FoodPhoto } from './FoodPhoto';

export const MEAL_TYPES: MealType[] = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];
export function guessMealType(): MealType {
  const h = new Date().getHours();
  return h < 11 ? 'Breakfast' : h < 15 ? 'Lunch' : h < 18 ? 'Snack' : 'Dinner';
}

export type MealDraft = Partial<Meal>;

type Step = { k: 'choose' } | { k: 'analysing' } | { k: 'failed'; msg: string } | { k: 'predicted'; p: FoodPrediction; sample?: string };

function Nutrients({ m }: { m: Pick<Meal, 'calories' | 'proteinG' | 'carbsG' | 'fatG'> }) {
  return (
    <dl className="m-0 grid grid-cols-2 gap-2">
      {[
        ['Calories', `${m.calories} kcal`],
        ['Protein', `${m.proteinG} g`],
        ['Carbohydrates', `${m.carbsG} g`],
        ['Fat', `${m.fatG} g`],
      ].map(([k, v]) => (
        <div key={k} className="inset p-3.5">
          <dt className="text-ink-soft">{k}</dt>
          <dd className="m-0 mt-1 text-xl font-bold">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function PhotoSheet({ open, onOpenChange, onManual }: { open: boolean; onOpenChange: (o: boolean) => void; onManual: (d?: MealDraft) => void }) {
  const { saveMeal } = useUser();
  const toast = useToast();
  const [step, setStep] = useState<Step>({ k: 'choose' });
  const [mealType, setMealType] = useState<MealType>(guessMealType());
  const fileId = useId();
  useEffect(() => {
    if (open) {
      setStep({ k: 'choose' });
      setMealType(guessMealType());
    }
  }, [open]);

  const analyse = (photo: PhotoInput, sample?: string) => {
    setStep({ k: 'analysing' });
    recognizeFood(photo)
      .then((p) => setStep({ k: 'predicted', p, sample }))
      .catch((e: Error) => setStep({ k: 'failed', msg: e.message }));
  };
  const confirm = () => {
    if (step.k !== 'predicted') return;
    saveMeal({ ...step.p, date: today(), time: nowTime(), mealType, source: 'photo' });
    toast('success', `Food saved: ${step.p.name} (${step.p.calories} kcal) added to ${mealType.toLowerCase()}.`);
    onOpenChange(false);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Scan your food"
      description="Take a photo. We guess the food and you check it before saving."
      footer={
        step.k === 'predicted' ? (
          <>
            <Button variant="secondary" onClick={() => setStep({ k: 'choose' })}>
              <RotateCcw aria-hidden="true" /> Retake
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                onOpenChange(false);
                onManual({ ...step.p, mealType, source: 'photo' });
              }}
            >
              <Pencil aria-hidden="true" /> Edit
            </Button>
            <Button variant="nutrition" className="basis-full" onClick={confirm}>
              Confirm and save
            </Button>
          </>
        ) : (
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        )
      }
    >
      <div aria-live="polite">
        {step.k === 'choose' && (
          <div className="flex flex-col gap-5">
            <InlineStatus kind="info">Prototype: recognition is simulated. Your photo is not sent anywhere.</InlineStatus>
            <div>
              <input id={fileId} type="file" accept="image/*" capture="environment" className="peer sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) analyse({ name: f.name, size: f.size }); e.target.value = ''; }} />
              <label htmlFor={fileId} className={cn(buttonVariants({ variant: 'nutrition', size: 'lg', block: true }), 'peer-focus-visible:outline-3 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-ink')}>
                <Camera aria-hidden="true" /> Take or choose a photo
              </label>
            </div>
            <fieldset className="m-0 border-0 p-0">
              <legend className="mb-3 p-0 font-bold">Or try a sample photo</legend>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_PHOTOS.map((p) => (
                  <button key={p.id} type="button" onClick={() => analyse(p.file, p.id)} className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl bg-sunken p-2 text-base text-ink transition-colors hover:bg-surface-hi">
                    <FoodPhoto id={p.id} alt={p.alt} className="w-full rounded-xl" />
                    {p.label}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        )}
        {step.k === 'analysing' && (
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <Loader2 aria-hidden="true" className="size-12 motion-safe:animate-spin" />
            <p className="m-0 text-lg">Looking at your photo… (simulated)</p>
          </div>
        )}
        {step.k === 'failed' && (
          <div className="flex flex-col gap-4">
            <InlineStatus kind="error">{step.msg} Make sure the food is well lit and in focus.</InlineStatus>
            <Button variant="nutrition" block size="lg" onClick={() => setStep({ k: 'choose' })}>
              <ImageUp aria-hidden="true" /> Take another photo
            </Button>
            <Button variant="outline" block onClick={() => (onOpenChange(false), onManual())}>
              <Pencil aria-hidden="true" /> Enter it manually
            </Button>
          </div>
        )}
        {step.k === 'predicted' && (
          <div className="flex flex-col gap-4">
            {step.sample && <FoodPhoto id={step.sample} alt={SAMPLE_PHOTOS.find((p) => p.id === step.sample)?.alt ?? 'Your food photo'} className="mx-auto w-44 rounded-2xl" />}
            <p className="m-0 text-lg">
              We think this is <strong>{step.p.name}</strong>
            </p>
            <Nutrients m={step.p} />
            <div className="flex flex-col gap-2">
              <span className="font-bold">Meal</span>
              <ChipGroup label="Meal" value={[mealType]} onChange={(v) => setMealType(v[0])} options={MEAL_TYPES.map((m) => ({ value: m, label: m }))} />
            </div>
            <p className="m-0 text-ink-soft">Is this right? Confirm, edit the values, or retake the photo.</p>
          </div>
        )}
      </div>
    </Sheet>
  );
}

export function MealSheet({ open, onOpenChange, draft }: { open: boolean; onOpenChange: (o: boolean) => void; draft?: MealDraft | null }) {
  const { saveMeal } = useUser();
  const toast = useToast();
  const [f, setF] = useState({ name: '', mealType: guessMealType(), calories: '', proteinG: '', carbsG: '', fatG: '' });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const editingSaved = !!draft?.id;
  const fromPhoto = draft?.source === 'photo' && !draft?.id;
  useEffect(() => {
    if (!open) return;
    setErrors({});
    setF({ name: draft?.name ?? '', mealType: draft?.mealType ?? guessMealType(), calories: draft?.calories?.toString() ?? '', proteinG: draft?.proteinG?.toString() ?? '', carbsG: draft?.carbsG?.toString() ?? '', fatG: draft?.fatG?.toString() ?? '' });
  }, [open, draft]);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const num = (v: string, max: number, what: string, req = false) => (!v ? (req ? `Enter the ${what}.` : undefined) : Number.isFinite(Number(v)) && Number(v) >= 0 && Number(v) <= max ? undefined : `Enter a number between 0 and ${max} for ${what}.`);

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    const e = { name: f.name.trim() ? undefined : 'Enter what you ate, for example "Chicken salad".', calories: num(f.calories, 5000, 'calories', true), proteinG: num(f.proteinG, 500, 'protein'), carbsG: num(f.carbsG, 800, 'carbohydrates'), fatG: num(f.fatG, 400, 'fat') };
    setErrors(e);
    if (Object.values(e).some(Boolean)) return;
    const r = saveMeal({ id: draft?.id, name: f.name.trim(), mealType: f.mealType, calories: Math.round(+f.calories), proteinG: Math.round(+(f.proteinG || 0)), carbsG: Math.round(+(f.carbsG || 0)), fatG: Math.round(+(f.fatG || 0)), date: draft?.date ?? today(), time: draft?.time ?? nowTime(), source: draft?.source ?? 'manual' });
    toast('success', `${r === 'updated' ? 'Meal updated' : 'Food saved'}: ${f.name.trim()} (${Math.round(+f.calories)} kcal).`);
    onOpenChange(false);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={editingSaved ? 'Edit meal' : fromPhoto ? 'Check the values' : 'Enter food manually'}
      description={fromPhoto ? 'Correct what the photo recognition found, then save.' : 'Only the name and the calories are required.'}
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="meal-form" variant="nutrition">
            {editingSaved ? 'Save changes' : 'Save food'}
          </Button>
        </>
      }
    >
      <form id="meal-form" noValidate onSubmit={submit} className="flex flex-col gap-5">
        {Object.values(errors).some(Boolean) && <InlineStatus kind="error">The food was not saved. Fix the fields marked with an error.</InlineStatus>}
        <TextField label="What did you eat?" value={f.name} onChange={set('name')} error={errors.name} />
        <div className="flex flex-col gap-2">
          <span className="font-bold">Meal</span>
          <ChipGroup label="Meal" value={[f.mealType]} onChange={(v) => setF({ ...f, mealType: v[0] })} options={MEAL_TYPES.map((m) => ({ value: m, label: m }))} />
        </div>
        <TextField label="Calories (kcal)" inputMode="numeric" value={f.calories} onChange={set('calories')} error={errors.calories} />
        <div className="grid grid-cols-3 gap-2">
          <TextField label="Protein g" inputMode="numeric" value={f.proteinG} onChange={set('proteinG')} error={errors.proteinG} />
          <TextField label="Carbs g" inputMode="numeric" value={f.carbsG} onChange={set('carbsG')} error={errors.carbsG} />
          <TextField label="Fat g" inputMode="numeric" value={f.fatG} onChange={set('fatG')} error={errors.fatG} />
        </div>
      </form>
    </Sheet>
  );
}

export function MealDetailSheet({ meal, onClose, onEdit }: { meal: Meal | null; onClose: () => void; onEdit: (m: Meal) => void }) {
  const { deleteMeal } = useUser();
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <Sheet
        open={!!meal && !confirm}
        onOpenChange={(o) => !o && onClose()}
        title={meal?.name ?? ''}
        description={meal ? `${meal.mealType} · ${formatLongDay(meal.date)} at ${meal.time}` : undefined}
        footer={
          meal && (
            <>
              <Button variant="secondary" onClick={() => setConfirm(true)}>
                <Trash2 aria-hidden="true" /> Delete
              </Button>
              <Button onClick={() => onEdit(meal)}>
                <Pencil aria-hidden="true" /> Edit
              </Button>
            </>
          )
        }
      >
        {meal && (
          <>
            <Nutrients m={meal} />
            <p className="m-0 mt-4 text-ink-soft">Added {meal.source === 'photo' ? 'from a photo (simulated recognition)' : 'manually'}.</p>
          </>
        )}
      </Sheet>
      <ConfirmDialog
        open={confirm}
        title="Delete this meal?"
        confirmLabel="Delete meal"
        danger
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          if (meal) {
            deleteMeal(meal.id);
            toast('success', `Meal deleted: ${meal.name}.`);
          }
          setConfirm(false);
          onClose();
        }}
      >
        {meal?.name} ({meal?.calories} kcal) will be removed from {meal ? formatLongDay(meal.date) : ''}.
      </ConfirmDialog>
    </>
  );
}

export function DaySheet({ date, onClose, onOpenMeal }: { date: string | null; onClose: () => void; onOpenMeal: (m: Meal) => void }) {
  const { user } = useUser();
  const meals = date ? user.meals.filter((m) => m.date === date).sort((a, b) => a.time.localeCompare(b.time)) : [];
  const t = totals(meals);
  return (
    <Sheet open={!!date} onOpenChange={(o) => !o && onClose()} title={date ? formatLongDay(date) : ''} description={`${meals.length} items · ${t.calories.toLocaleString('en-CA')} kcal · P ${t.proteinG} g · C ${t.carbsG} g · F ${t.fatG} g`}>
      <ul className="m-0 list-none divide-y divide-hair p-0">
        {meals.map((m) => (
          <li key={m.id}>
            <button type="button" onClick={() => onOpenMeal(m)} className="flex min-h-14 w-full cursor-pointer items-center justify-between gap-3 bg-transparent py-2 text-left text-ink">
              <span>
                <span className="block font-bold">{m.name}</span>
                <span className="text-ink-soft">
                  {m.mealType} · {m.time}
                </span>
              </span>
              <span>{m.calories} kcal</span>
            </button>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}
