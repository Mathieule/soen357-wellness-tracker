/**
 * Nutrition pop-ups:
 *  - AddFoodDialog (C21): photo -> SIMULATED recognition -> confirm, or error
 *    and "take another photo". Output A has no manual-entry fallback (it is not
 *    in the Task 3 Output A specification).
 *  - MealDetailDialog (C20): detailed nutrient info about one food.
 *  - NutrientDetailDialog (C18): in-depth nutrient data for today.
 */
import { Camera, ImageUp, Loader2, RotateCcw } from 'lucide-react';
import { useId, useState } from 'react';
import { MacroBars } from '@shared/charts/CalorieRing';
import type { Meal, MealType, NutritionGoals } from '@shared/data/types';
import { formatLongDay, nowTime, today } from '@shared/lib/dates';
import { recognizeFood, SAMPLE_PHOTOS, type FoodPrediction, type PhotoInput } from '@shared/sim/foodRecognition';
import { Button, buttonVariants } from '@shared/ui/button';
import { Dialog } from '@shared/ui/dialog';
import { SelectField } from '@shared/ui/field';
import { FoodPhoto } from '@shared/ui/foodPhoto';
import { StatusMessage } from '@shared/ui/status';
import { cn } from '@shared/lib/cn';

type Step =
  | { kind: 'choose' }
  | { kind: 'analysing'; photo: PhotoInput; sampleId?: string }
  | { kind: 'failed'; message: string }
  | { kind: 'predicted'; prediction: FoodPrediction; sampleId?: string };

function guessMealType(): MealType {
  const h = new Date().getHours();
  if (h < 11) return 'Breakfast';
  if (h < 15) return 'Lunch';
  if (h < 18) return 'Snack';
  return 'Dinner';
}

export function AddFoodDialog({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSave: (m: Omit<Meal, 'id'>) => void;
}) {
  const [step, setStep] = useState<Step>({ kind: 'choose' });
  const [mealType, setMealType] = useState<MealType>(guessMealType());
  const fileId = useId();

  const reset = () => setStep({ kind: 'choose' });
  const close = (o: boolean) => {
    if (!o) reset();
    onOpenChange(o);
  };

  const analyse = (photo: PhotoInput, sampleId?: string) => {
    setStep({ kind: 'analysing', photo, sampleId });
    recognizeFood(photo)
      .then((prediction) => setStep({ kind: 'predicted', prediction, sampleId }))
      .catch((err: Error) => setStep({ kind: 'failed', message: err.message }));
  };

  const confirm = () => {
    if (step.kind !== 'predicted') return;
    onSave({ ...step.prediction, date: today(), time: nowTime(), mealType, source: 'photo' });
    close(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={close}
      title="Add food"
      description="Take a photo of your food. The app will guess what it is and you confirm it."
      footer={
        step.kind === 'predicted' ? (
          <>
            <Button variant="outline" onClick={reset}>
              <RotateCcw aria-hidden="true" /> Retake photo
            </Button>
            <Button variant="nutrition" onClick={confirm}>
              Confirm and save
            </Button>
          </>
        ) : (
          <Button variant="outline" onClick={() => close(false)}>
            Cancel
          </Button>
        )
      }
    >
      <div aria-live="polite">
        {step.kind === 'choose' && (
          <div className="flex flex-col gap-4">
            <StatusMessage kind="info">Prototype: food recognition is simulated. No photo leaves your device.</StatusMessage>
            <div>
              <input
                id={fileId}
                type="file"
                accept="image/*"
                capture="environment"
                className="peer sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) analyse({ name: file.name, size: file.size });
                  e.target.value = '';
                }}
              />
              <label
                htmlFor={fileId}
                className={cn(
                  buttonVariants({ variant: 'nutrition', size: 'block' }),
                  'peer-focus-visible:outline-3 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-ink',
                )}
              >
                <Camera aria-hidden="true" /> Take or choose a photo
              </label>
            </div>
            <fieldset className="m-0 border-0 p-0">
              <legend className="mb-2 p-0 font-bold">Or use a sample photo</legend>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_PHOTOS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => analyse(p.file, p.id)}
                    className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-line bg-raised p-2 text-base text-ink"
                  >
                    <FoodPhoto id={p.id} alt={p.alt} className="w-full" />
                    {p.label}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {step.kind === 'analysing' && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <Loader2 aria-hidden="true" className="size-10 motion-safe:animate-spin" />
            <p className="m-0 text-lg">Looking at your photo… (simulated)</p>
          </div>
        )}

        {step.kind === 'failed' && (
          <div className="flex flex-col gap-4">
            <StatusMessage kind="error">{step.message} Make sure the food is well lit and in focus, then take another photo.</StatusMessage>
            <Button variant="nutrition" size="block" onClick={reset}>
              <ImageUp aria-hidden="true" /> Take another photo
            </Button>
          </div>
        )}

        {step.kind === 'predicted' && (
          <div className="flex flex-col gap-4">
            {step.sampleId && (
              <FoodPhoto
                id={step.sampleId}
                alt={SAMPLE_PHOTOS.find((p) => p.id === step.sampleId)?.alt ?? 'Your food photo'}
                className="mx-auto w-40"
              />
            )}
            <p className="m-0 text-lg">
              We think this is: <strong>{step.prediction.name}</strong>
            </p>
            <dl className="m-0 grid grid-cols-2 gap-3 rounded-xl bg-raised p-4">
              <div>
                <dt>Calories</dt>
                <dd className="m-0 text-xl font-bold">{step.prediction.calories} kcal</dd>
              </div>
              <div>
                <dt>Protein</dt>
                <dd className="m-0 text-xl font-bold">{step.prediction.proteinG} g</dd>
              </div>
              <div>
                <dt>Carbohydrates</dt>
                <dd className="m-0 text-xl font-bold">{step.prediction.carbsG} g</dd>
              </div>
              <div>
                <dt>Fat</dt>
                <dd className="m-0 text-xl font-bold">{step.prediction.fatG} g</dd>
              </div>
            </dl>
            <SelectField label="Meal" value={mealType} onChange={(e) => setMealType(e.target.value as MealType)}>
              {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as MealType[]).map((m) => (
                <option key={m}>{m}</option>
              ))}
            </SelectField>
            <p className="m-0">Is this right? Confirm to save it, or retake the photo.</p>
          </div>
        )}
      </div>
    </Dialog>
  );
}

export function MealDetailDialog({ meal, onClose }: { meal: Meal | null; onClose: () => void }) {
  return (
    <Dialog
      open={!!meal}
      onOpenChange={(o) => !o && onClose()}
      title={meal?.name ?? ''}
      description={meal ? `${meal.mealType}, ${formatLongDay(meal.date)} at ${meal.time}` : undefined}
      footer={<Button variant="outline" onClick={onClose}>Close</Button>}
    >
      {meal && (
        <dl className="m-0 grid grid-cols-2 gap-4">
          <div>
            <dt>Calories</dt>
            <dd className="m-0 text-xl font-bold">{meal.calories} kcal</dd>
          </div>
          <div>
            <dt>Protein</dt>
            <dd className="m-0 text-xl font-bold">{meal.proteinG} g</dd>
          </div>
          <div>
            <dt>Carbohydrates</dt>
            <dd className="m-0 text-xl font-bold">{meal.carbsG} g</dd>
          </div>
          <div>
            <dt>Fat</dt>
            <dd className="m-0 text-xl font-bold">{meal.fatG} g</dd>
          </div>
          <div className="col-span-2">
            <dt>Added with</dt>
            <dd className="m-0">{meal.source === 'photo' ? 'Photo (simulated recognition)' : 'Manual entry'}</dd>
          </div>
        </dl>
      )}
    </Dialog>
  );
}

export function NutrientDetailDialog({
  open,
  onOpenChange,
  totals,
  goals,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  totals: { calories: number; proteinG: number; carbsG: number; fatG: number };
  goals: NutritionGoals;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Today's nutrients"
      description={`${totals.calories} of ${goals.calories} kcal eaten today.`}
      footer={<Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>}
    >
      <MacroBars
        items={[
          { label: 'Calories', value: totals.calories, goal: goals.calories, unit: 'kcal' },
          { label: 'Protein', value: totals.proteinG, goal: goals.proteinG, unit: 'g' },
          { label: 'Carbohydrates', value: totals.carbsG, goal: goals.carbsG, unit: 'g' },
          { label: 'Fat', value: totals.fatG, goal: goals.fatG, unit: 'g' },
        ]}
      />
    </Dialog>
  );
}
